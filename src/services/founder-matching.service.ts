// src/services/founder-matching.service.ts
import { apiClient } from "../lib/api-client";

/* ============================== */
/* ========= INTERFACES ========= */
/* ============================== */

export interface CofounderProfile {
  profile_id?: string;
  user_id?: string;
  current_role: string;
  years_experience: number;
  technical_skills: string[];
  soft_skills: string[];
  seeking_roles: string[];
  industries: string[];
  commitment_level: "Full-time" | "Part-time" | "Flexible" | "Contract";
  location_preference: "Remote" | "Hybrid" | "On-site";
  preferred_locations: string[];
  achievements: string[];
  education: string[];
  certifications: string[];
  linkedin_url?: string;
  portfolio_url?: string;
  bio: string;
  is_active?: boolean;
  created_at?: string;
  views_count?: number;
  matches_count?: number;
  interested_count?: number;
  mutual_interest_count?: number;
  photos?: string[];
}

export interface MatchProfile {
  match_id: string;
  matched_profile: {
    profile_id: string;
    current_role: string;
    years_experience: number;
    technical_skills: string[];
    seeking_roles: string[];
    education: string[];
    bio: string;
    linkedin_url?: string;
    portfolio_url?: string;
    achievements?: string[];
    soft_skills?: string[];
    industries?: string[];
    commitment_level?: string;
    location_preference?: string;
    photos?: string[];
  };
  overall_score: number;
  score_breakdown: {
    skill_compatibility: number;
    experience_match: number;
    role_alignment: number;
  };
  status: "suggested" | "interested" | "declined" | "mutual_interest" | "skipped";
  mutual_interest_at?: string;
}

export interface DiscoverMatchesRequest {
  limit?: number;
  min_score?: number;
  filters?: {
    industries?: string[];
    location_preferences?: string[];
    commitment_level?: string[];
    min_experience?: number;
    max_experience?: number;
  };
}

export interface MatchActionResponse {
  match_id: string;
  status: string;
  user_action: string;
  mutual_interest: boolean;
  message: string;
}

export interface Statistics {
  total_matches: number;
  mutual_interests: number;
  profile_views: number;
  average_match_score: number;
  top_matching_industries: Array<{ industry: string; count: number }>;
  engagement_score: number;
}

export interface PhotoUploadResponse {
  photo_url: string;
  photo_count: number;
}

export interface PhotoUploadStatus {
  uploaded: boolean;
  photos: string[];
}

export interface GroupParticipant {
  profile_id: string;
  user_id?: string;
  name?: string;
  current_role?: string;
  photo_url?: string;
}

export interface Conversation {
  conversation_id: string;
  match_id: string;
  profile_1_id: string;
  profile_2_id: string;
  last_message_at: string;
  unread_count: number;
  created_at: string;
  messages: Message[];
  other_profile: CofounderProfile;
  conversation_type?: "direct" | "project_group";
  project_id?: string | null;
  title?: string | null;
  created_by?: string | null;
  project_description?: string | null;
  participant_count?: number;
  participants?: GroupParticipant[];
}

export interface ConversationListResponse {
  conversations: Array<{
    conversation_id: string;
    match_profile: CofounderProfile;
    last_message: string;
    unread_count: number;
  }>;
}

export interface Message {
  message_id: string;
  sender_id: string;
  text: string;
  timestamp: string;
}

/* ============================== */
/* ========= PROJECTS =========== */
/* ============================== */

export interface IdeaProject {
  id: string;
  profile_id: string;
  user_id: string;
  title: string;
  description?: string;
  idea_description?: string;
  problem_statement?: string;
  target_market?: string;
  stage?: string;
  roles_needed?: string[];
  tech_stack?: string[];
  equity_split?: string;
  timeline?: string;
  status?: string;
  max_members?: number;
  created_at?: string;
  updated_at?: string;
  owner_name?: string;
}

export interface ProjectMember {
  id: string;
  project_id: string;
  profile_id: string;
  user_id: string;
  role: string;
  status: "pending" | "approved" | "rejected" | "removed";
  member_name: string;
  member_role: string;
  member_photo?: string | null;
  requested_at?: string;
  responded_at?: string;
}

export interface ProjectWithMembers extends IdeaProject {
  members: ProjectMember[];
  owner_name: string;
  owner_photo?: string | null;
  member_count: number;
  pending_count: number;
  has_group_chat: boolean;
  group_chat_conversation_id?: string | null;
  user_membership_status?: "owner" | "pending" | "approved" | "rejected" | "removed" | null;
}

export interface ProjectGroupChat {
  conversation_id: string;
  project_id: string;
  title: string;
  conversation_type: string;
  participant_count: number;
  created_at: string;
}

/* ============================== */
/* ========= SERVICE ============ */
/* ============================== */

class CofounderMatchingService {
  private readonly base = "/api/v1/cofounder-matching";

  /* Profile */
  async createProfile(profileData: Omit<CofounderProfile, "profile_id" | "user_id">) {
    return apiClient.post(`${this.base}/profile`, profileData);
  }

  async getProfile() {
    return apiClient.get(`${this.base}/profile`);
  }

  async updateProfile(profileData: Partial<CofounderProfile>) {
    return apiClient.put(`${this.base}/profile`, profileData);
  }

  async deleteProfile() {
    return apiClient.delete(`${this.base}/profile`);
  }

  /* Photos */
  async uploadPhoto(file: File) {
    return apiClient.uploadFile(`${this.base}/profile/photos`, file);
  }

  async getPhotoStatus() {
    return apiClient.get(`${this.base}/profile/photos`);
  }

  async deletePhoto(photoUrl: string) {
    return apiClient.delete(
      `${this.base}/profile/photos?photo_url=${encodeURIComponent(photoUrl)}`
    );
  }

  /* Matching */
  async discoverMatches(request: DiscoverMatchesRequest) {
    return apiClient.post(`${this.base}/discover`, request);
  }

  async swipeRight(matchId: string) {
    return apiClient.post(`${this.base}/matches/${matchId}/action`, {
      action: "interested",
    });
  }

  async swipeLeft(matchId: string) {
    return apiClient.post(`${this.base}/matches/${matchId}/action`, {
      action: "declined",
    });
  }

  async swipeSkip(matchId: string) {
    return apiClient.post(`${this.base}/matches/${matchId}/action`, {
      action: "skipped",
    });
  }

  async getMutualMatches() {
    return apiClient.get(`${this.base}/matches/mutual`);
  }

  async getPendingInterests() {
    return apiClient.get(`${this.base}/matches/pending-interests`);
  }

  /* Messaging */
  async getConversations(limit = 20, offset = 0) {
    const params = new URLSearchParams({
      limit: limit.toString(),
      offset: offset.toString(),
    });
    return apiClient.get(`${this.base}/conversations?${params}`);
  }

  async getMessages(conversationId: string, limit = 50, beforeId?: string) {
    const params = new URLSearchParams({ limit: limit.toString() });
    if (beforeId) params.append("before_id", beforeId);
    return apiClient.get(
      `${this.base}/conversations/${conversationId}/messages?${params}`
    );
  }

  async sendMessage(matchId: string, messageText: string) {
    return apiClient.post(
      `${this.base}/conversations/${matchId}/messages`,
      { message_text: messageText }
    );
  }

  async sendGroupMessage(conversationId: string, messageText: string) {
    return apiClient.post(
      `${this.base}/group-conversations/${conversationId}/messages`,
      { message_text: messageText }
    );
  }

  async markConversationRead(conversationId: string) {
    return apiClient.put(`${this.base}/conversations/${conversationId}/read`);
  }

  /* Projects */
  async listProjects(profileId?: string) {
    const query = profileId ? `?profile_id=${profileId}` : "";
    return apiClient.get(`${this.base}/projects${query}`);
  }

  async browseMatchedProjects() {
    return apiClient.get(`${this.base}/projects/browse`);
  }

  async getProjectDetail(projectId: string) {
    return apiClient.get(`${this.base}/projects/${projectId}`);
  }

  async createProject(data: Partial<IdeaProject>) {
    return apiClient.post(`${this.base}/projects`, data);
  }

  async updateProject(projectId: string, data: Partial<IdeaProject>) {
    return apiClient.put(`${this.base}/projects/${projectId}`, data);
  }

  async deleteProject(projectId: string) {
    return apiClient.delete(`${this.base}/projects/${projectId}`);
  }
}

export const cofounderMatchingService = new CofounderMatchingService();