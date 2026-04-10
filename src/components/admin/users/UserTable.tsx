
import { Eye, Edit, Trash, UserCheck, UserX, Users, UserCog } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { User } from "@/hooks/use-users";
import { useAuth } from "@/hooks/use-auth";

interface UserTableProps {
  users: User[];
  onViewClick: (user: User) => void;
  onEditClick: (user: User) => void;
  onDeleteClick: (user: User) => void;
  onToggleStatus: (user: User) => void;
}

export const UserTable = ({
  users,
  onViewClick,
  onEditClick,
  onDeleteClick,
  onToggleStatus,
}: UserTableProps) => {
  const { user: currentUser, impersonateUser, hasRole } = useAuth();

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "admin": return "bg-gradient-to-r from-red-500 to-red-600 text-white border-0";
      case "subadmin": return "bg-gradient-to-r from-orange-500 to-orange-600 text-white border-0";
      case "employer": return "bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0";
      case "jobseeker": return "bg-gradient-to-r from-green-500 to-green-600 text-white border-0";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const canImpersonate = (targetUser: User) => {
    if (!currentUser) return false;
    
    // Can't impersonate yourself
    if (currentUser.id === targetUser.id) return false;
    
    // Only admins and subadmins can impersonate
    if (!hasRole('admin') && !hasRole('subadmin')) return false;
    
    // Admins can impersonate anyone except other admins
    if (hasRole('admin')) {
      return targetUser.role !== 'admin';
    }
    
    // Subadmins can only impersonate jobseekers and employers
    if (hasRole('subadmin')) {
      return targetUser.role === 'jobseeker' || targetUser.role === 'employer';
    }
    
    return false;
  };

  const handleImpersonate = (targetUser: User) => {
    impersonateUser(targetUser);
  };

  return (
    <div className="border-0 rounded-2xl shadow-xl overflow-hidden bg-white/80 backdrop-blur-sm">
      <Table>
        <TableHeader>
          <TableRow className="bg-gradient-to-r from-gray-50 to-blue-50/30 border-b border-gray-200/50">
            <TableHead className="text-gray-700 font-semibold">User</TableHead>
            <TableHead className="text-gray-700 font-semibold">Role</TableHead>
            <TableHead className="text-gray-700 font-semibold">Status</TableHead>
            <TableHead className="text-gray-700 font-semibold">Join Date</TableHead>
            <TableHead className="text-gray-700 font-semibold">Last Login</TableHead>
            <TableHead className="text-gray-700 font-semibold">Permissions</TableHead>
            <TableHead className="text-right text-gray-700 font-semibold">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user, index) => (
            <TableRow 
              key={user.id} 
              className={`transition-all duration-200 hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-purple-50/30 ${
                index % 2 === 0 ? 'bg-white/50' : 'bg-gray-50/30'
              }`}
            >
              <TableCell>
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold text-sm">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">{user.name}</div>
                    <div className="text-sm text-gray-500">{user.email}</div>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <Badge className={getRoleBadgeColor(user.role)}>
                  {user.role === "subadmin" ? "Sub Admin" : user.role}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge variant={user.status === "active" ? "default" : "secondary"} 
                       className={user.status === "active" ? "bg-green-100 text-green-800 border-green-200" : "bg-gray-100 text-gray-800 border-gray-200"}>
                  {user.status}
                </Badge>
              </TableCell>
              <TableCell className="text-gray-600">{user.joinDate}</TableCell>
              <TableCell className="text-gray-600">{user.lastLogin || "Never"}</TableCell>
              <TableCell>
                {user.role === "subadmin" && user.permissions ? (
                  <div className="text-sm">
                    <span className="text-green-600">
                      {Object.values(user.permissions).filter(Boolean).length}
                    </span>
                    <span className="text-gray-400"> / </span>
                    <span className="text-gray-600">
                      {Object.keys(user.permissions).length} features
                    </span>
                  </div>
                ) : (
                  <span className="text-gray-400">—</span>
                )}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => onViewClick(user)}
                    className="hover:bg-blue-50 hover:text-blue-600 transition-all duration-200"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => onEditClick(user)}
                    className="hover:bg-purple-50 hover:text-purple-600 transition-all duration-200"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  {canImpersonate(user) && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleImpersonate(user)}
                      className="hover:bg-indigo-50 hover:text-indigo-600 transition-all duration-200"
                      title={`Impersonate ${user.name}`}
                    >
                      <UserCog className="h-4 w-4" />
                    </Button>
                  )}
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => onToggleStatus(user)}
                    className={user.status === "active" ? "hover:bg-orange-50 hover:text-orange-600" : "hover:bg-green-50 hover:text-green-600"}
                  >
                    {user.status === "active" ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => onDeleteClick(user)} 
                    className="hover:bg-red-50 hover:text-red-600 transition-all duration-200"
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
          {users.length === 0 && (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-12">
                <div className="text-gray-400">
                  <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium">No users found</p>
                  <p className="text-sm">Try adjusting your search or filter criteria</p>
                </div>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};
