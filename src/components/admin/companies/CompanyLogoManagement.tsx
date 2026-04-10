
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Upload, X, Building, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface CompanyLogo {
  id: string;
  companyName: string;
  logoUrl: string;
  uploadedAt: string;
  isActive: boolean;
}

// Mock data for companies
const mockCompanies: CompanyLogo[] = [
  {
    id: "1",
    companyName: "Tech Solutions Ltd",
    logoUrl: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=400&fit=crop&crop=center",
    uploadedAt: "2024-01-15",
    isActive: true,
  },
  {
    id: "2",
    companyName: "Innovative Systems",
    logoUrl: "https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=400&h=400&fit=crop&crop=center",
    uploadedAt: "2024-01-14",
    isActive: true,
  },
  {
    id: "3",
    companyName: "Creative Digital Agency",
    logoUrl: "https://images.unsplash.com/photo-1572044162444-ad60f128bdea?w=400&h=400&fit=crop&crop=center",
    uploadedAt: "2024-01-13",
    isActive: true,
  },
];

export const CompanyLogoManagement = () => {
  const { toast } = useToast();
  const [companies, setCompanies] = useState<CompanyLogo[]>(mockCompanies);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newCompany, setNewCompany] = useState({
    companyName: "",
    logoUrl: "",
  });
  const [uploading, setUploading] = useState(false);

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid File Type",
        description: "Please upload an image file (PNG, JPG, SVG, etc.)",
        variant: "destructive"
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "Please upload an image smaller than 5MB",
        variant: "destructive"
      });
      return;
    }

    setUploading(true);

    try {
      // Convert file to base64 data URL for storage
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        setNewCompany(prev => ({ ...prev, logoUrl: dataUrl }));
        setUploading(false);
        toast({
          title: "Logo Uploaded Successfully",
          description: "Your company logo has been processed"
        });
      };
      
      reader.onerror = () => {
        setUploading(false);
        toast({
          title: "Upload Failed",
          description: "There was an error processing your image. Please try again.",
          variant: "destructive"
        });
      };

      reader.readAsDataURL(file);

    } catch (error) {
      setUploading(false);
      toast({
        title: "Upload Failed",
        description: "There was an error uploading your logo. Please try again.",
        variant: "destructive"
      });
    }

    // Reset the input value
    event.target.value = '';
  };

  const handleAddCompany = () => {
    if (!newCompany.companyName || !newCompany.logoUrl) {
      toast({
        title: "Missing Information",
        description: "Please provide both company name and logo",
        variant: "destructive"
      });
      return;
    }

    const newEntry: CompanyLogo = {
      id: Date.now().toString(),
      companyName: newCompany.companyName,
      logoUrl: newCompany.logoUrl,
      uploadedAt: new Date().toISOString().split('T')[0],
      isActive: true,
    };

    setCompanies(prev => [newEntry, ...prev]);
    setNewCompany({ companyName: "", logoUrl: "" });
    setIsAddDialogOpen(false);
    
    toast({
      title: "Company Added",
      description: `${newCompany.companyName} logo has been added successfully`
    });
  };

  const handleRemoveLogo = (id: string) => {
    const company = companies.find(c => c.id === id);
    setCompanies(prev => prev.filter(c => c.id !== id));
    
    toast({
      title: "Logo Removed",
      description: `${company?.companyName} logo has been removed`
    });
  };

  const handleToggleStatus = (id: string) => {
    setCompanies(prev => prev.map(company => 
      company.id === id 
        ? { ...company, isActive: !company.isActive }
        : company
    ));
    
    const company = companies.find(c => c.id === id);
    toast({
      title: "Status Updated",
      description: `${company?.companyName} logo is now ${company?.isActive ? 'inactive' : 'active'}`
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Company Logo Management</h2>
          <p className="text-muted-foreground">
            Manage company logos that appear on job listings
          </p>
        </div>
        
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Upload className="h-4 w-4 mr-2" />
              Add Company Logo
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Company Logo</DialogTitle>
              <DialogDescription>
                Upload a logo for a company that posts jobs on your platform
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="companyName">Company Name</Label>
                <Input
                  id="companyName"
                  value={newCompany.companyName}
                  onChange={(e) => setNewCompany(prev => ({ ...prev, companyName: e.target.value }))}
                  placeholder="Enter company name"
                />
              </div>
              
              <div className="space-y-2">
                <Label>Company Logo</Label>
                <div className="flex items-center gap-2">
                  <Input
                    value={newCompany.logoUrl}
                    onChange={(e) => setNewCompany(prev => ({ ...prev, logoUrl: e.target.value }))}
                    placeholder="Enter logo URL or upload a file"
                    className="flex-1"
                  />
                  <div className="relative">
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      disabled={uploading}
                    />
                    <Button variant="outline" disabled={uploading}>
                      <Upload className="h-4 w-4 mr-2" />
                      {uploading ? "Uploading..." : "Upload"}
                    </Button>
                  </div>
                </div>
                
                {newCompany.logoUrl && (
                  <div className="flex items-center gap-2 p-3 border rounded-lg bg-gray-50">
                    <img 
                      src={newCompany.logoUrl} 
                      alt="Logo preview" 
                      className="h-12 w-12 object-contain border rounded bg-white"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                    <div className="flex-1">
                      <span className="text-sm font-medium text-gray-700">Logo Preview</span>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setNewCompany(prev => ({ ...prev, logoUrl: "" }))}
                      className="text-red-600 hover:text-red-700"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddCompany}>
                Add Company
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Company Logos ({companies.length})</CardTitle>
          <CardDescription>
            Manage logos for companies that appear on job listings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Logo</TableHead>
                <TableHead>Company Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Uploaded</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {companies.map((company) => (
                <TableRow key={company.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <img 
                        src={company.logoUrl} 
                        alt={`${company.companyName} logo`}
                        className="h-10 w-10 object-contain border rounded bg-white"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          if (e.currentTarget.nextElementSibling) {
                            (e.currentTarget.nextElementSibling as HTMLElement).style.display = 'flex';
                          }
                        }}
                      />
                      <div className="h-10 w-10 rounded border bg-gray-100 hidden items-center justify-center">
                        <Building className="h-5 w-5 text-gray-400" />
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{company.companyName}</TableCell>
                  <TableCell>
                    <Badge variant={company.isActive ? "default" : "secondary"}>
                      {company.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell>{company.uploadedAt}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(company.logoUrl, '_blank')}
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleToggleStatus(company.id)}
                      >
                        {company.isActive ? "Deactivate" : "Activate"}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRemoveLogo(company.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};
