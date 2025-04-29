
import React, { useState, useEffect } from 'react';
import { Search, Filter, Map, MapPin, Building, Warehouse, Hospital } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/components/ui/use-toast';
import { getSupabaseClient } from "@/lib/supabase";

interface LocationFilterProps {
  onLocationSelect: (location: LocationData | null) => void;
  onError?: (error: Error) => void;
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

export const LocationFilter: React.FC<LocationFilterProps> = ({ onLocationSelect, onError }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [locations, setLocations] = useState<LocationData[]>([]);
  const [filteredLocations, setFilteredLocations] = useState<LocationData[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<LocationData | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchLocations = async () => {
      setLoading(true);
      try {
        const supabase = getSupabaseClient();
        
        // Fetch donation centers (blood banks)
        const { data: centers, error: centersError } = await supabase
          .from('donation_centers')
          .select('*');
        
        if (centersError) throw centersError;

        // Lebanese donation centers with realistic coordinates
        const lebanonCenters: LocationData[] = (centers || []).map((center) => ({
          id: center.id,
          name: center.name,
          type: 'Blood Bank',
          coordinates: [35.5018 + (Math.random() * 0.2 - 0.1), 33.8938 + (Math.random() * 0.2 - 0.1)], // Beirut ± random offset
          address: `${center.address}, ${center.city}, Lebanon`,
          bloodStock: {
            'A+': { units: Math.floor(Math.random() * 100) + 20, capacity: 200 },
            'B+': { units: Math.floor(Math.random() * 100) + 10, capacity: 150 },
            'O+': { units: Math.floor(Math.random() * 150) + 50, capacity: 300 },
            'AB+': { units: Math.floor(Math.random() * 50) + 5, capacity: 100 },
            'A-': { units: Math.floor(Math.random() * 30) + 5, capacity: 75 },
            'B-': { units: Math.floor(Math.random() * 25) + 5, capacity: 60 },
            'O-': { units: Math.floor(Math.random() * 40) + 10, capacity: 100 },
            'AB-': { units: Math.floor(Math.random() * 15) + 2, capacity: 40 }
          }
        }));

        // Manually add Lebanese hospitals if none in database
        const { data: hospitals, error: hospitalsError } = await supabase
          .from('hospitals')
          .select('*');
          
        if (hospitalsError) throw hospitalsError;

        const lebanonHospitals: LocationData[] = (hospitals || []).length > 0 
          ? (hospitals || []).map(hospital => ({
              id: hospital.id,
              name: hospital.name,
              type: 'Hospital',
              coordinates: [35.5018 + (Math.random() * 0.3 - 0.15), 33.8938 + (Math.random() * 0.3 - 0.15)],
              address: `${hospital.address}, ${hospital.city}, Lebanon`,
              bloodStock: {
                'A+': { units: Math.floor(Math.random() * 30) + 5, capacity: 100 },
                'B+': { units: Math.floor(Math.random() * 25) + 5, capacity: 80 },
                'O+': { units: Math.floor(Math.random() * 50) + 10, capacity: 150 },
                'AB+': { units: Math.floor(Math.random() * 15) + 2, capacity: 50 },
                'A-': { units: Math.floor(Math.random() * 10) + 2, capacity: 40 },
                'B-': { units: Math.floor(Math.random() * 8) + 2, capacity: 30 },
                'O-': { units: Math.floor(Math.random() * 20) + 5, capacity: 60 },
                'AB-': { units: Math.floor(Math.random() * 5) + 1, capacity: 20 }
              }
            }))
          : [
              {
                id: "leb-hospital-1",
                name: "American University of Beirut Medical Center",
                type: 'Hospital',
                coordinates: [35.4802, 33.9008],
                address: "Cairo Street, Beirut, Lebanon",
                bloodStock: {
                  'A+': { units: 45, capacity: 100 },
                  'B+': { units: 30, capacity: 80 },
                  'O+': { units: 70, capacity: 150 },
                  'AB+': { units: 15, capacity: 50 },
                  'A-': { units: 10, capacity: 40 },
                  'B-': { units: 8, capacity: 30 },
                  'O-': { units: 25, capacity: 60 },
                  'AB-': { units: 5, capacity: 20 }
                }
              },
              {
                id: "leb-hospital-2",
                name: "Rafik Hariri University Hospital",
                type: 'Hospital',
                coordinates: [35.5122, 33.8547],
                address: "Jnah, Beirut, Lebanon",
                bloodStock: {
                  'A+': { units: 50, capacity: 100 },
                  'B+': { units: 35, capacity: 80 },
                  'O+': { units: 65, capacity: 150 },
                  'AB+': { units: 12, capacity: 50 },
                  'A-': { units: 8, capacity: 40 },
                  'B-': { units: 7, capacity: 30 },
                  'O-': { units: 18, capacity: 60 },
                  'AB-': { units: 4, capacity: 20 }
                }
              },
              {
                id: "leb-hospital-3",
                name: "Saint Georges Hospital",
                type: 'Hospital',
                coordinates: [35.5034, 33.9022],
                address: "Ashrafieh, Beirut, Lebanon",
                bloodStock: {
                  'A+': { units: 38, capacity: 100 },
                  'B+': { units: 26, capacity: 80 },
                  'O+': { units: 62, capacity: 150 },
                  'AB+': { units: 17, capacity: 50 },
                  'A-': { units: 12, capacity: 40 },
                  'B-': { units: 9, capacity: 30 },
                  'O-': { units: 21, capacity: 60 },
                  'AB-': { units: 6, capacity: 20 }
                }
              }
            ];

        // Add some storage facilities
        const storageLocations: LocationData[] = [
          {
            id: "leb-storage-1",
            name: "Central Blood Bank Storage",
            type: 'Storage',
            coordinates: [35.5118, 33.8880],
            address: "Badaro, Beirut, Lebanon",
            bloodStock: {
              'A+': { units: 120, capacity: 250 },
              'B+': { units: 80, capacity: 180 },
              'O+': { units: 150, capacity: 300 },
              'AB+': { units: 40, capacity: 100 },
              'A-': { units: 30, capacity: 70 },
              'B-': { units: 25, capacity: 60 },
              'O-': { units: 60, capacity: 120 },
              'AB-': { units: 15, capacity: 30 }
            }
          },
          {
            id: "leb-storage-2",
            name: "Lebanese Red Cross Blood Center",
            type: 'Storage',
            coordinates: [35.4925, 33.8850],
            address: "Spears, Beirut, Lebanon",
            bloodStock: {
              'A+': { units: 100, capacity: 200 },
              'B+': { units: 65, capacity: 160 },
              'O+': { units: 130, capacity: 250 },
              'AB+': { units: 35, capacity: 80 },
              'A-': { units: 25, capacity: 60 },
              'B-': { units: 20, capacity: 50 },
              'O-': { units: 50, capacity: 110 },
              'AB-': { units: 12, capacity: 25 }
            }
          }
        ];

        // Combine all locations
        const allLocations = [...lebanonCenters, ...lebanonHospitals, ...storageLocations];
        setLocations(allLocations);
        setFilteredLocations(allLocations);
      } catch (error) {
        console.error("Error loading locations:", error);
        toast({
          title: "Error loading locations",
          description: "Could not load locations from database",
          variant: "destructive"
        });
        if (onError && error instanceof Error) onError(error);
      } finally {
        setLoading(false);
      }
    };

    fetchLocations();
  }, [onError]);

  useEffect(() => {
    try {
      let results = locations;

      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        results = results.filter(
          location => location.name.toLowerCase().includes(query) ||
            location.address.toLowerCase().includes(query)
        );
      }

      if (selectedType) {
        results = results.filter(location => location.type === selectedType);
      }

      setFilteredLocations(results);
    } catch (error) {
      console.error("Error filtering locations:", error);
      if (onError && error instanceof Error) {
        onError(error);
      }
    }
  }, [searchQuery, selectedType, locations, onError]);

  const handleSelectLocation = (location: LocationData) => {
    try {
      setSelectedLocation(location);
      onLocationSelect(location);
      toast({
        title: "Location Selected",
        description: `Now showing blood inventory for ${location.name}`,
      });
    } catch (error) {
      console.error("Error selecting location:", error);
      if (onError && error instanceof Error) {
        onError(error);
      }
    }
  };

  const getLocationIcon = (type: string) => {
    switch (type) {
      case 'Hospital':
        return <Hospital className="h-4 w-4 text-blue-500" />;
      case 'Blood Bank':
        return <Building className="h-4 w-4 text-bloodRed-500" />;
      case 'Storage':
        return <Warehouse className="h-4 w-4 text-amber-500" />;
      default:
        return <MapPin className="h-4 w-4 text-gray-500" />;
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        setMapLoaded(true);
        console.log("Map placeholder loaded successfully");
      } catch (error) {
        console.error("Error in map loading simulation:", error);
        if (onError && error instanceof Error) {
          onError(error);
        }
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [onError]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col space-y-2">
        <div className="relative">
          <Input
            type="text"
            placeholder="Search by name or address..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        </div>

        <Select onValueChange={(value) => setSelectedType(value === "all" ? null : value)}>
          <SelectTrigger className="flex items-center">
            <Filter className="h-4 w-4 mr-2 text-gray-400" />
            <SelectValue placeholder="Filter by type..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="Hospital">Hospital</SelectItem>
            <SelectItem value="Blood Bank">Blood Bank</SelectItem>
            <SelectItem value="Storage">Storage</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card className="relative h-56 overflow-hidden bg-gray-100">
        {mapLoaded ? (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
            <div className="relative w-full h-full bg-[url('https://api.mapbox.com/styles/v1/mapbox/light-v10/static/35.5088,33.8938,11,0/400x200?access_token=pk.placeholder')] bg-cover">
              {selectedLocation ? (
                <div
                  className="absolute w-6 h-6 transform -translate-x-1/2 -translate-y-1/2 animate-pulse"
                  style={{
                    left: '50%',
                    top: '50%'
                  }}
                >
                  <div className="w-4 h-4 relative">
                    {getLocationIcon(selectedLocation.type)}
                    <span className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 whitespace-nowrap text-xs bg-white/80 px-1 py-0.5 rounded shadow-sm">
                      {selectedLocation.name}
                    </span>
                  </div>
                </div>
              ) : (
                filteredLocations.slice(0, 5).map((loc, idx) => (
                  <div
                    key={loc.id}
                    className="absolute w-4 h-4 transform -translate-x-1/2 -translate-y-1/2"
                    style={{
                      left: `${20 + (idx * 15)}%`,
                      top: `${30 + (idx * 10)}%`
                    }}
                  >
                    {getLocationIcon(loc.type)}
                  </div>
                ))
              )}
              <div className="absolute bottom-2 right-2 bg-white px-2 py-1 rounded text-xs">
                Lebanon Map View
              </div>
            </div>
          </div>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <Map className="h-12 w-12 mx-auto text-gray-300 mb-2 animate-pulse" />
              <p className="text-sm text-gray-500">Loading Lebanon map...</p>
            </div>
          </div>
        )}
      </Card>

      <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
        {loading ? (
          <div className="text-center py-8 text-gray-500">Loading Lebanon locations...</div>
        ) : filteredLocations.length > 0 ? (
          filteredLocations.map((location) => (
            <Card
              key={location.id}
              className={`p-3 cursor-pointer transition hover:bg-gray-50 ${
                selectedLocation?.id === location.id ? 'bg-gray-50 border-bloodRed-400 shadow-sm' : ''
              }`}
              onClick={() => handleSelectLocation(location)}
            >
              <div className="flex justify-between items-start">
                <div className="flex items-start gap-2">
                  <div className="mt-0.5">
                    {getLocationIcon(location.type)}
                  </div>
                  <div>
                    <h4 className="font-medium">{location.name}</h4>
                    <p className="text-xs text-gray-500">{location.address}</p>
                  </div>
                </div>
                <span className="text-xs bg-gray-100 px-2 py-1 rounded-full">
                  {location.type}
                </span>
              </div>

              <div className="mt-2 text-xs text-gray-600">
                <div className="flex gap-2">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-bloodRed-100 text-bloodRed-800 font-medium">
                    {Object.keys(location.bloodStock).length} blood types
                  </span>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-green-100 text-green-800 font-medium">
                    {Object.values(location.bloodStock).reduce((sum, item) => sum + item.units, 0)} units total
                  </span>
                </div>
              </div>
            </Card>
          ))
        ) : (
          <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg">
            <MapPin className="h-8 w-8 mx-auto text-gray-300 mb-2" />
            <p>No locations found matching your criteria</p>
            <button
              className="text-sm text-bloodRed-600 mt-2 hover:underline"
              onClick={() => {
                setSearchQuery("");
                setSelectedType(null);
              }}
            >
              Clear filters
            </button>
          </div>
        )}
      </div>

      {selectedLocation && (
        <div className="flex justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSelectedLocation(null);
              onLocationSelect(null);
              toast({
                title: "Selection Cleared",
                description: "Now showing aggregate blood inventory",
              });
            }}
          >
            Clear Selection
          </Button>
        </div>
      )}
    </div>
  );
};
