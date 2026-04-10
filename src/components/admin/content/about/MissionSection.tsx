
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Pencil, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { MissionContent } from "@/types/about-content";

interface MissionSectionProps {
  missionContent: MissionContent;
  setMissionContent: (content: MissionContent) => void;
}

export const MissionSection = ({ missionContent, setMissionContent }: MissionSectionProps) => {
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
          <CardTitle>Mission Section</CardTitle>
          <p className="text-sm text-muted-foreground">Company mission and values</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setEditingSection(editingSection === "mission" ? null : "mission")}
        >
          <Pencil className="h-4 w-4 mr-2" />
          {editingSection === "mission" ? "Cancel" : "Edit"}
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {editingSection === "mission" ? (
          <div className="space-y-4">
            <div>
              <Label htmlFor="mission-badge">Badge Text</Label>
              <Input
                id="mission-badge"
                value={missionContent.badgeText}
                onChange={(e) => setMissionContent({...missionContent, badgeText: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="mission-title">Title</Label>
              <Input
                id="mission-title"
                value={missionContent.title}
                onChange={(e) => setMissionContent({...missionContent, title: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="mission-content">Content</Label>
              <Textarea
                id="mission-content"
                value={missionContent.content}
                onChange={(e) => setMissionContent({...missionContent, content: e.target.value})}
                rows={4}
              />
            </div>
            <Button onClick={() => handleSave("Mission Section")}>
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            <Badge variant="secondary">{missionContent.badgeText}</Badge>
            <h3 className="text-xl font-semibold">{missionContent.title}</h3>
            <p className="text-muted-foreground">{missionContent.content}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
