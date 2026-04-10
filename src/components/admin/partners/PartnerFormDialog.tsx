
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload } from "lucide-react";
import { Partner } from "@/hooks/use-partners";

interface PartnerFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Omit<Partner, "id" | "createdAt" | "status">) => void;
  editingPartner: Partner | null;
  isLoading: boolean;
}

export const PartnerFormDialog = ({ 
  isOpen, 
  onClose, 
  onSave, 
  editingPartner, 
  isLoading 
}: PartnerFormDialogProps) => {
  const [logoUploadMethod, setLogoUploadMethod] = useState<"url" | "upload">("url");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    name: editingPartner?.name || "",
    logo: editingPartner?.logo || "",
    website: editingPartner?.website || "",
    category: (editingPartner?.category || "employer") as Partner["category"],
    description: editingPartner?.description || ""
  });

  React.useEffect(() => {
    if (editingPartner) {
      setFormData({
        name: editingPartner.name,
        logo: editingPartner.logo,
        website: editingPartner.website,
        category: editingPartner.category,
        description: editingPartner.description || ""
      });
    } else {
      setFormData({ name: "", logo: "", website: "", category: "employer", description: "" });
    }
    setLogoUploadMethod("url");
    setUploadedFile(null);
  }, [editingPartner, isOpen]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      const tempUrl = URL.createObjectURL(file);
      setFormData(prev => ({ ...prev, logo: tempUrl }));
    }
  };

  const handleSave = () => {
    if (!formData.name || !formData.logo || !formData.website) {
      return;
    }
    onSave(formData);
  };

  const handleClose = () => {
    setFormData({ name: "", logo: "", website: "", category: "employer", description: "" });
    setUploadedFile(null);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editingPartner ? "Edit Partner" : "Add New Partner"}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="name">Partner Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Enter partner name"
            />
          </div>
          
          <div>
            <Label>Logo *</Label>
            <Tabs value={logoUploadMethod} onValueChange={(value) => setLogoUploadMethod(value as "url" | "upload")}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="url">URL</TabsTrigger>
                <TabsTrigger value="upload">Upload</TabsTrigger>
              </TabsList>
              <TabsContent value="url" className="space-y-2">
                <Input
                  value={formData.logo}
                  onChange={(e) => setFormData(prev => ({ ...prev, logo: e.target.value }))}
                  placeholder="Enter logo URL"
                />
              </TabsContent>
              <TabsContent value="upload" className="space-y-2">
                <div className="flex items-center gap-2">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="logo-upload"
                  />
                  <Label htmlFor="logo-upload" className="flex-1">
                    <div className="flex items-center justify-center gap-2 p-2 border-2 border-dashed border-gray-300 rounded-md cursor-pointer hover:border-gray-400 transition-colors">
                      <Upload className="h-4 w-4" />
                      <span className="text-sm">{uploadedFile ? uploadedFile.name : "Choose file"}</span>
                    </div>
                  </Label>
                </div>
                {uploadedFile && (
                  <p className="text-xs text-muted-foreground">
                    Note: File upload is simulated. In production, this would upload to your storage service.
                  </p>
                )}
              </TabsContent>
            </Tabs>
          </div>

          <div>
            <Label htmlFor="website">Website URL *</Label>
            <Input
              id="website"
              value={formData.website}
              onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
              placeholder="https://partner-website.com"
            />
          </div>
          <div>
            <Label htmlFor="category">Category *</Label>
            <Select value={formData.category} onValueChange={(value: Partner["category"]) => setFormData(prev => ({ ...prev, category: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="employer">Employer</SelectItem>
                <SelectItem value="education">Educational Institution</SelectItem>
                <SelectItem value="recruiting">Recruiting Agency</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Brief description of the partner"
              rows={3}
            />
          </div>
          {formData.logo && (
            <div className="flex justify-center">
              <img 
                src={formData.logo} 
                alt="Preview"
                className="h-20 w-20 object-contain rounded-full shadow-md"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=100&h=100&fit=crop&crop=center";
                }}
              />
            </div>
          )}
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleClose} className="flex-1" disabled={isLoading}>
              Cancel
            </Button>
            <Button onClick={handleSave} className="flex-1" disabled={isLoading || !formData.name || !formData.logo || !formData.website}>
              {isLoading ? "Saving..." : editingPartner ? "Update" : "Add"} Partner
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
