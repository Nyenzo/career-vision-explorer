
import { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface NotificationSettingsProps {
  initialNotifications: {
    emailNotifications: boolean;
    welcomeEmail: boolean;
    jobAlerts: boolean;
    newsletterEnabled: boolean;
  };
  onNotificationsChange: (notifications: any) => void;
}

export const NotificationSettings = ({
  initialNotifications,
  onNotificationsChange
}: NotificationSettingsProps) => {
  const { toast } = useToast();
  const [notifications, setNotifications] = useState(initialNotifications);

  const handleChange = (key: string, value: boolean) => {
    const updatedNotifications = { ...notifications, [key]: value };
    setNotifications(updatedNotifications);
    onNotificationsChange(updatedNotifications);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium">Email Notifications</p>
          <p className="text-sm text-gray-500">Enable all email notifications</p>
        </div>
        <Switch 
          checked={notifications.emailNotifications} 
          onCheckedChange={(checked) => {
            const updatedNotifications = {
              ...notifications, 
              emailNotifications: checked,
              // If main switch is off, disable all child switches
              welcomeEmail: checked ? notifications.welcomeEmail : false,
              jobAlerts: checked ? notifications.jobAlerts : false
            };
            setNotifications(updatedNotifications);
            onNotificationsChange(updatedNotifications);
            
            toast({
              title: "Email Notifications " + (checked ? "Enabled" : "Disabled"),
              description: checked ? "All email notifications are now active" : "All email notifications have been disabled"
            });
          }}
        />
      </div>

      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium">Welcome Emails</p>
          <p className="text-sm text-gray-500">Send welcome email to new users</p>
        </div>
        <Switch 
          checked={notifications.welcomeEmail} 
          onCheckedChange={(checked) => handleChange('welcomeEmail', checked)}
          disabled={!notifications.emailNotifications}
        />
      </div>

      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium">Job Alerts</p>
          <p className="text-sm text-gray-500">Send job match notifications to users</p>
        </div>
        <Switch 
          checked={notifications.jobAlerts} 
          onCheckedChange={(checked) => handleChange('jobAlerts', checked)}
          disabled={!notifications.emailNotifications}
        />
      </div>

      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium">Newsletter</p>
          <p className="text-sm text-gray-500">Enable newsletter subscription</p>
        </div>
        <Switch 
          checked={notifications.newsletterEnabled} 
          onCheckedChange={(checked) => handleChange('newsletterEnabled', checked)}
        />
      </div>

      <Button 
        onClick={() => {
          toast({
            title: "Notification Settings Saved",
            description: "Your notification preferences have been updated"
          });
        }}
      >
        Apply Notification Settings
      </Button>
    </div>
  );
};
