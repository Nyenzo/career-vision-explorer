
import { useState, createContext, useContext, ReactNode } from 'react';

export interface CareerStep {
  id: string;
  title: string;
  description: string;
  requiredSkills: string[];
  estimatedDuration: string;
  order: number;
}

export interface CareerPath {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  estimatedDuration: string;
  steps: CareerStep[];
  tags: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface CareerPathsContextType {
  careerPaths: CareerPath[];
  addCareerPath: (careerPath: Omit<CareerPath, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateCareerPath: (id: string, careerPath: Partial<CareerPath>) => void;
  deleteCareerPath: (id: string) => void;
  getCareerPath: (id: string) => CareerPath | undefined;
}

const CareerPathsContext = createContext<CareerPathsContextType | undefined>(undefined);

const initialCareerPaths: CareerPath[] = [
  {
    id: '1',
    title: 'Frontend Developer',
    description: 'Complete path to become a frontend developer',
    category: 'Development',
    difficulty: 'Beginner',
    estimatedDuration: '6 months',
    steps: [
      {
        id: '1-1',
        title: 'HTML & CSS Basics',
        description: 'Learn fundamental web technologies',
        requiredSkills: ['HTML', 'CSS'],
        estimatedDuration: '4 weeks',
        order: 1
      },
      {
        id: '1-2',
        title: 'JavaScript Fundamentals',
        description: 'Master JavaScript programming',
        requiredSkills: ['JavaScript', 'DOM Manipulation'],
        estimatedDuration: '6 weeks',
        order: 2
      },
      {
        id: '1-3',
        title: 'React Development',
        description: 'Build modern web applications',
        requiredSkills: ['React', 'JSX', 'State Management'],
        estimatedDuration: '8 weeks',
        order: 3
      }
    ],
    tags: ['Frontend', 'Web Development', 'React'],
    isActive: true,
    createdAt: '2024-01-15',
    updatedAt: '2024-01-15'
  },
  {
    id: '2',
    title: 'Data Scientist',
    description: 'Journey to becoming a data scientist',
    category: 'Data Science',
    difficulty: 'Advanced',
    estimatedDuration: '12 months',
    steps: [
      {
        id: '2-1',
        title: 'Statistics & Mathematics',
        description: 'Build strong mathematical foundation',
        requiredSkills: ['Statistics', 'Linear Algebra', 'Calculus'],
        estimatedDuration: '8 weeks',
        order: 1
      },
      {
        id: '2-2',
        title: 'Python Programming',
        description: 'Learn Python for data analysis',
        requiredSkills: ['Python', 'Pandas', 'NumPy'],
        estimatedDuration: '6 weeks',
        order: 2
      },
      {
        id: '2-3',
        title: 'Machine Learning',
        description: 'Implement ML algorithms',
        requiredSkills: ['Machine Learning', 'Scikit-learn', 'TensorFlow'],
        estimatedDuration: '12 weeks',
        order: 3
      }
    ],
    tags: ['Data Science', 'Machine Learning', 'Python'],
    isActive: true,
    createdAt: '2024-01-10',
    updatedAt: '2024-01-10'
  }
];

export const CareerPathsProvider = ({ children }: { children: ReactNode }) => {
  const [careerPaths, setCareerPaths] = useState<CareerPath[]>(initialCareerPaths);

  const addCareerPath = (newCareerPath: Omit<CareerPath, 'id' | 'createdAt' | 'updatedAt'>) => {
    const careerPath: CareerPath = {
      ...newCareerPath,
      id: Date.now().toString(),
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0]
    };
    setCareerPaths(prev => [...prev, careerPath]);
  };

  const updateCareerPath = (id: string, updates: Partial<CareerPath>) => {
    setCareerPaths(prev => prev.map(path => 
      path.id === id 
        ? { ...path, ...updates, updatedAt: new Date().toISOString().split('T')[0] }
        : path
    ));
  };

  const deleteCareerPath = (id: string) => {
    setCareerPaths(prev => prev.filter(path => path.id !== id));
  };

  const getCareerPath = (id: string) => {
    return careerPaths.find(path => path.id === id);
  };

  return (
    <CareerPathsContext.Provider value={{
      careerPaths,
      addCareerPath,
      updateCareerPath,
      deleteCareerPath,
      getCareerPath
    }}>
      {children}
    </CareerPathsContext.Provider>
  );
};

export const useCareerPaths = () => {
  const context = useContext(CareerPathsContext);
  if (!context) {
    throw new Error('useCareerPaths must be used within a CareerPathsProvider');
  }
  return context;
};
