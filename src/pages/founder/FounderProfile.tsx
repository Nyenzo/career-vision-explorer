// src/pages/founder/FounderProfile.tsx
import React, { useState, useEffect, useCallback } from "react";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Briefcase,
  MapPin,
  Target,
  Code,
  Users,
  GraduationCap,
  Award,
  Building,
  Calendar,
  Edit3,
  Globe,
  Linkedin,
  ExternalLink,
  ArrowLeft,
  Save,
  Loader2,
  Camera,
  X,
  Plus,
  Upload,
} from "lucide-react";
import { toast } from "sonner";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";
import { apiClient } from "@/lib/api-client";
import { cofounderMatchingService } from "@/services/founder-matching.service";

// Define the profile type
interface FounderProfileData {
  id: string;
  user_id: string;
  current_role: string;
  years_experience: number;
  technical_skills: string[];
  soft_skills: string[];
  seeking_roles: string[];
  industries: string[];
  commitment_level: string;
  location_preference: string;
  preferred_locations: string[];
  achievements: string[];
  education: string[];
  certifications: string[];
  bio: string;
  linkedin_url: string;
  portfolio_url: string;
    intent_type?: string;
    looking_for?: string;
    looking_for_description?: string;
    idea_description?: string;
    problem_statement?: string;
    projects?: any[];
  photo_urls: string[];
  created_at: string;
  updated_at: string;
  views_count: number;
  matches_count: number;
  interested_count: number;
  is_public: boolean;
}

interface PhotoUploadResponse {
  status: string;
  image_url: string;
  photo_count: number;
  can_match: boolean;
  photos_needed: number;
  message: string;
}

const FounderProfile = () => {
  const navigate = useNavigate();
  const { profileId } = useParams(); // Get profileId from URL if present
  const [searchParams] = useSearchParams();
  const matchId = searchParams.get("match_id");
  const { user } = useAuth(); // Get current user

  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [isOwnProfile, setIsOwnProfile] = useState(false);
  const [profileData, setProfileData] = useState<FounderProfileData | null>(
    null
  );
  const [editFormData, setEditFormData] = useState<Partial<FounderProfileData>>(
    {}
  );
  const [projects, setProjects] = useState<any[]>([]);
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [projectForm, setProjectForm] = useState({
    title: "",
    description: "",
    roles_needed: "",
    tech_stack: "",
  });
  const [joiningProjectId, setJoiningProjectId] = useState<string | null>(null);
  const [stats, setStats] = useState({
    profile_views: 0,
    total_matches: 0,
    pending_actions: 0,
  });
  const [apiError, setApiError] = useState<string | null>(null);
  const [photoUploading, setPhotoUploading] = useState(false);
  const [photoDeleting, setPhotoDeleting] = useState<string | null>(null);

  const fetchProfileData = useCallback(async () => {
    setFetching(true);
    setApiError(null);

    try {
      let data;
      let endpoint;

      if (profileId) {
        // Fetch another user's profile by ID
        endpoint = `/cofounder-matching/profiles/${profileId}`;
        console.log(`Fetching profile by ID: ${endpoint}`);
        data = await apiClient.get<FounderProfileData>(endpoint);

        // Check if this is the current user's profile
        const currentUserId = user?.id || user?.user_id || user?.sub;
        console.log(
          "Current user ID:",
          currentUserId,
          "Profile user ID:",
          data.user_id
        );
        setIsOwnProfile(data.user_id === currentUserId);
      } else {
        // Fetch current user's own profile
        endpoint = "/cofounder-matching/profile";
        console.log(`Fetching current user's profile: ${endpoint}`);
        data = await apiClient.get<FounderProfileData>(endpoint);
        setIsOwnProfile(true);
      }

      console.log("Profile data received:", data);
      setProfileData(data);
      setEditFormData(data);
      
      // Fetch projects from idea_projects table if founder_with_idea
      let projectsList = data.projects || [];
      if (data.intent_type === "founder_with_idea") {
        try {
          const ideaProject = await apiClient.get("/cofounder-matching/idea-project");
          if (ideaProject) {
            projectsList = [{
              id: ideaProject.id,
              title: ideaProject.title || "My Startup Idea",
              description: ideaProject.idea_description || "",
              problem_statement: ideaProject.problem_statement || "",
              roles_needed: ideaProject.looking_for_description ? [ideaProject.looking_for_description] : [],
              tech_stack: ideaProject.tech_stack || [],
              is_idea: true // flag to indicate this is from onboarding
            }];
          }
        } catch (ideaErr) {
          console.log("No idea project found or error fetching:", ideaErr);
        }
      }
      setProjects(projectsList);

      // Only fetch stats when viewing own profile
      if (!profileId) {
        try {
          const statsResponse = await apiClient.get<{
            profile_views: number;
            total_matches: number;
            pending_actions: number;
          }>("/cofounder-matching/statistics");
          setStats({
            profile_views: statsResponse.profile_views || 0,
            total_matches: statsResponse.total_matches || 0,
            pending_actions: statsResponse.pending_actions || 0,
          });
        } catch (statsError) {
          console.warn("Failed to fetch match statistics", statsError);
        }
      }
    } catch (error: any) {
      console.error("Failed to fetch profile:", error);

      // Check if it's a 404 (profile not found)
      if (error.status === 404) {
        if (!profileId) {
          // It's the current user's profile and it doesn't exist yet
          setProfileData(null);
          setIsOwnProfile(true);
          toast.info("You haven't created a founder profile yet");
        } else {
          setApiError("The profile you're looking for doesn't exist");
          toast.error("Profile not found");
        }
      } else if (error.status === 401) {
        setApiError("Please log in to view this profile");
        toast.error("Authentication required");
      } else {
        setApiError("Failed to load profile data");
        toast.error("Failed to load profile data");
      }

      // If it's your own profile and not found, set isOwnProfile to true
      if (!profileId) {
        setIsOwnProfile(true);
      }
    } finally {
      setFetching(false);
    }
  }, [profileId, user]);

  useEffect(() => {
    fetchProfileData();
  }, [fetchProfileData]);

  const handleSave = async () => {
    if (!profileData) return;

    setLoading(true);
    try {
      const endpoint = isOwnProfile
        ? `/cofounder-matching/profile`
        : `/cofounder-matching/profiles/${profileId}`;

      console.log("Saving profile to:", endpoint, editFormData);
      const response = await apiClient.put<FounderProfileData>(
        endpoint,
        editFormData
      );

      setProfileData(response);
      
      // Initialize projects same way as on load
      let projectsList = response.projects || [];
      if (projectsList.length === 0 && response.intent_type === "founder_with_idea" && response.idea_description) {
        projectsList = [{
          id: "idea-project",
          title: "My Startup Idea",
          description: response.idea_description || "",
          problem_statement: response.problem_statement || "",
          roles_needed: response.looking_for_description ? [response.looking_for_description] : [],
          tech_stack: [],
          is_idea: true
        }];
      }
      setProjects(projectsList);
      
      setIsEditing(false);
      toast.success("Profile updated successfully!");
    } catch (error) {
      console.error("Failed to update profile:", error);
      toast.error("Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  // If still fetching, show loader
  if (fetching) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-b from-blue-50/50 to-white flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <p className="text-slate-600">Loading profile...</p>
          </div>
        </div>
      </Layout>
    );
  }

  // If it's your own profile but doesn't exist yet, show create profile screen
  if (isOwnProfile && !profileData) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-b from-blue-50/50 to-white">
          <div className="max-w-4xl mx-auto p-4 py-8">
            <div className="text-center py-12">
              <div className="h-20 w-20 mx-auto bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mb-6">
                <Briefcase className="h-10 w-10 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">
                No Founder Profile Yet
              </h2>
              <p className="text-slate-600 mb-6 max-w-md mx-auto">
                You haven't created a founder profile yet. Create one to start
                finding co-founders and building your dream startup team.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  onClick={() => navigate("/founder/onboarding")}
                  size="lg"
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                >
                  Create Founder Profile
                </Button>
                <Button
                  variant="outline"
                  onClick={() => navigate("/founder/dashboard")}
                  size="lg"
                >
                  Back to Dashboard
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  // If it's another user's profile but doesn't exist
  if (!isOwnProfile && !profileData) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-b from-blue-50/50 to-white">
          <div className="max-w-4xl mx-auto p-4 py-8">
            <div className="text-center py-12">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">
                Profile Not Found
              </h2>
              <p className="text-slate-600 mb-6">
                {apiError ||
                  "The profile you're looking for doesn't exist or has been removed."}
              </p>
              <Button onClick={() => navigate("/founder/dashboard")}>
                Back to Dashboard
              </Button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  // Rest of the component remains the same...
  const handleEditFieldChange = (
    field: keyof FounderProfileData,
    value: any
  ) => {
    setEditFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleAddSkill = (type: "technical" | "soft", skill: string) => {
    if (!skill.trim()) return;

    const field = type === "technical" ? "technical_skills" : "soft_skills";
    const currentSkills = editFormData[field] || [];

    if (!currentSkills.includes(skill)) {
      handleEditFieldChange(field, [...currentSkills, skill]);
    }
  };

  const handleRemoveSkill = (type: "technical" | "soft", index: number) => {
    const field = type === "technical" ? "technical_skills" : "soft_skills";
    const currentSkills = [...(editFormData[field] || [])];
    currentSkills.splice(index, 1);
    handleEditFieldChange(field, currentSkills);
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    // Validate file size (10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Image must be less than 10MB');
      return;
    }

    setPhotoUploading(true);
    try {
      const response = await cofounderMatchingService.uploadPhoto(file);
      
      toast.success(response.message || 'Photo uploaded successfully!');
      
      // Refresh profile data
      await fetchProfileData();
    } catch (error: any) {
      console.error('Photo upload failed:', error);
      toast.error(error.message || 'Failed to upload photo');
    } finally {
      setPhotoUploading(false);
      // Reset file input
      e.target.value = '';
    }
  };

  const handlePhotoDelete = async (photoUrl: string) => {
    if (!confirm('Are you sure you want to delete this photo?')) return;

    setPhotoDeleting(photoUrl);
    try {
      const response = await cofounderMatchingService.deletePhoto(photoUrl);
      
      toast.success(response.message || 'Photo deleted successfully');
      
      // Refresh profile data
      await fetchProfileData();
    } catch (error: any) {
      console.error('Photo delete failed:', error);
      toast.error(error.message || 'Failed to delete photo');
    } finally {
      setPhotoDeleting(null);
    }
  };

  const displayData = isEditing ? editFormData : profileData!;

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-b from-blue-50/50 to-white">
        <div className="max-w-4xl mx-auto p-4 py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <Button
              variant="ghost"
              onClick={() => navigate("/founder/dashboard")}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Button>

            {/* Only show edit button for own profile */}
            {isOwnProfile && !isEditing && (
              <div className="flex items-center gap-4">
                <Button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-2"
                >
                  <Edit3 className="h-4 w-4" />
                  Edit Profile
                </Button>
              </div>
            )}

            {isEditing && (
              <div className="flex items-center gap-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsEditing(false);
                    setEditFormData(profileData!);
                  }}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={loading}
                  className="flex items-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>

          {/* Profile Stats - only show for own profile */}
          {isOwnProfile && (
            <Card className="mb-6 border-blue-200">
              <CardContent className="p-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {stats.profile_views || 0}
                    </div>
                    <div className="text-sm text-slate-600">Profile Views</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-indigo-600">
                      {stats.total_matches || 0}
                    </div>
                    <div className="text-sm text-slate-600">Connections</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {stats.pending_actions || 0}
                    </div>
                    <div className="text-sm text-slate-600">Interested in You</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-slate-600">
                      {profileData!.years_experience || 0}+
                    </div>
                    <div className="text-sm text-slate-600">Years Experience</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="grid md:grid-cols-3 gap-6">
            {/* Left Column - Basic Info */}
            <div className="md:col-span-2 space-y-6">
              {/* Photo Gallery - Only show for own profile */}
              {isOwnProfile && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Camera className="h-5 w-5 text-blue-600" />
                        Profile Photos ({displayData.photo_urls?.length || 0}/10)
                      </div>
                      {(displayData.photo_urls?.length || 0) < 3 && (
                        <Badge variant="destructive" className="text-xs">
                          {3 - (displayData.photo_urls?.length || 0)} more needed
                        </Badge>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-4">
                      {displayData.photo_urls?.map((photoUrl, index) => (
                        <div key={index} className="relative group aspect-square">
                          <img
                            src={photoUrl}
                            alt={`Profile ${index + 1}`}
                            className="w-full h-full object-cover rounded-lg border-2 border-slate-200"
                          />
                          {photoDeleting === photoUrl && (
                            <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
                              <Loader2 className="h-6 w-6 text-white animate-spin" />
                            </div>
                          )}
                          <Button
                            size="icon"
                            variant="destructive"
                            className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => handlePhotoDelete(photoUrl)}
                            disabled={photoDeleting === photoUrl}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                          {index === 0 && (
                            <Badge className="absolute bottom-2 left-2 text-xs bg-blue-600">
                              Primary
                            </Badge>
                          )}
                        </div>
                      ))}
                      
                      {/* Upload button */}
                      {(displayData.photo_urls?.length || 0) < 10 && (
                        <label className="aspect-square border-2 border-dashed border-slate-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-blue-400 hover:bg-blue-50/50 transition-all group">
                          <input
                            type="file"
                            className="hidden"
                            accept="image/*"
                            onChange={handlePhotoUpload}
                            disabled={photoUploading}
                          />
                          {photoUploading ? (
                            <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
                          ) : (
                            <>
                              <Plus className="h-8 w-8 text-slate-400 group-hover:text-blue-600 transition-colors" />
                              <span className="text-xs text-slate-500 mt-2 group-hover:text-blue-600">
                                Add Photo
                              </span>
                            </>
                          )}
                        </label>
                      )}
                    </div>
                    
                    {(displayData.photo_urls?.length || 0) < 3 && (
                      <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                        <p className="text-sm text-amber-800">
                          <strong>Note:</strong> You need at least 3 photos to start matching with other founders.
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Role & Bio */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Briefcase className="h-5 w-5 text-blue-600" />
                    About
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    {isEditing ? (
                      <input
                        type="text"
                        value={displayData.current_role || ""}
                        onChange={(e) =>
                          handleEditFieldChange("current_role", e.target.value)
                        }
                        className="text-2xl font-bold text-slate-900 w-full p-2 border rounded"
                        placeholder="Enter your current role"
                      />
                    ) : (
                      <h2 className="text-2xl font-bold text-slate-900">
                        {displayData.current_role}
                      </h2>
                    )}
                    <div className="flex items-center gap-2 mt-2">
                      <Calendar className="h-4 w-4 text-slate-400" />
                      <span className="text-slate-600">
                        {displayData.years_experience || 0} years experience
                      </span>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold text-slate-900 mb-2">
                      Bio
                    </h3>
                    {isEditing ? (
                      <textarea
                        value={displayData.bio || ""}
                        onChange={(e) =>
                          handleEditFieldChange("bio", e.target.value)
                        }
                        className="w-full p-2 border rounded min-h-[120px]"
                        placeholder="Tell us about yourself..."
                      />
                    ) : (
                      <p className="text-slate-700 leading-relaxed">
                        {displayData.bio || "No bio provided"}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Skills */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Code className="h-5 w-5 text-blue-600" />
                    Skills & Expertise
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900 mb-2">
                      Technical Skills
                    </h3>
                    {isEditing ? (
                      <div className="space-y-2">
                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder="Add a technical skill"
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                handleAddSkill(
                                  "technical",
                                  e.currentTarget.value
                                );
                                e.currentTarget.value = "";
                              }
                            }}
                            className="flex-1 p-2 border rounded"
                          />
                          <Button
                            type="button"
                            size="sm"
                            onClick={(e) => {
                              const input = e.currentTarget
                                .previousElementSibling as HTMLInputElement;
                              handleAddSkill("technical", input.value);
                              input.value = "";
                            }}
                          >
                            Add
                          </Button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {displayData.technical_skills?.map((skill, index) => (
                            <Badge key={index} className="px-3 py-1">
                              {skill}
                              <button
                                onClick={() =>
                                  handleRemoveSkill("technical", index)
                                }
                                className="ml-2 hover:text-red-500"
                              >
                                ×
                              </button>
                            </Badge>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {displayData.technical_skills?.map((skill, index) => (
                          <Badge key={index} className="px-3 py-1">
                            {skill}
                          </Badge>
                        )) || (
                          <p className="text-slate-500">
                            No technical skills listed
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold text-slate-900 mb-2">
                      Soft Skills
                    </h3>
                    {isEditing ? (
                      <div className="space-y-2">
                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder="Add a soft skill"
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                handleAddSkill("soft", e.currentTarget.value);
                                e.currentTarget.value = "";
                              }
                            }}
                            className="flex-1 p-2 border rounded"
                          />
                          <Button
                            type="button"
                            size="sm"
                            onClick={(e) => {
                              const input = e.currentTarget
                                .previousElementSibling as HTMLInputElement;
                              handleAddSkill("soft", input.value);
                              input.value = "";
                            }}
                          >
                            Add
                          </Button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {displayData.soft_skills?.map((skill, index) => (
                            <Badge
                              key={index}
                              variant="outline"
                              className="px-3 py-1"
                            >
                              {skill}
                              <button
                                onClick={() => handleRemoveSkill("soft", index)}
                                className="ml-2 hover:text-red-500"
                              >
                                ×
                              </button>
                            </Badge>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {displayData.soft_skills?.map((skill, index) => (
                          <Badge
                            key={index}
                            variant="outline"
                            className="px-3 py-1"
                          >
                            {skill}
                          </Badge>
                        )) || (
                          <p className="text-slate-500">
                            No soft skills listed
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Looking For */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-blue-600" />
                    Looking For
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900 mb-2">
                      Co-founder Roles
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {displayData.seeking_roles?.map((role, index) => (
                        <Badge
                          key={index}
                          className="px-3 py-1 bg-purple-100 text-purple-700"
                        >
                          {role}
                        </Badge>
                      )) || (
                        <p className="text-slate-500">
                          No specific roles sought
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold text-slate-900 mb-2">
                      Industries
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {displayData.industries?.map((industry, index) => (
                        <Badge
                          key={index}
                          variant="outline"
                          className="px-3 py-1"
                        >
                          {industry}
                        </Badge>
                      )) || (
                        <p className="text-slate-500">
                          No industries specified
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Details */}
            <div className="space-y-6">
              {/* Quick Details */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-blue-600" />
                    Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <MapPin className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">
                        Location Preference
                      </p>
                      <p className="font-medium">
                        {displayData.location_preference || "Not specified"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                      <Calendar className="h-5 w-5 text-indigo-600" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">Commitment</p>
                      <p className="font-medium">
                        {displayData.commitment_level || "Not specified"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <Building className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">
                        Preferred Locations
                      </p>
                      <p className="font-medium">
                        {displayData.preferred_locations?.join(", ") ||
                          "Not specified"}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Achievements */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="h-5 w-5 text-blue-600" />
                    Achievements
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {displayData.achievements?.map((achievement, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <div className="h-2 w-2 rounded-full bg-blue-500 mt-2 flex-shrink-0" />
                      <p className="text-sm text-slate-700">{achievement}</p>
                    </div>
                  )) || (
                    <p className="text-slate-500 text-sm">
                      No achievements listed
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Education & Links */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <GraduationCap className="h-5 w-5 text-blue-600" />
                    Background
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900 mb-2">
                      Education
                    </h3>
                    <div className="space-y-2">
                      {displayData.education?.map((edu, index) => (
                        <p key={index} className="text-sm text-slate-700">
                          {edu}
                        </p>
                      )) || (
                        <p className="text-slate-500 text-sm">
                          No education listed
                        </p>
                      )}
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="text-sm font-semibold text-slate-900 mb-2">
                      Links
                    </h3>
                    <div className="space-y-2">
                      {displayData.linkedin_url && (
                        <a
                          href={displayData.linkedin_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700"
                        >
                          <Linkedin className="h-4 w-4" />
                          LinkedIn Profile
                          <ExternalLink className="h-3 w-3 ml-auto" />
                        </a>
                      )}
                      {displayData.portfolio_url && (
                        <a
                          href={displayData.portfolio_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700"
                        >
                          <Globe className="h-4 w-4" />
                          Portfolio
                          <ExternalLink className="h-3 w-3 ml-auto" />
                        </a>
                      )}
                      {!displayData.linkedin_url &&
                        !displayData.portfolio_url && (
                          <p className="text-slate-500 text-sm">
                            No links provided
                          </p>
                        )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Certifications */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-semibold">
                    Certifications
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {displayData.certifications?.map((cert, index) => (
                      <Badge
                        key={index}
                        variant="outline"
                        className="px-3 py-1"
                      >
                        {cert}
                      </Badge>
                    )) || (
                      <p className="text-slate-500 text-sm">
                        No certifications listed
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Projects Section - Full width, below the grid */}
          {(projects.length > 0 || isOwnProfile) && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-lg font-semibold">
                    <Briefcase className="h-5 w-5 text-blue-600" />
                    {isOwnProfile ? "Active Projects" : "Projects"}
                  </span>
                  {isOwnProfile && !showProjectForm && !projects.some((p: any) => p.is_idea) && (
                    <Button
                      size="sm"
                      onClick={() => setShowProjectForm(true)}
                      variant="outline"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      New Project
                    </Button>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {showProjectForm && (
                  <div className="p-4 border-2 border-dashed rounded-lg space-y-3 bg-blue-50/30">
                    <input
                      type="text"
                      placeholder="Project Title"
                      value={projectForm.title}
                      onChange={(e) =>
                        setProjectForm({ ...projectForm, title: e.target.value })
                      }
                      className="w-full p-2 border rounded text-sm"
                    />
                    <textarea
                      placeholder="Brief description of the project"
                      value={projectForm.description}
                      onChange={(e) =>
                        setProjectForm({
                          ...projectForm,
                          description: e.target.value,
                        })
                      }
                      className="w-full p-2 border rounded min-h-[80px] text-sm"
                    />
                    <div className="grid md:grid-cols-2 gap-3">
                      <input
                        type="text"
                        placeholder="Roles Needed (comma-separated)"
                        value={projectForm.roles_needed}
                        onChange={(e) =>
                          setProjectForm({
                            ...projectForm,
                            roles_needed: e.target.value,
                          })
                        }
                        className="w-full p-2 border rounded text-sm"
                      />
                      <input
                        type="text"
                        placeholder="Tech Stack (comma-separated)"
                        value={projectForm.tech_stack}
                        onChange={(e) =>
                          setProjectForm({
                            ...projectForm,
                            tech_stack: e.target.value,
                          })
                        }
                        className="w-full p-2 border rounded text-sm"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={async () => {
                          try {
                            const payload = {
                              ...projectForm,
                              roles_needed: projectForm.roles_needed
                                .split(",")
                                .map((r) => r.trim())
                                .filter(Boolean),
                              tech_stack: projectForm.tech_stack
                                .split(",")
                                .map((t) => t.trim())
                                .filter(Boolean),
                            };
                            await apiClient.post(
                              "/cofounder-matching/projects",
                              payload
                            );
                            toast.success("Project added!");
                            setShowProjectForm(false);
                            setProjectForm({
                              title: "",
                              description: "",
                              roles_needed: "",
                              tech_stack: "",
                            });
                            // Refresh profile
                            const updated = await apiClient.get<FounderProfileData>(
                              "/cofounder-matching/profile"
                            );
                            setProfileData(updated);
                            setProjects(updated.projects || []);
                          } catch (error) {
                            console.error("Failed to add project:", error);
                            toast.error("Failed to add project");
                          }
                        }}
                        size="sm"
                      >
                        Save
                      </Button>
                      <Button
                        variant="ghost"
                        onClick={() => {
                          setShowProjectForm(false);
                          setProjectForm({
                            title: "",
                            description: "",
                            roles_needed: "",
                            tech_stack: "",
                          });
                        }}
                        size="sm"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}

                {projects.length === 0 && !showProjectForm ? (
                  <div className="text-center py-8 text-slate-400">
                    <Briefcase className="h-10 w-10 mx-auto mb-2 opacity-30" />
                    <p className="text-sm">No active projects yet</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {projects.map((project: any, idx: number) => (
                      <div
                        key={project.id || idx}
                        className="border rounded-xl overflow-hidden bg-white shadow-sm"
                      >
                        {/* Project Header */}
                        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
                          <div className="flex items-center justify-between">
                            <h4 className="font-bold text-white text-xl">
                              {project.title}
                            </h4>
                            {!isOwnProfile && matchId && (
                              <Button
                                size="sm"
                                onClick={async () => {
                                  setJoiningProjectId(project.id);
                                  try {
                                    await apiClient.post(
                                      "/cofounder-matching/projects/join",
                                      {
                                        match_id: matchId,
                                        project_id: project.id,
                                      }
                                    );
                                    toast.success("Join request sent!");
                                  } catch (error) {
                                    console.error("Failed to join:", error);
                                    toast.error("Failed to send request");
                                  } finally {
                                    setJoiningProjectId(null);
                                  }
                                }}
                                disabled={joiningProjectId === project.id}
                                className="bg-white text-blue-700 hover:bg-blue-50 shrink-0"
                              >
                                {joiningProjectId === project.id ? (
                                  <>
                                    <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                                    Sending...
                                  </>
                                ) : (
                                  <>
                                    <Users className="h-4 w-4 mr-1" />
                                    Join Project
                                  </>
                                )}
                              </Button>
                            )}
                          </div>
                        </div>

                        {/* Project Body */}
                        <div className="px-6 py-5 space-y-5">
                          {/* Description */}
                          <div>
                            <h5 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                              About
                            </h5>
                            <p className="text-sm text-slate-700 leading-relaxed">
                              {project.description}
                            </p>
                          </div>

                          {/* Problem Statement */}
                          {project.problem_statement && (
                            <div className="bg-amber-50 border border-amber-100 rounded-lg p-4">
                              <h5 className="text-xs font-semibold text-amber-700 uppercase tracking-wider mb-2">
                                Problem Statement
                              </h5>
                              <p className="text-sm text-slate-700 leading-relaxed">
                                {project.problem_statement}
                              </p>
                            </div>
                          )}

                          {/* Looking For */}
                          {project.roles_needed && project.roles_needed.length > 0 && (
                            <div>
                              <h5 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                                Looking For
                              </h5>
                              <div className="bg-purple-50 border border-purple-100 rounded-lg p-4">
                                <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                                  {(Array.isArray(project.roles_needed) ? project.roles_needed : [project.roles_needed]).join('\n')}
                                </p>
                              </div>
                            </div>
                          )}

                          {/* Tech Stack */}
                          {project.tech_stack && project.tech_stack.length > 0 && (
                            <div>
                              <h5 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                                Tech Stack
                              </h5>
                              <div className="flex flex-wrap gap-2">
                                {project.tech_stack.map((tech: string, idx: number) => (
                                  <Badge key={idx} className="px-3 py-1 text-xs bg-blue-100 text-blue-700 border-0 font-medium">
                                    {tech}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default FounderProfile;
