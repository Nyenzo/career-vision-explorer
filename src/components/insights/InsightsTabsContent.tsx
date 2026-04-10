import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart3, Users, MapPin } from "lucide-react";
import MarketOverviewTab from "./MarketOverviewTab";
import IndustryInsightsTab from "./IndustryInsightsTab";
import RegionalAnalysisTab from "./RegionalAnalysisTab";
import {
  MarketData,
  IndustryInsight,
  RegionalData,
  SalaryByRole,
  JobTrend,
  SkillDemand,
} from "@/hooks/use-insights-data";
import { ErrorBoundary } from "react-error-boundary";

interface InsightsTabsContentProps {
  marketData: MarketData[];
  salaryByRoleData: SalaryByRole[];
  jobTrendData: JobTrend[];
  skillDemandData: SkillDemand[];
  filteredIndustryInsights: IndustryInsight[];
  filteredRegionalData: RegionalData[];
}

const InsightsTabsContent = ({
  marketData,
  salaryByRoleData,
  jobTrendData,
  skillDemandData,
  filteredIndustryInsights,
  filteredRegionalData,
}: InsightsTabsContentProps) => {
  return (
    <ErrorBoundary
      FallbackComponent={({ error }) => (
        <div className="text-center py-12">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Something went wrong
          </h3>
          <p className="text-gray-600 mb-4">
            We're working to fix this issue. Please try again later.
          </p>
          <p className="text-xs text-gray-500">{error?.message}</p>
        </div>
      )}
    >
      <Tabs defaultValue="market" className="space-y-6 sm:space-y-8">
        <div className="flex justify-center">
          <TabsList className="grid grid-cols-1 sm:grid-cols-3 gap-1 w-full max-w-lg h-auto sm:h-12 bg-white/80 backdrop-blur-sm border-2 p-1">
            <TabsTrigger
              value="market"
              className="flex items-center justify-center sm:justify-start gap-1 sm:gap-2 py-2 sm:py-0 sm:h-full data-[state=active]:bg-blue-500 data-[state=active]:text-white text-xs sm:text-sm"
            >
              <BarChart3 className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Market Overview</span>
              <span className="sm:hidden">Market</span>
            </TabsTrigger>
            <TabsTrigger
              value="industry"
              className="flex items-center justify-center sm:justify-start gap-1 sm:gap-2 py-2 sm:py-0 sm:h-full data-[state=active]:bg-blue-500 data-[state=active]:text-white text-xs sm:text-sm"
            >
              <Users className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Industry Insights</span>
              <span className="sm:hidden">Industry</span>
            </TabsTrigger>
            <TabsTrigger
              value="regional"
              className="flex items-center justify-center sm:justify-start gap-1 sm:gap-2 py-2 sm:py-0 sm:h-full data-[state=active]:bg-blue-500 data-[state=active]:text-white text-xs sm:text-sm"
            >
              <MapPin className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Regional Analysis</span>
              <span className="sm:hidden">Regional</span>
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="market">
          <MarketOverviewTab
            marketData={marketData}
            salaryByRoleData={salaryByRoleData}
            jobTrendData={jobTrendData}
            skillDemandData={skillDemandData}
          />
        </TabsContent>

        <TabsContent value="industry">
          <IndustryInsightsTab
            filteredIndustryInsights={filteredIndustryInsights}
          />
        </TabsContent>

        <TabsContent value="regional">
          <RegionalAnalysisTab filteredRegionalData={filteredRegionalData} />
        </TabsContent>
      </Tabs>
    </ErrorBoundary>
  );
};

export default InsightsTabsContent;
