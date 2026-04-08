import { apiClient } from '../lib/api-client';
import { 
  Skill, 
  SkillCreate, 
  SkillAssessment, 
  SkillAssessmentResult, 
  Recommendation,
  PaginatedResponse 
} from '../types/api';

export interface SkillFilters {
  category?: string;
  demand_level?: 'High' | 'Medium' | 'Low';
  search?: string;
  page?: number;
  limit?: number;
}

class SkillsService {
  async getSkills(filters?: SkillFilters): Promise<PaginatedResponse<Skill>> {
    const queryParams = new URLSearchParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });
    }
    
    const queryString = queryParams.toString();
    const endpoint = queryString ? `/skills?${queryString}` : '/skills';
    
    return await apiClient.get<PaginatedResponse<Skill>>(endpoint);
  }

  async getSkillById(skillId: string): Promise<Skill> {
    return await apiClient.get<Skill>(`/skills/${skillId}`);
  }

  async createSkill(skillData: SkillCreate): Promise<Skill> {
    return await apiClient.post<Skill>('/skills', skillData);
  }

  async updateSkill(skillId: string, skillData: Partial<SkillCreate>): Promise<Skill> {
    return await apiClient.put<Skill>(`/skills/${skillId}`, skillData);
  }

  async deleteSkill(skillId: string): Promise<{ message: string }> {
    return await apiClient.delete<{ message: string }>(`/skills/${skillId}`);
  }

  async getSkillsByCategory(category: string): Promise<Skill[]> {
    return await apiClient.get<Skill[]>(`/skills/category/${category}`);
  }

  async getHighDemandSkills(limit = 10): Promise<Skill[]> {
    return await apiClient.get<Skill[]>(`/skills/demand/high?limit=${limit}`);
  }

  async getSkillCategories(): Promise<string[]> {
    return await apiClient.get<string[]>('/skills/categories/list');
  }
}

export const skillsService = new SkillsService();