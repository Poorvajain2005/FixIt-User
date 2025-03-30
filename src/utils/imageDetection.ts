
import { pipeline, env } from '@huggingface/transformers';

// Configure transformers.js to use browser cache
env.allowLocalModels = false;
env.useBrowserCache = true;

// Map classification labels to our issue types
const labelToIssueTypeMap: Record<string, string> = {
  // Animals
  dog: "Injured Street Animals",
  cat: "Injured Street Animals",
  animal: "Injured Street Animals",
  pet: "Injured Street Animals",
  
  // Traffic related
  traffic: "Faulty Traffic Lights",
  light: "Faulty Traffic Lights",
  signal: "Faulty Traffic Lights",
  
  // Water related
  water: "Water Leakage",
  leak: "Water Leakage",
  pipe: "Water Leakage",
  
  // Sewage related
  sewage: "Sewage Issues",
  drain: "Sewage Issues",
  sewer: "Sewage Issues",
  
  // Streetlight related
  streetlight: "Streetlights Not Working",
  lamp: "Streetlights Not Working",
  street_light: "Streetlights Not Working",
  
  // Road related
  pothole: "Potholes on Roads",
  road: "Potholes on Roads",
  asphalt: "Potholes on Roads",
  
  // Garbage related
  garbage: "Garbage & Waste",
  waste: "Garbage & Waste",
  trash: "Garbage & Waste",
  litter: "Garbage & Waste",
  rubbish: "Garbage & Waste",
};

// Initialize image classification model
let classifierPromise: Promise<any> | null = null;

const initializeClassifier = () => {
  if (!classifierPromise) {
    classifierPromise = pipeline(
      'image-classification', 
      'Xenova/mobilenet_v2',  // Use a simple and fast model that works in browser
      { quantized: true }     // Use quantized model for better performance
    ).catch(error => {
      console.error('Error initializing image classifier:', error);
      // Reset to allow retry
      classifierPromise = null;
      throw error;
    });
  }
  return classifierPromise;
};

// Convert File to image URL
const fileToImageUrl = (file: File): Promise<string> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        resolve(e.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  });
};

// Detect issue based on image
export const detectIssueFromImage = async (imageFile: File): Promise<string | null> => {
  try {
    const classifier = await initializeClassifier();
    const imageUrl = await fileToImageUrl(imageFile);
    
    // Classify the image
    const results = await classifier(imageUrl);
    console.log("Image classification results:", results);
    
    if (!results || !Array.isArray(results) || results.length === 0) {
      return null;
    }
    
    // Check for relevant labels in the top predictions
    for (const prediction of results) {
      const label = prediction.label.toLowerCase();
      
      // Search for keywords in the label
      for (const [keyword, issueType] of Object.entries(labelToIssueTypeMap)) {
        if (label.includes(keyword)) {
          return issueType;
        }
      }
    }
    
    return null;
  } catch (error) {
    console.error('Error detecting issue from image:', error);
    return null;
  }
};
