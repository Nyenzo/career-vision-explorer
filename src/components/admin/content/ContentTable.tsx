
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Edit, Trash2, Eye } from "lucide-react";
import { Content, ContentStatus } from "@/types/content";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ContentTableProps {
  contents: Content[];
  onEdit: (content: Content) => void;
  onDelete: (id: string) => void;
  onStatusChange: (id: string, status: ContentStatus) => void;
}

const ContentTable = ({ contents, onEdit, onDelete, onStatusChange }: ContentTableProps) => {
  const getStatusColor = (status: ContentStatus) => {
    switch (status) {
      case "published":
        return "bg-green-100 text-green-800 hover:bg-green-200";
      case "draft":
        return "bg-yellow-100 text-yellow-800 hover:bg-yellow-200";
      case "archived":
        return "bg-gray-100 text-gray-800 hover:bg-gray-200";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "page":
        return "bg-blue-100 text-blue-800";
      case "article":
        return "bg-purple-100 text-purple-800";
      case "blog":
        return "bg-green-100 text-green-800";
      case "faq":
        return "bg-orange-100 text-orange-800";
      case "header":
      case "footer":
      case "navigation":
        return "bg-indigo-100 text-indigo-800";
      case "hero":
      case "cta":
      case "feature":
        return "bg-pink-100 text-pink-800";
      case "testimonial-section":
        return "bg-teal-100 text-teal-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Location</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Author</TableHead>
            <TableHead>Updated</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {contents.map((content) => (
            <TableRow key={content.id}>
              <TableCell>
                <div>
                  <div className="font-medium">{content.title}</div>
                  <div className="text-sm text-gray-500">{content.slug}</div>
                </div>
              </TableCell>
              <TableCell>
                <Badge variant="outline" className={getTypeColor(content.type)}>
                  {content.type}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="text-sm text-gray-600">
                  {content.location || "-"}
                </div>
              </TableCell>
              <TableCell>
                <Select
                  value={content.status}
                  onValueChange={(value: ContentStatus) => onStatusChange(content.id, value)}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue>
                      <Badge className={getStatusColor(content.status)}>
                        {content.status}
                      </Badge>
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </TableCell>
              <TableCell>{content.authorName}</TableCell>
              <TableCell>{content.updatedAt}</TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEdit(content)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-red-600 hover:text-red-700"
                    onClick={() => onDelete(content.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default ContentTable;
