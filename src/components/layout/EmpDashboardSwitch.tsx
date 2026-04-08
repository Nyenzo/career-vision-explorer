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
import { Badge } from "@/components/ui/badge";
import { 
  Briefcase, 
  FolderOpen, 
  Check,
  ChevronDown
} from "lucide-react";
import { useNavigate } from 'react-router-dom';

export function DashboardSwitcher() {
  const navigate = useNavigate();
  const [currentDashboard, setCurrentDashboard] = useState('jobs');

  useEffect(() => {
    // Determine current dashboard based on URL
    const path = window.location.pathname;
    if (path.includes('/employer/jobs')) setCurrentDashboard('jobs');
    else if (path.includes('/employer/projects')) setCurrentDashboard('projects');
  }, []);

  const handleSwitchDashboard = (dashboard: string) => {
    setCurrentDashboard(dashboard);
    if (dashboard === 'jobs') {
      navigate('/employer/jobs');
    } else if (dashboard === 'projects') {
      navigate('/employer/projects');
    }
  };

  const getDashboardIcon = (dashboard: string) => {
    return dashboard === 'jobs' ? <Briefcase className="w-4 h-4" /> : <FolderOpen className="w-4 h-4" />;
  };

  const getDashboardLabel = (dashboard: string) => {
    return dashboard === 'jobs' ? 'Employer Dashboards' : 'Projects';
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="flex items-center gap-2">
          {getDashboardIcon(currentDashboard)}
          <span className="hidden sm:inline">{getDashboardLabel(currentDashboard)}</span>
          <Badge variant="secondary" className="ml-1">Multi</Badge>
          <ChevronDown className="w-4 h-4 ml-1" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Switch Dashboard</DropdownMenuLabel>
                    <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => handleSwitchDashboard('jobs')}
          className="flex items-center justify-between"
        >
          <div className="flex items-center gap-2">
            <Briefcase className="w-4 h-4" />
            <span>Jobs</span>
          </div>
          {currentDashboard === 'jobs' && <Check className="w-4 h-4 text-green-500" />}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => handleSwitchDashboard('projects')}
          className="flex items-center justify-between"
        >
          <div className="flex items-center gap-2">
            <FolderOpen className="w-4 h-4" />
            <span>Projects</span>
          </div>
          {currentDashboard === 'projects' && <Check className="w-4 h-4 text-green-500" />}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}