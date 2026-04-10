
export interface CareerPath {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  estimatedDuration: string;
  tags: string[];
  steps: CareerStep[];
  prerequisites: string[];
  outcomes: string[];
}

export interface CareerStep {
  id: string;
  title: string;
  description: string;
  duration: string;
  resources: string[];
  skills: string[];
  completed: boolean;
}

export class CareerPathsApi {
  private static baseUrl = '/api/career-paths';

  static async getCareerPaths(): Promise<CareerPath[]> {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return [
      {
        id: "1",
        title: "Frontend Developer",
        description: "Master modern web development with React, TypeScript, and modern tools",
        category: "Development",
        difficulty: "Intermediate",
        estimatedDuration: "6-8 months",
        tags: ["React", "JavaScript", "CSS", "HTML"],
        prerequisites: ["Basic programming knowledge", "HTML/CSS fundamentals"],
        outcomes: ["Build responsive web applications", "Master React ecosystem", "Deploy production apps"],
        steps: [
          {
            id: "1",
            title: "JavaScript Fundamentals",
            description: "Learn modern JavaScript ES6+ features",
            duration: "4 weeks",
            resources: ["MDN Documentation", "JavaScript.info"],
            skills: ["Variables", "Functions", "Async/Await", "Modules"],
            completed: false,
          }
        ],
      }
    ];
  }

  static async getCareerPathById(id: string): Promise<CareerPath | null> {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    return {
      id,
      title: "Frontend Developer",
      description: "Master modern web development",
      category: "Development",
      difficulty: "Intermediate",
      estimatedDuration: "6-8 months",
      tags: ["React", "JavaScript"],
      prerequisites: ["Basic programming"],
      outcomes: ["Build web applications"],
      steps: [],
    };
  }

  static async enrollInCareerPath(pathId: string): Promise<boolean> {
    await new Promise(resolve => setTimeout(resolve, 400));
    return true;
  }

  static async updateStepProgress(pathId: string, stepId: string, completed: boolean): Promise<boolean> {
    await new Promise(resolve => setTimeout(resolve, 200));
    return true;
  }
}
