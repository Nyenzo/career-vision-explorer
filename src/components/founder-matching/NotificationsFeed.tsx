// src/components/cofounder-matching/NotificationsFeed.tsx
import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Heart, X, CheckCircle, Clock, MessageCircle } from "lucide-react";
import { cofounderMatchingService, MatchProfile } from "@/services/founder-matching.service";
import { toast } from "sonner";

export const NotificationsFeed: React.FC = () => {
  const [pendingMatches, setPendingMatches] = useState<MatchProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPendingInterests();
  }, []);

  const loadPendingInterests = async () => {
    try {
      setLoading(true);
      const response = await cofounderMatchingService.getPendingInterests();
      setPendingMatches(response.pending_matches || []);
    } catch (error) {
      console.error("Failed to load pending interests:", error);
      setPendingMatches([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (matchId: string) => {
    try {
      const response = await cofounderMatchingService.swipeRight(matchId);
      if (response.is_mutual) {
        toast.success("🎉 New connection!", {
          description: "You can now message each other",
        });
      } else {
        toast.success("Interest sent!");
      }
      // Remove from pending list
      setPendingMatches(
        pendingMatches.filter((match) => match.match_id !== matchId)
      );
    } catch (error) {
      toast.error("Failed to accept interest");
    }
  };

  const handleDecline = async (matchId: string) => {
    try {
      await cofounderMatchingService.swipeLeft(matchId);
      toast.info("Interest declined");
      // Remove from pending list
      setPendingMatches(
        pendingMatches.filter((match) => match.match_id !== matchId)
      );
    } catch (error) {
      toast.error("Failed to decline interest");
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
        {[1, 2].map((i) => (
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

  if (pendingMatches.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="mx-auto w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4">
          <CheckCircle className="h-8 w-8 text-blue-500" />
        </div>
        <h3 className="text-lg font-semibold mb-2">No pending interests</h3>
        <p className="text-muted-foreground">
          When someone shows interest in you, it will appear here
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-semibold">Pending Interests</h3>
        <Badge variant="outline" className="bg-blue-50">
          {pendingMatches.length} new
        </Badge>
      </div>

      {pendingMatches.map((match) => {
        const profile = match.matched_profile;
        const displayName = profile.name || profile.current_role;
        const initials = getInitials(displayName);

        return (
          <Card key={match.match_id} className="border-2 border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-4">
                {/* Left: Profile info */}
                <div className="flex items-start gap-4 flex-1">
                  <div className="relative">
                    <Avatar className="h-16 w-16 border-2 border-blue-100">
                      <AvatarImage src={profile.photo_urls?.[0] || ""} />
                      <AvatarFallback className="bg-blue-50 text-blue-700">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute -top-2 -right-2">
                      <Badge className="bg-pink-500">
                        <Heart className="h-3 w-3 mr-1" />
                        Interested
                      </Badge>
                    </div>
                  </div>

                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">
                      {displayName}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {profile.current_role} • {profile.years_experience} years
                    </p>
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                      {profile.bio}
                    </p>
                    <div className="mt-2">
                      <Badge variant="outline">
                        {Math.round(match.overall_score * 100)}% match
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Right: Action buttons */}
                <div className="flex flex-col gap-2">
                  <Button
                    size="sm"
                    className="bg-gradient-to-r from-green-500 to-emerald-500"
                    onClick={() => handleAccept(match.match_id)}
                  >
                    <Heart className="h-4 w-4 mr-2" />
                    Accept
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    className="border-red-300 text-red-600 hover:bg-red-50"
                    onClick={() => handleDecline(match.match_id)}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Decline
                  </Button>
                </div>
              </div>

              {/* Message from algorithm */}
              <div className="mt-3 pt-3 border-t text-sm text-muted-foreground">
                <div className="flex items-start gap-2">
                  <Clock className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <span>
                    Showed interest in your profile based on algorithm matching
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
