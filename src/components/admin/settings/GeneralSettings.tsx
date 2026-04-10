
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";

interface GeneralSettingsProps {
  initialSettings: {
    siteName: string;
    siteDescription: string;
    contactEmail: string;
    registrationsEnabled: boolean;
    maintenanceMode: boolean;
  };
  onSettingsChange: (settings: any) => void;
}

export const GeneralSettings = ({ 
  initialSettings, 
  onSettingsChange 
}: GeneralSettingsProps) => {
  const { toast } = useToast();
  const [settings, setSettings] = useState(initialSettings);

  const handleChange = (key: string, value: any) => {
    const updatedSettings = { ...settings, [key]: value };
    setSettings(updatedSettings);
    onSettingsChange(updatedSettings);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-sm font-medium">Site Name</label>
          <Input 
            value={settings.siteName} 
            onChange={(e) => handleChange('siteName', e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Contact Email</label>
          <Input 
            type="email"
            value={settings.contactEmail} 
            onChange={(e) => handleChange('contactEmail', e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Site Description</label>
        <Textarea 
          value={settings.siteDescription} 
          onChange={(e) => handleChange('siteDescription', e.target.value)}
          rows={3}
        />
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">Enable User Registrations</p>
            <p className="text-sm text-gray-500">Allow new users to register on the site</p>
          </div>
          <Switch 
            checked={settings.registrationsEnabled} 
            onCheckedChange={(checked) => {
              handleChange('registrationsEnabled', checked);
              toast({
                title: "Registration " + (checked ? "Enabled" : "Disabled"),
                description: checked ? "Users can now register on the site" : "User registration has been disabled"
              });
            }}
          />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">Maintenance Mode</p>
            <p className="text-sm text-gray-500">Put the site in maintenance mode (only admins can access)</p>
          </div>
          <Switch 
            checked={settings.maintenanceMode} 
            onCheckedChange={(checked) => {
              handleChange('maintenanceMode', checked);
              toast({
                title: "Maintenance Mode " + (checked ? "Enabled" : "Disabled"),
                description: checked ? "Site is now in maintenance mode" : "Site is now accessible to all users",
                variant: checked ? "destructive" : "default"
              });
            }}
          />
        </div>
      </div>
    </div>
  );
};
