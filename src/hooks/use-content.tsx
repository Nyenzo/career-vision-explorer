
import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Content, ContentType, ContentStatus } from "@/types/content";

interface ContentContextType {
  contents: Content[];
  addContent: (content: Omit<Content, "id" | "createdAt" | "updatedAt">) => void;
  updateContent: (id: string, content: Partial<Content>) => void;
  deleteContent: (id: string) => void;
  getContentByType: (type: ContentType) => Content[];
  getContentByLocation: (location: string) => Content[];
  isLoading: boolean;
  refreshContent: () => void;
}

const ContentContext = createContext<ContentContextType | undefined>(undefined);

// Global content state for real-time sync
let globalContentState: Content[] = [
  {
    id: "1",
    title: "Homepage Hero Section",
    slug: "homepage-hero",
    type: "hero",
    status: "published",
    content: "Navigate your career journey with confidence and clarity",
    excerpt: "Main hero text displayed on the homepage",
    location: "homepage-hero",
    authorId: "1",
    authorName: "Admin User",
    createdAt: "2024-03-15",
    updatedAt: "2024-03-15",
  },
  {
    id: "2",
    title: "About Us Page Content",
    slug: "about-us",
    type: "page",
    status: "published",
    content: "At Visiondrill Career Explorer, we believe that everyone deserves to find meaningful work that aligns with their values, skills, and aspirations. Our mission is to provide innovative tools and personalized guidance to help individuals navigate their career journey with confidence.",
    excerpt: "Main content for the About Us page",
    location: "about-page",
    authorId: "1",
    authorName: "Admin User",
    createdAt: "2024-03-10",
    updatedAt: "2024-03-12",
  },
  {
    id: "3",
    title: "Career Success Stories",
    slug: "success-stories",
    type: "testimonial-section",
    status: "published",
    content: "Discover how professionals have transformed their careers using our platform. From career changers to skill builders, read inspiring stories of growth and success.",
    excerpt: "Collection of user success stories",
    location: "homepage-testimonials",
    authorId: "1",
    authorName: "Admin User",
    createdAt: "2024-03-08",
    updatedAt: "2024-03-14"
  }
];

// Event listeners for real-time sync
const contentListeners: Set<() => void> = new Set();

const notifyContentListeners = () => {
  contentListeners.forEach(listener => listener());
};

export const ContentProvider = ({ children }: { children: ReactNode }) => {
  const [contents, setContents] = useState<Content[]>(globalContentState);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Sync with global state
  useEffect(() => {
    const syncState = () => {
      setContents([...globalContentState]);
    };
    
    contentListeners.add(syncState);
    return () => {
      contentListeners.delete(syncState);
    };
  }, []);

  const addContent = (contentData: Omit<Content, "id" | "createdAt" | "updatedAt">) => {
    setIsLoading(true);
    try {
      const newContent: Content = {
        ...contentData,
        id: Date.now().toString(),
        createdAt: new Date().toISOString().split('T')[0],
        updatedAt: new Date().toISOString().split('T')[0]
      };
      globalContentState = [...globalContentState, newContent];
      notifyContentListeners();
      toast({
        title: "Success",
        description: "Content created successfully"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create content",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateContent = (id: string, contentData: Partial<Content>) => {
    setIsLoading(true);
    try {
      globalContentState = globalContentState.map(c => 
        c.id === id ? { ...c, ...contentData, updatedAt: new Date().toISOString().split('T')[0] } : c
      );
      notifyContentListeners();
      toast({
        title: "Success",
        description: "Content updated successfully"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update content",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const deleteContent = (id: string) => {
    setIsLoading(true);
    try {
      globalContentState = globalContentState.filter(c => c.id !== id);
      notifyContentListeners();
      toast({
        title: "Success",
        description: "Content deleted successfully"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete content",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getContentByType = (type: ContentType) => {
    return contents.filter(content => content.type === type);
  };

  const getContentByLocation = (location: string) => {
    return contents.filter(content => content.location === location);
  };

  const refreshContent = () => {
    setContents([...globalContentState]);
  };

  return (
    <ContentContext.Provider value={{
      contents,
      addContent,
      updateContent,
      deleteContent,
      getContentByType,
      getContentByLocation,
      isLoading,
      refreshContent
    }}>
      {children}
    </ContentContext.Provider>
  );
};

export const useContent = () => {
  const context = useContext(ContentContext);
  if (context === undefined) {
    throw new Error("useContent must be used within a ContentProvider");
  }
  return context;
};
