
import { Button } from "@/components/ui/button";
import { Users, Plus } from "lucide-react";

export const ProfileHeader = () => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Profile Management</h1>
        <p className="text-muted-foreground">
          Manage user profiles, visibility settings, and public profile access
        </p>
      </div>
      <div className="mt-4 sm:mt-0">
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Export Profiles
        </Button>
      </div>
    </div>
  );
};
