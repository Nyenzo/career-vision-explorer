
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Eye, 
  Edit, 
  Trash2, 
  MoreHorizontal, 
  User, 
  Building,
  EyeOff,
  Mail,
  MailX,
  ExternalLink
} from "lucide-react";
import { AdminProfile } from "@/pages/admin/AdminProfiles";
import { Link } from "react-router-dom";
import { TableRowSkeleton } from "@/components/ui/skeleton-loaders";

interface ProfileTableProps {
  profiles: AdminProfile[];
  onViewClick: (profile: AdminProfile) => void;
  onEditClick: (profile: AdminProfile) => void;
  onDeleteClick: (profile: AdminProfile) => void;
  onToggleVisibility: (profile: AdminProfile) => void;
  onToggleContact: (profile: AdminProfile) => void;
  isLoading: boolean;
}

export const ProfileTable = ({
  profiles,
  onViewClick,
  onEditClick,
  onDeleteClick,
  onToggleVisibility,
  onToggleContact,
  isLoading,
}: ProfileTableProps) => {
  if (isLoading) {
    return (
      <div className="rounded-md border">
        <Table>
          <TableBody>
            {Array.from({ length: 5 }).map((_, index) => (
              <TableRowSkeleton key={index} columns={8} />
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Profile</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Location</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Contact</TableHead>
            <TableHead>Completion</TableHead>
            <TableHead>Last Active</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {profiles.map((profile) => (
            <TableRow key={profile.user_id}>
              <TableCell>
                <div className="flex items-center space-x-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={profile.profileImage} />
                    <AvatarFallback>
                      {profile.role === "employer" ? (
                        <Building className="h-4 w-4" />
                      ) : (
                        <User className="h-4 w-4" />
                      )}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">{profile.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {profile.email}
                    </div>
                    {profile.title && (
                      <div className="text-xs text-muted-foreground">
                        {profile.title}
                      </div>
                    )}
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <Badge variant={profile.role === "employer" ? "secondary" : "default"}>
                  {profile.role === "employer" ? "Employer" : "Job Seeker"}
                </Badge>
              </TableCell>
              <TableCell className="text-sm">
                {profile.location || "Not specified"}
              </TableCell>
              <TableCell>
                <div className="flex items-center space-x-2">
                  <Badge variant={profile.isPublic ? "default" : "secondary"}>
                    {profile.isPublic ? "Public" : "Private"}
                  </Badge>
                  {profile.isPublic && (
                    <Link to={`/profile/${profile.user_id}`} target="_blank">
                      <Button variant="ghost" size="sm">
                        <ExternalLink className="h-3 w-3" />
                      </Button>
                    </Link>
                  )}
                </div>
              </TableCell>
              <TableCell>
                {profile.showContact ? (
                  <Mail className="h-4 w-4 text-green-600" />
                ) : (
                  <MailX className="h-4 w-4 text-gray-400" />
                )}
              </TableCell>
              <TableCell>
                <div className="flex items-center space-x-2">
                  <div className="w-16 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${profile.profileComplete}%` }}
                    />
                  </div>
                  <span className="text-sm">{profile.profileComplete}%</span>
                </div>
              </TableCell>
              <TableCell className="text-sm">
                {profile.lastActive ? new Date(profile.lastActive).toLocaleDateString() : "Never"}
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem onClick={() => onViewClick(profile)}>
                      <Eye className="mr-2 h-4 w-4" />
                      View Details
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onEditClick(profile)}>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit Profile
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => onToggleVisibility(profile)}>
                      {profile.isPublic ? (
                        <>
                          <EyeOff className="mr-2 h-4 w-4" />
                          Make Private
                        </>
                      ) : (
                        <>
                          <Eye className="mr-2 h-4 w-4" />
                          Make Public
                        </>
                      )}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onToggleContact(profile)}>
                      {profile.showContact ? (
                        <>
                          <MailX className="mr-2 h-4 w-4" />
                          Hide Contact
                        </>
                      ) : (
                        <>
                          <Mail className="mr-2 h-4 w-4" />
                          Show Contact
                        </>
                      )}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={() => onDeleteClick(profile)}
                      className="text-destructive"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete Profile
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
