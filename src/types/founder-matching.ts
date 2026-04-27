// TypeScript types mirroring backend cofounder_matching schemas exactly

export type IntentType = "founder" | "cofounder" | "collaborator";
export type CommitmentLevel = "full_time" | "part_time" | "flexible" | "contract";
export type LocationPreference = "remote" | "on_site" | "hybrid" | "flexible";
export type MatchStatus = "suggested" | "pending" | "mutual_interest" | "declined" | "archived";
export type SwipeAction = "interested" | "declined" | "skipped";
export type ProjectStatus = "idea" | "mvp" | "active" | "paused" | "archived";
export type MemberRole = "owner" | "cofounder" | "collaborator" | "member";
export type MemberStatus = "pending" | "approved" | "rejected" | "left";

export interface CofounderMatchProfile {
    profile_id: string;
    user_id: string;
    intent_type?: IntentType;
    name?: string;
    current_role?: string;
    years_experience?: number;
    technical_skills?: string[];
    soft_skills?: string[];
    seeking_roles?: string[];
    industries?: string[];
    commitment_level?: CommitmentLevel;
    location_preference?: LocationPreference;
    preferred_locations?: string[];
    achievements?: string[];
    education?: string[];
    certifications?: string[];
    linkedin_url?: string;
    portfolio_url?: string;
    bio?: string;
    looking_for?: string;
    availability?: string;
    photo_urls?: string[];
    min_photos_uploaded?: boolean;
    onboarding_completed?: boolean;
    onboarding_completed_at?: string;
    is_active?: boolean;
    views_count?: number;
    matches_count?: number;
    mutual_interest_count?: number;
    can_match?: boolean;
    created_at?: string;
    updated_at?: string;
}

export interface CofounderMatchProfileCreate {
    user_id: string;
    intent_type?: IntentType;
    name?: string;
    current_role?: string;
    years_experience?: number;
    technical_skills?: string[];
    soft_skills?: string[];
    seeking_roles?: string[];
    industries?: string[];
    commitment_level?: CommitmentLevel;
    location_preference?: LocationPreference;
    preferred_locations?: string[];
    bio?: string;
    looking_for?: string;
}

export interface CofounderMatchProfileUpdate extends Partial<CofounderMatchProfileCreate> { }

export interface OnboardingData {
    intent_type?: IntentType;
    current_role?: string;
    years_experience?: number;
    technical_skills?: string[];
    soft_skills?: string[];
    seeking_roles?: string[];
    industries?: string[];
    commitment_level?: CommitmentLevel;
    location_preference?: LocationPreference;
    preferred_locations?: string[];
    achievements?: string[];
    education?: string[];
    certifications?: string[];
    bio?: string;
    looking_for?: string;
    availability?: string;
    linkedin_url?: string;
    portfolio_url?: string;
    idea_description?: string;
    problem_statement?: string;
    looking_for_description?: string;
}

export interface OnboardingValidationResponse {
    is_valid: boolean;
    missing_fields: string[];
    photo_count: number;
    min_photos_met: boolean;
    can_complete: boolean;
    validation_details: Record<string, boolean>;
}

export interface CompleteOnboardingResponse {
    status: string;
    onboarding_completed: boolean;
    can_match: boolean;
    profile: CofounderMatchProfile;
    message: string;
}

export interface MatchScoreBreakdown {
    skill_compatibility: number;
    experience_match: number;
    role_alignment: number;
    location_compatibility: number;
    industry_match: number;
    profile_similarity: number;
}

export interface CofounderMatch {
    match_id: string;
    profile_1_id: string;
    profile_2_id: string;
    overall_score: number;
    skill_compatibility_score?: number;
    experience_match_score?: number;
    role_alignment_score?: number;
    location_compatibility_score?: number;
    industry_match_score?: number;
    profile_similarity_score?: number;
    intent_compatibility_score?: number;
    status: MatchStatus;
    matched_at?: string;
    connected_at?: string;
    created_at?: string;
    updated_at?: string;
}

export interface CofounderMatchWithProfile extends CofounderMatch {
    matched_profile: CofounderMatchProfile;
}

export interface MatchDiscoveryRequest {
    limit?: number;
    min_score?: number;
    filters?: Record<string, unknown>;
    intent_types?: IntentType[];
}

export interface MatchDiscoveryResponse {
    matches: CofounderMatchWithProfile[];
    total_count: number;
    has_more: boolean;
}

export interface MatchListResponse {
    matches: CofounderMatchWithProfile[];
    total: number;
    limit: number;
    offset: number;
}

export interface MatchStatistics {
    profile_views: number;
    matches_count: number;
    mutual_interest_count: number;
    pending_matches: number;
    average_match_score: number;
}

export interface SwipeActionResponse {
    actor_profile_id: string;
    target_profile_id: string;
    action: SwipeAction;
    is_mutual: boolean;
    match_id?: string;
    message: string;
}

export interface MatchPreferences {
    preference_id: string;
    user_id: string;
    min_match_score: number;
    preferred_industries?: string[];
    preferred_roles?: string[];
    preferred_commitment?: string[];
    min_experience?: number;
    max_experience?: number;
    preferred_locations?: string[];
    notify_new_matches: boolean;
    notify_mutual_interest: boolean;
    notify_profile_views: boolean;
    notification_frequency: "realtime" | "daily" | "weekly" | "never";
    auto_match: boolean;
    max_active_matches?: number;
    created_at?: string;
    updated_at?: string;
}

export interface FollowStats {
    follower_count: number;
    following_count: number;
    is_following: boolean;
}

// Messaging types
export interface Message {
    message_id: string;
    conversation_id: string;
    sender_profile_id: string;
    sender_name?: string;
    message_text: string;
    is_read: boolean;
    is_ai_generated: boolean;
    read_at?: string;
    created_at?: string;
}

export interface Conversation {
    conversation_id: string;
    conversation_type: string;
    match_id?: string;
    project_id?: string;
    profile_1_id?: string;
    profile_2_id?: string;
    created_by?: string;
    title?: string;
    last_message_at?: string;
    created_at?: string;
    participant_count?: number;
    unread_count?: number;
    other_profile_photo_url?: string;
    other_profile_user_id?: string;
    other_last_seen_at?: string;
    messages?: Message[];
    participants?: Array<Record<string, unknown>>;
}

export interface ConversationListResponse {
    conversations: Conversation[];
    total: number;
    total_unread: number;
}

// Photo management types
export interface PhotoUploadStatus {
    photo_urls: string[];
    total_photos: number;
    min_photos_met: boolean;
    max_photos: number;
}

export interface PhotoUploadResponse {
    photo_url: string;
    photo_index: number;
    total_photos: number;
    min_photos_met: boolean;
    message: string;
}

// Project types
export interface IdeaProject {
    id: string;
    creator_profile_id: string;
    user_id: string;
    title: string;
    idea_description?: string;
    problem_statement?: string;
    looking_for_description?: string;
    stage?: ProjectStatus;
    industry?: string;
    tech_stack?: string[];
    max_members?: number;
    created_at?: string;
    updated_at?: string;
}

export interface ProjectMember {
    id: string;
    project_id: string;
    profile_id: string;
    user_id: string;
    role: MemberRole;
    status: MemberStatus;
    requested_at?: string;
    responded_at?: string;
    member_name?: string;
    member_role?: string;
    member_intent_type?: IntentType;
    member_photo?: string;
    created_at?: string;
    updated_at?: string;
}

export interface ProjectWithMembers extends IdeaProject {
    members: ProjectMember[];
    owner_name?: string;
    owner_photo?: string;
    member_count?: number;
    pending_count?: number;
    has_group_chat?: boolean;
    group_chat_conversation_id?: string;
    user_membership_status?: MemberStatus | "owner" | null;
}

export interface AddProjectMemberRequest {
    target_profile_id: string;
    role?: MemberRole;
}
