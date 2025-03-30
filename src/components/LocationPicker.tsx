
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface LocationPickerProps {
  onSelect: (address: string, coordinates: { lat: number; lng: number }) => void;
  initialLocation?: { lat: number; lng: number } | null;
}

const LocationPicker = ({ onSelect, initialLocation }: LocationPickerProps) => {
  const [address, setAddress] = useState<string>('');
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number }>(
    initialLocation || { lat: 0, lng: 0 }
  );

  // Simple manual location entry instead of map
  const handleLatChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const lat = parseFloat(e.target.value) || 0;
    setCoordinates(prev => ({ ...prev, lat }));
  };

  const handleLngChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const lng = parseFloat(e.target.value) || 0;
    setCoordinates(prev => ({ ...prev, lng }));
  };

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAddress(e.target.value);
  };

  const handleConfirm = () => {
    if (address) {
      onSelect(address, coordinates);
    }
  };

  return (
    <Card className="p-4 mt-2">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="address">Address</Label>
          <Input
            id="address"
            value={address}
            onChange={handleAddressChange}
            placeholder="Enter location address"
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-2">
            <Label htmlFor="latitude">Latitude</Label>
            <Input
              id="latitude"
              type="number"
              step="0.000001"
              value={coordinates.lat}
              onChange={handleLatChange}
              placeholder="Latitude"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="longitude">Longitude</Label>
            <Input
              id="longitude"
              type="number"
              step="0.000001"
              value={coordinates.lng}
              onChange={handleLngChange}
              placeholder="Longitude"
            />
          </div>
        </div>

        <div className="text-sm text-muted-foreground">
          <p>Enter the address and coordinates for your location.</p>
        </div>

        <div className="flex justify-end">
          <Button
            variant="default"
            onClick={handleConfirm}
            disabled={!address}
          >
            Confirm Location
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default LocationPicker;
