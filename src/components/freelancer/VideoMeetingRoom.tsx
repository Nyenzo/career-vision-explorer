import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Video, 
  VideoOff, 
  Mic, 
  MicOff, 
  Phone, 
  Monitor, 
  Settings,
  Users,
  MessageSquare,
  Clock
} from "lucide-react";
import { useFreelancerInterviews } from "@/hooks/use-freelancer-interviews";
import { FreelancerInterview } from "@/types/freelancer";

interface VideoMeetingRoomProps {
  interviewId: string;
  isAdmin?: boolean;
}

export const VideoMeetingRoom = ({ interviewId, isAdmin = false }: VideoMeetingRoomProps) => {
  const { getAllInterviews, updateInterviewStatus } = useFreelancerInterviews();
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isAudioOn, setIsAudioOn] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [meetingDuration, setMeetingDuration] = useState(0);
  const [isCallActive, setIsCallActive] = useState(false);

  const interview = getAllInterviews().find(i => i.id === interviewId);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isCallActive) {
      interval = setInterval(() => {
        setMeetingDuration(prev => prev + 1);
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isCallActive]);

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStartCall = () => {
    setIsCallActive(true);
    updateInterviewStatus(interviewId, "In Progress");
  };

  const handleEndCall = () => {
    setIsCallActive(false);
    setMeetingDuration(0);
    updateInterviewStatus(interviewId, "Completed");
  };

  if (!interview) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-muted-foreground">Interview not found</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Meeting Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Video className="h-5 w-5" />
                Interview: {interview.freelancerName} & {interview.clientName}
              </CardTitle>
              <p className="text-muted-foreground mt-1">
                {interview.tier && (
                  <Badge variant="secondary" className="mr-2 capitalize">
                    {interview.tier} Package
                  </Badge>
                )}
                Scheduled for {new Date(`${interview.scheduledDate} ${interview.scheduledTime}`).toLocaleString()}
              </p>
            </div>
            <div className="text-right">
              <Badge className={
                interview.status === "In Progress" 
                  ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300"
                  : "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300"
              }>
                {interview.status}
              </Badge>
              {isCallActive && (
                <div className="flex items-center gap-1 mt-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  {formatDuration(meetingDuration)}
                </div>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Video Area */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Video Area */}
        <div className="lg:col-span-3">
          <Card className="h-96 relative overflow-hidden">
            <CardContent className="p-0 h-full">
              <div className="w-full h-full bg-gray-900 flex items-center justify-center relative">
                <div className="text-center text-white">
                  <Video className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg">Video Meeting Room</p>
                  <p className="text-sm opacity-75">
                    {isCallActive ? "Call in progress..." : "Waiting to start call..."}
                  </p>
                </div>
                
                {/* Simulated Participant Videos */}
                {isCallActive && (
                  <>
                    <div className="absolute top-4 right-4 w-32 h-24 bg-gray-800 rounded-lg border border-white/20 flex items-center justify-center">
                      <span className="text-white text-xs">{interview.freelancerName}</span>
                    </div>
                    <div className="absolute top-4 right-40 w-32 h-24 bg-gray-800 rounded-lg border border-white/20 flex items-center justify-center">
                      <span className="text-white text-xs">{interview.clientName}</span>
                    </div>
                    {isAdmin && (
                      <div className="absolute top-4 left-4 bg-red-500/90 text-white px-2 py-1 rounded text-xs">
                        👁️ Admin Monitoring
                      </div>
                    )}
                  </>
                )}
              </div>
            </CardContent>
          </Card>
          
          {/* Controls */}
          <div className="flex justify-center gap-4 mt-4">
            <Button
              variant={isVideoOn ? "default" : "destructive"}
              size="lg"
              onClick={() => setIsVideoOn(!isVideoOn)}
              className="rounded-full h-12 w-12"
            >
              {isVideoOn ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
            </Button>
            
            <Button
              variant={isAudioOn ? "default" : "destructive"}
              size="lg"
              onClick={() => setIsAudioOn(!isAudioOn)}
              className="rounded-full h-12 w-12"
            >
              {isAudioOn ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
            </Button>
            
            <Button
              variant={isScreenSharing ? "default" : "outline"}
              size="lg"
              onClick={() => setIsScreenSharing(!isScreenSharing)}
              className="rounded-full h-12 w-12"
            >
              <Monitor className="h-5 w-5" />
            </Button>
            
            {!isCallActive ? (
              <Button
                size="lg"
                onClick={handleStartCall}
                className="rounded-full h-12 px-6 bg-green-600 hover:bg-green-700"
              >
                <Video className="h-5 w-5 mr-2" />
                Start Call
              </Button>
            ) : (
              <Button
                size="lg"
                onClick={handleEndCall}
                className="rounded-full h-12 px-6 bg-red-600 hover:bg-red-700"
              >
                <Phone className="h-5 w-5 mr-2" />
                End Call
              </Button>
            )}
            
            <Button
              variant="outline"
              size="lg"
              className="rounded-full h-12 w-12"
            >
              <Settings className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Participants */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Users className="h-4 w-4" />
                Participants ({isCallActive ? "2" : "0"}/2)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center gap-2 p-2 rounded bg-muted">
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs">
                  {interview.freelancerName.charAt(0)}
                </div>
                <span className="text-sm">{interview.freelancerName}</span>
                {isCallActive && <div className="w-2 h-2 bg-green-500 rounded-full"></div>}
              </div>
              <div className="flex items-center gap-2 p-2 rounded bg-muted">
                <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-secondary-foreground text-xs">
                  {interview.clientName.charAt(0)}
                </div>
                <span className="text-sm">{interview.clientName}</span>
                {isCallActive && <div className="w-2 h-2 bg-green-500 rounded-full"></div>}
              </div>
            </CardContent>
          </Card>

          {/* Chat */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Chat
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-32 border rounded p-2 text-xs text-muted-foreground flex items-center justify-center">
                Chat feature coming soon...
              </div>
            </CardContent>
          </Card>

          {/* Interview Notes */}
          {interview.notes && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Interview Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{interview.notes}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};