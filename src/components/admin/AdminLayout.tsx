import { ReactNode, useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { 
  LayoutDashboard, Users, Briefcase, BookOpen, BarChart, Settings, 
  MessageSquare, FileText, LogOut, Menu, X, Home, TrendingUp, Building, Code
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { AdminBreadcrumb } from "./AdminBreadcrumb";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";

interface AdminLayoutProps {
  children: ReactNode;
}

const AdminLayout = ({ children }: AdminLayoutProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);
  const { user, logout } = useAuth();

  useEffect(() => {
    setSidebarOpen(!isMobile);
  }, [isMobile]);

  const navigationItems = [
    { name: "Dashboard", icon: LayoutDashboard, href: "/admin/dashboard" },
    { name: "Users", icon: Users, href: "/admin/users" },
    { name: "Jobs", icon: Briefcase, href: "/admin/jobs" },
    { name: "Career Paths", icon: BookOpen, href: "/admin/career-paths" },
    { name: "Skills", icon: BarChart, href: "/admin/skills" },
    { name: "Partners", icon: Building, href: "/admin/partners" },
    { name: "Insights", icon: TrendingUp, href: "/admin/insights" },
    { name: "API", icon: Code, href: "/admin/api" },
    { name: "Testimonials", icon: MessageSquare, href: "/admin/testimonials" },
    { name: "Content", icon: FileText, href: "/admin/content" },
    { name: "Settings", icon: Settings, href: "/admin/settings" },
  ];
  
  const isActiveRoute = (path: string) => {
    if (path === "/admin/dashboard" && (location.pathname === "/admin" || location.pathname === "/admin/dashboard")) {
      return true;
    }
    return location.pathname.startsWith(path) && path !== "/admin/dashboard";
  };

  const handleExitAdmin = () => {
    toast({
      title: "Exiting Admin Panel",
      description: "Returning to the main site",
    });
    navigate('/');
  };
  
  const handleLogout = () => {
    logout();
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out",
    });
    navigate('/admin/login');
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 to-blue-50/30">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && isMobile && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Mobile sidebar toggle */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button 
          variant="outline" 
          size="icon" 
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="bg-white/90 backdrop-blur-sm shadow-lg hover:shadow-xl border-white/20 hover:bg-white"
        >
          {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </Button>
      </div>

      {/* Sidebar */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-40 w-72 bg-white/95 backdrop-blur-lg border-r border-gray-200/50 transition-transform duration-300 ease-in-out lg:translate-x-0 shadow-2xl",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-center h-20 border-b border-gray-200/50 bg-gradient-to-r from-blue-600 to-purple-600">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-white">
                Visiondrill
              </h1>
              <p className="text-xs text-blue-100 font-medium">Admin Panel</p>
            </div>
          </div>
          
          {/* User Info */}
          <div className="flex items-center px-6 py-4 border-b border-gray-200/50 bg-gradient-to-r from-gray-50 to-blue-50/30">
            <div className="flex items-center space-x-3">
              <div className="h-12 w-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center shadow-lg">
                <Users className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">{user?.name || "Admin User"}</p>
                <p className="text-xs text-gray-500 capitalize bg-gray-100 px-2 py-1 rounded-full">{user?.role || "admin"}</p>
              </div>
            </div>
          </div>
          
          {/* Navigation */}
          <div className="flex-1 overflow-y-auto py-6">
            <nav className="px-4 space-y-2">
              {navigationItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={cn(
                    "flex items-center px-4 py-3 text-sm rounded-xl transition-all duration-200 group",
                    isActiveRoute(item.href)
                      ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg transform scale-[1.02]"
                      : "text-gray-600 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 hover:text-blue-600 hover:shadow-md hover:transform hover:scale-[1.01]"
                  )}
                >
                  <item.icon className={cn(
                    "mr-3 h-5 w-5 transition-transform duration-200",
                    isActiveRoute(item.href) ? "text-white" : "text-gray-400 group-hover:text-blue-500"
                  )} />
                  <span className="font-medium">{item.name}</span>
                </Link>
              ))}
            </nav>
          </div>
          
          {/* Footer Actions */}
          <div className="p-4 border-t border-gray-200/50 space-y-2 bg-gradient-to-r from-gray-50 to-blue-50/30">
            <Button 
              variant="outline" 
              className="w-full justify-start bg-white/80 hover:bg-white border-gray-200 hover:border-blue-300 text-gray-700 hover:text-blue-600 transition-all duration-200"
              onClick={handleExitAdmin}
            >
              <Home className="mr-3 h-4 w-4" />
              Back to Site
            </Button>
            
            <Button 
              variant="outline" 
              className="w-full justify-start bg-white/80 hover:bg-red-50 border-gray-200 hover:border-red-300 text-gray-700 hover:text-red-600 transition-all duration-200"
              onClick={handleLogout}
            >
              <LogOut className="mr-3 h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </div>
      
      {/* Main content */}
      <div className={cn(
        "flex-1 transition-all duration-300",
        sidebarOpen ? "lg:ml-72" : "ml-0"
      )}>
        <main className="h-full overflow-y-auto">
          <div className="p-6">
            <AdminBreadcrumb />
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8 mt-6 min-h-[600px]">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
