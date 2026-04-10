
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Upload, X } from "lucide-react";

interface AppearanceSettingsProps {
  initialAppearance: {
    primaryColor: string;
    secondaryColor: string;
    logoUrl: string;
    faviconUrl: string;
  };
  onAppearanceChange: (appearance: any) => void;
}

export const AppearanceSettings = ({
  initialAppearance,
  onAppearanceChange
}: AppearanceSettingsProps) => {
  const { toast } = useToast();
  const [appearance, setAppearance] = useState(initialAppearance);
  const [uploading, setUploading] = useState(false);

  const handleChange = (key: string, value: string) => {
    const updatedAppearance = { ...appearance, [key]: value };
    setAppearance(updatedAppearance);
    onAppearanceChange(updatedAppearance);
  };

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid File Type",
        description: "Please upload an image file (PNG, JPG, SVG, etc.)",
        variant: "destructive"
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "Please upload an image smaller than 5MB",
        variant: "destructive"
      });
      return;
    }

    setUploading(true);

    try {
      // Convert file to base64 data URL for storage
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        handleChange('logoUrl', dataUrl);
        setUploading(false);
        toast({
          title: "Logo Uploaded Successfully",
          description: "Your new logo has been applied to your site"
        });
      };
      
      reader.onerror = () => {
        setUploading(false);
        toast({
          title: "Upload Failed",
          description: "There was an error processing your image. Please try again.",
          variant: "destructive"
        });
      };

      reader.readAsDataURL(file);

    } catch (error) {
      setUploading(false);
      toast({
        title: "Upload Failed",
        description: "There was an error uploading your logo. Please try again.",
        variant: "destructive"
      });
    }

    // Reset the input value so the same file can be uploaded again if needed
    event.target.value = '';
  };

  const handleLogoRemove = () => {
    handleChange('logoUrl', '');
    toast({
      title: "Logo Removed",
      description: "Your logo has been removed from the site"
    });
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-sm font-medium">Primary Color</label>
          <div className="flex items-center gap-2">
            <Input 
              type="color"
              value={appearance.primaryColor} 
              onChange={(e) => handleChange('primaryColor', e.target.value)}
              className="w-16 h-10" 
            />
            <Input 
              value={appearance.primaryColor} 
              onChange={(e) => handleChange('primaryColor', e.target.value)}
              className="flex-1" 
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Secondary Color</label>
          <div className="flex items-center gap-2">
            <Input 
              type="color"
              value={appearance.secondaryColor} 
              onChange={(e) => handleChange('secondaryColor', e.target.value)}
              className="w-16 h-10" 
            />
            <Input 
              value={appearance.secondaryColor} 
              onChange={(e) => handleChange('secondaryColor', e.target.value)}
              className="flex-1" 
            />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Logo</label>
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <Input 
                value={appearance.logoUrl} 
                onChange={(e) => handleChange('logoUrl', e.target.value)}
                placeholder="Enter logo URL or upload a file"
                className="flex-1"
              />
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    disabled={uploading}
                  />
                  <Button 
                    variant="outline" 
                    disabled={uploading}
                    className="relative"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    {uploading ? "Uploading..." : "Upload"}
                  </Button>
                </div>
                {appearance.logoUrl && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleLogoRemove}
                    className="text-red-600 hover:text-red-700"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
            {appearance.logoUrl && (
              <div className="flex items-center gap-2 p-3 border rounded-lg bg-gray-50">
                <img 
                  src={appearance.logoUrl} 
                  alt="Current logo" 
                  className="h-12 w-auto max-w-32 object-contain border rounded bg-white"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
                <div className="flex-1">
                  <span className="text-sm font-medium text-gray-700">Current logo</span>
                  <p className="text-xs text-gray-500">
                    {appearance.logoUrl.startsWith('data:') ? 'Uploaded file' : 'External URL'}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Favicon URL</label>
          <Input 
            value={appearance.faviconUrl} 
            onChange={(e) => handleChange('faviconUrl', e.target.value)}
            placeholder="Enter favicon URL"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Preview</label>
        <div className="p-4 border rounded-lg bg-gray-50">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded bg-gray-200 flex items-center justify-center text-xs overflow-hidden border">
              {appearance.logoUrl ? (
                <img 
                  src={appearance.logoUrl} 
                  alt="Logo preview" 
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    if (e.currentTarget.parentElement) {
                      e.currentTarget.parentElement.textContent = 'Logo';
                    }
                  }}
                />
              ) : (
                'Logo'
              )}
            </div>
            <div>
              <div className="h-4 w-32 rounded mb-2" style={{backgroundColor: appearance.primaryColor}}></div>
              <div className="h-4 w-24 rounded" style={{backgroundColor: appearance.secondaryColor}}></div>
            </div>
          </div>
        </div>
      </div>

      <Button 
        onClick={() => {
          toast({
            title: "Theme Updated",
            description: "The appearance settings have been applied successfully"
          });
        }}
      >
        Apply Theme Changes
      </Button>
    </div>
  );
};
