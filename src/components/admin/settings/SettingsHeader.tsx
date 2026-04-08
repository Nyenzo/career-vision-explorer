
import { Save } from "lucide-react";
import { AdminButton } from "@/components/ui/custom-button";
import { useState } from "react";

interface SettingsHeaderProps {
  onSave: () => void;
}

export const SettingsHeader = ({ onSave }: SettingsHeaderProps) => {
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = () => {
    setIsSaving(true);
    
    // Simulate API delay
    setTimeout(() => {
      onSave();
      setIsSaving(false);
    }, 600);
  };

  return (
    <div className="flex justify-between items-center mb-6">
      <h1 className="text-3xl font-bold">Visiondrill Settings</h1>
      <AdminButton 
        variant="primary"
        icon={<Save className="h-4 w-4" />}
        onClick={handleSave}
        disabled={isSaving}
      >
        {isSaving ? "Saving..." : "Save Settings"}
      </AdminButton>
    </div>
  );
};
