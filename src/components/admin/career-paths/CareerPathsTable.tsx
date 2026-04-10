
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { MoreHorizontal, Edit, Trash2, Eye, ToggleLeft, ToggleRight } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { CareerPath } from "@/hooks/use-career-paths";

interface CareerPathsTableProps {
  careerPaths: CareerPath[];
  onEdit: (careerPath: CareerPath) => void;
  onDelete: (id: string) => void;
  onToggleStatus: (id: string, isActive: boolean) => void;
  onView: (careerPath: CareerPath) => void;
}

export const CareerPathsTable = ({ 
  careerPaths, 
  onEdit, 
  onDelete, 
  onToggleStatus, 
  onView 
}: CareerPathsTableProps) => {
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner':
        return 'bg-green-100 text-green-800';
      case 'Intermediate':
        return 'bg-yellow-100 text-yellow-800';
      case 'Advanced':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleDelete = () => {
    if (deleteId) {
      onDelete(deleteId);
      setDeleteId(null);
    }
  };

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Difficulty</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead>Steps</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {careerPaths.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                  No career paths found. Create your first career path to get started.
                </TableCell>
              </TableRow>
            ) : (
              careerPaths.map((careerPath) => (
                <TableRow key={careerPath.id}>
                  <TableCell className="font-medium">
                    <div>
                      <div className="font-semibold">{careerPath.title}</div>
                      <div className="text-sm text-muted-foreground truncate max-w-[200px]">
                        {careerPath.description}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{careerPath.category}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={getDifficultyColor(careerPath.difficulty)}>
                      {careerPath.difficulty}
                    </Badge>
                  </TableCell>
                  <TableCell>{careerPath.estimatedDuration}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">
                      {careerPath.steps.length} steps
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onToggleStatus(careerPath.id, !careerPath.isActive)}
                      className="flex items-center gap-1"
                    >
                      {careerPath.isActive ? (
                        <>
                          <ToggleRight className="h-4 w-4 text-green-600" />
                          <span className="text-green-600">Active</span>
                        </>
                      ) : (
                        <>
                          <ToggleLeft className="h-4 w-4 text-gray-400" />
                          <span className="text-gray-400">Inactive</span>
                        </>
                      )}
                    </Button>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {careerPath.createdAt}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-background border shadow-md">
                        <DropdownMenuItem onClick={() => onView(careerPath)}>
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onEdit(careerPath)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => setDeleteId(careerPath.id)}
                          className="text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the career path
              and all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
