
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield, Briefcase, User } from "lucide-react";

interface LoginTabsProps {
  loginType: 'admin' | 'jobseeker' | 'employer';
  setLoginType: (type: 'admin' | 'jobseeker' | 'employer') => void;
}

export const LoginTabs = ({ loginType, setLoginType }: LoginTabsProps) => {
  return (
    <Tabs value={loginType} onValueChange={(v) => setLoginType(v as any)} className="mb-6">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="admin" className="flex items-center space-x-2">
          <Shield className="h-4 w-4" />
          <span>Admin</span>
        </TabsTrigger>
        <TabsTrigger value="employer" className="flex items-center space-x-2">
          <Briefcase className="h-4 w-4" />
          <span>Employer</span>
        </TabsTrigger>
        <TabsTrigger value="jobseeker" className="flex items-center space-x-2">
          <User className="h-4 w-4" />
          <span>Job Seeker</span>
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
};
