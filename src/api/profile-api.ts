// Profile API - now using real backend integration
import { profileService } from '../../services/profile.service';
import { Profile, ProfileUpdate } from '../../types/api';

export class ProfileApi {
  static async getProfile(): Promise<Profile> {
    return profileService.getProfile();
  }

  static async updateProfile(profileData: ProfileUpdate): Promise<Profile> {
    return profileService.updateProfile(profileData);
  }


  static async getPublicProfile(userId: string): Promise<Profile> {
    return profileService.getPublicProfile(userId);
  }

  static async deleteProfile(): Promise<{ message: string }> {
    return profileService.deleteProfile();
  }

  // Profile analytics
  static async getProfileAnalytics(): Promise<{
    profile_views: number;
    application_count: number;
    skill_assessments: number;
    completion_percentage: number;
  }> {
    return profileService.getProfileAnalytics();
  }

  // Skills management
  static async addSkill(skill: string): Promise<{ message: string }> {
    return profileService.addSkill(skill);
  }

  static async removeSkill(skill: string): Promise<{ message: string }> {
    return profileService.removeSkill(skill);
  }


  // Utility methods for profile completion
  static calculateCompletionPercentage(profile: Profile): number {
    let completed = 0;
    const total = 6; // Total fields to check

    if (profile.name) completed++;
    if (profile.email) completed++;
    if (profile.skills && profile.skills.length > 0) completed++;
    if (profile.resume_link) completed++;
    // Add more fields as needed

    return Math.round((completed / total) * 100);
  }

  static getIncompleteFields(profile: Profile): string[] {
    const incomplete: string[] = [];

    if (!profile.name) incomplete.push('name');
    if (!profile.skills || profile.skills.length === 0) incomplete.push('skills');
    if (!profile.resume_link) incomplete.push('resume');
    // Add more fields as needed

    return incomplete;
  }
}
