
import { useState } from "react";
import Layout from "@/components/layout/Layout";
import { SkillsAssessmentInterface } from "@/components/assessments/SkillsAssessmentInterface";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Trophy, Target, Clock, Star, TrendingUp, Award, Play } from "lucide-react";

interface Course {
  id: number;
  title: string;
  description: string;
  platform: string;
  duration: string;
  level: string;
  progress?: number;
  rating?: number;
  students?: number;
}

const recommendedCourses: Course[] = [
  {
    id: 1,
    title: "Advanced React Patterns",
    description: "Learn advanced React patterns and best practices for building scalable applications",
    platform: "Visiondrill",
    duration: "4 hours",
    level: "Advanced",
    rating: 4.8,
    students: 1250
  },
  {
    id: 2,
    title: "JavaScript Algorithms and Data Structures",
    description: "Master the fundamental algorithms and data structures in JavaScript",
    platform: "Visiondrill",
    duration: "8 hours",
    level: "Intermediate",
    rating: 4.9,
    students: 2100
  },
  {
    id: 3,
    title: "TypeScript for React Developers",
    description: "Learn how to use TypeScript effectively with React",
    platform: "Udemy",
    duration: "6 hours",
    level: "Intermediate",
    rating: 4.7,
    students: 890
  }
];

const inProgressCourses: Course[] = [
  {
    id: 4,
    title: "Intro to Web Development",
    description: "Learn the basics of HTML, CSS, and JavaScript",
    platform: "Visiondrill",
    duration: "10 hours",
    level: "Beginner",
    progress: 60,
    rating: 4.6,
    students: 3200
  },
  {
    id: 5,
    title: "UI/UX Design Fundamentals",
    description: "Learn the fundamentals of user interface and experience design",
    platform: "Visiondrill",
    duration: "5 hours",
    level: "Beginner",
    progress: 25,
    rating: 4.5,
    students: 1800
  }
];

const Skills = () => {
  const [showAssessment, setShowAssessment] = useState(false);

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'Beginner': return 'bg-green-100 text-green-800 border-green-200';
      case 'Intermediate': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Advanced': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPlatformColor = (platform: string) => {
    switch (platform) {
      case 'Visiondrill': return 'bg-primary/10 text-primary border-primary/20';
      default: return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };
  
  return (
    <Layout>
      <div className="bg-gradient-to-br from-primary/5 via-background to-secondary/5 min-h-screen">
        <div className="container py-8 max-w-7xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-primary/10 rounded-full">
                <TrendingUp className="h-8 w-8 text-primary" />
              </div>
            </div>
            <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
              Skills Development
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Take assessments, learn new skills, and track your progress towards your career goals with our comprehensive learning platform.
            </p>
          </div>
          
          {showAssessment ? (
            <div className="flex justify-center mb-8">
              <SkillsAssessmentInterface />
            </div>
          ) : (
            <Tabs defaultValue="courses" className="space-y-8">
              <div className="flex justify-center">
                <TabsList className="grid w-full max-w-md grid-cols-3 h-12">
                  <TabsTrigger value="courses" className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4" />
                    Courses
                  </TabsTrigger>
                  <TabsTrigger value="assessments" className="flex items-center gap-2">
                    <Target className="h-4 w-4" />
                    Assessments
                  </TabsTrigger>
                  <TabsTrigger value="certificates" className="flex items-center gap-2">
                    <Award className="h-4 w-4" />
                    Certificates
                  </TabsTrigger>
                </TabsList>
              </div>
              
              <TabsContent value="courses" className="space-y-8">
                {/* In Progress Section */}
                <div>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Play className="h-5 w-5 text-primary" />
                    </div>
                    <h2 className="text-2xl font-semibold">Continue Learning</h2>
                  </div>
                  <div className="grid md:grid-cols-2 gap-6">
                    {inProgressCourses.map(course => (
                      <Card key={course.id} className="hover:shadow-lg transition-all duration-300 border-l-4 border-l-primary">
                        <CardHeader className="pb-3">
                          <div className="flex justify-between items-start mb-2">
                            <CardTitle className="text-lg leading-tight">{course.title}</CardTitle>
                            <Badge className={getPlatformColor(course.platform)}>
                              {course.platform}
                            </Badge>
                          </div>
                          <CardDescription className="text-sm">{course.description}</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="flex justify-between text-sm text-muted-foreground">
                            <span className="font-medium">Progress</span>
                            <span className="font-semibold">{course.progress}%</span>
                          </div>
                          <Progress value={course.progress} className="h-2" />
                          
                          <div className="flex justify-between items-center pt-2">
                            <div className="flex flex-col gap-1">
                              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {course.duration}
                                </span>
                                <Badge variant="outline" className={getLevelColor(course.level)}>
                                  {course.level}
                                </Badge>
                              </div>
                              {course.rating && (
                                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                  <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                  <span>{course.rating}</span>
                                  <span>({course.students?.toLocaleString()} students)</span>
                                </div>
                              )}
                            </div>
                            <Button className="shrink-0">Continue</Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
                
                {/* Recommended Section */}
                <div>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-secondary/20 rounded-lg">
                      <Star className="h-5 w-5 text-secondary-foreground" />
                    </div>
                    <h2 className="text-2xl font-semibold">Recommended for You</h2>
                  </div>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {recommendedCourses.map(course => (
                      <Card key={course.id} className="hover:shadow-lg transition-all duration-300 group">
                        <CardHeader className="pb-3">
                          <div className="flex justify-between items-start mb-2">
                            <CardTitle className="text-lg leading-tight group-hover:text-primary transition-colors">
                              {course.title}
                            </CardTitle>
                            <Badge className={getPlatformColor(course.platform)}>
                              {course.platform}
                            </Badge>
                          </div>
                          <CardDescription className="text-sm">{course.description}</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div className="flex flex-col gap-2">
                              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {course.duration}
                                </span>
                                <Badge variant="outline" className={getLevelColor(course.level)}>
                                  {course.level}
                                </Badge>
                              </div>
                              {course.rating && (
                                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                  <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                  <span>{course.rating}</span>
                                  <span>({course.students?.toLocaleString()} students)</span>
                                </div>
                              )}
                            </div>
                            <Button variant="default" className="shrink-0">Enroll</Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="assessments" className="space-y-8">
                <div>
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <Target className="h-5 w-5 text-primary" />
                      </div>
                      <h2 className="text-2xl font-semibold">Available Assessments</h2>
                    </div>
                    <Button onClick={() => setShowAssessment(true)} size="lg">
                      Take New Assessment
                    </Button>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    <Card className="hover:shadow-lg transition-all duration-300">
                      <CardHeader className="pb-4">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="p-2 bg-blue-100 rounded-lg">
                            <BookOpen className="h-5 w-5 text-blue-600" />
                          </div>
                          <CardTitle>Technical Skills Assessment</CardTitle>
                        </div>
                        <CardDescription>
                          Evaluate your coding, problem-solving, and technical knowledge across various programming languages and frameworks
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex justify-between items-center">
                          <div className="space-y-1 text-sm text-muted-foreground">
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4" />
                              <span>Duration: 30 minutes</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Target className="h-4 w-4" />
                              <span>Questions: 25</span>
                            </div>
                          </div>
                          <Button onClick={() => setShowAssessment(true)}>Start Assessment</Button>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card className="hover:shadow-lg transition-all duration-300">
                      <CardHeader className="pb-4">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="p-2 bg-green-100 rounded-lg">
                            <Trophy className="h-5 w-5 text-green-600" />
                          </div>
                          <CardTitle>Soft Skills Assessment</CardTitle>
                        </div>
                        <CardDescription>
                          Evaluate your communication, teamwork, leadership, and emotional intelligence skills
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex justify-between items-center">
                          <div className="space-y-1 text-sm text-muted-foreground">
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4" />
                              <span>Duration: 20 minutes</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Target className="h-4 w-4" />
                              <span>Questions: 15</span>
                            </div>
                          </div>
                          <Button onClick={() => setShowAssessment(true)}>Start Assessment</Button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="certificates" className="space-y-8">
                <div className="text-center py-16">
                  <div className="flex justify-center mb-6">
                    <div className="p-4 bg-muted rounded-full">
                      <Award className="h-12 w-12 text-muted-foreground" />
                    </div>
                  </div>
                  <h3 className="text-2xl font-semibold mb-3">No Certificates Yet</h3>
                  <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                    Complete courses and assessments to earn certificates and showcase your achievements
                  </p>
                  <Button onClick={() => setShowAssessment(true)} size="lg">
                    Take Your First Assessment
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Skills;
