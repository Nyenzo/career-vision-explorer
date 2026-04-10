
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface UserHeaderProps {
  onAddClick: () => void;
}

export const UserHeader = ({ onAddClick }: UserHeaderProps) => {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <h1 className="text-3xl font-bold">User Management</h1>
        <p className="text-muted-foreground">Manage platform users and their roles</p>
      </div>
      <Button onClick={onAddClick} className="flex items-center gap-2">
        <Plus className="h-4 w-4" />
        Add User
      </Button>
    </div>
  );
};
