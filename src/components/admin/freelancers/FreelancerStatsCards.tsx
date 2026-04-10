import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Star, DollarSign, Calendar } from "lucide-react";
import { useFreelancers } from "@/hooks/use-freelancers";

export const FreelancerStatsCards = () => {
  const { freelancers } = useFreelancers();

  const stats = {
    total: freelancers.length,
    active: freelancers.filter(f => f.isActive).length,
    averageRating: freelancers.length > 0 
      ? (freelancers.reduce((sum, f) => sum + f.rating, 0) / freelancers.length).toFixed(1)
      : "0.0",
    totalProjects: freelancers.reduce((sum, f) => sum + f.completedProjects, 0),
    averageRate: freelancers.length > 0
      ? Math.round(freelancers.reduce((sum, f) => sum + f.hourlyRate, 0) / freelancers.length)
      : 0,
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Freelancers</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.total}</div>
          <p className="text-xs text-muted-foreground">
            {stats.active} active profiles
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
          <Star className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.averageRating}</div>
          <p className="text-xs text-muted-foreground">
            out of 5.0 stars
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalProjects}</div>
          <p className="text-xs text-muted-foreground">
            completed successfully
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Average Rate</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">${stats.averageRate}</div>
          <p className="text-xs text-muted-foreground">
            per hour
          </p>
        </CardContent>
      </Card>
    </div>
  );
};