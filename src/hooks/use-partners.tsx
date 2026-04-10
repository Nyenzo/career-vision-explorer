
import { createContext, useContext, useState, ReactNode } from "react";
import { useToast } from "@/hooks/use-toast";

export interface Partner {
  id: number;
  name: string;
  logo: string;
  website: string;
  category: "employer" | "education" | "recruiting";
  status?: "active" | "inactive";
  createdAt?: string;
  description?: string;
}

interface PartnersContextType {
  partners: Partner[];
  addPartner: (partner: Omit<Partner, "id" | "createdAt">) => void;
  updatePartner: (id: number, partner: Partial<Partner>) => void;
  deletePartner: (id: number) => void;
  getPartnersByCategory: (category: Partner["category"]) => Partner[];
  isLoading: boolean;
}

const PartnersContext = createContext<PartnersContextType | undefined>(undefined);

const mockPartners: Partner[] = [
  { 
    id: 1,
    name: "TechGiant Inc.", 
    logo: "/lovable-uploads/37656cc1-be74-4d59-8843-b6729c619a2a.png",
    website: "https://techgiant.com",
    category: "employer",
    status: "active",
    createdAt: "2024-01-15",
    description: "Leading technology company specializing in AI and cloud solutions"
  },
  { 
    id: 2,
    name: "Global University", 
    logo: "https://images.unsplash.com/photo-1568792923760-d70635a89fdd?auto=format&fit=crop&w=100&h=100",
    website: "https://globaluniversity.edu",
    category: "education",
    status: "active",
    createdAt: "2024-01-10",
    description: "Prestigious institution offering cutting-edge programs"
  },
  { 
    id: 3,
    name: "Future Staffing", 
    logo: "https://images.unsplash.com/photo-1565372195458-9de0b320ef04?auto=format&fit=crop&w=100&h=100",
    website: "https://futurestaffing.com",
    category: "recruiting",
    status: "active",
    createdAt: "2024-01-05",
    description: "Premier recruitment agency for tech professionals"
  },
  { 
    id: 4,
    name: "InnovateHR", 
    logo: "https://images.unsplash.com/photo-1560179707-f14e90ef3623?auto=format&fit=crop&w=100&h=100",
    website: "https://innovatehr.com",
    category: "recruiting",
    status: "active",
    createdAt: "2024-01-20",
    description: "Modern HR solutions and talent acquisition"
  },
  { 
    id: 5,
    name: "Career Academy", 
    logo: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=100&h=100",
    website: "https://careeracademy.edu",
    category: "education",
    status: "active",
    createdAt: "2024-01-12",
    description: "Professional development and certification programs"
  },
  { 
    id: 6,
    name: "Elite Corp", 
    logo: "https://images.unsplash.com/photo-1560441347-3a9c2e1e7e5c?auto=format&fit=crop&w=100&h=100",
    website: "https://elitecorp.com",
    category: "employer",
    status: "active",
    createdAt: "2024-01-08",
    description: "Fortune 500 company with global operations"
  },
];

export const PartnersProvider = ({ children }: { children: ReactNode }) => {
  const [partners, setPartners] = useState<Partner[]>(mockPartners);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const addPartner = (partnerData: Omit<Partner, "id" | "createdAt">) => {
    setIsLoading(true);
    try {
      const newPartner: Partner = {
        ...partnerData,
        id: Math.max(...partners.map(p => p.id)) + 1,
        status: "active",
        createdAt: new Date().toISOString().split('T')[0]
      };
      setPartners(prev => [...prev, newPartner]);
      toast({
        title: "Success",
        description: "Partner added successfully"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add partner",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updatePartner = (id: number, partnerData: Partial<Partner>) => {
    setIsLoading(true);
    try {
      setPartners(prev => prev.map(p => 
        p.id === id ? { ...p, ...partnerData } : p
      ));
      toast({
        title: "Success",
        description: "Partner updated successfully"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update partner",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const deletePartner = (id: number) => {
    setIsLoading(true);
    try {
      setPartners(prev => prev.filter(p => p.id !== id));
      toast({
        title: "Success",
        description: "Partner deleted successfully"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete partner",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getPartnersByCategory = (category: Partner["category"]) => {
    return partners.filter(partner => partner.category === category);
  };

  return (
    <PartnersContext.Provider value={{
      partners,
      addPartner,
      updatePartner,
      deletePartner,
      getPartnersByCategory,
      isLoading
    }}>
      {children}
    </PartnersContext.Provider>
  );
};

export const usePartners = () => {
  const context = useContext(PartnersContext);
  if (context === undefined) {
    throw new Error("usePartners must be used within a PartnersProvider");
  }
  return context;
};
