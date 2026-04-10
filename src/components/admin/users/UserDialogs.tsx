
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { User } from "@/hooks/use-users";
import { SubAdminPermissions } from "./SubAdminPermissions";
import { FeatureFlags } from "@/hooks/use-features";

interface UserDialogsProps {
  selectedUser: User | null;
  isViewDialogOpen: boolean;
  setIsViewDialogOpen: (open: boolean) => void;
  isEditDialogOpen: boolean;
  setIsEditDialogOpen: (open: boolean) => void;
  isAddDialogOpen: boolean;
  setIsAddDialogOpen: (open: boolean) => void;
  isDeleteDialogOpen: boolean;
  setIsDeleteDialogOpen: (open: boolean) => void;
  editForm: Partial<User>;
  setEditForm: (form: Partial<User>) => void;
  onAddUser: () => void;
  onEditUser: () => void;
  onDeleteUser: () => void;
  isLoading: boolean;
}

export const UserDialogs = ({
  selectedUser,
  isViewDialogOpen,
  setIsViewDialogOpen,
  isEditDialogOpen,
  setIsEditDialogOpen,
  isAddDialogOpen,
  setIsAddDialogOpen,
  isDeleteDialogOpen,
  setIsDeleteDialogOpen,
  editForm,
  setEditForm,
  onAddUser,
  onEditUser,
  onDeleteUser,
  isLoading,
}: UserDialogsProps) => {
  const handlePermissionsChange = (permissions: Partial<FeatureFlags>) => {
    setEditForm({ ...editForm, permissions });
  };

  return (
    <>
      {/* View User Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Name</label>
                  <p className="text-sm text-muted-foreground">{selectedUser.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Email</label>
                  <p className="text-sm text-muted-foreground">{selectedUser.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Role</label>
                  <p className="text-sm text-muted-foreground capitalize">{selectedUser.role}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Status</label>
                  <p className="text-sm text-muted-foreground capitalize">{selectedUser.status}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Join Date</label>
                  <p className="text-sm text-muted-foreground">{selectedUser.joinDate}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Last Login</label>
                  <p className="text-sm text-muted-foreground">{selectedUser.lastLogin || "Never"}</p>
                </div>
              </div>
              {selectedUser.profileComplete && (
                <div>
                  <label className="text-sm font-medium">Profile Completion</label>
                  <p className="text-sm text-muted-foreground">{selectedUser.profileComplete}%</p>
                </div>
              )}
              {selectedUser.role === "subadmin" && selectedUser.permissions && (
                <div>
                  <label className="text-sm font-medium">Permissions</label>
                  <div className="mt-2 space-y-1">
                    {Object.entries(selectedUser.permissions).map(([key, value]) => (
                      <div key={key} className="flex items-center justify-between text-sm">
                        <span className="capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                        <span className={value ? "text-green-600" : "text-red-600"}>
                          {value ? "Enabled" : "Disabled"}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Add/Edit User Dialog */}
      <Dialog open={isAddDialogOpen || isEditDialogOpen} onOpenChange={(open) => {
        setIsAddDialogOpen(false);
        setIsEditDialogOpen(false);
      }}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{isAddDialogOpen ? "Add New User" : "Edit User"}</DialogTitle>
            <DialogDescription>
              {isAddDialogOpen ? "Create a new user account" : "Update user information"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Name</label>
              <Input
                value={editForm.name || ""}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                placeholder="Full name"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Email</label>
              <Input
                type="email"
                value={editForm.email || ""}
                onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                placeholder="Email address"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Role</label>
              <Select value={editForm.role} onValueChange={(value) => setEditForm({ ...editForm, role: value as User['role'] })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="jobseeker">Job Seeker</SelectItem>
                  <SelectItem value="employer">Employer</SelectItem>
                  <SelectItem value="subadmin">Sub Admin</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Status</label>
              <Select value={editForm.status} onValueChange={(value) => setEditForm({ ...editForm, status: value as User['status'] })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {editForm.role === "subadmin" && (
              <SubAdminPermissions 
                user={editForm as User} 
                onPermissionsChange={handlePermissionsChange}
              />
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsAddDialogOpen(false);
              setIsEditDialogOpen(false);
            }}>
              Cancel
            </Button>
            <Button 
              onClick={isAddDialogOpen ? onAddUser : onEditUser}
              disabled={isLoading}
            >
              {isLoading ? "Saving..." : (isAddDialogOpen ? "Create User" : "Save Changes")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {selectedUser?.name}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={onDeleteUser}
              disabled={isLoading}
            >
              {isLoading ? "Deleting..." : "Delete User"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
