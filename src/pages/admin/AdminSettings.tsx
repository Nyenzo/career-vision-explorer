
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AdminLayout from "@/components/admin/AdminLayout";
import { useToast } from "@/hooks/use-toast";
import { SettingsHeader } from "@/components/admin/settings/SettingsHeader";
import { GeneralSettings } from "@/components/admin/settings/GeneralSettings";
import { AppearanceSettings } from "@/components/admin/settings/AppearanceSettings";
import { NotificationSettings } from "@/components/admin/settings/NotificationSettings";
import { FeatureManagement } from "@/components/admin/settings/FeatureManagement";

const AdminSettings = () => {
  const { toast } = useToast();
  
  const [generalSettings, setGeneralSettings] = useState({
    siteName: "Visiondrill Careers",
    siteDescription: "AI-Driven career navigator helping professionals find their perfect job match",
    contactEmail: "support@visiondrill.com",
    registrationsEnabled: true,
    maintenanceMode: false
  });

  const [appearance, setAppearance] = useState({
    primaryColor: "#3b82f6",
    secondaryColor: "#8b5cf6",
    logoUrl: "/images/logo.png",
    faviconUrl: "/images/favicon.ico"
  });

  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    welcomeEmail: true,
    jobAlerts: true,
    newsletterEnabled: true
  });

  const saveSettings = () => {
    try {
      // In a real app, you would save to a database or API here
      toast({
        title: "Settings Saved",
        description: "Your changes have been successfully applied"
      });
      
      // Log settings to console for debugging
      console.log("Settings saved:", {
        generalSettings,
        appearance,
        notifications
      });
    } catch (error) {
      console.error("Error saving settings:", error);
      toast({
        title: "Error",
        description: "Failed to save settings. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <AdminLayout>
      <div className="p-6">
        <SettingsHeader onSave={saveSettings} />

        <div className="bg-white shadow rounded-lg overflow-hidden">
          <Tabs defaultValue="general" className="w-full">
            <div className="border-b">
              <TabsList className="p-0 bg-transparent border-b">
                <TabsTrigger value="general" className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-career-blue">
                  General
                </TabsTrigger>
                <TabsTrigger value="appearance" className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-career-blue">
                  Appearance
                </TabsTrigger>
                <TabsTrigger value="notifications" className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-career-blue">
                  Notifications
                </TabsTrigger>
                <TabsTrigger value="features" className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-career-blue">
                  Features
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="general" className="p-6">
              <GeneralSettings 
                initialSettings={generalSettings} 
                onSettingsChange={setGeneralSettings} 
              />
            </TabsContent>

            <TabsContent value="appearance" className="p-6">
              <AppearanceSettings 
                initialAppearance={appearance} 
                onAppearanceChange={setAppearance} 
              />
            </TabsContent>

            <TabsContent value="notifications" className="p-6">
              <NotificationSettings 
                initialNotifications={notifications} 
                onNotificationsChange={setNotifications} 
              />
            </TabsContent>

            <TabsContent value="features" className="p-6">
              <FeatureManagement />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminSettings;
