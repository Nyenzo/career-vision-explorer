// Auth types matching FastAPI backend schemas

export interface User {
  user_id: string;
  name: string;
  email: string;
  account_type: "admin" | "job_seeker" | "employer" | "freelancer";
  skills?: string[];
  resume_link?: string;
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  user_id: string;
  email: string;
  account_type: string; // Backend returns string
  user?: {
    name: string;
    skills?: string[];
    resume_link?: string;
  };
}

export interface UserLogin {
  email: string;
  password: string;
}

export interface UserRegister {
  name: string;
  email: string;
  password: string;
  account_type: "job_seeker" | "employer" | "freelancer";
}

export interface RefreshTokenRequest {
  refresh_token: string;
}

export interface PasswordChangeRequest {
  current_password: string;
  new_password: string;
}

export interface PasswordResetRequest {
  email: string;
}

export interface PasswordResetConfirm {
  token: string;
  new_password: string;
}

export interface AuthError {
  detail: string;
  status_code: number;
}
