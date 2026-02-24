import React, { useState, useRef, useEffect } from "react";
import Layout from "@/components/layout/Layout";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Briefcase,
  GraduationCap,
  Globe,
  Github,
  Linkedin,
  Twitter,
  Instagram,
  Edit3,
  Save,
  X,
  UploadCloud,
  DollarSign,
  Building,
  FileText,
  Download,
  Settings,
  Plus,
  Users,
  GlobeIcon,
  Star,
  Award,
  CheckCircle,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { profileService } from "@/services/profile.service";
import { toast } from "sonner";
import { Profile as ProfileType, ProfileUpdate } from "@/types/api";
import { useNavigate } from "react-router-dom";
import whatsapp from "/src/assets/whatsapp.png";
import stackoverflow from "/src/assets/stackoverflow.png";

const Profile: React.FC = () => {
  const { user, isAuthenticated, profile: authProfile } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<ProfileType | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState<Partial<ProfileUpdate>>({});
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [localCompletionPercentage, setLocalCompletionPercentage] = useState(0);

  // Input refs for scrolling to sections
  const nameInputRef = useRef<HTMLInputElement>(null);
  const bioInputRef = useRef<HTMLTextAreaElement>(null);
  const linkedinInputRef = useRef<HTMLInputElement>(null);
  const skillsInputRef = useRef<HTMLTextAreaElement>(null);
  const workExperienceInputRef = useRef<HTMLTextAreaElement>(null);
  const educationInputRef = useRef<HTMLInputElement>(null);
  const preferencesInputRef = useRef<HTMLTextAreaElement>(null);
  const salaryInputRef = useRef<HTMLInputElement>(null);
  const dobInputRef = useRef<HTMLInputElement>(null);
  const phoneInputRef = useRef<HTMLInputElement>(null);
  const locationInputRef = useRef<HTMLInputElement>(null);
  const jobInputRef = useRef<HTMLInputElement>(null);
  const experience_yearsInputRef = useRef<HTMLInputElement>(null);
  const twitterInputRef = useRef<HTMLTextAreaElement>(null);
  const profileImageInputRef = useRef<HTMLInputElement>(null);
  const resumeInputRef = useRef<HTMLTextAreaElement>(null);
  const stackoverflowInputRef = useRef<HTMLTextAreaElement>(null);
  const projectsInputRef = useRef<HTMLDivElement>(null);

  // Redirect employers to their dashboard

  useEffect(() => {
    if (isAuthenticated && authProfile) {
      setProfile(authProfile);
      setEditForm(authProfile);
      // Use backend value if available, otherwise calculate locally
      setLocalCompletionPercentage(
        authProfile.profile_completion_percentage ||
        calculateProfileCompletion(authProfile)
      );
      setLoading(false);
    } else if (isAuthenticated && !authProfile) {
      loadProfile();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated, user, authProfile]);

  const loadProfile = async () => {
    try {
      if (!user?.user_id) {
        console.error("No user_id found in user");
        return;
      }

      setLoading(true);
      const profileData = await profileService.getProfile(user.user_id);

      setProfile(profileData);
      setEditForm(profileData);
      // Use backend value if available, otherwise calculate locally
      setLocalCompletionPercentage(
        profileData.profile_completion_percentage ||
        calculateProfileCompletion(profileData)
      );
    } catch (error) {
      console.error("Error loading profile:", error);
      toast.error("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (dataToSave?: Partial<ProfileUpdate>) => {
    const payload = dataToSave || editForm;
    if (!payload || Object.keys(payload).length === 0) {
      toast.info("No changes to save.");
      setEditing(false);
      return;
    }

    try {
      if (!profile?.id && !user?.user_id) {
        console.error("No profile ID or user ID available for update");
        toast.error("Cannot save profile: No user identifier found");
        return;
      }

      // Clean the payload - remove undefined values
      const cleanPayload: ProfileUpdate = Object.fromEntries(
        Object.entries(payload).filter(
          ([_, value]) => value !== undefined && value !== null
        )
      ) as ProfileUpdate;

      console.log("🔄 Profile update starting...", {
        userAccountType: user?.account_type,
        cleanPayload,
      });

      let updatedProfile;

      if (user?.account_type === "employer") {
        // For employers, update profile with top-level company fields
        const employerProfileData = {
          company_name:
            cleanPayload.company_name ||
            cleanPayload.company_data?.company_name,
          industry:
            cleanPayload.industry || cleanPayload.company_data?.industry,
          company_website:
            cleanPayload.company_website ||
            cleanPayload.company_data?.company_website,
          company_size:
            cleanPayload.company_size ||
            cleanPayload.company_data?.company_size,
          name: cleanPayload.name,
          bio: cleanPayload.bio,
          phone: cleanPayload.phone,
          location: cleanPayload.location,
        };

        console.log("🏢 Sending employer profile data:", employerProfileData);

        // Update the profile with employer-specific fields (no profileId needed)
        updatedProfile = await profileService.updateProfile(
          employerProfileData
        );
      } else {
        // For regular users, remove company data
        const {
          company_data,
          company_name,
          industry,
          company_website,
          company_size,
          ...userData
        } = cleanPayload;
        console.log("👤 Sending user data:", userData);
        // Update profile without profileId 
        updatedProfile = await profileService.updateProfile(
          userData
        );
      }

      setProfile(updatedProfile);
      setEditForm(updatedProfile);
      // Use backend value if available, otherwise calculate locally
      setLocalCompletionPercentage(
        updatedProfile.profile_completion_percentage ||
        calculateProfileCompletion(updatedProfile)
      );
      setEditing(false);
      toast.success("Profile updated successfully!");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile");
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setLoading(true);
      await profileService.uploadProfileImage(file);
      await loadProfile();
      toast.success("Profile image updated successfully");
    } catch (error) {
      console.error("Image upload failed", error);
      toast.error("Failed to upload image. Max size 10MB.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setEditForm(profile as ProfileType);
    // Use backend value if available, otherwise calculate locally
    setLocalCompletionPercentage(
      profile?.profile_completion_percentage ||
      calculateProfileCompletion(profile)
    );
    setEditing(false);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setResumeFile(event.target.files[0]);
    }
  };

  const getAvailabilityColor = (status: string) => {
    switch (status) {
      case "Available":
        return "bg-green-300 text-green-800 border-green-500";
      case "Not Available":
        return "bg-red-100 text-red-800 border-red-200";
      case "Available in 2 weeks":
      case "Available in 1 month":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const calculateProfileCompletion = (
    profileData: ProfileType | Partial<ProfileUpdate> | null
  ): number => {
    if (!profileData) return 0;

    const isEmployer =
      "account_type" in profileData && profileData.account_type === "employer";

    if (isEmployer) {
      return 100; // Company profiles don't need completion percentage
    }

    // Job seeker completion calculation
    const sectionWeights = {
      name: 10,
      bio: 15,
      skills: 20,
      location: 5,
      education: 10,
      work_experience: 15,
      resume_link: 10,
      linkedin_url: 5,
      github_url: 5,
      portfolio_url: 5,
      profile_image_url: 5,
    };

    let score = 0;
    const data = profileData as any;

    if (data.name) score += sectionWeights.name;
    if (data.bio && data.bio.length > 50) score += sectionWeights.bio;
    else if (data.bio) score += sectionWeights.bio * 0.5;

    if (data.skills && data.skills.length >= 5) score += sectionWeights.skills;
    else if (data.skills && data.skills.length > 0) {
      score += sectionWeights.skills * (data.skills.length / 5);
    }

    if (data.location) score += sectionWeights.location;
    if (data.education) score += sectionWeights.education;

    if (data.work_experience && data.work_experience.length >= 1) {
      score += sectionWeights.work_experience;
    }

    if (data.resume_link) score += sectionWeights.resume_link;

    let socialProfiles = 0;
    if (data.linkedin_url) socialProfiles++;
    if (data.github_url) socialProfiles++;
    if (data.portfolio_url) socialProfiles++;
    score += (socialProfiles / 3) * 15;

    if (data.profile_image_url) score += sectionWeights.profile_image_url;

    if (data.certifications && data.certifications.length > 0) {
      score += Math.min(5, data.certifications.length);
    }

    return Math.min(100, Math.round(score));
  };

  // Update local completion percentage when editing form
  useEffect(() => {
    setLocalCompletionPercentage(calculateProfileCompletion(editForm));
  }, [editForm]);

  const handleJumpToField = (field: string) => {
    setEditing(true);
    const refs: Record<string, React.RefObject<HTMLElement>> = {
      name: nameInputRef,
      bio: bioInputRef,
      linkedin_url: linkedinInputRef,
      skills: skillsInputRef,
      work_experience: workExperienceInputRef,
      education: educationInputRef,
      preferences: preferencesInputRef,
      salary: salaryInputRef,
      dob: dobInputRef,
      resume: resumeInputRef,
      location: locationInputRef,
      twitter: twitterInputRef,
      phone: phoneInputRef,
      job_type: jobInputRef,
      stackoverflow: stackoverflowInputRef,
      experience_years: experience_yearsInputRef,
      projects: projectsInputRef,
    };
    const ref = refs[field];
    if (ref?.current) {
      ref.current.scrollIntoView({ behavior: "smooth" });
      ref.current.focus();
    }
  };

  const handleResumeParse = async () => {
    if (!resumeFile) {
      toast.error("Please select a resume file to parse.");
      return;
    }

    setIsParsing(true);
    try {
      const response = await profileService.parseResume(resumeFile);
      console.log("Resume parse response:", response);

      // Check if response has the expected structure
      if (!response || !response.parsed_data) {
        throw new Error("Invalid response structure from CV parser");
      }

      const updatedProfile = response.updated_profile;
      const parsedData = response.parsed_data;

      // Log the parsed data for debugging
      console.log("Parsed data:", parsedData);

      // Create a comprehensive update object with safe access
      const updatePayload = {
        ...profile,
        // Safely spread personal_info if it exists
        ...(parsedData.personal_info &&
          typeof parsedData.personal_info === "object"
          ? parsedData.personal_info
          : {}),
        // Safely spread professional_summary if it exists
        ...(parsedData.professional_summary &&
          typeof parsedData.professional_summary === "object"
          ? parsedData.professional_summary
          : {}),
        // Update arrays with fallbacks
        skills: parsedData.skills || profile?.skills || [],
        work_experience:
          parsedData.work_experience || profile?.work_experience || [],
        education: parsedData.education || profile?.education || "",
        projects: parsedData.projects || profile?.projects || [],
        certifications:
          parsedData.certifications || profile?.certifications || [],
        languages: parsedData.languages || profile?.languages || [],
        // Safely spread additional_info if it exists
        ...(parsedData.additional_info &&
          typeof parsedData.additional_info === "object"
          ? parsedData.additional_info
          : {}),
        resume_link: response.cv_file_url || profile?.resume_link,
      };

      setEditForm(updatePayload);
      toast.success("Resume parsed successfully! Review and save the changes.");
    } catch (error) {
      console.error("Error parsing resume:", error);
      if (error instanceof Error) {
        toast.error(`Failed to parse resume: ${error.message}`);
      } else {
        toast.error("Failed to parse resume. Please try again.");
      }
    } finally {
      setIsParsing(false);
    }
  };

  // Get company data with fallbacks from both company_data and top-level profile fields
  const getCompanyData = () => {
    return {
      company_name: profile?.company_name || profile?.company_data?.company_name || "",
      industry: profile?.industry || profile?.company_data?.industry || "",
      company_website: profile?.company_website || profile?.company_data?.company_website || "",
      company_size: profile?.company_size || profile?.company_data?.company_size || "",
      founded_year: profile?.company_data?.founded_year || undefined,
      company_description: profile?.company_data?.company_description || "",
      company_culture: profile?.company_data?.company_culture || "",
      contact_email: profile?.company_data?.contact_email || user?.email || "",
      contact_phone: profile?.company_data?.contact_phone || "",
      benefits: profile?.company_data?.benefits || [],
      tech_stack: profile?.company_data?.tech_stack || [],
      is_verified: profile?.company_data?.is_verified || false,
      verification_date: profile?.company_data?.verification_date || null,
      company_logo_url: profile?.company_data?.company_logo_url || "",
    };
  };

  // Render company-specific fields
  const renderCompanyProfile = () => {
    const companyData = getCompanyData();

    return (
      <div className="space-y-6">
        {/* Company Basic Info */}
        <Card>
          <CardHeader>
            <CardTitle>Company Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {editing ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Company Name *
                    </label>
                    <Input
                      value={editForm.company_name || companyData.company_name}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          company_name: e.target.value,
                        })
                      }
                      placeholder="Enter company name"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Industry *
                    </label>
                    <Input
                      value={editForm.industry || companyData.industry}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          industry: e.target.value,
                        })
                      }
                      placeholder="e.g., Technology, Healthcare"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Company Size
                    </label>
                    <Select
                      value={
                        editForm.company_data?.company_size ||
                        companyData.company_size
                      }
                      onValueChange={(value) =>
                        setEditForm({
                          ...editForm,
                          company_data: {
                            ...editForm.company_data,
                            company_size: value as any,
                          },
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select company size" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1-10">1-10 employees</SelectItem>
                        <SelectItem value="11-50">11-50 employees</SelectItem>
                        <SelectItem value="51-200">51-200 employees</SelectItem>
                        <SelectItem value="201-500">
                          201-500 employees
                        </SelectItem>
                        <SelectItem value="501-1000">
                          501-1000 employees
                        </SelectItem>
                        <SelectItem value="1000+">1000+ employees</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Founded Year
                    </label>
                    <Input
                      type="number"
                      value={
                        editForm.company_data?.founded_year ||
                        companyData.founded_year ||
                        ""
                      }
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          company_data: {
                            ...editForm.company_data,
                            founded_year: parseInt(e.target.value) || undefined,
                          },
                        })
                      }
                      placeholder="e.g., 2020"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Company Website
                  </label>
                  <Input
                    value={
                      editForm.company_website || companyData.company_website
                    }
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        company_website: e.target.value,
                      })
                    }
                    placeholder="https://company.com"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Company Description
                  </label>
                  <Textarea
                    value={
                      editForm.company_data?.company_description ||
                      companyData.company_description
                    }
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        company_data: {
                          ...editForm.company_data,
                          company_description: e.target.value,
                        },
                      })
                    }
                    placeholder="Describe your company, mission, and values..."
                    rows={4}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Company Culture
                  </label>
                  <Textarea
                    value={
                      editForm.company_data?.company_culture ||
                      companyData.company_culture
                    }
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        company_data: {
                          ...editForm.company_data,
                          company_culture: e.target.value,
                        },
                      })
                    }
                    placeholder="Describe your company culture..."
                    rows={3}
                  />
                </div>
              </>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold">Company Name</h4>
                    <p className="text-muted-foreground">
                      {companyData.company_name || "Not provided"}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold">Industry</h4>
                    <p className="text-muted-foreground">
                      {companyData.industry || "Not provided"}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold">Company Size</h4>
                    <p className="text-muted-foreground">
                      {companyData.company_size || "Not provided"}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold">Founded Year</h4>
                    <p className="text-muted-foreground">
                      {companyData.founded_year || "Not provided"}
                    </p>
                  </div>
                </div>

                {companyData.company_website && (
                  <div className="flex items-center gap-2">
                    <GlobeIcon className="h-4 w-4" />
                    <a
                      href={companyData.company_website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      {companyData.company_website}
                    </a>
                  </div>
                )}

                {companyData.company_description && (
                  <div>
                    <h4 className="font-semibold mb-2">About Us</h4>
                    <p className="text-muted-foreground">
                      {companyData.company_description}
                    </p>
                  </div>
                )}

                {companyData.company_culture && (
                  <div>
                    <h4 className="font-semibold mb-2">Our Culture</h4>
                    <p className="text-muted-foreground">
                      {companyData.company_culture}
                    </p>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {editing ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Contact Email
                  </label>
                  <Input
                    value={
                      editForm.company_data?.contact_email ||
                      companyData.contact_email
                    }
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        company_data: {
                          ...editForm.company_data,
                          contact_email: e.target.value,
                        },
                      })
                    }
                    placeholder="contact@company.com"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Contact Phone
                  </label>
                  <Input
                    value={
                      editForm.company_data?.contact_phone ||
                      companyData.contact_phone
                    }
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        company_data: {
                          ...editForm.company_data,
                          contact_phone: e.target.value,
                        },
                      })
                    }
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{companyData.contact_email}</span>
                </div>
                {companyData.contact_phone && (
                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{companyData.contact_phone}</span>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Company Benefits */}
        <Card>
          <CardHeader>
            <CardTitle>Company Benefits</CardTitle>
          </CardHeader>
          <CardContent>
            {editing ? (
              <div className="space-y-4">
                <Textarea
                  value={
                    editForm.company_data?.benefits
                      ? JSON.stringify(editForm.company_data.benefits, null, 2)
                      : "[]"
                  }
                  onChange={(e) => {
                    try {
                      const benefits = JSON.parse(e.target.value);
                      setEditForm({
                        ...editForm,
                        company_data: {
                          ...editForm.company_data,
                          benefits,
                        },
                      });
                    } catch { }
                  }}
                  placeholder={`[
  {
    "name": "Health Insurance",
    "description": "Comprehensive health coverage"
  },
  {
    "name": "Remote Work",
    "description": "Work from anywhere"
  }
]`}
                  rows={6}
                />
                <p className="text-sm text-muted-foreground">
                  Enter benefits as JSON array with name and description fields
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {companyData.benefits?.length ? (
                  companyData.benefits.map((benefit, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-3 p-3 border rounded-lg"
                    >
                      <Award className="h-5 w-5 text-blue-500" />
                      <div>
                        <h4 className="font-medium">{benefit.name}</h4>
                        {benefit.description && (
                          <p className="text-sm text-muted-foreground">
                            {benefit.description}
                          </p>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground">No benefits added yet</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Tech Stack */}
        <Card>
          <CardHeader>
            <CardTitle>Tech Stack</CardTitle>
          </CardHeader>
          <CardContent>
            {editing ? (
              <Textarea
                value={editForm.company_data?.tech_stack?.join(", ") || ""}
                onChange={(e) =>
                  setEditForm({
                    ...editForm,
                    company_data: {
                      ...editForm.company_data,
                      tech_stack: e.target.value
                        .split(",")
                        .map((item) => item.trim())
                        .filter(Boolean),
                    },
                  })
                }
                placeholder="React, Node.js, Python, AWS, ..."
              />
            ) : (
              <div className="flex flex-wrap gap-2">
                {companyData.tech_stack?.length ? (
                  companyData.tech_stack.map((tech, index) => (
                    <Badge key={index} variant="secondary">
                      {tech}
                    </Badge>
                  ))
                ) : (
                  <p className="text-muted-foreground">
                    No tech stack specified
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  };

  if (!isAuthenticated) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Access Required</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Please log in to view your profile.
              </p>
              <Button asChild className="w-full">
                <a href="/login">Log In</a>
              </Button>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </Layout>
    );
  }

  const isEmployer = user?.account_type === "employer";
  const companyData = getCompanyData();

  // If user is employer, show only company profile
  if (isEmployer) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/30">
          <div className="container py-8 max-w-4xl mx-auto px-4">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl font-bold">Company Profile</h1>
                <p className="text-muted-foreground mt-2">
                  Manage your company information and hiring preferences
                </p>
              </div>
              {!editing ? (
                <Button
                  onClick={() => setEditing(true)}
                  className="flex items-center gap-2"
                >
                  <Edit3 className="h-4 w-4" />
                  Edit Profile
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button
                    onClick={() => handleSave()}
                    className="flex items-center gap-2"
                  >
                    <Save className="h-4 w-4" />
                    Save
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleCancel}
                    className="flex items-center gap-2"
                  >
                    <X className="h-4 w-4" />
                    Cancel
                  </Button>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              {/* Left Column - Company Logo & Basic Info */}
              <div className="lg:col-span-1 space-y-6">
                <Card>
                  <CardContent className="p-6">
                    <div className="text-center">
                      <Avatar className="h-32 w-32 mx-auto mb-4">
                        <AvatarImage src={companyData.company_logo_url} />
                        <AvatarFallback className="text-2xl">
                          {companyData.company_name
                            ?.split(" ")
                            .map((n) => n[0])
                            .join("")
                            .toUpperCase() || "CO"}
                        </AvatarFallback>
                      </Avatar>

                      {editing ? (
                        <div className="space-y-3">
                          <Input
                            value={
                              editForm.company_name || companyData.company_name
                            }
                            onChange={(e) =>
                              setEditForm({
                                ...editForm,
                                company_name: e.target.value,
                              })
                            }
                            className="text-center font-semibold text-lg"
                            placeholder="Company Name"
                          />
                        </div>
                      ) : (
                        <div>
                          <h2 className="text-2xl font-bold mb-2">
                            {companyData.company_name}
                          </h2>
                          {companyData.industry && (
                            <p className="text-muted-foreground">
                              {companyData.industry}
                            </p>
                          )}
                        </div>
                      )}

                      <Badge variant="secondary" className="mb-4">
                        COMPANY
                        {companyData.is_verified && (
                          <CheckCircle className="h-3 w-3 ml-1 text-green-500" />
                        )}
                      </Badge>
                    </div>

                    <Separator className="my-4" />

                    {/* Company Stats */}
                    <div className="space-y-3">
                      {companyData.industry && (
                        <div className="flex items-center gap-3">
                          <Building className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">
                            {companyData.industry}
                          </span>
                        </div>
                      )}
                      {companyData.company_size && (
                        <div className="flex items-center gap-3">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">
                            {companyData.company_size} employees
                          </span>
                        </div>
                      )}
                      {companyData.founded_year && (
                        <div className="flex items-center gap-3">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">
                            Founded {companyData.founded_year}
                          </span>
                        </div>
                      )}
                      {companyData.company_website && (
                        <div className="flex items-center gap-3">
                          <GlobeIcon className="h-4 w-4 text-muted-foreground" />
                          <a
                            href={companyData.company_website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-blue-600 hover:underline"
                          >
                            Website
                          </a>
                        </div>
                      )}
                    </div>

                    {/* Verification Status */}
                    {companyData.is_verified !== undefined && (
                      <>
                        <Separator className="my-4" />
                        <div
                          className={`flex items-center gap-3 p-3 rounded-lg ${companyData.is_verified
                            ? "bg-green-50 border border-green-200"
                            : "bg-yellow-50 border border-yellow-200"
                            }`}
                        >
                          {companyData.is_verified ? (
                            <>
                              <CheckCircle className="h-5 w-5 text-green-600" />
                              <div>
                                <p className="text-sm font-medium text-green-800">
                                  Verified Company
                                </p>
                                <p className="text-xs text-green-600">
                                  {companyData.verification_date
                                    ? `Verified on ${new Date(
                                      companyData.verification_date
                                    ).toLocaleDateString()}`
                                    : "Verified company"}
                                </p>
                              </div>
                            </>
                          ) : (
                            <>
                              <Star className="h-5 w-5 text-yellow-600" />
                              <div>
                                <p className="text-sm font-medium text-yellow-800">
                                  Verification Pending
                                </p>
                                <p className="text-xs text-yellow-600">
                                  Your company profile is under review
                                </p>
                              </div>
                            </>
                          )}
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Right Column - Company Details */}
              <div className="lg:col-span-3 space-y-6">
                {renderCompanyProfile()}
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  // For non-employers (job seekers), show the regular profile with all features
  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/30">
        <div className="container py-8 max-w-6xl mx-auto px-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold">My Profile</h1>
              <p className="text-muted-foreground mt-2">
                Build your professional profile and showcase your skills
              </p>
            </div>
            {!editing ? (
              <Button
                onClick={() => setEditing(true)}
                className="flex items-center gap-2"
              >
                <Edit3 className="h-4 w-4" />
                Edit Profile
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button
                  onClick={() => handleSave()}
                  className="flex items-center gap-2"
                >
                  <Save className="h-4 w-4" />
                  Save
                </Button>
                <Button
                  variant="outline"
                  onClick={handleCancel}
                  className="flex items-center gap-2"
                >
                  <X className="h-4 w-4" />
                  Cancel
                </Button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Basic Info */}
            <div className="lg:col-span-1 space-y-6">
              {/* Profile Card */}
              <Card>
                <CardContent className="p-6">
                  <div className="text-center">
                    <div className="relative inline-block">
                      <Avatar className="h-24 w-24 mx-auto mb-4">
                        <AvatarImage src={profile?.profile_image_url} />
                        <AvatarFallback className="text-2xl">
                          {profile?.name
                            ?.split(" ")
                            .map((n) => n[0])
                            .join("")
                            .toUpperCase()}
                        </AvatarFallback>
                      </Avatar>

                      {editing && (
                        <div className="absolute bottom-4 right-0">
                          <Button
                            variant="secondary"
                            size="icon"
                            className="h-8 w-8 rounded-full shadow-md"
                            onClick={() => profileImageInputRef.current?.click()}
                          >
                            <Edit3 className="h-4 w-4" />
                          </Button>
                          <input
                            ref={profileImageInputRef}
                            type="file"
                            className="hidden"
                            accept="image/*"
                            onChange={handleImageUpload}
                          />
                        </div>
                      )}
                    </div>

                    {editing ? (
                      <div className="space-y-3">
                        <Input
                          ref={nameInputRef}
                          value={editForm.name || ""}
                          onChange={(e) =>
                            setEditForm({ ...editForm, name: e.target.value })
                          }
                          className="text-center font-semibold"
                          placeholder="Full Name"
                        />
                        <Textarea
                          ref={bioInputRef}
                          value={editForm.bio || ""}
                          onChange={(e) =>
                            setEditForm({ ...editForm, bio: e.target.value })
                          }
                          placeholder="Tell us about yourself..."
                          className="text-center"
                        />
                      </div>
                    ) : (
                      <>
                        <h2 className="text-2xl font-bold mb-2">
                          {profile?.name || "Your Name"}
                        </h2>
                        <p className="text-muted-foreground mb-4">
                          {profile?.bio || "Add a bio to introduce yourself"}
                        </p>
                      </>
                    )}

                    <Badge variant="secondary" className="mb-4">
                      {profile?.account_type?.replace("_", " ").toUpperCase()}
                    </Badge>
                  </div>

                  <Separator className="my-4" />

                  {/* Contact Info */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{profile?.email}</span>
                    </div>

                    {editing ? (
                      <div className="flex items-center gap-3">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <Input
                          ref={phoneInputRef}
                          value={editForm.phone || ""}
                          onChange={(e) =>
                            setEditForm({ ...editForm, phone: e.target.value })
                          }
                          placeholder="Phone number"
                          className="text-sm"
                        />
                      </div>
                    ) : profile?.phone ? (
                      <div className="flex items-center gap-3">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{profile.phone}</span>
                      </div>
                    ) : null}

                    {editing ? (
                      <div className="flex items-center gap-3">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <Input
                          ref={locationInputRef}
                          value={editForm.location || ""}
                          onChange={(e) =>
                            setEditForm({
                              ...editForm,
                              location: e.target.value,
                            })
                          }
                          placeholder="Location"
                          className="text-sm"
                        />
                      </div>
                    ) : profile?.location ? (
                      <div className="flex items-center gap-3">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{profile.location}</span>
                      </div>
                    ) : null}

                    {editing ? (
                      <div className="flex items-center gap-3">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <Input
                          ref={dobInputRef}
                          type="date"
                          value={editForm.date_of_birth || ""}
                          onChange={(e) =>
                            setEditForm({
                              ...editForm,
                              date_of_birth: e.target.value,
                            })
                          }
                          className="text-sm"
                        />
                      </div>
                    ) : profile?.date_of_birth ? (
                      <div className="flex items-center gap-3">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">
                          Born{" "}
                          {new Date(profile.date_of_birth).toLocaleDateString()}
                        </span>
                      </div>
                    ) : null}

                    {editing ? (
                      <div className="flex items-center gap-3">
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                        <Input
                          ref={salaryInputRef}
                          value={editForm.salary_expectation || ""}
                          onChange={(e) =>
                            setEditForm({
                              ...editForm,
                              salary_expectation: e.target.value,
                            })
                          }
                          placeholder="Salary expectation"
                          className="text-sm"
                        />
                      </div>
                    ) : profile?.salary_expectation ? (
                      <div className="flex items-center gap-3">
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">
                          {profile.salary_expectation}
                        </span>
                      </div>
                    ) : null}

                    {editing ? (
                      <div className="flex items-center gap-3">
                        <Briefcase className="h-4 w-4 text-muted-foreground" />
                        <Select
                          value={editForm.preferred_job_type || ""}
                          onValueChange={(value) =>
                            setEditForm({
                              ...editForm,
                              preferred_job_type: value as any,
                            })
                          }
                        >
                          <SelectTrigger className="text-sm">
                            <SelectValue placeholder="Preferred job type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Full-time">Full-time</SelectItem>
                            <SelectItem value="Part-time">Part-time</SelectItem>
                            <SelectItem value="Contract">Contract</SelectItem>
                            <SelectItem value="Internship">
                              Internship
                            </SelectItem>
                            <SelectItem value="Remote">Remote</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    ) : profile?.preferred_job_type ? (
                      <div className="flex items-center gap-3">
                        <Briefcase className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">
                          {profile.preferred_job_type}
                        </span>
                      </div>
                    ) : null}

                    {editing ? (
                      <div className="flex items-center gap-3">
                        <Building className="h-4 w-4 text-muted-foreground" />
                        <Input
                          value={editForm.work_authorization || ""}
                          onChange={(e) =>
                            setEditForm({
                              ...editForm,
                              work_authorization: e.target.value,
                            })
                          }
                          placeholder="Work authorization status"
                          className="text-sm"
                        />
                      </div>
                    ) : profile?.work_authorization ? (
                      <div className="flex items-center gap-3">
                        <Building className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">
                          {profile.work_authorization}
                        </span>
                      </div>
                    ) : null}

                    {editing ? (
                      <div className="flex items-center gap-3">
                        <Briefcase className="h-4 w-4 text-muted-foreground" />
                        <Select
                          value={editForm.availability || ""}
                          onValueChange={(value) =>
                            setEditForm({
                              ...editForm,
                              availability: value as any,
                            })
                          }
                        >
                          <SelectTrigger className="text-sm">
                            <SelectValue placeholder="Availability status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Available">Available</SelectItem>
                            <SelectItem value="Not Available">
                              Not Available
                            </SelectItem>
                            <SelectItem value="Available in 2 weeks">
                              Available in 2 weeks
                            </SelectItem>
                            <SelectItem value="Available in 1 month">
                              Available in 1 month
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    ) : profile?.availability ? (
                      <div className="flex items-center gap-3">
                        <Briefcase className="h-4 w-4 text-muted-foreground" />
                        <span
                          className={`text-sm px-2 py-1 rounded border ${getAvailabilityColor(
                            profile.availability || ""
                          )}`}
                        >
                          {profile.availability}
                        </span>
                      </div>
                    ) : null}

                    {editing ? (
                      <div className="flex items-center gap-3">
                        <GraduationCap className="h-4 w-4 text-muted-foreground" />
                        <Input
                          ref={experience_yearsInputRef}
                          type="number"
                          value={editForm.experience_years || ""}
                          onChange={(e) =>
                            setEditForm({
                              ...editForm,
                              experience_years: parseInt(e.target.value) || 0,
                            })
                          }
                          placeholder="Years of experience"
                          className="text-sm"
                        />
                      </div>
                    ) : profile?.experience_years ? (
                      <div className="flex items-center gap-3">
                        <GraduationCap className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">
                          {profile.experience_years} years experience
                        </span>
                      </div>
                    ) : null}

                    <div className="flex items-center gap-3">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">
                        Joined{" "}
                        {new Date(
                          profile?.created_at || ""
                        ).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <Separator className="my-4" />

                  {/* Social Links */}
                  <div className="space-y-3">
                    {editing ? (
                      <>
                        <div className="flex items-center gap-3">
                          <Linkedin className="h-4 w-4 text-muted-foreground" />
                          <Input
                            ref={linkedinInputRef}
                            value={editForm.linkedin_url || ""}
                            onChange={(e) =>
                              setEditForm({
                                ...editForm,
                                linkedin_url: e.target.value,
                              })
                            }
                            placeholder="LinkedIn URL"
                            className="text-sm"
                          />
                        </div>
                        <div className="flex items-center gap-3">
                          <Github className="h-4 w-4 text-muted-foreground" />
                          <Input
                            value={editForm.github_url || ""}
                            onChange={(e) =>
                              setEditForm({
                                ...editForm,
                                github_url: e.target.value,
                              })
                            }
                            placeholder="GitHub URL"
                            className="text-sm"
                          />
                        </div>
                        <div className="flex items-center gap-3">
                          <Globe className="h-4 w-4 text-muted-foreground" />
                          <Input
                            value={editForm.portfolio_url || ""}
                            onChange={(e) =>
                              setEditForm({
                                ...editForm,
                                portfolio_url: e.target.value,
                              })
                            }
                            placeholder="Portfolio URL"
                            className="text-sm"
                          />
                        </div>
                        <div className="flex items-center gap-3">
                          <Twitter className="h-4 w-4 text-muted-foreground" />
                          <Input
                            ref={twitterInputRef}
                            value={editForm.twitter_url || ""}
                            onChange={(e) =>
                              setEditForm({
                                ...editForm,
                                twitter_url: e.target.value,
                              })
                            }
                            placeholder="Twitter URL"
                            className="text-sm"
                          />
                        </div>
                        <div className="flex items-center gap-3">
                          <Instagram className="h-4 w-4 text-muted-foreground" />
                          <Input
                            value={editForm.instagram_url || ""}
                            onChange={(e) =>
                              setEditForm({
                                ...editForm,
                                instagram_url: e.target.value,
                              })
                            }
                            placeholder="Instagram URL"
                            className="text-sm"
                          />
                        </div>
                        <div className="flex items-center gap-3">
                          <img
                            src={whatsapp}
                            className="h-4 w-4 text-muted-foreground"
                          />
                          <Input
                            value={editForm.whatsapp_dm || ""}
                            onChange={(e) =>
                              setEditForm({
                                ...editForm,
                                whatsapp_dm: e.target.value,
                              })
                            }
                            placeholder="WhatsApp DM"
                            className="text-sm"
                          />
                        </div>
                        <div className="flex items-center gap-3">
                          <img
                            src={stackoverflow}
                            className="h-4 w-4 text-muted-foreground"
                          />
                          <Input
                            ref={stackoverflowInputRef}
                            value={editForm.stackoverflow_url || ""}
                            onChange={(e) =>
                              setEditForm({
                                ...editForm,
                                stackoverflow_url: e.target.value,
                              })
                            }
                            placeholder="Stack Overflow URL"
                            className="text-sm"
                          />
                        </div>
                      </>
                    ) : (
                      <>
                        {profile?.linkedin_url && (
                          <div className="flex items-center gap-3">
                            <Linkedin className="h-4 w-4 text-muted-foreground" />
                            <a
                              href={profile.linkedin_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-blue-600 hover:underline"
                            >
                              LinkedIn
                            </a>
                          </div>
                        )}
                        {profile?.github_url && (
                          <div className="flex items-center gap-3">
                            <Github className="h-4 w-4 text-muted-foreground" />
                            <a
                              href={profile.github_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-blue-600 hover:underline"
                            >
                              GitHub
                            </a>
                          </div>
                        )}
                        {profile?.portfolio_url && (
                          <div className="flex items-center gap-3">
                            <Globe className="h-4 w-4 text-muted-foreground" />
                            <a
                              href={profile.portfolio_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-blue-600 hover:underline"
                            >
                              Portfolio
                            </a>
                          </div>
                        )}
                        {profile?.twitter_url && (
                          <div className="flex items-center gap-3">
                            <Twitter className="h-4 w-4 text-muted-foreground" />
                            <a
                              href={profile.twitter_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-blue-600 hover:underline"
                            >
                              Twitter
                            </a>
                          </div>
                        )}
                        {profile?.instagram_url && (
                          <div className="flex items-center gap-3">
                            <Instagram className="h-4 w-4 text-muted-foreground" />
                            <a
                              href={profile.instagram_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-blue-600 hover:underline"
                            >
                              Instagram
                            </a>
                          </div>
                        )}
                        {profile?.whatsapp_dm && (
                          <div className="flex items-center gap-3">
                            <img
                              src={whatsapp}
                              className="h-4 w-4 text-muted-foreground"
                            />
                            <a
                              href={profile.whatsapp_dm}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-blue-600 hover:underline"
                            >
                              WhatsApp DM
                            </a>
                          </div>
                        )}
                        {profile?.stackoverflow_url && (
                          <div className="flex items-center gap-3">
                            <img
                              src={stackoverflow}
                              className="h-4 w-4 text-muted-foreground"
                            />
                            <a
                              href={profile.stackoverflow_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-blue-600 hover:underline"
                            >
                              Stack Overflow
                            </a>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Resume Management</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Current Resume Link */}
                    {profile?.resume_link && (
                      <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-blue-600" />
                            <span className="text-sm font-medium text-blue-800">
                              Current Resume
                            </span>
                          </div>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" asChild>
                              <a
                                href={profile.resume_link}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <Download className="h-3 w-3 mr-1" />
                                Download
                              </a>
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Resume Upload/Parse */}
                    <div className="border-t pt-4">
                      <p className="text-sm text-muted-foreground mb-3">
                        Upload your resume (PDF or DOCX) to automatically fill
                        in your profile details.
                      </p>
                      <Input
                        type="file"
                        onChange={handleFileChange}
                        accept=".pdf,.docx"
                      />
                      <Button
                        onClick={handleResumeParse}
                        disabled={isParsing || !resumeFile}
                        className="w-full mt-2"
                      >
                        {isParsing ? "Extracting..." : "Extract from CV"}
                        <UploadCloud className="ml-2 h-4 w-4" />
                      </Button>
                    </div>

                    {/* Manual Resume Link */}
                    {editing && (
                      <div className="border-t pt-4">
                        <label className="text-sm font-medium mb-2 block">
                          Resume Link (URL)
                        </label>
                        <Input
                          ref={resumeInputRef}
                          value={editForm.resume_link || ""}
                          onChange={(e) =>
                            setEditForm({
                              ...editForm,
                              resume_link: e.target.value,
                            })
                          }
                          placeholder="https://your-resume-url.com"
                          className="text-sm"
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          Add a direct link to your resume (Google Drive,
                          Dropbox, etc.)
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Quick Stats */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Quick Stats</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Experience</span>
                      <span className="font-medium">
                        {profile?.experience_years || 0} years
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Skills</span>
                      <span className="font-medium">
                        {profile?.skills?.length || 0} skills
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Projects</span>
                      <span className="font-medium">
                        {profile?.projects?.length || 0} projects
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Availability
                      </span>
                      <Badge
                        variant="outline"
                        className={`text-sm ${getAvailabilityColor(
                          profile?.availability || ""
                        )}`}
                      >
                        {profile?.availability || "Not set"}
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          Profile Complete
                        </span>
                        <span className="font-medium">
                          {localCompletionPercentage}%
                        </span>
                      </div>
                      <Progress
                        value={localCompletionPercentage}
                        className={`w-full h-2 ${localCompletionPercentage < 50
                          ? "bg-red-500"
                          : localCompletionPercentage < 75
                            ? "bg-yellow-500"
                            : "bg-green-500"
                          }`}
                        aria-label="Profile completion progress"
                      />
                      {localCompletionPercentage < 100 && (
                        <div className="text-xs text-muted-foreground">
                          <p>Complete your profile by adding:</p>
                          <ul className="list-disc pl-4">
                            {!profile?.name && (
                              <li>
                                <Button
                                  variant="link"
                                  className="text-xs p-0 h-auto"
                                  onClick={() => handleJumpToField("name")}
                                  aria-label="Add name"
                                >
                                  Name
                                </Button>
                              </li>
                            )}
                            {!profile?.bio && (
                              <li>
                                <Button
                                  variant="link"
                                  className="text-xs p-0 h-auto"
                                  onClick={() => handleJumpToField("bio")}
                                  aria-label="Add bio"
                                >
                                  Bio
                                </Button>
                              </li>
                            )}
                            {!profile?.linkedin_url && (
                              <li>
                                <Button
                                  variant="link"
                                  className="text-xs p-0 h-auto"
                                  onClick={() =>
                                    handleJumpToField("linkedin_url")
                                  }
                                  aria-label="Add LinkedIn URL"
                                >
                                  LinkedIn URL
                                </Button>
                              </li>
                            )}
                            {!profile?.skills?.length && (
                              <li>
                                <Button
                                  variant="link"
                                  className="text-xs p-0 h-auto"
                                  onClick={() => handleJumpToField("skills")}
                                  aria-label="Add skills"
                                >
                                  Skills
                                </Button>
                              </li>
                            )}
                            {!profile?.work_experience?.length && (
                              <li>
                                <Button
                                  variant="link"
                                  className="text-xs p-0 h-auto"
                                  onClick={() =>
                                    handleJumpToField("work_experience")
                                  }
                                  aria-label="Add work experience"
                                >
                                  Work Experience
                                </Button>
                              </li>
                            )}
                            {!profile?.education && (
                              <li>
                                <Button
                                  variant="link"
                                  className="text-xs p-0 h-auto"
                                  onClick={() => handleJumpToField("education")}
                                  aria-label="Add education"
                                >
                                  Education
                                </Button>
                              </li>
                            )}
                            {!profile?.preferences && (
                              <li>
                                <Button
                                  variant="link"
                                  className="text-xs p-0 h-auto"
                                  onClick={() =>
                                    handleJumpToField("preferences")
                                  }
                                  aria-label="Add job preferences"
                                >
                                  Job Preferences
                                </Button>
                              </li>
                            )}
                            {!profile?.salary_expectation && (
                              <li>
                                <Button
                                  variant="link"
                                  className="text-xs p-0 h-auto"
                                  onClick={() => handleJumpToField("salary")}
                                  aria-label="Add your expected salary"
                                >
                                  Salary Expectation
                                </Button>
                              </li>
                            )}
                            {!profile?.date_of_birth && (
                              <li>
                                <Button
                                  variant="link"
                                  className="text-xs p-0 h-auto"
                                  onClick={() => handleJumpToField("dob")}
                                  aria-label="Add your date of birth"
                                >
                                  Date of Birth
                                </Button>
                              </li>
                            )}
                            {!profile?.location && (
                              <li>
                                <Button
                                  variant="link"
                                  className="text-xs p-0 h-auto"
                                  onClick={() => handleJumpToField("location")}
                                  aria-label="Add your location"
                                >
                                  Location
                                </Button>
                              </li>
                            )}
                            {!profile?.experience_years && (
                              <li>
                                <Button
                                  variant="link"
                                  className="text-xs p-0 h-auto"
                                  onClick={() =>
                                    handleJumpToField("experience_years")
                                  }
                                  aria-label="Years of experience"
                                >
                                  Years of Experience
                                </Button>
                              </li>
                            )}
                            {!profile?.preferred_job_type && (
                              <li>
                                <Button
                                  variant="link"
                                  className="text-xs p-0 h-auto"
                                  onClick={() => handleJumpToField("job_type")}
                                  aria-label="Preferred job type"
                                >
                                  Preferred Job Type
                                </Button>
                              </li>
                            )}
                            {!profile?.phone && (
                              <li>
                                <Button
                                  variant="link"
                                  className="text-xs p-0 h-auto"
                                  onClick={() => handleJumpToField("phone")}
                                  aria-label="Phone Number"
                                >
                                  Phone Number
                                </Button>
                              </li>
                            )}
                            {!profile?.twitter_url && (
                              <li>
                                <Button
                                  variant="link"
                                  className="text-xs p-0 h-auto"
                                  onClick={() => handleJumpToField("twitter")}
                                  aria-label="Your twitter handle url"
                                >
                                  Twitter
                                </Button>
                              </li>
                            )}
                            {!profile?.stackoverflow_url && (
                              <li>
                                <Button
                                  variant="link"
                                  className="text-xs p-0 h-auto"
                                  onClick={() =>
                                    handleJumpToField("stackoverflow")
                                  }
                                  aria-label="Your twitter handle url"
                                >
                                  Stackoverflow
                                </Button>
                              </li>
                            )}
                            {!profile?.resume_link && (
                              <li>
                                <Button
                                  variant="link"
                                  className="text-xs p-0 h-auto"
                                  onClick={() => handleJumpToField("resume")}
                                  aria-label="resume link"
                                >
                                  Resume Link
                                </Button>
                              </li>
                            )}
                          </ul>
                        </div>
                      )}
                    </div>

                    {profile?.updated_at && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          Last Updated
                        </span>
                        <span className="text-xs">
                          {new Date(profile.updated_at).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Detailed Info */}
            <div className="lg:col-span-2 space-y-6">
              {/* Skills */}
              <Card>
                <CardHeader>
                  <CardTitle>Skills</CardTitle>
                </CardHeader>
                <CardContent>
                  {editing ? (
                    <div className="space-y-4">
                      {editForm.skills?.map((skill, skillIndex) => (
                        <div
                          key={skillIndex}
                          className="flex items-center gap-2"
                        >
                          <Input
                            ref={skillsInputRef}
                            value={skill || ""}
                            onChange={(e) => {
                              const newSkills = [...(editForm.skills || [])];
                              newSkills[skillIndex] = e.target.value;
                              setEditForm({ ...editForm, skills: newSkills });
                            }}
                            placeholder="Enter a skill"
                            className="w-full"
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const newSkills = [...(editForm.skills || [])];
                              newSkills.splice(skillIndex, 1);
                              setEditForm({ ...editForm, skills: newSkills });
                            }}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setEditForm({
                            ...editForm,
                            skills: [...(editForm.skills || []), ""],
                          });
                        }}
                      >
                        <Plus className="h-4 w-4" />
                        Add Skill
                      </Button>
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {profile?.skills?.map((skill, index) => (
                        <Badge key={index} variant="secondary">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Work Experience */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Briefcase className="h-5 w-5" />
                    Work Experience
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {editing ? (
                    <div className="space-y-6">
                      {editForm.work_experience?.map((exp, index) => (
                        <div
                          key={index}
                          className="border rounded-lg p-4 space-y-4"
                        >
                          <Input
                            ref={workExperienceInputRef}
                            value={exp.position || ""}
                            onChange={(e) => {
                              const newExperience = [
                                ...(editForm.work_experience || []),
                              ];
                              newExperience[index] = {
                                ...newExperience[index],
                                position: e.target.value,
                              };
                              setEditForm({
                                ...editForm,
                                work_experience: newExperience,
                              });
                            }}
                            placeholder="Position"
                            className="w-full"
                          />

                          <Input
                            value={exp.company || ""}
                            onChange={(e) => {
                              const newExperience = [
                                ...(editForm.work_experience || []),
                              ];
                              newExperience[index] = {
                                ...newExperience[index],
                                company: e.target.value,
                              };
                              setEditForm({
                                ...editForm,
                                work_experience: newExperience,
                              });
                            }}
                            placeholder="Company"
                            className="w-full"
                          />
                          <Input
                            value={exp.duration || ""}
                            onChange={(e) => {
                              const newExperience = [
                                ...(editForm.work_experience || []),
                              ];
                              newExperience[index] = {
                                ...newExperience[index],
                                duration: e.target.value,
                              };
                              setEditForm({
                                ...editForm,
                                work_experience: newExperience,
                              });
                            }}
                            placeholder="Duration"
                            className="w-full"
                          />
                          <Textarea
                            value={exp.description || ""}
                            onChange={(e) => {
                              const newExperience = [
                                ...(editForm.work_experience || []),
                              ];
                              newExperience[index] = {
                                ...newExperience[index],
                                description: e.target.value,
                              };
                              setEditForm({
                                ...editForm,
                                work_experience: newExperience,
                              });
                            }}
                            placeholder="Description"
                            rows={3}
                          />
                        </div>
                      ))}
                      <Button
                        variant="outline"
                        onClick={() => {
                          const newExperience = [
                            ...(editForm.work_experience || []),
                            {
                              position: "",
                              company: "",
                              duration: "",
                              description: "",
                            },
                          ];
                          setEditForm({
                            ...editForm,
                            work_experience: newExperience,
                          });
                        }}
                        className="w-full"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add New Work Experience
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {profile?.work_experience?.map((exp, index) => (
                        <div
                          key={index}
                          className="border-l-2 border-primary/20 pl-4"
                        >
                          <h4 className="font-semibold">{exp.position}</h4>
                          <p className="text-muted-foreground">{exp.company}</p>
                          <p className="text-sm text-muted-foreground">
                            {exp.duration}
                          </p>
                          <p className="text-sm mt-2">{exp.description}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Education */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <GraduationCap className="h-5 w-5" />
                    Education
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {editing ? (
                    <div className="space-y-6">
                      {(() => {
                        // Parse education into array format for editing
                        const eduEntries: Array<{ degree: string; institution: string; duration: string }> = (() => {
                          if (Array.isArray(editForm.education)) {
                            return editForm.education.map((e: any) => ({
                              degree: e.degree || '',
                              institution: e.institution || '',
                              duration: e.start_year && e.end_year ? `${e.start_year}-${e.end_year}` : (e.duration || ''),
                            }));
                          }
                          if (typeof editForm.education === 'string' && editForm.education.trim()) {
                            return editForm.education.split('\n').filter((line: string) => line.trim()).map((line: string) => {
                              const parts = line.trim().split(',').map((p: string) => p.trim());
                              return {
                                degree: parts[0] || line.trim(),
                                institution: parts[1] || '',
                                duration: parts.slice(2).join(',').trim() || '',
                              };
                            });
                          }
                          return [{ degree: '', institution: '', duration: '' }];
                        })();

                        const updateEntry = (index: number, field: string, value: string) => {
                          const updated = [...eduEntries];
                          updated[index] = { ...updated[index], [field]: value };
                          // Store as string format "degree, institution, duration" per line
                          const asString = updated
                            .map(e => [e.degree, e.institution, e.duration].filter(Boolean).join(', '))
                            .join('\n');
                          setEditForm({ ...editForm, education: asString });
                        };

                        return (
                          <>
                            {eduEntries.map((edu, index) => (
                              <div key={index} className="border rounded-lg p-4 space-y-4">
                                <Input
                                  ref={index === 0 ? educationInputRef : undefined}
                                  value={edu.degree}
                                  onChange={(e) => updateEntry(index, 'degree', e.target.value)}
                                  placeholder="Degree (e.g., BSc in Computer Science)"
                                  className="w-full"
                                />
                                <Input
                                  value={edu.institution}
                                  onChange={(e) => updateEntry(index, 'institution', e.target.value)}
                                  placeholder="Institution"
                                  className="w-full"
                                />
                                <Input
                                  value={edu.duration}
                                  onChange={(e) => updateEntry(index, 'duration', e.target.value)}
                                  placeholder="Duration (e.g., 2020-2024)"
                                  className="w-full"
                                />
                              </div>
                            ))}
                            <Button
                              variant="outline"
                              onClick={() => {
                                const currentStr = typeof editForm.education === 'string' ? editForm.education : '';
                                const newStr = currentStr ? currentStr + '\n, , ' : ', , ';
                                setEditForm({ ...editForm, education: newStr });
                              }}
                              className="w-full"
                            >
                              <Plus className="h-4 w-4 mr-2" />
                              Add New Education
                            </Button>
                          </>
                        );
                      })()}
                    </div>
                  ) : profile?.education ? (
                    <div className="space-y-4">
                      {typeof profile.education === 'string' ? (
                        profile.education.split('\n').filter(line => line.trim()).map((line, i) => {
                          // Parse "Degree, Institution, Duration" format
                          const parts = line.trim().split(',').map(p => p.trim());
                          const degree = parts[0] || line.trim();
                          const institution = parts[1] || '';
                          const duration = parts.slice(2).join(',').trim() || '';
                          return (
                            <div
                              key={i}
                              className="border-l-2 border-primary/20 pl-4"
                            >
                              <h4 className="font-semibold">{degree}</h4>
                              {institution && (
                                <p className="text-muted-foreground">{institution}</p>
                              )}
                              {duration && (
                                <p className="text-sm text-muted-foreground">{duration}</p>
                              )}
                            </div>
                          );
                        })
                      ) : Array.isArray(profile.education) ? (
                        profile.education.map((edu: any, i: number) => (
                          <div
                            key={i}
                            className="border-l-2 border-primary/20 pl-4"
                          >
                            <h4 className="font-semibold">{edu.degree}</h4>
                            <p className="text-muted-foreground">
                              {edu.institution}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {edu.start_year} – {edu.end_year}
                            </p>
                          </div>
                        ))
                      ) : null}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">
                      No education info provided
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Projects */}
              <Card>
                <CardHeader>
                  <CardTitle>Projects</CardTitle>
                </CardHeader>
                <CardContent ref={projectsInputRef}>
                  {editing ? (
                    <div className="space-y-6">
                      {editForm.projects &&
                        editForm.projects.length > 0 &&
                        editForm.projects.map((project, index) => (
                          <div
                            key={index}
                            className="border rounded-lg p-4 space-y-4"
                          >
                            <Input
                              value={project.name || ""}
                              onChange={(e) => {
                                const newProjects = [
                                  ...(editForm.projects || []),
                                ];
                                newProjects[index] = {
                                  ...newProjects[index],
                                  name: e.target.value,
                                };
                                setEditForm({
                                  ...editForm,
                                  projects: newProjects,
                                });
                              }}
                              placeholder="Project Name"
                              className="w-full"
                            />
                            <Textarea
                              value={project.description || ""}
                              onChange={(e) => {
                                const newProjects = [
                                  ...(editForm.projects || []),
                                ];
                                newProjects[index] = {
                                  ...newProjects[index],
                                  description: e.target.value,
                                };
                                setEditForm({
                                  ...editForm,
                                  projects: newProjects,
                                });
                              }}
                              placeholder="Description"
                              rows={3}
                            />
                            <Input
                              value={project.url || ""}
                              onChange={(e) => {
                                const newProjects = [
                                  ...(editForm.projects || []),
                                ];
                                newProjects[index] = {
                                  ...newProjects[index],
                                  url: e.target.value,
                                };
                                setEditForm({
                                  ...editForm,
                                  projects: newProjects,
                                });
                              }}
                              placeholder="project url (optional)"
                              className="w-full"
                            />
                            <Input
                              value={project.tech_stack?.join(", ") || ""}
                              onChange={(e) => {
                                const newProjects = [
                                  ...(editForm.projects || []),
                                ];
                                newProjects[index] = {
                                  ...newProjects[index],
                                  tech_stack: e.target.value
                                    .split(",")
                                    .map((tech) => tech.trim()),
                                };
                                setEditForm({
                                  ...editForm,
                                  projects: newProjects,
                                });
                              }}
                              onBlur={(e) => {
                                // Clean up empty entries when user finishes editing
                                const newProjects = [
                                  ...(editForm.projects || []),
                                ];
                                newProjects[index] = {
                                  ...newProjects[index],
                                  tech_stack: e.target.value
                                    .split(",")
                                    .map((tech) => tech.trim())
                                    .filter((tech) => tech),
                                };
                                setEditForm({
                                  ...editForm,
                                  projects: newProjects,
                                });
                              }}
                              placeholder="Tech Stack (comma-separated)"
                              className="w-full"
                            />
                          </div>
                        ))}
                      <Button
                        variant="outline"
                        onClick={() => {
                          const newProjects = [
                            ...(editForm.projects || []),
                            {
                              name: "",
                              description: "",
                              url: "",
                              tech_stack: [],
                            },
                          ];
                          setEditForm({ ...editForm, projects: newProjects });
                        }}
                        className="w-full"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add New Project
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {profile?.projects?.map((project, index) => (
                        <div key={index} className="border rounded-lg p-4">
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="font-semibold">{project.name}</h4>
                            {project.url && (
                              <a
                                href={project.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm text-blue-600 hover:underline"
                              >
                                View Project
                              </a>
                            )}
                          </div>
                          <p className="text-muted-foreground text-sm mb-2">
                            {project.description}
                          </p>
                          <div className="flex flex-wrap gap-1">
                            {project.tech_stack?.map((tech, techIndex) => (
                              <Badge
                                key={techIndex}
                                variant="outline"
                                className="text-xs"
                              >
                                {tech}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Languages & Certifications */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Languages</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {editing ? (
                      <Input
                        value={editForm.languages?.join(", ") || ""}
                        onChange={(e) => {
                          // Don't split immediately - just store the raw string
                          const value = e.target.value;
                          setEditForm({
                            ...editForm,
                            languages: [value], // Store as single item temporarily
                          });
                        }}
                        onBlur={(e) => {
                          // Split only on blur to allow typing commas
                          const value = e.target.value;
                          setEditForm({
                            ...editForm,
                            languages: value
                              .split(",")
                              .map((lang) => lang.trim())
                              .filter((lang) => lang),
                          });
                        }}
                        placeholder="e.g., English, Spanish, French"
                      />
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {profile?.languages?.length ? (
                          profile.languages.map((lang, i) => (
                            <Badge key={i} variant="outline">
                              {lang}
                            </Badge>
                          ))
                        ) : (
                          <p className="text-muted-foreground">
                            No languages added
                          </p>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Certifications</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {editing ? (
                      <Input
                        value={editForm.certifications?.join(", ") || ""}
                        onChange={(e) => {
                          // Don't split immediately - just store the raw string
                          const value = e.target.value;
                          setEditForm({
                            ...editForm,
                            certifications: [value], // Store as single item temporarily
                          });
                        }}
                        onBlur={(e) => {
                          // Split only on blur to allow typing commas
                          const value = e.target.value;
                          setEditForm({
                            ...editForm,
                            certifications: value
                              .split(",")
                              .map((cert) => cert.trim())
                              .filter((cert) => cert),
                          });
                        }}
                        placeholder="e.g., AWS Certified, PMP, CISSP"
                      />
                    ) : (
                      <div className="space-y-2">
                        {profile?.certifications?.length ? (
                          profile.certifications.map((cert, i) => (
                            <div key={i} className="text-sm">
                              {cert}
                            </div>
                          ))
                        ) : (
                          <p className="text-muted-foreground">
                            No certifications added
                          </p>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Preferences */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    Job Preferences
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {editing ? (
                    <Textarea
                      ref={preferencesInputRef}
                      value={JSON.stringify(
                        editForm.preferences || {},
                        null,
                        2
                      )}
                      onChange={(e) => {
                        try {
                          const preferences = JSON.parse(e.target.value);
                          setEditForm({ ...editForm, preferences });
                        } catch { }
                      }}
                      placeholder={`{
  "remote_work": true,
  "travel_willingness": "low",
  "company_size": "startup",
  "industry_preferences": ["tech", "finance"]
}`}
                      rows={6}
                    />
                  ) : profile?.preferences &&
                    Object.keys(profile.preferences).length > 0 ? (
                    <div className="space-y-2">
                      {Object.entries(profile.preferences).map(([k, v]) => (
                        <div key={k} className="flex justify-between text-sm">
                          <span className="text-muted-foreground capitalize">
                            {k.replace("_", " ")}
                          </span>
                          <span className="font-medium">
                            {Array.isArray(v) ? v.join(", ") : String(v)}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-sm">
                      No job preferences set
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Profile;
