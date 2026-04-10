
import { TabsContent } from "@/components/ui/tabs";
import { Book, Smartphone } from "lucide-react";
import { ApiDocumentationCard } from "./ApiDocumentationCard";
import { ApiEndpointsTable } from "./ApiEndpointsTable";
import { IntegrationGuideCard } from "./IntegrationGuideCard";
import { apiEndpoints, mobileEndpoints } from "@/data/api-endpoints";

export const ApiTabsContent = () => {
  return (
    <>
      <TabsContent value="endpoints" className="space-y-6">
        <div className="grid gap-6">
          {apiEndpoints.map((category) => (
            <ApiEndpointsTable 
              key={category.category}
              category={category.category}
              endpoints={category.endpoints}
            />
          ))}
        </div>
      </TabsContent>

      <TabsContent value="documentation" className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          <ApiDocumentationCard
            title="Website API Documentation"
            description="Complete documentation for the main website API endpoints"
            features={[
              "REST API endpoints",
              "Request/Response schemas", 
              "Authentication guide",
              "Error handling",
              "Code examples"
            ]}
            docPath="/docs/website-api.md"
            icon={Book}
            color="#3B82F6"
          />

          <ApiDocumentationCard
            title="Mobile API Documentation"
            description="Mobile-specific API documentation for Capacitor apps"
            features={[
              "Push notifications",
              "Offline sync",
              "App updates",
              "Native features",
              "Capacitor integration"
            ]}
            docPath="/docs/mobile-api.md"
            icon={Smartphone}
            color="#10B981"
          />

          <div className="md:col-span-2">
            <IntegrationGuideCard />
          </div>
        </div>
      </TabsContent>

      <TabsContent value="mobile" className="space-y-6">
        <div className="grid gap-6">
          {mobileEndpoints.map((category) => (
            <ApiEndpointsTable 
              key={category.category}
              category={category.category}
              endpoints={category.endpoints}
            />
          ))}
        </div>
      </TabsContent>
    </>
  );
};
