import { Routes, Route } from "react-router-dom";
import { useEffect, lazy, Suspense } from "react";
import { useLocation } from "react-router-dom";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { Skeleton } from "@/components/ui/skeleton";

// Lazy load major pages
const Index = lazy(() => import("@/pages/Index"));
const Login = lazy(() => import("@/pages/Login"));
const Signup = lazy(() => import("@/pages/Signup"));
const Jobs = lazy(() => import("@/pages/Jobs"));
const JobDetails = lazy(() => import("@/pages/JobDetails"));
const PublicProfile = lazy(() => import("@/pages/PublicProfile"));
const NotFound = lazy(() => import("@/pages/NotFound"));
const Profile = lazy(() => import("@/pages/Profile"));
const Skills = lazy(() => import("@/pages/Skills"));
const CareerPaths = lazy(() => import("@/pages/CareerPaths"));

// Lazy load admin pages
const AdminLogin = lazy(() => import("@/pages/admin/AdminLogin"));
const AdminDashboard = lazy(() => import("@/pages/admin/AdminDashboard"));
const JobSeekerDashboard = lazy(
  () => import("@/pages/jobseeker/JobSeekerDashboard")
);
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

// Lazy load employer pages
const EmployerDashboard = lazy(
  () => import("@/pages/employer/EmployerDashboard")
);
const EmployerJobs = lazy(() => import("@/pages/employer/EmployerJobs"));
const JobApplicants = lazy(() => import("@/pages/employer/JobApplicants"));
const AllApplicants = lazy(() => import("@/pages/employer/AllApplicants"));
const EmployerInterviews = lazy(
  () => import("@/pages/employer/EmployerInterviews")
);
const InterviewSchedule = lazy(
  () => import("@/pages/employer/InterviewSchedule")
);
const EmployerBoostingServices = lazy(
  () => import("@/pages/BoostingServicesPage")
); // <--- new

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
const JobSeekerSettings = lazy(
  () => import("@/pages/jobseeker/JobSeekerSettings")
);

// Lightweight page loader
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

// Scroll to top on route change
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
        <Route
          path="/"
          element={
            <Suspense fallback={<PageLoader />}>
              <Index />
            </Suspense>
          }
        />
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
        <Route
          path="/profile/:id"
          element={
            <Suspense fallback={<PageLoader />}>
              <PublicProfile />
            </Suspense>
          }
        />
        <Route
          path="/jobs"
          element={
            <Suspense fallback={<PageLoader />}>
              <Jobs />
            </Suspense>
          }
        />
        <Route
          path="/jobs/:id"
          element={
            <Suspense fallback={<PageLoader />}>
              <JobDetails />
            </Suspense>
          }
        />
        <Route
          path="/about"
          element={
            <Suspense fallback={<PageLoader />}>
              <About />
            </Suspense>
          }
        />
        <Route
          path="/blog"
          element={
            <Suspense fallback={<PageLoader />}>
              <Blog />
            </Suspense>
          }
        />
        <Route
          path="/help"
          element={
            <Suspense fallback={<PageLoader />}>
              <Help />
            </Suspense>
          }
        />
        <Route
          path="/contact"
          element={
            <Suspense fallback={<PageLoader />}>
              <Contact />
            </Suspense>
          }
        />
        <Route
          path="/faq"
          element={
            <Suspense fallback={<PageLoader />}>
              <FAQ />
            </Suspense>
          }
        />
        <Route
          path="/privacy"
          element={
            <Suspense fallback={<PageLoader />}>
              <Privacy />
            </Suspense>
          }
        />
        <Route
          path="/terms"
          element={
            <Suspense fallback={<PageLoader />}>
              <Terms />
            </Suspense>
          }
        />

        {/* Admin Routes */}
        <Route
          path="/admin/login"
          element={
            <Suspense fallback={<PageLoader />}>
              <AdminLogin />
            </Suspense>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute requiredRole="admin">
              <Suspense fallback={<PageLoader />}>
                <AdminDashboard />
              </Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute requiredRole="admin">
              <Suspense fallback={<PageLoader />}>
                <AdminDashboard />
              </Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <ProtectedRoute requiredRole="admin">
              <Suspense fallback={<PageLoader />}>
                <AdminUsers />
              </Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/jobseeker"
          element={
            <ProtectedRoute requiredRole="admin">
              <Suspense fallback={<PageLoader />}>
                <AdminJobseekers />
              </Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/profiles"
          element={
            <ProtectedRoute requiredRole="admin">
              <Suspense fallback={<PageLoader />}>
                <AdminProfiles />
              </Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/jobs"
          element={
            <ProtectedRoute requiredRole="admin">
              <Suspense fallback={<PageLoader />}>
                <AdminJobs />
              </Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/skills"
          element={
            <ProtectedRoute requiredRole="admin">
              <Suspense fallback={<PageLoader />}>
                <AdminSkills />
              </Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/career-paths"
          element={
            <ProtectedRoute requiredRole="admin">
              <Suspense fallback={<PageLoader />}>
                <AdminCareerPaths />
              </Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/partners"
          element={
            <ProtectedRoute requiredRole="admin">
              <Suspense fallback={<PageLoader />}>
                <AdminPartners />
              </Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/testimonials"
          element={
            <ProtectedRoute requiredRole="admin">
              <Suspense fallback={<PageLoader />}>
                <AdminTestimonials />
              </Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/content"
          element={
            <ProtectedRoute requiredRole="admin">
              <Suspense fallback={<PageLoader />}>
                <AdminContent />
              </Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/insights"
          element={
            <ProtectedRoute requiredRole="admin">
              <Suspense fallback={<PageLoader />}>
                <AdminInsights />
              </Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/api"
          element={
            <ProtectedRoute requiredRole="admin">
              <Suspense fallback={<PageLoader />}>
                <AdminAPI />
              </Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/settings"
          element={
            <ProtectedRoute requiredRole="admin">
              <Suspense fallback={<PageLoader />}>
                <AdminSettings />
              </Suspense>
            </ProtectedRoute>
          }
        />

        {/* Employer Routes */}
        <Route
          path="/employer/dashboard"
          element={
            <ProtectedRoute requiredRole="employer">
              <Suspense fallback={<PageLoader />}>
                <EmployerDashboard />
              </Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path="/employer/jobs"
          element={
            <ProtectedRoute requiredRole="employer">
              <Suspense fallback={<PageLoader />}>
                <EmployerJobs />
              </Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path="/employer/jobs/:id/applicants"
          element={
            <ProtectedRoute requiredRole="employer">
              <Suspense fallback={<PageLoader />}>
                <JobApplicants />
              </Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path="/employer/applicants"
          element={
            <ProtectedRoute requiredRole="employer">
              <Suspense fallback={<PageLoader />}>
                <AllApplicants />
              </Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path="/employer/interviews"
          element={
            <ProtectedRoute requiredRole="employer">
              <Suspense fallback={<PageLoader />}>
                <EmployerInterviews />
              </Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path="/employer/interviews/schedule"
          element={
            <ProtectedRoute requiredRole="employer">
              <Suspense fallback={<PageLoader />}>
                <InterviewSchedule />
              </Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path="/employer/boosting-services"
          element={
            <ProtectedRoute requiredRole="employer">
              <Suspense fallback={<PageLoader />}>
                <EmployerBoostingServices />
              </Suspense>
            </ProtectedRoute>
          }
        />

        {/* Job Seeker Protected Routes */}
        <Route
          path="/jobseeker/dashboard"
          element={
            <ProtectedRoute requiredRole="jobseeker">
              <Suspense fallback={<PageLoader />}>
                <JobSeekerDashboard />
              </Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path="/jobseeker/settings"
          element={
            <ProtectedRoute requiredRole="jobseeker">
              <Suspense fallback={<PageLoader />}>
                <JobSeekerSettings />
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
        <Route
          path="/skills"
          element={
            <ProtectedRoute>
              <Suspense fallback={<PageLoader />}>
                <Skills />
              </Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path="/career-paths"
          element={
            <ProtectedRoute>
              <Suspense fallback={<PageLoader />}>
                <CareerPaths />
              </Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path="/learning-paths"
          element={
            <ProtectedRoute>
              <Suspense fallback={<PageLoader />}>
                <LearningPaths />
              </Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path="/partners"
          element={
            <ProtectedRoute>
              <Suspense fallback={<PageLoader />}>
                <Partners />
              </Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path="/insights"
          element={
            <ProtectedRoute>
              <Suspense fallback={<PageLoader />}>
                <Insights />
              </Suspense>
            </ProtectedRoute>
          }
        />

        {/* Catch-all 404 */}
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
