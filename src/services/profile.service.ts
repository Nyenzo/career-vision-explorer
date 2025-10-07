import { apiClient } from "../lib/api-client";
import { Profile, ProfileUpdate, CompanyData } from "../types/api";
import { trackDbOperation } from "../utils/performance";

class ProfileService {
  async getProfile(userId?: string): Promise<Profile> {
    return trackDbOperation("Load Profile", async () => {
      try {
        const endpoint = userId ? `/profiles/${userId}` : "/profile/";
        return await apiClient.getFast<Profile>(endpoint);
      } catch (error: any) {
        if (error.message?.includes("timed out")) {
          const endpoint = userId ? `/profiles/${userId}` : "/profile/";
          return await apiClient.get<Profile>(endpoint, { timeout: 45000 });
        }
        throw error;
      }
    });
  }

  async updateProfile(
    profileId: string,
    profileData: ProfileUpdate
  ): Promise<Profile> {
    return await apiClient.put<Profile>(`/profiles/${profileId}`, profileData);
  }

  async updateCompanyProfile(
    profileId: string,
    companyData: Partial<CompanyData>
  ): Promise<Profile> {
    return await apiClient.put<Profile>(
      `/profiles/${profileId}/company`,
      companyData
    );
  }

  async getCompanyProfile(profileId: string): Promise<Profile> {
    return await apiClient.get<Profile>(`/profiles/${profileId}/company`);
  }

  async getPublicProfile(userId: string): Promise<Profile> {
    return await apiClient.get<Profile>(`/profiles/${userId}/public`);
  }

  async getProfileStats(): Promise<{
    total_jobs_posted: number;
    profile_completeness: number;
    recommendations_count: number;
  }> {
    return await apiClient.get("/profile/stats");
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
    if (params.skills)
      params.skills.forEach((s) => queryParams.append("skills", s));
    if (params.account_type)
      queryParams.append("account_type", params.account_type);
    if (params.limit) queryParams.append("limit", params.limit.toString());
    if (params.offset) queryParams.append("offset", params.offset.toString());

    const queryString = queryParams.toString();
    return await apiClient.get<Profile[]>(
      `/profiles/search${queryString ? `?${queryString}` : ""}`
    );
  }

  async parseResume(file: File): Promise<any> {
    const response = await apiClient.uploadFile<any>(
      "/ai/upload-and-parse-cv",
      file
    );
    return response?.data || response;
  }
}

export const profileService = new ProfileService();
