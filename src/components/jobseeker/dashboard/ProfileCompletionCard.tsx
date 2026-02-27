import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Target, ArrowRight, CheckCircle, AlertCircle } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export const ProfileCompletionCard = () => {
  const { profile, isLoading } = useAuth();
  const navigate = useNavigate();

  // Calculate completion percentage using same logic as Profile.tsx
  const calculateProfileCompletion = () => {
    if (!profile) return 0;

    const isEmployer = profile.account_type === "employer";
    if (isEmployer) return 100;

    // Job seeker completion calculation - SAME AS Profile.tsx
    const sectionWeights = {
      name: 10,
      bio: 15,
      skills: 20,
      location: 5,
      education: 10,
      work_experience: 15,
      resume_link: 10,
      linkedin_url: 5,
      github_url: 5,
      portfolio_url: 5,
      profile_image_url: 5,
    };

    let score = 0;

    if (profile.name) score += sectionWeights.name;
    if (profile.bio && profile.bio.length > 50) score += sectionWeights.bio;
    else if (profile.bio) score += sectionWeights.bio * 0.5;

    if (profile.skills && profile.skills.length >= 5) score += sectionWeights.skills;
    else if (profile.skills && profile.skills.length > 0) {
      score += sectionWeights.skills * (profile.skills.length / 5);
    }

    if (profile.location) score += sectionWeights.location;
    if (profile.education) score += sectionWeights.education;

    if (profile.work_experience && profile.work_experience.length >= 1) {
      score += sectionWeights.work_experience;
    }

    if (profile.resume_link) score += sectionWeights.resume_link;

    let socialProfiles = 0;
    if (profile.linkedin_url) socialProfiles++;
    if (profile.github_url) socialProfiles++;
    if (profile.portfolio_url) socialProfiles++;
    score += (socialProfiles / 3) * 15;

    if (profile.profile_image_url) score += sectionWeights.profile_image_url;

    if (profile.certifications && profile.certifications.length > 0) {
      score += Math.min(5, profile.certifications.length);
    }

    return Math.min(100, Math.round(score));
  };

  const overall = calculateProfileCompletion();

  const getCompletionSections = () => {
    if (!profile) return [];

    return [
      {
        key: "name",
        label: "Add Your Name",
        completed: !!profile.name,
        action: "/profile",
      },
      {
        key: "bio",
        label: "Write a Professional Bio (50+ chars)",
        completed: !!profile.bio && profile.bio.length > 50,
        action: "/profile",
      },
      {
        key: "skills",
        label: "Add at least 5 Skills",
        completed: !!profile.skills && profile.skills.length >= 5,
        action: "/profile",
      },
      {
        key: "location",
        label: "Set Your Location",
        completed: !!profile.location,
        action: "/profile",
      },
      {
        key: "education",
        label: "Add Education History",
        completed: !!profile.education && profile.education.length > 0,
        action: "/profile",
      },
      {
        key: "work_experience",
        label: "Add Work Experience",
        completed:
          !!profile.work_experience && profile.work_experience.length > 0,
        action: "/profile",
      },
      {
        key: "resume",
        label: "Upload Your Resume",
        completed: !!profile.resume_link,
        action: "/profile",
      },
      {
        key: "profile_image",
        label: "Add Profile Photo",
        completed: !!profile.profile_image_url,
        action: "/profile",
      },
      {
        key: "linkedin",
        label: "Connect LinkedIn",
        completed: !!profile.linkedin_url,
        action: "/profile",
      },
      {
        key: "github",
        label: "Connect GitHub",
        completed: !!profile.github_url,
        action: "/profile",
      },
      {
        key: "portfolio",
        label: "Add Portfolio URL",
        completed: !!profile.portfolio_url,
        action: "/profile",
      },
    ];
  };

  const sections = getCompletionSections();

  const sortedSections = sections.sort((a, b) => {
    if (a.completed === b.completed) return 0;
    return a.completed ? 1 : -1;
  });

  const incompleteSections = sections.filter((s) => !s.completed);
  const nextAction = incompleteSections[0];
  const completedCount = sections.filter((s) => s.completed).length;

  if (isLoading) {
    return (
      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-gray-900">
            <Target className="h-5 w-5 text-blue-600" />
            Profile Completion
          </CardTitle>
          <CardDescription>Loading your profile progress...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-2 bg-gray-200 rounded"></div>
            <div className="space-y-2">
              <div className="h-3 bg-gray-200 rounded"></div>
              <div className="h-3 bg-gray-200 rounded"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getProgressColor = (percentage: number) => {
    if (percentage >= 80) return "bg-green-500";
    if (percentage >= 50) return "bg-blue-500";
    if (percentage >= 30) return "bg-yellow-500";
    return "bg-red-500";
  };

  const getMotivationalMessage = (percentage: number) => {
    if (percentage === 100) {
      return "Perfect! Your profile is complete and ready for employers! 🎉";
    }
    if (percentage >= 80) {
      return "Great job! You're almost there - complete your profile to stand out!";
    }
    if (percentage >= 50) {
      return "Good progress! Keep going to make your profile more attractive to employers.";
    }
    if (percentage >= 30) {
      return "You're on your way! Complete more sections to improve your chances.";
    }
    return "Start building your profile to attract employers and get noticed!";
  };

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-gray-900">
          <Target className="h-5 w-5 text-blue-600" />
          Profile Completion
        </CardTitle>
        <CardDescription>{getMotivationalMessage(overall)}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-700">Overall Progress</span>
            <span className="font-medium text-gray-900">{overall}%</span>
          </div>
          <Progress
            value={overall}
            className={`h-3 ${getProgressColor(overall)}`}
            aria-label={`Profile completion progress: ${overall}%`}
          />
          <p className="text-xs text-gray-500">
            {completedCount} of {sections.length} sections complete
          </p>
        </div>

        {nextAction && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-800">
                Next Step
              </span>
            </div>
            <p className="text-sm text-blue-700 mb-3">{nextAction.label}</p>
            <Button
              size="sm"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              onClick={() => navigate(nextAction.action)}
            >
              Complete Now
              <ArrowRight className="h-3 w-3 ml-1" />
            </Button>
          </div>
        )}

        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700">
            Progress Details
          </h4>
          <div className="space-y-1 max-h-48 overflow-y-auto">
            {sortedSections.map((section) => (
              <div
                key={section.key}
                className="flex items-center justify-between p-2 bg-gray-50 rounded-lg text-sm"
              >
                <span
                  className={`font-medium ${
                    section.completed ? "text-gray-600" : "text-gray-700"
                  }`}
                >
                  {section.label}
                </span>
                <Badge
                  className={
                    section.completed
                      ? "bg-green-100 text-green-800 border-green-200"
                      : "bg-orange-100 text-orange-800 border-orange-200"
                  }
                >
                  {section.completed ? (
                    <CheckCircle className="h-3 w-3 mr-1" />
                  ) : (
                    <AlertCircle className="h-3 w-3 mr-1" />
                  )}
                  {section.completed ? "Complete" : "Pending"}
                </Badge>
              </div>
            ))}
          </div>
        </div>

        {overall < 100 && (
          <Button
            variant="outline"
            className="w-full border-blue-200 text-blue-600 hover:bg-blue-50"
            onClick={() => navigate("/profile")}
          >
            Complete All Sections
            <ArrowRight className="h-3 w-3 ml-1" />
          </Button>
        )}

        {overall === 100 && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-center">
            <CheckCircle className="h-5 w-5 text-green-600 mx-auto mb-2" />
            <p className="text-sm font-medium text-green-800">
              Profile Complete!
            </p>
            <p className="text-xs text-green-600">
              Your profile is now optimized for employers
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
