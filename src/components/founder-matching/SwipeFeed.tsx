// src/components/cofounder-matching/SwipeFeed.tsx
import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Heart,
  X,
  MapPin,
  Briefcase,
  Award,
  ChevronLeft,
  ChevronRight,
  MessageCircle,
  Camera,
  CheckCircle,
} from "lucide-react";
import {
  cofounderMatchingService,
  MatchProfile,
} from "@/services/founder-matching.service";
import { toast } from "sonner";
import { useSpring, animated } from "@react-spring/web";

export const SwipeFeed: React.FC = () => {
  const [matches, setMatches] = useState<MatchProfile[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [swipeDirection, setSwipeDirection] = useState<"left" | "right" | null>(
    null
  );
  const cardRef = useRef<HTMLDivElement>(null);

  const [springProps, api] = useSpring(() => ({
    x: 0,
    y: 0,
    rotate: 0,
    config: { tension: 300, friction: 30 },
  }));

  useEffect(() => {
    loadMatches();
  }, []);

  const loadMatches = async () => {
    try {
      setLoading(true);
      // Load algorithm-suggested matches
      const response = await cofounderMatchingService.discoverMatches({
        limit: 10,
        min_score: 0.6,
      });
      setMatches(response.matches);
      setCurrentIndex(0);
    } catch (error) {
      toast.error("Failed to load matches");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSwipeRight = async () => {
    if (currentIndex >= matches.length) return;

    const match = matches[currentIndex];
    try {
      const response = await cofounderMatchingService.swipeRight(
        match.match_id
      );

      // Animate swipe
      setSwipeDirection("right");
      api.start({
        x: 500,
        rotate: 20,
        onRest: () => {
          if (response.is_mutual) {
            toast.success("🎉 It's a match!", {
              description: "You can now message each other",
            });
          } else {
            toast.success("Interest sent!", {
              description: "They'll be notified of your interest",
            });
          }
          nextCard();
          setSwipeDirection(null);
        },
      });
    } catch (error) {
      toast.error("Failed to send interest");
    }
  };

  const handleSwipeLeft = async () => {
    if (currentIndex >= matches.length) return;

    const match = matches[currentIndex];
    try {
      await cofounderMatchingService.swipeLeft(match.match_id);

      // Animate swipe
      setSwipeDirection("left");
      api.start({
        x: -500,
        rotate: -20,
        onRest: () => {
          toast.info("Passed");
          nextCard();
          setSwipeDirection(null);
        },
      });
    } catch (error) {
      toast.error("Failed to pass");
    }
  };

  const nextCard = () => {
    if (currentIndex < matches.length - 1) {
      setCurrentIndex(currentIndex + 1);
      api.start({ x: 0, y: 0, rotate: 0 });
    } else {
      // Load more when we reach the end
      loadMatches();
    }
  };

  const prevCard = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      api.start({ x: 0, y: 0, rotate: 0 });
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
      <div className="flex flex-col items-center justify-center min-h-[600px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4" />
        <p className="text-muted-foreground">
          Finding potential co-founders...
        </p>
      </div>
    );
  }

  if (matches.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="mx-auto w-24 h-24 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mb-4">
          <Heart className="h-12 w-12 text-primary" />
        </div>
        <h3 className="text-xl font-semibold mb-2">No more matches</h3>
        <p className="text-muted-foreground mb-6 max-w-md mx-auto">
          Check back later for more algorithm-suggested co-founders
        </p>
        <Button onClick={loadMatches}>Find More Matches</Button>
      </div>
    );
  }

  const currentMatch = matches[currentIndex];
  const profile = currentMatch.matched_profile;
  const initials = getInitials(profile.current_role);
  const hasPhotos = profile.photos && profile.photos.length > 0;

  return (
    <div className="max-w-md mx-auto">
      {/* Match counter */}
      <div className="text-center mb-4">
        <p className="text-sm text-muted-foreground">
          {currentIndex + 1} of {matches.length} matches
        </p>
      </div>

      {/* Tinder-style card with swipe animation */}
      <div className="relative h-[600px]">
        <animated.div
          ref={cardRef}
          style={{
            ...springProps,
            position: "absolute",
            width: "100%",
            height: "100%",
          }}
        >
          <Card className="h-full overflow-hidden shadow-xl border-0 relative">
            {/* Photo carousel */}
            <div className="h-3/5 bg-gradient-to-br from-blue-50 to-purple-50 relative overflow-hidden">
              {hasPhotos ? (
                <div className="absolute inset-0">
                  <img
                    src={profile.photos![0]}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                  {/* Photo count badge */}
                  {profile.photos!.length > 1 && (
                    <div className="absolute bottom-4 right-4 bg-black/60 text-white px-3 py-1 rounded-full text-sm">
                      <Camera className="h-4 w-4 inline mr-1" />
                      {profile.photos!.length}
                    </div>
                  )}
                </div>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Avatar className="h-48 w-48 border-8 border-white shadow-2xl">
                    <AvatarImage src="" />
                    <AvatarFallback className="text-5xl font-bold bg-gradient-to-br from-blue-100 to-purple-100">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                </div>
              )}

              {/* Match score badge */}
              <div className="absolute top-4 right-4">
                <Badge className="bg-white/90 backdrop-blur-sm text-black font-bold px-3 py-1 shadow-lg">
                  {Math.round(currentMatch.overall_score * 100)}% match
                </Badge>
              </div>

              {/* Swipe hints */}
              {swipeDirection === null && (
                <>
                  <div className="absolute top-4 left-4 border-2 border-green-500 text-green-500 rounded-lg px-3 py-1 font-bold opacity-50">
                    LIKE
                  </div>
                  <div className="absolute top-4 left-20 border-2 border-red-500 text-red-500 rounded-lg px-3 py-1 font-bold opacity-50">
                    PASS
                  </div>
                </>
              )}
            </div>

            {/* Profile info (bottom half) */}
            <CardContent className="p-6 h-2/5 overflow-y-auto">
              {/* Name/Title and basic info */}
              <div className="mb-4">
                <h2 className="text-2xl font-bold mb-1">
                  {profile.current_role}
                </h2>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Briefcase className="h-4 w-4" />
                    {profile.years_experience} years experience
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {profile.location_preference}
                  </div>
                </div>
              </div>

              {/* Short bio */}
              <p className="text-muted-foreground mb-4 line-clamp-2">
                {profile.bio}
              </p>

              {/* Skills & Seeking */}
              <div className="space-y-3">
                <div>
                  <h3 className="text-sm font-semibold mb-1 text-muted-foreground">
                    Skills
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {profile.technical_skills.slice(0, 4).map((skill) => (
                      <Badge key={skill} variant="outline" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-semibold mb-1 text-muted-foreground">
                    Looking for
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {profile.seeking_roles.map((role) => (
                      <Badge
                        key={role}
                        className="bg-green-50 text-green-700 border-green-200"
                      >
                        {role}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </animated.div>

        {/* Swipe overlay indicators */}
        {swipeDirection === "right" && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-green-500 text-6xl font-bold border-8 border-green-500 rounded-2xl p-8 rotate-12 bg-white/90">
              LIKE
            </div>
          </div>
        )}

        {swipeDirection === "left" && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-red-500 text-6xl font-bold border-8 border-red-500 rounded-2xl p-8 -rotate-12 bg-white/90">
              PASS
            </div>
          </div>
        )}
      </div>

      {/* Action buttons - Tinder style at bottom */}
      <div className="flex justify-center gap-8 mt-8">
        <Button
          size="lg"
          variant="outline"
          className="h-16 w-16 rounded-full border-4 border-red-300 hover:bg-red-50 shadow-lg"
          onClick={handleSwipeLeft}
        >
          <X className="h-8 w-8 text-red-500" />
        </Button>

        <Button
          size="lg"
          variant="outline"
          className="h-16 w-16 rounded-full border-4 border-blue-300 hover:bg-blue-50 shadow-lg"
          onClick={prevCard}
          disabled={currentIndex === 0}
        >
          <ChevronLeft className="h-8 w-8 text-blue-500" />
        </Button>

        <Button
          size="lg"
          variant="outline"
          className="h-16 w-16 rounded-full border-4 border-blue-300 hover:bg-blue-50 shadow-lg"
          onClick={nextCard}
          disabled={currentIndex === matches.length - 1}
        >
          <ChevronRight className="h-8 w-8 text-blue-500" />
        </Button>

        <Button
          size="lg"
          className="h-16 w-16 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 shadow-lg"
          onClick={handleSwipeRight}
        >
          <Heart className="h-8 w-8" />
        </Button>
      </div>

      {/* Instructions */}
      <div className="text-center mt-6 text-sm text-muted-foreground">
        <p>Swipe right to show interest • Swipe left to pass</p>
        <p className="text-xs mt-1">
          Interest notifications are sent to the other person
        </p>
      </div>
    </div>
  );
};
