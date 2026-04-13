import { apiClient } from "../lib/api-client";
import {
  User,
  UserLogin,
  UserRegister,
  TokenResponse,
  RegisterResponse,
  RefreshTokenRequest,
  PasswordChangeRequest,
  PasswordResetRequest,
  PasswordResetConfirm,
  DeleteAccountRequest,
} from "../types/auth";
import { trackDbOperation } from "../utils/performance";

class AuthService {
  private setSession(tokenResponse: TokenResponse): User {
    if (!tokenResponse.access_token) throw new Error("Missing access_token");

    apiClient.setToken(tokenResponse.access_token);
    localStorage.setItem("refresh_token", tokenResponse.refresh_token);

    const user: User = {
      user_id: tokenResponse.user_id,
      name: tokenResponse.user?.name || "",
      email: tokenResponse.email,
      account_type: tokenResponse.account_type as User["account_type"],
      skills: tokenResponse.user?.skills,
      resume_link: tokenResponse.user?.resume_link,
    };

    localStorage.setItem("user", JSON.stringify(user));
    return user;
  }

  async register(userData: UserRegister): Promise<RegisterResponse> {
    const response = await apiClient.post<RegisterResponse>(
      "/auth/register",
      userData
    );

    if (response.access_token && response.refresh_token && response.user_id && response.email && response.account_type) {
      this.setSession({
        access_token: response.access_token,
        refresh_token: response.refresh_token,
        user_id: response.user_id,
        email: response.email,
        account_type: response.account_type,
      });
    }

    return response;
  }

  async login(credentials: UserLogin): Promise<TokenResponse> {
    return trackDbOperation("User Login", async () => {
      const response = await apiClient.post<TokenResponse>(
        "/auth/login",
        credentials
      );
      this.setSession(response);
      return response;
    });
  }

  async logout(): Promise<void> {
    // Invalidate tokens on the backend before clearing local state
    try {
      const refreshToken = localStorage.getItem("refresh_token");
      await apiClient.post("/auth/logout", {
        refresh_token: refreshToken || undefined,
      });
    } catch {
      // Best-effort — clear local state even if backend call fails
    }
    apiClient.setToken(null);
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user");
    localStorage.removeItem("visiondrillImpersonation");
  }

  async refreshToken(): Promise<TokenResponse> {
    const refreshToken = localStorage.getItem("refresh_token");
    if (!refreshToken) throw new Error("No refresh token available");

    const request: RefreshTokenRequest = { refresh_token: refreshToken };
    const response = await apiClient.post<TokenResponse>(
      "/auth/refresh",
      request
    );
    this.setSession(response);
    return response;
  }

  async getCurrentUser(): Promise<User> {
    const response = await apiClient.get<{
      user_id: string;
      email: string;
      account_type: string;
      name?: string;
      full_name?: string;
    }>("/auth/me");

    return {
      user_id: response.user_id,
      name: response.name || response.full_name || "",
      email: response.email,
      account_type: response.account_type as User["account_type"],
    };
  }

  isAuthenticated(): boolean {
    return !!(apiClient.getToken() && this.getStoredUser());
  }

  getStoredUser(): User | null {
    const userStr = localStorage.getItem("user");
    if (userStr && userStr !== "undefined") {
      try {
        return JSON.parse(userStr);
      } catch {
        localStorage.removeItem("user");
      }
    }
    return null;
  }

  setStoredUser(user: User): void {
    localStorage.setItem("user", JSON.stringify(user));
  }

  setStoredTokens(accessToken: string, refreshToken: string): void {
    apiClient.setToken(accessToken);
    localStorage.setItem("refresh_token", refreshToken);
  }

  hasRole(role: "job_seeker" | "employer"): boolean {
    const user = this.getStoredUser();
    return user?.account_type === role;
  }

  isEmployer(): boolean {
    return this.hasRole("employer");
  }

  isJobSeeker(): boolean {
    return this.hasRole("job_seeker");
  }

  async changePassword(data: PasswordChangeRequest): Promise<{ message: string }> {
    return apiClient.post<{ message: string }>("/auth/change-password", data);
  }

  async resetPassword(data: PasswordResetRequest): Promise<{ message: string }> {
    return apiClient.post<{ message: string }>("/auth/reset-password", data);
  }

  async confirmPasswordReset(data: PasswordResetConfirm): Promise<{ message: string }> {
    return apiClient.post<{ message: string }>("/auth/reset-password/confirm", data);
  }

  async deleteAccount(data: DeleteAccountRequest): Promise<{ message: string }> {
    return apiClient.post<{ message: string }>("/auth/delete-account", data);
  }


  async signInWithLinkedIn(accountType: "job_seeker" | "employer" = "job_seeker"): Promise<void> {
    localStorage.setItem("oauth_provider", "linkedin");
    localStorage.setItem("oauth_account_type", accountType);

    const redirectUrl = `${window.location.origin}/auth/callback/linkedin?account_type=${encodeURIComponent(accountType)}`;
    const response = await apiClient.get<{ authorization_url: string }>(
      `/auth/linkedin/authorize?account_type=${accountType}&redirect_url=${encodeURIComponent(redirectUrl)}`
    );

    if (!response.authorization_url) {
      throw new Error("LinkedIn authorization URL is missing");
    }

    window.location.href = response.authorization_url;
  }

  async signInWithGoogle(accountType: "job_seeker" | "employer" = "job_seeker"): Promise<void> {
    localStorage.setItem("oauth_provider", "google");
    localStorage.setItem("oauth_account_type", accountType);

    const redirectUrl = `${window.location.origin}/auth/callback/google?account_type=${encodeURIComponent(accountType)}`;
    const response = await apiClient.get<{ authorization_url: string }>(
      `/auth/google/authorize?account_type=${accountType}&redirect_url=${encodeURIComponent(redirectUrl)}`
    );

    if (!response.authorization_url) {
      throw new Error("Google authorization URL is missing");
    }

    window.location.href = response.authorization_url;
  }

  async handleOAuthCallback(): Promise<TokenResponse> {
    const callbackUrl = new URL(window.location.href);
    const hashParams = new URLSearchParams(callbackUrl.hash.startsWith("#") ? callbackUrl.hash.slice(1) : callbackUrl.hash);

    const oauthError = callbackUrl.searchParams.get("error") || hashParams.get("error");
    const oauthErrorDescription = callbackUrl.searchParams.get("error_description") || hashParams.get("error_description");
    if (oauthError) {
      throw new Error(oauthErrorDescription || oauthError.replace(/_/g, " "));
    }

    const code = callbackUrl.searchParams.get("code");
    const state = callbackUrl.searchParams.get("state");
    const hashAccessToken = hashParams.get("access_token");
    const hashRefreshToken = hashParams.get("refresh_token");
    const accountTypeFromQuery = callbackUrl.searchParams.get("account_type");
    const accountTypeFromStorage = localStorage.getItem("oauth_account_type");
    const accountType = accountTypeFromQuery === "employer" || accountTypeFromStorage === "employer" ? "employer" : "job_seeker";
    const pathSegments = callbackUrl.pathname.split("/").filter(Boolean);
    const providerFromPath = pathSegments.length >= 3 && pathSegments[0] === "auth" && pathSegments[1] === "callback"
      ? pathSegments[2]
      : null;
    const providerFromQuery = callbackUrl.searchParams.get("provider");
    const providerFromStorage = localStorage.getItem("oauth_provider");
    const provider = providerFromPath === "google" || providerFromQuery === "google" || providerFromStorage === "google" ? "google" : "linkedin";

    if (hashAccessToken && hashRefreshToken) {
      const response = await apiClient.post<TokenResponse>(
        `/auth/${provider}/verify`,
        {
          supabase_access_token: hashAccessToken,
          refresh_token: hashRefreshToken,
          account_type: accountType,
        }
      );

      if (response.access_token) {
        this.setSession(response);
      }

      localStorage.removeItem("oauth_provider");
      localStorage.removeItem("oauth_account_type");
      return response;
    }

    if (code) {
      const callbackQuery = new URLSearchParams({ code });
      if (state) {
        callbackQuery.set("state", state);
      }
      callbackQuery.set("account_type", accountType);

      const response = await apiClient.get<TokenResponse>(
        `/auth/${provider}/callback?${callbackQuery.toString()}`
      );

      if (response.access_token) {
        this.setSession(response);
      }

      localStorage.removeItem("oauth_provider");
      localStorage.removeItem("oauth_account_type");
      return response;
    }

    const existingUser = this.getStoredUser();
    const existingAccessToken = apiClient.getToken();
    const existingRefreshToken = localStorage.getItem("refresh_token");

    if (existingUser && existingAccessToken && existingRefreshToken) {
      return {
        access_token: existingAccessToken,
        refresh_token: existingRefreshToken,
        user_id: existingUser.user_id,
        email: existingUser.email,
        account_type: existingUser.account_type,
      };
    }

    localStorage.removeItem("oauth_provider");
    localStorage.removeItem("oauth_account_type");
    throw new Error("No active session found. Try logging in again.");
  }

  isOAuthCallback(): boolean {
    return window.location.pathname === "/auth/callback" || window.location.pathname.startsWith("/auth/callback/");
  }
}

export const authService = new AuthService();
