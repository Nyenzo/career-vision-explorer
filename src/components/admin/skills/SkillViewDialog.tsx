
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { BookOpen, Target, TrendingUp, DollarSign, CheckCircle, Clock } from "lucide-react";
import { Skill } from "@/hooks/use-admin-skills";

interface SkillViewDialogProps {
  skill: Skill | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const SkillViewDialog = ({ skill, open, onOpenChange }: SkillViewDialogProps) => {
  if (!skill) return null;

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'Beginner': return 'bg-green-100 text-green-800';
      case 'Intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'Advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getDemandColor = (demand: string) => {
    switch (demand) {
      case 'High': return 'bg-red-100 text-red-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'Low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getDemandValue = (demand: string) => {
    switch (demand) {
      case 'High': return 85;
      case 'Medium': return 60;
      case 'Low': return 30;
      default: return 0;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>{skill.name}</span>
            <div className="flex items-center gap-2">
              <Badge className={getLevelColor(skill.level)}>
                {skill.level}
              </Badge>
              <Badge variant={skill.isActive ? "default" : "secondary"}>
                {skill.isActive ? "Active" : "Inactive"}
              </Badge>
              <Badge variant={skill.isVerified ? "default" : "outline"}>
                {skill.isVerified ? "Verified" : "Unverified"}
              </Badge>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="flex items-center space-x-2 p-4">
                <Target className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-sm font-medium">Category</p>
                  <p className="text-sm text-muted-foreground">{skill.category}</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex items-center space-x-2 p-4">
                <TrendingUp className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-sm font-medium">Industry Demand</p>
                  <Badge className={getDemandColor(skill.industryDemand)} variant="outline">
                    {skill.industryDemand}
                  </Badge>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex items-center space-x-2 p-4">
                <DollarSign className="h-5 w-5 text-yellow-600" />
                <div>
                  <p className="text-sm font-medium">Salary Impact</p>
                  <p className="text-sm text-muted-foreground">+{skill.averageSalaryImpact}%</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex items-center space-x-2 p-4">
                <Clock className="h-5 w-5 text-purple-600" />
                <div>
                  <p className="text-sm font-medium">Last Updated</p>
                  <p className="text-sm text-muted-foreground">{skill.updatedAt}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Description */}
          <Card>
            <CardHeader>
              <CardTitle>Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{skill.description}</p>
            </CardContent>
          </Card>

          {/* Market Analysis */}
          <Card>
            <CardHeader>
              <CardTitle>Market Analysis</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Industry Demand Level</span>
                  <span>{skill.industryDemand}</span>
                </div>
                <Progress value={getDemandValue(skill.industryDemand)} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Average Salary Impact</span>
                  <span>+{skill.averageSalaryImpact}%</span>
                </div>
                <Progress value={skill.averageSalaryImpact} className="h-2" />
              </div>
            </CardContent>
          </Card>

          {/* Prerequisites */}
          {skill.prerequisites.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  Prerequisites
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {skill.prerequisites.map((prereq, index) => (
                    <Badge key={index} variant="outline">
                      {prereq}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Learning Resources */}
          {skill.learningResources.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Learning Resources
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {skill.learningResources.map((resource, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div className="h-2 w-2 bg-primary rounded-full"></div>
                      <span className="text-sm">{resource}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Assessment Criteria */}
          {skill.assessmentCriteria.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Assessment Criteria
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {skill.assessmentCriteria.map((criteria, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm">{criteria}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Metadata */}
          <div className="border-t pt-4">
            <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
              <div>
                <span className="font-medium">Created:</span> {skill.createdAt}
              </div>
              <div>
                <span className="font-medium">Last Updated:</span> {skill.updatedAt}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
