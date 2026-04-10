
import { Suspense } from "react";
import { Route } from "react-router-dom";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { PageLoader } from "./routeUtils";
import {
  JobSeekerDashboard,
  JobSeekerSettings,
  Profile,
  Skills,
  CareerPaths,
  LearningPaths,
  Partners,
  FreelancerDashboard
} from "./lazyImports";

export const jobSeekerRoutes = [
  <Route key="jobseeker-dashboard" path="/jobseeker/dashboard" element={
    <ProtectedRoute requiredRole="jobseeker">
      <Suspense fallback={<PageLoader />}>
        <JobSeekerDashboard />
      </Suspense>
    </ProtectedRoute>
  } />,
  <Route key="jobseeker-settings" path="/jobseeker/settings" element={
    <ProtectedRoute requiredRole="jobseeker">
      <Suspense fallback={<PageLoader />}>
        <JobSeekerSettings />
      </Suspense>
    </ProtectedRoute>
  } />,
  <Route key="profile" path="/profile" element={
    <ProtectedRoute>
      <Suspense fallback={<PageLoader />}>
        <Profile />
      </Suspense>
    </ProtectedRoute>
  } />,
  <Route key="skills" path="/skills" element={
    <ProtectedRoute>
      <Suspense fallback={<PageLoader />}>
        <Skills />
      </Suspense>
    </ProtectedRoute>
  } />,
  <Route key="career-paths" path="/career-paths" element={
    <ProtectedRoute>
      <Suspense fallback={<PageLoader />}>
        <CareerPaths />
      </Suspense>
    </ProtectedRoute>
  } />,
  <Route key="learning-paths" path="/learning-paths" element={
    <ProtectedRoute>
      <Suspense fallback={<PageLoader />}>
        <LearningPaths />
      </Suspense>
    </ProtectedRoute>
  } />,
  <Route key="partners" path="/partners" element={
    <ProtectedRoute>
      <Suspense fallback={<PageLoader />}>
        <Partners />
      </Suspense>
    </ProtectedRoute>
  } />,
  <Route key="freelancer-dashboard" path="/freelancer/dashboard" element={
    <ProtectedRoute>
      <Suspense fallback={<PageLoader />}>
        <FreelancerDashboard />
      </Suspense>
    </ProtectedRoute>
  } />
];
