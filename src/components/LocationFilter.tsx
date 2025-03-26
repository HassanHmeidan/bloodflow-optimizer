
import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Search, MapPin, X } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Note: In a production environment, this should be an environment variable
// For now, we'll use a placeholder - you'll need to replace this with your Mapbox token
const MAPBOX_TOKEN = 'pk.your_mapbox_token_here';

// Mock data for storage locations
export const bloodStorageLocations = [
  { id: 1, name: "General Hospital Blood Bank", type: "Hospital", lat: 34.0522, lng: -118.2437, availableTypes: ["A+", "B+", "AB+", "O+", "O-"] },
  { id: 2, name: "City Medical Center", type: "Hospital", lat: 34.0689, lng: -118.4452, availableTypes: ["A+", "A-", "B+", "AB-", "O+"] },
  { id: 3, name: "Regional Blood Center", type: "Blood Bank", lat: 34.1139, lng: -118.3219, availableTypes: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"] },
  { id: 4, name: "Community Hospital", type: "Hospital", lat: 33.9816, lng: -118.3267, availableTypes: ["A+", "B+", "O+"] },
  { id: 5, name: "Downtown Medical Storage", type: "Storage", lat: 34.0407, lng: -118.2468, availableTypes: ["A-", "B-", "AB-", "O-"] },
];

interface LocationFilterProps {
  onSelectLocation: (locationId: number | null) => void;
  selectedLocationId: number | null;
}

export const LocationFilter: React.FC<LocationFilterProps> = ({ 
  onSelectLocation, 
  selectedLocationId
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markers = useRef<mapboxgl.Marker[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [locationType, setLocationType] = useState<string>('');
  const [mapInitialized, setMapInitialized] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);
  const [isMapboxTokenEntered, setIsMapboxTokenEntered] = useState(false);
  const [userMapboxToken, setUserMapboxToken] = useState('');

  // Filter locations based on search and type
  const filteredLocations = bloodStorageLocations.filter(location => {
    const matchesSearch = location.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = locationType ? location.type === locationType : true;
    return matchesSearch && matchesType;
  });

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || mapInitialized) return;
    
    // Check if token is available
    const token = userMapboxToken || MAPBOX_TOKEN;
    if (token === 'pk.your_mapbox_token_here') {
      setMapError('Please enter your Mapbox token to view the map');
      return;
    }

    try {
      mapboxgl.accessToken = token;
      
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/light-v11',
        center: [-118.2437, 34.0522], // Los Angeles
        zoom: 10
      });

      map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');
      
      // Add markers once the map is loaded
      map.current.on('load', () => {
        setMapInitialized(true);
        addMarkers();
      });

      return () => {
        clearMarkers();
        map.current?.remove();
      };
    } catch (error) {
      console.error('Error initializing map:', error);
      setMapError('Error initializing map. Please check your Mapbox token.');
    }
  }, [mapInitialized, userMapboxToken]);

  // Add markers to the map
  const addMarkers = () => {
    if (!map.current) return;
    
    clearMarkers();
    
    bloodStorageLocations.forEach(location => {
      const isSelected = location.id === selectedLocationId;
      
      // Create marker element
      const el = document.createElement('div');
      el.className = 'marker';
      el.style.width = '25px';
      el.style.height = '25px';
      el.style.borderRadius = '50%';
      el.style.display = 'flex';
      el.style.justifyContent = 'center';
      el.style.alignItems = 'center';
      el.style.background = isSelected ? '#ea384c' : '#1b5eb5';
      el.style.cursor = 'pointer';
      el.style.boxShadow = '0 0 0 4px rgba(255,255,255,0.8)';
      el.style.transition = 'all 0.3s ease';
      
      // Add a map pin icon inside
      const iconEl = document.createElement('div');
      iconEl.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path><circle cx="12" cy="10" r="3"></circle></svg>`;
      el.appendChild(iconEl);

      // Add tooltip
      const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(
        `<div style="font-weight: bold;">${location.name}</div>
         <div>Type: ${location.type}</div>
         <div>Available Blood Types: ${location.availableTypes.join(', ')}</div>`
      );

      // Create and add the marker
      const marker = new mapboxgl.Marker(el)
        .setLngLat([location.lng, location.lat])
        .setPopup(popup)
        .addTo(map.current);
      
      // Add click event
      marker.getElement().addEventListener('click', () => {
        onSelectLocation(location.id);
      });
      
      markers.current.push(marker);
    });
  };

  // Clear all markers
  const clearMarkers = () => {
    markers.current.forEach(marker => marker.remove());
    markers.current = [];
  };

  // Update markers when selected location changes
  useEffect(() => {
    if (mapInitialized) {
      addMarkers();
      
      // Fly to selected location
      if (selectedLocationId) {
        const location = bloodStorageLocations.find(loc => loc.id === selectedLocationId);
        if (location && map.current) {
          map.current.flyTo({
            center: [location.lng, location.lat],
            zoom: 14,
            essential: true
          });
        }
      }
    }
  }, [selectedLocationId, mapInitialized]);

  // Reset all filters
  const handleResetFilters = () => {
    setSearchTerm('');
    setLocationType('');
    onSelectLocation(null);
    
    // Reset map view
    if (map.current) {
      map.current.flyTo({
        center: [-118.2437, 34.0522],
        zoom: 10,
        essential: true
      });
    }
  };

  return (
    <Card className="mb-6">
      <CardHeader className="pb-3">
        <CardTitle className="text-xl flex items-center">
          <MapPin className="h-5 w-5 mr-2 text-bloodRed-600" />
          Location Based Filtering
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          {/* Search input */}
          <div className="relative">
            <Input
              type="text"
              placeholder="Search by location name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          </div>

          {/* Location type filter */}
          <Select value={locationType} onValueChange={setLocationType}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by location type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All types</SelectItem>
              <SelectItem value="Hospital">Hospital</SelectItem>
              <SelectItem value="Blood Bank">Blood Bank</SelectItem>
              <SelectItem value="Storage">Storage Facility</SelectItem>
            </SelectContent>
          </Select>

          {/* Reset button */}
          <Button 
            variant="outline" 
            className="flex items-center" 
            onClick={handleResetFilters}
          >
            <X className="h-4 w-4 mr-2" />
            Reset Filters
          </Button>
        </div>

        {/* Mapbox token input if needed */}
        {mapError && !isMapboxTokenEntered && (
          <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-md">
            <p className="text-amber-800 mb-2">{mapError}</p>
            <div className="flex gap-2">
              <Input
                type="text"
                placeholder="Enter your Mapbox public token..."
                value={userMapboxToken}
                onChange={(e) => setUserMapboxToken(e.target.value)}
              />
              <Button 
                onClick={() => {
                  setIsMapboxTokenEntered(true);
                  setMapInitialized(false);
                }}
                disabled={!userMapboxToken}
              >
                Apply
              </Button>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Get your token at <a href="https://mapbox.com/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">mapbox.com</a>
            </p>
          </div>
        )}

        {/* Map container */}
        <div className="border border-gray-200 rounded-md overflow-hidden" style={{ height: '400px', position: 'relative' }}>
          <div ref={mapContainer} className="h-full w-full" />
          
          {/* Location list overlay */}
          <div className="absolute top-3 left-3 w-60 max-h-80 overflow-y-auto bg-white rounded-md shadow-lg border border-gray-200">
            <div className="p-2 bg-gray-50 border-b border-gray-200 font-medium">
              {selectedLocationId ? 'Selected Location' : 'Available Locations'}
            </div>
            <div className="divide-y divide-gray-100">
              {selectedLocationId ? (
                // Show selected location
                (() => {
                  const location = bloodStorageLocations.find(loc => loc.id === selectedLocationId);
                  return location ? (
                    <div className="p-2 hover:bg-gray-50">
                      <div className="font-medium">{location.name}</div>
                      <div className="text-sm text-gray-600">Type: {location.type}</div>
                      <div className="text-sm text-gray-600">
                        Available: {location.availableTypes.join(', ')}
                      </div>
                      <Button 
                        variant="link" 
                        className="text-xs text-bloodRed-600 p-0 h-auto mt-1"
                        onClick={() => onSelectLocation(null)}
                      >
                        Clear selection
                      </Button>
                    </div>
                  ) : null;
                })()
              ) : (
                // Show filtered locations
                filteredLocations.length > 0 ? (
                  filteredLocations.map(location => (
                    <div 
                      key={location.id}
                      className="p-2 hover:bg-gray-50 cursor-pointer"
                      onClick={() => onSelectLocation(location.id)}
                    >
                      <div className="font-medium">{location.name}</div>
                      <div className="text-sm text-gray-600">Type: {location.type}</div>
                    </div>
                  ))
                ) : (
                  <div className="p-2 text-sm text-gray-500">No locations match your filters</div>
                )
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
