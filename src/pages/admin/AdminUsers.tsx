
import AdminLayout from "@/components/admin/AdminLayout";
import { CompanyLogoManagement } from "@/components/admin/companies/CompanyLogoManagement";
import { UserManagementTab } from "@/components/admin/users/UserManagementTab";
import { UserManagementProvider } from "@/components/admin/users/UserManagementProvider";
import { UsersProvider } from "@/hooks/use-users";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const AdminUsers = () => {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">User Management</h1>
          <p className="text-muted-foreground">
            Manage user accounts and company logos
          </p>
        </div>

        <Tabs defaultValue="users" className="space-y-6">
          <TabsList>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="companies">Company Logos</TabsTrigger>
          </TabsList>
          
          <TabsContent value="users" className="space-y-6">
            <UsersProvider>
              <UserManagementProvider>
                <UserManagementTab />
              </UserManagementProvider>
            </UsersProvider>
          </TabsContent>
          
          <TabsContent value="companies">
            <CompanyLogoManagement />
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default AdminUsers;
