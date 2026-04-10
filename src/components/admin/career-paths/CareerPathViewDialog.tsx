
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, Target, BookOpen } from "lucide-react";
import { CareerPath } from "@/hooks/use-career-paths";

interface CareerPathViewDialogProps {
  careerPath: CareerPath | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CareerPathViewDialog = ({ careerPath, open, onOpenChange }: CareerPathViewDialogProps) => {
  if (!careerPath) return null;

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner':
        return 'bg-green-100 text-green-800';
      case 'Intermediate':
        return 'bg-yellow-100 text-yellow-800';
      case 'Advanced':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>{careerPath.title}</span>
            <div className="flex items-center gap-2">
              <Badge className={getDifficultyColor(careerPath.difficulty)}>
                {careerPath.difficulty}
              </Badge>
              <Badge variant={careerPath.isActive ? "default" : "secondary"}>
                {careerPath.isActive ? "Active" : "Inactive"}
              </Badge>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="flex items-center space-x-2 p-4">
                <Clock className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-sm font-medium">Duration</p>
                  <p className="text-sm text-muted-foreground">{careerPath.estimatedDuration}</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex items-center space-x-2 p-4">
                <Target className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-sm font-medium">Category</p>
                  <p className="text-sm text-muted-foreground">{careerPath.category}</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex items-center space-x-2 p-4">
                <BookOpen className="h-5 w-5 text-purple-600" />
                <div>
                  <p className="text-sm font-medium">Steps</p>
                  <p className="text-sm text-muted-foreground">{careerPath.steps.length} total</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Description */}
          <div>
            <h3 className="text-lg font-semibold mb-2">Description</h3>
            <p className="text-muted-foreground">{careerPath.description}</p>
          </div>

          {/* Tags */}
          <div>
            <h3 className="text-lg font-semibold mb-2">Tags</h3>
            <div className="flex flex-wrap gap-2">
              {careerPath.tags.map(tag => (
                <Badge key={tag} variant="outline">{tag}</Badge>
              ))}
            </div>
          </div>

          {/* Career Steps */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Career Steps</h3>
            <div className="space-y-4">
              {careerPath.steps
                .sort((a, b) => a.order - b.order)
                .map((step, index) => (
                  <Card key={step.id}>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold">
                          {index + 1}
                        </div>
                        {step.title}
                        <Badge variant="secondary" className="ml-auto">
                          {step.estimatedDuration}
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <p className="text-muted-foreground mb-3">{step.description}</p>
                      
                      {step.requiredSkills.length > 0 && (
                        <div>
                          <p className="text-sm font-medium mb-2">Required Skills:</p>
                          <div className="flex flex-wrap gap-1">
                            {step.requiredSkills.map(skill => (
                              <Badge key={skill} variant="outline" className="text-xs">
                                {skill}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
            </div>
          </div>

          {/* Metadata */}
          <div className="border-t pt-4">
            <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
              <div>
                <span className="font-medium">Created:</span> {careerPath.createdAt}
              </div>
              <div>
                <span className="font-medium">Last Updated:</span> {careerPath.updatedAt}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
