// Mobile API - comprehensive mobile app integration with backend
import { apiClient } from '../../lib/api-client';

export interface MobileConfig {
  appVersion: string;
  apiVersion: string;
  features: string[];
  maintenanceMode: boolean;
  updateRequired?: boolean;
  updateUrl?: string;
}

export interface OfflineData {
  jobs: any[];
  profile: any;
  applications: any[];
  skills: any[];
  lastSync: string;
}

export interface PushNotificationData {
  title: string;
  body: string;
  data?: any;
  scheduledAt?: string;
}

export interface DeviceRegistration {
  deviceToken: string;
  platform: 'ios' | 'android' | 'web';
  userId: string;
}

export class MobileApi {
  // App Configuration
  static async getAppConfig(): Promise<MobileConfig> {
    try {
      return await apiClient.get<MobileConfig>('/mobile/config');
    } catch (error) {
      // Fallback config for offline mode
      return {
        appVersion: '1.0.0',
        apiVersion: 'v1',
        features: ['offline_mode', 'push_notifications'],
        maintenanceMode: false
      };
    }
  }

  static async checkForUpdates(): Promise<{ hasUpdate: boolean; updateUrl?: string }> {
    try {
      return await apiClient.get('/mobile/updates');
    } catch (error) {
      return { hasUpdate: false };
    }
  }

  // Push Notifications
  static async registerForPushNotifications(registration: DeviceRegistration): Promise<{ message: string }> {
    return apiClient.post('/mobile/notifications/register', registration);
  }

  static async sendPushNotification(notification: PushNotificationData): Promise<{ message: string }> {
    return apiClient.post('/mobile/notifications/send', notification);
  }

  static async unregisterDevice(deviceToken: string): Promise<{ message: string }> {
    return apiClient.delete(`/mobile/notifications/unregister/${deviceToken}`);
  }

  // Offline Sync
  static async syncOfflineData(): Promise<OfflineData> {
    try {
      return await apiClient.get<OfflineData>('/mobile/sync');
    } catch (error) {
      // Return cached data if available
      const cachedData = localStorage.getItem('offline_data');
      if (cachedData) {
        return JSON.parse(cachedData);
      }
      throw error;
    }
  }

  static async uploadOfflineData(data: {
    applications?: any[];
    profileUpdates?: any;
    skillUpdates?: any[];
  }): Promise<{ message: string; synced_items: number }> {
    return apiClient.post('/mobile/sync', data);
  }

  // Cache Management
  static async cacheData(key: string, data: any): Promise<void> {
    try {
      localStorage.setItem(`mobile_cache_${key}`, JSON.stringify({
        data,
        timestamp: new Date().toISOString(),
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours
      }));
    } catch (error) {
      console.warn('Failed to cache data:', error);
    }
  }

  static async getCachedData(key: string): Promise<any | null> {
    try {
      const cached = localStorage.getItem(`mobile_cache_${key}`);
      if (!cached) return null;

      const { data, expires } = JSON.parse(cached);
      if (new Date() > new Date(expires)) {
        localStorage.removeItem(`mobile_cache_${key}`);
        return null;
      }

      return data;
    } catch (error) {
      console.warn('Failed to get cached data:', error);
      return null;
    }
  }

  static async clearCache(): Promise<void> {
    const keys = Object.keys(localStorage).filter(key => key.startsWith('mobile_cache_'));
    keys.forEach(key => localStorage.removeItem(key));
  }

  // Network Status
  static isOnline(): boolean {
    return navigator.onLine;
  }

  static async testConnection(): Promise<boolean> {
    try {
      await apiClient.get('/health');
      return true;
    } catch (error) {
      return false;
    }
  }

  // Mobile-specific features
  static async enableBiometricAuth(): Promise<{ supported: boolean; enabled: boolean }> {
    // This would integrate with device biometric APIs
    return { supported: false, enabled: false };
  }

  static async setupOfflineMode(): Promise<void> {
    try {
      // Download essential data for offline use
      const [jobs, profile, skills] = await Promise.all([
        apiClient.get<any>('/jobs?limit=50'),
        apiClient.get<any>('/profile'),
        apiClient.get<any>('/skills?limit=100')
      ]);

      const offlineData: OfflineData = {
        jobs: (jobs as any)?.data || jobs,
        profile,
        applications: [],
        skills: (skills as any)?.data || skills,
        lastSync: new Date().toISOString()
      };

      localStorage.setItem('offline_data', JSON.stringify(offlineData));
    } catch (error) {
      console.error('Failed to setup offline mode:', error);
    }
  }

  // App Analytics
  static async trackEvent(event: string, properties?: any): Promise<void> {
    try {
      await apiClient.post('/mobile/analytics', {
        event,
        properties,
        timestamp: new Date().toISOString(),
        platform: this.getPlatform()
      });
    } catch (error) {
      // Store locally if offline
      const events = JSON.parse(localStorage.getItem('pending_analytics') || '[]');
      events.push({ event, properties, timestamp: new Date().toISOString() });
      localStorage.setItem('pending_analytics', JSON.stringify(events));
    }
  }

  static async syncPendingAnalytics(): Promise<void> {
    const pending = localStorage.getItem('pending_analytics');
    if (!pending) return;

    try {
      const events = JSON.parse(pending);
      await apiClient.post('/mobile/analytics/batch', { events });
      localStorage.removeItem('pending_analytics');
    } catch (error) {
      console.error('Failed to sync analytics:', error);
    }
  }

  // Device Information
  static getPlatform(): 'ios' | 'android' | 'web' {
    const userAgent = navigator.userAgent;
    if (/iPad|iPhone|iPod/.test(userAgent)) return 'ios';
    if (/Android/.test(userAgent)) return 'android';
    return 'web';
  }

  static getDeviceInfo(): {
    platform: string;
    userAgent: string;
    screenWidth: number;
    screenHeight: number;
    online: boolean;
  } {
    return {
      platform: this.getPlatform(),
      userAgent: navigator.userAgent,
      screenWidth: window.screen.width,
      screenHeight: window.screen.height,
      online: navigator.onLine
    };
  }

  // Performance Optimization
  static async preloadCriticalData(): Promise<void> {
    try {
      // Preload essential data for better mobile performance
      const promises = [
        this.getCachedData('recent_jobs') || apiClient.get('/jobs?limit=10'),
        this.getCachedData('user_profile') || apiClient.get('/profile'),
        this.getCachedData('user_skills') || apiClient.get('/skills/user')
      ];

      const [jobs, profile, skills] = await Promise.all(promises);

      // Cache the data
      await Promise.all([
        this.cacheData('recent_jobs', jobs),
        this.cacheData('user_profile', profile),
        this.cacheData('user_skills', skills)
      ]);
    } catch (error) {
      console.error('Failed to preload critical data:', error);
    }
  }
}
