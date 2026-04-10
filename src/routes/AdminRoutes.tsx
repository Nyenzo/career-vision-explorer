
import { Suspense } from "react";
import { Route } from "react-router-dom";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { PageLoader } from "./routeUtils";
import {
  AdminLogin,
  AdminDashboard,
  AdminUsers,
  AdminFreelancers,
  AdminJobseekers,
  AdminProfiles,
  AdminJobs,
  AdminSkills,
  AdminCareerPaths,
  AdminPartners,
  AdminTestimonials,
  AdminContent,
  AdminInsights,
  AdminAPI,
  AdminSettings,
  AdminInterviews
} from "./lazyImports";

export const adminRoutes = [
  <Route key="admin-login" path="/admin/login" element={
    <Suspense fallback={<PageLoader />}>
      <AdminLogin />
    </Suspense>
  } />,
  <Route key="admin-root" path="/admin" element={
    <ProtectedRoute requiredRole="admin">
      <Suspense fallback={<PageLoader />}>
        <AdminDashboard />
      </Suspense>
    </ProtectedRoute>
  } />,
  <Route key="admin-dashboard" path="/admin/dashboard" element={
    <ProtectedRoute requiredRole="admin">
      <Suspense fallback={<PageLoader />}>
        <AdminDashboard />
      </Suspense>
    </ProtectedRoute>
  } />,
  <Route key="admin-users" path="/admin/users" element={
    <ProtectedRoute requiredRole="admin">
      <Suspense fallback={<PageLoader />}>
        <AdminUsers />
      </Suspense>
    </ProtectedRoute>
  } />,
  <Route key="admin-freelancers" path="/admin/freelancers" element={
    <ProtectedRoute requiredRole="admin">
      <Suspense fallback={<PageLoader />}>
        <AdminFreelancers />
      </Suspense>
    </ProtectedRoute>
  } />,
  <Route key="admin-jobseeker" path="/admin/jobseeker" element={
    <ProtectedRoute requiredRole="admin">
      <Suspense fallback={<PageLoader />}>
        <AdminJobseekers />
      </Suspense>
    </ProtectedRoute>
  } />,
  <Route key="admin-profiles" path="/admin/profiles" element={
    <ProtectedRoute requiredRole="admin">
      <Suspense fallback={<PageLoader />}>
        <AdminProfiles />
      </Suspense>
    </ProtectedRoute>
  } />,
  <Route key="admin-jobs" path="/admin/jobs" element={
    <ProtectedRoute requiredRole="admin">
      <Suspense fallback={<PageLoader />}>
        <AdminJobs />
      </Suspense>
    </ProtectedRoute>
  } />,
  <Route key="admin-skills" path="/admin/skills" element={
    <ProtectedRoute requiredRole="admin">
      <Suspense fallback={<PageLoader />}>
        <AdminSkills />
      </Suspense>
    </ProtectedRoute>
  } />,
  <Route key="admin-career-paths" path="/admin/career-paths" element={
    <ProtectedRoute requiredRole="admin">
      <Suspense fallback={<PageLoader />}>
        <AdminCareerPaths />
      </Suspense>
    </ProtectedRoute>
  } />,
  <Route key="admin-partners" path="/admin/partners" element={
    <ProtectedRoute requiredRole="admin">
      <Suspense fallback={<PageLoader />}>
        <AdminPartners />
      </Suspense>
    </ProtectedRoute>
  } />,
  <Route key="admin-testimonials" path="/admin/testimonials" element={
    <ProtectedRoute requiredRole="admin">
      <Suspense fallback={<PageLoader />}>
        <AdminTestimonials />
      </Suspense>
    </ProtectedRoute>
  } />,
  <Route key="admin-content" path="/admin/content" element={
    <ProtectedRoute requiredRole="admin">
      <Suspense fallback={<PageLoader />}>
        <AdminContent />
      </Suspense>
    </ProtectedRoute>
  } />,
  <Route key="admin-insights" path="/admin/insights" element={
    <ProtectedRoute requiredRole="admin">
      <Suspense fallback={<PageLoader />}>
        <AdminInsights />
      </Suspense>
    </ProtectedRoute>
  } />,
  <Route key="admin-api" path="/admin/api" element={
    <ProtectedRoute requiredRole="admin">
      <Suspense fallback={<PageLoader />}>
        <AdminAPI />
      </Suspense>
    </ProtectedRoute>
  } />,
  <Route key="admin-settings" path="/admin/settings" element={
    <ProtectedRoute requiredRole="admin">
      <Suspense fallback={<PageLoader />}>
        <AdminSettings />
      </Suspense>
    </ProtectedRoute>
  } />,
  <Route key="admin-interviews" path="/admin/interviews" element={
    <ProtectedRoute requiredRole="admin">
      <Suspense fallback={<PageLoader />}>
        <AdminInterviews />
      </Suspense>
    </ProtectedRoute>
  } />
];
