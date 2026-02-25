/**
 * API Configuration
 * Centralizes all API-related configuration
 */

export const API_CONFIG = {
  // Base API URL - use relative URL for dev proxy, absolute for production
  BASE_URL: import.meta.env.DEV
    ? '/api/v1'
    : (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1'),

  // Backend URL (without /api/v1)
  BACKEND_URL: import.meta.env.DEV
    ? ''
    : (import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'),

  // Supabase Configuration (for direct frontend access if needed)
  SUPABASE: {
    URL: import.meta.env.VITE_SUPABASE_URL,
    ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY,
  },

  // Request timeouts (in milliseconds)
  TIMEOUTS: {
    DEFAULT: 45000,    // 45 seconds (increased for slow Supabase connections)
    FAST: 15000,       // 15 seconds for quick operations
    SLOW: 90000,       // 90 seconds for heavy operations
    UPLOAD: 180000,    // 3 minutes for file uploads
    DATABASE: 60000,   // 60 seconds for database operations
  },

  // Cache TTL (in milliseconds)
  CACHE_TTL: {
    DEFAULT: 60000,    // 1 minute
    SHORT: 30000,      // 30 seconds
    LONG: 300000,      // 5 minutes
    AI_RESULTS: 600000, // 10 minutes for AI-generated content
  },

  // API Endpoints that need special handling
  ENDPOINTS: {
    // Authentication endpoints
    AUTH: {
      LOGIN: '/auth/login',
      REGISTER: '/auth/register',
      REFRESH: '/auth/refresh',
      LOGOUT: '/auth/logout',
      ME: '/auth/me',
    },

    // File upload endpoints
    UPLOADS: {
      PROFILE_IMAGE: '/profile/image',
      RESUME: '/profile/resume',
      CV_PARSE: '/ai/upload-and-parse-cv',
    },

    // AI-powered endpoints (may need longer timeouts)
    AI: {
      JOB_MATCH: '/jobs/ai-match',
      SKILL_ANALYSIS: '/ai/analyze-skills',
      SKILL_GAP: '/skill-gap/analyze',
      INTERVIEW_PREP: '/ai/interview-prep',
    },
  },

  // Feature flags
  FEATURES: {
    ENABLE_CACHING: true,
    ENABLE_REQUEST_DEDUP: true,
    ENABLE_OFFLINE_MODE: false,
    ENABLE_DEBUG_LOGGING: import.meta.env.DEV,
  },
};

// Validate required environment variables
export function validateApiConfig(): void {
  const required = ['VITE_API_BASE_URL'];
  const missing = required.filter(key => !import.meta.env[key]);

  if (missing.length > 0) {
    console.warn(`Missing environment variables: ${missing.join(', ')}`);
  }

  // Warn if sensitive keys are exposed
  if (import.meta.env.GEMINI_API_KEY) {
    console.error('WARNING: GEMINI_API_KEY should not be exposed in frontend!');
  }
}

// Initialize validation
if (import.meta.env.DEV) {
  validateApiConfig();
}