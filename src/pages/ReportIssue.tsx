
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useIssues } from "@/context/IssueContext";
import { MapPin, Loader2, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import LocationPicker from "@/components/LocationPicker";

const issueTypes = [
  "Injured Street Animals",
  "Faulty Traffic Lights",
  "Water Leakage",
  "Sewage Issues",
  "Streetlights Not Working",
  "Potholes on Roads",
  "Garbage & Waste",
  "Other",
];

const ReportIssue = () => {
  const navigate = useNavigate();
  const { addIssue } = useIssues();
  const { toast } = useToast();
  const [type, setType] = useState<string>("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number } | null>(null);
  const [showMap, setShowMap] = useState(false);

  const detectLocation = () => {
    setIsLocating(true);
    if (!navigator.geolocation) {
      toast({
        title: "Error",
        description: "Geolocation is not supported by your browser",
        variant: "destructive",
      });
      setIsLocating(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setCoordinates({ lat: latitude, lng: longitude });
        
        try {
          // Reverse geocoding to get address from coordinates
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
          );
          const data = await response.json();
          
          if (data && data.display_name) {
            setLocation(data.display_name);
          } else {
            setLocation(`${latitude.toFixed(6)}, ${longitude.toFixed(6)}`);
          }
        } catch (error) {
          console.error("Error getting location name:", error);
          setLocation(`${latitude.toFixed(6)}, ${longitude.toFixed(6)}`);
        }
        
        setIsLocating(false);
      },
      (error) => {
        console.error("Error getting location:", error);
        toast({
          title: "Location Error",
          description: `Could not get your location: ${error.message}`,
          variant: "destructive",
        });
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!type || !description || !location) {
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      addIssue({
        type,
        description,
        location,
        coordinates: coordinates || undefined,
      });
      
      navigate("/my-issues");
    } catch (error) {
      console.error("Error submitting issue:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMapLocationSelect = (address: string, coords: { lat: number; lng: number }) => {
    setLocation(address);
    setCoordinates(coords);
    setShowMap(false);
  };

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-white">Report an Issue</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Submit New Issue</CardTitle>
          <CardDescription>
            Fill out the form below to report a city issue
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="issueType">Issue Type</Label>
              <Select
                value={type}
                onValueChange={setType}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select issue type" />
                </SelectTrigger>
                <SelectContent>
                  {issueTypes.map((issueType) => (
                    <SelectItem key={issueType} value={issueType}>
                      {issueType}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <div className="flex gap-2">
                <div className="relative flex-grow">
                  <Input
                    id="location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Enter the location address or description"
                    required
                    className="pr-10"
                  />
                  <Button 
                    type="button" 
                    size="icon"
                    variant="ghost"
                    className="absolute right-1 top-1/2 transform -translate-y-1/2"
                    onClick={() => setShowMap(!showMap)}
                  >
                    <MapPin className="h-4 w-4" />
                  </Button>
                </div>
                <Button
                  type="button"
                  onClick={detectLocation}
                  variant="outline"
                  disabled={isLocating}
                  className="shrink-0"
                >
                  {isLocating ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-1" />
                  ) : (
                    <RefreshCw className="h-4 w-4 mr-1" />
                  )}
                  Detect
                </Button>
              </div>
              {showMap && (
                <LocationPicker
                  onSelect={handleMapLocationSelect}
                  initialLocation={coordinates}
                />
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Please provide details about the issue"
                className="min-h-[120px]"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="image">Image (Optional)</Label>
              <Input
                id="image"
                type="file"
                accept="image/*"
              />
              <p className="text-xs text-gray-500">
                Adding images helps authorities better understand the issue
              </p>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button 
              type="button" 
              variant="outline"
              onClick={() => navigate(-1)}
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              disabled={isSubmitting || !type || !description || !location}
            >
              {isSubmitting ? "Submitting..." : "Submit Report"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default ReportIssue;
