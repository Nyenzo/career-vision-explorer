import { Routes, Route, Outlet } from "react-router-dom";
import { useEffect, lazy, Suspense } from "react";
import { useLocation } from "react-router-dom";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { PageLoaderSkeleton } from "@/components/ui/skeleton-loaders";

// Lazy load pages
const Index = lazy(() => import("@/pages/Index"));
const Login = lazy(() => import("@/pages/Login"));
const Signup = lazy(() => import("@/pages/Signup"));
const ForgotPassword = lazy(() => import("@/pages/ForgotPassword"));
const ResetPassword = lazy(() => import("@/pages/ResetPassword"));
const LinkedInCallback = lazy(() => import("@/pages/auth/LinkedInCallback"));
// const Notifications = lazy(() => import("@/pages/Notifications"));
const Jobs = lazy(() => import("@/pages/Jobs"));
const JobDetails = lazy(() => import("@/pages/JobDetails"));
const EmployerJobDetails = lazy(() => import("@/pages/employer/EmployerJobDetails"));
const EmployerEditJobPage = lazy(() => import("@/pages/employer/EmployerEditJobPage"));
const LegacyJobDetailsRedirect = lazy(() => import("@/pages/LegacyJobDetailsRedirect"));
const PublicProfile = lazy(() => import("@/pages/PublicProfile"));
const NotFound = lazy(() => import("@/pages/NotFound"));
const Profile = lazy(() => import("@/pages/Profile"));
const AccountManagement = lazy(() => import("@/pages/AccountManagement"));
const Privacy = lazy(() => import("@/pages/Privacy"));
const Terms = lazy(() => import("@/pages/Terms"));

// Employer
const EmployerDashboard = lazy(
  () => import("@/pages/employer/EmployerDashboard")
);
const EmployerJobs = lazy(() => import("@/pages/employer/EmployerJobs"));
const AllApplicants = lazy(() => import("@/pages/employer/AllApplicants"));

// Jobseeker
const JobSeekerDashboard = lazy(
  () => import("@/pages/jobseeker/JobSeekerDashboard")
);
const JobSeekerSettings = lazy(
  () => import("@/pages/jobseeker/JobSeekerSettings")
);
const SavedJobsPage = lazy(
  () => import("@/pages/jobseeker/SavedJobsPage")
);

// Loader
const PageLoader = () => <PageLoaderSkeleton />;

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
        <Route
          path="/forgot-password"
          element={
            <Suspense fallback={<PageLoader />}>
              <ForgotPassword />
            </Suspense>
          }
        />
        <Route
          path="/reset-password"
          element={
            <Suspense fallback={<PageLoader />}>
              <ResetPassword />
            </Suspense>
          }
        />
        <Route
          path="/auth/callback"
          element={
            <Suspense fallback={<PageLoader />}>
              <LinkedInCallback />
            </Suspense>
          }
        />
        <Route
          path="/auth/callback/:provider"
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
            path="jobs/:id"
            element={
              <ProtectedRoute requiredRole="employer">
                <Suspense fallback={<PageLoader />}>
                  <EmployerJobDetails />
                </Suspense>
              </ProtectedRoute>
            }
          />
          <Route
            path="jobs/:id/edit"
            element={
              <ProtectedRoute requiredRole="employer">
                <Suspense fallback={<PageLoader />}>
                  <EmployerEditJobPage />
                </Suspense>
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
          <Route
            path="jobs"
            element={
              <ProtectedRoute requiredRole="job_seeker">
                <Suspense fallback={<PageLoader />}>
                  <Jobs />
                </Suspense>
              </ProtectedRoute>
            }
          />
          <Route
            path="jobs/:id"
            element={
              <ProtectedRoute requiredRole="job_seeker">
                <Suspense fallback={<PageLoader />}>
                  <JobDetails />
                </Suspense>
              </ProtectedRoute>
            }
          />
          <Route
            path="saved-jobs"
            element={
              <ProtectedRoute requiredRole="job_seeker">
                <Suspense fallback={<PageLoader />}>
                  <SavedJobsPage />
                </Suspense>
              </ProtectedRoute>
            }
          />
        </Route>

        {/* General Protected Routes */}
        {/* /notifications route disabled — Notifications page not yet imported */}
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
          path="/account"
          element={
            <ProtectedRoute>
              <Suspense fallback={<PageLoader />}>
                <AccountManagement />
              </Suspense>
            </ProtectedRoute>
          }
        />

        <Route
          path="/jobs/:id"
          element={
            <ProtectedRoute>
              <Suspense fallback={<PageLoader />}>
                <LegacyJobDetailsRedirect />
              </Suspense>
            </ProtectedRoute>
          }
        />

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