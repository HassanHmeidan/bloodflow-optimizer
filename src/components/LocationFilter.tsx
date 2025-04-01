
import React, { useState, useEffect } from 'react';
import { Search, Filter, Map, MapPin, Building, Warehouse, Hospital } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/components/ui/use-toast';

// Define the props interface for the LocationFilter component
interface LocationFilterProps {
  onLocationSelect: (location: LocationData | null) => void;
  onError?: (error: Error) => void;
}

// Define the type for location data
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

// Mock data for locations
const mockLocations: LocationData[] = [
  {
    id: "1",
    name: "City General Hospital",
    type: "Hospital",
    coordinates: [-122.4194, 37.7749],
    address: "123 Main St, San Francisco, CA",
    bloodStock: {
      "A+": { units: 120, capacity: 200 },
      "O-": { units: 50, capacity: 100 },
      "B+": { units: 80, capacity: 150 },
    }
  },
  {
    id: "2",
    name: "Central Blood Bank",
    type: "Blood Bank",
    coordinates: [-122.4099, 37.7890],
    address: "456 Market St, San Francisco, CA",
    bloodStock: {
      "A+": { units: 200, capacity: 300 },
      "A-": { units: 100, capacity: 150 },
      "B+": { units: 150, capacity: 200 },
      "B-": { units: 75, capacity: 120 },
      "AB+": { units: 50, capacity: 100 },
      "AB-": { units: 25, capacity: 50 },
      "O+": { units: 250, capacity: 400 },
      "O-": { units: 125, capacity: 200 },
    }
  },
  {
    id: "3",
    name: "Regional Storage Facility",
    type: "Storage",
    coordinates: [-122.3977, 37.7790],
    address: "789 Howard St, San Francisco, CA",
    bloodStock: {
      "A+": { units: 300, capacity: 600 },
      "O+": { units: 400, capacity: 800 },
      "O-": { units: 150, capacity: 500 },
    }
  },
  {
    id: "4",
    name: "East Side Medical Center",
    type: "Hospital",
    coordinates: [-122.3894, 37.7651],
    address: "321 Valencia St, San Francisco, CA",
    bloodStock: {
      "A+": { units: 80, capacity: 120 },
      "B-": { units: 30, capacity: 60 },
      "O+": { units: 90, capacity: 150 },
    }
  },
  {
    id: "5",
    name: "Bay Area Donor Center",
    type: "Blood Bank",
    coordinates: [-122.4064, 37.8014],
    address: "555 Van Ness Ave, San Francisco, CA",
    bloodStock: {
      "A+": { units: 180, capacity: 250 },
      "A-": { units: 90, capacity: 120 },
      "AB+": { units: 40, capacity: 80 },
      "O+": { units: 200, capacity: 350 },
    }
  }
];

export const LocationFilter: React.FC<LocationFilterProps> = ({ onLocationSelect, onError }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [filteredLocations, setFilteredLocations] = useState<LocationData[]>(mockLocations);
  const [selectedLocation, setSelectedLocation] = useState<LocationData | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  // Filter locations based on search query and selected type
  useEffect(() => {
    try {
      let results = mockLocations;

      // Filter by search query
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        results = results.filter(
          location => location.name.toLowerCase().includes(query) || 
                      location.address.toLowerCase().includes(query)
        );
      }

      // Filter by location type
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
  }, [searchQuery, selectedType, onError]);

  // Handle location selection
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

  // Get icon based on location type
  const getLocationIcon = (type: string) => {
    switch(type) {
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

  // Simulate loading a map with a delay (in a real app, this would be an actual map)
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
      
      {/* Interactive Map Placeholder with simulated points */}
      <Card className="relative h-56 overflow-hidden bg-gray-100">
        {mapLoaded ? (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
            <div className="relative w-full h-full bg-[url('https://api.mapbox.com/styles/v1/mapbox/light-v10/static/-122.4,37.78,12,0/400x200?access_token=pk.placeholder')] bg-cover">
              {/* Simulated map markers */}
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
                Map View Available
              </div>
            </div>
          </div>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <Map className="h-12 w-12 mx-auto text-gray-300 mb-2 animate-pulse" />
              <p className="text-sm text-gray-500">Loading map...</p>
            </div>
          </div>
        )}
      </Card>
      
      {/* Locations list */}
      <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
        {filteredLocations.length > 0 ? (
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
