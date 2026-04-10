
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { TrendingUp, Clock, Users, CheckCircle } from "lucide-react";

interface ApplicationStatsCardProps {
  applicationStats: {
    total: number;
    active: number;
    interviews: number;
    offers: number;
  };
}

const ApplicationStatsCard = ({ applicationStats }: ApplicationStatsCardProps) => {
  return (
    <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-purple-50/20">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl font-semibold text-gray-800 flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-blue-600" />
          Job Application Stats
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4 rounded-xl text-center shadow-lg transform hover:scale-105 transition-all duration-200">
            <p className="text-3xl font-bold text-white">{applicationStats.total}</p>
            <p className="text-sm text-blue-100 font-medium">Total Applications</p>
          </div>
          <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-4 rounded-xl text-center shadow-lg transform hover:scale-105 transition-all duration-200">
            <div className="flex items-center justify-center mb-1">
              <Clock className="h-4 w-4 text-white mr-1" />
              <p className="text-3xl font-bold text-white">{applicationStats.active}</p>
            </div>
            <p className="text-sm text-amber-100 font-medium">Active</p>
          </div>
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-4 rounded-xl text-center shadow-lg transform hover:scale-105 transition-all duration-200">
            <div className="flex items-center justify-center mb-1">
              <Users className="h-4 w-4 text-white mr-1" />
              <p className="text-3xl font-bold text-white">{applicationStats.interviews}</p>
            </div>
            <p className="text-sm text-purple-100 font-medium">Interviews</p>
          </div>
          <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-4 rounded-xl text-center shadow-lg transform hover:scale-105 transition-all duration-200">
            <div className="flex items-center justify-center mb-1">
              <CheckCircle className="h-4 w-4 text-white mr-1" />
              <p className="text-3xl font-bold text-white">{applicationStats.offers}</p>
            </div>
            <p className="text-sm text-green-100 font-medium">Offers</p>
          </div>
        </div>
        <div className="pt-2">
          <Link to="/admin/jobseeker">
            <Button 
              variant="outline" 
              className="w-full bg-white/80 hover:bg-white shadow-sm border-gray-200 hover:border-gray-300 transition-all duration-200 font-medium"
            >
              View All Applications
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};

export default ApplicationStatsCard;
