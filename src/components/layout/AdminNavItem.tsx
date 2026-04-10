
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface AdminNavItemProps {
  href: string;
  icon: LucideIcon;
  children: React.ReactNode;
  badge?: string;
}

const AdminNavItem = ({ href, icon: Icon, children, badge }: AdminNavItemProps) => {
  const location = useLocation();
  const isActive = location.pathname === href;

  return (
    <Link
      to={href}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:text-primary",
        isActive 
          ? "bg-muted text-primary" 
          : "text-muted-foreground"
      )}
    >
      <Icon className="h-4 w-4" />
      {children}
      {badge && (
        <span className="ml-auto rounded-full bg-primary px-2 py-1 text-xs text-primary-foreground">
          {badge}
        </span>
      )}
    </Link>
  );
};

export default AdminNavItem;
