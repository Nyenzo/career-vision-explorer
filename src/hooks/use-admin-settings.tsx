
import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

interface GeneralSettings {
  siteName: string;
  siteDescription: string;
  contactEmail: string;
  registrationsEnabled: boolean;
  maintenanceMode: boolean;
}

interface AppearanceSettings {
  primaryColor: string;
  secondaryColor: string;
  logoUrl: string;
  faviconUrl: string;
}

interface NotificationSettings {
  emailNotifications: boolean;
  welcomeEmail: boolean;
  jobAlerts: boolean;
  newsletterEnabled: boolean;
}

interface AdminSettingsContextType {
  generalSettings: GeneralSettings;
  appearance: AppearanceSettings;
  notifications: NotificationSettings;
  updateGeneralSettings: (settings: Partial<GeneralSettings>) => void;
  updateAppearance: (appearance: Partial<AppearanceSettings>) => void;
  updateNotifications: (notifications: Partial<NotificationSettings>) => void;
  saveAllSettings: () => void;
  isLoading: boolean;
  hasUnsavedChanges: boolean;
}

const AdminSettingsContext = createContext<AdminSettingsContextType | undefined>(undefined);

// Global settings state for real-time sync and persistence
let globalSettingsState = {
  general: {
    siteName: "Visiondrill Careers",
    siteDescription: "AI-Driven career navigator helping professionals find their perfect job match",
    contactEmail: "support@visiondrill.com",
    registrationsEnabled: true,
    maintenanceMode: false
  },
  appearance: {
    primaryColor: "#3b82f6",
    secondaryColor: "#8b5cf6",
    logoUrl: "/images/logo.png",
    faviconUrl: "/images/favicon.ico"
  },
  notifications: {
    emailNotifications: true,
    welcomeEmail: true,
    jobAlerts: true,
    newsletterEnabled: true
  }
};

// Load from localStorage on initialization
const loadSettingsFromStorage = () => {
  try {
    const stored = localStorage.getItem('visiondrill-admin-settings');
    if (stored) {
      const parsed = JSON.parse(stored);
      globalSettingsState = { ...globalSettingsState, ...parsed };
    }
  } catch (error) {
    console.warn('Failed to load settings from storage:', error);
  }
};

// Save to localStorage
const saveSettingsToStorage = () => {
  try {
    localStorage.setItem('visiondrill-admin-settings', JSON.stringify(globalSettingsState));
  } catch (error) {
    console.warn('Failed to save settings to storage:', error);
  }
};

// Load settings on module initialization
loadSettingsFromStorage();

// Event listeners for real-time sync across tabs
const settingsListeners: Set<() => void> = new Set();

const notifySettingsListeners = () => {
  settingsListeners.forEach(listener => listener());
  saveSettingsToStorage();
};

export const AdminSettingsProvider = ({ children }: { children: ReactNode }) => {
  const [generalSettings, setGeneralSettings] = useState<GeneralSettings>(globalSettingsState.general);
  const [appearance, setAppearance] = useState<AppearanceSettings>(globalSettingsState.appearance);
  const [notifications, setNotifications] = useState<NotificationSettings>(globalSettingsState.notifications);
  const [isLoading, setIsLoading] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const { toast } = useToast();

  // Sync with global state
  useEffect(() => {
    const syncState = () => {
      setGeneralSettings({ ...globalSettingsState.general });
      setAppearance({ ...globalSettingsState.appearance });
      setNotifications({ ...globalSettingsState.notifications });
      setHasUnsavedChanges(false);
    };
    
    settingsListeners.add(syncState);
    return () => {
      settingsListeners.delete(syncState);
    };
  }, []);

  // Listen for storage changes from other tabs
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'visiondrill-admin-settings' && e.newValue) {
        try {
          const newSettings = JSON.parse(e.newValue);
          globalSettingsState = newSettings;
          notifySettingsListeners();
        } catch (error) {
          console.warn('Failed to parse settings from storage:', error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const updateGeneralSettings = (newSettings: Partial<GeneralSettings>) => {
    const updated = { ...globalSettingsState.general, ...newSettings };
    globalSettingsState.general = updated;
    setGeneralSettings(updated);
    setHasUnsavedChanges(true);
    notifySettingsListeners();
    
    toast({
      title: "Settings Updated",
      description: "General settings have been updated in real-time"
    });
  };

  const updateAppearance = (newAppearance: Partial<AppearanceSettings>) => {
    const updated = { ...globalSettingsState.appearance, ...newAppearance };
    globalSettingsState.appearance = updated;
    setAppearance(updated);
    setHasUnsavedChanges(true);
    notifySettingsListeners();
    
    toast({
      title: "Appearance Updated",
      description: "Theme settings have been updated in real-time"
    });
  };

  const updateNotifications = (newNotifications: Partial<NotificationSettings>) => {
    const updated = { ...globalSettingsState.notifications, ...newNotifications };
    globalSettingsState.notifications = updated;
    setNotifications(updated);
    setHasUnsavedChanges(true);
    notifySettingsListeners();
    
    toast({
      title: "Notifications Updated",
      description: "Notification settings have been updated in real-time"
    });
  };

  const saveAllSettings = () => {
    setIsLoading(true);
    try {
      // Simulate API call
      setTimeout(() => {
        saveSettingsToStorage();
        setHasUnsavedChanges(false);
        setIsLoading(false);
        
        toast({
          title: "Settings Saved",
          description: "All settings have been saved successfully"
        });
        
        console.log("Settings saved:", globalSettingsState);
      }, 500);
    } catch (error) {
      setIsLoading(false);
      toast({
        title: "Save Failed",
        description: "Failed to save settings. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <AdminSettingsContext.Provider value={{
      generalSettings,
      appearance,
      notifications,
      updateGeneralSettings,
      updateAppearance,
      updateNotifications,
      saveAllSettings,
      isLoading,
      hasUnsavedChanges
    }}>
      {children}
    </AdminSettingsContext.Provider>
  );
};

export const useAdminSettings = () => {
  const context = useContext(AdminSettingsContext);
  if (context === undefined) {
    throw new Error("useAdminSettings must be used within an AdminSettingsProvider");
  }
  return context;
};
