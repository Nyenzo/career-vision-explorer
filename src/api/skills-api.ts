// Skills API - now using real backend integration
import { skillsService, SkillFilters } from '../../services/skills.service';
import { 
  Skill, 
  SkillCreate, 
  SkillAssessmentResult, 
  Recommendation,
  PaginatedResponse 
} from '../../types/api';

export class SkillsApi {
  static async getUserSkills(): Promise<string[]> {
    // Get user skills from profile
    const { profileService } = await import('../../services/profile.service');
    const profile = await profileService.getProfile();
    return profile.skills || [];
  }

  static async addSkill(name: string, category?: string): Promise<{ message: string }> {
    // Add skill to user profile
    const { profileService } = await import('../../services/profile.service');
    return profileService.addSkill(name);
  }

  static async removeSkill(name: string): Promise<{ message: string }> {
    const { profileService } = await import('../../services/profile.service');
    return profileService.removeSkill(name);
  }

  static async getSkills(filters?: SkillFilters): Promise<PaginatedResponse<Skill>> {
    return skillsService.getSkills(filters);
  }

  static async getSkillById(skillId: string): Promise<Skill> {
    return skillsService.getSkillById(skillId);
  }

  static async createSkill(skillData: SkillCreate): Promise<Skill> {
    return skillsService.createSkill(skillData);
  }

  static async updateSkill(skillId: string, skillData: Partial<SkillCreate>): Promise<Skill> {
    return skillsService.updateSkill(skillId, skillData);
  }

  static async deleteSkill(skillId: string): Promise<{ message: string }> {
    return skillsService.deleteSkill(skillId);
  }


  // Get skill categories
  static async getSkillCategories(): Promise<string[]> {
    return skillsService.getSkillCategories();
  }

  // Utility methods
  static getDemandLevelColor(level: string): string {
    const colors = {
      'High': 'green',
      'Medium': 'yellow',
      'Low': 'red'
    };
    return colors[level as keyof typeof colors] || 'gray';
  }

  static formatSkillLevel(score: number): string {
    if (score >= 90) return 'Expert';
    if (score >= 75) return 'Advanced';
    if (score >= 60) return 'Intermediate';
    if (score >= 40) return 'Beginner';
    return 'Novice';
  }

  static getSkillIcon(category: string): string {
    const icons = {
      'Frontend': '🎨',
      'Backend': '⚙️',
      'Database': '🗄️',
      'Mobile': '📱',
      'DevOps': '🚀',
      'Design': '🎨',
      'Marketing': '📈',
      'Management': '👥'
    };
    return icons[category as keyof typeof icons] || '💼';
  }
}
