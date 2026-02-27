import { apiClient } from "../lib/api-client";
import { Profile, ProfileUpdate, CompanyData } from "../types/api";
import { trackDbOperation } from "../utils/performance";

class ProfileService {
  async getProfile(userId?: string): Promise<Profile> {
    return trackDbOperation("Load Profile", async () => {
      try {
        const endpoint = userId ? `/profile/${userId}` : "/profile/";
        return await apiClient.getFast<Profile>(endpoint);
      } catch (error: any) {
        if (error.message?.includes("timed out")) {
          const fallbackEndpoint = userId ? `/profile/${userId}` : "/profile/";
          return await apiClient.get<Profile>(fallbackEndpoint, {
            timeout: 45000,
          });
        }
        throw error;
      }
    });
  }

  async updateProfile(profileData: ProfileUpdate): Promise<Profile> {
    return await apiClient.put<Profile>("/profile/", profileData);
  }

  async updateCompanyProfile(
    companyData: Partial<CompanyData>,
  ): Promise<Profile> {
    return await apiClient.put<Profile>("/profile/", companyData);
  }

  async getCompanyProfile(profileId: string): Promise<Profile> {
    return await apiClient.get<Profile>("/profile/company");
  }

  async getPublicProfile(userId: string): Promise<Profile> {
    return await apiClient.get<Profile>(`/profile/${userId}`);
  }

  async getProfileStats(): Promise<{
    total_jobs_posted: number;
    profile_completeness: number;
    recommendations_count: number;
  }> {
    return await apiClient.get("/profile/stats");
  }

  async uploadProfileImage(file: File): Promise<any> {
    // The backend expects the field name to be 'image'
    return await apiClient.uploadFile<any>("/profile/image", file, "image");
  }

  async addSkill(skill: string): Promise<void> {
    await apiClient.post("/profile/skills", { skill });
  }

  async removeSkill(skill: string): Promise<void> {
    await apiClient.delete(`/profile/skills/${encodeURIComponent(skill)}`);
  }

  async updateSkills(skills: string[]): Promise<void> {
    await apiClient.put("/profile/skills", { skills });
  }

  async searchProfiles(params: {
    skills?: string[];
    account_type?: "job_seeker" | "employer" | "admin";
    limit?: number;
    offset?: number;
  }): Promise<Profile[]> {
    const queryParams = new URLSearchParams();

    if (params.skills) {
      params.skills.forEach((s) => queryParams.append("skills", s));
    }
    if (params.account_type) {
      queryParams.append("account_type", params.account_type);
    }
    if (params.limit) {
      queryParams.append("limit", params.limit.toString());
    }
    if (params.offset) {
      queryParams.append("offset", params.offset.toString());
    }

    const queryString = queryParams.toString();
    return await apiClient.get<Profile[]>(
      `/profile/search/profiles${queryString ? `?${queryString}` : ""}`,
    );
  }

  async parseResume(file: File): Promise<any> {
    const response = await apiClient.uploadFile<any>(
      "/ai/upload-and-parse-cv",
      file,
    );
    return response?.data || response;
  }

  async deleteProfile(): Promise<{ message: string }> {
    return await apiClient.delete<{ message: string }>("/profile/");
  }
}

export const profileService = new ProfileService();
