
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Edit, Save, X } from "lucide-react";

export const FooterContentManagement = () => {
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [footerData, setFooterData] = useState({
    companyName: "Visiondrill",
    description: "Navigate your career journey with confidence and clarity. Discover opportunities that align with your skills and aspirations.",
    contactEmail: "support@visiondrill.com",
    contactPhone: "+254 700 000 000",
    address: "Nairobi, Kenya",
    copyright: "© 2025 Visiondrill Career Explorer. All rights reserved.",
    socialLinks: {
      facebook: "#",
      instagram: "#",
      twitter: "#",
      linkedin: "#"
    }
  });

  const handleSave = () => {
    // In a real app, this would save to the database
    console.log("Saving footer data:", footerData);
    toast({
      title: "Footer Updated",
      description: "Footer content has been successfully updated",
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Footer Content Management</CardTitle>
            <CardDescription>
              Manage footer text, links, and contact information
            </CardDescription>
          </div>
          {!isEditing && (
            <Button onClick={() => setIsEditing(true)} size="sm">
              <Edit className="h-4 w-4 mr-2" />
              Edit Footer
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {isEditing ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="companyName">Company Name</Label>
                <Input
                  id="companyName"
                  value={footerData.companyName}
                  onChange={(e) => setFooterData({...footerData, companyName: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="contactEmail">Contact Email</Label>
                <Input
                  id="contactEmail"
                  type="email"
                  value={footerData.contactEmail}
                  onChange={(e) => setFooterData({...footerData, contactEmail: e.target.value})}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="description">Company Description</Label>
              <Textarea
                id="description"
                value={footerData.description}
                onChange={(e) => setFooterData({...footerData, description: e.target.value})}
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="contactPhone">Contact Phone</Label>
                <Input
                  id="contactPhone"
                  value={footerData.contactPhone}
                  onChange={(e) => setFooterData({...footerData, contactPhone: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  value={footerData.address}
                  onChange={(e) => setFooterData({...footerData, address: e.target.value})}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="copyright">Copyright Text</Label>
              <Input
                id="copyright"
                value={footerData.copyright}
                onChange={(e) => setFooterData({...footerData, copyright: e.target.value})}
              />
            </div>

            <div>
              <Label className="text-sm font-medium">Social Media Links</Label>
              <div className="grid grid-cols-2 gap-4 mt-2">
                <div>
                  <Label htmlFor="facebook" className="text-xs">Facebook URL</Label>
                  <Input
                    id="facebook"
                    value={footerData.socialLinks.facebook}
                    onChange={(e) => setFooterData({
                      ...footerData, 
                      socialLinks: {...footerData.socialLinks, facebook: e.target.value}
                    })}
                  />
                </div>
                <div>
                  <Label htmlFor="instagram" className="text-xs">Instagram URL</Label>
                  <Input
                    id="instagram"
                    value={footerData.socialLinks.instagram}
                    onChange={(e) => setFooterData({
                      ...footerData, 
                      socialLinks: {...footerData.socialLinks, instagram: e.target.value}
                    })}
                  />
                </div>
                <div>
                  <Label htmlFor="twitter" className="text-xs">Twitter URL</Label>
                  <Input
                    id="twitter"
                    value={footerData.socialLinks.twitter}
                    onChange={(e) => setFooterData({
                      ...footerData, 
                      socialLinks: {...footerData.socialLinks, twitter: e.target.value}
                    })}
                  />
                </div>
                <div>
                  <Label htmlFor="linkedin" className="text-xs">LinkedIn URL</Label>
                  <Input
                    id="linkedin"
                    value={footerData.socialLinks.linkedin}
                    onChange={(e) => setFooterData({
                      ...footerData, 
                      socialLinks: {...footerData.socialLinks, linkedin: e.target.value}
                    })}
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              <Button onClick={handleSave}>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
              <Button variant="outline" onClick={handleCancel}>
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
            </div>
          </>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium">Company Name</Label>
                <p className="text-sm text-muted-foreground mt-1">{footerData.companyName}</p>
              </div>
              <div>
                <Label className="text-sm font-medium">Contact Email</Label>
                <p className="text-sm text-muted-foreground mt-1">{footerData.contactEmail}</p>
              </div>
            </div>

            <div>
              <Label className="text-sm font-medium">Description</Label>
              <p className="text-sm text-muted-foreground mt-1">{footerData.description}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium">Contact Phone</Label>
                <p className="text-sm text-muted-foreground mt-1">{footerData.contactPhone}</p>
              </div>
              <div>
                <Label className="text-sm font-medium">Address</Label>
                <p className="text-sm text-muted-foreground mt-1">{footerData.address}</p>
              </div>
            </div>

            <div>
              <Label className="text-sm font-medium">Copyright</Label>
              <p className="text-sm text-muted-foreground mt-1">{footerData.copyright}</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
