
import { create } from "zustand";
import { toast } from "sonner";

export interface Skill {
  id: string;
  name: string;
  category: string;
  isVerified: boolean;
  proficiencyLevel: number; // 1-5
  lastAssessed?: string;
}

interface SkillsStore {
  skills: Skill[];
  totalSkills: number;
  verifiedSkills: number;
  addSkill: (skill: Omit<Skill, 'id'>) => void;
  updateSkillProficiency: (id: string, proficiencyLevel: number) => void;
  verifySkill: (id: string) => void;
  getSkillsByCategory: (category: string) => Skill[];
}

const initialSkills: Skill[] = [
  { id: "1", name: "JavaScript", category: "Programming", isVerified: true, proficiencyLevel: 4 },
  { id: "2", name: "React", category: "Frontend", isVerified: true, proficiencyLevel: 4 },
  { id: "3", name: "TypeScript", category: "Programming", isVerified: true, proficiencyLevel: 3 },
  { id: "4", name: "Node.js", category: "Backend", isVerified: true, proficiencyLevel: 3 },
  { id: "5", name: "Python", category: "Programming", isVerified: true, proficiencyLevel: 3 },
  { id: "6", name: "SQL", category: "Database", isVerified: true, proficiencyLevel: 4 },
  { id: "7", name: "Git", category: "Tools", isVerified: true, proficiencyLevel: 4 },
  { id: "8", name: "Docker", category: "DevOps", isVerified: true, proficiencyLevel: 2 },
  { id: "9", name: "AWS", category: "Cloud", isVerified: false, proficiencyLevel: 2 },
  { id: "10", name: "GraphQL", category: "Backend", isVerified: false, proficiencyLevel: 2 },
  { id: "11", name: "MongoDB", category: "Database", isVerified: false, proficiencyLevel: 2 },
  { id: "12", name: "Vue.js", category: "Frontend", isVerified: false, proficiencyLevel: 1 },
  { id: "13", name: "Machine Learning", category: "AI", isVerified: false, proficiencyLevel: 1 },
  { id: "14", name: "Kubernetes", category: "DevOps", isVerified: false, proficiencyLevel: 1 },
  { id: "15", name: "Angular", category: "Frontend", isVerified: false, proficiencyLevel: 1 },
];

export const useSkillsAssessment = create<SkillsStore>((set, get) => ({
  skills: initialSkills,
  totalSkills: initialSkills.length,
  verifiedSkills: initialSkills.filter(skill => skill.isVerified).length,
  
  addSkill: (skill) => {
    const newSkill: Skill = {
      ...skill,
      id: Date.now().toString(),
    };
    
    set((state) => ({
      skills: [...state.skills, newSkill],
      totalSkills: state.totalSkills + 1,
    }));
    
    toast.success(`Added ${skill.name} to your skills`);
  },
  
  updateSkillProficiency: (id, proficiencyLevel) => {
    set((state) => ({
      skills: state.skills.map((skill) =>
        skill.id === id ? { ...skill, proficiencyLevel, lastAssessed: new Date().toISOString() } : skill
      ),
    }));
  },
  
  verifySkill: (id) => {
    set((state) => {
      const updatedSkills = state.skills.map((skill) =>
        skill.id === id ? { ...skill, isVerified: true, lastAssessed: new Date().toISOString() } : skill
      );
      
      return {
        skills: updatedSkills,
        verifiedSkills: updatedSkills.filter(skill => skill.isVerified).length,
      };
    });
    
    const skill = get().skills.find(s => s.id === id);
    if (skill) {
      toast.success(`${skill.name} skill verified!`);
    }
  },
  
  getSkillsByCategory: (category) => {
    return get().skills.filter(skill => skill.category === category);
  },
}));
