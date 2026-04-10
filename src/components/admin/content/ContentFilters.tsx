
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Search } from "lucide-react";

interface ContentFiltersProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  statusFilter: string;
  setStatusFilter: (status: string) => void;
  typeFilter: string;
  setTypeFilter: (type: string) => void;
}

const ContentFilters = ({
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter,
  typeFilter,
  setTypeFilter,
}: ContentFiltersProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Filter Website Content</CardTitle>
        <CardDescription>Search and filter content by title, location, content type, or status</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by title, location, or content..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="published">Published</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
            </SelectContent>
          </Select>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-full md:w-[200px]">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="page">Page Content</SelectItem>
              <SelectItem value="article">Article</SelectItem>
              <SelectItem value="blog">Blog Post</SelectItem>
              <SelectItem value="faq">FAQ</SelectItem>
              <SelectItem value="header">Header Text</SelectItem>
              <SelectItem value="footer">Footer Text</SelectItem>
              <SelectItem value="navigation">Navigation Menu</SelectItem>
              <SelectItem value="hero">Hero Section</SelectItem>
              <SelectItem value="cta">Call to Action</SelectItem>
              <SelectItem value="feature">Feature Section</SelectItem>
              <SelectItem value="testimonial-section">Testimonial Section</SelectItem>
              <SelectItem value="notification">Notification Message</SelectItem>
              <SelectItem value="email">Email Template</SelectItem>
              <SelectItem value="button">Button Text</SelectItem>
              <SelectItem value="form">Form Labels/Text</SelectItem>
              <SelectItem value="error">Error Message</SelectItem>
              <SelectItem value="popup">Popup/Modal Text</SelectItem>
              <SelectItem value="tooltip">Tooltip Text</SelectItem>
              <SelectItem value="placeholder">Input Placeholder</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
};

export default ContentFilters;
