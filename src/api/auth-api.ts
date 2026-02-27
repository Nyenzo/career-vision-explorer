// Auth API - now using real backend integration
import { authService } from '../../services/auth.service';
import { 
  User, 
  UserLogin, 
  UserRegister, 
  TokenResponse,
  PasswordChangeRequest,
  PasswordResetRequest,
  PasswordResetConfirm
} from '../../types/auth';

export class AuthApi {
  static async login(credentials: UserLogin): Promise<TokenResponse> {
    return authService.login(credentials);
  }

  static async register(userData: UserRegister): Promise<TokenResponse> {
    return authService.register(userData);
  }

  static async logout(): Promise<void> {
    return authService.logout();
  }

  static async refreshToken(): Promise<TokenResponse> {
    return authService.refreshToken();
  }

  static async getCurrentUser(): Promise<User> {
    return authService.getCurrentUser();
  }

  static async changePassword(passwordChange: PasswordChangeRequest): Promise<{ message: string }> {
    return authService.changePassword(passwordChange);
  }

  static async resetPassword(resetRequest: PasswordResetRequest): Promise<{ message: string }> {
    return authService.resetPassword(resetRequest);
  }

  static async confirmPasswordReset(confirmRequest: PasswordResetConfirm): Promise<{ message: string }> {
    return authService.confirmPasswordReset(confirmRequest);
  }

  static async registerAdmin(userData: UserRegister): Promise<TokenResponse> {
    return authService.registerAdmin(userData);
  }

  static async registerFirstAdmin(userData: UserRegister): Promise<TokenResponse> {
    return authService.registerFirstAdmin(userData);
  }

  // Utility methods
  static isAuthenticated(): boolean {
    return authService.isAuthenticated();
  }

  static getStoredUser(): User | null {
    return authService.getStoredUser();
  }

  static hasRole(role: 'job_seeker' | 'employer' | 'admin'): boolean {
    return authService.hasRole(role);
  }

  static isAdmin(): boolean {
    return authService.isAdmin();
  }

  static isEmployer(): boolean {
    return authService.isEmployer();
  }

  static isJobSeeker(): boolean {
    return authService.isJobSeeker();
  }
}