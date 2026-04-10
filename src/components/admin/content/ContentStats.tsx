
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText } from "lucide-react";
import { Content } from "@/types/content";

interface ContentStatsProps {
  contents: Content[];
}

const ContentStats = ({ contents }: ContentStatsProps) => {
  const publishedCount = contents.filter(c => c.status === "published").length;
  const draftCount = contents.filter(c => c.status === "draft").length;
  const archivedCount = contents.filter(c => c.status === "archived").length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Content</CardTitle>
          <FileText className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{contents.length}</div>
          <p className="text-xs text-muted-foreground">All content items</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Published</CardTitle>
          <FileText className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{publishedCount}</div>
          <p className="text-xs text-muted-foreground">Live content</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Drafts</CardTitle>
          <FileText className="h-4 w-4 text-yellow-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{draftCount}</div>
          <p className="text-xs text-muted-foreground">Work in progress</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Archived</CardTitle>
          <FileText className="h-4 w-4 text-gray-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{archivedCount}</div>
          <p className="text-xs text-muted-foreground">Archived items</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default ContentStats;
