import { apiClient } from "../lib/api-client";
import type {
  CofounderMatchProfile,
  CofounderMatchProfileUpdate,
  OnboardingData,
  OnboardingValidationResponse,
  CompleteOnboardingResponse,
  MatchDiscoveryRequest,
  MatchDiscoveryResponse,
  MatchListResponse,
  MatchStatistics,
  CofounderMatchWithProfile,
  SwipeAction,
  SwipeActionResponse,
  MatchPreferences,
  FollowStats,
  Message,
  Conversation,
  ConversationListResponse,
  PhotoUploadStatus,
  PhotoUploadResponse,
  IdeaProject,
  ProjectWithMembers,
  MemberRole,
} from "../types/founder-matching";

const BASE = "/cofounder-matching";

class CofounderMatchingService {
  private readonly cacheTtlMs = 15000;
  private cache = new Map<string, { expiresAt: number; value: unknown }>();

  private getCached<T>(key: string): T | null {
    const cached = this.cache.get(key);
    if (!cached) {
      return null;
    }
    if (cached.expiresAt <= Date.now()) {
      this.cache.delete(key);
      return null;
    }
    return cached.value as T;
  }

  private setCached<T>(key: string, value: T): void {
    this.cache.set(key, { expiresAt: Date.now() + this.cacheTtlMs, value });
  }

  private invalidateCache(prefixes: string[] = []): void {
    if (prefixes.length === 0) {
      this.cache.clear();
      return;
    }
    Array.from(this.cache.keys()).forEach((key) => {
      if (prefixes.some((prefix) => key.startsWith(prefix))) {
        this.cache.delete(key);
      }
    });
  }

  private normalizeMatch(match: any): any {
    if (!match) return match;
    if (match.id && !match.match_id) match.match_id = match.id;
    if (match.matched_profile && match.matched_profile.id && !match.matched_profile.profile_id) {
      match.matched_profile.profile_id = match.matched_profile.id;
    }
    return match;
  }

  private normalizeMessage(message: any): Message {
    const normalized = { ...(message || {}) };
    if (normalized.id && !normalized.message_id) {
      normalized.message_id = normalized.id;
    }
    if (normalized.conversation_id == null && normalized.conversationId != null) {
      normalized.conversation_id = normalized.conversationId;
    }
    return normalized as Message;
  }

  private normalizeConversation(conversation: any): Conversation {
    const normalized = { ...(conversation || {}) };
    if (normalized.id && !normalized.conversation_id) {
      normalized.conversation_id = normalized.id;
    }
    normalized.other_profile_photo_url = normalized.other_profile_photo_url ?? undefined;
    normalized.other_profile_user_id = normalized.other_profile_user_id ?? undefined;
    normalized.other_last_seen_at = normalized.other_last_seen_at ?? undefined;
    if (Array.isArray(normalized.messages)) {
      normalized.messages = normalized.messages.map((msg: any) => this.normalizeMessage(msg));
    }
    return normalized as Conversation;
  }

  // --- Profile ---

  async getProfile(): Promise<CofounderMatchProfile> {
    const profile = await apiClient.get<any>(`${BASE}/profile`);
    if (profile?.id && !profile?.profile_id) {
      profile.profile_id = profile.id;
    }
    return profile as CofounderMatchProfile;
  }

  async updateProfile(data: CofounderMatchProfileUpdate): Promise<CofounderMatchProfile> {
    return apiClient.put<CofounderMatchProfile>(`${BASE}/profile`, data);
  }

  async deactivateProfile(): Promise<void> {
    return apiClient.delete<void>(`${BASE}/profile`);
  }

  // --- Photos ---

  async uploadPhoto(file: File): Promise<PhotoUploadResponse> {
    const form = new FormData();
    form.append("file", file);
    return apiClient.post<PhotoUploadResponse>(`${BASE}/profile/photos`, form);
  }

  async getPhotoStatus(): Promise<PhotoUploadStatus> {
    return apiClient.get<PhotoUploadStatus>(`${BASE}/profile/photos`);
  }

  async deletePhoto(photoUrl: string): Promise<{ status: string; message: string }> {
    const params = new URLSearchParams({ photo_url: photoUrl });
    return apiClient.delete<{ status: string; message: string }>(`${BASE}/profile/photos?${params}`);
  }

  async reorderPhotos(photoUrls: string[]): Promise<{ status: string; photo_urls: string[] }> {
    return apiClient.put<{ status: string; photo_urls: string[] }>(`${BASE}/profile/photos/reorder`, { photo_urls: photoUrls });
  }

  // --- Onboarding ---

  async getOnboardingStatus(): Promise<OnboardingValidationResponse> {
    return apiClient.get<OnboardingValidationResponse>(`${BASE}/onboarding/status`);
  }

  async completeOnboarding(): Promise<CompleteOnboardingResponse> {
    return apiClient.post<CompleteOnboardingResponse>(`${BASE}/onboarding/complete`);
  }

  async updateOnboardingProfile(data: OnboardingData): Promise<CofounderMatchProfile> {
    return apiClient.put<CofounderMatchProfile>(`${BASE}/onboarding/profile`, data);
  }

  // --- Discovery ---

  async discoverMatches(request: MatchDiscoveryRequest = {}): Promise<MatchDiscoveryResponse> {
    const payload = { limit: 20, min_score: 0.3, ...request };
    const res = await apiClient.post<MatchDiscoveryResponse>(`${BASE}/discover`, payload);
    res.matches?.forEach(this.normalizeMatch.bind(this));
    return res;
  }

  // --- Swipe ---

  async swipe(targetProfileId: string, action: SwipeAction): Promise<SwipeActionResponse> {
    const response = await apiClient.post<SwipeActionResponse>(`${BASE}/swipe`, {
      target_profile_id: targetProfileId,
      action,
    });
    this.invalidateCache(["matches:", "mutual-matches", "conversations:"]);
    return response;
  }

  swipeRight(targetProfileId: string): Promise<SwipeActionResponse> {
    return this.swipe(targetProfileId, "interested");
  }

  swipeLeft(targetProfileId: string): Promise<SwipeActionResponse> {
    return this.swipe(targetProfileId, "declined");
  }

  swipeSkip(targetProfileId: string): Promise<SwipeActionResponse> {
    return this.swipe(targetProfileId, "skipped");
  }

  // --- Matches ---

  async listMatches(statusFilter?: string, limit = 20, offset = 0, before?: string): Promise<MatchListResponse> {
    const params = new URLSearchParams({ limit: String(limit), offset: String(offset) });
    if (statusFilter) params.append("status_filter", statusFilter);
    if (before) params.append("before", before);
    const res = await apiClient.get<MatchListResponse>(`${BASE}/matches?${params}`);
    res.matches?.forEach(this.normalizeMatch.bind(this));
    return res;
  }

  async getMutualMatches(): Promise<{ mutual_matches: CofounderMatchWithProfile[] }> {
    const cacheKey = "mutual-matches";
    const cached = this.getCached<{ mutual_matches: CofounderMatchWithProfile[] }>(cacheKey);
    if (cached) {
      return cached;
    }
    const res = await apiClient.get<{ mutual_matches: CofounderMatchWithProfile[] }>(`${BASE}/matches/mutual`);
    res.mutual_matches?.forEach(this.normalizeMatch.bind(this));
    this.setCached(cacheKey, res);
    return res;
  }

  async getMatch(matchId: string): Promise<CofounderMatchWithProfile> {
    const res = await apiClient.get<CofounderMatchWithProfile>(`${BASE}/matches/${matchId}`);
    return this.normalizeMatch(res);
  }

  async archiveMatch(matchId: string): Promise<void> {
    const result = await apiClient.delete<void>(`${BASE}/matches/${matchId}`);
    this.invalidateCache(["matches:", "mutual-matches"]);
    return result;
  }

  // --- Statistics ---

  async getStatistics(): Promise<MatchStatistics> {
    return apiClient.get<MatchStatistics>(`${BASE}/statistics`);
  }

  // --- Preferences ---

  async getPreferences(): Promise<MatchPreferences> {
    return apiClient.get<MatchPreferences>(`${BASE}/preferences`);
  }

  async updatePreferences(updates: Partial<MatchPreferences>): Promise<MatchPreferences> {
    return apiClient.put<MatchPreferences>(`${BASE}/preferences`, updates);
  }

  // --- Follow ---

  async followProfile(profileId: string): Promise<{ is_following: boolean }> {
    return apiClient.post<{ is_following: boolean }>(`${BASE}/profiles/${profileId}/follow`);
  }

  async unfollowProfile(profileId: string): Promise<{ is_following: boolean }> {
    return apiClient.delete<{ is_following: boolean }>(`${BASE}/profiles/${profileId}/follow`);
  }

  async getFollowStats(profileId: string): Promise<FollowStats> {
    return apiClient.get<FollowStats>(`${BASE}/profiles/${profileId}/follow-stats`);
  }

  async getFollowingProfiles(): Promise<CofounderMatchProfile[]> {
    return apiClient.get<CofounderMatchProfile[]>(`${BASE}/profiles/following`);
  }

  async getProfileById(profileId: string): Promise<CofounderMatchProfile> {
    return apiClient.get<CofounderMatchProfile>(`${BASE}/profiles/${profileId}`);
  }

  // --- Conversations ---

  async getConversations(limit = 20, offset = 0): Promise<ConversationListResponse> {
    const cacheKey = `conversations:${limit}:${offset}`;
    const cached = this.getCached<ConversationListResponse>(cacheKey);
    if (cached) {
      return cached;
    }
    const params = new URLSearchParams({ limit: String(limit), offset: String(offset) });
    const res = await apiClient.get<ConversationListResponse>(`${BASE}/conversations?${params}`);
    const normalized = {
      ...res,
      conversations: (res.conversations || []).map((conv: any) => this.normalizeConversation(conv)),
    };
    this.setCached(cacheKey, normalized);
    return normalized;
  }

  async getMessages(conversationId: string, limit = 50, page = 1, before?: string): Promise<Message[]> {
    const params = new URLSearchParams({ limit: String(limit), page: String(page) });
    if (before) {
      params.set("before", before);
    }
    const res = await apiClient.get<Message[]>(`${BASE}/conversations/${conversationId}/messages?${params}`);
    return (res || []).map((msg: any) => this.normalizeMessage(msg));
  }

  async sendMessage(conversationId: string, text: string): Promise<Message> {
    const res = await apiClient.post<Message>(`${BASE}/conversations/${conversationId}/messages`, { message_text: text });
    this.invalidateCache(["conversations:"]);
    return this.normalizeMessage(res);
  }

  async markConversationRead(conversationId: string): Promise<{ message: string }> {
    if (!conversationId || conversationId === "undefined") {
      throw new Error("Cannot mark conversation as read without a valid conversation id");
    }
    const res = await apiClient.put<{ message: string }>(`${BASE}/conversations/${conversationId}/read`);
    this.invalidateCache(["conversations:"]);
    return res;
  }

  async getOrCreateDirectConversation(otherProfileId: string): Promise<Conversation> {
    const res = await apiClient.post<Conversation>(`${BASE}/conversations/direct/${otherProfileId}`);
    this.invalidateCache(["conversations:"]);
    return this.normalizeConversation(res);
  }

  // --- Group conversations ---

  async getGroupConversations(): Promise<Conversation[]> {
    const res = await apiClient.get<Conversation[]>(`${BASE}/group-conversations`);
    return (res || []).map((conv: any) => this.normalizeConversation(conv));
  }

  async sendGroupMessage(conversationId: string, text: string): Promise<Message> {
    return apiClient.post<Message>(`${BASE}/group-conversations/${conversationId}/messages`, { message_text: text });
  }

  // --- Idea Project (simple idea, linked to profile) ---

  async getIdeaProject(): Promise<IdeaProject> {
    return apiClient.get<IdeaProject>(`${BASE}/idea-project`);
  }

  async createIdeaProject(data: Partial<IdeaProject>): Promise<IdeaProject> {
    return apiClient.post<IdeaProject>(`${BASE}/idea-project`, data);
  }

  async updateIdeaProject(updates: Partial<IdeaProject>): Promise<IdeaProject> {
    return apiClient.patch<IdeaProject>(`${BASE}/idea-project`, updates);
  }

  async deleteIdeaProject(): Promise<void> {
    return apiClient.delete<void>(`${BASE}/idea-project`);
  }

  // --- Projects ---

  async browseMatchedProjects(): Promise<ProjectWithMembers[]> {
    return apiClient.get<ProjectWithMembers[]>(`${BASE}/projects/browse`);
  }

  async listProjects(profileId?: string): Promise<ProjectWithMembers[]> {
    const params = profileId ? `?profile_id=${profileId}` : "";
    return apiClient.get<ProjectWithMembers[]>(`${BASE}/projects${params}`);
  }

  async getProjectDetail(projectId: string): Promise<ProjectWithMembers> {
    return apiClient.get<ProjectWithMembers>(`${BASE}/projects/${projectId}`);
  }

  async createProject(data: Partial<IdeaProject>): Promise<IdeaProject> {
    return apiClient.post<IdeaProject>(`${BASE}/projects`, data);
  }

  async updateProject(projectId: string, updates: Partial<IdeaProject>): Promise<IdeaProject> {
    return apiClient.put<IdeaProject>(`${BASE}/projects/${projectId}`, updates);
  }

  async deleteProject(projectId: string): Promise<void> {
    return apiClient.delete<void>(`${BASE}/projects/${projectId}`);
  }

  async addProjectMember(projectId: string, profileId: string, role: MemberRole = "member"): Promise<void> {
    return apiClient.post<void>(`${BASE}/projects/${projectId}/members`, { target_profile_id: profileId, role });
  }

  async requestJoinProject(projectId: string): Promise<void> {
    return apiClient.post<void>(`${BASE}/projects/${projectId}/join`);
  }

  async respondToMember(memberId: string, action: "approve" | "reject" | "remove"): Promise<void> {
    return apiClient.put<void>(`${BASE}/projects/members/${memberId}`, { action });
  }

  async removeProjectMember(projectId: string, memberProfileId: string): Promise<void> {
    return apiClient.delete<void>(`${BASE}/projects/${projectId}/members/${memberProfileId}`);
  }

  async createProjectGroupChat(projectId: string, title?: string): Promise<Conversation> {
    const res = await apiClient.post<Conversation>(`${BASE}/projects/${projectId}/group-chat`, { project_id: projectId, title });
    this.invalidateCache(["conversations:"]);
    return this.normalizeConversation(res);
  }
}

export const cofounderMatchingService = new CofounderMatchingService();
