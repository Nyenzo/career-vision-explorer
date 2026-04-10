
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, FileText, Code, Database } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { DocumentationViewer } from "./DocumentationViewer";

interface ApiDocumentationCardProps {
  title: string;
  description: string;
  features: string[];
  docPath: string;
  icon: React.ComponentType<any>;
  color: string;
}

export const ApiDocumentationCard = ({ 
  title, 
  description, 
  features, 
  docPath, 
  icon: Icon,
  color 
}: ApiDocumentationCardProps) => {
  const [isDocViewerOpen, setIsDocViewerOpen] = useState(false);

  const handleViewDocs = () => {
    setIsDocViewerOpen(true);
  };

  return (
    <>
      <Card className="h-full border-l-4 hover:shadow-lg transition-all duration-200" style={{ borderLeftColor: color }}>
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg" style={{ backgroundColor: `${color}15` }}>
              <Icon className="h-6 w-6" style={{ color }} />
            </div>
            <div>
              <CardTitle className="text-xl">{title}</CardTitle>
              <CardDescription className="text-sm mt-1">{description}</CardDescription>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-medium text-sm text-gray-700 mb-3">Key Features:</h4>
            <div className="flex flex-wrap gap-2">
              {features.map((feature, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {feature}
                </Badge>
              ))}
            </div>
          </div>
          
          <Separator />
          
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <FileText className="h-4 w-4" />
              <span>Comprehensive documentation</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Code className="h-4 w-4" />
              <span>Code examples & snippets</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Database className="h-4 w-4" />
              <span>Request/Response schemas</span>
            </div>
          </div>
          
          <Button 
            onClick={handleViewDocs}
            className="w-full"
            style={{ backgroundColor: color }}
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            View Documentation
          </Button>
        </CardContent>
      </Card>

      <DocumentationViewer
        isOpen={isDocViewerOpen}
        onClose={() => setIsDocViewerOpen(false)}
        docPath={docPath}
        title={title}
        color={color}
      />
    </>
  );
};
