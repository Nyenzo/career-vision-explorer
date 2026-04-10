
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DollarSign, TrendingUp } from "lucide-react";
import { IndustryInsight } from "@/hooks/use-insights-data";

interface IndustryInsightsTabProps {
  filteredIndustryInsights: IndustryInsight[];
}

const IndustryInsightsTab = ({ filteredIndustryInsights }: IndustryInsightsTabProps) => {
  return (
    <div className="mt-6 sm:mt-8 space-y-6 sm:space-y-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {filteredIndustryInsights.map((insight) => (
          <Card key={insight.id} className="border-0 shadow-xl bg-white/90 backdrop-blur-sm hover:shadow-2xl transition-all duration-300 group">
            <CardHeader className="pb-2 sm:pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm sm:text-lg font-bold text-gray-900">{insight.industry}</CardTitle>
                <Badge variant="secondary" className="bg-green-100 text-green-800 text-xs">
                  {insight.growthRate}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 sm:space-y-6">
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <div className="text-center p-2 sm:p-3 rounded-lg bg-blue-50">
                  <DollarSign className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 mx-auto mb-1" />
                  <p className="text-xs text-gray-600">Avg. Salary</p>
                  <p className="font-bold text-blue-600 text-xs sm:text-sm">{insight.averageSalary}</p>
                </div>
                <div className="text-center p-2 sm:p-3 rounded-lg bg-green-50">
                  <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-green-600 mx-auto mb-1" />
                  <p className="text-xs text-gray-600">Growth</p>
                  <p className="font-bold text-green-600 text-xs sm:text-sm">{insight.growthRate}</p>
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold text-gray-900 mb-2 text-xs sm:text-sm">Top Roles</h4>
                <div className="space-y-1">
                  {insight.topRoles.slice(0, 3).map((role, idx) => (
                    <Badge key={idx} variant="outline" className="mr-1 mb-1 text-xs">
                      {role}
                    </Badge>
                  ))}
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold text-gray-900 mb-2 text-xs sm:text-sm">Key Skills</h4>
                <div className="flex flex-wrap gap-1">
                  {insight.topSkills.slice(0, 4).map((skill, idx) => (
                    <Badge key={idx} className="text-xs bg-blue-100 text-blue-800 hover:bg-blue-200">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>

              <Button variant="outline" className="w-full group-hover:bg-blue-50 group-hover:border-blue-200 transition-colors text-xs sm:text-sm h-8 sm:h-10">
                View Details
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default IndustryInsightsTab;
