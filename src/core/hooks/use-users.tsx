
import { useState, createContext, useContext, ReactNode } from 'react';
import { toast } from "@/components/ui/sonner";
import { FeatureFlags } from "@/hooks/use-features";

export type User = {
  id: string;
  name: string;
  email: string;
  role: "admin" | "jobseeker" | "employer" | "subadmin";
  status: "active" | "inactive";
  joinDate: string;
  lastLogin?: string;
  profileComplete?: number;
  permissions?: Partial<FeatureFlags>;
};

type UsersContextType = {
  users: User[];
  createUser: (userData: Omit<User, 'id' | 'joinDate'>) => Promise<boolean>;
  updateUser: (id: string, userData: Partial<User>) => Promise<boolean>;
  deleteUser: (id: string) => Promise<boolean>;
  getUserById: (id: string) => User | undefined;
  getUsersByRole: (role: User['role']) => User[];
  isLoading: boolean;
};

const UsersContext = createContext<UsersContextType | undefined>(undefined);

const mockUsers: User[] = [
  {
    id: "1",
    name: "John Admin",
    email: "admin@visiondrill.com",
    role: "admin",
    status: "active",
    joinDate: "2024-01-15",
    lastLogin: "2024-03-14",
  },
  {
    id: "2",
    name: "Sarah Employer",
    email: "employer@visiondrill.com",
    role: "employer",
    status: "active",
    joinDate: "2024-02-20",
    lastLogin: "2024-03-13",
  },
  {
    id: "3",
    name: "Mike Jobseeker",
    email: "jobseeker@visiondrill.com",
    role: "jobseeker",
    status: "active",
    joinDate: "2024-03-01",
    lastLogin: "2024-03-14",
    profileComplete: 85,
  },
  {
    id: "4",
    name: "Alice SubAdmin",
    email: "subadmin@visiondrill.com",
    role: "subadmin",
    status: "active",
    joinDate: "2024-03-05",
    lastLogin: "2024-03-14",
    permissions: {
      jobMatching: true,
      skillsAssessment: true,
      userRegistration: true,
      profileCreation: true,
      partnerShowcase: false,
      blogSection: false,
      testimonials: true,
      ctaSection: false,
      microlearning: true,
      aiInterviewPractice: false,
      careerPaths: true,
      applicationTracking: true,
    },
  },
];

export const UsersProvider = ({ children }: { children: ReactNode }) => {
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [isLoading, setIsLoading] = useState(false);

  const createUser = async (userData: Omit<User, 'id' | 'joinDate'>): Promise<boolean> => {
    setIsLoading(true);
    console.log('Creating user:', userData);
    
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const newUser: User = {
        ...userData,
        id: Date.now().toString(),
        joinDate: new Date().toISOString().split('T')[0],
        // Initialize empty permissions for subadmin
        permissions: userData.role === 'subadmin' ? (userData.permissions || {}) : undefined,
      };
      
      setUsers(prev => [...prev, newUser]);
      console.log('User created successfully:', newUser);
      toast.success("User created successfully");
      return true;
    } catch (error) {
      console.error('Error creating user:', error);
      toast.error("Failed to create user");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const updateUser = async (id: string, userData: Partial<User>): Promise<boolean> => {
    setIsLoading(true);
    console.log('Updating user:', id, 'with data:', userData);
    
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setUsers(prev => prev.map(user => 
        user.id === id ? { ...user, ...userData } : user
      ));
      
      console.log('User updated successfully');
      toast.success("User updated successfully");
      return true;
    } catch (error) {
      console.error('Error updating user:', error);
      toast.error("Failed to update user");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteUser = async (id: string): Promise<boolean> => {
    setIsLoading(true);
    console.log('Deleting user:', id);
    
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setUsers(prev => prev.filter(user => user.id !== id));
      console.log('User deleted successfully');
      toast.success("User deleted successfully");
      return true;
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error("Failed to delete user");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const getUserById = (id: string): User | undefined => {
    return users.find(user => user.id === id);
  };

  const getUsersByRole = (role: User['role']): User[] => {
    return users.filter(user => user.role === role);
  };

  return (
    <UsersContext.Provider value={{
      users,
      createUser,
      updateUser,
      deleteUser,
      getUserById,
      getUsersByRole,
      isLoading,
    }}>
      {children}
    </UsersContext.Provider>
  );
};

export const useUsers = () => {
  const context = useContext(UsersContext);
  if (context === undefined) {
    throw new Error('useUsers must be used within a UsersProvider');
  }
  return context;
};
