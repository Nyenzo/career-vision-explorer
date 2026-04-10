
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Compass, Clock, TrendingUp, Star, CheckCircle2, Circle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface LearningGoal {
  id: string;
  title: string;
  completed: boolean;
}

const MyRoadmapTab = () => {
  const { toast } = useToast();
  const [learningGoals, setLearningGoals] = useState<LearningGoal[]>([
    { id: "1", title: "Complete JavaScript fundamentals", completed: true },
    { id: "2", title: "Build first React project", completed: true },
    { id: "3", title: "Learn backend technologies", completed: false }
  ]);

  const toggleGoalCompletion = (goalId: string) => {
    setLearningGoals(prev => 
      prev.map(goal => 
        goal.id === goalId 
          ? { ...goal, completed: !goal.completed }
          : goal
      )
    );
    
    const goal = learningGoals.find(g => g.id === goalId);
    toast({
      title: "Goal Updated",
      description: `"${goal?.title}" marked as ${goal?.completed ? 'incomplete' : 'complete'}.`,
    });
  };

  const addNewGoal = () => {
    const newGoal: LearningGoal = {
      id: Date.now().toString(),
      title: `New learning goal ${learningGoals.length + 1}`,
      completed: false
    };
    setLearningGoals(prev => [...prev, newGoal]);
    toast({
      title: "Goal Added",
      description: "New goal added to your roadmap.",
    });
  };

  const completedGoalsCount = learningGoals.filter(goal => goal.completed).length;
  const progressPercentage = Math.round((completedGoalsCount / learningGoals.length) * 100);

  return (
    <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
      <CardHeader className="text-center pb-6">
        <CardTitle className="text-2xl flex items-center justify-center gap-2">
          <Compass className="h-6 w-6 text-blue-600" />
          My Career Roadmap
        </CardTitle>
        <CardDescription className="text-base">
          Track your progress and plan your career journey
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Progress Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-6 text-center">
              <div className="flex items-center justify-center gap-2 mb-3">
                <Star className="h-5 w-5 text-yellow-500" />
                <span className="font-semibold text-gray-700">Current Level</span>
              </div>
              <p className="text-2xl font-bold text-blue-600 mb-1">Beginner</p>
              <p className="text-sm text-gray-500">Frontend Development</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <div className="flex items-center justify-center gap-2 mb-3">
                <TrendingUp className="h-5 w-5 text-green-500" />
                <span className="font-semibold text-gray-700">Progress</span>
              </div>
              <p className="text-2xl font-bold text-green-600 mb-1">{progressPercentage}%</p>
              <p className="text-sm text-gray-500">Goals Completed</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <div className="flex items-center justify-center gap-2 mb-3">
                <Clock className="h-5 w-5 text-purple-500" />
                <span className="font-semibold text-gray-700">Est. Time</span>
              </div>
              <p className="text-2xl font-bold text-purple-600 mb-1">3 months</p>
              <p className="text-sm text-gray-500">To next level</p>
            </CardContent>
          </Card>
        </div>

        {/* Learning Goals */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Learning Goals</h3>
            <Button onClick={addNewGoal} size="sm" className="bg-blue-600 hover:bg-blue-700">
              Add Goal
            </Button>
          </div>
          <div className="space-y-3">
            {learningGoals.map((goal) => (
              <div 
                key={goal.id}
                className="flex items-center gap-3 p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                onClick={() => toggleGoalCompletion(goal.id)}
              >
                {goal.completed ? (
                  <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
                ) : (
                  <Circle className="h-5 w-5 text-gray-400 flex-shrink-0" />
                )}
                <span 
                  className={`flex-1 ${
                    goal.completed 
                      ? "line-through text-gray-500" 
                      : "text-gray-900"
                  }`}
                >
                  {goal.title}
                </span>
                {goal.completed && (
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    Completed
                  </Badge>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-700">Overall Progress</span>
            <span className="text-sm text-gray-500">{completedGoalsCount}/{learningGoals.length} goals</span>
          </div>
          <Progress value={progressPercentage} className="h-3" />
        </div>

        {/* Recommended Actions */}
        <div>
          <h3 className="text-lg font-semibold mb-4 text-gray-900">Recommended Next Steps</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardContent className="p-4">
                <h4 className="font-medium mb-2">Take Skills Assessment</h4>
                <p className="text-sm text-gray-600 mb-3">
                  Evaluate your current skills to get personalized recommendations
                </p>
                <Button size="sm" className="w-full bg-blue-600 hover:bg-blue-700">
                  Start Assessment
                </Button>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <h4 className="font-medium mb-2">Explore Learning Paths</h4>
                <p className="text-sm text-gray-600 mb-3">
                  Discover structured courses to advance your skills
                </p>
                <Button size="sm" variant="outline" className="w-full border-blue-600 text-blue-600 hover:bg-blue-50">
                  Browse Courses
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MyRoadmapTab;
