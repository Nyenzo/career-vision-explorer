
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Heart, Share2, CheckCircle } from "lucide-react";
import { toast } from "sonner";
 
 interface JobActionsProps {
   job: {
     id?: string;
     salary?: string;
     job_id?: string;
     salary_range: string | null;
   };
   isApplied: boolean;
   isSaved: boolean;
   onApply: () => void;
   onSave: () => void;
 }
 
 export const JobActions = ({ job, isApplied, isSaved, onApply, onSave }: JobActionsProps) => {
   const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Job link copied to clipboard");
  };

  const displaySalary =  job.salary ?? job.salary_range ?? 'Not specified';
  return (
    <Card className="career-card">
      <CardHeader>
        <CardTitle className="text-xl">Apply for this job</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl border border-blue-100">
          <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            {displaySalary}
          </div>
          <div className="text-sm text-muted-foreground">Salary Range</div>
        </div>
        
        <div className="flex gap-3">
          <Button 
            className={`flex-1 ${
              isApplied 
                ? "bg-green-600 hover:bg-green-700" 
                : "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            }`}
            onClick={onApply}
            disabled={isApplied}
          >
            {isApplied ? (
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                Applied ✓
              </div>
            ) : (
              "Apply Now"
            )}
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={onSave}
            className={`transition-all ${
              isSaved ? "text-red-500 border-red-300 bg-red-50 hover:bg-red-100" : "hover:text-red-500"
            }`}
          >
            <Heart className={`h-5 w-5 ${isSaved ? "fill-current" : ""}`} />
          </Button>
          <Button 
            variant="outline" 
            size="icon" 
            onClick={handleShare}
            className="hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300"
          >
            <Share2 className="h-5 w-5" />
          </Button>
        </div>
        
        {isApplied && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
            <div className="flex items-center justify-center gap-2 text-green-700 font-medium">
              <CheckCircle className="h-5 w-5" />
              Application submitted successfully
            </div>
            <p className="text-sm text-green-600 mt-1">
              We'll notify you about the next steps
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
