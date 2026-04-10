
import { Card, CardContent } from "@/components/ui/card";

interface PartnerStatsCardsProps {
  stats: {
    total: number;
    employers: number;
    education: number;
    recruiting: number;
  };
}

export const PartnerStatsCards = ({ stats }: PartnerStatsCardsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Partners</p>
              <p className="text-2xl font-bold">{stats.total}</p>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Employers</p>
              <p className="text-2xl font-bold text-blue-600">{stats.employers}</p>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Education</p>
              <p className="text-2xl font-bold text-green-600">{stats.education}</p>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Recruiting</p>
              <p className="text-2xl font-bold text-purple-600">{stats.recruiting}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
