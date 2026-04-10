
import { useState, createContext, useContext, ReactNode } from 'react';
import { toast } from "@/components/ui/sonner";
import { AdminProfile } from "@/pages/admin/AdminProfiles";

type ProfilesContextType = {
  profiles: AdminProfile[];
  updateProfile: (id: string, profileData: Partial<AdminProfile>) => Promise<boolean>;
  deleteProfile: (id: string) => Promise<boolean>;
  getProfileById: (id: string) => AdminProfile | undefined;
  getProfilesByRole: (role: AdminProfile['role']) => AdminProfile[];
  isLoading: boolean;
};

const ProfilesContext = createContext<ProfilesContextType | undefined>(undefined);

const mockProfiles: AdminProfile[] = [
  {
    id: "profile-1",
    name: "Sarah Johnson",
    email: "sarah.johnson@email.com",
    role: "jobseeker",
    profileImage: "/placeholder.svg",
    location: "Nairobi, Kenya",
    title: "Senior Software Engineer",
    isPublic: true,
    showContact: true,
    joinDate: "2024-01-15",
    lastActive: "2024-03-14",
    profileComplete: 90,
  },
  {
    id: "profile-2",
    name: "TechCorp Solutions",
    email: "contact@techcorp.com",
    role: "employer",
    profileImage: "/placeholder.svg",
    location: "Nairobi, Kenya",
    companyName: "TechCorp Solutions",
    isPublic: true,
    showContact: false,
    joinDate: "2024-02-01",
    lastActive: "2024-03-13",
    profileComplete: 85,
  },
  {
    id: "profile-3",
    name: "John Developer",
    email: "john.dev@email.com",
    role: "jobseeker",
    profileImage: "/placeholder.svg",
    location: "Mombasa, Kenya",
    title: "Frontend Developer",
    isPublic: false,
    showContact: true,
    joinDate: "2024-03-01",
    lastActive: "2024-03-12",
    profileComplete: 75,
  },
];

export const ProfilesProvider = ({ children }: { children: ReactNode }) => {
  const [profiles, setProfiles] = useState<AdminProfile[]>(mockProfiles);
  const [isLoading, setIsLoading] = useState(false);

  const updateProfile = async (id: string, profileData: Partial<AdminProfile>): Promise<boolean> => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      setProfiles(prev => prev.map(profile => 
        profile.id === id ? { ...profile, ...profileData } : profile
      ));
      toast.success("Profile updated successfully");
      return true;
    } catch (error) {
      toast.error("Failed to update profile");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteProfile = async (id: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      setProfiles(prev => prev.filter(profile => profile.id !== id));
      toast.success("Profile deleted successfully");
      return true;
    } catch (error) {
      toast.error("Failed to delete profile");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const getProfileById = (id: string): AdminProfile | undefined => {
    return profiles.find(profile => profile.id === id);
  };

  const getProfilesByRole = (role: AdminProfile['role']): AdminProfile[] => {
    return profiles.filter(profile => profile.role === role);
  };

  return (
    <ProfilesContext.Provider value={{
      profiles,
      updateProfile,
      deleteProfile,
      getProfileById,
      getProfilesByRole,
      isLoading,
    }}>
      {children}
    </ProfilesContext.Provider>
  );
};

export const useProfiles = () => {
  const context = useContext(ProfilesContext);
  if (context === undefined) {
    throw new Error('useProfiles must be used within a ProfilesProvider');
  }
  return context;
};
