// src/components/founder-matching/ConnectionsList.tsx
import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  MessageCircle,
  Linkedin,
  MapPin,
  Briefcase,
  CheckCircle,
  ExternalLink,
} from "lucide-react";
import { cofounderMatchingService } from "@/services/founder-matching.service";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

export const ConnectionsList: React.FC = () => {
  const [connections, setConnections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadConnections();
  }, []);

  const loadConnections = async () => {
    try {
      setLoading(true);
      const response = await cofounderMatchingService.getMutualMatches();
      setConnections(response.mutual_matches || []);
    } catch (error) {
      toast.error("Failed to load connections");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-muted rounded-full"></div>
                <div className="space-y-2 flex-1">
                  <div className="h-4 bg-muted rounded w-1/4"></div>
                  <div className="h-3 bg-muted rounded w-1/3"></div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (connections.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="mx-auto w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mb-4">
          <CheckCircle className="h-8 w-8 text-green-600" />
        </div>
        <h3 className="text-lg font-semibold mb-2">No connections yet</h3>
        <p className="text-muted-foreground">
          Connect with matches to build your network
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {connections.map((connection) => {
        const profile = connection.matched_profile;
        const displayName = profile.name || profile.current_role || "Co-founder";
        const initials = getInitials(displayName);

        return (
          <Card key={connection.match_id} className="overflow-hidden">
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-4">
                {/* Left: Profile info */}
                <div className="flex items-start gap-4 flex-1">
                  <Avatar className="h-14 w-14 border-2 border-green-100">
                    <AvatarImage src={profile.photo_urls?.[0] || ""} />
                    <AvatarFallback className="bg-green-50 text-green-700 font-semibold">
                      {initials}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-lg">
                        {displayName}
                      </h3>
                      <Badge className="bg-green-100 text-green-800">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Connected
                      </Badge>
                    </div>

                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      {profile.current_role && (
                        <span>{profile.current_role}</span>
                      )}
                      {profile.years_experience !== undefined && profile.years_experience > 0 && (
                        <div className="flex items-center gap-1">
                          <Briefcase className="h-3 w-3" />
                          <span>{profile.years_experience} yrs</span>
                        </div>
                      )}
                      {profile.location_preference && (
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          <span>{profile.location_preference}</span>
                        </div>
                      )}
                    </div>

                    {profile.bio && (
                      <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                        {profile.bio}
                      </p>
                    )}
                  </div>
                </div>

                {/* Right: Action buttons */}
                <div className="flex flex-col gap-2">
                  <Button size="sm" onClick={() => navigate(`/founder/dashboard?tab=messages&match_id=${connection.match_id}`)}>
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Message
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(`/founder/profile/${profile.profile_id}`)}
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View Profile
                  </Button>

                  {profile.linkedin_url && (
                    <Button variant="outline" size="sm">
                      <Linkedin className="h-4 w-4 mr-2" />
                      LinkedIn
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
