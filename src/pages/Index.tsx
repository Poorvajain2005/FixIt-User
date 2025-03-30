
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import IssueCard from "@/components/IssueCard";
import { useAuth } from "@/context/AuthContext";
import { useIssues } from "@/context/IssueContext";
import CameraDetection from "@/components/CameraDetection";

const Index = () => {
  const { isAuthenticated } = useAuth();
  const { setSelectedIssueType } = useIssues();
  const navigate = useNavigate();
  
  const issueTypes = [
    {
      icon: "🐕",
      title: "Injured Street Animals",
      description: "Report injured animals for rescue.",
    },
    {
      icon: "🚦",
      title: "Faulty Traffic Lights",
      description: "Alert authorities about non-working signals.",
    },
    {
      icon: "💧",
      title: "Water Leakage",
      description: "Detect and prevent water wastage.",
    },
    {
      icon: "🧪",
      title: "Sewage Issues",
      description: "Fix blocked or leaking sewage systems.",
    },
    {
      icon: "🏮",
      title: "Streetlights Not Working",
      description: "Report dark streets due to broken lights.",
    },
    {
      icon: "🚧",
      title: "Potholes on Roads",
      description: "Alert about dangerous potholes on roads.",
    },
    {
      icon: "🗑️",
      title: "Garbage & Waste",
      description: "Report overflowing garbage bins.",
    }
  ];

  const handleIssueCardClick = (issueTitle: string) => {
    setSelectedIssueType(issueTitle);
    navigate(isAuthenticated ? "/report" : "/login");
  };

  return (
    <div className="max-w-6xl mx-auto">
      <section className="text-center text-white py-10">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          <span className="mr-2">🏙️</span> Smart City Issue Detection <span className="ml-2">🚀</span>
        </h1>
        <p className="text-xl mb-8">
          Detect and report real-time city problems to make our community better.
        </p>
        
        {isAuthenticated && (
          <div className="flex flex-col items-center mb-8">
            <div className="bg-blue-900/40 backdrop-blur-sm rounded-lg p-3 shadow-lg">
              <CameraDetection />
            </div>
            <p className="text-sm text-blue-300 mt-2 animate-pulse">
              Use camera or upload from gallery to detect issues
            </p>
          </div>
        )}
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {issueTypes.map((issue, index) => (
          <div key={index} onClick={() => handleIssueCardClick(issue.title)}>
            <IssueCard
              icon={issue.icon}
              title={issue.title}
              description={issue.description}
              path="#"
            />
          </div>
        ))}
      </section>

      <section className="mt-12 text-center">
        <Button 
          className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-6 text-lg"
          onClick={() => navigate(isAuthenticated ? "/report" : "/login")}
        >
          📝 Report an Issue
        </Button>
      </section>
    </div>
  );
};

export default Index;
