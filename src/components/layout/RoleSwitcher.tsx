import React, { useState } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
  Briefcase,
  UserCircle,
  Check,
  Loader2,
  ChevronDown
} from "lucide-react";
import { roleService } from "@/services/role.service";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";

export function RoleSwitcher() {
  const { user, profile, refreshProfile } = useAuth();
  const [switching, setSwitching] = useState(false);

  const normalizeRole = (role?: string) => {
    if (!role) return "";
    const normalized = role.trim().toLowerCase().replace(/[-\s]+/g, "_");
    if (normalized === "jobseeker") return "job_seeker";
    return normalized;
  };

  const getRoleDashboardPath = (role: string) => {
    const normalizedRole = normalizeRole(role);
    if (normalizedRole === "job_seeker") return "/jobseeker/dashboard";
    if (normalizedRole === "employer") return "/employer/dashboard";
    return "/";
  };

  // Derive roles locally from the auth context — no API call needed.
  // active_role comes from profile if available, otherwise fall back to user.account_type.
  const activeRole = normalizeRole(profile?.active_role || user?.account_type || "");

  // Build list of available roles from profile.roles or just the user's single account type.
  const availableRoles: string[] = profile?.roles
    ? (profile.roles as string[]).map(normalizeRole).filter(Boolean)
    : activeRole
      ? [activeRole]
      : [];

  const handleSwitchRole = async (role: string) => {
    const normalizedTargetRole = normalizeRole(role);
    if (normalizedTargetRole === activeRole) return;

    try {
      setSwitching(true);
      const result = await roleService.switchRole(normalizedTargetRole);
      toast.success(result.message || "Role switched successfully");

      // Refresh auth profile to get updated role from backend
      await refreshProfile();

      // Force reload so role-aware guards and navigation pick up the latest state.
      window.location.href = getRoleDashboardPath(normalizedTargetRole);
    } catch (error) {
      toast.error("Failed to switch role");
      console.error("Role switch error:", error);
    } finally {
      setSwitching(false);
    }
  };

  // Don't render if no user or only one role (nothing to switch)
  if (!user || availableRoles.length <= 1) {
    return null;
  }

  const getRoleIcon = (role: string) => {
    const normalizedRole = normalizeRole(role);
    return normalizedRole === "employer"
      ? <Briefcase className="w-4 h-4" />
      : <UserCircle className="w-4 h-4" />;
  };

  const getRoleLabel = (role: string) => {
    const normalizedRole = normalizeRole(role);
    return normalizedRole === "job_seeker"
      ? "Job Seeker"
      : normalizedRole === "employer"
        ? "Employer"
        : role;
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="flex items-center gap-1 px-2"
          data-testid="role-switcher-trigger"
          disabled={switching}
        >
          {switching
            ? <Loader2 className="w-4 h-4 animate-spin" />
            : getRoleIcon(activeRole)
          }
          <span className="hidden sm:inline">{getRoleLabel(activeRole)}</span>
          <ChevronDown className="w-4 h-4 ml-1" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Switch Role</DropdownMenuLabel>
        <DropdownMenuSeparator />

        {availableRoles.map((role) => (
          <DropdownMenuItem
            key={role}
            onClick={() => handleSwitchRole(role)}
            disabled={switching || role === activeRole}
            data-testid={`role-option-${role}`}
            className="flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              {getRoleIcon(role)}
              <span>{getRoleLabel(role)}</span>
            </div>
            {role === activeRole && <Check className="w-4 h-4 text-green-500" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
