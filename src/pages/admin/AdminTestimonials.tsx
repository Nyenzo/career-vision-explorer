import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import AdminLayout from "@/components/admin/AdminLayout";
import TestimonialStats from "@/components/admin/testimonials/TestimonialStats";
import TestimonialFilters from "@/components/admin/testimonials/TestimonialFilters";
import TestimonialsTable from "@/components/admin/testimonials/TestimonialsTable";
import TestimonialForm from "@/components/admin/testimonials/TestimonialForm";
import { useTestimonialForm, TestimonialFormData } from "@/hooks/useTestimonialForm";
import { Testimonial, TestimonialStatus } from "@/types/testimonial";

const AdminTestimonials = () => {
  const { toast } = useToast();
  const [testimonials, setTestimonials] = useState<Testimonial[]>([
    {
      id: "1",
      name: "Sarah Johnson",
      role: "Software Engineer",
      company: "TechCorp",
      content: "VisionDrill helped me find my dream job in tech. The career path recommendations were spot on!",
      rating: 5,
      status: "approved",
      category: "job-seeker",
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=100&h=100",
      createdAt: "2024-01-15",
      updatedAt: "2024-01-16",
    },
    {
      id: "2",
      name: "Michael Chen",
      role: "HR Manager",
      company: "InnovateLtd",
      content: "We've found excellent candidates through VisionDrill. The platform makes hiring so much easier.",
      rating: 4,
      status: "approved",
      category: "employer",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=100&h=100",
      createdAt: "2024-01-10",
      updatedAt: "2024-01-12",
    },
    {
      id: "3",
      name: "Emily Rodriguez",
      role: "Marketing Specialist",
      company: "BrandMax",
      content: "The skills assessment helped me identify areas for improvement. Great platform!",
      rating: 5,
      status: "pending",
      category: "job-seeker",
      image: "https://images.unsplash.com/photo-1494790108755-2616b612b3-a?auto=format&fit=crop&w=100&h=100",
      createdAt: "2024-01-20",
      updatedAt: "2024-01-20",
    },
  ]);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingTestimonial, setEditingTestimonial] = useState<Testimonial | null>(null);

  const form = useTestimonialForm();

  // Filter testimonials
  const filteredTestimonials = testimonials.filter((testimonial) => {
    const matchesSearch = testimonial.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         testimonial.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         testimonial.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || testimonial.status === statusFilter;
    const matchesCategory = categoryFilter === "all" || testimonial.category === categoryFilter;
    
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const handleCreateTestimonial = (data: TestimonialFormData) => {
    const newTestimonial: Testimonial = {
      id: Date.now().toString(),
      name: data.name,
      role: data.role,
      company: data.company,
      content: data.content,
      rating: Number(data.rating),
      status: data.status,
      category: data.category,
      image: data.image,
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
    };

    setTestimonials([newTestimonial, ...testimonials]);
    setIsCreateOpen(false);
    form.reset();
    toast({
      title: "Success",
      description: "Testimonial created successfully",
    });
  };

  const handleEditTestimonial = (data: TestimonialFormData) => {
    if (!editingTestimonial) return;

    const updatedTestimonials = testimonials.map((testimonial) =>
      testimonial.id === editingTestimonial.id
        ? { 
            ...testimonial, 
            name: data.name,
            role: data.role,
            company: data.company,
            content: data.content,
            rating: Number(data.rating),
            status: data.status,
            category: data.category,
            image: data.image,
            updatedAt: new Date().toISOString().split('T')[0]
          }
        : testimonial
    );

    setTestimonials(updatedTestimonials);
    setEditingTestimonial(null);
    form.reset();
    toast({
      title: "Success",
      description: "Testimonial updated successfully",
    });
  };

  const handleDeleteTestimonial = (id: string) => {
    setTestimonials(testimonials.filter((testimonial) => testimonial.id !== id));
    toast({
      title: "Success",
      description: "Testimonial deleted successfully",
    });
  };

  const handleStatusChange = (id: string, newStatus: TestimonialStatus) => {
    const updatedTestimonials = testimonials.map((testimonial) =>
      testimonial.id === id
        ? { ...testimonial, status: newStatus, updatedAt: new Date().toISOString().split('T')[0] }
        : testimonial
    );

    setTestimonials(updatedTestimonials);
    toast({
      title: "Success",
      description: `Testimonial ${newStatus} successfully`,
    });
  };

  const openEditDialog = (testimonial: Testimonial) => {
    setEditingTestimonial(testimonial);
    form.reset({
      name: testimonial.name,
      role: testimonial.role,
      company: testimonial.company,
      content: testimonial.content,
      rating: testimonial.rating.toString(),
      status: testimonial.status,
      category: testimonial.category,
      image: testimonial.image || "",
    });
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Testimonials Management</h1>
            <p className="text-gray-600 mt-2">Manage user testimonials and reviews</p>
          </div>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Testimonial
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Testimonial</DialogTitle>
                <DialogDescription>
                  Add a new testimonial to the platform
                </DialogDescription>
              </DialogHeader>
              <TestimonialForm
                form={form}
                onSubmit={handleCreateTestimonial}
                onCancel={() => setIsCreateOpen(false)}
                submitLabel="Create Testimonial"
              />
            </DialogContent>
          </Dialog>
        </div>

        <TestimonialStats testimonials={testimonials} />

        <TestimonialFilters
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          categoryFilter={categoryFilter}
          setCategoryFilter={setCategoryFilter}
        />

        <TestimonialsTable
          testimonials={filteredTestimonials}
          onEdit={openEditDialog}
          onDelete={handleDeleteTestimonial}
          onStatusChange={handleStatusChange}
        />

        <Dialog open={!!editingTestimonial} onOpenChange={() => setEditingTestimonial(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Testimonial</DialogTitle>
              <DialogDescription>
                Update the testimonial information
              </DialogDescription>
            </DialogHeader>
            <TestimonialForm
              form={form}
              onSubmit={handleEditTestimonial}
              onCancel={() => setEditingTestimonial(null)}
              submitLabel="Update Testimonial"
            />
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
};

export default AdminTestimonials;
