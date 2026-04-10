
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, Circle, Play, Clock } from "lucide-react";
import { LearningPath, Course, useLearningPaths } from "@/hooks/use-learning-paths";

interface LearningPathDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  learningPath: LearningPath | null;
}

const LearningPathDetailsDialog = ({ open, onOpenChange, learningPath }: LearningPathDetailsDialogProps) => {
  const { updateCourseProgress, completeCourse } = useLearningPaths();

  if (!learningPath) return null;

  const handleContinueCourse = (course: Course) => {
    if (!course.completed) {
      // Simulate continuing a course
      const newProgress = Math.min(course.progress + 20, 100);
      updateCourseProgress(learningPath.id, course.id, newProgress);
      
      if (newProgress === 100) {
        completeCourse(learningPath.id, course.id);
      }
    }
  };

  const getLevelColor = (level: Course['level']) => {
    switch (level) {
      case 'Beginner': return 'bg-green-100 text-green-800';
      case 'Intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'Advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{learningPath.title}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Progress Overview */}
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span>Overall Progress</span>
              <span>{learningPath.progress}%</span>
            </div>
            <Progress value={learningPath.progress} />
            <p className="text-sm text-gray-600">
              {learningPath.modulesCompleted} of {learningPath.modules} modules completed
            </p>
          </div>

          {/* Course List */}
          <div className="space-y-4">
            <h3 className="font-medium">Course Content</h3>
            {learningPath.courses.map((course, index) => (
              <Card key={course.id} className="overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3 flex-1">
                      <div className="mt-1">
                        {course.completed ? (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        ) : (
                          <Circle className="h-5 w-5 text-gray-400" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium">{course.title}</h4>
                          <Badge className={getLevelColor(course.level)}>
                            {course.level}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-3">{course.description}</p>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center text-sm text-gray-500">
                            <Clock className="h-4 w-4 mr-1" />
                            {course.duration}
                          </div>
                          <div className="text-sm text-gray-500">
                            {course.progress}% complete
                          </div>
                        </div>
                        
                        {!course.completed && (
                          <div className="mt-2">
                            <Progress value={course.progress} className="h-2" />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4 flex justify-end">
                    <Button
                      variant={course.completed ? "outline" : "default"}
                      size="sm"
                      onClick={() => handleContinueCourse(course)}
                      disabled={course.completed}
                      className="flex items-center"
                    >
                      <Play className="h-4 w-4 mr-2" />
                      {course.completed ? "Completed" : course.progress > 0 ? "Continue" : "Start"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LearningPathDetailsDialog;
