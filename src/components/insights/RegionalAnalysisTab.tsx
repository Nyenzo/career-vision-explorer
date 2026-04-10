
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, DollarSign, TrendingUp } from "lucide-react";
import { RegionalData } from "@/hooks/use-insights-data";

interface RegionalAnalysisTabProps {
  filteredRegionalData: RegionalData[];
}

const RegionalAnalysisTab = ({ filteredRegionalData }: RegionalAnalysisTabProps) => {
  return (
    <div className="mt-6 sm:mt-8 space-y-6 sm:space-y-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {filteredRegionalData.map((region) => (
          <Card key={region.id} className="border-0 shadow-xl bg-white/90 backdrop-blur-sm hover:shadow-2xl transition-all duration-300 group">
            <CardHeader className="pb-2 sm:pb-4">
              <CardTitle className="flex items-center gap-2 text-sm sm:text-lg font-bold text-gray-900">
                <MapPin className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                {region.region}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 sm:space-y-6">
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <div className="text-center p-2 sm:p-3 rounded-lg bg-blue-50">
                  <DollarSign className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 mx-auto mb-1" />
                  <p className="text-xs text-gray-600">Avg. Salary</p>
                  <p className="font-bold text-blue-600 text-xs sm:text-sm">{region.averageSalary}</p>
                </div>
                <div className="text-center p-2 sm:p-3 rounded-lg bg-green-50">
                  <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-green-600 mx-auto mb-1" />
                  <p className="text-xs text-gray-600">Job Growth</p>
                  <p className="font-bold text-green-600 text-xs sm:text-sm">{region.jobGrowth}</p>
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold text-gray-900 mb-2 text-xs sm:text-sm">Top Industries</h4>
                <div className="flex flex-wrap gap-1">
                  {region.topIndustries.map((industry, idx) => (
                    <Badge key={idx} className="text-xs bg-purple-100 text-purple-800">
                      {industry}
                    </Badge>
                  ))}
                </div>
              </div>
              
              <div className="p-2 sm:p-3 rounded-lg bg-gray-50">
                <h4 className="font-semibold text-gray-900 mb-1 text-xs sm:text-sm">Cost of Living</h4>
                <p className="text-gray-600 text-xs sm:text-sm">{region.costOfLiving}</p>
              </div>

              <Button variant="outline" className="w-full group-hover:bg-blue-50 group-hover:border-blue-200 transition-colors text-xs sm:text-sm h-8 sm:h-10">
                View Region Details
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default RegionalAnalysisTab;
