
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Droplet, AlertTriangle, Loader2 } from 'lucide-react';

// Mock data for blood inventory
interface BloodStock {
  type: string;
  units: number;
  status: 'critical' | 'low' | 'normal' | 'excess';
}

const mockBloodStockData: BloodStock[] = [
  { type: 'A+', units: 45, status: 'normal' },
  { type: 'A-', units: 12, status: 'low' },
  { type: 'B+', units: 38, status: 'normal' },
  { type: 'B-', units: 5, status: 'critical' },
  { type: 'AB+', units: 18, status: 'normal' },
  { type: 'AB-', units: 3, status: 'critical' },
  { type: 'O+', units: 72, status: 'excess' },
  { type: 'O-', units: 9, status: 'low' },
];

export const BloodInventory = () => {
  const [bloodStock, setBloodStock] = useState<BloodStock[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState<string | null>(null);

  // Simulate API call to fetch blood inventory data
  useEffect(() => {
    const fetchData = async () => {
      // In a real app, this would be an API call
      setTimeout(() => {
        setBloodStock(mockBloodStockData);
        setLoading(false);
      }, 1000);
    };

    fetchData();
  }, []);

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

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
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

        {loading ? (
          <div className="flex justify-center items-center py-16">
            <Loader2 className="animate-spin h-8 w-8 text-bloodRed-600" />
            <span className="ml-2 text-gray-600">Loading inventory data...</span>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
            {bloodStock.map((item) => (
              <motion.div
                key={item.type}
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
                      <div className="grid grid-cols-2 gap-2 text-gray-600">
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
