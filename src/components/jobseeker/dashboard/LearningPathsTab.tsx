
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { BookOpen, ChevronRight } from "lucide-react";

export const LearningPathsTab = () => {
  const learningPaths = [
    {
      id: 1,
      title: "Full-Stack Web Development",
      progress: 60,
      modules: 8,
      completed: 5,
    },
    {
      id: 2,
      title: "Data Science Fundamentals",
      progress: 35,
      modules: 10,
      completed: 3,
    },
    {
      id: 3,
      title: "UX/UI Design Principles",
      progress: 90,
      modules: 6,
      completed: 6,
    },
  ];

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-gray-900">
          <BookOpen className="h-5 w-5 text-blue-600" />
          Learning Paths
        </CardTitle>
        <CardDescription>Continue your learning journey with these recommended paths</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {learningPaths.map((path) => (
          <div
            key={path.id}
            className="p-6 bg-gradient-to-r from-white to-gray-50/50 rounded-xl border border-gray-100 hover:shadow-lg transition-all duration-300"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                  {path.title}
                </h3>
                <div className="text-sm text-gray-600">
                  {path.completed} / {path.modules} Modules Completed
                </div>
              </div>
              <div className="text-right">
                <Badge className="bg-purple-100 text-purple-800 border-purple-200 px-3 py-1">
                  {path.progress}% Complete
                </Badge>
              </div>
            </div>
            <Progress value={path.progress} className="h-3 mb-4" />
            <div className="flex justify-end">
              <Button variant="outline" className="hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300 transition-all duration-200">
                Continue Learning
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
