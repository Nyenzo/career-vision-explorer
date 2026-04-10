import { useUsers, User } from "@/hooks/use-users";
import { useToast } from "@/hooks/use-toast";
import { UserHeader } from "./UserHeader";
import { UserFilters } from "./UserFilters";
import { UserTable } from "./UserTable";
import { UserDialogs } from "./UserDialogs";
import { useUserManagement } from "./UserManagementProvider";
import { ImpersonationBar } from "../ImpersonationBar";

export const UserManagementTab = () => {
  const { toast } = useToast();
  const { users, createUser, updateUser, deleteUser, isLoading } = useUsers();
  const {
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
  } = useUserManagement();

  const filteredUsers = users.filter((user) => {
    const matchesSearch = 
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === "all" || user.role === roleFilter;
    const matchesStatus = statusFilter === "all" || user.status === statusFilter;
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  const handleEditClick = (user: User) => {
    console.log('Editing user:', user);
    setSelectedUser(user);
    setEditForm({ ...user });
    setIsEditDialogOpen(true);
  };

  const handleViewClick = (user: User) => {
    console.log('Viewing user:', user);
    setSelectedUser(user);
    setIsViewDialogOpen(true);
  };

  const handleDeleteClick = (user: User) => {
    console.log('Deleting user:', user);
    setSelectedUser(user);
    setIsDeleteDialogOpen(true);
  };

  const handleAddClick = () => {
    console.log('Adding new user');
    setEditForm({
      name: "",
      email: "",
      role: "jobseeker",
      status: "active",
      permissions: {},
    });
    setIsAddDialogOpen(true);
  };

  const handleAddUser = async () => {
    if (!editForm.name || !editForm.email || !editForm.role || !editForm.status) {
      toast({
        title: "Error",
        description: "All fields are required",
        variant: "destructive",
      });
      return;
    }
    
    console.log('Creating user with data:', editForm);
    const success = await createUser(editForm as Omit<User, 'id' | 'joinDate'>);
    if (success) {
      setIsAddDialogOpen(false);
      toast({
        title: "Success",
        description: "User created successfully",
      });
    }
  };

  const handleEditUser = async () => {
    if (!selectedUser?.id) return;
    
    console.log('Updating user:', selectedUser.id, 'with data:', editForm);
    const success = await updateUser(selectedUser.id, editForm);
    if (success) {
      setIsEditDialogOpen(false);
      toast({
        title: "Success",
        description: "User updated successfully",
      });
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser?.id) return;
    
    console.log('Deleting user:', selectedUser.id);
    const success = await deleteUser(selectedUser.id);
    if (success) {
      setIsDeleteDialogOpen(false);
      toast({
        title: "Success",
        description: "User deleted successfully",
      });
    }
  };

  const handleToggleStatus = async (user: User) => {
    const newStatus = user.status === "active" ? "inactive" : "active";
    console.log('Toggling user status:', user.id, 'to:', newStatus);
    const success = await updateUser(user.id, { status: newStatus });
    if (success) {
      toast({
        title: "Success",
        description: `User ${newStatus === "active" ? "activated" : "deactivated"} successfully`,
      });
    }
  };

  return (
    <div className="space-y-6">
      <ImpersonationBar />

      <UserHeader onAddClick={handleAddClick} />

      <UserFilters
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        roleFilter={roleFilter}
        setRoleFilter={setRoleFilter}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
      />

      <UserTable
        users={filteredUsers}
        onViewClick={handleViewClick}
        onEditClick={handleEditClick}
        onDeleteClick={handleDeleteClick}
        onToggleStatus={handleToggleStatus}
      />

      <UserDialogs
        selectedUser={selectedUser}
        isViewDialogOpen={isViewDialogOpen}
        setIsViewDialogOpen={setIsViewDialogOpen}
        isEditDialogOpen={isEditDialogOpen}
        setIsEditDialogOpen={setIsEditDialogOpen}
        isAddDialogOpen={isAddDialogOpen}
        setIsAddDialogOpen={setIsAddDialogOpen}
        isDeleteDialogOpen={isDeleteDialogOpen}
        setIsDeleteDialogOpen={setIsDeleteDialogOpen}
        editForm={editForm}
        setEditForm={setEditForm}
        onAddUser={handleAddUser}
        onEditUser={handleEditUser}
        onDeleteUser={handleDeleteUser}
        isLoading={isLoading}
      />
    </div>
  );
};
