
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Clock, Users, TrendingUp, BookOpen } from "lucide-react";
import { useLearningPaths, LearningPath } from "@/hooks/use-learning-paths";

interface BrowseLearningPathsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const BrowseLearningPathsDialog = ({ open, onOpenChange }: BrowseLearningPathsDialogProps) => {
  const { availablePaths, enrollInPath, isLoading } = useLearningPaths();
  const [enrollingPath, setEnrollingPath] = useState<string | null>(null);

  const handleEnroll = async (pathId: string) => {
    setEnrollingPath(pathId);
    const success = await enrollInPath(pathId);
    if (success) {
      onOpenChange(false);
    }
    setEnrollingPath(null);
  };

  const getDifficultyColor = (difficulty: LearningPath['difficulty']) => {
    switch (difficulty) {
      case 'Beginner': return 'bg-green-100 text-green-800';
      case 'Intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'Advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Browse Learning Paths</DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {availablePaths.map((path) => (
            <Card key={path.id} className="h-fit">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">{path.title}</CardTitle>
                  <Badge className={getDifficultyColor(path.difficulty)}>
                    {path.difficulty}
                  </Badge>
                </div>
                <CardDescription>{path.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      {path.estimatedDuration}
                    </div>
                    <div className="flex items-center">
                      <BookOpen className="h-4 w-4 mr-1" />
                      {path.modules} modules
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <div className="flex items-center">
                      <Users className="h-4 w-4 mr-1" />
                      2.5k students
                    </div>
                    <div className="flex items-center">
                      <TrendingUp className="h-4 w-4 mr-1" />
                      4.8/5 rating
                    </div>
                  </div>
                  
                  <Button 
                    className="w-full" 
                    onClick={() => handleEnroll(path.id)}
                    disabled={isLoading || enrollingPath === path.id}
                  >
                    {enrollingPath === path.id ? "Enrolling..." : "Enroll Now"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        
        {availablePaths.length === 0 && (
          <div className="text-center py-8">
            <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No more paths available</h3>
            <p className="text-gray-500">You've enrolled in all available learning paths!</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default BrowseLearningPathsDialog;
