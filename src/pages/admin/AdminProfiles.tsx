
import { useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { useProfiles } from "@/hooks/use-profiles";
import { useToast } from "@/hooks/use-toast";
import { ProfileHeader } from "@/components/admin/profiles/ProfileHeader";
import { ProfileFilters } from "@/components/admin/profiles/ProfileFilters";
import { ProfileTable } from "@/components/admin/profiles/ProfileTable";
import { ProfileDialogs } from "@/components/admin/profiles/ProfileDialogs";

export interface AdminProfile {
  id: string;
  name: string;
  email: string;
  role: "jobseeker" | "employer";
  profileImage?: string;
  location?: string;
  title?: string;
  companyName?: string;
  isPublic: boolean;
  showContact: boolean;
  joinDate: string;
  lastActive?: string;
  profileComplete: number;
}

const AdminProfiles = () => {
  const { toast } = useToast();
  const { profiles, updateProfile, deleteProfile, isLoading } = useProfiles();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProfile, setSelectedProfile] = useState<AdminProfile | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filteredProfiles = profiles.filter((profile) => {
    const matchesSearch = 
      profile.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      profile.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (profile.companyName && profile.companyName.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesRole = roleFilter === "all" || profile.role === roleFilter;
    const matchesStatus = statusFilter === "all" || 
      (statusFilter === "public" && profile.isPublic) ||
      (statusFilter === "private" && !profile.isPublic);
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  const handleViewClick = (profile: AdminProfile) => {
    setSelectedProfile(profile);
    setIsViewDialogOpen(true);
  };

  const handleEditClick = (profile: AdminProfile) => {
    setSelectedProfile(profile);
    setIsEditDialogOpen(true);
  };

  const handleDeleteClick = (profile: AdminProfile) => {
    setSelectedProfile(profile);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteProfile = async () => {
    if (!selectedProfile?.id) return;
    
    const success = await deleteProfile(selectedProfile.id);
    if (success) {
      setIsDeleteDialogOpen(false);
      toast({
        title: "Success",
        description: "Profile deleted successfully",
      });
    }
  };

  const handleToggleVisibility = async (profile: AdminProfile) => {
    const success = await updateProfile(profile.id, { isPublic: !profile.isPublic });
    if (success) {
      toast({
        title: "Success",
        description: `Profile ${profile.isPublic ? 'hidden' : 'made public'}`,
      });
    }
  };

  const handleToggleContact = async (profile: AdminProfile) => {
    const success = await updateProfile(profile.id, { showContact: !profile.showContact });
    if (success) {
      toast({
        title: "Success",
        description: `Contact visibility ${profile.showContact ? 'disabled' : 'enabled'}`,
      });
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <ProfileHeader />

        <ProfileFilters
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          roleFilter={roleFilter}
          setRoleFilter={setRoleFilter}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
        />

        <ProfileTable
          profiles={filteredProfiles}
          onViewClick={handleViewClick}
          onEditClick={handleEditClick}
          onDeleteClick={handleDeleteClick}
          onToggleVisibility={handleToggleVisibility}
          onToggleContact={handleToggleContact}
          isLoading={isLoading}
        />

        <ProfileDialogs
          selectedProfile={selectedProfile}
          isViewDialogOpen={isViewDialogOpen}
          setIsViewDialogOpen={setIsViewDialogOpen}
          isEditDialogOpen={isEditDialogOpen}
          setIsEditDialogOpen={setIsEditDialogOpen}
          isDeleteDialogOpen={isDeleteDialogOpen}
          setIsDeleteDialogOpen={setIsDeleteDialogOpen}
          onDeleteProfile={handleDeleteProfile}
          isLoading={isLoading}
        />
      </div>
    </AdminLayout>
  );
};

export default AdminProfiles;
