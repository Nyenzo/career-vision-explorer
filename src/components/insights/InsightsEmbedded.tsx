import { useState } from "react";
import { useInsights } from "@/hooks/use-insights-provider";
import { InsightsProvider } from "@/hooks/use-insights-provider";
import InsightsHero from "@/components/insights/InsightsHero";
import InsightsFilters from "@/components/insights/InsightsFilters";
import InsightsTabsContent from "@/components/insights/InsightsTabsContent";

const InsightsContentEmbedded = () => {
  const [industry, setIndustry] = useState("all-industries");
  const [region, setRegion] = useState("all-regions");
  
  const {
    marketData,
    industryInsights,
    regionalData,
    salaryByRoleData,
    jobTrendData,
    skillDemandData,
  } = useInsights();

  // Filter data based on selected filters
  const filteredIndustryInsights = industry === "all-industries" 
    ? industryInsights 
    : industryInsights.filter(insight => 
        insight.industry.toLowerCase().includes(industry.replace('-', ' '))
      );

  const filteredRegionalData = region === "all-regions"
    ? regionalData
    : regionalData.filter(data =>
        data.region.toLowerCase().includes(region.replace('-', ' '))
      );

  return (
    <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-lg p-6">
      <InsightsHero />
      
      <InsightsFilters
        industry={industry}
        region={region}
        setIndustry={setIndustry}
        setRegion={setRegion}
      />

      <InsightsTabsContent
        marketData={marketData}
        salaryByRoleData={salaryByRoleData}
        jobTrendData={jobTrendData}
        skillDemandData={skillDemandData}
        filteredIndustryInsights={filteredIndustryInsights}
        filteredRegionalData={filteredRegionalData}
      />
    </div>
  );
};

const InsightsEmbedded = () => {
  return (
    <InsightsProvider>
      <InsightsContentEmbedded />
    </InsightsProvider>
  );
};

export default InsightsEmbedded;
