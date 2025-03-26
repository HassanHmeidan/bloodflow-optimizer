
import { useState, useEffect, useCallback } from 'react';
import { Search, MapPin } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

// Set your Mapbox token here - ideally this would be stored in environment variables
mapboxgl.accessToken = 'pk.eyJ1IjoiZXhhbXBsZXVzZXIiLCJhIjoiY2xxMzlnb3N5MGU0ZDJpcGh3ZTk1dXJmMiJ9.OLkptaH5p8AS6yAg_CbIuQ';

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

// Sample location data - in a real app, this would come from your backend
const sampleLocations: LocationData[] = [
  {
    id: '1',
    name: 'General Hospital',
    type: 'Hospital',
    coordinates: [-73.9665, 40.7812], // NYC coordinates
    address: '1000 Fifth Avenue, New York, NY',
    bloodStock: {
      'A+': { units: 45, capacity: 100 },
      'A-': { units: 12, capacity: 50 },
      'B+': { units: 30, capacity: 100 },
      'B-': { units: 8, capacity: 50 },
      'AB+': { units: 15, capacity: 50 },
      'AB-': { units: 5, capacity: 25 },
      'O+': { units: 55, capacity: 150 },
      'O-': { units: 22, capacity: 100 },
    }
  },
  {
    id: '2',
    name: 'City Blood Bank',
    type: 'Blood Bank',
    coordinates: [-73.9712, 40.7831], // Nearby
    address: '500 Madison Avenue, New York, NY',
    bloodStock: {
      'A+': { units: 85, capacity: 200 },
      'A-': { units: 32, capacity: 100 },
      'B+': { units: 65, capacity: 200 },
      'B-': { units: 28, capacity: 100 },
      'AB+': { units: 35, capacity: 100 },
      'AB-': { units: 15, capacity: 50 },
      'O+': { units: 135, capacity: 300 },
      'O-': { units: 62, capacity: 150 },
    }
  },
  {
    id: '3',
    name: 'Downtown Medical Center',
    type: 'Hospital',
    coordinates: [-74.0060, 40.7128], // Downtown
    address: '100 Broadway, New York, NY',
    bloodStock: {
      'A+': { units: 25, capacity: 80 },
      'A-': { units: 7, capacity: 40 },
      'B+': { units: 18, capacity: 80 },
      'B-': { units: 3, capacity: 40 },
      'AB+': { units: 9, capacity: 40 },
      'AB-': { units: 2, capacity: 20 },
      'O+': { units: 30, capacity: 100 },
      'O-': { units: 11, capacity: 60 },
    }
  },
  {
    id: '4',
    name: 'Regional Storage Facility',
    type: 'Storage',
    coordinates: [-73.8458, 40.6915], // Queens
    address: '200 Queens Blvd, Queens, NY',
    bloodStock: {
      'A+': { units: 150, capacity: 300 },
      'A-': { units: 45, capacity: 150 },
      'B+': { units: 120, capacity: 300 },
      'B-': { units: 35, capacity: 150 },
      'AB+': { units: 65, capacity: 150 },
      'AB-': { units: 25, capacity: 75 },
      'O+': { units: 180, capacity: 450 },
      'O-': { units: 90, capacity: 225 },
    }
  }
];

interface LocationFilterProps {
  onLocationSelect: (location: LocationData | null) => void;
}

export const LocationFilter = ({ onLocationSelect }: LocationFilterProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('');
  const [map, setMap] = useState<mapboxgl.Map | null>(null);
  const [markers, setMarkers] = useState<mapboxgl.Marker[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<LocationData | null>(null);
  const [filteredLocations, setFilteredLocations] = useState<LocationData[]>(sampleLocations);

  // Initialize map
  useEffect(() => {
    const mapInstance = new mapboxgl.Map({
      container: 'map',
      style: 'mapbox://styles/mapbox/streets-v11',
      center: [-73.9712, 40.7831], // Default center (NYC)
      zoom: 11
    });

    mapInstance.on('load', () => {
      mapInstance.addControl(new mapboxgl.NavigationControl(), 'top-right');
      setMap(mapInstance);
    });

    return () => {
      mapInstance.remove();
    };
  }, []);

  // Filter locations based on search query and type
  useEffect(() => {
    let filtered = sampleLocations;
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(location => 
        location.name.toLowerCase().includes(query) || 
        location.address.toLowerCase().includes(query)
      );
    }
    
    if (selectedType) {
      filtered = filtered.filter(location => location.type === selectedType);
    }
    
    setFilteredLocations(filtered);
  }, [searchQuery, selectedType]);

  // Update markers when filtered locations change
  useEffect(() => {
    if (!map) return;
    
    // Clear existing markers
    markers.forEach(marker => marker.remove());
    
    // Add new markers
    const newMarkers = filteredLocations.map(location => {
      const el = document.createElement('div');
      el.className = 'marker';
      el.style.backgroundColor = selectedLocation?.id === location.id ? '#ff4646' : '#3b82f6';
      el.style.width = '25px';
      el.style.height = '25px';
      el.style.borderRadius = '50%';
      el.style.cursor = 'pointer';
      el.style.border = '2px solid white';
      
      const marker = new mapboxgl.Marker(el)
        .setLngLat(location.coordinates)
        .setPopup(new mapboxgl.Popup({ offset: 25 }).setHTML(
          `<h3>${location.name}</h3><p>${location.type}</p>`
        ))
        .addTo(map);
      
      marker.getElement().addEventListener('click', () => {
        handleLocationSelect(location);
      });
      
      return marker;
    });
    
    setMarkers(newMarkers);
    
    // Fit map to markers if we have any
    if (filteredLocations.length > 0) {
      const bounds = new mapboxgl.LngLatBounds();
      filteredLocations.forEach(location => {
        bounds.extend(location.coordinates);
      });
      
      map.fitBounds(bounds, {
        padding: 50,
        maxZoom: 14
      });
    }
  }, [filteredLocations, map, selectedLocation]);

  const handleLocationSelect = useCallback((location: LocationData) => {
    setSelectedLocation(location);
    onLocationSelect(location);
  }, [onLocationSelect]);

  const clearSelection = useCallback(() => {
    setSelectedLocation(null);
    onLocationSelect(null);
  }, [onLocationSelect]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col space-y-4">
        <h3 className="text-lg font-semibold">Location Filter</h3>
        
        <div className="relative">
          <Input
            type="text"
            placeholder="Search by location name or address..."
            className="pr-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        </div>
        
        <Select value={selectedType} onValueChange={setSelectedType}>
          <SelectTrigger>
            <SelectValue placeholder="Filter by location type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Types</SelectItem>
            <SelectItem value="Hospital">Hospital</SelectItem>
            <SelectItem value="Blood Bank">Blood Bank</SelectItem>
            <SelectItem value="Storage">Storage</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2">
          <div id="map" className="h-[400px] rounded-md border border-gray-200"></div>
        </div>
        
        <div className="space-y-4">
          <h4 className="font-medium">Available Locations ({filteredLocations.length})</h4>
          
          <div className="space-y-2 max-h-[360px] overflow-y-auto">
            {filteredLocations.length > 0 ? (
              filteredLocations.map((location) => (
                <div 
                  key={location.id} 
                  className={`p-3 rounded-md border cursor-pointer transition-colors ${
                    selectedLocation?.id === location.id
                      ? 'bg-bloodRed-50 border-bloodRed-300'
                      : 'hover:bg-gray-50 border-gray-200'
                  }`}
                  onClick={() => handleLocationSelect(location)}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h5 className="font-medium">{location.name}</h5>
                      <p className="text-sm text-gray-500">{location.type}</p>
                      <p className="text-xs text-gray-400 mt-1">{location.address}</p>
                    </div>
                    <MapPin className="h-4 w-4 text-gray-400" />
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-500 py-4">No locations found</p>
            )}
          </div>
          
          {selectedLocation && (
            <Button 
              variant="outline" 
              className="w-full" 
              onClick={clearSelection}
            >
              Clear Selection
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
