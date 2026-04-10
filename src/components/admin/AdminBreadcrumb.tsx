
import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Home } from "lucide-react";

export const AdminBreadcrumb = () => {
  const location = useLocation();
  const pathSegments = location.pathname.split("/").filter(Boolean);
  
  // Skip rendering breadcrumbs on main dashboard pages
  if (
    location.pathname === "/admin" ||
    location.pathname === "/employer/dashboard" ||
    location.pathname === "/jobseeker/dashboard"
  ) {
    return null;
  }
  
  // Generate human-readable names for path segments
  const getReadableName = (segment: string): string => {
    // Convert kebab-case or camelCase to Title Case with spaces
    return segment
      .replace(/[-_]/g, " ") // Replace hyphens and underscores with spaces
      .replace(/([a-z])([A-Z])/g, "$1 $2") // Insert space between camelCase words
      .replace(/\b\w/g, (c) => c.toUpperCase()); // Capitalize first letter of each word
  };
  
  // Determine the base path and name based on the first segment
  let basePath = "";
  let baseName = "";
  
  if (pathSegments[0] === "admin") {
    basePath = "/admin";
    baseName = "Admin";
  } else if (pathSegments[0] === "employer") {
    basePath = "/employer/dashboard";
    baseName = "Employer";
  } else if (pathSegments[0] === "jobseeker") {
    basePath = "/jobseeker/dashboard";
    baseName = "Job Seeker";
  }
  
  return (
    <Breadcrumb className="mb-6">
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link to="/">
              <Home className="h-4 w-4" />
            </Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        
        {/* Base path (admin, employer, jobseeker) */}
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link to={basePath}>{baseName}</Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
        
        {/* Additional path segments */}
        {pathSegments.slice(pathSegments[0] === "employer" || pathSegments[0] === "jobseeker" ? 2 : 1).map((segment, index, array) => {
          const isLast = index === array.length - 1;
          // Build the path up to this segment
          const currentPath = `/${pathSegments.slice(0, (pathSegments[0] === "employer" || pathSegments[0] === "jobseeker" ? 2 : 1) + index + 1).join("/")}`;
          
          return (
            <React.Fragment key={segment}>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                {isLast ? (
                  <BreadcrumbPage>{getReadableName(segment)}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink asChild>
                    <Link to={currentPath}>{getReadableName(segment)}</Link>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
            </React.Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
};
