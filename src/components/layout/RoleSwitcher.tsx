import React, { useState, useEffect } from 'react';
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
  Plus,
  Check,
  Loader2,
  ChevronDown
} from "lucide-react";
import { roleService, UserRoles } from "@/services/role.service";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";

export function RoleSwitcher() {
  const { user, refreshProfile } = useAuth();
  const [roles, setRoles] = useState<UserRoles | null>(null);
  const [loading, setLoading] = useState(false);
  const [switching, setSwitching] = useState(false);

  const normalizeRole = (role?: string) => {
    if (!role) return "";
    const normalized = role.trim().toLowerCase().replace(/[-\s]+/g, "_");
    if (normalized === "jobseeker") return "job_seeker";
    return normalized;
  };

  const getRoleDashboardPath = (role: string) => {
    const normalizedRole = normalizeRole(role);
    if (normalizedRole === "freelancer") return "/freelancer/dashboard";
    if (normalizedRole === "job_seeker") return "/jobseeker/dashboard";
    if (normalizedRole === "employer") return "/employer/dashboard";
    if (normalizedRole === "admin") return "/admin/dashboard";
    return "/";
  };

  useEffect(() => {
    if (user) {
      loadRoles();
    }
  }, [user]);

  const loadRoles = async () => {
    try {
      setLoading(true);
      const userRoles = await roleService.getMyRoles();
      setRoles(userRoles);
    } catch (error) {
      console.error('Failed to load roles:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSwitchRole = async (role: string) => {
    const normalizedTargetRole = normalizeRole(role);
    const normalizedCurrentRole = normalizeRole(roles?.active_role || user?.account_type);
    if (normalizedTargetRole === normalizedCurrentRole) return;

    try {
      setSwitching(true);
      console.log('RoleSwitcher: Switching to role:', normalizedTargetRole);
      const result = await roleService.switchRole(normalizedTargetRole);
      console.log('RoleSwitcher: Switch result:', result);
      toast.success(result.message);

      // Reload roles
      await loadRoles();

      // Refresh auth profile to get updated role from backend
      await refreshProfile();

      // Force reload so role-aware guards and nav pick up the latest auth/profile state.
      window.location.href = getRoleDashboardPath(normalizedTargetRole);
    } catch (error) {
      toast.error('Failed to switch role');
      console.error('Role switch error:', error);
    } finally {
      setSwitching(false);
    }
  };

  const handleAddRole = async () => {
    // Determine which role to add based on current role
    const currentRole = normalizeRole(roles?.active_role || user?.account_type);
    const newRole = currentRole === 'job_seeker' ? 'freelancer' : 'job_seeker';

    try {
      setSwitching(true);
      const addResult = await roleService.addRole(newRole);
      toast.success(addResult.message || `Added ${newRole} role successfully`);

      // Switch immediately so routing and profile context align with selected role.
      await roleService.switchRole(newRole);

      await loadRoles();
      await refreshProfile();
      window.location.href = getRoleDashboardPath(newRole);
    } catch (error: any) {
      toast.error(error.message || 'Failed to add role');
      console.error('Add role error:', error);
    } finally {
      setSwitching(false);
    }
  };

  if (!user || loading) {
    return null;
  }

  const currentRole = roles?.active_role || user.account_type;
  const normalizedCurrentRole = normalizeRole(currentRole);
  const hasMultipleRoles = roles && roles.roles.length > 1;
  const canAddRole = (normalizedCurrentRole === 'job_seeker' || normalizedCurrentRole === 'freelancer') &&
    (!roles || roles.roles.length === 1);

  const getRoleIcon = (role: string) => {
    const normalizedRole = normalizeRole(role);
    return normalizedRole === 'freelancer' ? <Briefcase className="w-4 h-4" /> : <UserCircle className="w-4 h-4" />;
  };

  const getRoleLabel = (role: string) => {
    const normalizedRole = normalizeRole(role);
    return normalizedRole === 'freelancer' ? 'Freelancer' :
      normalizedRole === 'job_seeker' ? 'Job Seeker' :
        normalizedRole === 'employer' ? 'Employer' : 'Admin';
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="flex items-center gap-1 px-2" data-testid="role-switcher-trigger">
          <span className="hidden sm:inline">{getRoleLabel(normalizedCurrentRole)}</span>
          <ChevronDown className="w-4 h-4 ml-1" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Switch Role</DropdownMenuLabel>
        <DropdownMenuSeparator />

        {roles?.roles.map((role) => (

          <DropdownMenuItem
            key={role}
            onClick={() => handleSwitchRole(role)}
            disabled={switching || normalizeRole(role) === normalizedCurrentRole}
            data-testid={`role-option-${normalizeRole(role)}`}
            className="flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              {getRoleIcon(role)}
              <span>{getRoleLabel(role)}</span>
            </div>
            {normalizeRole(role) === normalizedCurrentRole && <Check className="w-4 h-4 text-green-500" />}
          </DropdownMenuItem>
        ))}

        {canAddRole && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleAddRole}
              disabled={switching}
              data-testid="role-add-switch"
              className="flex items-center gap-2"
            >
              {switching ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Plus className="w-4 h-4" />
              )}
              <span>
                Add {normalizedCurrentRole === 'job_seeker' ? 'Freelancer' : 'Job Seeker'} Role
              </span>
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
