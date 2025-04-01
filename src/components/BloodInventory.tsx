
import { useState, useEffect } from 'react';
import { CircleX, CircleCheck, AlertTriangle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { LocationFilter } from './LocationFilter';
import { toast } from '@/components/ui/use-toast';

// Define the type for blood stock data
type BloodType = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';

interface BloodStockData {
  bloodType: BloodType;
  units: number;
  capacity: number;
  location?: string;
  expiryDate?: string;
}

interface LocationData {
  id: string;
  name: string;
  type: 'Hospital' | 'Blood Bank' | 'Storage';
  coordinates: [number, number]; // [longitude, latitude]
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
}

// This would typically come from a real data source
const stockData: BloodStockData[] = [
  { bloodType: 'A+', units: 450, capacity: 1000, expiryDate: '2023-08-15' },
  { bloodType: 'A-', units: 120, capacity: 500, expiryDate: '2023-08-20' },
  { bloodType: 'B+', units: 300, capacity: 800, expiryDate: '2023-08-18' },
  { bloodType: 'B-', units: 75, capacity: 400, expiryDate: '2023-08-22' },
  { bloodType: 'AB+', units: 150, capacity: 600, expiryDate: '2023-08-25' },
  { bloodType: 'AB-', units: 50, capacity: 300, expiryDate: '2023-08-30' },
  { bloodType: 'O+', units: 500, capacity: 1200, expiryDate: '2023-08-10' },
  { bloodType: 'O-', units: 200, capacity: 700, expiryDate: '2023-08-12' },
];

export const BloodInventory = ({ simpleView = false }: BloodInventoryProps) => {
  const [selectedLocation, setSelectedLocation] = useState<LocationData | null>(null);
  const [filteredStockData, setFilteredStockData] = useState<BloodStockData[]>(stockData);
  const [lowStockAlerts, setLowStockAlerts] = useState<BloodStockData[]>([]);
  const [expiryAlerts, setExpiryAlerts] = useState<BloodStockData[]>([]);
  const [mapError, setMapError] = useState<boolean>(false);

  // Handle map errors
  const handleMapError = (error: Error) => {
    console.error("Map loading error:", error);
    setMapError(true);
    if (!simpleView) {
      toast({
        title: "Map Loading Error",
        description: "Could not load location map. Using simplified location view instead.",
        variant: "destructive"
      });
    }
  };

  // Update filtered stock data when a location is selected
  useEffect(() => {
    try {
      if (selectedLocation) {
        // Convert the location's blood stock to the format expected by the component
        const locationStock = Object.entries(selectedLocation.bloodStock).map(([bloodType, data]) => ({
          bloodType: bloodType as BloodType,
          units: data.units,
          capacity: data.capacity,
          location: selectedLocation.name,
          expiryDate: getRandomExpiryDate(), // In a real app, this would come from the backend
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
      } else {
        // If no location is selected, show aggregate data
        setFilteredStockData(stockData);
        setLowStockAlerts(stockData.filter(item => (item.units / item.capacity) < 0.15));
        
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
      console.error("Error updating stock data:", error);
      // Fallback to showing all stock data
      setFilteredStockData(stockData);
    }
  }, [selectedLocation]);

  // Helper function to generate random expiry dates (for demo purposes only)
  const getRandomExpiryDate = () => {
    try {
      const today = new Date();
      const daysToAdd = Math.floor(Math.random() * 30) + 1; // 1 to 30 days
      const expiryDate = new Date();
      expiryDate.setDate(today.getDate() + daysToAdd);
      return expiryDate.toISOString().split('T')[0];
    } catch (error) {
      console.error("Error generating expiry date:", error);
      return new Date().toISOString().split('T')[0]; // Today as fallback
    }
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
      </div>
    );
  }

  // Full view for dashboard
  return (
    <div className="space-y-6">
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
    </div>
  );
};
