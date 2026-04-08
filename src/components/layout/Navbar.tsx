import { useState, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Menu,
  X,
  Shield,
  User,
  LogOut,
  ChevronDown,
  Home,
  Briefcase,
  LayoutDashboard,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import NotificationDropdown from "@/components/shared/NotificationDropdown";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [hovered, setHovered] = useState<string | null>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const prefersReducedMotion = useReducedMotion();

  const location = useLocation();
  const navigate = useNavigate();
  const { user, profile, isAuthenticated, logout } = useAuth();

  const toggleMenu = () => {
    const next = !isMenuOpen;
    setIsMenuOpen(next);
    if (!next) {
      setTimeout(() => menuButtonRef.current?.focus(), 100);
    }
  };

  const handleLogout = async () => {
    await logout();
    setIsMenuOpen(false);
    navigate("/");
  };

  const getDashboardUrl = () => {
    if (!user) return "/";
    const effectiveRole = profile?.active_role || user.account_type;
    switch (effectiveRole) {
      case "admin":
        return "/admin/dashboard";
      case "employer":
        return "/employer/dashboard";
      case "job_seeker":
        return "/jobseeker/dashboard";
      case "freelancer":
        return "/freelancer/dashboard";
      default:
        return "/";
    }
  };

  const effectiveRole = profile?.active_role || user?.account_type;
  const isJobSeekerUser = effectiveRole === "job_seeker";
  const isEmployerUser = effectiveRole === "employer";
  const isFreelancerUser = effectiveRole === "freelancer";
  const isActive = (path: string) => location.pathname === path;

  const jobSeekerIcons = [
    { name: "Home", icon: Home, path: "/" },
    { name: "Dashboard", icon: LayoutDashboard, path: "/jobseeker/dashboard" },
    { name: "Jobs", icon: Briefcase, path: "/jobs" },
    { name: "Profile", icon: User, path: "/profile" },
  ];

  const employerNavItems = [
    { name: "Freelancers", href: "/freelancers" },
    { name: "Jobs", href: "/employer/jobs" },
  ];

  const freelancerNavItems = [
    { name: "Jobs", href: "/jobs" },
  ];

  return (
    <nav className="bg-background/95 backdrop-blur sticky top-0 z-50 w-full border-b border-border/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2">
              <img
                src="/lovable-uploads/favicon.ico.jpg"
                alt="Visiondrill Logo"
                className="h-8 w-8 object-contain"
              />
              <span className="text-xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                Visiondrill
              </span>
            </Link>
          </div>

          {/* Desktop Center Nav - Employer */}
          <div className="hidden md:flex md:items-center md:justify-center flex-1">
            {isAuthenticated &&
              isEmployerUser &&
              employerNavItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isActive(item.href)
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                    }`}
                >
                  {item.name}
                </Link>
              ))}
          </div>

          {/* Desktop Right */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated && (
              <>
                <NotificationDropdown />

                {isJobSeekerUser && (
                  <Link
                    to="/jobs"
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isActive("/jobs")
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                      }`}
                  >
                    Jobs
                  </Link>
                )}

                {isFreelancerUser &&
                  freelancerNavItems.map((item) => (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isActive(item.href)
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                        }`}
                    >
                      {item.name}
                    </Link>
                  ))}

                <Link
                  to={getDashboardUrl()}
                  className="px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:bg-accent"
                >
                  Dashboard
                </Link>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <User className="h-4 w-4 mr-1" />
                      {user?.name}
                      <ChevronDown className="h-4 w-4 ml-1" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => navigate("/profile")}>
                      Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate("/account")}>
                      Account Settings
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={handleLogout}
                      className="text-red-600"
                    >
                      Log out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            )}

            {!isAuthenticated && (
              <>
                <Link to="/login">
                  <Button variant="ghost" size="sm">
                    Log in
                  </Button>
                </Link>
                <Link to="/signup">
                  <Button size="sm">Sign up</Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Actions */}
          <div className="flex md:hidden items-center gap-1">
            {isAuthenticated && <NotificationDropdown />}
            <button
              ref={menuButtonRef}
              onClick={toggleMenu}
              aria-label={isMenuOpen ? "Close navigation menu" : "Open navigation menu"}
              aria-expanded={isMenuOpen}
              aria-controls="mobile-nav-menu"
              className="p-2 rounded-md hover:bg-accent transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              {isMenuOpen ? <X size={24} aria-hidden="true" /> : <Menu size={24} aria-hidden="true" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            id="mobile-nav-menu"
            role="navigation"
            aria-label="Mobile navigation"
            initial={{ opacity: 0, y: prefersReducedMotion ? 0 : -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: prefersReducedMotion ? 0 : -10 }}
            transition={{ duration: prefersReducedMotion ? 0 : 0.2 }}
            className="md:hidden bg-background border-t border-border/40 px-4 py-4 space-y-3"
          >
            {isAuthenticated ? (
              <>
                {isEmployerUser &&
                  employerNavItems.map((item) => (
                    <Link
                      key={item.name}
                      to={item.href}
                      onClick={() => setIsMenuOpen(false)}
                      className="block px-3 py-2 rounded-md text-sm font-medium hover:bg-accent"
                    >
                      {item.name}
                    </Link>
                  ))}

                {isFreelancerUser &&
                  freelancerNavItems.map((item) => (
                    <Link
                      key={item.name}
                      to={item.href}
                      onClick={() => setIsMenuOpen(false)}
                      className="block px-3 py-2 rounded-md text-sm font-medium hover:bg-accent"
                    >
                      {item.name}
                    </Link>
                  ))}

                {isJobSeekerUser &&
                  jobSeekerIcons.map((item) => (
                    <Link
                      key={item.name}
                      to={item.path}
                      onClick={() => setIsMenuOpen(false)}
                      className="block px-3 py-2 rounded-md text-sm font-medium hover:bg-accent"
                    >
                      {item.name}
                    </Link>
                  ))}

                <Link
                  to="/account"
                  onClick={() => setIsMenuOpen(false)}
                  className="block px-3 py-2 rounded-md text-sm font-medium hover:bg-accent"
                >
                  Account Settings
                </Link>

                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-3 py-2 rounded-md text-sm font-medium text-red-600 hover:bg-accent"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={() => setIsMenuOpen(false)}
                  className="block px-3 py-2 rounded-md text-sm font-medium hover:bg-accent"
                >
                  Log in
                </Link>
                <Link
                  to="/signup"
                  onClick={() => setIsMenuOpen(false)}
                  className="block px-3 py-2 rounded-md text-sm font-medium hover:bg-accent"
                >
                  Sign up
                </Link>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
