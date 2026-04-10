
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Copy, ExternalLink, X, FileText, Code, Database } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface DocumentationViewerProps {
  isOpen: boolean;
  onClose: () => void;
  docPath: string;
  title: string;
  color: string;
}

interface DocSection {
  title: string;
  content: string;
  type: 'text' | 'code' | 'endpoint';
}

export const DocumentationViewer = ({ isOpen, onClose, docPath, title, color }: DocumentationViewerProps) => {
  const [docContent, setDocContent] = useState<DocSection[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen && docPath) {
      loadDocumentation();
    }
  }, [isOpen, docPath]);

  const loadDocumentation = async () => {
    setLoading(true);
    try {
      // Simulate loading documentation content
      // In a real app, you would fetch from the actual file
      const content = await simulateDocFetch(docPath);
      setDocContent(content);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load documentation",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const simulateDocFetch = async (path: string): Promise<DocSection[]> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    if (path.includes('website-api')) {
      return [
        {
          title: "Overview",
          type: "text",
          content: "This document describes the frontend API layer for the Career Vision Explorer website. All APIs are mock implementations for frontend-only functionality."
        },
        {
          title: "Base Configuration",
          type: "code",
          content: `Base URL: /api
Response Format: JSON
Authentication: Token-based (simulated)
Rate Limiting: Not implemented (frontend-only)`
        },
        {
          title: "Authentication",
          type: "code",
          content: `headers: {
  'Authorization': 'Bearer <token>',
  'Content-Type': 'application/json'
}`
        },
        {
          title: "Jobs API - Search Jobs",
          type: "endpoint",
          content: `GET /api/jobs

Parameters:
- query (string): Job title, company, or keywords
- location (string): Job location
- type (string): "Full-time", "Part-time", "Contract", etc.
- experienceLevel (string): "Entry", "Mid", "Senior", "Executive"
- skills (array): Required skills
- salaryMin (number): Minimum salary
- salaryMax (number): Maximum salary
- page (number): Page number (default: 1)
- limit (number): Results per page (default: 10)`
        },
        {
          title: "Example Usage",
          type: "code",
          content: `import { JobsApi } from '@/api/jobs-api';

const results = await JobsApi.searchJobs({
  query: 'frontend developer',
  location: 'Nairobi',
  experienceLevel: 'Mid',
  page: 1,
  limit: 20
});`
        }
      ];
    } else if (path.includes('mobile-api')) {
      return [
        {
          title: "Overview",
          type: "text",
          content: "This document describes the mobile-specific API endpoints for the Career Vision Explorer mobile application built with Capacitor."
        },
        {
          title: "Mobile-Specific Features",
          type: "text",
          content: "• Offline Support: Data synchronization and offline storage\n• Push Notifications: Real-time notifications for job updates\n• Biometric Authentication: Fingerprint/Face ID login\n• Background Sync: Automatic data synchronization\n• App Updates: Over-the-air update checking"
        },
        {
          title: "App Configuration",
          type: "endpoint",
          content: `GET /api/mobile/config

Get mobile app configuration and feature flags.

Response:
{
  "appVersion": "1.0.0",
  "apiVersion": "v1",
  "features": ["offline_mode", "push_notifications"],
  "maintenanceMode": false
}`
        },
        {
          title: "Push Notifications - Register Device",
          type: "endpoint",
          content: `POST /api/mobile/notifications/register

Register device for push notifications.

Request Body:
{
  "deviceToken": "device_token_here",
  "platform": "ios" | "android",
  "userId": "user_id"
}`
        },
        {
          title: "Capacitor Integration",
          type: "code",
          content: `import { PushNotifications } from '@capacitor/push-notifications';

// Request permission
await PushNotifications.requestPermissions();

// Register for notifications
await PushNotifications.register();

// Listen for registration
PushNotifications.addListener('registration', (token) => {
  MobileApi.registerForPushNotifications(token.value);
});`
        }
      ];
    } else {
      return [
        {
          title: "Integration Guide",
          type: "text",
          content: "Step-by-step guide for integrating APIs into your applications using modern React patterns and best practices."
        },
        {
          title: "Installation & Setup",
          type: "code",
          content: `npm install @tanstack/react-query zustand
# or
yarn add @tanstack/react-query zustand`
        },
        {
          title: "API Service Setup",
          type: "code",
          content: `// api/base.ts
export const API_BASE_URL = '/api';

export const apiClient = {
  get: async (url: string) => {
    const response = await fetch(\`\${API_BASE_URL}\${url}\`);
    return response.json();
  },
  post: async (url: string, data: any) => {
    const response = await fetch(\`\${API_BASE_URL}\${url}\`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return response.json();
  }
};`
        },
        {
          title: "React Query Integration",
          type: "code",
          content: `import { useQuery } from '@tanstack/react-query';

export const useJobs = (filters: JobFilters) => {
  return useQuery({
    queryKey: ['jobs', filters],
    queryFn: () => JobsApi.searchJobs(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};`
        }
      ];
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied",
      description: "Code copied to clipboard",
    });
  };

  const renderSection = (section: DocSection, index: number) => {
    const getSectionIcon = () => {
      switch (section.type) {
        case 'code':
          return <Code className="h-4 w-4" />;
        case 'endpoint':
          return <Database className="h-4 w-4" />;
        default:
          return <FileText className="h-4 w-4" />;
      }
    };

    return (
      <div key={index} className="space-y-3">
        <div className="flex items-center gap-2">
          {getSectionIcon()}
          <h3 className="font-semibold text-lg">{section.title}</h3>
          <Badge variant="secondary" className="text-xs">
            {section.type}
          </Badge>
        </div>
        
        {section.type === 'code' || section.type === 'endpoint' ? (
          <div className="relative">
            <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
              <code>{section.content}</code>
            </pre>
            <Button
              size="sm"
              variant="ghost"
              className="absolute top-2 right-2 text-gray-400 hover:text-white"
              onClick={() => copyToClipboard(section.content)}
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div className="prose prose-sm max-w-none">
            <p className="text-gray-700 leading-relaxed whitespace-pre-line">
              {section.content}
            </p>
          </div>
        )}
        
        {index < docContent.length - 1 && <Separator className="my-6" />}
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[80vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg" style={{ backgroundColor: `${color}15` }}>
                <FileText className="h-5 w-5" style={{ color }} />
              </div>
              <div>
                <DialogTitle className="text-xl">{title}</DialogTitle>
                <p className="text-sm text-gray-600 mt-1">
                  Documentation Path: {docPath}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => window.open(docPath, '_blank')}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Open in New Tab
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={onClose}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>
        
        <div className="flex-1 overflow-hidden">
          <ScrollArea className="h-full pr-4">
            <div className="space-y-6 pb-6">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: color }}></div>
                  <span className="ml-3 text-gray-600">Loading documentation...</span>
                </div>
              ) : (
                docContent.map((section, index) => renderSection(section, index))
              )}
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
};
