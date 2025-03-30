
import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useIssues, IssueStatus } from "@/context/IssueContext";
import { format } from "date-fns";

const statusColors = {
  "pending": "bg-yellow-100 text-yellow-800 border-yellow-200",
  "in-progress": "bg-blue-100 text-blue-800 border-blue-200",
  "resolved": "bg-green-100 text-green-800 border-green-200",
};

const MyIssues = () => {
  const { userIssues, updateIssueStatus } = useIssues();
  const [activeTab, setActiveTab] = useState<string>("all");

  const filteredIssues = userIssues.filter(issue => {
    if (activeTab === "all") return true;
    return issue.status === activeTab;
  }).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

  const getProgressStep = (status: IssueStatus): number => {
    switch (status) {
      case "pending": return 0;
      case "in-progress": return 50;
      case "resolved": return 100;
      default: return 0;
    }
  };

  const handleUpdateStatus = (issueId: string, newStatus: IssueStatus) => {
    updateIssueStatus(issueId, newStatus, getProgressStep(newStatus));
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <h1 className="text-3xl font-bold text-white">My Issues</h1>
        <Link to="/report">
          <Button className="mt-2 sm:mt-0">Report New Issue</Button>
        </Link>
      </div>

      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-white mb-6">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="in-progress">In Progress</TabsTrigger>
          <TabsTrigger value="resolved">Resolved</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-0">
          {filteredIssues.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center">
                <p>No issues found in this category.</p>
                <Link to="/report" className="mt-4 inline-block">
                  <Button>Report an Issue</Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredIssues.map((issue) => (
                <Card key={issue.id}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>{issue.type}</CardTitle>
                        <CardDescription>
                          Reported on {format(issue.createdAt, "MMM d, yyyy")}
                        </CardDescription>
                      </div>
                      <Badge className={statusColors[issue.status]}>
                        {issue.status === "in-progress" ? "In Progress" : issue.status.charAt(0).toUpperCase() + issue.status.slice(1)}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div>
                        <p className="font-medium">Location</p>
                        <p className="text-gray-600">{issue.location}</p>
                      </div>
                      <div>
                        <p className="font-medium">Description</p>
                        <p className="text-gray-600">{issue.description}</p>
                      </div>
                      <div>
                        <p className="font-medium">Progress</p>
                        <Progress value={issue.progress} className="mt-2" />
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between pt-2">
                    {issue.status !== "resolved" && (
                      <div className="flex gap-2">
                        {issue.status === "pending" && (
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleUpdateStatus(issue.id, "in-progress")}
                          >
                            Mark In Progress
                          </Button>
                        )}
                        <Button 
                          size="sm"
                          onClick={() => handleUpdateStatus(issue.id, "resolved")}
                        >
                          Mark Resolved
                        </Button>
                      </div>
                    )}
                    {issue.status === "resolved" && (
                      <span className="text-green-600 font-medium">✓ Issue resolved</span>
                    )}
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MyIssues;
