export interface FounderProfile {
  profile_id?: string;
  user_id: string;
  business_vision: string;
  problem_statement: string;
  required_skills: string[];
  location?: string;
  time_commitment?: "Part-time" | "Full-time" | "Flexible";
  funding_status?:
    | "Bootstrapped"
    | "Seed"
    | "Series A"
    | "Series B+"
    | "Seeking";
  industry?: string;
  stage?: "Idea" | "Prototype" | "MVP" | "Revenue" | "Scaling";
  verification_status?: "unverified" | "pending" | "verified" | "rejected";
  created_at?: string;
  updated_at?: string;
}

export interface MatchResult {
  profile: FounderProfile;
  match_score: number;
  vision_similarity: number;
  skills_compatibility: number;
  is_viewed?: boolean;
  match_status?: "pending" | "interest" | "declined" | "mutual_interest";
}

export interface MatchStats {
  total_views: number;
  total_matches: number;
  mutual_interests: number;
  profile_completeness: number;
}
