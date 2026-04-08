
import React from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LogOut, Settings, User, ChevronDown } from "lucide-react";
import { Link } from "react-router-dom";

export const DashboardHeader = () => {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="flex justify-between items-center mb-12">
      <div className="text-center flex-1">
        <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent mb-4">
          Your Career Dashboard
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
          Track your applications, discover new opportunities, and advance your career journey
        </p>
      </div>

      <div className="flex items-center gap-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="relative h-12 px-4 rounded-xl border border-gray-200 bg-white/80 backdrop-blur-sm hover:bg-white hover:shadow-lg transition-all duration-200"
            >
              <div className="flex items-center gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="" alt={user?.name || "User"} />
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold">
                    {user?.name?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden md:flex flex-col items-start">
                  <span className="text-sm font-medium text-gray-900">{user?.name || "User"}</span>
                  <span className="text-xs text-gray-500">Account</span>
                </div>
                <ChevronDown className="h-4 w-4 text-gray-500" />
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-64" align="end" forceMount>
            <div className="flex items-center justify-start gap-3 p-4 border-b">
              <Avatar className="h-10 w-10">
                <AvatarImage src="" alt={user?.name || "User"} />
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold">
                  {user?.name?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col space-y-1 leading-none">
                <p className="font-medium text-gray-900">{user?.name || "User"}</p>
                <p className="text-sm text-gray-500 truncate">
                  {user?.email}
                </p>
              </div>
            </div>
            <div className="py-2">
              <DropdownMenuItem asChild>
                <Link to="/profile" className="cursor-pointer flex items-center px-4 py-2 hover:bg-gray-50 transition-colors">
                  <User className="mr-3 h-4 w-4 text-gray-500" />
                  <span className="text-gray-700">Profile</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/jobseeker/settings" className="cursor-pointer flex items-center px-4 py-2 hover:bg-gray-50 transition-colors">
                  <Settings className="mr-3 h-4 w-4 text-gray-500" />
                  <span className="text-gray-700">Settings</span>
                </Link>
              </DropdownMenuItem>
            </div>
            <DropdownMenuSeparator />
            <div className="py-2">
              <DropdownMenuItem
                onClick={handleLogout}
                className="cursor-pointer flex items-center px-4 py-2 hover:bg-red-50 transition-colors text-red-600 focus:text-red-600 focus:bg-red-50"
              >
                <LogOut className="mr-3 h-4 w-4" />
                <span className="font-medium">Log out</span>
              </DropdownMenuItem>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};
