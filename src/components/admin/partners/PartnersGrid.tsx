
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, ExternalLink } from "lucide-react";
import { Partner } from "@/hooks/use-partners";

interface PartnersGridProps {
  partners: Partner[];
  onEdit: (partner: Partner) => void;
  onDelete: (id: number) => void;
  isLoading: boolean;
}

export const PartnersGrid = ({ partners, onEdit, onDelete, isLoading }: PartnersGridProps) => {
  const getCategoryColor = (category: Partner["category"]) => {
    switch (category) {
      case "employer": return "bg-blue-100 text-blue-800";
      case "education": return "bg-green-100 text-green-800";
      case "recruiting": return "bg-purple-100 text-purple-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const handleDeletePartner = (id: number) => {
    if (window.confirm("Are you sure you want to delete this partner?")) {
      onDelete(id);
    }
  };

  if (partners.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No partners found matching your criteria.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {partners.map((partner) => (
        <Card key={partner.id} className="hover:shadow-lg transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">{partner.name}</CardTitle>
              <Badge className={getCategoryColor(partner.category)}>
                {partner.category}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-center">
              <img 
                src={partner.logo} 
                alt={`${partner.name} logo`}
                className="h-20 w-20 object-contain rounded-full shadow-md"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=100&h=100&fit=crop&crop=center";
                }}
              />
            </div>
            {partner.description && (
              <p className="text-sm text-muted-foreground text-center line-clamp-2">
                {partner.description}
              </p>
            )}
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <ExternalLink className="h-4 w-4" />
              <a href={partner.website} target="_blank" rel="noopener noreferrer" className="hover:underline">
                Visit Website
              </a>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => onEdit(partner)} className="flex-1" disabled={isLoading}>
                <Edit className="h-4 w-4 mr-1" />
                Edit
              </Button>
              <Button variant="destructive" size="sm" onClick={() => handleDeletePartner(partner.id)} className="flex-1" disabled={isLoading}>
                <Trash2 className="h-4 w-4 mr-1" />
                Delete
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
