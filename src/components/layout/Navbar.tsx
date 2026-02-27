import { useState } from "react";
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
import { motion, AnimatePresence } from "framer-motion";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [hovered, setHovered] = useState<string | null>(null);

  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const handleLogout = () => {
    logout();
    setIsMenuOpen(false);
    navigate("/");
  };

  const getDashboardUrl = () => {
    if (!user) return "/";
    switch (user.account_type) {
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

  const isJobSeekerUser = user?.account_type === "job_seeker";
  const isEmployerUser = user?.account_type === "employer";
  const isActive = (path: string) => location.pathname === path;

  const jobSeekerIcons = [
    { name: "Home", icon: Home, path: "/" },
    { name: "Jobs", icon: Briefcase, path: "/jobs" },
    { name: "Profile", icon: User, path: "/jobseeker/dashboard" },
  ];

  const employerNavItems = [
    { name: "Freelancers", href: "/freelancers" },
    { name: "Insights", href: "/insights" },
    { name: "Jobs", href: "/employer/jobs" },
    { name: "Projects", href: "/employer/projects" },
    { name: "Boosting Services", href: "/employer/boosting-services" },
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
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive(item.href)
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

                {!isJobSeekerUser && (
                  <Link
                    to={getDashboardUrl()}
                    className="px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:bg-accent"
                  >
                    Dashboard
                  </Link>
                )}

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

          {/* Mobile Toggle */}
          <div className="flex md:hidden items-center">
            <button
              onClick={toggleMenu}
              className="p-2 rounded-md hover:bg-accent transition"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
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
