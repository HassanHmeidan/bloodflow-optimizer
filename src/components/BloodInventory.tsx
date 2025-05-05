
import { useState, useEffect } from 'react';
import { CircleX, CircleCheck, AlertTriangle, RefreshCw } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { LocationFilter } from './LocationFilter';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';

// Define the type for blood stock data
type BloodType = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';

interface BloodStockData {
  bloodType: BloodType;
  units: number;
  capacity: number;
  location?: string;
  expiryDate?: string;
  id?: string;
}

interface LocationData {
  id: string;
  name: string;
  type: 'Hospital' | 'Blood Bank' | 'Storage';
  coordinates?: [number, number]; // [longitude, latitude]
  address: string;
  bloodStock: {
    [key: string]: {
      units: number;
      capacity: number;
    };
  };
}

interface BloodInventoryProps {
  simpleView?: boolean;
  onInventoryChange?: () => void;
}

export const BloodInventory = ({ simpleView = false, onInventoryChange }: BloodInventoryProps) => {
  const [selectedLocation, setSelectedLocation] = useState<LocationData | null>(null);
  const [filteredStockData, setFilteredStockData] = useState<BloodStockData[]>([]);
  const [lowStockAlerts, setLowStockAlerts] = useState<BloodStockData[]>([]);
  const [expiryAlerts, setExpiryAlerts] = useState<BloodStockData[]>([]);
  const [mapError, setMapError] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  // Handle map errors
  const handleMapError = (error: Error) => {
    console.error("Map loading error:", error);
    setMapError(true);
    if (!simpleView) {
      toast({
        title: "Map Loading Error",
        description: "Could not load location map. Using simplified location view instead."
      });
    }
  };

  // Function to fetch inventory data
  const fetchInventoryData = async () => {
    setLoading(true);
    try {
      // Get blood inventory data from database
      const { data, error } = await supabase
        .from('blood_inventory')
        .select('*')
        .eq('status', 'available');
      
      if (error) throw error;
      
      // Transform data to the format needed
      const bloodTypes: BloodType[] = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
      
      // Group by blood type and sum units
      const stockByType: Record<string, { units: number, items: any[] }> = {};
      
      bloodTypes.forEach(type => {
        stockByType[type] = { units: 0, items: [] };
      });
      
      (data || []).forEach(item => {
        const type = item.blood_type as BloodType;
        if (!stockByType[type]) {
          stockByType[type] = { units: 0, items: [] };
        }
        stockByType[type].units += item.units;
        stockByType[type].items.push(item);
      });
      
      // Convert to array format for rendering
      const stockData: BloodStockData[] = bloodTypes.map(type => {
        // Estimate capacity as 300% of current units (for UI purposes)
        // In a real app, you'd have set capacities per blood type
        const capacity = Math.max(stockByType[type]?.units * 3 || 300, 300);
        
        return {
          bloodType: type,
          units: stockByType[type]?.units || 0,
          capacity,
          expiryDate: stockByType[type]?.items[0]?.expiry_date
        };
      });
      
      if (!selectedLocation) {
        setFilteredStockData(stockData);
        
        // Calculate alerts - only when critical (below 15%)
        setLowStockAlerts(stockData.filter(item => (item.units / item.capacity) < 0.15));
        
        // Only show items expiring in the next 3 days for critical alerts
        const today = new Date();
        const threeDaysLater = new Date();
        threeDaysLater.setDate(today.getDate() + 3);
        
        setExpiryAlerts(stockData.filter(item => {
          if (!item.expiryDate) return false;
          const expiryDate = new Date(item.expiryDate);
          return expiryDate <= threeDaysLater;
        }));
      }
    } catch (error) {
      console.error('Error fetching inventory data:', error);
      if (!simpleView) {
        toast.error('Failed to load inventory data');
      }
    } finally {
      setLoading(false);
    }
  };

  // Fetch initial data
  useEffect(() => {
    fetchInventoryData();
    
    // Set up a real-time subscription to blood_inventory changes
    const channel = supabase
      .channel('blood-inventory-changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'blood_inventory' 
        }, 
        () => {
          fetchInventoryData();
          if (onInventoryChange) {
            onInventoryChange();
          }
        }
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, [onInventoryChange]);

  // Update filtered stock data when a location is selected
  useEffect(() => {
    try {
      if (selectedLocation) {
        // Convert the location's blood stock to the format expected by the component
        const locationStock = Object.entries(selectedLocation.bloodStock).map(([bloodType, data]) => ({
          bloodType: bloodType as BloodType,
          units: data.units,
          capacity: data.capacity,
          location: selectedLocation.name
        }));
        
        setFilteredStockData(locationStock);
        
        // Calculate alerts - only when critical (below 15%)
        setLowStockAlerts(locationStock.filter(item => (item.units / item.capacity) < 0.15));
        
        // Only show items expiring in the next 3 days for critical alerts
        const today = new Date();
        const threeDaysLater = new Date();
        threeDaysLater.setDate(today.getDate() + 3);
        
        setExpiryAlerts(locationStock.filter(item => {
          if (!item.expiryDate) return false;
          const expiryDate = new Date(item.expiryDate);
          return expiryDate <= threeDaysLater;
        }));
      }
    } catch (error) {
      console.error("Error updating stock data:", error);
    }
  }, [selectedLocation]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchInventoryData();
    setRefreshing(false);
    toast.success('Inventory data refreshed');
  };

  // Calculate status based on stock level
  const getStockStatus = (units: number, capacity: number) => {
    const percentage = (units / capacity) * 100;
    if (percentage < 20) return { color: 'bg-red-500', status: 'Low', textColor: 'text-red-600' };
    if (percentage < 50) return { color: 'bg-amber-500', status: 'Medium', textColor: 'text-amber-600' };
    return { color: 'bg-green-500', status: 'Good', textColor: 'text-green-600' };
  };

  // Simplified view for homepage
  if (simpleView) {
    return (
      <div className="space-y-4">
        {loading ? (
          <div className="flex justify-center py-8">
            <svg className="animate-spin h-8 w-8 text-bloodRed-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-3">
              {filteredStockData.map((item) => {
                const stockStatus = getStockStatus(item.units, item.capacity);
                const percentage = Math.round((item.units / item.capacity) * 100);
                
                return (
                  <Card key={item.bloodType} className="p-3 text-center hover:shadow-md transition-shadow">
                    <div className="inline-flex items-center justify-center bg-bloodRed-100 text-bloodRed-900 text-xl font-bold rounded-full w-10 h-10 mb-2">
                      {item.bloodType}
                    </div>
                    <div className="text-xl font-bold">{item.units}</div>
                    <div className="text-xs text-gray-500 mb-2">units</div>
                    <Progress value={percentage} className={`h-1.5 ${stockStatus.color}`} />
                    <div className={`text-xs font-medium mt-1 ${stockStatus.textColor}`}>
                      {stockStatus.status}
                    </div>
                  </Card>
                );
              })}
            </div>
            
            {/* Simplified critical alerts - only show if there are any */}
            {(lowStockAlerts.length > 0 || expiryAlerts.length > 0) && (
              <div className="mt-4 bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-center">
                <AlertTriangle className="h-5 w-5 text-amber-500 mr-2 flex-shrink-0" />
                <div className="text-sm">
                  <span className="font-medium">Critical Alerts: </span>
                  {lowStockAlerts.length > 0 && `${lowStockAlerts.length} blood types low on stock. `}
                  {expiryAlerts.length > 0 && `${expiryAlerts.length} blood types expiring soon.`}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    );
  }

  // Full view for dashboard
  return (
    <div className="space-y-6">
      <div className="flex justify-between">
        <h3 className="text-lg font-semibold">Current Inventory Status</h3>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleRefresh}
          disabled={refreshing}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>
      
      {loading ? (
        <div className="flex justify-center py-8">
          <svg className="animate-spin h-8 w-8 text-bloodRed-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
            {filteredStockData.map((item) => {
              const stockStatus = getStockStatus(item.units, item.capacity);
              const percentage = Math.round((item.units / item.capacity) * 100);
              
              return (
                <Card key={item.bloodType} className="p-4 hover:shadow-md transition-shadow">
                  <div className="text-center space-y-2">
                    <div className="inline-flex items-center justify-center bg-bloodRed-100 text-bloodRed-900 text-xl font-bold rounded-full w-12 h-12">
                      {item.bloodType}
                    </div>
                    <h3 className="text-sm font-medium text-gray-500">Blood Type</h3>
                    <div className="text-2xl font-bold">{item.units} <span className="text-sm text-gray-500">units</span></div>
                    <Progress value={percentage} className={`h-2 ${stockStatus.color}`} />
                    <div className="flex justify-between text-xs">
                      <span>{percentage}%</span>
                      <span className={`font-medium ${stockStatus.textColor}`}>
                        {stockStatus.status}
                      </span>
                    </div>
                    {item.location && (
                      <div className="text-xs text-gray-500">
                        {item.location}
                      </div>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Critical Stock Alerts</h3>
              <div className="space-y-2">
                {lowStockAlerts.length > 0 || expiryAlerts.length > 0 ? (
                  <>
                    {lowStockAlerts.map((item, index) => (
                      <div key={`low-${item.bloodType}-${index}`} className="flex items-center space-x-3 p-3 bg-red-50 border border-red-100 rounded-md">
                        <CircleX className="h-5 w-5 text-red-500" />
                        <div>
                          <span className="font-medium">Critical Stock Alert:</span> {item.bloodType} - Only {item.units} units available ({Math.round((item.units / item.capacity) * 100)}%)
                          {item.location && <span className="text-sm text-gray-500 ml-2">at {item.location}</span>}
                        </div>
                      </div>
                    ))}
                    
                    {expiryAlerts.map((item, index) => (
                      <div key={`expiry-${item.bloodType}-${index}`} className="flex items-center space-x-3 p-3 bg-amber-50 border border-amber-100 rounded-md">
                        <CircleCheck className="h-5 w-5 text-amber-500" />
                        <div>
                          <span className="font-medium">Expiring Soon:</span> {item.bloodType} - Expires on {item.expiryDate}
                          {item.location && <span className="text-sm text-gray-500 ml-2">at {item.location}</span>}
                        </div>
                      </div>
                    ))}
                  </>
                ) : (
                  <p className="text-center text-gray-500 py-4">No critical alerts at this time</p>
                )}
              </div>
            </div>
            
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Location Based Filtering</h3>
              <LocationFilter onLocationSelect={setSelectedLocation} onError={handleMapError} />
            </div>
          </div>
        </>
      )}
    </div>
  );
};
