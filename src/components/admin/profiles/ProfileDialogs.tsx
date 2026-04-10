
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { 
  User, 
  Building, 
  MapPin, 
  Mail, 
  Phone, 
  Calendar, 
  Globe,
  Award,
  Briefcase,
  BookOpen
} from "lucide-react";
import { AdminProfile } from "@/pages/admin/AdminProfiles";

interface ProfileDialogsProps {
  selectedProfile: AdminProfile | null;
  isViewDialogOpen: boolean;
  setIsViewDialogOpen: (open: boolean) => void;
  isEditDialogOpen: boolean;
  setIsEditDialogOpen: (open: boolean) => void;
  isDeleteDialogOpen: boolean;
  setIsDeleteDialogOpen: (open: boolean) => void;
  onDeleteProfile: () => void;
  isLoading: boolean;
}

export const ProfileDialogs = ({
  selectedProfile,
  isViewDialogOpen,
  setIsViewDialogOpen,
  isEditDialogOpen,
  setIsEditDialogOpen,
  isDeleteDialogOpen,
  setIsDeleteDialogOpen,
  onDeleteProfile,
  isLoading,
}: ProfileDialogsProps) => {
  return (
    <>
      {/* View Profile Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Profile Details</DialogTitle>
            <DialogDescription>
              View complete profile information
            </DialogDescription>
          </DialogHeader>
          
          {selectedProfile && (
            <div className="space-y-6">
              <div className="flex items-center space-x-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={selectedProfile.profileImage} />
                  <AvatarFallback>
                    {selectedProfile.role === "employer" ? (
                      <Building className="h-8 w-8" />
                    ) : (
                      <User className="h-8 w-8" />
                    )}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold">{selectedProfile.name}</h3>
                  <div className="flex items-center space-x-2">
                    <Badge variant={selectedProfile.role === "employer" ? "secondary" : "default"}>
                      {selectedProfile.role === "employer" ? "Employer" : "Job Seeker"}
                    </Badge>
                    <Badge variant={selectedProfile.isPublic ? "default" : "secondary"}>
                      {selectedProfile.isPublic ? "Public" : "Private"}
                    </Badge>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{selectedProfile.email}</span>
                  </div>
                  
                  {selectedProfile.location && (
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{selectedProfile.location}</span>
                    </div>
                  )}
                  
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      Joined {new Date(selectedProfile.joinDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div className="space-y-3">
                  {selectedProfile.title && (
                    <div className="flex items-center space-x-2">
                      <Briefcase className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{selectedProfile.title}</span>
                    </div>
                  )}
                  
                  {selectedProfile.companyName && (
                    <div className="flex items-center space-x-2">
                      <Building className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{selectedProfile.companyName}</span>
                    </div>
                  )}
                  
                  <div className="space-y-1">
                    <span className="text-sm text-muted-foreground">Profile Completion</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${selectedProfile.profileComplete}%` }}
                        />
                      </div>
                      <span className="text-sm">{selectedProfile.profileComplete}%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Profile Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Profile Settings</DialogTitle>
            <DialogDescription>
              Modify profile visibility and contact settings
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <p className="text-sm text-muted-foreground">
              Profile editing functionality would be implemented here with form controls
              for managing profile visibility, contact information display, and other settings.
            </p>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button disabled={isLoading}>
              {isLoading ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the profile
              and remove all associated data from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={onDeleteProfile}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isLoading}
            >
              {isLoading ? "Deleting..." : "Delete Profile"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
