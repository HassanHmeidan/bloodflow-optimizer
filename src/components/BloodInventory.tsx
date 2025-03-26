
import { useState, useEffect } from 'react';
import { CircleX, CircleCheck } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { LocationFilter } from './LocationFilter';

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

export const BloodInventory = () => {
  const [selectedLocation, setSelectedLocation] = useState<LocationData | null>(null);
  const [filteredStockData, setFilteredStockData] = useState<BloodStockData[]>(stockData);
  const [lowStockAlerts, setLowStockAlerts] = useState<BloodStockData[]>([]);
  const [expiryAlerts, setExpiryAlerts] = useState<BloodStockData[]>([]);

  // Update filtered stock data when a location is selected
  useEffect(() => {
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
      
      // Calculate alerts
      setLowStockAlerts(locationStock.filter(item => (item.units / item.capacity) < 0.2));
      
      const today = new Date();
      const sevenDaysLater = new Date();
      sevenDaysLater.setDate(today.getDate() + 7);
      
      setExpiryAlerts(locationStock.filter(item => {
        if (!item.expiryDate) return false;
        const expiryDate = new Date(item.expiryDate);
        return expiryDate <= sevenDaysLater;
      }));
    } else {
      // If no location is selected, show aggregate data
      setFilteredStockData(stockData);
      setLowStockAlerts(stockData.filter(item => (item.units / item.capacity) < 0.2));
      
      const today = new Date();
      const sevenDaysLater = new Date();
      sevenDaysLater.setDate(today.getDate() + 7);
      
      setExpiryAlerts(stockData.filter(item => {
        if (!item.expiryDate) return false;
        const expiryDate = new Date(item.expiryDate);
        return expiryDate <= sevenDaysLater;
      }));
    }
  }, [selectedLocation]);

  // Helper function to generate random expiry dates (for demo purposes only)
  const getRandomExpiryDate = () => {
    const today = new Date();
    const daysToAdd = Math.floor(Math.random() * 30) + 1; // 1 to 30 days
    const expiryDate = new Date();
    expiryDate.setDate(today.getDate() + daysToAdd);
    return expiryDate.toISOString().split('T')[0];
  };

  // Calculate status based on stock level
  const getStockStatus = (units: number, capacity: number) => {
    const percentage = (units / capacity) * 100;
    if (percentage < 20) return { color: 'bg-red-500', status: 'Low' };
    if (percentage < 50) return { color: 'bg-amber-500', status: 'Medium' };
    return { color: 'bg-green-500', status: 'Good' };
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-8 gap-4">
        {filteredStockData.map((item) => {
          const stockStatus = getStockStatus(item.units, item.capacity);
          const percentage = Math.round((item.units / item.capacity) * 100);
          
          return (
            <Card key={item.bloodType} className="p-4 col-span-1 md:col-span-2 lg:col-span-1">
              <div className="text-center space-y-2">
                <div className="inline-flex items-center justify-center bg-bloodRed-100 text-bloodRed-900 text-xl font-bold rounded-full w-12 h-12">
                  {item.bloodType}
                </div>
                <h3 className="text-sm font-medium text-gray-500">Blood Type</h3>
                <div className="text-2xl font-bold">{item.units} <span className="text-sm text-gray-500">units</span></div>
                <Progress value={percentage} className={`h-2 ${stockStatus.color}`} />
                <div className="flex justify-between text-xs">
                  <span>{percentage}%</span>
                  <span className={`font-medium ${
                    stockStatus.status === 'Low' ? 'text-red-600' : 
                    stockStatus.status === 'Medium' ? 'text-amber-600' : 
                    'text-green-600'
                  }`}>
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
          <h3 className="text-lg font-semibold">Low Stock & Expiry Alerts</h3>
          <div className="space-y-2">
            {lowStockAlerts.length > 0 || expiryAlerts.length > 0 ? (
              <>
                {lowStockAlerts.map((item, index) => (
                  <div key={`low-${item.bloodType}-${index}`} className="flex items-center space-x-3 p-3 bg-red-50 border border-red-100 rounded-md">
                    <CircleX className="h-5 w-5 text-red-500" />
                    <div>
                      <span className="font-medium">Low Stock Alert:</span> {item.bloodType} - Only {item.units} units available
                      {item.location && <span className="text-sm text-gray-500 ml-2">at {item.location}</span>}
                    </div>
                  </div>
                ))}
                
                {expiryAlerts.map((item, index) => (
                  <div key={`expiry-${item.bloodType}-${index}`} className="flex items-center space-x-3 p-3 bg-amber-50 border border-amber-100 rounded-md">
                    <CircleCheck className="h-5 w-5 text-amber-500" />
                    <div>
                      <span className="font-medium">Expiry Alert:</span> {item.bloodType} - Expires on {item.expiryDate}
                      {item.location && <span className="text-sm text-gray-500 ml-2">at {item.location}</span>}
                    </div>
                  </div>
                ))}
              </>
            ) : (
              <p className="text-center text-gray-500 py-4">No alerts at this time</p>
            )}
          </div>
        </div>
        
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Location Based Filtering</h3>
          <LocationFilter onLocationSelect={setSelectedLocation} />
        </div>
      </div>
    </div>
  );
};
