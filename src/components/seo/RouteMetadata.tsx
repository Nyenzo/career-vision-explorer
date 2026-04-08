import { useEffect } from "react";
import { useLocation } from "react-router-dom";

type RouteMeta = {
  title: string;
  description: string;
};

const SITE_NAME = "Visiondrill";
const DEFAULT_DESCRIPTION =
  "Visiondrill helps job seekers, employers, and freelancers navigate hiring, matching, and career growth.";

const ROUTE_METADATA: Record<string, RouteMeta> = {
  "/": {
    title: `${SITE_NAME} | Career Exploration and Job Matching`,
    description: DEFAULT_DESCRIPTION,
  },
  "/jobs": {
    title: `Jobs | ${SITE_NAME}`,
    description: "Browse job opportunities, filter by role, and discover the best matches for your profile.",
  },
  "/career-paths": {
    title: `Career Paths | ${SITE_NAME}`,
    description: "Explore career paths and skills needed to grow in your target role.",
  },
  "/job-matching": {
    title: `Job Matching | ${SITE_NAME}`,
    description: "Get personalized job matches based on your profile and skills.",
  },
  "/login": {
    title: `Login | ${SITE_NAME}`,
    description: "Sign in to your Visiondrill account.",
  },
  "/signup": {
    title: `Sign Up | ${SITE_NAME}`,
    description: "Create your Visiondrill account to access personalized career tools.",
  },
};

const ensureMetaTag = (name: string): HTMLMetaElement => {
  let element = document.head.querySelector(`meta[name="${name}"]`) as
    | HTMLMetaElement
    | null;

  if (!element) {
    element = document.createElement("meta");
    element.setAttribute("name", name);
    document.head.appendChild(element);
  }

  return element;
};

const ensureCanonicalTag = (): HTMLLinkElement => {
  let element = document.head.querySelector("link[rel=\"canonical\"]") as
    | HTMLLinkElement
    | null;

  if (!element) {
    element = document.createElement("link");
    element.setAttribute("rel", "canonical");
    document.head.appendChild(element);
  }

  return element;
};

const resolveMetaForPath = (pathname: string): RouteMeta => {
  if (ROUTE_METADATA[pathname]) {
    return ROUTE_METADATA[pathname];
  }

  if (pathname.startsWith("/jobs/")) {
    return {
      title: `Job Details | ${SITE_NAME}`,
      description: "Review job details and required skills before applying.",
    };
  }

  if (pathname.startsWith("/profile/")) {
    return {
      title: `Public Profile | ${SITE_NAME}`,
      description: "View professional profile details and expertise.",
    };
  }

  return {
    title: `${SITE_NAME}`,
    description: DEFAULT_DESCRIPTION,
  };
};

export const RouteMetadata = () => {
  const location = useLocation();

  useEffect(() => {
    const { pathname } = location;
    const routeMeta = resolveMetaForPath(pathname);

    document.title = routeMeta.title;

    const descriptionTag = ensureMetaTag("description");
    descriptionTag.setAttribute("content", routeMeta.description);

    const canonicalTag = ensureCanonicalTag();
    canonicalTag.setAttribute(
      "href",
      `${window.location.origin}${pathname || "/"}`
    );
  }, [location]);

  return null;
};
