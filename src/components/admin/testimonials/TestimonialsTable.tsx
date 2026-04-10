
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Edit2, Trash2, Star, User, Briefcase } from "lucide-react";
import { Testimonial, TestimonialStatus } from "@/types/testimonial";

interface TestimonialsTableProps {
  testimonials: Testimonial[];
  onEdit: (testimonial: Testimonial) => void;
  onDelete: (id: string) => void;
  onStatusChange: (id: string, status: TestimonialStatus) => void;
}

const TestimonialsTable = ({ testimonials, onEdit, onDelete, onStatusChange }: TestimonialsTableProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved": return "bg-green-100 text-green-800 border-green-200";
      case "rejected": return "bg-red-100 text-red-800 border-red-200";
      case "pending": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "job-seeker": return <User className="h-4 w-4" />;
      case "employer": return <Briefcase className="h-4 w-4" />;
      default: return <Star className="h-4 w-4" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "job-seeker": return "text-blue-600 bg-blue-50";
      case "employer": return "text-purple-600 bg-purple-50";
      default: return "text-gray-600 bg-gray-50";
    }
  };

  return (
    <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
      <CardHeader className="bg-gradient-to-r from-gray-50 to-blue-50/30 border-b border-gray-200/50">
        <CardTitle className="text-2xl font-bold text-gray-900">Testimonials ({testimonials.length})</CardTitle>
        <CardDescription className="text-gray-600">Manage all testimonials and reviews</CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow className="bg-gradient-to-r from-gray-50 to-blue-50/30 border-b border-gray-200/50">
              <TableHead className="text-gray-700 font-semibold">Profile</TableHead>
              <TableHead className="text-gray-700 font-semibold">Name & Company</TableHead>
              <TableHead className="text-gray-700 font-semibold">Content</TableHead>
              <TableHead className="text-gray-700 font-semibold">Rating</TableHead>
              <TableHead className="text-gray-700 font-semibold">Category</TableHead>
              <TableHead className="text-gray-700 font-semibold">Status</TableHead>
              <TableHead className="text-gray-700 font-semibold">Date</TableHead>
              <TableHead className="text-gray-700 font-semibold">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {testimonials.map((testimonial, index) => (
              <TableRow 
                key={testimonial.id}
                className={`transition-all duration-200 hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-purple-50/30 ${
                  index % 2 === 0 ? 'bg-white/50' : 'bg-gray-50/30'
                }`}
              >
                <TableCell>
                  <img 
                    src={testimonial.image || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=40&h=40"} 
                    alt={`${testimonial.name} profile`}
                    className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-lg"
                  />
                </TableCell>
                <TableCell>
                  <div>
                    <div className="font-semibold text-gray-900">{testimonial.name}</div>
                    <div className="text-sm text-gray-500">
                      {testimonial.role} at {testimonial.company}
                    </div>
                  </div>
                </TableCell>
                <TableCell className="max-w-xs">
                  <div className="truncate text-gray-700">{testimonial.content}</div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: testimonial.rating }, (_, i) => (
                      <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    ))}
                    <span className="ml-2 text-sm font-medium text-gray-700">{testimonial.rating}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${getCategoryColor(testimonial.category)}`}>
                    {getCategoryIcon(testimonial.category)}
                    <span className="capitalize text-sm font-medium">{testimonial.category.replace('-', ' ')}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge className={getStatusColor(testimonial.status)}>
                    {testimonial.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm text-gray-600">
                  {testimonial.createdAt}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {testimonial.status === "pending" && (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onStatusChange(testimonial.id, "approved")}
                          className="bg-green-50 text-green-600 hover:bg-green-100 border-green-200 hover:border-green-300"
                        >
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onStatusChange(testimonial.id, "rejected")}
                          className="bg-red-50 text-red-600 hover:bg-red-100 border-red-200 hover:border-red-300"
                        >
                          Reject
                        </Button>
                      </>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onEdit(testimonial)}
                      className="hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300"
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="hover:bg-red-50 hover:text-red-600 hover:border-red-300"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="bg-white/95 backdrop-blur-sm border-0 shadow-2xl">
                        <AlertDialogHeader>
                          <AlertDialogTitle className="text-gray-900">Delete Testimonial</AlertDialogTitle>
                          <AlertDialogDescription className="text-gray-600">
                            Are you sure you want to delete this testimonial? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel className="bg-gray-50 hover:bg-gray-100 border-gray-200">
                            Cancel
                          </AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => onDelete(testimonial.id)}
                            className="bg-red-600 hover:bg-red-700 text-white"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default TestimonialsTable;
