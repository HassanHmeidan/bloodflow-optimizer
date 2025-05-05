import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { 
  AlertCircle, 
  BarChart3, 
  Calendar, 
  Clock, 
  Droplet, 
  FileText, 
  Filter, 
  Plus, 
  Search 
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { supabase } from "@/lib/supabase";

type BloodType = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';

interface InventoryItem {
  id: string;
  bloodType: BloodType;
  units: number;
  expiryDate: string;
  donationDate: string;
  status: 'available' | 'reserved' | 'used' | 'expired';
  locationName?: string;
}

interface BloodInventoryProps {
  simpleView?: boolean;
}

export const BloodInventory = ({ simpleView = false }: BloodInventoryProps) => {
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterBloodType, setFilterBloodType] = useState<string | null>(null);
  const [filterLocation, setFilterLocation] = useState<string | null>(null);
  const [showAddInventoryDialog, setShowAddInventoryDialog] = useState<boolean>(false);
  const [showFilters, setShowFilters] = useState<boolean>(false);
  const [inventoryData, setInventoryData] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [locations, setLocations] = useState<{ id: string, name: string }[]>([]);
  
  // Form state for adding new inventory
  const [newInventory, setNewInventory] = useState({
    bloodType: 'A+' as BloodType,
    units: 1,
    expiryDate: '',
    donationDate: new Date().toISOString().split('T')[0],
    locationId: '',
    status: 'available'
  });

  // Fetch inventory data from the database
  useEffect(() => {
    const fetchInventoryData = async () => {
      setLoading(true);
      try {
        // Fetch locations first
        const { data: locationsData, error: locationsError } = await supabase
          .from('donation_centers')
          .select('id, name');
        
        if (locationsError) throw locationsError;
        setLocations(locationsData || []);
        
        // Fetch blood inventory
        const { data, error } = await supabase
          .from('blood_inventory')
          .select('*')
          .eq('status', 'available')
          .order('expiry_date');
        
        if (error) throw error;
        
        // Map data to our format
        const mappedData = data.map(item => ({
          id: item.id,
          bloodType: item.blood_type as BloodType,
          units: item.units,
          expiryDate: item.expiry_date.split('T')[0],
          donationDate: item.donation_date ? item.donation_date.split('T')[0] : 'N/A',
          status: item.status as 'available' | 'reserved' | 'used' | 'expired',
          locationName: item.location_name || 'Central Blood Bank'
        }));
        
        setInventoryData(mappedData);
      } catch (error) {
        console.error('Error fetching blood inventory:', error);
        toast.error('Failed to load blood inventory data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchInventoryData();
    
    // Set up real-time subscription for updates
    const channel = supabase
      .channel('blood-inventory-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'blood_inventory' }, 
        () => {
          fetchInventoryData();
        }
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Function to handle adding new inventory
  const handleAddInventory = async () => {
    try {
      if (!newInventory.expiryDate) {
        toast.error('Please provide an expiry date');
        return;
      }
      
      // Validate
      if (newInventory.units < 1) {
        toast.error('Units must be at least 1');
        return;
      }
      
      // Calculate automatic expiry date if not provided (42 days from donation)
      let expiryDate = newInventory.expiryDate;
      if (!expiryDate) {
        const donationDate = new Date(newInventory.donationDate);
        donationDate.setDate(donationDate.getDate() + 42); // Blood typically expires in 42 days
        expiryDate = donationDate.toISOString().split('T')[0];
      }
      
      const { error } = await supabase
        .from('blood_inventory')
        .insert({
          blood_type: newInventory.bloodType,
          units: newInventory.units,
          expiry_date: new Date(expiryDate).toISOString(),
          donation_date: new Date(newInventory.donationDate).toISOString(),
          location_id: newInventory.locationId || null,
          location_name: newInventory.locationId ? 
            locations.find(loc => loc.id === newInventory.locationId)?.name : 
            'Central Blood Bank',
          status: 'available'
        });
      
      if (error) throw error;
      
      toast.success('Blood inventory added successfully');
      setShowAddInventoryDialog(false);
      
      // Reset form
      setNewInventory({
        bloodType: 'A+' as BloodType,
        units: 1,
        expiryDate: '',
        donationDate: new Date().toISOString().split('T')[0],
        locationId: '',
        status: 'available'
      });
    } catch (error) {
      console.error('Error adding blood inventory:', error);
      toast.error('Failed to add blood inventory');
    }
  };

  // Calculate aggregated statistics
  const totalUnits = inventoryData.reduce((sum, item) => sum + item.units, 0);
  const totalByBloodType: Record<BloodType, number> = {
    'A+': 0, 'A-': 0, 'B+': 0, 'B-': 0, 'AB+': 0, 'AB-': 0, 'O+': 0, 'O-': 0
  };
  
  inventoryData.forEach(item => {
    totalByBloodType[item.bloodType] += item.units;
  });
  
  // Filter inventory data
  const filteredInventory = inventoryData.filter(item => {
    const matchesSearch = 
      item.bloodType.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.locationName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.expiryDate.includes(searchQuery);
    
    const matchesBloodType = !filterBloodType || filterBloodType === 'all' || item.bloodType === filterBloodType;
    const matchesLocation = !filterLocation || filterLocation === 'all' || item.locationName === filterLocation;
    
    return matchesSearch && matchesBloodType && matchesLocation;
  });
  
  // Check for expiring inventory (within 7 days)
  const today = new Date();
  const sevenDaysLater = new Date();
  sevenDaysLater.setDate(today.getDate() + 7);
  
  const expiringItems = inventoryData.filter(item => {
    const expiryDate = new Date(item.expiryDate);
    return expiryDate > today && expiryDate <= sevenDaysLater;
  });
  
  // Get unique locations for filter
  const uniqueLocations = Array.from(new Set(inventoryData.map(item => item.locationName))).filter(Boolean) as string[];

  // If simpleView is true, render a simplified version
  if (simpleView) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {Object.entries(totalByBloodType).map(([bloodType, units]) => (
          <Card key={bloodType}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Blood Type {bloodType}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{units} units</div>
              <Progress 
                className="h-2 mt-2" 
                value={(units / (totalUnits || 1)) * 100} 
              />
              <p className="text-xs text-muted-foreground mt-1">
                {Math.round((units / (totalUnits || 1)) * 100)}% of total inventory
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="detailed">Detailed View</TabsTrigger>
          <TabsTrigger value="expiring">Expiring Soon</TabsTrigger>
        </TabsList>
        
        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Inventory</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalUnits} units</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Across all blood types and locations
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Universal Donor (O-)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalByBloodType['O-']} units</div>
                <Progress className="h-2 mt-2" value={(totalByBloodType['O-'] / (totalUnits || 1)) * 100} />
                <p className="text-xs text-muted-foreground mt-1">
                  {Math.round((totalByBloodType['O-'] / (totalUnits || 1)) * 100)}% of total inventory
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Expiring Soon</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{expiringItems.reduce((sum, item) => sum + item.units, 0)} units</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Expires within the next 7 days
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Locations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{uniqueLocations.length}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Active storage facilities
                </p>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Blood Type Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(totalByBloodType).map(([bloodType, units]) => (
                  <div key={bloodType}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium">{bloodType}</span>
                      <span className="text-sm text-muted-foreground">{units} units</span>
                    </div>
                    <Progress 
                      className="h-2" 
                      value={(units / (totalUnits || 1)) * 100} 
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Detailed View Tab */}
        <TabsContent value="detailed">
          <Card>
            <CardHeader className="pb-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <CardTitle>Blood Inventory</CardTitle>
                <div className="flex space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setShowFilters(!showFilters)}
                  >
                    <Filter className="h-4 w-4 mr-2" />
                    Filter
                  </Button>
                  <Button 
                    size="sm"
                    onClick={() => setShowAddInventoryDialog(true)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Inventory
                  </Button>
                </div>
              </div>
              
              <div className="relative w-full mt-4">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by blood type, location..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              {showFilters && (
                <div className="bg-muted/50 p-4 rounded-md mt-4 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="blood-type-filter">Blood Type</Label>
                      <Select value={filterBloodType || "all"} onValueChange={setFilterBloodType}>
                        <SelectTrigger id="blood-type-filter">
                          <SelectValue placeholder="All blood types" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All blood types</SelectItem>
                          <SelectItem value="A+">A+</SelectItem>
                          <SelectItem value="A-">A-</SelectItem>
                          <SelectItem value="B+">B+</SelectItem>
                          <SelectItem value="B-">B-</SelectItem>
                          <SelectItem value="AB+">AB+</SelectItem>
                          <SelectItem value="AB-">AB-</SelectItem>
                          <SelectItem value="O+">O+</SelectItem>
                          <SelectItem value="O-">O-</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="location-filter">Location</Label>
                      <Select value={filterLocation || "all"} onValueChange={setFilterLocation}>
                        <SelectTrigger id="location-filter">
                          <SelectValue placeholder="All locations" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All locations</SelectItem>
                          {uniqueLocations.map(location => (
                            <SelectItem key={location} value={location}>{location}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      setFilterBloodType(null);
                      setFilterLocation(null);
                    }}
                  >
                    Clear Filters
                  </Button>
                </div>
              )}
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin h-8 w-8 border-4 border-muted-foreground border-t-transparent rounded-full"></div>
                </div>
              ) : filteredInventory.length > 0 ? (
                <div className="border rounded-md">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Blood Type</TableHead>
                        <TableHead>Units</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Donation Date</TableHead>
                        <TableHead>Expires On</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredInventory.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>
                            <Badge variant="outline" className="bg-red-50 text-red-800 hover:bg-red-100 border-red-200">
                              {item.bloodType}
                            </Badge>
                          </TableCell>
                          <TableCell>{item.units}</TableCell>
                          <TableCell>{item.locationName || 'Central Blood Bank'}</TableCell>
                          <TableCell>{item.donationDate}</TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                              <span>{item.expiryDate}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={item.status === 'available' ? 'default' : 'secondary'}>
                              {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="py-12 text-center border rounded-md">
                  <Droplet className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium">No inventory found</h3>
                  <p className="text-muted-foreground mt-1">
                    Try changing your filters or add new inventory.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Expiring Soon Tab */}
        <TabsContent value="expiring">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Expiring Soon</CardTitle>
                <Badge variant="destructive" className="ml-2">
                  {expiringItems.reduce((sum, item) => sum + item.units, 0)} units
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              {expiringItems.length > 0 ? (
                <div className="border rounded-md">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Blood Type</TableHead>
                        <TableHead>Units</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Expires In</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {expiringItems.map(item => {
                        const daysUntilExpiry = Math.ceil(
                          (new Date(item.expiryDate).getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
                        );
                        
                        return (
                          <TableRow key={item.id}>
                            <TableCell>
                              <Badge variant="outline" className="bg-red-50 text-red-800 hover:bg-red-100 border-red-200">
                                {item.bloodType}
                              </Badge>
                            </TableCell>
                            <TableCell>{item.units}</TableCell>
                            <TableCell>{item.locationName || 'Central Blood Bank'}</TableCell>
                            <TableCell>
                              <div className="flex items-center">
                                <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                                <span className={`${
                                  daysUntilExpiry <= 3 ? 'text-red-600 font-medium' : 'text-amber-600'
                                }`}>
                                  {daysUntilExpiry} days
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Button variant="ghost" size="sm" className="h-8 text-xs">
                                <FileText className="h-3.5 w-3.5 mr-2" />
                                Mark as Used
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="py-12 text-center border rounded-md">
                  <AlertCircle className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium">No expiring inventory</h3>
                  <p className="text-muted-foreground mt-1">
                    There is no blood inventory expiring in the next 7 days.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Add Inventory Dialog */}
      <Dialog open={showAddInventoryDialog} onOpenChange={setShowAddInventoryDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add Blood Inventory</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="bloodType" className="text-right">
                Blood Type
              </Label>
              <Select 
                value={newInventory.bloodType} 
                onValueChange={(value) => setNewInventory({...newInventory, bloodType: value as BloodType})}
              >
                <SelectTrigger id="bloodType" className="col-span-3">
                  <SelectValue placeholder="Select blood type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="A+">A+</SelectItem>
                  <SelectItem value="A-">A-</SelectItem>
                  <SelectItem value="B+">B+</SelectItem>
                  <SelectItem value="B-">B-</SelectItem>
                  <SelectItem value="AB+">AB+</SelectItem>
                  <SelectItem value="AB-">AB-</SelectItem>
                  <SelectItem value="O+">O+</SelectItem>
                  <SelectItem value="O-">O-</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="units" className="text-right">
                Units
              </Label>
              <Input
                id="units"
                type="number"
                min="1"
                value={newInventory.units}
                onChange={(e) => setNewInventory({...newInventory, units: parseInt(e.target.value) || 1})}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="donationDate" className="text-right">
                Donation Date
              </Label>
              <Input
                id="donationDate"
                type="date"
                value={newInventory.donationDate}
                onChange={(e) => setNewInventory({...newInventory, donationDate: e.target.value})}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="expiryDate" className="text-right">
                Expiry Date
              </Label>
              <Input
                id="expiryDate"
                type="date"
                value={newInventory.expiryDate}
                onChange={(e) => setNewInventory({...newInventory, expiryDate: e.target.value})}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="location" className="text-right">
                Location
              </Label>
              <Select 
                value={newInventory.locationId} 
                onValueChange={(value) => setNewInventory({...newInventory, locationId: value})}
              >
                <SelectTrigger id="location" className="col-span-3">
                  <SelectValue placeholder="Select location (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Central Blood Bank</SelectItem>
                  {locations.map(location => (
                    <SelectItem key={location.id} value={location.id}>{location.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" onClick={handleAddInventory}>Add to Inventory</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BloodInventory;
