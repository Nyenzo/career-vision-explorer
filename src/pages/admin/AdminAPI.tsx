
import AdminLayout from "@/components/admin/AdminLayout";
import { Tabs } from "@/components/ui/tabs";
import { ApiHeader } from "@/components/admin/api/ApiHeader";
import { ApiTabsNavigation } from "@/components/admin/api/ApiTabsNavigation";
import { ApiTabsContent } from "@/components/admin/api/ApiTabsContent";

const AdminAPI = () => {
  return (
    <AdminLayout>
      <div className="space-y-8">
        <ApiHeader />

        <Tabs defaultValue="endpoints" className="space-y-6">
          <ApiTabsNavigation />
          <ApiTabsContent />
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default AdminAPI;
