
import { Suspense } from "react";
import { Route } from "react-router-dom";
import { PageLoader } from "./routeUtils";
import {
  Index,
  Login,
  Signup,
  PublicProfile,
  Jobs,
  JobDetails,
  About,
  Blog,
  Help,
  Contact,
  FAQ,
  Privacy,
  Terms,
  FreelancerProfile,
  VideoMeeting
} from "./lazyImports";

export const publicRoutes = [
  <Route key="index" path="/" element={
    <Suspense fallback={<PageLoader />}>
      <Index />
    </Suspense>
  } />,
  <Route key="login" path="/login" element={
    <Suspense fallback={<PageLoader />}>
      <Login />
    </Suspense>
  } />,
  <Route key="signup" path="/signup" element={
    <Suspense fallback={<PageLoader />}>
      <Signup />
    </Suspense>
  } />,
  <Route key="profile-public" path="/profile/:id" element={
    <Suspense fallback={<PageLoader />}>
      <PublicProfile />
    </Suspense>
  } />,
  <Route key="jobs" path="/jobs" element={
    <Suspense fallback={<PageLoader />}>
      <Jobs />
    </Suspense>
  } />,
  <Route key="job-details" path="/jobs/:id" element={
    <Suspense fallback={<PageLoader />}>
      <JobDetails />
    </Suspense>
  } />,
  <Route key="about" path="/about" element={
    <Suspense fallback={<PageLoader />}>
      <About />
    </Suspense>
  } />,
  <Route key="blog" path="/blog" element={
    <Suspense fallback={<PageLoader />}>
      <Blog />
    </Suspense>
  } />,
  <Route key="help" path="/help" element={
    <Suspense fallback={<PageLoader />}>
      <Help />
    </Suspense>
  } />,
  <Route key="contact" path="/contact" element={
    <Suspense fallback={<PageLoader />}>
      <Contact />
    </Suspense>
  } />,
  <Route key="faq" path="/faq" element={
    <Suspense fallback={<PageLoader />}>
      <FAQ />
    </Suspense>
  } />,
  <Route key="privacy" path="/privacy" element={
    <Suspense fallback={<PageLoader />}>
      <Privacy />
    </Suspense>
  } />,
  <Route key="terms" path="/terms" element={
    <Suspense fallback={<PageLoader />}>
      <Terms />
    </Suspense>
  } />,
  <Route key="video-meeting" path="/meeting/:interviewId" element={
    <Suspense fallback={<PageLoader />}>
      <VideoMeeting />
    </Suspense>
  } />,
  <Route key="freelancer-profile" path="/freelancer/:id" element={
    <Suspense fallback={<PageLoader />}>
      <FreelancerProfile />
    </Suspense>
  } />
];
