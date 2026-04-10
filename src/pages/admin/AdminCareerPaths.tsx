import { useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Search, BookOpen, Users, TrendingUp, Clock } from "lucide-react";
import { useCareerPaths, CareerPath, CareerPathsProvider } from "@/hooks/use-career-paths";
import { CareerPathsTable } from "@/components/admin/career-paths/CareerPathsTable";
import { CareerPathForm } from "@/components/admin/career-paths/CareerPathForm";
import { CareerPathViewDialog } from "@/components/admin/career-paths/CareerPathViewDialog";
import { useToast } from "@/hooks/use-toast";

const AdminCareerPathsContent = () => {
  const { careerPaths, addCareerPath, updateCareerPath, deleteCareerPath } = useCareerPaths();
  const { toast } = useToast();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCareerPath, setEditingCareerPath] = useState<CareerPath | null>(null);
  const [viewingCareerPath, setViewingCareerPath] = useState<CareerPath | null>(null);

  // Filter career paths
  const filteredCareerPaths = careerPaths.filter(path => {
    const matchesSearch = path.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         path.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         path.category.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDifficulty = difficultyFilter === "all" || path.difficulty === difficultyFilter;
    const matchesCategory = categoryFilter === "all" || path.category === categoryFilter;
    const matchesStatus = statusFilter === "all" || 
                         (statusFilter === "active" && path.isActive) ||
                         (statusFilter === "inactive" && !path.isActive);

    return matchesSearch && matchesDifficulty && matchesCategory && matchesStatus;
  });

  // Get unique categories for filter
  const categories = Array.from(new Set(careerPaths.map(path => path.category)));

  // Statistics
  const stats = {
    total: careerPaths.length,
    active: careerPaths.filter(p => p.isActive).length,
    totalSteps: careerPaths.reduce((sum, path) => sum + path.steps.length, 0),
    avgSteps: careerPaths.length > 0 ? Math.round(careerPaths.reduce((sum, path) => sum + path.steps.length, 0) / careerPaths.length) : 0
  };

  const handleCreateCareerPath = () => {
    setEditingCareerPath(null);
    setIsFormOpen(true);
  };

  const handleEditCareerPath = (careerPath: CareerPath) => {
    setEditingCareerPath(careerPath);
    setIsFormOpen(true);
  };

  const handleFormSubmit = (data: Omit<CareerPath, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (editingCareerPath) {
      updateCareerPath(editingCareerPath.id, data);
      toast({
        title: "Career Path Updated",
        description: "The career path has been successfully updated.",
      });
    } else {
      addCareerPath(data);
      toast({
        title: "Career Path Created",
        description: "The career path has been successfully created.",
      });
    }
    setIsFormOpen(false);
    setEditingCareerPath(null);
  };

  const handleDeleteCareerPath = (id: string) => {
    deleteCareerPath(id);
    toast({
      title: "Career Path Deleted",
      description: "The career path has been successfully deleted.",
      variant: "destructive"
    });
  };

  const handleToggleStatus = (id: string, isActive: boolean) => {
    updateCareerPath(id, { isActive });
    toast({
      title: `Career Path ${isActive ? 'Activated' : 'Deactivated'}`,
      description: `The career path has been ${isActive ? 'activated' : 'deactivated'}.`,
    });
  };

  const handleViewCareerPath = (careerPath: CareerPath) => {
    setViewingCareerPath(careerPath);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Career Paths Management</h1>
          <p className="text-muted-foreground">
            Manage career paths and progression routes
          </p>
        </div>
        <Button onClick={handleCreateCareerPath} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Create Career Path
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Paths</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">
              {stats.active} active paths
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Paths</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.active}</div>
            <p className="text-xs text-muted-foreground">
              {stats.total - stats.active} inactive paths
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Steps</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalSteps}</div>
            <p className="text-xs text-muted-foreground">
              {stats.avgSteps} avg per path
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Categories</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{categories.length}</div>
            <p className="text-xs text-muted-foreground">
              distinct categories
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search career paths..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            
            <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Difficulties" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Difficulties</SelectItem>
                <SelectItem value="Beginner">Beginner</SelectItem>
                <SelectItem value="Intermediate">Intermediate</SelectItem>
                <SelectItem value="Advanced">Advanced</SelectItem>
              </SelectContent>
            </Select>

            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map(category => (
                  <SelectItem key={category} value={category}>{category}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Career Paths Table */}
      <Card>
        <CardHeader>
          <CardTitle>Career Paths ({filteredCareerPaths.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <CareerPathsTable
            careerPaths={filteredCareerPaths}
            onEdit={handleEditCareerPath}
            onDelete={handleDeleteCareerPath}
            onToggleStatus={handleToggleStatus}
            onView={handleViewCareerPath}
          />
        </CardContent>
      </Card>

      {/* Create/Edit Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingCareerPath ? 'Edit Career Path' : 'Create New Career Path'}
            </DialogTitle>
          </DialogHeader>
          <CareerPathForm
            careerPath={editingCareerPath || undefined}
            onSubmit={handleFormSubmit}
            onCancel={() => setIsFormOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* View Career Path Dialog */}
      <CareerPathViewDialog
        careerPath={viewingCareerPath}
        open={!!viewingCareerPath}
        onOpenChange={(open) => !open && setViewingCareerPath(null)}
      />
    </div>
  );
};

const AdminCareerPaths = () => {
  return (
    <AdminLayout>
      <CareerPathsProvider>
        <AdminCareerPathsContent />
      </CareerPathsProvider>
    </AdminLayout>
  );
};

export default AdminCareerPaths;
