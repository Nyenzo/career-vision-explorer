
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ProfileCardSkeleton } from "@/components/ui/skeleton-loaders";
import { 
  User, 
  MapPin, 
  Briefcase, 
  BookOpen, 
  Star, 
  Mail, 
  Phone,
  Building,
  Calendar,
  Award,
  Globe
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface PublicProfileData {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  role: "jobseeker" | "employer";
  profileImage?: string;
  location?: string;
  bio?: string;
  
  // Job seeker specific
  title?: string;
  education?: string;
  experience?: string;
  skills?: string[];
  portfolio?: string;
  resume?: string;
  
  // Employer specific
  companyName?: string;
  companySize?: string;
  industry?: string;
  website?: string;
  foundedYear?: string;
  description?: string;
  
  joinDate: string;
  isPublic: boolean;
  showContact: boolean;
}

const PublicProfile = () => {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const [profile, setProfile] = useState<PublicProfileData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock data - in real app, fetch from API
        const mockProfile: PublicProfileData = {
          id: id || "1",
          name: id === "employer-1" ? "TechCorp Solutions" : "Sarah Johnson",
          email: id === "employer-1" ? "contact@techcorp.com" : "sarah.johnson@email.com",
          phone: id === "employer-1" ? "+254 700 000 000" : "+254 700 123 456",
          role: id === "employer-1" ? "employer" : "jobseeker",
          profileImage: "/placeholder.svg",
          location: "Nairobi, Kenya",
          bio: id === "employer-1" 
            ? "Leading technology solutions provider in East Africa, specializing in software development and digital transformation."
            : "Passionate software developer with 5+ years of experience in React, Node.js, and cloud technologies. Love building scalable applications and mentoring junior developers.",
          
          // Job seeker fields
          title: id !== "employer-1" ? "Senior Software Engineer" : undefined,
          education: id !== "employer-1" ? "BSc Computer Science, University of Nairobi" : undefined,
          experience: id !== "employer-1" ? "5+ years experience" : undefined,
          skills: id !== "employer-1" ? ["React", "Node.js", "TypeScript", "AWS", "Docker"] : undefined,
          portfolio: id !== "employer-1" ? "https://sarahjohnson.dev" : undefined,
          
          // Employer fields
          companyName: id === "employer-1" ? "TechCorp Solutions" : undefined,
          companySize: id === "employer-1" ? "50-100 employees" : undefined,
          industry: id === "employer-1" ? "Technology" : undefined,
          website: id === "employer-1" ? "https://techcorp.com" : undefined,
          foundedYear: id === "employer-1" ? "2015" : undefined,
          description: id === "employer-1" ? "We help businesses transform digitally through innovative software solutions." : undefined,
          
          joinDate: "2024-01-15",
          isPublic: true,
          showContact: true,
        };
        
        setProfile(mockProfile);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load profile",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProfile();
    }
  }, [id, toast]);

  if (loading) {
    return (
      <Layout>
        <div className="container py-8">
          <div className="min-h-[400px] flex items-center justify-center">
            <div className="w-full max-w-4xl">
              <ProfileCardSkeleton />
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!profile || !profile.isPublic) {
    return (
      <Layout>
        <div className="container py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Profile Not Found</h1>
            <p className="text-gray-600">This profile is either private or doesn't exist.</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container py-8 max-w-4xl">
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex flex-col items-center md:items-start">
                <Avatar className="h-32 w-32 mb-4">
                  <AvatarImage src={profile.profileImage} alt={profile.name} />
                  <AvatarFallback className="bg-gray-200 text-2xl">
                    {profile.role === "employer" ? <Building className="h-16 w-16" /> : <User className="h-16 w-16" />}
                  </AvatarFallback>
                </Avatar>
                <Badge variant={profile.role === "employer" ? "secondary" : "default"}>
                  {profile.role === "employer" ? "Employer" : "Job Seeker"}
                </Badge>
              </div>
              
              <div className="flex-1">
                <h1 className="text-3xl font-bold mb-2">{profile.name}</h1>
                {profile.title && (
                  <p className="text-xl text-gray-600 mb-4">{profile.title}</p>
                )}
                
                <div className="space-y-2 mb-4">
                  {profile.location && (
                    <div className="flex items-center text-gray-600">
                      <MapPin className="h-4 w-4 mr-2" />
                      {profile.location}
                    </div>
                  )}
                  
                  {profile.experience && (
                    <div className="flex items-center text-gray-600">
                      <Briefcase className="h-4 w-4 mr-2" />
                      {profile.experience}
                    </div>
                  )}
                  
                  {profile.education && (
                    <div className="flex items-center text-gray-600">
                      <BookOpen className="h-4 w-4 mr-2" />
                      {profile.education}
                    </div>
                  )}
                  
                  {profile.industry && (
                    <div className="flex items-center text-gray-600">
                      <Building className="h-4 w-4 mr-2" />
                      {profile.industry}
                    </div>
                  )}
                  
                  {profile.companySize && (
                    <div className="flex items-center text-gray-600">
                      <User className="h-4 w-4 mr-2" />
                      {profile.companySize}
                    </div>
                  )}
                  
                  {profile.foundedYear && (
                    <div className="flex items-center text-gray-600">
                      <Calendar className="h-4 w-4 mr-2" />
                      Founded {profile.foundedYear}
                    </div>
                  )}
                </div>
                
                {profile.showContact && (
                  <div className="flex flex-wrap gap-2">
                    {profile.email && (
                      <Button variant="outline" size="sm" asChild>
                        <a href={`mailto:${profile.email}`}>
                          <Mail className="h-4 w-4 mr-2" />
                          Email
                        </a>
                      </Button>
                    )}
                    
                    {profile.phone && (
                      <Button variant="outline" size="sm" asChild>
                        <a href={`tel:${profile.phone}`}>
                          <Phone className="h-4 w-4 mr-2" />
                          Call
                        </a>
                      </Button>
                    )}
                    
                    {profile.website && (
                      <Button variant="outline" size="sm" asChild>
                        <a href={profile.website} target="_blank" rel="noopener noreferrer">
                          <Globe className="h-4 w-4 mr-2" />
                          Website
                        </a>
                      </Button>
                    )}
                    
                    {profile.portfolio && (
                      <Button variant="outline" size="sm" asChild>
                        <a href={profile.portfolio} target="_blank" rel="noopener noreferrer">
                          <Award className="h-4 w-4 mr-2" />
                          Portfolio
                        </a>
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {profile.bio && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>
                {profile.role === "employer" ? "About Company" : "About Me"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 leading-relaxed">{profile.bio}</p>
            </CardContent>
          </Card>
        )}

        {profile.skills && profile.skills.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Skills</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {profile.skills.map((skill, index) => (
                  <Badge key={index} variant="secondary">
                    {skill}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {profile.description && (
          <Card>
            <CardHeader>
              <CardTitle>Company Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 leading-relaxed">{profile.description}</p>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
};

export default PublicProfile;
