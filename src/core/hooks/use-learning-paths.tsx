
import { useState, createContext, useContext, ReactNode } from 'react';
import { toast } from "@/components/ui/sonner";

export interface Course {
  id: string;
  title: string;
  description: string;
  duration: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  completed: boolean;
  progress: number;
  videoUrl?: string;
  materials?: string[];
}

export interface LearningPath {
  id: string;
  title: string;
  description: string;
  progress: number;
  modules: number;
  modulesCompleted: number;
  courses: Course[];
  estimatedDuration: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
}

type LearningPathsContextType = {
  learningPaths: LearningPath[];
  availablePaths: LearningPath[];
  enrollInPath: (pathId: string) => Promise<boolean>;
  updateCourseProgress: (pathId: string, courseId: string, progress: number) => void;
  completeCourse: (pathId: string, courseId: string) => void;
  isLoading: boolean;
};

const LearningPathsContext = createContext<LearningPathsContextType | undefined>(undefined);

const mockLearningPaths: LearningPath[] = [
  {
    id: "1",
    title: "Full Stack Web Development",
    description: "Master modern web development with React, Node.js, and databases",
    progress: 68,
    modules: 15,
    modulesCompleted: 10,
    estimatedDuration: "12 weeks",
    difficulty: "Intermediate",
    courses: [
      {
        id: "c1",
        title: "HTML & CSS Fundamentals",
        description: "Learn the building blocks of web development",
        duration: "2 hours",
        level: "Beginner",
        completed: true,
        progress: 100
      },
      {
        id: "c2",
        title: "JavaScript Essentials",
        description: "Master JavaScript programming concepts",
        duration: "4 hours",
        level: "Beginner",
        completed: true,
        progress: 100
      },
      {
        id: "c3",
        title: "React Development",
        description: "Build interactive user interfaces with React",
        duration: "6 hours",
        level: "Intermediate",
        completed: false,
        progress: 60
      }
    ]
  },
  {
    id: "2",
    title: "UI/UX Design Fundamentals",
    description: "Learn design principles and create beautiful user experiences",
    progress: 45,
    modules: 12,
    modulesCompleted: 5,
    estimatedDuration: "8 weeks",
    difficulty: "Beginner",
    courses: [
      {
        id: "c4",
        title: "Design Principles",
        description: "Understanding fundamental design concepts",
        duration: "3 hours",
        level: "Beginner",
        completed: true,
        progress: 100
      },
      {
        id: "c5",
        title: "User Research Methods",
        description: "Learn how to research and understand users",
        duration: "4 hours",
        level: "Intermediate",
        completed: false,
        progress: 25
      }
    ]
  }
];

const mockAvailablePaths: LearningPath[] = [
  {
    id: "3",
    title: "Data Science with Python",
    description: "Learn data analysis, machine learning, and visualization",
    progress: 0,
    modules: 20,
    modulesCompleted: 0,
    estimatedDuration: "16 weeks",
    difficulty: "Advanced",
    courses: []
  },
  {
    id: "4",
    title: "Mobile App Development",
    description: "Build native mobile apps for iOS and Android",
    progress: 0,
    modules: 14,
    modulesCompleted: 0,
    estimatedDuration: "10 weeks",
    difficulty: "Intermediate",
    courses: []
  }
];

export const LearningPathsProvider = ({ children }: { children: ReactNode }) => {
  const [learningPaths, setLearningPaths] = useState<LearningPath[]>(mockLearningPaths);
  const [availablePaths, setAvailablePaths] = useState<LearningPath[]>(mockAvailablePaths);
  const [isLoading, setIsLoading] = useState(false);

  const enrollInPath = async (pathId: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const pathToEnroll = availablePaths.find(path => path.id === pathId);
      if (pathToEnroll) {
        setLearningPaths(prev => [...prev, pathToEnroll]);
        setAvailablePaths(prev => prev.filter(path => path.id !== pathId));
        toast.success(`Enrolled in ${pathToEnroll.title}`);
        return true;
      }
      return false;
    } catch (error) {
      toast.error("Failed to enroll in learning path");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const updateCourseProgress = (pathId: string, courseId: string, progress: number) => {
    setLearningPaths(prev => prev.map(path => {
      if (path.id === pathId) {
        const updatedCourses = path.courses.map(course => 
          course.id === courseId ? { ...course, progress } : course
        );
        
        const totalProgress = updatedCourses.reduce((sum, course) => sum + course.progress, 0);
        const avgProgress = Math.round(totalProgress / updatedCourses.length);
        const completedModules = updatedCourses.filter(course => course.completed).length;
        
        return {
          ...path,
          courses: updatedCourses,
          progress: avgProgress,
          modulesCompleted: completedModules
        };
      }
      return path;
    }));
  };

  const completeCourse = (pathId: string, courseId: string) => {
    setLearningPaths(prev => prev.map(path => {
      if (path.id === pathId) {
        const updatedCourses = path.courses.map(course => 
          course.id === courseId ? { ...course, completed: true, progress: 100 } : course
        );
        
        const completedModules = updatedCourses.filter(course => course.completed).length;
        const totalProgress = updatedCourses.reduce((sum, course) => sum + course.progress, 0);
        const avgProgress = Math.round(totalProgress / updatedCourses.length);
        
        return {
          ...path,
          courses: updatedCourses,
          progress: avgProgress,
          modulesCompleted: completedModules
        };
      }
      return path;
    }));
    
    toast.success("Course completed! 🎉");
  };

  return (
    <LearningPathsContext.Provider value={{
      learningPaths,
      availablePaths,
      enrollInPath,
      updateCourseProgress,
      completeCourse,
      isLoading
    }}>
      {children}
    </LearningPathsContext.Provider>
  );
};

export const useLearningPaths = () => {
  const context = useContext(LearningPathsContext);
  if (context === undefined) {
    throw new Error('useLearningPaths must be used within a LearningPathsProvider');
  }
  return context;
};
