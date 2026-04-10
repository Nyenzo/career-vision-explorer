
import { useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, BarChart, Settings } from "lucide-react";
import { SkillsStats } from "@/components/admin/skills/SkillsStats";
import { SkillsTable } from "@/components/admin/skills/SkillsTable";
import { SkillForm } from "@/components/admin/skills/SkillForm";
import { SkillViewDialog } from "@/components/admin/skills/SkillViewDialog";
import { AdminSkillsProvider, useAdminSkills, Skill } from "@/hooks/use-admin-skills";

const AdminSkillsContent = () => {
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const { skills } = useAdminSkills();

  const handleEdit = (skill: Skill) => {
    setSelectedSkill(skill);
    setIsFormOpen(true);
  };

  const handleView = (skill: Skill) => {
    setSelectedSkill(skill);
    setIsViewOpen(true);
  };

  const handleAddNew = () => {
    setSelectedSkill(null);
    setIsFormOpen(true);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Skills Management</h1>
            <p className="text-muted-foreground">
              Manage skills database, assessments, and career development paths
            </p>
          </div>
          <Button onClick={handleAddNew} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add New Skill
          </Button>
        </div>

        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <BarChart className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="skills" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Skills Database
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <SkillsStats />
          </TabsContent>

          <TabsContent value="skills">
            <SkillsTable onEdit={handleEdit} onView={handleView} />
          </TabsContent>
        </Tabs>

        <SkillForm 
          skill={selectedSkill} 
          open={isFormOpen} 
          onOpenChange={setIsFormOpen} 
        />
        
        <SkillViewDialog 
          skill={selectedSkill} 
          open={isViewOpen} 
          onOpenChange={setIsViewOpen} 
        />
      </div>
    </AdminLayout>
  );
};

const AdminSkills = () => {
  return (
    <AdminSkillsProvider>
      <AdminSkillsContent />
    </AdminSkillsProvider>
  );
};

export default AdminSkills;
