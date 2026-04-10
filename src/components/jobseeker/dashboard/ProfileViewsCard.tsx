import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, TrendingUp, Calendar, Building2, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

interface ProfileView {
  id: string;
  company: string;
  viewerRole?: string;
  viewedDate: string;
  isRecent: boolean;
}

const mockProfileViews: ProfileView[] = [
  {
    id: "1",
    company: "TechCorp Inc.",
    viewerRole: "Hiring Manager",
    viewedDate: "2024-07-18",
    isRecent: true
  },
  {
    id: "2",
    company: "StartupCorp",
    viewerRole: "HR Director",
    viewedDate: "2024-07-17",
    isRecent: true
  },
  {
    id: "3",
    company: "Digital Agency",
    viewerRole: "Recruiter",
    viewedDate: "2024-07-15",
    isRecent: false
  }
];

export const ProfileViewsCard = () => {
  const totalViews = 24;
  const weeklyIncrease = 15;

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-gray-900">
          <Eye className="h-5 w-5 text-purple-600" />
          Profile Views
        </CardTitle>
        <CardDescription>See who's interested in your profile</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-100">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-2xl font-bold text-gray-900">{totalViews}</span>
              <Badge variant="secondary" className="bg-green-100 text-green-700">
                <TrendingUp className="h-3 w-3 mr-1" />
                +{weeklyIncrease}% this week
              </Badge>
            </div>
            <p className="text-sm text-gray-600">Total profile views</p>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link to="/profile">
              View Profile
              <ArrowRight className="h-4 w-4 ml-1" />
            </Link>
          </Button>
        </div>

        {mockProfileViews.length === 0 ? (
          <div className="text-center py-8">
            <Eye className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No profile views yet</p>
            <Button variant="outline" className="mt-4" asChild>
              <Link to="/profile">Complete Your Profile</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            <h4 className="font-medium text-gray-900">Recent Viewers</h4>
            {mockProfileViews.slice(0, 3).map((view) => (
              <div key={view.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                    <Building2 className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h5 className="font-medium text-gray-900">{view.company}</h5>
                    <p className="text-sm text-gray-500">{view.viewerRole}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1 text-sm text-gray-500">
                    <Calendar className="h-3 w-3" />
                    {new Date(view.viewedDate).toLocaleDateString()}
                  </div>
                  {view.isRecent && (
                    <Badge variant="outline" className="text-xs mt-1">
                      New
                    </Badge>
                  )}
                </div>
              </div>
            ))}
            <Button variant="ghost" className="w-full text-sm">
              View All Profile Activity
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};