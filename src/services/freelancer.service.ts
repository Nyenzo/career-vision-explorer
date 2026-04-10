import { apiClient } from '../lib/api-client';
import {
  Freelancer,
  FreelancerCreate,
  FreelancerUpdate,
  FreelancerListResponse,
  FreelancerFilter,
  FreelancerInquiry,
  FreelancerInquiryCreate,
  FreelancerInquiryReply,
  FreelancerInquiryReplyCreate,
  FreelancerReview,
  FreelancerReviewCreate,
} from '../types/freelancer';

class FreelancerService {

  async createFreelancer(data: FreelancerCreate): Promise<Freelancer> {
    return apiClient.post<Freelancer>('/freelancers/create', data);
  }

  async getFreelancer(freelancerId: string): Promise<Freelancer> {
    return await apiClient.get<Freelancer>(`/freelancers/${freelancerId}`);
  }

  async getFreelancerEnriched(freelancerId: string): Promise<Freelancer> {
    return await apiClient.get<Freelancer>(`/freelancers/${freelancerId}/enriched`);
  }

  async getFreelancerByUserId(userId: string): Promise<Freelancer> {
    return apiClient.get<Freelancer>(`/freelancers/user/${userId}`);
  }

  async updateFreelancer(
    freelancerId: string,
    data: FreelancerUpdate
  ): Promise<Freelancer> {
    return apiClient.put<Freelancer>(`/freelancers/${freelancerId}`, data);
  }

  async listFreelancers(
    filters: FreelancerFilter = {},
    limit: number = 20,
    offset: number = 0
  ): Promise<FreelancerListResponse> {
    const params = new URLSearchParams({
      limit: limit.toString(),
      offset: offset.toString(),
    });

    // Add filter parameters
    if (filters.skills?.length) {
      filters.skills.forEach(skill => params.append('skills', skill));
    }
    if (filters.min_rate !== undefined) {
      params.append('min_rate', filters.min_rate.toString());
    }
    if (filters.max_rate !== undefined) {
      params.append('max_rate', filters.max_rate.toString());
    }
    if (filters.min_experience !== undefined) {
      params.append('min_experience', filters.min_experience.toString());
    }
    if (filters.available_only !== undefined) {
      params.append('available_only', filters.available_only.toString());
    }
    if (filters.location) {
      params.append('location', filters.location);
    }
    if (filters.search) {
      params.append('search', filters.search);
    }

    return apiClient.get<FreelancerListResponse>(`/freelancers/?${params.toString()}`);
  }

  async deleteFreelancer(freelancerId: string): Promise<{ message: string }> {
    return apiClient.delete<{ message: string }>(`/freelancers/${freelancerId}`);
  }

  async switchRole(newRole: 'job_seeker' | 'freelancer'): Promise<{ message: string; new_role: string }> {
    return apiClient.put<{ message: string; new_role: string }>('/freelancers/switch-role', { new_role: newRole });
  }

  // Helper method to check if current user has a freelancer profile
  async hasFreelancerProfile(): Promise<boolean> {
    try {
      const userStr = localStorage.getItem('user');
      if (!userStr) return false;

      const user = JSON.parse(userStr);
      if (!user?.user_id) return false;

      await this.getFreelancerByUserId(user.user_id);
      return true;
    } catch {
      return false;
    }
  }

  async autoEnhanceProfile(freelancerId: string): Promise<Freelancer> {
    return apiClient.post<Freelancer>(`/freelancers/${freelancerId}/auto-enhance`);
  }

  async updateFreelancerPricing(
    freelancerId: string,
    pricingData: {
      hourly_rate?: number;
      pricing?: any;
    }
  ): Promise<Freelancer> {
    return apiClient.put<Freelancer>(`/freelancers/${freelancerId}/pricing`, pricingData);
  }

  async syncPortfolio(freelancerId: string): Promise<{
    status: string;
    portfolio_sync: any;
    image_updates: any;
    skill_cleanup: any;
    portfolio_cleanup: any;
    message: string;
  }> {
    return apiClient.post(`/freelancers/${freelancerId}/sync-portfolio`);
  }

  async enhancePortfolioImages(freelancerId: string): Promise<{
    status: string;
    message: string;
    updated_count: number;
  }> {
    return apiClient.post(`/freelancers/${freelancerId}/enhance-portfolio-images`);
  }

  async contactFreelancer(
    freelancerId: string,
    inquiryData: FreelancerInquiryCreate
  ): Promise<{
    inquiry_id: string;
    freelancer_id: string;
    sender_user_id: string;
    sender_name: string;
    sender_email: string;
    message: string;
    selected_tier?: string;
    tier_price?: number;
    created_at: string;
  }> {
    return apiClient.post(`/freelancers/${freelancerId}/contact`, inquiryData);
  }

  async getMyFreelancerInquiries(
    limit: number = 20,
    offset: number = 0
  ): Promise<FreelancerInquiry[]> {
    return apiClient.get(`/freelancers/inquiries/me?limit=${limit}&offset=${offset}`);
  }

  async getMySentFreelancerInquiries(
    limit: number = 20,
    offset: number = 0
  ): Promise<FreelancerInquiry[]> {
    return apiClient.get(`/freelancers/inquiries/sent/me?limit=${limit}&offset=${offset}`);
  }

  async replyToFreelancerInquiry(
    inquiryId: string,
    payload: FreelancerInquiryReplyCreate
  ): Promise<FreelancerInquiryReply> {
    return apiClient.post(`/freelancers/inquiries/${inquiryId}/reply`, payload);
  }

  async getFreelancerReviews(
    freelancerId: string,
    limit: number = 20
  ): Promise<FreelancerReview[]> {
    return apiClient.get(`/freelancers/${freelancerId}/reviews?limit=${limit}`);
  }

  async createFreelancerReview(
    freelancerId: string,
    reviewData: FreelancerReviewCreate
  ): Promise<FreelancerReview> {
    return apiClient.post(`/freelancers/${freelancerId}/reviews`, reviewData);
  }
}

export const freelancerService = new FreelancerService();
