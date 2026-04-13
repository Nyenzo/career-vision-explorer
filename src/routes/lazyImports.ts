import { lazy } from "react";

// Auth
export const Login = lazy(() => import("@/pages/Login"));
export const Signup = lazy(() => import("@/pages/Signup"));
export const ForgotPassword = lazy(() => import("@/pages/ForgotPassword"));
export const ResetPassword = lazy(() => import("@/pages/ResetPassword"));
export const LinkedInCallback = lazy(() => import("@/pages/auth/LinkedInCallback"));

// Public
export const Index = lazy(() => import("@/pages/Index"));
export const Privacy = lazy(() => import("@/pages/Privacy"));
export const Terms = lazy(() => import("@/pages/Terms"));
export const PublicProfile = lazy(() => import("@/pages/PublicProfile"));
export const NotFound = lazy(() => import("@/pages/NotFound"));

// General Protected
export const Profile = lazy(() => import("@/pages/Profile"));
export const AccountManagement = lazy(() => import("@/pages/AccountManagement"));
export const LegacyJobDetailsRedirect = lazy(() => import("@/pages/LegacyJobDetailsRedirect"));

// Jobseeker
export const Jobs = lazy(() => import("@/pages/Jobs"));
export const JobDetails = lazy(() => import("@/pages/JobDetails"));
export const JobSeekerDashboard = lazy(() => import("@/pages/jobseeker/JobSeekerDashboard"));
export const JobSeekerSettings = lazy(() => import("@/pages/jobseeker/JobSeekerSettings"));

// Employer
export const EmployerDashboard = lazy(() => import("@/pages/employer/EmployerDashboard"));
export const EmployerJobs = lazy(() => import("@/pages/employer/EmployerJobs"));
export const EmployerJobDetails = lazy(() => import("@/pages/employer/EmployerJobDetails"));
export const EmployerEditJobPage = lazy(() => import("@/pages/employer/EmployerEditJobPage"));
export const AllApplicants = lazy(() => import("@/pages/employer/AllApplicants"));
