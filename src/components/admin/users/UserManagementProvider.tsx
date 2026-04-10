
import { createContext, useContext, useState, ReactNode } from "react";
import { User } from "@/hooks/use-users";

interface UserManagementContextType {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedUser: User | null;
  setSelectedUser: (user: User | null) => void;
  isDeleteDialogOpen: boolean;
  setIsDeleteDialogOpen: (open: boolean) => void;
  isEditDialogOpen: boolean;
  setIsEditDialogOpen: (open: boolean) => void;
  isAddDialogOpen: boolean;
  setIsAddDialogOpen: (open: boolean) => void;
  isViewDialogOpen: boolean;
  setIsViewDialogOpen: (open: boolean) => void;
  roleFilter: string;
  setRoleFilter: (role: string) => void;
  statusFilter: string;
  setStatusFilter: (status: string) => void;
  editForm: Partial<User>;
  setEditForm: (form: Partial<User>) => void;
}

const UserManagementContext = createContext<UserManagementContextType | undefined>(undefined);

export const UserManagementProvider = ({ children }: { children: ReactNode }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [editForm, setEditForm] = useState<Partial<User>>({
    name: "",
    email: "",
    role: "jobseeker",
    status: "active",
    permissions: {},
  });

  return (
    <UserManagementContext.Provider value={{
      searchQuery,
      setSearchQuery,
      selectedUser,
      setSelectedUser,
      isDeleteDialogOpen,
      setIsDeleteDialogOpen,
      isEditDialogOpen,
      setIsEditDialogOpen,
      isAddDialogOpen,
      setIsAddDialogOpen,
      isViewDialogOpen,
      setIsViewDialogOpen,
      roleFilter,
      setRoleFilter,
      statusFilter,
      setStatusFilter,
      editForm,
      setEditForm,
    }}>
      {children}
    </UserManagementContext.Provider>
  );
};

export const useUserManagement = () => {
  const context = useContext(UserManagementContext);
  if (context === undefined) {
    throw new Error('useUserManagement must be used within a UserManagementProvider');
  }
  return context;
};
