// Auth types matching FastAPI backend schemas

export interface User {
  user_id: string;
  name: string;
  email: string;
  account_type: "job_seeker" | "employer";
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

export interface RegisterResponse {
  message: string;
  requires_email_confirmation: boolean;
  access_token?: string;
  refresh_token?: string;
  user_id?: string;
  email?: string;
  account_type?: string;
  active_role?: string;
}

export interface UserLogin {
  email: string;
  password: string;
}

export interface UserRegister {
  full_name: string;        // API expects full_name (maps to users.full_name)
  email: string;
  password: string;
  account_type: "job_seeker" | "employer";
  phone_number?: string;
  date_of_birth?: string;   // ISO date string; job seeker DOB / employer founding date
  company_name?: string;
  company_website?: string;
  industry?: string;
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

export interface DeleteAccountRequest {
  current_password: string;
}

export interface AuthError {
  detail: string;
  status_code: number;
}
