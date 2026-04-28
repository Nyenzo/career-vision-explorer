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
import { ProfileCompletionCardSkeleton } from "@/components/ui/skeleton-loaders";

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
      avatar_url: 5,
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

    if (profile.resume_url || profile.resume_link) score += sectionWeights.resume_link;

    let socialProfiles = 0;
    if (profile.linkedin_url) socialProfiles++;
    if (profile.github_url) socialProfiles++;
    if (profile.portfolio_url) socialProfiles++;
    score += (socialProfiles / 3) * 15;

    if (profile.avatar_url) score += sectionWeights.avatar_url;

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
        completed: !!(profile.resume_url || profile.resume_link),
        action: "/profile",
      },
      {
        key: "avatar_url",
        label: "Profile Picture",
        completed: !!profile.avatar_url,
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
    return <ProfileCompletionCardSkeleton />;
  }

  const getProgressColor = (percentage: number) => {
    // We'll use a unified blue color for the progress bar as shown in the design
    return "bg-[#1a56db]";
  };

  const getStatusText = (percentage: number) => {
    if (percentage === 100) return "READY FOR EMPLOYERS";
    if (percentage >= 80) return "REFINING EXCELLENCE";
    if (percentage >= 50) return "BUILDING FOUNDATION";
    if (percentage >= 30) return "GETTING STARTED";
    return "ACTION REQUIRED";
  };

  return (
    <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
      <div className="flex justify-between items-start mb-6">
        <div>
          <p className="text-[10px] font-bold tracking-widest text-[#1a56db] uppercase mb-2">Identity Status</p>
          <h2 className="text-2xl font-bold font-headline text-on-surface">Profile Completion</h2>
        </div>
        <div className="text-right">
          <p className="text-4xl font-bold text-[#1a56db] mb-1">{overall}%</p>
          <p className="text-[10px] font-bold tracking-widest text-gray-500 uppercase">{getStatusText(overall)}</p>
        </div>
      </div>

      <div className="mb-8">
        <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden">
          <div 
            className="h-full bg-[#1a56db] rounded-full transition-all duration-500 ease-out" 
            style={{ width: `${overall}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        {/* We want to show a mix of completed and uncompleted tasks. The design shows Add Your Name (checked), Add Profile Photo (unchecked), Add Portfolio URL (unchecked), Upload Your Resume (unchecked), Connect GitHub (unchecked). */}
        {sections.slice(0, 6).map((section) => (
          <div 
            key={section.key} 
            className="flex items-center gap-3 p-4 rounded-xl bg-[#f8f9fa] border border-transparent hover:border-gray-200 transition-colors cursor-pointer"
            onClick={() => navigate(section.action)}
          >
            {section.completed ? (
              <div className="w-5 h-5 rounded-full bg-[#059669] flex items-center justify-center flex-shrink-0">
                <CheckCircle className="w-3.5 h-3.5 text-white" strokeWidth={3} />
              </div>
            ) : (
              <div className="w-5 h-5 rounded-full bg-gray-300 flex items-center justify-center flex-shrink-0">
                <div className="flex gap-[2px]">
                  <div className="w-[3px] h-[3px] bg-white rounded-full"></div>
                  <div className="w-[3px] h-[3px] bg-white rounded-full"></div>
                  <div className="w-[3px] h-[3px] bg-white rounded-full"></div>
                </div>
              </div>
            )}
            <span className={`text-sm font-medium ${section.completed ? 'text-gray-900' : 'text-gray-600'}`}>
              {section.label}
            </span>
          </div>
        ))}
      </div>

      <button 
        onClick={() => navigate(nextAction ? nextAction.action : "/profile")}
        className="bg-[#1a56db] text-white px-8 py-3 rounded-full font-semibold text-sm hover:bg-blue-700 transition-colors"
      >
        Complete Now
      </button>
    </div>
  );
};
