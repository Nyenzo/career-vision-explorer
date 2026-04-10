
import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Code, Book, Smartphone } from "lucide-react";

export const ApiTabsNavigation = () => {
  return (
    <TabsList className="grid w-full grid-cols-3">
      <TabsTrigger value="endpoints" className="flex items-center gap-2">
        <Code className="h-4 w-4" />
        API Endpoints
      </TabsTrigger>
      <TabsTrigger value="documentation" className="flex items-center gap-2">
        <Book className="h-4 w-4" />
        Documentation
      </TabsTrigger>
      <TabsTrigger value="mobile" className="flex items-center gap-2">
        <Smartphone className="h-4 w-4" />
        Mobile API
      </TabsTrigger>
    </TabsList>
  );
};
