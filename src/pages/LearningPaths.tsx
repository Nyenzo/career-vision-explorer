
import { useState } from "react";
import Layout from "@/components/layout/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Play, Eye, GraduationCap, Clock, Users, TrendingUp } from "lucide-react";
import { useLearningPaths } from "@/hooks/use-learning-paths";
import BrowseLearningPathsDialog from "@/components/learning/BrowseLearningPathsDialog";
import LearningPathDetailsDialog from "@/components/learning/LearningPathDetailsDialog";

const LearningPaths = () => {
  const { learningPaths } = useLearningPaths();
  const [showBrowseDialog, setShowBrowseDialog] = useState(false);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [selectedPath, setSelectedPath] = useState(null);

  const handleViewDetails = (path) => {
    setSelectedPath(path);
    setShowDetailsDialog(true);
  };

  const handleContinueLearning = (path) => {
    setSelectedPath(path);
    setShowDetailsDialog(true);
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        <div className="container py-8 max-w-7xl mx-auto">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-8 mb-8 border border-blue-100">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div className="space-y-2">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                  Learning Paths
                </h1>
                <p className="text-lg text-gray-600 max-w-2xl">
                  Advance your career with structured learning programs designed to help you master new skills.
                </p>
              </div>
              <div className="mt-6 md:mt-0">
                <Button 
                  className="flex items-center bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                  onClick={() => setShowBrowseDialog(true)}
                >
                  <BookOpen className="mr-2 h-4 w-4" />
                  Browse All Paths
                </Button>
              </div>
            </div>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Enrolled Paths</CardTitle>
                <GraduationCap className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{learningPaths.length}</div>
                <p className="text-xs text-muted-foreground">Active learning paths</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Completed Modules</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {learningPaths.reduce((sum, path) => sum + path.modulesCompleted, 0)}
                </div>
                <p className="text-xs text-muted-foreground">
                  of {learningPaths.reduce((sum, path) => sum + path.modules, 0)} total modules
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Average Progress</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {learningPaths.length > 0 
                    ? Math.round(learningPaths.reduce((sum, path) => sum + path.progress, 0) / learningPaths.length)
                    : 0}%
                </div>
                <p className="text-xs text-muted-foreground">Across all paths</p>
              </CardContent>
            </Card>
          </div>

          {/* Learning Paths List */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">My Learning Paths</CardTitle>
              <CardDescription>Track your progress in various learning programs</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {learningPaths.length === 0 ? (
                  <div className="text-center py-12">
                    <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-600 mb-2">No Learning Paths Yet</h3>
                    <p className="text-gray-500 mb-6 max-w-md mx-auto">
                      Start your learning journey by enrolling in one of our structured learning paths.
                    </p>
                    <Button onClick={() => setShowBrowseDialog(true)}>
                      <BookOpen className="mr-2 h-4 w-4" />
                      Browse Learning Paths
                    </Button>
                  </div>
                ) : (
                  learningPaths.map((path) => (
                    <div key={path.id} className="border rounded-lg p-6 bg-white shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-blue-100 rounded-lg">
                              <GraduationCap className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-lg">{path.title}</h3>
                              <p className="text-sm text-gray-500">{path.description}</p>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                            <div className="text-center p-3 bg-gray-50 rounded-lg">
                              <div className="text-sm font-medium text-gray-600">Progress</div>
                              <div className="text-xl font-bold text-blue-600">{path.progress}%</div>
                            </div>
                            <div className="text-center p-3 bg-gray-50 rounded-lg">
                              <div className="text-sm font-medium text-gray-600">Modules</div>
                              <div className="text-xl font-bold">{path.modulesCompleted}/{path.modules}</div>
                            </div>
                            <div className="text-center p-3 bg-gray-50 rounded-lg">
                              <div className="text-sm font-medium text-gray-600">Duration</div>
                              <div className="text-sm font-bold">{path.estimatedDuration}</div>
                            </div>
                            <div className="text-center p-3 bg-gray-50 rounded-lg">
                              <div className="text-sm font-medium text-gray-600">Level</div>
                              <Badge variant={path.difficulty === 'Beginner' ? 'secondary' : 
                                           path.difficulty === 'Intermediate' ? 'default' : 'destructive'}>
                                {path.difficulty}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex flex-col gap-2 lg:w-48">
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>Progress</span>
                              <span>{path.progress}%</span>
                            </div>
                            <Progress value={path.progress} className="h-2" />
                          </div>
                          
                          <div className="flex gap-2 mt-4">
                            <Button 
                              className="flex-1 flex items-center justify-center"
                              onClick={() => handleContinueLearning(path)}
                            >
                              <Play className="h-4 w-4 mr-1" />
                              Continue
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleViewDetails(path)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
                
                {learningPaths.length > 0 && (
                  <div className="border border-dashed rounded-lg p-6 flex flex-col items-center justify-center bg-gray-50">
                    <BookOpen className="h-8 w-8 text-gray-400 mb-2" />
                    <h3 className="font-medium">Discover More Learning Paths</h3>
                    <p className="text-sm text-gray-500 mt-1 text-center max-w-sm">
                      Explore additional learning paths to expand your skills and advance your career.
                    </p>
                    <Button 
                      className="mt-4"
                      onClick={() => setShowBrowseDialog(true)}
                    >
                      Browse More Paths
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <BrowseLearningPathsDialog
            open={showBrowseDialog}
            onOpenChange={setShowBrowseDialog}
          />

          <LearningPathDetailsDialog
            open={showDetailsDialog}
            onOpenChange={setShowDetailsDialog}
            learningPath={selectedPath}
          />
        </div>
      </div>
    </Layout>
  );
};

export default LearningPaths;
