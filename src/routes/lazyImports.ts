import { lazy } from "react";

// Lazy load major pages
export const Index = lazy(() => import("@/pages/Index"));
export const Login = lazy(() => import("@/pages/Login"));
export const Signup = lazy(() => import("@/pages/Signup"));
export const Jobs = lazy(() => import("@/pages/Jobs"));
export const JobSeekerDashboard = lazy(() => import("@/pages/jobseeker/JobSeekerDashboard"));
export const JobDetails = lazy(() => import("@/pages/JobDetails"));
export const PublicProfile = lazy(() => import("@/pages/PublicProfile"));
export const VideoMeeting = lazy(() => import("@/pages/VideoMeeting"));
export const NotFound = lazy(() => import("@/pages/NotFound"));
export const Profile = lazy(() => import("@/pages/Profile"));
export const Skills = lazy(() => import("@/pages/Skills"));
export const CareerPaths = lazy(() => import("@/pages/CareerPaths"));

// Lazy load admin pages
export const AdminLogin = lazy(() => import("@/pages/admin/AdminLogin"));
export const AdminDashboard = lazy(() => import("@/pages/admin/AdminDashboard"));
export const AdminAPI = lazy(() => import("@/pages/admin/AdminAPI"));

// Lazy load employer pages
export const EmployerDashboard = lazy(() => import("@/pages/employer/EmployerDashboard"));

// Other pages that are loaded less frequently
export const About = lazy(() => import("@/pages/About"));
export const Blog = lazy(() => import("@/pages/Blog"));
export const Help = lazy(() => import("@/pages/Help"));
export const Contact = lazy(() => import("@/pages/Contact"));
export const FAQ = lazy(() => import("@/pages/FAQ"));
export const Privacy = lazy(() => import("@/pages/Privacy"));
export const Terms = lazy(() => import("@/pages/Terms"));
export const LearningPaths = lazy(() => import("@/pages/LearningPaths"));
export const Partners = lazy(() => import("@/pages/Partners"));
export const JobSeekerSettings = lazy(() => import("@/pages/jobseeker/JobSeekerSettings"));
export const AdminUsers = lazy(() => import("@/pages/admin/AdminUsers"));
export const AdminJobseekers = lazy(() => import("@/pages/admin/AdminJobseekers"));
export const AdminJobs = lazy(() => import("@/pages/admin/AdminJobs"));
export const AdminSkills = lazy(() => import("@/pages/admin/AdminSkills"));
export const AdminCareerPaths = lazy(() => import("@/pages/admin/AdminCareerPaths"));
export const AdminPartners = lazy(() => import("@/pages/admin/AdminPartners"));
export const AdminTestimonials = lazy(() => import("@/pages/admin/AdminTestimonials"));
export const AdminContent = lazy(() => import("@/pages/admin/AdminContent"));
export const AdminInsights = lazy(() => import("@/pages/admin/AdminInsights"));
export const AdminSettings = lazy(() => import("@/pages/admin/AdminSettings"));
export const AdminInterviews = lazy(() => import("@/pages/admin/AdminInterviews"));
export const AdminProfiles = lazy(() => import("@/pages/admin/AdminProfiles"));
export const EmployerJobs = lazy(() => import("@/pages/employer/EmployerJobs"));
export const JobApplicants = lazy(() => import("@/pages/employer/JobApplicants"));
export const AllApplicants = lazy(() => import("@/pages/employer/AllApplicants"));
export const EmployerInterviews = lazy(() => import("@/pages/employer/EmployerInterviews"));

export const AdminFreelancers = lazy(() => import("@/pages/admin/AdminFreelancers"));
export const FreelancerProfile = lazy(() => import("@/pages/FreelancerProfile"));
export const FreelancerDashboard = lazy(() => import("@/pages/FreelancerDashboard"));
