import { Routes, Route, Outlet } from "react-router-dom";
import { useEffect, lazy, Suspense } from "react";
import { useLocation } from "react-router-dom";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import DashboardLayout from "@/components/admin/DashboardLayout";

// Lazy load pages
const Index = lazy(() => import("@/pages/Index"));
const Login = lazy(() => import("@/pages/Login"));
const Signup = lazy(() => import("@/pages/Signup"));
const LinkedInCallback = lazy(() => import("@/pages/auth/LinkedInCallback"));
const Notifications = lazy(() => import("@/pages/Notifications"));
const Jobs = lazy(() => import("@/pages/Jobs"));
const JobDetails = lazy(() => import("@/pages/JobDetails"));
const PublicProfile = lazy(() => import("@/pages/PublicProfile"));
const NotFound = lazy(() => import("@/pages/NotFound"));
const Profile = lazy(() => import("@/pages/Profile"));
const Skills = lazy(() => import("@/pages/Skills"));
const CareerPaths = lazy(() => import("@/pages/CareerPaths"));
const Dashboard = lazy(() => import("@/pages/Dashboard"));

// Admin
const AdminLogin = lazy(() => import("@/pages/admin/AdminLogin"));
const AdminDashboard = lazy(() => import("@/pages/admin/AdminDashboard"));
const AdminAPI = lazy(() => import("@/pages/admin/AdminAPI"));
const AdminUsers = lazy(() => import("@/pages/admin/AdminUsers"));
const AdminJobseekers = lazy(() => import("@/pages/admin/AdminJobseekers"));
const AdminJobs = lazy(() => import("@/pages/admin/AdminJobs"));
const AdminSkills = lazy(() => import("@/pages/admin/AdminSkills"));
const AdminCareerPaths = lazy(() => import("@/pages/admin/AdminCareerPaths"));
const AdminPartners = lazy(() => import("@/pages/admin/AdminPartners"));
const AdminTestimonials = lazy(() => import("@/pages/admin/AdminTestimonials"));
const AdminContent = lazy(() => import("@/pages/admin/AdminContent"));
const AdminInsights = lazy(() => import("@/pages/admin/AdminInsights"));
const AdminSettings = lazy(() => import("@/pages/admin/AdminSettings"));
const AdminProfiles = lazy(() => import("@/pages/admin/AdminProfiles"));

// Employer
const EmployerDashboard = lazy(
  () => import("@/pages/employer/EmployerDashboard")
);
const EmployerJobs = lazy(() => import("@/pages/employer/EmployerJobs"));
const EmployerProjects = lazy(() => import("@/pages/EmployerProjects"));
const EmployerBoostingServices = lazy(
  () => import("@/pages/BoostingServicesPage")
);
const JobApplicants = lazy(() => import("@/pages/employer/JobApplicants"));
const AllApplicants = lazy(() => import("@/pages/employer/AllApplicants"));
const EmployerInterviews = lazy(
  () => import("@/pages/employer/EmployerInterviews")
);
const InterviewSchedule = lazy(
  () => import("@/pages/employer/InterviewSchedule")
);

// Jobseeker
const JobSeekerDashboard = lazy(
  () => import("@/pages/jobseeker/JobSeekerDashboard")
);
const JobSeekerSettings = lazy(
  () => import("@/pages/jobseeker/JobSeekerSettings")
);

const FounderDashboard = lazy(() => import("@/pages/founder/FounderDashboard"));
const FounderOnboarding = lazy(
  () => import("@/pages/founder/CofounderOnboarding")
);
const FounderProfile = lazy(() => import("@/pages/founder/FounderProfile"));
const FounderMatches = lazy(() => import("@/pages/founder/FounderMatches"));

// Freelancer
const Freelancers = lazy(() => import("@/pages/Freelancers"));
const FreelancerProfile = lazy(() => import("@/pages/FreelancerProfile"));
const FreelancerDashboard = lazy(
  () => import("@/pages/freelancer/FreelancerDashboard")
);
const CreateFreelancerProfile = lazy(
  () => import("@/pages/freelancer/CreateFreelancerProfile")
);

// Other pages
const About = lazy(() => import("@/pages/About"));
const Blog = lazy(() => import("@/pages/Blog"));
const Help = lazy(() => import("@/pages/Help"));
const Contact = lazy(() => import("@/pages/Contact"));
const FAQ = lazy(() => import("@/pages/FAQ"));
const Privacy = lazy(() => import("@/pages/Privacy"));
const Terms = lazy(() => import("@/pages/Terms"));
const LearningPaths = lazy(() => import("@/pages/LearningPaths"));
const Partners = lazy(() => import("@/pages/Partners"));
const Insights = lazy(() => import("@/pages/Insights"));
const InterviewPrep = lazy(() => import("@/pages/InterviewPrep"));
const SkillGapAnalysis = lazy(() => import("@/pages/SkillGapAnalysis"));
const EnhancedSkillAnalysis = lazy(
  () => import("@/pages/EnhancedSkillAnalysis")
);
const AIJobMatching = lazy(() => import("@/pages/AIJobMatching"));
const JobMatching = lazy(() => import("@/pages/JobMatching"));

// Loader
const PageLoader = () => (
  <div className="min-h-screen bg-background flex items-center justify-center">
    <div className="flex items-center gap-2">
      <div className="w-4 h-4 bg-primary rounded-full animate-pulse"></div>
      <div
        className="w-4 h-4 bg-primary rounded-full animate-pulse"
        style={{ animationDelay: "0.2s" }}
      ></div>
      <div
        className="w-4 h-4 bg-primary rounded-full animate-pulse"
        style={{ animationDelay: "0.4s" }}
      ></div>
    </div>
  </div>
);

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

export const AppRoutes = () => {
  return (
    <>
      <ScrollToTop />
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Outlet />}>
          <Route
            index
            element={
              <Suspense fallback={<PageLoader />}>
                <Index />
              </Suspense>
            }
          />
          <Route
            path="jobs"
            element={
              <Suspense fallback={<PageLoader />}>
                <Jobs />
              </Suspense>
            }
          />
          <Route
            path="jobs/:id"
            element={
              <Suspense fallback={<PageLoader />}>
                <JobDetails />
              </Suspense>
            }
          />
          <Route
            path="freelancers"
            element={
              <Suspense fallback={<PageLoader />}>
                <Freelancers />
              </Suspense>
            }
          />
          <Route
            path="freelancers/:freelancerId"
            element={
              <Suspense fallback={<PageLoader />}>
                <FreelancerProfile />
              </Suspense>
            }
          />
          <Route
            path="about"
            element={
              <Suspense fallback={<PageLoader />}>
                <About />
              </Suspense>
            }
          />
          <Route
            path="blog"
            element={
              <Suspense fallback={<PageLoader />}>
                <Blog />
              </Suspense>
            }
          />
          <Route
            path="help"
            element={
              <Suspense fallback={<PageLoader />}>
                <Help />
              </Suspense>
            }
          />
          <Route
            path="contact"
            element={
              <Suspense fallback={<PageLoader />}>
                <Contact />
              </Suspense>
            }
          />
          <Route
            path="faq"
            element={
              <Suspense fallback={<PageLoader />}>
                <FAQ />
              </Suspense>
            }
          />
          <Route
            path="privacy"
            element={
              <Suspense fallback={<PageLoader />}>
                <Privacy />
              </Suspense>
            }
          />
          <Route
            path="terms"
            element={
              <Suspense fallback={<PageLoader />}>
                <Terms />
              </Suspense>
            }
          />
          <Route
            path="insights"
            element={
              <Suspense fallback={<PageLoader />}>
                <Insights />
              </Suspense>
            }
          />
          <Route
            path="skills"
            element={
              <Suspense fallback={<PageLoader />}>
                <Skills />
              </Suspense>
            }
          />
          <Route
            path="career-paths"
            element={
              <Suspense fallback={<PageLoader />}>
                <CareerPaths />
              </Suspense>
            }
          />
          <Route
            path="learning-paths"
            element={
              <Suspense fallback={<PageLoader />}>
                <LearningPaths />
              </Suspense>
            }
          />
          <Route
            path="partners"
            element={
              <Suspense fallback={<PageLoader />}>
                <Partners />
              </Suspense>
            }
          />
          <Route
            path="interview-prep"
            element={
              <Suspense fallback={<PageLoader />}>
                <InterviewPrep />
              </Suspense>
            }
          />
          <Route
            path="skill-gap-analysis"
            element={
              <Suspense fallback={<PageLoader />}>
                <SkillGapAnalysis />
              </Suspense>
            }
          />
          <Route
            path="enhanced-skill-analysis"
            element={
              <Suspense fallback={<PageLoader />}>
                <EnhancedSkillAnalysis />
              </Suspense>
            }
          />
          <Route
            path="ai-job-matching"
            element={
              <Suspense fallback={<PageLoader />}>
                <AIJobMatching />
              </Suspense>
            }
          />
          <Route
            path="job-matching"
            element={
              <Suspense fallback={<PageLoader />}>
                <JobMatching />
              </Suspense>
            }
          />
        </Route>

        {/* Auth routes */}
        <Route
          path="/login"
          element={
            <Suspense fallback={<PageLoader />}>
              <Login />
            </Suspense>
          }
        />
        <Route
          path="/signup"
          element={
            <Suspense fallback={<PageLoader />}>
              <Signup />
            </Suspense>
          }
        />
        {/* Forgot/reset password temporarily disabled (missing pages) */}
        <Route
          path="/auth/callback"
          element={
            <Suspense fallback={<PageLoader />}>
              <LinkedInCallback />
            </Suspense>
          }
        />
        <Route
          path="/profile/:id"
          element={
            <Suspense fallback={<PageLoader />}>
              <PublicProfile />
            </Suspense>
          }
        />

        {/* Employer Routes */}
        <Route path="/employer" element={<Outlet />}>
          <Route
            path="dashboard"
            element={
              <ProtectedRoute requiredRole="employer">
                <DashboardLayout title="Employer Dashboard" role="employer">
                  <Suspense fallback={<PageLoader />}>
                    <EmployerDashboard />
                  </Suspense>
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="jobs"
            element={
              <ProtectedRoute requiredRole="employer">
                <DashboardLayout title="Employer Jobs" role="employer">
                  <Suspense fallback={<PageLoader />}>
                    <EmployerJobs />
                  </Suspense>
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="projects"
            element={
              <ProtectedRoute requiredRole="employer">
                <DashboardLayout title="Employer Projects" role="employer">
                  <Suspense fallback={<PageLoader />}>
                    <EmployerProjects />
                  </Suspense>
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="boosting-services"
            element={
              <ProtectedRoute requiredRole="employer">
                <DashboardLayout title="Boosting Services" role="employer">
                  <Suspense fallback={<PageLoader />}>
                    <EmployerBoostingServices />
                  </Suspense>
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="applicants"
            element={
              <ProtectedRoute requiredRole="employer">
                <DashboardLayout title="All Applicants" role="employer">
                  <Suspense fallback={<PageLoader />}>
                    <AllApplicants />
                  </Suspense>
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="interviews"
            element={
              <ProtectedRoute requiredRole="employer">
                <DashboardLayout title="Interviews" role="employer">
                  <Suspense fallback={<PageLoader />}>
                    <EmployerInterviews />
                  </Suspense>
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="interviews/schedule"
            element={
              <ProtectedRoute requiredRole="employer">
                <DashboardLayout title="Schedule Interview" role="employer">
                  <Suspense fallback={<PageLoader />}>
                    <InterviewSchedule />
                  </Suspense>
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
        </Route>

        {/* Jobseeker Routes */}
        <Route path="/jobseeker" element={<Outlet />}>
          <Route
            path="dashboard"
            element={
              <ProtectedRoute requiredRole="job_seeker">
                <Suspense fallback={<PageLoader />}>
                  <JobSeekerDashboard />
                </Suspense>
              </ProtectedRoute>
            }
          />
          <Route
            path="settings"
            element={
              <ProtectedRoute requiredRole="job_seeker">
                <Suspense fallback={<PageLoader />}>
                  <JobSeekerSettings />
                </Suspense>
              </ProtectedRoute>
            }
          />
        </Route>

        {/* Founder Matching Routes */}
        <Route path="/founder" element={<Outlet />}>
          <Route
            path="dashboard"
            element={
              <ProtectedRoute requiredRole="job_seeker">
                <Suspense fallback={<PageLoader />}>
                  <FounderDashboard />
                </Suspense>
              </ProtectedRoute>
            }
          />
          {/* Add this route for onboarding */}
          <Route
            path="onboarding"
            element={
              <ProtectedRoute requiredRole="job_seeker">
                <Suspense fallback={<PageLoader />}>
                  <FounderOnboarding />
                </Suspense>
              </ProtectedRoute>
            }
          />
          <Route
            path="matches"
            element={
              <ProtectedRoute requiredRole="job_seeker">
                <Suspense fallback={<PageLoader />}>
                  <FounderMatches />
                </Suspense>
              </ProtectedRoute>
            }
          />
          {/* ADD THIS ROUTE - Current user's founder profile */}
          <Route
            path="profile"
            element={
              <ProtectedRoute requiredRole="job_seeker">
                <Suspense fallback={<PageLoader />}>
                  <FounderProfile />
                </Suspense>
              </ProtectedRoute>
            }
          />
          {/* Keep this route for viewing other users' founder profiles */}
          <Route
            path="profile/:profileId"
            element={
              <ProtectedRoute requiredRole="job_seeker">
                <Suspense fallback={<PageLoader />}>
                  <FounderProfile />
                </Suspense>
              </ProtectedRoute>
            }
          />
        </Route>

        {/* Freelancer Routes */}
        <Route path="/freelancer" element={<Outlet />}>
          <Route
            path="dashboard"
            element={
              <ProtectedRoute requiredRole="freelancer">
                <Suspense fallback={<PageLoader />}>
                  <FreelancerDashboard />
                </Suspense>
              </ProtectedRoute>
            }
          />
          <Route
            path="create-profile"
            element={
              <ProtectedRoute requiredRole="freelancer">
                <Suspense fallback={<PageLoader />}>
                  <CreateFreelancerProfile />
                </Suspense>
              </ProtectedRoute>
            }
          />
          <Route
            path="edit-profile"
            element={
              <ProtectedRoute requiredRole="freelancer">
                <Suspense fallback={<PageLoader />}>
                  <CreateFreelancerProfile />
                </Suspense>
              </ProtectedRoute>
            }
          />
        </Route>

        {/* General Protected Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Suspense fallback={<PageLoader />}>
                <Dashboard />
              </Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path="/notifications"
          element={
            <ProtectedRoute>
              <Suspense fallback={<PageLoader />}>
                <Notifications />
              </Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Suspense fallback={<PageLoader />}>
                <Profile />
              </Suspense>
            </ProtectedRoute>
          }
        />

        {/* Admin Routes */}
        <Route
          path="/admin"
          element={
            <DashboardLayout title="Admin Dashboard" role="admin">
              <Outlet />
            </DashboardLayout>
          }
        >
          <Route
            path="login"
            element={
              <Suspense fallback={<PageLoader />}>
                <AdminLogin />
              </Suspense>
            }
          />
          <Route
            index
            element={
              <ProtectedRoute requiredRole="admin">
                <Suspense fallback={<PageLoader />}>
                  <AdminDashboard />
                </Suspense>
              </ProtectedRoute>
            }
          />
          <Route
            path="api"
            element={
              <ProtectedRoute requiredRole="admin">
                <Suspense fallback={<PageLoader />}>
                  <AdminAPI />
                </Suspense>
              </ProtectedRoute>
            }
          />
          <Route
            path="users"
            element={
              <ProtectedRoute requiredRole="admin">
                <Suspense fallback={<PageLoader />}>
                  <AdminUsers />
                </Suspense>
              </ProtectedRoute>
            }
          />
          <Route
            path="jobseekers"
            element={
              <ProtectedRoute requiredRole="admin">
                <Suspense fallback={<PageLoader />}>
                  <AdminJobseekers />
                </Suspense>
              </ProtectedRoute>
            }
          />
          <Route
            path="jobs"
            element={
              <ProtectedRoute requiredRole="admin">
                <Suspense fallback={<PageLoader />}>
                  <AdminJobs />
                </Suspense>
              </ProtectedRoute>
            }
          />
          <Route
            path="skills"
            element={
              <ProtectedRoute requiredRole="admin">
                <Suspense fallback={<PageLoader />}>
                  <AdminSkills />
                </Suspense>
              </ProtectedRoute>
            }
          />
          <Route
            path="career-paths"
            element={
              <ProtectedRoute requiredRole="admin">
                <Suspense fallback={<PageLoader />}>
                  <AdminCareerPaths />
                </Suspense>
              </ProtectedRoute>
            }
          />
          <Route
            path="partners"
            element={
              <ProtectedRoute requiredRole="admin">
                <Suspense fallback={<PageLoader />}>
                  <AdminPartners />
                </Suspense>
              </ProtectedRoute>
            }
          />
          <Route
            path="testimonials"
            element={
              <ProtectedRoute requiredRole="admin">
                <Suspense fallback={<PageLoader />}>
                  <AdminTestimonials />
                </Suspense>
              </ProtectedRoute>
            }
          />
          <Route
            path="content"
            element={
              <ProtectedRoute requiredRole="admin">
                <Suspense fallback={<PageLoader />}>
                  <AdminContent />
                </Suspense>
              </ProtectedRoute>
            }
          />
          <Route
            path="insights"
            element={
              <ProtectedRoute requiredRole="admin">
                <Suspense fallback={<PageLoader />}>
                  <AdminInsights />
                </Suspense>
              </ProtectedRoute>
            }
          />
          <Route
            path="settings"
            element={
              <ProtectedRoute requiredRole="admin">
                <Suspense fallback={<PageLoader />}>
                  <AdminSettings />
                </Suspense>
              </ProtectedRoute>
            }
          />
          <Route
            path="profiles"
            element={
              <ProtectedRoute requiredRole="admin">
                <Suspense fallback={<PageLoader />}>
                  <AdminProfiles />
                </Suspense>
              </ProtectedRoute>
            }
          />
        </Route>

        {/* 404 */}
        <Route
          path="*"
          element={
            <Suspense fallback={<PageLoader />}>
              <NotFound />
            </Suspense>
          }
        />
      </Routes>
    </>
  );
};
