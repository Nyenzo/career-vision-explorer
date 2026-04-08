
import { Suspense } from "react";
import { Route } from "react-router-dom";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { PageLoader } from "./routeUtils";
import {
  EmployerDashboard,
  EmployerJobs,
  JobApplicants,
  AllApplicants,
  EmployerInterviews
} from "./lazyImports";

export const employerRoutes = [
  <Route key="employer-dashboard" path="/employer/dashboard" element={
    <ProtectedRoute requiredRole="employer">
      <Suspense fallback={<PageLoader />}>
        <EmployerDashboard />
      </Suspense>
    </ProtectedRoute>
  } />,
  <Route key="employer-jobs" path="/employer/jobs" element={
    <ProtectedRoute requiredRole="employer">
      <Suspense fallback={<PageLoader />}>
        <EmployerJobs />
      </Suspense>
    </ProtectedRoute>
  } />,
  <Route key="job-applicants" path="/employer/jobs/:id/applicants" element={
    <ProtectedRoute requiredRole="employer">
      <Suspense fallback={<PageLoader />}>
        <JobApplicants />
      </Suspense>
    </ProtectedRoute>
  } />,
  <Route key="all-applicants" path="/employer/applicants" element={
    <ProtectedRoute requiredRole="employer">
      <Suspense fallback={<PageLoader />}>
        <AllApplicants />
      </Suspense>
    </ProtectedRoute>
  } />,
  <Route key="employer-interviews" path="/employer/interviews" element={
    <ProtectedRoute requiredRole="employer">
      <Suspense fallback={<PageLoader />}>
        <EmployerInterviews />
      </Suspense>
    </ProtectedRoute>
  } />
];
