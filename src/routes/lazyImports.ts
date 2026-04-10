import { lazy } from "react";

// Auth
export const Login = lazy(() => import("@/pages/Login"));
export const Signup = lazy(() => import("@/pages/Signup"));

// Public
export const Index = lazy(() => import("@/pages/Index"));
export const Jobs = lazy(() => import("@/pages/Jobs"));
export const JobDetails = lazy(() => import("@/pages/JobDetails"));
export const PublicProfile = lazy(() => import("@/pages/PublicProfile"));
export const NotFound = lazy(() => import("@/pages/NotFound"));
export const Privacy = lazy(() => import("@/pages/Privacy"));
export const Terms = lazy(() => import("@/pages/Terms"));

// Protected shared
export const Profile = lazy(() => import("@/pages/Profile"));
export const AccountManagement = lazy(() => import("@/pages/AccountManagement"));
export const Notifications = lazy(() => import("@/pages/Notifications"));

// Jobseeker
export const JobSeekerDashboard = lazy(() => import("@/pages/jobseeker/JobSeekerDashboard"));
export const JobSeekerSettings = lazy(() => import("@/pages/jobseeker/JobSeekerSettings"));

// Employer
export const EmployerDashboard = lazy(() => import("@/pages/employer/EmployerDashboard"));
export const EmployerJobs = lazy(() => import("@/pages/employer/EmployerJobs"));
export const JobApplicants = lazy(() => import("@/pages/employer/JobApplicants"));
export const AllApplicants = lazy(() => import("@/pages/employer/AllApplicants"));
export const EmployerInterviews = lazy(() => import("@/pages/employer/EmployerInterviews"));
