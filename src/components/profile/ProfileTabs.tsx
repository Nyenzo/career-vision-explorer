
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ProfileTabsContent from "@/components/profile/ProfileTabsContent";

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



interface ProfileTabsProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  skills: Skill[];
  recentAssessments: Assessment[];
  onShowSkillsDialog: () => void;
  onUpdateSkill: (skillId: string, level: number) => void;
  onVerifySkill: (skillId: string) => void;
}

const ProfileTabs = ({
  activeTab,
  setActiveTab,
  skills,
  recentAssessments,
  onShowSkillsDialog,
  onUpdateSkill,
  onVerifySkill,
}: ProfileTabsProps) => {
  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden backdrop-blur-sm">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="border-b border-gray-100 bg-gradient-to-r from-gray-50/80 to-blue-50/30">
          <TabsList className="w-full justify-start h-auto p-0 bg-transparent rounded-none">
            <TabsTrigger 
              value="overview" 
              className="px-8 py-5 rounded-none data-[state=active]:bg-white data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:shadow-none font-medium text-gray-600 data-[state=active]:text-blue-600 hover:bg-white/50 transition-all duration-200"
            >
              Overview
            </TabsTrigger>
            <TabsTrigger 
              value="resume" 
              className="px-8 py-5 rounded-none data-[state=active]:bg-white data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:shadow-none font-medium text-gray-600 data-[state=active]:text-blue-600 hover:bg-white/50 transition-all duration-200"
            >
              Resume & Skills
            </TabsTrigger>
            <TabsTrigger 
              value="assessments" 
              className="px-8 py-5 rounded-none data-[state=active]:bg-white data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:shadow-none font-medium text-gray-600 data-[state=active]:text-blue-600 hover:bg-white/50 transition-all duration-200"
            >
              Assessments
            </TabsTrigger>
            <TabsTrigger 
              value="learning" 
              className="px-8 py-5 rounded-none data-[state=active]:bg-white data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:shadow-none font-medium text-gray-600 data-[state=active]:text-blue-600 hover:bg-white/50 transition-all duration-200"
            >
              Learning Paths
            </TabsTrigger>
          </TabsList>
        </div>
        
        <div className="p-8">
          <ProfileTabsContent
            skills={skills}
            recentAssessments={recentAssessments}
            onShowSkillsDialog={onShowSkillsDialog}
            onUpdateSkill={onUpdateSkill}
            onVerifySkill={onVerifySkill}
          />
        </div>
      </Tabs>
    </div>
  );
};

export default ProfileTabs;
