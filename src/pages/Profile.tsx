import React from "react";
import { useAuth } from "@/hooks/use-auth";
import EmployerProfile from "@/pages/employer/Profile";
import JobSeekerProfile from "@/pages/jobseeker/Profile";

const Profile: React.FC = () => {
  const { user } = useAuth();

  if (user?.account_type === "employer") {
    return <EmployerProfile />;
  }

  return <JobSeekerProfile />;
};

export default Profile;
