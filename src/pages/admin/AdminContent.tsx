import { useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ContentStats from "@/components/admin/content/ContentStats";
import ContentFilters from "@/components/admin/content/ContentFilters";
import ContentTable from "@/components/admin/content/ContentTable";
import ContentForm from "@/components/admin/content/ContentForm";
import { FooterContentManagement } from "@/components/admin/content/FooterContentManagement";
import { AboutPageManagement } from "@/components/admin/content/AboutPageManagement";
import { useContentForm } from "@/hooks/useContentForm";
import { Content, ContentStatus } from "@/types/content";

const AdminContent = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [editingContent, setEditingContent] = useState<Content | null>(null);

  const form = useContentForm();

  // Mock content data - in a real app this would come from an API
  const [contents, setContents] = useState<Content[]>([
    {
      id: "1",
      title: "Homepage Hero Section",
      slug: "homepage-hero",
      type: "hero",
      status: "published",
      content: "Navigate your career journey with confidence and clarity",
      excerpt: "Main hero text displayed on the homepage",
      location: "homepage-hero",
      authorId: "1",
      authorName: "Admin User",
      createdAt: "2024-03-15",
      updatedAt: "2024-03-15"
    },
    {
      id: "2",
      title: "About Us Page Content",
      slug: "about-us",
      type: "page",
      status: "published",
      content: "At Visiondrill Career Explorer, we believe that everyone deserves to find meaningful work...",
      excerpt: "Main content for the About Us page",
      location: "about-page",
      authorId: "1",
      authorName: "Admin User",
      createdAt: "2024-03-10",
      updatedAt: "2024-03-12"
    }
  ]);

  const handleEdit = (content: Content) => {
    setEditingContent(content);
    form.reset({
      title: content.title,
      slug: content.slug,
      type: content.type,
      status: content.status,
      content: content.content,
      excerpt: content.excerpt,
      location: content.location || "",
    });
  };

  const handleDelete = (id: string) => {
    setContents(prev => prev.filter(c => c.id !== id));
  };

  const handleStatusChange = (id: string, status: ContentStatus) => {
    setContents(prev => prev.map(c => 
      c.id === id ? { ...c, status, updatedAt: new Date().toISOString().split('T')[0] } : c
    ));
  };

  const handleSubmit = (data: any) => {
    if (editingContent) {
      // Update existing content
      setContents(prev => prev.map(c => 
        c.id === editingContent.id 
          ? { ...c, ...data, updatedAt: new Date().toISOString().split('T')[0] }
          : c
      ));
    } else {
      // Create new content
      const newContent: Content = {
        id: Date.now().toString(),
        ...data,
        authorId: "1",
        authorName: "Admin User",
        createdAt: new Date().toISOString().split('T')[0],
        updatedAt: new Date().toISOString().split('T')[0]
      };
      setContents(prev => [...prev, newContent]);
    }
    form.reset();
    setEditingContent(null);
  };

  const handleCancel = () => {
    form.reset();
    setEditingContent(null);
  };

  // Filter contents based on search and filters
  const filteredContents = contents.filter(content => {
    const matchesSearch = searchTerm === "" || 
      content.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      content.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (content.location && content.location.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === "all" || content.status === statusFilter;
    const matchesType = typeFilter === "all" || content.type === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Content Management</h1>
          <p className="text-muted-foreground">
            Manage website content, pages, and footer information
          </p>
        </div>

        <Tabs defaultValue="content" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="content">Content</TabsTrigger>
            <TabsTrigger value="about">About Page</TabsTrigger>
            <TabsTrigger value="footer">Footer</TabsTrigger>
          </TabsList>
          
          <TabsContent value="content" className="space-y-6">
            <ContentStats contents={contents} />
            <ContentFilters
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              statusFilter={statusFilter}
              setStatusFilter={setStatusFilter}
              typeFilter={typeFilter}
              setTypeFilter={setTypeFilter}
            />
            <ContentTable
              contents={filteredContents}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onStatusChange={handleStatusChange}
            />
            <ContentForm 
              form={form}
              onSubmit={handleSubmit}
              onCancel={handleCancel}
              submitLabel={editingContent ? "Update Content" : "Create Content"}
            />
          </TabsContent>

          <TabsContent value="about">
            <AboutPageManagement />
          </TabsContent>
          
          <TabsContent value="footer">
            <FooterContentManagement />
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default AdminContent;
