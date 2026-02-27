// src/components/founder-matching/SwipeCard.tsx
import React, { useState, useRef, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Heart,
  X,
  Star,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Briefcase,
  GraduationCap,
  Linkedin,
  Globe,
} from "lucide-react";
import { MatchProfile } from "@/services/founder-matching.service";
import { cn } from "@/lib/utils";

interface SwipeCardProps {
  match: MatchProfile;
  onInterested: (matchId: string) => void;
  onDeclined: (matchId: string) => void;
  onSuperLike?: (matchId: string) => void;
  onViewProfile?: (profileId: string) => void;
}

export const SwipeCard: React.FC<SwipeCardProps> = ({
  match,
  onInterested,
  onDeclined,
  onSuperLike,
  onViewProfile,
}) => {
  const profile = match.matched_profile;
  const photos = profile.photo_urls || [];
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [swipeDirection, setSwipeDirection] = useState<"left" | "right" | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const cardRef = useRef<HTMLDivElement>(null);
  const startX = useRef(0);

  const displayName = profile.name || profile.current_role;
  const initials = displayName
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const handlePrevPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (currentPhotoIndex > 0) {
      setCurrentPhotoIndex(currentPhotoIndex - 1);
    }
  };

  const handleNextPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (currentPhotoIndex < photos.length - 1) {
      setCurrentPhotoIndex(currentPhotoIndex + 1);
    }
  };

  const handleDragStart = useCallback((clientX: number) => {
    setIsDragging(true);
    startX.current = clientX;
  }, []);

  const handleDragMove = useCallback((clientX: number) => {
    if (!isDragging) return;
    const offset = clientX - startX.current;
    setDragOffset(offset);
    
    if (offset > 50) {
      setSwipeDirection("right");
    } else if (offset < -50) {
      setSwipeDirection("left");
    } else {
      setSwipeDirection(null);
    }
  }, [isDragging]);

  const handleDragEnd = useCallback(() => {
    if (!isDragging) return;
    
    setIsDragging(false);
    
    if (dragOffset > 100) {
      // Swipe right - interested
      onInterested(match.match_id);
    } else if (dragOffset < -100) {
      // Swipe left - declined
      onDeclined(match.match_id);
    }
    
    setDragOffset(0);
    setSwipeDirection(null);
  }, [isDragging, dragOffset, match.match_id, onInterested, onDeclined]);

  const handleMouseDown = (e: React.MouseEvent) => {
    handleDragStart(e.clientX);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    handleDragMove(e.clientX);
  };

  const handleMouseUp = () => {
    handleDragEnd();
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    handleDragStart(e.touches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    handleDragMove(e.touches[0].clientX);
  };

  const handleTouchEnd = () => {
    handleDragEnd();
  };

  return (
    <div className="relative w-full max-w-sm mx-auto">
      <Card
        ref={cardRef}
        className={cn(
          "overflow-hidden transition-transform cursor-grab active:cursor-grabbing select-none",
          isDragging && "transition-none"
        )}
        style={{
          transform: `translateX(${dragOffset}px) rotate(${dragOffset * 0.05}deg)`,
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Photo section */}
        <div className="relative aspect-[3/4] bg-gradient-to-br from-slate-100 to-slate-200">
          {photos.length > 0 ? (
            <img
              src={photos[currentPhotoIndex]}
              alt={displayName}
              className="w-full h-full object-cover"
              draggable={false}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Avatar className="h-32 w-32">
                <AvatarFallback className="text-4xl bg-gradient-to-br from-blue-100 to-purple-100 text-blue-700">
                  {initials}
                </AvatarFallback>
              </Avatar>
            </div>
          )}

          {/* Swipe indicators */}
          {swipeDirection === "right" && (
            <div className="absolute inset-0 bg-green-500/20 flex items-center justify-center">
              <Badge className="bg-green-500 text-white text-2xl px-6 py-3 rotate-[-15deg] border-4 border-white">
                INTERESTED
              </Badge>
            </div>
          )}
          {swipeDirection === "left" && (
            <div className="absolute inset-0 bg-red-500/20 flex items-center justify-center">
              <Badge className="bg-red-500 text-white text-2xl px-6 py-3 rotate-[15deg] border-4 border-white">
                PASS
              </Badge>
            </div>
          )}

          {/* Photo navigation */}
          {photos.length > 1 && (
            <>
              {/* Photo indicators */}
              <div className="absolute top-2 left-0 right-0 flex justify-center gap-1 px-4">
                {photos.map((_, index) => (
                  <div
                    key={index}
                    className={cn(
                      "h-1 rounded-full flex-1 max-w-8 transition-colors",
                      index === currentPhotoIndex
                        ? "bg-white"
                        : "bg-white/40"
                    )}
                  />
                ))}
              </div>

              {/* Left/Right tap zones */}
              <div
                className="absolute left-0 top-0 bottom-0 w-1/3 cursor-pointer"
                onClick={handlePrevPhoto}
              />
              <div
                className="absolute right-0 top-0 bottom-0 w-1/3 cursor-pointer"
                onClick={handleNextPhoto}
              />
            </>
          )}

          {/* Match score */}
          <Badge className="absolute top-4 right-4 bg-white/90 text-primary font-semibold">
            {Math.round(match.overall_score * 100)}% Match
          </Badge>

          {/* Profile info overlay */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4 pt-16">
            <div className="text-white">
              <h2 className="text-2xl font-bold">
                {displayName}
                {profile.years_experience && (
                  <span className="font-normal">, {profile.years_experience}</span>
                )}
              </h2>
              <p className="text-white/90">{profile.current_role}</p>
              
              {profile.location_preference && (
                <div className="flex items-center gap-1 mt-1 text-white/80 text-sm">
                  <MapPin className="h-3 w-3" />
                  <span>{profile.location_preference}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Profile details */}
        <div className="p-4 space-y-3">
          {/* Bio */}
          {profile.bio && (
            <p className="text-sm text-muted-foreground line-clamp-3">
              {profile.bio}
            </p>
          )}

          {/* Skills */}
          {profile.technical_skills && profile.technical_skills.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {profile.technical_skills.slice(0, 4).map((skill) => (
                <Badge key={skill} variant="outline" className="text-xs">
                  {skill}
                </Badge>
              ))}
              {profile.technical_skills.length > 4 && (
                <Badge variant="outline" className="text-xs">
                  +{profile.technical_skills.length - 4}
                </Badge>
              )}
            </div>
          )}

          {/* Looking for */}
          {profile.seeking_roles && profile.seeking_roles.length > 0 && (
            <div className="text-xs text-muted-foreground">
              <span className="font-medium">Looking for: </span>
              {profile.seeking_roles.slice(0, 2).join(", ")}
            </div>
          )}

          {/* Links */}
          <div className="flex items-center gap-2 pt-2">
            {profile.linkedin_url && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={(e) => {
                  e.stopPropagation();
                  window.open(profile.linkedin_url, "_blank");
                }}
              >
                <Linkedin className="h-4 w-4" />
              </Button>
            )}
            {profile.portfolio_url && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={(e) => {
                  e.stopPropagation();
                  window.open(profile.portfolio_url, "_blank");
                }}
              >
                <Globe className="h-4 w-4" />
              </Button>
            )}
            <Button
              variant="link"
              size="sm"
              className="ml-auto text-xs"
              onClick={() => onViewProfile?.(profile.profile_id)}
            >
              View full profile
            </Button>
          </div>
        </div>
      </Card>

      {/* Action buttons */}
      <div className="flex items-center justify-center gap-4 mt-4">
        <Button
          variant="outline"
          size="lg"
          className="h-14 w-14 rounded-full border-2 border-red-400 hover:bg-red-50"
          onClick={() => onDeclined(match.match_id)}
        >
          <X className="h-6 w-6 text-red-500" />
        </Button>

        {onSuperLike && (
          <Button
            variant="outline"
            size="lg"
            className="h-12 w-12 rounded-full border-2 border-blue-400 hover:bg-blue-50"
            onClick={() => onSuperLike(match.match_id)}
          >
            <Star className="h-5 w-5 text-blue-500" />
          </Button>
        )}

        <Button
          variant="outline"
          size="lg"
          className="h-14 w-14 rounded-full border-2 border-green-400 hover:bg-green-50"
          onClick={() => onInterested(match.match_id)}
        >
          <Heart className="h-6 w-6 text-green-500" />
        </Button>
      </div>

      {/* Keyboard hints */}
      <div className="text-center text-xs text-muted-foreground mt-3">
        <span>Use arrow keys or swipe to navigate</span>
      </div>
    </div>
  );
};

export default SwipeCard;
