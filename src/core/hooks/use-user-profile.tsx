
import { useState, createContext, useContext, ReactNode } from 'react';
import { toast } from "@/components/ui/sonner";

export type UserProfile = {
  id: string;
  name: string;
  email: string;
  role: string;
  education: string;
  experience: string;
  location?: string;
  phone?: string;
  bio?: string;
  profileImage?: string;
  joinDate: string;
  profileComplete: number;
};

type UserProfileContextType = {
  userProfile: UserProfile | null;
  updateProfile: (profileData: Partial<UserProfile>) => Promise<boolean>;
  isLoading: boolean;
};

const UserProfileContext = createContext<UserProfileContextType | undefined>(undefined);

const mockUserProfile: UserProfile = {
  id: "1",
  name: "John Doe",
  email: "john.doe@example.com",
  role: "Senior Software Engineer",
  education: "BSc Computer Science, University of Nairobi",
  experience: "5+ years experience",
  location: "Nairobi, Kenya",
  phone: "+254 700 123 456",
  bio: "Passionate software engineer with expertise in React, Node.js, and cloud technologies. I love building scalable applications and mentoring junior developers.",
  joinDate: "2024-01-15",
  profileComplete: 85,
};

export const UserProfileProvider = ({ children }: { children: ReactNode }) => {
  const [userProfile, setUserProfile] = useState<UserProfile>(mockUserProfile);
  const [isLoading, setIsLoading] = useState(false);

  const updateProfile = async (profileData: Partial<UserProfile>): Promise<boolean> => {
    setIsLoading(true);
    try {
      console.log("Updating profile with:", profileData);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const updatedProfile = {
        ...userProfile,
        ...profileData,
        profileComplete: calculateProfileCompletion({ ...userProfile, ...profileData }),
      };
      
      console.log("Setting new profile:", updatedProfile);
      setUserProfile(updatedProfile);
      
      toast.success("Profile updated successfully");
      return true;
    } catch (error) {
      console.error("Failed to update profile:", error);
      toast.error("Failed to update profile");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const calculateProfileCompletion = (profile: UserProfile): number => {
    const fields = ['name', 'email', 'role', 'education', 'experience', 'location', 'phone', 'bio'];
    const completedFields = fields.filter(field => profile[field as keyof UserProfile]);
    return Math.round((completedFields.length / fields.length) * 100);
  };

  return (
    <UserProfileContext.Provider value={{
      userProfile,
      updateProfile,
      isLoading,
    }}>
      {children}
    </UserProfileContext.Provider>
  );
};

export const useUserProfile = () => {
  const context = useContext(UserProfileContext);
  if (context === undefined) {
    throw new Error('useUserProfile must be used within a UserProfileProvider');
  }
  return context;
};
