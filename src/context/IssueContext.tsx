
import React, { createContext, useState, useContext, useEffect } from "react";
import { useAuth } from "./AuthContext";
import { toast } from "@/components/ui/use-toast";

export type IssueStatus = "pending" | "in-progress" | "resolved";

export interface Issue {
  id: string;
  type: string;
  description: string;
  location: string;
  userId: string;
  userName: string;
  createdAt: Date;
  status: IssueStatus;
  progress: number;
  coordinates?: { lat: number; lng: number };
}

interface IssueContextType {
  issues: Issue[];
  userIssues: Issue[];
  addIssue: (issueData: Omit<Issue, "id" | "userId" | "userName" | "createdAt" | "status" | "progress">) => void;
  updateIssueStatus: (issueId: string, status: IssueStatus, progress: number) => void;
  selectedIssueType: string;
  setSelectedIssueType: (type: string) => void;
}

const IssueContext = createContext<IssueContextType | undefined>(undefined);

export const useIssues = () => {
  const context = useContext(IssueContext);
  if (!context) {
    throw new Error("useIssues must be used within an IssueProvider");
  }
  return context;
};

export const IssueProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [selectedIssueType, setSelectedIssueType] = useState<string>("");
  const { user } = useAuth();

  useEffect(() => {
    // Load issues from localStorage
    const storedIssues = localStorage.getItem("issues");
    if (storedIssues) {
      // Convert string dates back to Date objects
      const parsedIssues = JSON.parse(storedIssues).map((issue: any) => ({
        ...issue,
        createdAt: new Date(issue.createdAt),
      }));
      setIssues(parsedIssues);
    }
  }, []);

  // Save issues to localStorage whenever they change
  useEffect(() => {
    if (issues.length > 0) {
      localStorage.setItem("issues", JSON.stringify(issues));
    }
  }, [issues]);

  const addIssue = (issueData: Omit<Issue, "id" | "userId" | "userName" | "createdAt" | "status" | "progress">) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to report an issue",
        variant: "destructive",
      });
      return;
    }

    const newIssue: Issue = {
      ...issueData,
      id: Math.random().toString(36).substring(2),
      userId: user.id,
      userName: user.name,
      createdAt: new Date(),
      status: "pending",
      progress: 0,
    };

    setIssues((prevIssues) => [...prevIssues, newIssue]);
    
    toast({
      title: "Issue reported",
      description: "Your issue has been submitted successfully",
    });
  };

  const updateIssueStatus = (issueId: string, status: IssueStatus, progress: number) => {
    setIssues((prevIssues) =>
      prevIssues.map((issue) =>
        issue.id === issueId ? { ...issue, status, progress } : issue
      )
    );
    
    toast({
      title: "Status updated",
      description: `Issue status changed to ${status}`,
    });
  };

  // Filter issues for the current user
  const userIssues = user 
    ? issues.filter((issue) => issue.userId === user.id)
    : [];

  return (
    <IssueContext.Provider
      value={{
        issues,
        userIssues,
        addIssue,
        updateIssueStatus,
        selectedIssueType,
        setSelectedIssueType,
      }}
    >
      {children}
    </IssueContext.Provider>
  );
};
