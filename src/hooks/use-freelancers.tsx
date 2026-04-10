
import { useState, createContext, useContext, ReactNode } from 'react';
import { toast } from "@/components/ui/sonner";
import { FreelancerProfile, PortfolioItem, PricingTier } from "@/types/freelancer";

type FreelancersContextType = {
  freelancers: FreelancerProfile[];
  createFreelancer: (freelancerData: Omit<FreelancerProfile, 'id' | 'joinDate'>) => Promise<boolean>;
  updateFreelancer: (id: string, freelancerData: Partial<FreelancerProfile>) => Promise<boolean>;
  deleteFreelancer: (id: string) => Promise<boolean>;
  getFreelancerById: (id: string) => FreelancerProfile | undefined;
  addPortfolioItem: (freelancerId: string, item: Omit<PortfolioItem, 'id' | 'createdAt'>) => Promise<boolean>;
  addPricingTier: (freelancerId: string, tier: Omit<PricingTier, 'id'>) => Promise<boolean>;
  isLoading: boolean;
};

const FreelancersContext = createContext<FreelancersContextType | undefined>(undefined);

const mockFreelancers: FreelancerProfile[] = [
  {
    id: "1",
    userId: "3",
    name: "Sarah Designer",
    email: "sarah@example.com",
    title: "UI/UX Designer & Frontend Developer",
    description: "I create beautiful, user-friendly designs that convert visitors into customers.",
    skills: ["UI/UX Design", "React", "Figma", "Adobe Creative Suite"],
    profileImage: "/placeholder.svg",
    location: "San Francisco, CA",
    hourlyRate: 85,
    rating: 4.9,
    completedProjects: 127,
    isActive: true,
    joinDate: "2024-01-15",
    portfolio: [
      {
        id: "p1",
        title: "E-commerce Mobile App",
        description: "Complete mobile app design for fashion e-commerce",
        image: "/placeholder.svg",
        tags: ["Mobile", "E-commerce", "UI/UX"],
        createdAt: "2024-02-15"
      }
    ],
    pricing: [
      {
        id: "pr1",
        tier: "basic",
        title: "Basic Design",
        price: 50,
        description: "Simple landing page design",
        deliveryDays: 3,
        revisions: 2,
        features: ["1 Page Design", "Mobile Responsive", "Source Files"]
      },
      {
        id: "pr2",
        tier: "standard",
        title: "Standard Package",
        price: 150,
        description: "Complete website design with up to 5 pages",
        deliveryDays: 7,
        revisions: 3,
        features: ["Up to 5 Pages", "Mobile Responsive", "Source Files", "Basic SEO"]
      },
      {
        id: "pr3",
        tier: "premium",
        title: "Premium Package",
        price: 300,
        description: "Full website design with advanced features",
        deliveryDays: 14,
        revisions: 5,
        features: ["Unlimited Pages", "Mobile Responsive", "Source Files", "Advanced SEO", "CMS Integration"]
      }
    ]
  }
];

export const FreelancersProvider = ({ children }: { children: ReactNode }) => {
  const [freelancers, setFreelancers] = useState<FreelancerProfile[]>(mockFreelancers);
  const [isLoading, setIsLoading] = useState(false);

  const createFreelancer = async (freelancerData: Omit<FreelancerProfile, 'id' | 'joinDate'>): Promise<boolean> => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const newFreelancer: FreelancerProfile = {
        ...freelancerData,
        id: Date.now().toString(),
        joinDate: new Date().toISOString().split('T')[0],
      };
      
      setFreelancers(prev => [...prev, newFreelancer]);
      toast.success("Freelancer profile created successfully");
      return true;
    } catch (error) {
      toast.error("Failed to create freelancer profile");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const updateFreelancer = async (id: string, freelancerData: Partial<FreelancerProfile>): Promise<boolean> => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setFreelancers(prev => prev.map(freelancer => 
        freelancer.id === id ? { ...freelancer, ...freelancerData } : freelancer
      ));
      
      toast.success("Freelancer updated successfully");
      return true;
    } catch (error) {
      toast.error("Failed to update freelancer");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteFreelancer = async (id: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setFreelancers(prev => prev.filter(freelancer => freelancer.id !== id));
      toast.success("Freelancer deleted successfully");
      return true;
    } catch (error) {
      toast.error("Failed to delete freelancer");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const getFreelancerById = (id: string): FreelancerProfile | undefined => {
    return freelancers.find(freelancer => freelancer.id === id);
  };

  const addPortfolioItem = async (freelancerId: string, item: Omit<PortfolioItem, 'id' | 'createdAt'>): Promise<boolean> => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const newItem: PortfolioItem = {
        ...item,
        id: Date.now().toString(),
        createdAt: new Date().toISOString()
      };
      
      setFreelancers(prev => prev.map(freelancer => 
        freelancer.id === freelancerId 
          ? { ...freelancer, portfolio: [...freelancer.portfolio, newItem] }
          : freelancer
      ));
      
      toast.success("Portfolio item added successfully");
      return true;
    } catch (error) {
      toast.error("Failed to add portfolio item");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const addPricingTier = async (freelancerId: string, tier: Omit<PricingTier, 'id'>): Promise<boolean> => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const newTier: PricingTier = {
        ...tier,
        id: Date.now().toString()
      };
      
      setFreelancers(prev => prev.map(freelancer => 
        freelancer.id === freelancerId 
          ? { ...freelancer, pricing: [...freelancer.pricing, newTier] }
          : freelancer
      ));
      
      toast.success("Pricing tier added successfully");
      return true;
    } catch (error) {
      toast.error("Failed to add pricing tier");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <FreelancersContext.Provider value={{
      freelancers,
      createFreelancer,
      updateFreelancer,
      deleteFreelancer,
      getFreelancerById,
      addPortfolioItem,
      addPricingTier,
      isLoading,
    }}>
      {children}
    </FreelancersContext.Provider>
  );
};

export const useFreelancers = () => {
  const context = useContext(FreelancersContext);
  if (context === undefined) {
    throw new Error('useFreelancers must be used within a FreelancersProvider');
  }
  return context;
};
