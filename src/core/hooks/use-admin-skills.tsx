
import { useState, createContext, useContext, ReactNode } from 'react';
import { toast } from 'sonner';

export interface Skill {
  id: string;
  name: string;
  category: string;
  description: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  isActive: boolean;
  isVerified: boolean;
  prerequisites: string[];
  learningResources: string[];
  assessmentCriteria: string[];
  industryDemand: 'Low' | 'Medium' | 'High';
  averageSalaryImpact: number; // percentage increase
  createdAt: string;
  updatedAt: string;
}

export interface SkillCategory {
  id: string;
  name: string;
  description: string;
  skillCount: number;
}

interface AdminSkillsContextType {
  skills: Skill[];
  categories: SkillCategory[];
  addSkill: (skill: Omit<Skill, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateSkill: (id: string, skill: Partial<Skill>) => void;
  deleteSkill: (id: string) => void;
  getSkill: (id: string) => Skill | undefined;
  getSkillsByCategory: (category: string) => Skill[];
  addCategory: (category: Omit<SkillCategory, 'id' | 'skillCount'>) => void;
  updateCategory: (id: string, category: Partial<SkillCategory>) => void;
  deleteCategory: (id: string) => void;
}

const AdminSkillsContext = createContext<AdminSkillsContextType | undefined>(undefined);

const initialSkills: Skill[] = [
  {
    id: '1',
    name: 'JavaScript',
    category: 'Programming',
    description: 'Dynamic programming language for web development',
    level: 'Intermediate',
    isActive: true,
    isVerified: true,
    prerequisites: ['HTML', 'CSS'],
    learningResources: ['MDN Documentation', 'JavaScript.info'],
    assessmentCriteria: ['Variable manipulation', 'Function creation', 'DOM manipulation'],
    industryDemand: 'High',
    averageSalaryImpact: 25,
    createdAt: '2024-01-15',
    updatedAt: '2024-01-15'
  },
  {
    id: '2',
    name: 'React',
    category: 'Frontend',
    description: 'JavaScript library for building user interfaces',
    level: 'Intermediate',
    isActive: true,
    isVerified: true,
    prerequisites: ['JavaScript', 'HTML', 'CSS'],
    learningResources: ['React Documentation', 'React Tutorial'],
    assessmentCriteria: ['Component creation', 'State management', 'Props usage'],
    industryDemand: 'High',
    averageSalaryImpact: 30,
    createdAt: '2024-01-10',
    updatedAt: '2024-01-10'
  },
  {
    id: '3',
    name: 'Python',
    category: 'Programming',
    description: 'High-level programming language',
    level: 'Beginner',
    isActive: true,
    isVerified: true,
    prerequisites: [],
    learningResources: ['Python.org', 'Codecademy Python'],
    assessmentCriteria: ['Basic syntax', 'Data structures', 'Functions'],
    industryDemand: 'High',
    averageSalaryImpact: 28,
    createdAt: '2024-01-08',
    updatedAt: '2024-01-08'
  },
  {
    id: '4',
    name: 'SQL',
    category: 'Database',
    description: 'Structured Query Language for database management',
    level: 'Intermediate',
    isActive: true,
    isVerified: true,
    prerequisites: ['Database concepts'],
    learningResources: ['W3Schools SQL', 'SQLBolt'],
    assessmentCriteria: ['SELECT queries', 'Joins', 'Data manipulation'],
    industryDemand: 'High',
    averageSalaryImpact: 20,
    createdAt: '2024-01-05',
    updatedAt: '2024-01-05'
  },
  {
    id: '5',
    name: 'Docker',
    category: 'DevOps',
    description: 'Containerization platform',
    level: 'Advanced',
    isActive: true,
    isVerified: false,
    prerequisites: ['Linux basics', 'Command line'],
    learningResources: ['Docker Documentation', 'Docker Tutorial'],
    assessmentCriteria: ['Container creation', 'Image management', 'Docker Compose'],
    industryDemand: 'Medium',
    averageSalaryImpact: 22,
    createdAt: '2024-01-03',
    updatedAt: '2024-01-03'
  }
];

const initialCategories: SkillCategory[] = [
  { id: '1', name: 'Programming', description: 'Programming languages and frameworks', skillCount: 2 },
  { id: '2', name: 'Frontend', description: 'Frontend development technologies', skillCount: 1 },
  { id: '3', name: 'Database', description: 'Database management and query languages', skillCount: 1 },
  { id: '4', name: 'DevOps', description: 'Development operations and deployment', skillCount: 1 },
  { id: '5', name: 'Design', description: 'UI/UX design and tools', skillCount: 0 },
  { id: '6', name: 'Cloud', description: 'Cloud platforms and services', skillCount: 0 }
];

export const AdminSkillsProvider = ({ children }: { children: ReactNode }) => {
  const [skills, setSkills] = useState<Skill[]>(initialSkills);
  const [categories, setCategories] = useState<SkillCategory[]>(initialCategories);

  const addSkill = (newSkill: Omit<Skill, 'id' | 'createdAt' | 'updatedAt'>) => {
    const skill: Skill = {
      ...newSkill,
      id: Date.now().toString(),
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0]
    };
    setSkills(prev => [...prev, skill]);
    
    // Update category skill count
    setCategories(prev => prev.map(cat => 
      cat.name === skill.category 
        ? { ...cat, skillCount: cat.skillCount + 1 }
        : cat
    ));
    
    toast.success(`Skill "${skill.name}" added successfully`);
  };

  const updateSkill = (id: string, updates: Partial<Skill>) => {
    setSkills(prev => prev.map(skill => 
      skill.id === id 
        ? { ...skill, ...updates, updatedAt: new Date().toISOString().split('T')[0] }
        : skill
    ));
    toast.success('Skill updated successfully');
  };

  const deleteSkill = (id: string) => {
    const skill = skills.find(s => s.id === id);
    if (skill) {
      setSkills(prev => prev.filter(s => s.id !== id));
      
      // Update category skill count
      setCategories(prev => prev.map(cat => 
        cat.name === skill.category 
          ? { ...cat, skillCount: Math.max(0, cat.skillCount - 1) }
          : cat
      ));
      
      toast.success(`Skill "${skill.name}" deleted successfully`);
    }
  };

  const getSkill = (id: string) => {
    return skills.find(skill => skill.id === id);
  };

  const getSkillsByCategory = (category: string) => {
    return skills.filter(skill => skill.category === category);
  };

  const addCategory = (newCategory: Omit<SkillCategory, 'id' | 'skillCount'>) => {
    const category: SkillCategory = {
      ...newCategory,
      id: Date.now().toString(),
      skillCount: 0
    };
    setCategories(prev => [...prev, category]);
    toast.success(`Category "${category.name}" added successfully`);
  };

  const updateCategory = (id: string, updates: Partial<SkillCategory>) => {
    setCategories(prev => prev.map(cat => 
      cat.id === id ? { ...cat, ...updates } : cat
    ));
    toast.success('Category updated successfully');
  };

  const deleteCategory = (id: string) => {
    const category = categories.find(c => c.id === id);
    if (category) {
      if (category.skillCount > 0) {
        toast.error('Cannot delete category with existing skills');
        return;
      }
      setCategories(prev => prev.filter(c => c.id !== id));
      toast.success(`Category "${category.name}" deleted successfully`);
    }
  };

  return (
    <AdminSkillsContext.Provider value={{
      skills,
      categories,
      addSkill,
      updateSkill,
      deleteSkill,
      getSkill,
      getSkillsByCategory,
      addCategory,
      updateCategory,
      deleteCategory
    }}>
      {children}
    </AdminSkillsContext.Provider>
  );
};

export const useAdminSkills = () => {
  const context = useContext(AdminSkillsContext);
  if (!context) {
    throw new Error('useAdminSkills must be used within an AdminSkillsProvider');
  }
  return context;
};
