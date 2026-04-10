import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Video, Calendar, Clock, User, Phone, Users } from "lucide-react";
import { FreelancerProfile } from "@/types/freelancer";
import { useFreelancerInterviews } from "@/hooks/use-freelancer-interviews";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "@/components/ui/sonner";

interface VideoCallDialogProps {
  freelancer: FreelancerProfile;
  selectedTier?: string;
}

export const VideoCallDialog = ({ freelancer, selectedTier }: VideoCallDialogProps) => {
  const { user } = useAuth();
  const { scheduleInterview } = useFreelancerInterviews();
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    date: "",
    time: "",
    duration: "60 minutes",
    type: "Video" as "Video" | "Phone" | "In-person",
    notes: "",
  });

  const handleScheduleInterview = () => {
    if (!formData.date || !formData.time) {
      toast.error("Please select both date and time for the interview.");
      return;
    }

    if (!user) {
      toast.error("Please log in to schedule an interview.");
      return;
    }

    scheduleInterview({
      freelancerId: freelancer.id,
      freelancerName: freelancer.name,
      clientId: user.id,
      clientName: user.name,
      scheduledDate: formData.date,
      scheduledTime: formData.time,
      duration: formData.duration,
      type: formData.type,
      tier: selectedTier,
      notes: formData.notes,
    });

    setIsOpen(false);
    setFormData({
      date: "",
      time: "",
      duration: "60 minutes",
      type: "Video",
      notes: "",
    });
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "Video":
        return <Video className="h-4 w-4" />;
      case "Phone":
        return <Phone className="h-4 w-4" />;
      case "In-person":
        return <Users className="h-4 w-4" />;
      default:
        return <Video className="h-4 w-4" />;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Video className="h-4 w-4" />
          Schedule Interview
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Video className="h-5 w-5" />
            Schedule Interview with {freelancer.name}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Freelancer Info */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Interview Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{freelancer.name}</span>
                <span className="text-muted-foreground">- {freelancer.title}</span>
              </div>
              {selectedTier && (
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="capitalize">
                    {selectedTier} Package
                  </Badge>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Schedule Form */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="interview-date" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Interview Date
              </Label>
              <Input
                id="interview-date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="interview-time" className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Interview Time
              </Label>
              <Input
                id="interview-time"
                type="time"
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Interview Type</Label>
              <Select
                value={formData.type}
                onValueChange={(value: "Video" | "Phone" | "In-person") =>
                  setFormData({ ...formData, type: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Video">
                    <div className="flex items-center gap-2">
                      <Video className="h-4 w-4" />
                      Video Call
                    </div>
                  </SelectItem>
                  <SelectItem value="Phone">
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      Phone Call
                    </div>
                  </SelectItem>
                  <SelectItem value="In-person">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      In Person
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Duration</Label>
              <Select
                value={formData.duration}
                onValueChange={(value) => setFormData({ ...formData, duration: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="30 minutes">30 minutes</SelectItem>
                  <SelectItem value="45 minutes">45 minutes</SelectItem>
                  <SelectItem value="60 minutes">60 minutes</SelectItem>
                  <SelectItem value="90 minutes">90 minutes</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="interview-notes">Notes (Optional)</Label>
            <Textarea
              id="interview-notes"
              placeholder="Any specific requirements or topics to discuss..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
            />
          </div>

          {formData.type === "Video" && (
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
              <p className="text-sm text-blue-700 dark:text-blue-300">
                📹 A video meeting link will be automatically generated and shared with both parties once the interview is scheduled.
              </p>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <Button onClick={handleScheduleInterview} className="flex-1">
              <div className="flex items-center gap-2">
                {getTypeIcon(formData.type)}
                Schedule Interview
              </div>
            </Button>
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};