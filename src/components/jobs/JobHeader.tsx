
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { MapPin, Briefcase, Clock, BarChart3, Building } from "lucide-react";

interface JobHeaderProps {
  job: {
    title: string;
    company: string;
    location: string;
    type: string;
    posted: string;
    matchScore: number;
    match_score?: number;
    companyInfo?: {
      logoUrl?: string;
    };
  };
}

export const JobHeader = ({ job }: JobHeaderProps) => {

const score = Math.round((job.matchScore ?? job.similarity_score ?? 0) * (job.matchScore <= 1 || job.similarity_score <= 1 ? 100 : 1));  return (
    <Card className="career-card">
      {/* Match Score Bar */}
      <div className="h-2 bg-muted rounded-t-xl">
        <div 
          className={`h-full rounded-t-xl ${
           score>= 90 ? 'bg-green-500' : 
            score >= 80 ? 'bg-blue-500' : 
            score >= 70 ? 'bg-yellow-500' : 
            'bg-orange-500'
          }`} 
          style={{ width: `${score}%` }}
        ></div>
      </div>
      
      <CardHeader className="pb-4">
        <div className="flex justify-between items-start">
          <div className="flex items-start gap-4">
            {/* Company Logo */}
            <div className="flex-shrink-0">
              {job.companyInfo?.logoUrl ? (
                <img 
                  src={job.companyInfo.logoUrl} 
                  alt={`${job.company} logo`}
                  className="w-16 h-16 rounded-lg object-contain border bg-white"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    if (e.currentTarget.nextElementSibling) {
                      (e.currentTarget.nextElementSibling as HTMLElement).style.display = 'flex';
                    }
                  }}
                />
              ) : null}
              <div 
                className={`w-16 h-16 rounded-lg border bg-gray-100 flex items-center justify-center ${
                  job.companyInfo?.logoUrl ? 'hidden' : 'flex'
                }`}
              >
                <Building className="h-8 w-8 text-gray-400" />
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <CardTitle className="text-3xl mb-3">
                  {job.title}
                </CardTitle>
                <CardDescription className="text-xl font-medium">
                  {job.company}
                </CardDescription>
              </div>
              
              <div className="flex items-center gap-6 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="h-4 w-4 text-primary" />
                  {job.location}
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Briefcase className="h-4 w-4 text-primary" />
                  {job.type}
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="h-4 w-4 text-primary" />
                  {job.posted}
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="text-right">
              <Badge className={`text-lg px-4 py-2 font-bold ${
                score >= 90 ? 'bg-green-500 hover:bg-green-600' : 
                score >= 80 ? 'bg-blue-500 hover:bg-blue-600' : 
                score >= 70 ? 'bg-yellow-500 hover:bg-yellow-600' : 
                'bg-orange-500 hover:bg-orange-600'
              } text-white`}>
                {score}% Match
              </Badge>
            </div>
            <BarChart3 className="h-8 w-8 text-muted-foreground" />
          </div>
        </div>
      </CardHeader>
    </Card>
  );
};
