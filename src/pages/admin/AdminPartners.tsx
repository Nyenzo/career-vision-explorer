
import React, { useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { usePartners, Partner, PartnersProvider } from "@/hooks/use-partners";
import { PartnerStatsCards } from "@/components/admin/partners/PartnerStatsCards";
import { PartnerFilters } from "@/components/admin/partners/PartnerFilters";
import { PartnersGrid } from "@/components/admin/partners/PartnersGrid";
import { PartnerFormDialog } from "@/components/admin/partners/PartnerFormDialog";

const AdminPartnersContent = () => {
  const { partners, addPartner, updatePartner, deletePartner, isLoading } = usePartners();
  const [editingPartner, setEditingPartner] = useState<Partner | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("all");

  const handleAddPartner = () => {
    setEditingPartner(null);
    setIsDialogOpen(true);
  };

  const handleEditPartner = (partner: Partner) => {
    setEditingPartner(partner);
    setIsDialogOpen(true);
  };

  const handleSavePartner = (formData: Omit<Partner, "id" | "createdAt" | "status">) => {
    if (editingPartner) {
      updatePartner(editingPartner.id, formData);
    } else {
      addPartner(formData);
    }
    setIsDialogOpen(false);
  };

  const filteredPartners = partners.filter(partner => {
    const matchesSearch = partner.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         partner.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === "all" || partner.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const getStats = () => {
    return {
      total: partners.length,
      employers: partners.filter(p => p.category === "employer").length,
      education: partners.filter(p => p.category === "education").length,
      recruiting: partners.filter(p => p.category === "recruiting").length
    };
  };

  const stats = getStats();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Partner Management</h1>
          <p className="text-muted-foreground">Manage partner organizations and their showcase images</p>
        </div>
        <Button onClick={handleAddPartner} disabled={isLoading}>
          <Plus className="h-4 w-4 mr-2" />
          Add Partner
        </Button>
      </div>

      <PartnerStatsCards stats={stats} />

      <PartnerFilters 
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        filterCategory={filterCategory}
        setFilterCategory={setFilterCategory}
      />

      <PartnersGrid 
        partners={filteredPartners}
        onEdit={handleEditPartner}
        onDelete={deletePartner}
        isLoading={isLoading}
      />

      <PartnerFormDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSave={handleSavePartner}
        editingPartner={editingPartner}
        isLoading={isLoading}
      />
    </div>
  );
};

const AdminPartners = () => {
  return (
    <AdminLayout>
      <PartnersProvider>
        <AdminPartnersContent />
      </PartnersProvider>
    </AdminLayout>
  );
};

export default AdminPartners;
