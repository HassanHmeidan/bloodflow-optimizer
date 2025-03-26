
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Droplet, AlertTriangle, Loader2, Mail, Bell, MapPin } from 'lucide-react';
import { notifyLowStockDonors } from '@/lib/notifications';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { LocationFilter, bloodStorageLocations } from './LocationFilter';

// Mock data for blood inventory
interface BloodStock {
  type: string;
  units: number;
  status: 'critical' | 'low' | 'normal' | 'excess';
  locationId?: number; // Added locationId
}

const mockBloodStockData: BloodStock[] = [
  { type: 'A+', units: 45, status: 'normal', locationId: 1 },
  { type: 'A-', units: 12, status: 'low', locationId: 2 },
  { type: 'B+', units: 38, status: 'normal', locationId: 3 },
  { type: 'B-', units: 5, status: 'critical', locationId: 5 },
  { type: 'AB+', units: 18, status: 'normal', locationId: 4 },
  { type: 'AB-', units: 3, status: 'critical', locationId: 5 },
  { type: 'O+', units: 72, status: 'excess', locationId: 3 },
  { type: 'O-', units: 9, status: 'low', locationId: 1 },
];

// Add more variations for each blood type at different locations
const expandedMockData: BloodStock[] = [
  ...mockBloodStockData,
  { type: 'A+', units: 28, status: 'normal', locationId: 2 },
  { type: 'A+', units: 15, status: 'low', locationId: 3 },
  { type: 'A+', units: 6, status: 'critical', locationId: 5 },
  { type: 'A-', units: 8, status: 'low', locationId: 1 },
  { type: 'A-', units: 4, status: 'critical', locationId: 4 },
  { type: 'B+', units: 22, status: 'normal', locationId: 1 },
  { type: 'B+', units: 14, status: 'low', locationId: 4 },
  { type: 'B-', units: 7, status: 'critical', locationId: 2 },
  { type: 'AB+', units: 11, status: 'normal', locationId: 3 },
  { type: 'AB+', units: 5, status: 'critical', locationId: 5 },
  { type: 'AB-', units: 2, status: 'critical', locationId: 1 },
  { type: 'AB-', units: 9, status: 'low', locationId: 3 },
  { type: 'O+', units: 38, status: 'normal', locationId: 2 },
  { type: 'O+', units: 25, status: 'normal', locationId: 4 },
  { type: 'O-', units: 15, status: 'low', locationId: 3 },
  { type: 'O-', units: 4, status: 'critical', locationId: 4 },
];

export const BloodInventory = () => {
  const [bloodStock, setBloodStock] = useState<BloodStock[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [notifyingStock, setNotifyingStock] = useState<string | null>(null);
  const [selectedLocationId, setSelectedLocationId] = useState<number | null>(null);

  // Simulate API call to fetch blood inventory data
  useEffect(() => {
    const fetchData = async () => {
      // In a real app, this would be an API call
      setTimeout(() => {
        setBloodStock(expandedMockData);
        setLoading(false);
      }, 1000);
    };

    fetchData();
  }, []);

  // Filter blood stock based on selected location
  const filteredBloodStock = bloodStock.filter(item => {
    if (!selectedLocationId) return true;
    return item.locationId === selectedLocationId;
  });

  // Get aggregated blood stock data for display
  const aggregatedBloodStock = filteredBloodStock.reduce((acc, item) => {
    const existingType = acc.find(x => x.type === item.type);
    if (existingType) {
      existingType.units += item.units;
      // Update status based on total units
      if (existingType.units <= 5) existingType.status = 'critical';
      else if (existingType.units <= 15) existingType.status = 'low';
      else if (existingType.units >= 60) existingType.status = 'excess';
      else existingType.status = 'normal';
    } else {
      acc.push({ ...item });
    }
    return acc;
  }, [] as BloodStock[]);

  // Sort blood types alphabetically
  const sortedBloodStock = [...aggregatedBloodStock].sort((a, b) => a.type.localeCompare(b.type));

  // Get status color based on inventory level
  const getStatusColor = (status: BloodStock['status']) => {
    switch (status) {
      case 'critical':
        return 'text-red-600 bg-red-50';
      case 'low':
        return 'text-amber-600 bg-amber-50';
      case 'normal':
        return 'text-green-600 bg-green-50';
      case 'excess':
        return 'text-blue-600 bg-blue-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  // Get drop fill based on inventory level
  const getDropFill = (status: BloodStock['status']) => {
    switch (status) {
      case 'critical':
        return 'text-red-600 fill-red-200';
      case 'low':
        return 'text-amber-600 fill-amber-200';
      case 'normal':
        return 'text-green-600 fill-green-200';
      case 'excess':
        return 'text-blue-600 fill-blue-200';
      default:
        return 'text-gray-600 fill-gray-200';
    }
  };

  // Handle sending notifications to eligible donors for low stock
  const handleNotifyDonors = async (bloodType: string, units: number) => {
    setNotifyingStock(bloodType);
    
    try {
      // Calculate threshold based on status (this would be more sophisticated in a real app)
      const threshold = 20;
      
      await notifyLowStockDonors(bloodType as any, units, threshold);
      
      toast.success(`Notifications sent for ${bloodType}`, {
        description: "Eligible donors have been notified about the low stock"
      });
    } catch (error) {
      console.error("Error notifying donors:", error);
      toast.error("Failed to notify donors");
    } finally {
      setNotifyingStock(null);
    }
  };

  // Get selected location name
  const getSelectedLocationName = () => {
    if (!selectedLocationId) return "All Locations";
    const location = bloodStorageLocations.find(loc => loc.id === selectedLocationId);
    return location ? location.name : "Unknown Location";
  };

  return (
    <section className="py-8 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <motion.h2 
            className="text-3xl font-bold mb-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            Current Blood Inventory
          </motion.h2>
          <motion.p 
            className="text-gray-600 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            Real-time tracking of our blood supply. Critical and low stocks indicate an urgent need for donors with these blood types.
          </motion.p>
        </div>

        {/* Location Filter */}
        <LocationFilter 
          onSelectLocation={setSelectedLocationId}
          selectedLocationId={selectedLocationId}
        />

        {/* Current Location Display */}
        {selectedLocationId && (
          <div className="mb-4 flex items-center justify-center">
            <div className="inline-flex items-center bg-bloodRed-50 text-bloodRed-700 px-4 py-2 rounded-full">
              <MapPin className="h-4 w-4 mr-2" />
              <span className="font-medium">Viewing: {getSelectedLocationName()}</span>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center py-16">
            <Loader2 className="animate-spin h-8 w-8 text-bloodRed-600" />
            <span className="ml-2 text-gray-600">Loading inventory data...</span>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
            {sortedBloodStock.map((item, index) => (
              <motion.div
                key={`${item.type}-${index}`}
                className="relative bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-shadow overflow-hidden"
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                whileHover={{ y: -5 }}
                transition={{ duration: 0.3 }}
                onClick={() => setSelectedType(selectedType === item.type ? null : item.type)}
              >
                {/* Status indicator */}
                <div 
                  className={`absolute top-3 right-3 text-xs px-2 py-1 rounded-full font-medium ${getStatusColor(item.status)}`}
                >
                  {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                </div>
                
                <div className="flex flex-col items-center">
                  {/* Blood type icon */}
                  <div className="mb-3 relative">
                    <Droplet className={`h-10 w-10 ${getDropFill(item.status)}`} />
                    <div className="absolute inset-0 flex items-center justify-center text-white font-bold text-xs">
                      {item.type}
                    </div>
                  </div>
                  
                  {/* Units counter */}
                  <div className="text-2xl font-bold mb-1">{item.units}</div>
                  <div className="text-gray-500 text-sm">Units Available</div>
                  
                  {/* Alert for critical or low status */}
                  {(item.status === 'critical' || item.status === 'low') && (
                    <motion.div 
                      className="mt-3 flex items-center text-xs text-red-600"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.2 }}
                    >
                      <AlertTriangle className="h-3 w-3 mr-1" />
                      <span>Donors needed</span>
                    </motion.div>
                  )}
                </div>
                
                {/* Expanding detail panel */}
                <AnimatePresence>
                  {selectedType === item.type && (
                    <motion.div 
                      className="mt-4 pt-4 border-t border-gray-100 text-sm"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="grid grid-cols-2 gap-2 text-gray-600 mb-3">
                        <div>Compatible donors:</div>
                        <div className="font-medium">
                          {item.type === 'AB+' && "All types"}
                          {item.type === 'AB-' && "A-, B-, AB-, O-"}
                          {item.type === 'A+' && "A+, A-, O+, O-"}
                          {item.type === 'A-' && "A-, O-"}
                          {item.type === 'B+' && "B+, B-, O+, O-"}
                          {item.type === 'B-' && "B-, O-"}
                          {item.type === 'O+' && "O+, O-"}
                          {item.type === 'O-' && "O-"}
                        </div>
                        <div>Last updated:</div>
                        <div className="font-medium">1 hour ago</div>
                      </div>

                      {/* Show location if not filtered */}
                      {!selectedLocationId && item.locationId && (
                        <div className="mb-3">
                          <div className="text-gray-600">Available at:</div>
                          <div className="font-medium">
                            {bloodStorageLocations.find(loc => loc.id === item.locationId)?.name || 'Unknown location'}
                          </div>
                        </div>
                      )}

                      {/* Notification button for critical or low stock */}
                      {(item.status === 'critical' || item.status === 'low') && (
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="w-full mt-2 flex items-center justify-center"
                          disabled={notifyingStock === item.type}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleNotifyDonors(item.type, item.units);
                          }}
                        >
                          {notifyingStock === item.type ? (
                            <>
                              <Loader2 className="h-3.5 w-3.5 mr-2 animate-spin" />
                              Notifying...
                            </>
                          ) : (
                            <>
                              <Mail className="h-3.5 w-3.5 mr-2" />
                              Notify Eligible Donors
                            </>
                          )}
                        </Button>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
