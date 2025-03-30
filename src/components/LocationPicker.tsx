
import { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

interface LocationPickerProps {
  onSelect: (address: string, coordinates: { lat: number; lng: number }) => void;
  initialLocation?: { lat: number; lng: number } | null;
}

const LocationPicker = ({ onSelect, initialLocation }: LocationPickerProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [marker, setMarker] = useState<google.maps.Marker | null>(null);
  const [loading, setLoading] = useState(true);
  const [apiLoaded, setApiLoaded] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<{
    address: string;
    coordinates: { lat: number; lng: number };
  } | null>(null);
  
  const { toast } = useToast();

  useEffect(() => {
    // Load Google Maps API
    const loadGoogleMapsApi = () => {
      if (!window.google || !window.google.maps) {
        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=&libraries=places`;
        script.async = true;
        script.defer = true;
        script.onload = initMap;
        document.head.appendChild(script);
      } else {
        initMap();
      }
    };

    const initMap = () => {
      setApiLoaded(true);
      if (mapRef.current) {
        try {
          // Default to a central location if no initial location is provided
          const defaultLocation = initialLocation || 
            { lat: 40.7128, lng: -74.0060 }; // New York City default
          
          const mapInstance = new window.google.maps.Map(mapRef.current, {
            zoom: 13,
            center: defaultLocation,
            mapTypeControl: false,
            streetViewControl: false,
            fullscreenControl: false
          });

          const markerInstance = new window.google.maps.Marker({
            position: defaultLocation,
            map: mapInstance,
            draggable: true,
          });

          // Reverse geocode initial position
          if (initialLocation) {
            reverseGeocode(initialLocation);
          }

          // Set up click listener for the map
          mapInstance.addListener('click', (e: google.maps.MapMouseEvent) => {
            const position = e.latLng;
            if (position) {
              markerInstance.setPosition(position);
              const coords = { 
                lat: position.lat(), 
                lng: position.lng() 
              };
              reverseGeocode(coords);
            }
          });

          // Handle marker drag end
          markerInstance.addListener('dragend', () => {
            const position = markerInstance.getPosition();
            if (position) {
              const coords = { 
                lat: position.lat(), 
                lng: position.lng() 
              };
              reverseGeocode(coords);
            }
          });

          setMap(mapInstance);
          setMarker(markerInstance);
          setLoading(false);
        } catch (error) {
          console.error("Error initializing map:", error);
          toast({
            title: "Map Error",
            description: "Could not initialize the map. Using fallback method.",
            variant: "destructive",
          });
          setLoading(false);
          // Use OpenStreetMap fallback if Google Maps fails
          initFallbackMap();
        }
      }
    };

    const initFallbackMap = () => {
      // For the fallback, we'll just use a simple input form
      setLoading(false);
    };

    loadGoogleMapsApi();

    return () => {
      // Cleanup
      if (map) {
        window.google?.maps.event.clearInstanceListeners(map);
      }
      if (marker) {
        window.google?.maps.event.clearInstanceListeners(marker);
      }
    };
  }, [initialLocation]);

  const reverseGeocode = async (coords: { lat: number; lng: number }) => {
    try {
      if (window.google && window.google.maps) {
        const geocoder = new window.google.maps.Geocoder();
        geocoder.geocode({ location: coords }, (results, status) => {
          if (status === 'OK' && results && results[0]) {
            setSelectedLocation({
              address: results[0].formatted_address,
              coordinates: coords
            });
          } else {
            // If Google geocoding fails, try with OpenStreetMap
            fallbackReverseGeocode(coords);
          }
        });
      } else {
        // If Google Maps isn't available, use OpenStreetMap
        fallbackReverseGeocode(coords);
      }
    } catch (error) {
      console.error("Error reverse geocoding:", error);
      fallbackReverseGeocode(coords);
    }
  };

  const fallbackReverseGeocode = async (coords: { lat: number; lng: number }) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${coords.lat}&lon=${coords.lng}&zoom=18&addressdetails=1`
      );
      const data = await response.json();
      
      if (data && data.display_name) {
        setSelectedLocation({
          address: data.display_name,
          coordinates: coords
        });
      } else {
        // If all else fails, just use the coordinates
        setSelectedLocation({
          address: `${coords.lat.toFixed(6)}, ${coords.lng.toFixed(6)}`,
          coordinates: coords
        });
      }
    } catch (error) {
      console.error("Fallback geocoding error:", error);
      // Last resort - just use coordinates
      setSelectedLocation({
        address: `${coords.lat.toFixed(6)}, ${coords.lng.toFixed(6)}`,
        coordinates: coords
      });
    }
  };

  const handleConfirm = () => {
    if (selectedLocation) {
      onSelect(selectedLocation.address, selectedLocation.coordinates);
    }
  };

  if (loading) {
    return (
      <Card className="p-6 mt-2 flex items-center justify-center h-[300px]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
          <p>Loading map...</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="mt-2 overflow-hidden">
      {apiLoaded ? (
        <>
          <div 
            ref={mapRef} 
            className="h-[300px] w-full" 
          />
          <div className="p-3 bg-muted/20 border-t">
            <div className="mb-2 text-sm">
              {selectedLocation ? (
                <p className="truncate">Selected: {selectedLocation.address}</p>
              ) : (
                <p>Click on the map to select a location</p>
              )}
            </div>
            <div className="flex justify-end">
              <Button
                variant="default"
                onClick={handleConfirm}
                disabled={!selectedLocation}
                className="ml-2"
              >
                Confirm Location
              </Button>
            </div>
          </div>
        </>
      ) : (
        <div className="p-4">
          <p className="mb-2">
            Map could not be loaded. Please enter your location manually or try again later.
          </p>
        </div>
      )}
    </Card>
  );
};

export default LocationPicker;
