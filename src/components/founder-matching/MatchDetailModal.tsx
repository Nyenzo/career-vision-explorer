// src/components/founder-matching/MatchDetailModal.tsx
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Mail,
  Phone,
  MessageCircle,
  Calendar,
  Linkedin,
  MapPin,
  Briefcase,
  GraduationCap,
  Award,
  ExternalLink,
  Heart,
  X,
} from "lucide-react";
import { MatchProfile } from "@/services/founder-matching.service";

interface MatchDetailModalProps {
  match: MatchProfile;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  // Updated to match the service's action types
  onAction: (
    matchId: string,
    action: "interested" | "declined" | "skipped"
  ) => void;
}

export function MatchDetailModal({
  match,
  open,
  onOpenChange,
  onAction,
}: MatchDetailModalProps) {
  const profile = match.matched_profile;

  const getScoreColor = (score: number) => {
    if (score >= 0.9) return "bg-green-500";
    if (score >= 0.8) return "bg-green-400";
    if (score >= 0.7) return "bg-yellow-500";
    if (score >= 0.6) return "bg-orange-400";
    return "bg-red-500";
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const initials = getInitials(profile.current_role);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div>
              <DialogTitle className="text-2xl">
                {profile.current_role}
              </DialogTitle>
              <DialogDescription>
                {profile.years_experience}+ years experience •{" "}
                {profile.location_preference || "Location not specified"}
              </DialogDescription>
            </div>
            <div className="relative">
              <div className="w-20 h-20 rounded-full flex items-center justify-center border-4 border-white shadow-lg">
                <div
                  className={`w-18 h-18 rounded-full flex flex-col items-center justify-center text-white font-bold ${getScoreColor(
                    match.overall_score
                  )}`}
                >
                  <span className="text-xl">
                    {Math.round(match.overall_score * 100)}%
                  </span>
                  <span className="text-xs opacity-90">Match Score</span>
                </div>
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Bio Section */}
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">About</h3>
            <p className="text-muted-foreground">{profile.bio}</p>
          </div>

          {/* Score Breakdown */}
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2 text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-sm font-medium text-blue-700">
                Skill Compatibility
              </div>
              <div className="text-2xl font-bold text-blue-600">
                {Math.round(match.score_breakdown.skill_compatibility * 100)}%
              </div>
            </div>
            <div className="space-y-2 text-center p-4 bg-green-50 rounded-lg">
              <div className="text-sm font-medium text-green-700">
                Experience Match
              </div>
              <div className="text-2xl font-bold text-green-600">
                {Math.round(match.score_breakdown.experience_match * 100)}%
              </div>
            </div>
            <div className="space-y-2 text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-sm font-medium text-purple-700">
                Role Alignment
              </div>
              <div className="text-2xl font-bold text-purple-600">
                {Math.round(match.score_breakdown.role_alignment * 100)}%
              </div>
            </div>
          </div>

          {/* Skills Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Technical Skills</h3>
            <div className="flex flex-wrap gap-2">
              {profile.technical_skills.map((skill) => (
                <Badge key={skill} variant="secondary" className="text-sm">
                  {skill}
                </Badge>
              ))}
            </div>
          </div>

          {/* Soft Skills */}
          {profile.soft_skills && profile.soft_skills.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Soft Skills</h3>
              <div className="flex flex-wrap gap-2">
                {profile.soft_skills.map((skill) => (
                  <Badge key={skill} variant="outline" className="text-sm">
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Roles & Industries */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Seeking Roles</h3>
              <div className="space-y-2">
                {profile.seeking_roles.map((role) => (
                  <div
                    key={role}
                    className="flex items-center gap-2 text-sm text-muted-foreground"
                  >
                    <Briefcase className="h-4 w-4" />
                    {role}
                  </div>
                ))}
              </div>
            </div>

            {profile.industries && profile.industries.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Industries</h3>
                <div className="space-y-2">
                  {profile.industries.map((industry) => (
                    <div
                      key={industry}
                      className="flex items-center gap-2 text-sm text-muted-foreground"
                    >
                      <Award className="h-4 w-4" />
                      {industry}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Education */}
          {profile.education && profile.education.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Education</h3>
              <div className="space-y-2">
                {profile.education.map((edu, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 text-sm text-muted-foreground"
                  >
                    <GraduationCap className="h-4 w-4" />
                    {edu}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Achievements */}
          {profile.achievements && profile.achievements.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Key Achievements</h3>
              <ul className="space-y-2">
                {profile.achievements.map((achievement, index) => (
                  <li
                    key={index}
                    className="text-sm text-muted-foreground flex items-start gap-2"
                  >
                    <Award className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    {achievement}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Links */}
          <div className="flex flex-wrap gap-4">
            {profile.linkedin_url && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(profile.linkedin_url, "_blank")}
              >
                <Linkedin className="h-4 w-4 mr-2" />
                LinkedIn Profile
              </Button>
            )}
            {profile.portfolio_url && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(profile.portfolio_url, "_blank")}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Portfolio
              </Button>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-6 border-t">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Close
            </Button>

            {match.status === "interested" ||
            match.status === "mutual_interest" ? (
              <Button
                variant={
                  match.status === "mutual_interest" ? "default" : "outline"
                }
                className={`flex-1 ${
                  match.status === "mutual_interest"
                    ? "bg-green-600 hover:bg-green-700"
                    : "bg-blue-100 text-blue-700 hover:bg-blue-200"
                }`}
                disabled
              >
                <Heart
                  className={`h-4 w-4 mr-2 ${
                    match.status === "mutual_interest"
                      ? "fill-white"
                      : "fill-blue-500"
                  }`}
                />
                {match.status === "mutual_interest"
                  ? "Connected"
                  : "Interested"}
              </Button>
            ) : (
              <Button
                variant="default"
                className="flex-1"
                onClick={() => onAction(match.match_id, "interested")}
              >
                <Heart className="h-4 w-4 mr-2" />
                Express Interest
              </Button>
            )}

            <Button
              variant="outline"
              className="flex-1"
              onClick={() => onAction(match.match_id, "declined")}
            >
              <X className="h-4 w-4 mr-2" />
              Decline
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
