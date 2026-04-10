
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Copy, Eye, Code2 } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";

interface ApiEndpoint {
  method: string;
  path: string;
  description: string;
  params?: string[];
  response?: string;
  example?: string;
}

interface ApiEndpointsTableProps {
  category: string;
  endpoints: ApiEndpoint[];
}

export const ApiEndpointsTable = ({ category, endpoints }: ApiEndpointsTableProps) => {
  const [selectedEndpoint, setSelectedEndpoint] = useState<ApiEndpoint | null>(null);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  const getMethodColor = (method: string) => {
    switch (method) {
      case "GET": return "bg-green-100 text-green-800 border-green-200";
      case "POST": return "bg-blue-100 text-blue-800 border-blue-200";
      case "PUT": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "DELETE": return "bg-red-100 text-red-800 border-red-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl flex items-center gap-2">
          <Code2 className="h-5 w-5" />
          {category}
        </CardTitle>
        <CardDescription>
          Available endpoints for {category.toLowerCase()}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {endpoints.map((endpoint, index) => (
            <div key={index} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-4 flex-1">
                <Badge className={`${getMethodColor(endpoint.method)} border font-mono text-xs`}>
                  {endpoint.method}
                </Badge>
                <code className="text-sm bg-gray-100 px-3 py-1 rounded font-mono border">
                  {endpoint.path}
                </code>
                <span className="text-sm text-gray-600 flex-1">{endpoint.description}</span>
              </div>
              <div className="flex items-center gap-2">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => setSelectedEndpoint(endpoint)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-2">
                        <Badge className={getMethodColor(endpoint.method)}>
                          {endpoint.method}
                        </Badge>
                        <code className="text-sm">{endpoint.path}</code>
                      </DialogTitle>
                      <DialogDescription>
                        {endpoint.description}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      {endpoint.params && (
                        <div>
                          <h4 className="font-medium mb-2">Parameters:</h4>
                          <div className="flex flex-wrap gap-2">
                            {endpoint.params.map((param, i) => (
                              <Badge key={i} variant="secondary">{param}</Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      {endpoint.example && (
                        <div>
                          <h4 className="font-medium mb-2">Example:</h4>
                          <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
                            <code>{endpoint.example}</code>
                          </pre>
                        </div>
                      )}
                      {endpoint.response && (
                        <div>
                          <h4 className="font-medium mb-2">Response:</h4>
                          <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
                            <code>{endpoint.response}</code>
                          </pre>
                        </div>
                      )}
                    </div>
                  </DialogContent>
                </Dialog>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => copyToClipboard(endpoint.path)}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
