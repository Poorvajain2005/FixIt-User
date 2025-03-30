
import { useState, useRef } from 'react';
import { Camera, StopCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from 'react-router-dom';
import { useIssues } from "@/context/IssueContext";
import { useToast } from "@/hooks/use-toast";
import { detectIssueFromImage } from "@/utils/imageDetection";

const CameraDetection = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const navigate = useNavigate();
  const { setSelectedIssueType } = useIssues();
  const { toast } = useToast();
  
  const openCamera = async () => {
    setIsOpen(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setIsCapturing(true);
      }
    } catch (error) {
      console.error("Error accessing camera:", error);
      toast({
        title: "Camera Error",
        description: "Could not access your camera. Please check permissions.",
        variant: "destructive"
      });
      setIsOpen(false);
    }
  };
  
  const closeCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCapturing(false);
    setIsOpen(false);
  };
  
  const captureImage = async () => {
    if (!videoRef.current || !canvasRef.current) return;
    
    setIsProcessing(true);
    
    try {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      // Set canvas dimensions to match video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      // Draw video frame to canvas
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error("Could not get canvas context");
      
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      // Convert to blob
      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((blob) => {
          if (blob) resolve(blob);
          else throw new Error("Could not create image blob");
        }, 'image/jpeg', 0.95);
      });
      
      // Convert blob to File
      const file = new File([blob], "camera-capture.jpg", { type: "image/jpeg" });
      
      // Detect issue from image
      const detectedType = await detectIssueFromImage(file);
      
      if (detectedType) {
        toast({
          title: "Issue Detected!",
          description: `Detected: ${detectedType}`,
        });
        
        setSelectedIssueType(detectedType);
        closeCamera();
        navigate('/report');
      } else {
        toast({
          title: "No Issue Detected",
          description: "Could not identify any specific issue. Please try again or report manually.",
        });
      }
    } catch (error) {
      console.error("Error capturing image:", error);
      toast({
        title: "Capture Error",
        description: "Failed to process the image. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };
  
  return (
    <div className="relative">
      <Button 
        variant="outline" 
        className="bg-blue-600/80 hover:bg-blue-700 text-white rounded-full h-14 w-14 p-0"
        onClick={isOpen ? closeCamera : openCamera}
      >
        <Camera size={24} />
      </Button>
      
      {isOpen && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black">
          <div className="relative w-full max-w-lg">
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline 
              className="w-full rounded-lg" 
            />
            <canvas ref={canvasRef} className="hidden" />
            
            <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-4">
              {isCapturing && !isProcessing && (
                <Button 
                  variant="outline" 
                  className="bg-red-500 hover:bg-red-600 text-white rounded-full h-14 w-14 p-0"
                  onClick={captureImage}
                >
                  <StopCircle size={24} />
                </Button>
              )}
              
              {isProcessing && (
                <Button 
                  variant="outline" 
                  className="bg-gray-500 text-white rounded-full h-14 w-14 p-0"
                  disabled
                >
                  <Loader2 size={24} className="animate-spin" />
                </Button>
              )}
              
              <Button 
                variant="outline" 
                className="bg-gray-700 hover:bg-gray-800 text-white rounded-full h-14 w-14 p-0"
                onClick={closeCamera}
              >
                <span className="text-lg">✕</span>
              </Button>
            </div>
          </div>
          
          <div className="mt-4 text-center text-white">
            <p>Point camera at the city issue to detect automatically</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default CameraDetection;
