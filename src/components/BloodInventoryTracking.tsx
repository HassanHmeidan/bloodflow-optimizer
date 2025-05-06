import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { BloodUnitTracker } from "./BloodUnitTracker";
import { BloodUnitStatus } from "@/types/status";
import { supabase } from "@/lib/supabase";
import { Loader2 } from "lucide-react";

interface BloodUnit {
  id: string;
  bloodType: string;
  status: BloodUnitStatus;
  donationDate: string;
  expiryDate: string;
  donorName?: string;
  locationName?: string;
  destinationName?: string;
}

export const BloodInventoryTracking = () => {
  const [selectedUnit, setSelectedUnit] = useState<BloodUnit | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [newStatus, setNewStatus] = useState<BloodUnitStatus | ''>('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [units, setUnits] = useState<BloodUnit[]>([]);
  const { toast } = useToast();

  // Fetch blood units
  const fetchBloodUnits = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('blood_inventory')
        .select(`
          id,
          blood_type,
          donation_date,
          expiry_date,
          status,
          donor_id,
          location_id,
          location_name
        `)
        .order('donation_date', { ascending: false });
        
      if (error) throw error;
      
      // Transform data
      const transformedUnits: BloodUnit[] = await Promise.all(data.map(async (unit) => {
        let donorName = "Unknown";
        
        if (unit.donor_id) {
          // Get donor profile
          const { data: donorData } = await supabase
            .from('donor_profiles')
            .select('user_id')
            .eq('id', unit.donor_id)
            .single();
            
          if (donorData?.user_id) {
            const { data: userData } = await supabase
              .from('profiles')
              .select('first_name, last_name')
              .eq('id', donorData.user_id)
              .single();
              
            if (userData) {
              donorName = `${userData.first_name || ''} ${userData.last_name || ''}`.trim() || 'Unknown';
            }
          }
        }
        
        return {
          id: unit.id,
          bloodType: unit.blood_type,
          status: unit.status as BloodUnitStatus,
          donationDate: unit.donation_date,
          expiryDate: unit.expiry_date,
          donorName,
          locationName: unit.location_name || "Main Facility"
        };
      }));
      
      setUnits(transformedUnits);
    } catch (err) {
      console.error("Error fetching blood units:", err);
      toast({
        variant: "destructive",
        title: "Failed to fetch blood units",
        description: "Please try again or contact support."
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Update blood unit status
  const updateUnitStatus = async () => {
    if (!selectedUnit || !newStatus) return;
    
    setIsUpdating(true);
    try {
      const { error } = await supabase
        .from('blood_inventory')
        .update({
          status: newStatus
        })
        .eq('id', selectedUnit.id);
        
      if (error) throw error;
      
      toast({
        title: "Status updated",
        description: `Blood unit status changed to ${newStatus.replace('_', ' ')}`
      });
      
      // Update local state
      setUnits(prev => prev.map(unit => 
        unit.id === selectedUnit.id 
          ? { ...unit, status: newStatus as BloodUnitStatus } 
          : unit
      ));
      
      setIsDialogOpen(false);
    } catch (err) {
      console.error("Error updating blood unit status:", err);
      toast({
        variant: "destructive",
        title: "Failed to update status",
        description: "Please try again or contact support."
      });
    } finally {
      setIsUpdating(false);
    }
  };

  React.useEffect(() => {
    fetchBloodUnits();
  }, []);

  return (
    <div className="space-y-6">
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="all">All Units</TabsTrigger>
          <TabsTrigger value="available">Available</TabsTrigger>
          <TabsTrigger value="in-transit">In Transit</TabsTrigger>
          <TabsTrigger value="delivered">Delivered</TabsTrigger>
          <TabsTrigger value="used">Used</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-bloodRed-600" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {units.map(unit => (
                <Card key={unit.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex justify-between items-center">
                      <span>Blood Unit #{unit.id.slice(0, 8)}</span>
                      <span className="text-bloodRed-600 text-base">{unit.bloodType}</span>
                    </CardTitle>
                    <CardDescription>
                      Donated on {new Date(unit.donationDate).toLocaleDateString()}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Status</span>
                        <span className="font-medium">{unit.status.replace('_', ' ').toUpperCase()}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Location</span>
                        <span className="font-medium">{unit.locationName}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Donor</span>
                        <span className="font-medium">{unit.donorName}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Expires</span>
                        <span className="font-medium">{new Date(unit.expiryDate).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <div className="flex space-x-2 w-full">
                      <Button 
                        variant="outline" 
                        className="flex-1"
                        onClick={() => {
                          setSelectedUnit(unit);
                          setNewStatus('');
                          setIsDialogOpen(true);
                        }}
                      >
                        Update Status
                      </Button>
                      <Button 
                        variant="default" 
                        className="flex-1"
                        onClick={() => setSelectedUnit(unit)}
                      >
                        Track Details
                      </Button>
                    </div>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Other tab contents would follow a similar pattern */}
        <TabsContent value="available">
          {/* Similar content for available units */}
        </TabsContent>
      </Tabs>

      {/* Status update dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Blood Unit Status</DialogTitle>
            <DialogDescription>
              Change the status of blood unit #{selectedUnit?.id.slice(0, 8)}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="status">New Status</Label>
              <Select value={newStatus} onValueChange={setNewStatus as any}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="collected">Collected</SelectItem>
                  <SelectItem value="stored">Stored</SelectItem>
                  <SelectItem value="tested">Tested</SelectItem>
                  <SelectItem value="available">Available</SelectItem>
                  <SelectItem value="reserved">Reserved</SelectItem>
                  <SelectItem value="in_transit">In Transit</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                  <SelectItem value="used">Used</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                  <SelectItem value="discarded">Discarded</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={updateUnitStatus} 
                disabled={!newStatus || isUpdating}
              >
                {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Update Status
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Detail tracking dialog */}
      {selectedUnit && (
        <Dialog open={!!selectedUnit && !isDialogOpen} onOpenChange={(open) => !open && setSelectedUnit(null)}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Blood Unit Tracking</DialogTitle>
              <DialogDescription>
                Track the current status and history of this blood unit
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <BloodUnitTracker 
                unitId={selectedUnit.id}
                status={selectedUnit.status}
                donationDate={selectedUnit.donationDate}
                expiryDate={selectedUnit.expiryDate}
                currentLocation={selectedUnit.locationName}
                destinationLocation={selectedUnit.destinationName}
                donor={selectedUnit.donorName}
                bloodType={selectedUnit.bloodType}
              />
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default BloodInventoryTracking;
