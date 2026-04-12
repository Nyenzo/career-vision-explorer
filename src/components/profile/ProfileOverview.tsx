
import SkillsOverviewCard from "@/components/profile/SkillsOverviewCard";
import RecentAssessmentsCard from "@/components/profile/RecentAssessmentsCard";

import CareerProgressCard from "@/components/profile/CareerProgressCard";

interface Skill {
  id: string;
  name: string;
  category: string;
  isVerified: boolean;
  proficiencyLevel: number;
}

interface Assessment {
  title: string;
  score: number;
  date: string;
  badgeEarned: boolean;
}



interface ProfileOverviewProps {
  skills: Skill[];
  recentAssessments: Assessment[];
  onShowSkillsDialog: () => void;
}

const ProfileOverview = ({
  skills,
  recentAssessments,
  onShowSkillsDialog,
}: ProfileOverviewProps) => {
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <SkillsOverviewCard
          skills={skills}
          onShowSkillsDialog={onShowSkillsDialog}
        />
        
        <RecentAssessmentsCard
          assessments={recentAssessments}
          onShowSkillsDialog={onShowSkillsDialog}
        />
      </div>


      <CareerProgressCard />
    </div>
  );
};

export default ProfileOverview;
