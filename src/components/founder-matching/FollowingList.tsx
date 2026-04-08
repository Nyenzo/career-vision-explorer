// src/components/founder-matching/FollowingList.tsx
import React, { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { MapPin, Briefcase, UserMinus } from "lucide-react";
import {
  cofounderMatchingService,
  CofounderProfile,
} from "@/services/founder-matching.service";
import { toast } from "sonner";

export const FollowingList: React.FC = () => {
  const [profiles, setProfiles] = useState<CofounderProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFollowing();
  }, []);

  const loadFollowing = async () => {
    try {
      setLoading(true);
      const data = await cofounderMatchingService.getFollowing();
      setProfiles(data || []);
    } catch (error) {
      toast.error("Failed to load following list");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleUnfollow = async (profileId: string) => {
    try {
      await cofounderMatchingService.unfollowProfile(profileId);
      setProfiles((prev) => prev.filter((p) => p.profile_id !== profileId));
      toast.success("Unfollowed");
    } catch (error) {
      toast.error("Failed to unfollow");
    }
  };

  const getInitials = (name?: string, fallback?: string) => {
    const source = name || fallback || "";
    if (!source) return "";
    return source
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
                <div className="w-12 h-12 bg-muted rounded-full" />
                <div className="space-y-2 flex-1">
                  <div className="h-4 bg-muted rounded w-1/4" />
                  <div className="h-3 bg-muted rounded w-1/3" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (profiles.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="mx-auto w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4">
          <UserMinus className="h-8 w-8 text-blue-600" />
        </div>
        <h3 className="text-lg font-semibold mb-2">Not following anyone yet</h3>
        <p className="text-muted-foreground">
          Follow interesting founders to see them here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {profiles.map((profile) => {
        const initials = getInitials(profile.name, profile.current_role);
        return (
          <Card key={profile.profile_id} className="overflow-hidden">
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4 flex-1">
                  <Avatar className="h-14 w-14 border">
                    <AvatarImage src="" />
                    <AvatarFallback className="bg-blue-50 text-blue-700 font-semibold">
                      {initials}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-lg leading-tight">
                      {profile.name || profile.current_role}
                    </h3>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                      <div className="flex items-center gap-1">
                        <Briefcase className="h-3 w-3" />
                        <span>{profile.years_experience} yrs</span>
                      </div>
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

                    <div className="flex flex-wrap gap-1 mt-3">
                      {(profile.technical_skills || []).slice(0, 4).map((skill) => (
                        <Badge key={skill} variant="outline" className="text-xs px-2 py-0">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="whitespace-nowrap"
                    onClick={() => handleUnfollow(profile.profile_id!)}
                  >
                    <UserMinus className="h-4 w-4 mr-2" />
                    Unfollow
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default FollowingList;
