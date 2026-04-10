
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Pencil, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { StoryContent } from "@/types/about-content";

interface StorySectionProps {
  storyContent: StoryContent;
  setStoryContent: (content: StoryContent) => void;
  achievements: string[];
}

export const StorySection = ({ storyContent, setStoryContent, achievements }: StorySectionProps) => {
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
          <CardTitle>Story Section</CardTitle>
          <p className="text-sm text-muted-foreground">Company history and background</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setEditingSection(editingSection === "story" ? null : "story")}
        >
          <Pencil className="h-4 w-4 mr-2" />
          {editingSection === "story" ? "Cancel" : "Edit"}
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {editingSection === "story" ? (
          <div className="space-y-4">
            <div>
              <Label htmlFor="story-badge">Badge Text</Label>
              <Input
                id="story-badge"
                value={storyContent.badgeText}
                onChange={(e) => setStoryContent({...storyContent, badgeText: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="story-title">Title</Label>
              <Input
                id="story-title"
                value={storyContent.title}
                onChange={(e) => setStoryContent({...storyContent, title: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="story-content">Content</Label>
              <Textarea
                id="story-content"
                value={storyContent.content}
                onChange={(e) => setStoryContent({...storyContent, content: e.target.value})}
                rows={4}
              />
            </div>
            <Button onClick={() => handleSave("Story Section")}>
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            <Badge variant="secondary">{storyContent.badgeText}</Badge>
            <h3 className="text-xl font-semibold">{storyContent.title}</h3>
            <p className="text-muted-foreground">{storyContent.content}</p>
            <div className="mt-4">
              <h4 className="font-medium mb-2">Achievements:</h4>
              <ul className="space-y-1">
                {achievements.map((achievement, index) => (
                  <li key={index} className="text-sm text-muted-foreground flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                    {achievement}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
