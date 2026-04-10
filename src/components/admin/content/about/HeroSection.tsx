
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Pencil, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { HeroContent } from "@/types/about-content";

interface HeroSectionProps {
  heroContent: HeroContent;
  setHeroContent: (content: HeroContent) => void;
}

export const HeroSection = ({ heroContent, setHeroContent }: HeroSectionProps) => {
  const { toast } = useToast();
  const [editingSection, setEditingSection] = useState<string | null>(null);

  const handleSave = (section: string) => {
    toast({
      title: "Success",
      description: `${section} updated successfully`,
    });
    setEditingSection(null);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Hero Section</CardTitle>
          <p className="text-sm text-muted-foreground">Main hero content at the top of the page</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setEditingSection(editingSection === "hero" ? null : "hero")}
        >
          <Pencil className="h-4 w-4 mr-2" />
          {editingSection === "hero" ? "Cancel" : "Edit"}
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {editingSection === "hero" ? (
          <div className="space-y-4">
            <div>
              <Label htmlFor="hero-badge">Badge Text</Label>
              <Input
                id="hero-badge"
                value={heroContent.badgeText}
                onChange={(e) => setHeroContent({...heroContent, badgeText: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="hero-title">Title</Label>
              <Input
                id="hero-title"
                value={heroContent.title}
                onChange={(e) => setHeroContent({...heroContent, title: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="hero-subtitle">Subtitle</Label>
              <Textarea
                id="hero-subtitle"
                value={heroContent.subtitle}
                onChange={(e) => setHeroContent({...heroContent, subtitle: e.target.value})}
                rows={3}
              />
            </div>
            <Button onClick={() => handleSave("Hero Section")}>
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            <div>
              <Badge variant="secondary">{heroContent.badgeText}</Badge>
            </div>
            <h3 className="text-xl font-semibold">{heroContent.title}</h3>
            <p className="text-muted-foreground">{heroContent.subtitle}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
