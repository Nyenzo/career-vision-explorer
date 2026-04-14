import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback,
  ReactNode,
} from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "../services/auth.service";
import { profileService } from "../services/profile.service";
import { User, UserLogin, UserRegister } from "../types/auth";
import { Profile } from "../types/api";
import { toast } from "sonner";
import { AuthPageSkeleton } from "@/components/ui/skeleton-loaders";

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: UserLogin) => Promise<void>;
  register: (userData: UserRegister) => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  hasRole: (
    role: "job_seeker" | "employer"
  ) => boolean;
  isEmployer: () => boolean;
  isJobSeeker: () => boolean;
  setTokens: (accessToken: string, refreshToken: string) => void;
  signInWithLinkedIn: (accountType?: "job_seeker" | "employer") => Promise<void>;
  signInWithGoogle: (accountType?: "job_seeker" | "employer") => Promise<void>;
  handleOAuthCallback: () => Promise<void>;
  impersonateUser: (targetUser: User) => void;
  stopImpersonation: () => void;
  isImpersonating: boolean;
  originalUser: User | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

// Helper function to determine the correct dashboard path
const getDashboardPath = (accountType: string): string => {
  switch (accountType) {
    case "job_seeker":
      return "/jobseeker/dashboard";
    case "employer":
      return "/employer/dashboard";
    default:
      return "/";
  }
};

const getErrorMessage = (error: unknown, fallback: string): string => {
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return fallback;
};

const AuthProvider = ({ children }: AuthProviderProps) => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [originalUser, setOriginalUser] = useState<User | null>(null);
  const [isImpersonating, setIsImpersonating] = useState(false);
  // AbortController for in-flight profile requests
  const profileAbortRef = useRef<AbortController | null>(null);

  const loadUserProfile = useCallback(async (): Promise<void> => {
    // Cancel any prior in-flight request
    if (profileAbortRef.current) {
      profileAbortRef.current.abort();
    }
    const controller = new AbortController();
    profileAbortRef.current = controller;

    // 8-second timeout — profile load must not block the UI
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    try {
      const rawProfile = await profileService.getProfile();
      let companyProfile: any = null;

      if (user?.account_type === "employer") {
        try {
          companyProfile = await profileService.getCompanyProfile();
        } catch (companyError) {
          console.warn("Failed to load company profile for employer", companyError);
        }
      }

      // Normalize: DB column is full_name — ensure profile.name is always set
      const userProfile = {
        ...rawProfile,
        name: rawProfile.name || (rawProfile as any).full_name || "",
        company_data: companyProfile || (rawProfile as any).company_data,
        company_name: (rawProfile as any).company_name || companyProfile?.company_name,
        industry: (rawProfile as any).industry || companyProfile?.industry,
        company_website:
          (rawProfile as any).company_website || companyProfile?.company_website,
        company_size: (rawProfile as any).company_size || companyProfile?.company_size,
      };
      clearTimeout(timeoutId);
      if (!controller.signal.aborted) {
        setProfile(userProfile);
        // Sync name into user if user.name is empty
        const displayNameForUser =
          user?.account_type === "employer"
            ? userProfile.company_name || userProfile.name
            : userProfile.name;

        if (displayNameForUser) {
          setUser(prev => {
            if (!prev) return prev;
            if (prev.name === displayNameForUser) return prev;
            const updated = { ...prev, name: displayNameForUser };
            authService.setStoredUser(updated);
            return updated;
          });
        }
      }
    } catch (err: unknown) {
      clearTimeout(timeoutId);
      if (controller.signal.aborted) {
        console.warn("Profile load timed out or was cancelled — continuing without profile");
        return;
      }
      console.error("Error loading profile:", err);
      const message = getErrorMessage(err, "");
      if (message.includes("401") || message.includes("403")) {
        try {
          await authService.refreshToken();
          const userProfile = await profileService.getProfile();
          setProfile(userProfile);
          if (userProfile.name) {
            setUser(prev => {
              if (!prev || prev.name) return prev;
              const updated = { ...prev, name: userProfile.name };
              authService.setStoredUser(updated);
              return updated;
            });
          }
        } catch {
          setError("Session expired. Please log in again.");
        }
      }
      // For all other errors (network, timeout, 5xx) we silently continue —
      // the user is still authenticated, profile is just unavailable.
    }
  }, [user?.account_type]);

  const initializeAuth = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const storedUser = authService.getStoredUser();
      if (storedUser && authService.isAuthenticated()) {
        setUser(storedUser);

        try {
          const freshUser = await authService.getCurrentUser();
          authService.setStoredUser(freshUser);
          setUser(freshUser);
        } catch {
          console.warn("Failed to fetch fresh user, using stored one");
        }

        const impersonationData = localStorage.getItem("visiondrillImpersonation");
        if (impersonationData) {
          try {
            const { originalUser: storedOriginalUser, impersonatedUser } =
              JSON.parse(impersonationData);
            setOriginalUser(storedOriginalUser);
            setUser(impersonatedUser);
            setIsImpersonating(true);
          } catch {
            localStorage.removeItem("visiondrillImpersonation");
          }
        }
      }
    } catch (err: unknown) {
      console.error("Error initializing auth:", err);
      setError(getErrorMessage(err, "Failed to initialize authentication"));
      await authService.logout();
    } finally {
      // ✅ Auth is done — stop blocking the UI regardless of profile state
      setIsLoading(false);
    }

    // Load profile in the background (non-blocking)
    if (authService.isAuthenticated()) {
      loadUserProfile();
    }
  }, [loadUserProfile]);

  // Cancel any pending profile request on unmount
  useEffect(() => {
    return () => {
      profileAbortRef.current?.abort();
    };
  }, []);

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  const login = async (credentials: UserLogin) => {
    try {
      setIsLoading(true);
      const tokenResponse = await authService.login(credentials);
      const user: User = {
        user_id: tokenResponse.user_id,
        name: tokenResponse.user?.name || "",
        email: tokenResponse.email,
        account_type: tokenResponse.account_type as User["account_type"],
      };
      authService.setStoredUser(user);
      setUser(user);
      // loadUserProfile will automatically sync name into user if profile has it
      await loadUserProfile();
      toast.success("Login successful!");
      const redirectPath = getDashboardPath(user.account_type);
      navigate(redirectPath, { replace: true });
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, "Login failed."));
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: UserRegister) => {
    try {
      setIsLoading(true);
      const registerResponse = await authService.register(userData);

      if (registerResponse.requires_email_confirmation) {
        toast.success("Registration successful! Check your email to confirm your account.");
        navigate("/login", { replace: true });
        return;
      }

      const user = await authService.getCurrentUser();
      authService.setStoredUser(user);
      setUser(user);
      await loadUserProfile();
      toast.success("Registration successful!");

      // Redirect to appropriate dashboard
      const redirectPath = getDashboardPath(user.account_type);
      navigate(redirectPath, { replace: true });
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, "Registration failed."));
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    await authService.logout();
    localStorage.removeItem("visiondrillImpersonation");
    setUser(null);
    setProfile(null);
    setOriginalUser(null);
    setIsImpersonating(false);
    toast.success("Logged out successfully");
  };

  const refreshProfile = async () => {
    if (user && authService.isAuthenticated()) {
      try {
        const updatedUser = await authService.getCurrentUser();
        authService.setStoredUser(updatedUser);
        setUser(updatedUser);
        await loadUserProfile();
      } catch {
        await loadUserProfile();
      }
    }
  };

  const hasRole = (role: "job_seeker" | "employer") => {
    const effectiveRole = (profile?.active_role as User["account_type"] | undefined) || user?.account_type;
    return effectiveRole === role;
  };

  const isEmployer = () => hasRole("employer");
  const isJobSeeker = () => hasRole("job_seeker");



  const stopImpersonation = () => {
    if (!isImpersonating || !originalUser) return;
    localStorage.removeItem("visiondrillImpersonation");
    setUser(originalUser);
    setOriginalUser(null);
    setIsImpersonating(false);
    toast.success("Returned to your account");
  };

  const setTokens = (accessToken: string, refreshToken: string) => {
    authService.setStoredTokens(accessToken, refreshToken);

    // Decode token to get user info
    try {
      const payload = JSON.parse(atob(accessToken.split(".")[1])) as Record<
        string,
        unknown
      >;
      const user: User = {
        user_id: String(payload.sub ?? ""),
        name: typeof payload.name === "string" ? payload.name : "",
        email: String(payload.email ?? ""),
        account_type: payload.account_type as User["account_type"],
      };

      authService.setStoredUser(user);
      setUser(user);

      // Load profile data only if not already loading
      if (!isLoading) {
        loadUserProfile();
      }
    } catch (error) {
      console.error("Error decoding token:", error);
      toast.error("Failed to process authentication tokens");
    }
  };

  const signInWithLinkedIn = async (accountType: "job_seeker" | "employer" = "job_seeker") => {
    try {
      setIsLoading(true);
      await authService.signInWithLinkedIn(accountType);
    } catch (error: unknown) {
      console.error("LinkedIn sign-in error:", error);
      toast.error("LinkedIn Authentication Failed", {
        description:
          getErrorMessage(
            error,
            "Failed to initiate LinkedIn authentication. Please try again."
          ) ||
          "Failed to initiate LinkedIn authentication. Please try again.",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signInWithGoogle = async (accountType: "job_seeker" | "employer" = "job_seeker") => {
    try {
      setIsLoading(true);
      await authService.signInWithGoogle(accountType);
    } catch (error: unknown) {
      console.error("Google sign-in error:", error);
      toast.error("Google Authentication Failed", {
        description:
          getErrorMessage(
            error,
            "Failed to initiate Google authentication. Please try again."
          ) ||
          "Failed to initiate Google authentication. Please try again.",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const handleOAuthCallback = async () => {
    try {
      setIsLoading(true);
      const tokenResponse = await authService.handleOAuthCallback();

      // Construct user object from token response
      const user: User = {
        user_id: tokenResponse.user_id,
        name: "",
        email: tokenResponse.email,
        account_type: tokenResponse.account_type as
          | "job_seeker"
          | "employer",
      };

      authService.setStoredUser(user);
      setUser(user);
      await loadUserProfile();

      toast.success("Welcome!", {
        description: "You have been successfully signed in.",
      });

      // Redirect to appropriate dashboard
      const redirectPath = getDashboardPath(user.account_type);
      navigate(redirectPath, { replace: true });
    } catch (error: unknown) {
      console.error("OAuth callback error:", error);
      toast.error("Authentication Failed", {
        description:
          getErrorMessage(
            error,
            "Failed to complete authentication. Please try again."
          ) ||
          "Failed to complete authentication. Please try again.",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const value: AuthContextType = {
    user,
    profile,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout,
    refreshProfile,
    hasRole,
    isEmployer,
    isJobSeeker,
    setTokens,
    signInWithLinkedIn,
    signInWithGoogle,
    handleOAuthCallback,
    impersonateUser: () => { },
    stopImpersonation,
    isImpersonating,
    originalUser,
  };

  if (isLoading) {
    return <AuthPageSkeleton />;
  }

  if (error) {
    return (
      <div className="flex flex-col h-screen items-center justify-center text-red-600 space-y-4">
        <p>{error}</p>
        <button
          onClick={initializeAuth}
          className="px-4 py-2 bg-red-500 text-white rounded-md"
        >
          Retry
        </button>
      </div>
    );
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};

export default AuthProvider;
