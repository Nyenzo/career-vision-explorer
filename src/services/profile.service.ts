import { apiClient } from "../lib/api-client";
import { Profile, ProfileUpdate, CompanyData } from "../types/api";
import { trackDbOperation } from "../utils/performance";

class ProfileService {
  private getStatusCode(error: any): number | undefined {
    return error?.status || error?.response?.status;
  }

  async getProfile(userId?: string): Promise<Profile> {
    return trackDbOperation("Load Profile", async () => {
      const endpoint = userId ? `/profile/${userId}` : "/profile/";
      return await apiClient.get<Profile>(endpoint);
    });
  }

  async updateProfile(profileData: ProfileUpdate): Promise<Profile> {
    return await apiClient.put<Profile>("/profile/", profileData);
  }

  async updateCompanyProfile(
    companyData: Partial<CompanyData>,
  ): Promise<Profile> {
    try {
      // Fetch the company profile so we can get its ID
      const me = await apiClient.get<any>("/profiles/company/me");
      if (me && me.id) {
        return await apiClient.put<Profile>(`/profiles/company/${me.id}`, companyData);
      }
    } catch (e: any) {
      const status = this.getStatusCode(e);
      if (status === 404) {
        // If it doesn't exist, create it via POST
        return await apiClient.post<Profile>("/profiles/company/", companyData);
      }
      if (status === 403) {
        const compat = await apiClient.get<any>("/profile/company");
        if (compat && compat.id) {
          return await apiClient.put<Profile>(`/profiles/company/${compat.id}`, companyData);
        }
      }
      throw e;
    }
    throw new Error("Failed to process company profile update");
  }

  async getCompanyProfile(): Promise<CompanyData> {
    try {
      return await apiClient.get<CompanyData>("/profiles/company/me");
    } catch (e: any) {
      const status = this.getStatusCode(e);
      if (status === 403) {
        return await apiClient.get<CompanyData>("/profile/company");
      }
      throw e;
    }
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

  async uploadCompanyLogo(file: File): Promise<any> {
    // Dedicated endpoint — always routes to the company-logos bucket
    return await apiClient.uploadFile<any>("/profile/company-logo", file, "image");
  }

  async uploadResume(file: File): Promise<{ resume_url: string; message: string }> {
    return await apiClient.uploadFile<{ resume_url: string; message: string }>(
      "/profile/resume",
      file,
      "resume"
    );
  }

  async addSkill(skill: string): Promise<void> {
    await apiClient.post(`/profile/skills?skill=${encodeURIComponent(skill)}`);
  }

  async removeSkill(skill: string): Promise<void> {
    await apiClient.delete(`/profile/skills/${encodeURIComponent(skill)}`);
  }

  async updateSkills(skills: string[]): Promise<void> {
    await apiClient.put("/profile/skills", skills);
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

  async parseResume(file: File): Promise<import("../types/api").ParseResumeResponse> {
    return await apiClient.uploadFile<import("../types/api").ParseResumeResponse>(
      "/ai/parse-resume",
      file,
      "file",
    );
  }

  async deleteProfile(): Promise<{ message: string }> {
    return await apiClient.delete<{ message: string }>("/profile/");
  }
}

export const profileService = new ProfileService();
