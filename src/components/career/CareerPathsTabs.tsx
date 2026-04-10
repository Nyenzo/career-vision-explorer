
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Route, BarChart2, Compass } from "lucide-react";
import CareerPathVisualizer from "./CareerPathVisualizer";
import ComparePathsTab from "./ComparePathsTab";
import MyRoadmapTab from "./MyRoadmapTab";

const CareerPathsTabs = () => {
  return (
    <Tabs defaultValue="visualize" className="space-y-8">
      <div className="flex justify-center">
        <TabsList className="grid grid-cols-3 w-full max-w-md h-14 bg-white/80 backdrop-blur-sm border-2 p-1">
          <TabsTrigger value="visualize" className="flex items-center gap-2 h-full data-[state=active]:bg-blue-500 data-[state=active]:text-white">
            <Route className="w-4 h-4" />
            <span className="hidden sm:inline">Visualize Path</span>
            <span className="sm:hidden">Visualize</span>
          </TabsTrigger>
          <TabsTrigger value="compare" className="flex items-center gap-2 h-full data-[state=active]:bg-blue-500 data-[state=active]:text-white">
            <BarChart2 className="w-4 h-4" />
            <span className="hidden sm:inline">Compare Paths</span>
            <span className="sm:hidden">Compare</span>
          </TabsTrigger>
          <TabsTrigger value="roadmap" className="flex items-center gap-2 h-full data-[state=active]:bg-blue-500 data-[state=active]:text-white">
            <Compass className="w-4 h-4" />
            <span className="hidden sm:inline">My Roadmap</span>
            <span className="sm:hidden">Roadmap</span>
          </TabsTrigger>
        </TabsList>
      </div>
      
      <TabsContent value="visualize" className="space-y-6">
        <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
          <CardHeader className="text-center pb-6">
            <CardTitle className="text-2xl flex items-center justify-center gap-2">
              <Route className="h-6 w-6 text-blue-600" />
              Interactive Career Path Visualizer
            </CardTitle>
            <CardDescription className="text-base">
              Explore detailed career progressions with skills, timelines, and salary insights
            </CardDescription>
          </CardHeader>
          <CardContent className="p-8">
            <CareerPathVisualizer />
          </CardContent>
        </Card>
      </TabsContent>
      
      <TabsContent value="compare" className="space-y-6">
        <ComparePathsTab />
      </TabsContent>
      
      <TabsContent value="roadmap" className="space-y-6">
        <MyRoadmapTab />
      </TabsContent>
    </Tabs>
  );
};

export default CareerPathsTabs;
