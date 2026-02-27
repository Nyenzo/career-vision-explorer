import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { authService } from "../services/auth.service";
import { profileService } from "../services/profile.service";
import { User, UserLogin, UserRegister } from "../types/auth";
import { Profile } from "../types/api";
import { toast } from "sonner";

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
    role: "job_seeker" | "employer" | "admin" | "freelancer"
  ) => boolean;
  isAdmin: () => boolean;
  isEmployer: () => boolean;
  isJobSeeker: () => boolean;
  isFreelancer: () => boolean;
  setTokens: (accessToken: string, refreshToken: string) => void;
  signInWithLinkedIn: () => Promise<void>;
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
    case "freelancer":
      return "/freelancer/dashboard";
    case "admin":
      return "/admin/dashboard";
    default:
      return "/";
  }
};

const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [originalUser, setOriginalUser] = useState<User | null>(null);
  const [isImpersonating, setIsImpersonating] = useState(false);

  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
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

        await loadUserProfile();

        const impersonationData = localStorage.getItem(
          "visiondrillImpersonation"
        );
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
    } catch (err: any) {
      console.error("Error initializing auth:", err);
      setError(err.message || "Failed to initialize authentication");
      await authService.logout();
    } finally {
      setIsLoading(false);
    }
  };

  const loadUserProfile = async () => {
    try {
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Profile load timeout")), 30000)
      );
      const profilePromise = profileService.getProfile();
      const userProfile = (await Promise.race([
        profilePromise,
        timeoutPromise,
      ])) as Profile;
      setProfile(userProfile);
    } catch (err: any) {
      console.error("Error loading profile:", err);
      setProfile(null);
      if (err.message?.includes("401") || err.message?.includes("403")) {
        try {
          await authService.refreshToken();
          const userProfile = await profileService.getProfile();
          setProfile(userProfile);
        } catch {
          setError("Session expired. Please log in again.");
        }
      }
    }
  };

  const login = async (credentials: UserLogin) => {
    try {
      setIsLoading(true);
      const tokenResponse = await authService.login(credentials);
      const user: User = {
        user_id: tokenResponse.user_id,
        name: "",
        email: tokenResponse.email,
        account_type: tokenResponse.account_type,
      };
      authService.setStoredUser(user);
      setUser(user);
      await loadUserProfile();
      toast.success("Login successful!");

      // Redirect to appropriate dashboard
      const redirectPath = getDashboardPath(user.account_type);
      window.location.href = redirectPath;
    } catch (err: any) {
      toast.error(err.message || "Login failed.");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: UserRegister) => {
    try {
      setIsLoading(true);
      await authService.register(userData);
      const user = await authService.getCurrentUser();
      authService.setStoredUser(user);
      setUser(user);
      await loadUserProfile();
      toast.success("Registration successful!");

      // Redirect to appropriate dashboard
      const redirectPath = getDashboardPath(user.account_type);
      window.location.href = redirectPath;
    } catch (err: any) {
      toast.error(err.message || "Registration failed.");
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

  const hasRole = (role: "job_seeker" | "employer" | "admin" | "freelancer") =>
    user?.account_type === role;

  const isAdmin = () => hasRole("admin");
  const isEmployer = () => hasRole("employer");
  const isJobSeeker = () => hasRole("job_seeker");
  const isFreelancer = () => hasRole("freelancer");

  const impersonateUser = (targetUser: User) => {
    if (!user || user.account_type !== "admin") {
      toast.error("Only admins can impersonate users");
      return;
    }
    const impersonationData = {
      originalUser: user,
      impersonatedUser: targetUser,
    };
    localStorage.setItem(
      "visiondrillImpersonation",
      JSON.stringify(impersonationData)
    );
    setOriginalUser(user);
    setUser(targetUser);
    setIsImpersonating(true);
    toast.success(`Now viewing as ${targetUser.name}`);
  };

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
      const payload = JSON.parse(atob(accessToken.split(".")[1]));
      const user: User = {
        user_id: payload.sub,
        name: payload.name || "",
        email: payload.email,
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

  const signInWithLinkedIn = async () => {
    try {
      setIsLoading(true);
      await authService.signInWithLinkedIn();
    } catch (error: any) {
      console.error("LinkedIn sign-in error:", error);
      toast.error("LinkedIn Authentication Failed", {
        description:
          error.message ||
          "Failed to initiate LinkedIn authentication. Please try again.",
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
          | "employer"
          | "admin"
          | "freelancer",
      };

      authService.setStoredUser(user);
      setUser(user);
      await loadUserProfile();

      toast.success("Welcome!", {
        description: "You have been successfully logged in with LinkedIn.",
      });

      // Redirect to appropriate dashboard
      const redirectPath = getDashboardPath(user.account_type);
      window.location.href = redirectPath;
    } catch (error: any) {
      console.error("OAuth callback error:", error);
      toast.error("Authentication Failed", {
        description:
          error.message ||
          "Failed to complete LinkedIn authentication. Please try again.",
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
    isAdmin,
    isEmployer,
    isJobSeeker,
    isFreelancer,
    setTokens,
    signInWithLinkedIn,
    handleOAuthCallback,
    impersonateUser,
    stopImpersonation,
    isImpersonating,
    originalUser,
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        Loading authentication...
      </div>
    );
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
