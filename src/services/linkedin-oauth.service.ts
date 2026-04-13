import { apiClient } from '@/lib/api-client';
import { toast } from '@/components/ui/sonner';

export interface LinkedInAuthResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  user_id: string;
  email: string;
  account_type: string;
}

export interface LinkedInAuthorizationResponse {
  authorization_url: string;
}

class LinkedInOAuthService {
  private POPUP_WIDTH = 600;
  private POPUP_HEIGHT = 700;
  
  /**
   * Initiate LinkedIn OAuth flow using Supabase
   * @param accountType - Type of account to create if user doesn't exist
   * @param usePopup - Whether to use popup or redirect (popup not recommended for Supabase OAuth)
   * @returns Promise with authorization URL or redirects to LinkedIn
   */
  async startOAuthFlow(accountType: 'job_seeker' | 'employer' = 'job_seeker', usePopup: boolean = false): Promise<void> {
    try {
      const redirectUrl = `${window.location.origin}/auth/callback/linkedin?account_type=${encodeURIComponent(accountType)}`;
      const response = await apiClient.get<LinkedInAuthorizationResponse>(
        `/auth/linkedin/authorize?account_type=${accountType}&redirect_url=${encodeURIComponent(redirectUrl)}`
      );

      if (usePopup) {
        this.openAuthPopup(response.authorization_url);
      } else {
        window.location.href = response.authorization_url;
      }
    } catch (error: any) {
      console.error('Failed to start LinkedIn OAuth:', error);
      toast.error('Failed to start LinkedIn authentication', {
        description: error.message || 'Please try again later.'
      });
      throw error;
    }
  }
  
  /**
   * Open LinkedIn auth in popup window
   */
  private openAuthPopup(authUrl: string): void {
    const left = (window.screen.width - this.POPUP_WIDTH) / 2;
    const top = (window.screen.height - this.POPUP_HEIGHT) / 2;
    
    const popup = window.open(
      authUrl,
      'linkedin-auth',
      `width=${this.POPUP_WIDTH},height=${this.POPUP_HEIGHT},left=${left},top=${top},status=yes,scrollbars=yes,resizable=yes`
    );
    
    if (!popup) {
      toast.error('Popup blocked', {
        description: 'Please allow popups for LinkedIn authentication.'
      });
      return;
    }
    
    // Check popup status
    const checkInterval = setInterval(() => {
      try {
        if (popup.closed) {
          clearInterval(checkInterval);
          // Check if we got tokens in localStorage (set by callback page)
          const accessToken = localStorage.getItem('linkedin_access_token');
          const refreshToken = localStorage.getItem('linkedin_refresh_token');
          
          if (accessToken && refreshToken) {
            // Clean up temporary storage
            localStorage.removeItem('linkedin_access_token');
            localStorage.removeItem('linkedin_refresh_token');
            
            // Emit success event
            window.dispatchEvent(new CustomEvent('linkedin-auth-success', {
              detail: { access_token: accessToken, refresh_token: refreshToken }
            }));
          } else {
            // Emit cancelled event
            window.dispatchEvent(new CustomEvent('linkedin-auth-cancelled'));
          }
        }
      } catch (e) {
        // Can't access popup anymore, likely on LinkedIn domain
      }
    }, 1000);
  }
  
  /**
   * Handle OAuth callback
   * This should be called from the callback page
   */
  async handleCallback(code: string, state: string | null): Promise<LinkedInAuthResponse> {
    try {
      const callbackQuery = new URLSearchParams({ code });
      if (state) {
        callbackQuery.set('state', state);
      }

      return await apiClient.get<LinkedInAuthResponse>(
        `/auth/linkedin/callback?${callbackQuery.toString()}`
      );
    } catch (error: any) {
      console.error('LinkedIn callback failed:', error);
      toast.error('Authentication failed', {
        description: error.message || 'Failed to complete LinkedIn authentication.'
      });
      throw error;
    }
  }
  
  /**
   * Listen for LinkedIn authentication events
   */
  onAuthSuccess(callback: (tokens: { access_token: string; refresh_token: string }) => void): () => void {
    const handler = (event: Event) => {
      const customEvent = event as CustomEvent;
      callback(customEvent.detail);
    };
    
    window.addEventListener('linkedin-auth-success', handler);
    
    // Return cleanup function
    return () => {
      window.removeEventListener('linkedin-auth-success', handler);
    };
  }
  
  onAuthCancelled(callback: () => void): () => void {
    window.addEventListener('linkedin-auth-cancelled', callback);
    
    // Return cleanup function
    return () => {
      window.removeEventListener('linkedin-auth-cancelled', callback);
    };
  }
}

export const linkedInOAuthService = new LinkedInOAuthService();
