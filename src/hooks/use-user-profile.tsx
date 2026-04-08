import {
  useState,
  useEffect,
  createContext,
  useContext,
  useCallback,
  useRef,
} from "react";
import { apiClient } from "@/lib/api-client";
import { profileService } from "@/services";
import { Profile } from "@/types/api";

// Global cache to share profile data across components
const profileCache = {
  data: null as Profile | null,
  timestamp: 0,
  loading: false,
  error: null as string | null,
};

// 5 minutes cache duration
const CACHE_DURATION = 5 * 60 * 1000;

export const useUserProfile = () => {
  const [profile, setProfile] = useState<Profile | null>(profileCache.data);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(profileCache.error);
  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchProfile = useCallback(async (force = false) => {
    const token = apiClient.getToken();
    if (!token) {
      setProfile(null);
      setError(null);
      setIsLoading(false);
      profileCache.loading = false;
      return;
    }

    // Cancel any ongoing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Check cache first (unless forced refresh)
    const now = Date.now();
    const cacheAge = now - profileCache.timestamp;

    if (
      !force &&
      profileCache.data &&
      cacheAge < CACHE_DURATION &&
      !profileCache.loading
    ) {
      console.log("Using cached profile data");
      setProfile(profileCache.data);
      setError(profileCache.error);
      setIsLoading(false);
      return;
    }

    // Don't fetch if already loading (prevents duplicate requests)
    if (profileCache.loading && !force) {
      return;
    }

    try {
      setIsLoading(true);
      profileCache.loading = true;
      setError(null);

      // Create new abort controller
      abortControllerRef.current = new AbortController();

      console.log("Fetching fresh profile data...");
      const data = await profileService.getProfile();

      if (abortControllerRef.current.signal.aborted) {
        return; // Don't update state if request was cancelled
      }

      // Update cache
      profileCache.data = data;
      profileCache.timestamp = now;
      profileCache.error = null;

      setProfile(data);
      setError(null);

      console.log("Profile data fetched successfully:", {
        completionPercentage: data.profile_completion_percentage,
        name: data.name,
        skills: data.skills?.length,
      });
    } catch (err) {
      if (abortControllerRef.current?.signal.aborted) {
        return; // Don't update state if request was cancelled
      }

      const errorMessage = "Failed to fetch profile";
      console.error("Profile fetch error:", err);

      profileCache.error = errorMessage;
      setError(errorMessage);
    } finally {
      if (!abortControllerRef.current?.signal.aborted) {
        setIsLoading(false);
      }
      profileCache.loading = false;
    }
  }, []);

  // Auto-fetch profile on component mount
  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return {
    profile,
    isLoading,
    error,
    refreshProfile: () => fetchProfile(true), // Force refresh function
    clearCache: () => {
      profileCache.data = null;
      profileCache.timestamp = 0;
      profileCache.error = null;
    },
  };
};

const UserProfileContext = createContext<{
  profile: Profile | null;
  isLoading: boolean;
  error: string | null;
}>({
  profile: null,
  isLoading: true,
  error: null,
});

export const UserProfileProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { profile, isLoading, error } = useUserProfile();

  return (
    <UserProfileContext.Provider value={{ profile, isLoading, error }}>
      {children}
    </UserProfileContext.Provider>
  );
};

export const useProfile = () => {
  return useContext(UserProfileContext);
};
