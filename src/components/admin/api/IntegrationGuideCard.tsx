
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Code, BookOpen, Lightbulb, CheckCircle, ArrowRight } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { DocumentationViewer } from "./DocumentationViewer";

export const IntegrationGuideCard = () => {
  const [isDocViewerOpen, setIsDocViewerOpen] = useState(false);
  
  const integrationSteps = [
    {
      title: "Installation & Setup",
      description: "Import API services and configure your project",
      status: "ready"
    },
    {
      title: "Authentication",
      description: "Set up token-based authentication",
      status: "ready"
    },
    {
      title: "Error Handling",
      description: "Implement robust error handling patterns",
      status: "ready"
    },
    {
      title: "State Management",
      description: "Integrate with React Query or Zustand",
      status: "ready"
    },
    {
      title: "Testing",
      description: "Add unit tests and API mocking",
      status: "ready"
    }
  ];

  const technologies = [
    "React Hooks",
    "TypeScript",
    "React Query",
    "Zustand",
    "Error Boundaries",
    "Testing Library"
  ];

  const handleViewGuide = () => {
    setIsDocViewerOpen(true);
  };

  return (
    <>
      <Card className="h-full border-l-4 border-l-purple-500">
        <CardHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-purple-50">
              <BookOpen className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <CardTitle className="text-xl flex items-center gap-2">
                Integration Guide
                <Badge variant="secondary" className="text-xs bg-purple-100 text-purple-700">
                  Complete
                </Badge>
              </CardTitle>
              <CardDescription>
                Step-by-step guide for integrating APIs into your applications
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div>
            <h4 className="font-medium text-sm text-gray-700 mb-3 flex items-center gap-2">
              <Lightbulb className="h-4 w-4" />
              What you'll learn:
            </h4>
            <div className="space-y-2">
              {integrationSteps.map((step, index) => (
                <div key={index} className="flex items-center gap-3 p-2 rounded-lg bg-gray-50">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <div className="flex-1">
                    <span className="text-sm font-medium">{step.title}</span>
                    <p className="text-xs text-gray-600">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <Separator />
          
          <div>
            <h4 className="font-medium text-sm text-gray-700 mb-3">Technologies Covered:</h4>
            <div className="flex flex-wrap gap-2">
              {technologies.map((tech, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {tech}
                </Badge>
              ))}
            </div>
          </div>
          
          <Separator />
          
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Code className="h-4 w-4" />
              <span>Complete code examples</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <CheckCircle className="h-4 w-4" />
              <span>Best practices & patterns</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <ArrowRight className="h-4 w-4" />
              <span>Migration strategies</span>
            </div>
          </div>
          
          <Button 
            onClick={handleViewGuide}
            className="w-full bg-purple-600 hover:bg-purple-700"
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            View Integration Guide
          </Button>
        </CardContent>
      </Card>

      <DocumentationViewer
        isOpen={isDocViewerOpen}
        onClose={() => setIsDocViewerOpen(false)}
        docPath="/docs/api-integration-guide.md"
        title="Integration Guide"
        color="#9333ea"
      />
    </>
  );
};
