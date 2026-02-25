// src/pages/founder/CofounderOnboarding.tsx
import React, { useState, useCallback, useEffect } from "react";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  Sparkles,
  Plus,
  X,
  ArrowRight,
  ChevronRight,
  Lightbulb,
  Rocket,
  Upload,
  Image as ImageIcon,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { MultiSelect } from "@/components/ui/multi-select";
import { cofounderMatchingService } from "@/services/founder-matching.service";

const CofounderOnboarding = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  const [profileData, setProfileData] = useState({
    // NEW: Step 1 - Intent Selection
    intent_type: "" as "founder_with_idea" | "cofounder" | "jobseeker" | "",
    
    // NEW: Step 2 - Photos
    uploadedPhotos: [] as string[],
    
    // Step 3: Basic Info (previously Step 1)
    current_role: "",
    years_experience: "",

    // Step 4: Skills (previously Step 2)
    technical_skills: [] as string[],
    soft_skills: [] as string[],
    newTechnicalSkill: "",
    newSoftSkill: "",

    // Step 5: Seeking (previously Step 3)
    seeking_roles: [] as string[],
    industries: [] as string[],
    newSeekingRole: "",
    newIndustry: "",

    // Step 6: Details (previously Step 4)
    commitment_level: "",
    location_preference: "",
    preferred_locations: [] as string[],
    newLocation: "",

    // Step 7: Achievements (previously Step 5)
    achievements: [] as string[],
    education: [] as string[],
    certifications: [] as string[],
    newAchievement: "",
    newEducation: "",
    newCertification: "",

    // Step 8: Bio & Links + Conditional Founder Project (previously Step 6)
    bio: "",
    linkedin_url: "",
    portfolio_url: "",
    
    // NEW: Conditional Founder Project Fields (only if intent_type === "founder_with_idea")
    idea_description: "",
    problem_statement: "",
    looking_for_description: "",
  });

  const totalSteps = 8;

  // Check if user already has a profile and load it
  useEffect(() => {
    let cancelled = false;
    
    const loadExistingProfile = async () => {
      try {
        const profile = await cofounderMatchingService.getProfile();
        
        // If profile exists and onboarding is complete, redirect to dashboard
        if (profile && profile.onboarding_completed) {
          cancelled = true;
          navigate("/founder/dashboard", { replace: true });
          return;
        }
        
        if (cancelled) return;
        
        // Load existing profile data if available (incomplete onboarding)
        if (profile) {
          setProfileData(prev => ({
            ...prev,
            intent_type: profile.intent_type || "",
            uploadedPhotos: profile.photo_urls || [],
            current_role: profile.current_role || "",
            years_experience: profile.years_experience?.toString() || "",
            technical_skills: profile.technical_skills || [],
            soft_skills: profile.soft_skills || [],
            seeking_roles: profile.seeking_roles || [],
            industries: profile.industries || [],
            commitment_level: profile.commitment_level || "",
            location_preference: profile.location_preference || "",
            preferred_locations: profile.preferred_locations || [],
            achievements: profile.achievements || [],
            education: profile.education || [],
            certifications: profile.certifications || [],
            bio: profile.bio || "",
            linkedin_url: profile.linkedin_url || "",
            portfolio_url: profile.portfolio_url || "",
            idea_description: profile.idea_description || "",
            problem_statement: profile.problem_statement || "",
            looking_for_description: profile.looking_for_description || "",
          }));
        }
      } catch (error: any) {
        // Profile doesn't exist - auto-create from jobseeker profile
        if (error?.response?.status === 404) {
          console.log("No cofounder profile found, will auto-create on first save");
          // Profile will be auto-created when user completes onboarding
        } else {
          console.error("Error loading profile:", error);
          toast.error("Failed to load profile. Please try again.");
        }
      } finally {
        if (!cancelled) {
          setInitialLoading(false);
        }
      }
    };
    
    loadExistingProfile();
    
    return () => { cancelled = true; };
  }, [navigate]);

  // Handle photo upload
  const handlePhotoUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    const file = files[0];
    
    // Validate file type
    const allowedTypes = ["image/png", "image/jpeg", "image/jpg", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Invalid file type. Please upload PNG, JPEG, or WebP images.");
      return;
    }
    
    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File too large. Maximum size is 10MB.");
      return;
    }
    
    if (profileData.uploadedPhotos.length >= 10) {
      toast.error("Maximum 10 photos allowed.");
      return;
    }
    
    try {
      const response = await cofounderMatchingService.uploadPhoto(file);
      setProfileData(prev => ({
        ...prev,
        uploadedPhotos: [...prev.uploadedPhotos, response.image_url]
      }));
      toast.success(`Photo uploaded! ${response.photo_count}/10`);
    } catch (error) {
      console.error("Photo upload failed:", error);
      toast.error("Failed to upload photo");
    }
  }, [profileData.uploadedPhotos.length]);

  // Handle photo deletion
  const handlePhotoDelete = useCallback(async (photoUrl: string) => {
    try {
      await cofounderMatchingService.deletePhoto(photoUrl);
      setProfileData(prev => ({
        ...prev,
        uploadedPhotos: prev.uploadedPhotos.filter(url => url !== photoUrl)
      }));
      toast.success("Photo deleted");
    } catch (error) {
      console.error("Photo deletion failed:", error);
      toast.error("Failed to delete photo");
    }
  }, []);

  const commitmentOptions = [
    { value: "Full-time", label: "Full-time" },
    { value: "Part-time", label: "Part-time" },
    { value: "Flexible", label: "Flexible" },
    { value: "Contract", label: "Contract" },
  ];

  const locationOptions = [
    { value: "Remote", label: "Remote" },
    { value: "Hybrid", label: "Hybrid" },
    { value: "On-site", label: "On-site" },
  ];

  const industryOptions = [
    "SaaS",
    "AI/ML",
    "FinTech",
    "Healthcare",
    "EdTech",
    "E-commerce",
    "Marketing Tech",
    "Developer Tools",
    "Design Tools",
    "Gaming",
    "Climate Tech",
    "Biotech",
    "Web3",
    "IoT",
    "Robotics",
  ];

  const roleOptions = [
    "CEO",
    "CTO",
    "CPO",
    "CMO",
    "Technical Co-Founder",
    "Business Co-Founder",
    "Product Lead",
    "Engineering Lead",
    "Design Lead",
    "Marketing Lead",
    "Sales Lead",
    "Operations Lead",
    "Data Science Lead",
  ];

  const skillOptions = [
    "React/Next.js",
    "Node.js",
    "Python",
    "TypeScript",
    "AWS",
    "PostgreSQL",
    "Machine Learning",
    "Data Science",
    "DevOps",
    "iOS/Android",
    "UI/UX Design",
    "Product Management",
    "Growth Hacking",
    "Digital Marketing",
    "Sales",
    "Fundraising",
    "Business Development",
    "Operations",
    "Finance",
  ];

  const handleAddItem = (field: string, value: string, arrayField: string) => {
    if (!value.trim()) return;

    setProfileData((prev) => ({
      ...prev,
      [arrayField]: [
        ...(prev[arrayField as keyof typeof prev] as string[]),
        value,
      ],
      [field]: "",
    }));
  };

  const handleRemoveItem = (arrayField: string, index: number) => {
    setProfileData((prev) => ({
      ...prev,
      [arrayField]: (prev[arrayField as keyof typeof prev] as string[]).filter(
        (_, i) => i !== index
      ),
    }));
  };

  const handleNext = () => {
    // Step 1: Intent Selection validation
    if (step === 1 && !profileData.intent_type) {
      toast.error("Please select your intent");
      return;
    }
    
    // Step 2: Photo Upload validation (minimum 3 photos)
    if (step === 2 && profileData.uploadedPhotos.length < 3) {
      toast.error("Please upload at least 3 photos");
      return;
    }
    
    // Step 3: Basic Info validation (previously Step 1)
    if (
      step === 3 &&
      (!profileData.current_role || !profileData.years_experience)
    ) {
      toast.error("Please fill in all required fields");
      return;
    }
    
    // Step 4: Skills validation (previously Step 2)
    if (step === 4 && profileData.technical_skills.length === 0) {
      toast.error("Please add at least one technical skill");
      return;
    }
    
    // Step 5: Seeking validation (previously Step 3)
    if (
      step === 5 &&
      (profileData.seeking_roles.length === 0 ||
        profileData.industries.length === 0)
    ) {
      toast.error("Please specify what you're looking for");
      return;
    }
    
    // Step 6: Commitment/Location validation (previously Step 4)
    if (
      step === 6 &&
      (!profileData.commitment_level || !profileData.location_preference)
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = async () => {
    if (!profileData.bio) {
      toast.error("Please add a bio");
      return;
    }

    setLoading(true);
    try {
      // Prepare the final data including new fields
      const finalData: any = {
        intent_type: profileData.intent_type,
        photo_urls: profileData.uploadedPhotos,
        current_role: profileData.current_role,
        years_experience: parseInt(profileData.years_experience),
        technical_skills: profileData.technical_skills,
        soft_skills: profileData.soft_skills,
        seeking_roles: profileData.seeking_roles,
        industries: profileData.industries,
        commitment_level: profileData.commitment_level,
        availability: profileData.commitment_level, // Backend expects 'availability'
        looking_for: profileData.seeking_roles.join(", ") || "Seeking cofounders and team members", // Backend expects 'looking_for' string
        location_preference: profileData.location_preference,
        preferred_locations: profileData.preferred_locations,
        achievements: profileData.achievements,
        education: profileData.education,
        certifications: profileData.certifications,
        bio: profileData.bio,
        linkedin_url: profileData.linkedin_url,
        portfolio_url: profileData.portfolio_url,
      };

      // Add conditional founder project fields if intent_type is "founder_with_idea"
      if (profileData.intent_type === "founder_with_idea") {
        finalData.idea_description = profileData.idea_description;
        finalData.problem_statement = profileData.problem_statement;
        finalData.looking_for_description = profileData.looking_for_description;
        // Override looking_for with the detailed description for founders with ideas
        if (profileData.looking_for_description) {
          finalData.looking_for = profileData.looking_for_description;
        }
      }

      console.log("Submitting cofounder profile:", finalData);

      // Update the onboarding profile with all collected data
      await cofounderMatchingService.updateOnboardingProfile(finalData);
      
      // Mark onboarding as complete
      await cofounderMatchingService.completeOnboarding();

      toast.success("Cofounder profile created!");
      navigate("/founder/dashboard");
    } catch (error) {
      console.error("Onboarding submission failed:", error);
      toast.error("Failed to create profile");
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      // NEW STEP 1: Intent Selection
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <div className="h-16 w-16 mx-auto bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mb-4">
                <Target className="h-8 w-8 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold">What brings you here?</h2>
              <p className="text-slate-600 mt-2">
                Tell us your current situation
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <Card
                className={`cursor-pointer transition-all border-2 hover:shadow-lg ${
                  profileData.intent_type === "founder_with_idea"
                    ? "border-blue-600 bg-blue-50/50 shadow-md"
                    : "border-slate-200 hover:border-blue-300"
                }`}
                onClick={() =>
                  setProfileData({ ...profileData, intent_type: "founder_with_idea" })
                }
              >
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-blue-100 rounded-lg">
                      <Lightbulb className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-1">
                        I have an Idea
                      </h3>
                      <p className="text-slate-600 text-sm">
                        You have a startup idea and are looking for the right technical or business partner
                      </p>
                    </div>
                    {profileData.intent_type === "founder_with_idea" && (
                      <CheckCircle2 className="h-6 w-6 text-blue-600 flex-shrink-0" />
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card
                className={`cursor-pointer transition-all border-2 hover:shadow-lg ${
                  profileData.intent_type === "cofounder"
                    ? "border-blue-600 bg-blue-50/50 shadow-md"
                    : "border-slate-200 hover:border-blue-300"
                }`}
                onClick={() =>
                  setProfileData({ ...profileData, intent_type: "cofounder" })
                }
              >
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-indigo-100 rounded-lg">
                      <Users className="h-6 w-6 text-indigo-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-1">
                        I want to join as a cofounder
                      </h3>
                      <p className="text-slate-600 text-sm">
                        You're ready to join someone else's startup as a founding team member
                      </p>
                    </div>
                    {profileData.intent_type === "cofounder" && (
                      <CheckCircle2 className="h-6 w-6 text-blue-600 flex-shrink-0" />
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card
                className={`cursor-pointer transition-all border-2 hover:shadow-lg ${
                  profileData.intent_type === "jobseeker"
                    ? "border-blue-600 bg-blue-50/50 shadow-md"
                    : "border-slate-200 hover:border-blue-300"
                }`}
                onClick={() =>
                  setProfileData({ ...profileData, intent_type: "jobseeker" })
                }
              >
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-purple-100 rounded-lg">
                      <Briefcase className="h-6 w-6 text-purple-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-1">
                        I'm exploring opportunities
                      </h3>
                      <p className="text-slate-600 text-sm">
                        You're open to both founding opportunities and traditional roles
                      </p>
                    </div>
                    {profileData.intent_type === "jobseeker" && (
                      <CheckCircle2 className="h-6 w-6 text-blue-600 flex-shrink-0" />
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        );

      // NEW STEP 2: Photo Upload
      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <div className="h-16 w-16 mx-auto bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mb-4">
                <ImageIcon className="h-8 w-8 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold">Add Your Photos</h2>
              <p className="text-slate-600 mt-2">
                Upload at least 3 photos (maximum 10)
              </p>
            </div>

            <div className="space-y-4">
              {/* Upload Button */}
              <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                  id="photo-upload"
                  disabled={profileData.uploadedPhotos.length >= 10}
                />
                <label
                  htmlFor="photo-upload"
                  className={`cursor-pointer ${
                    profileData.uploadedPhotos.length >= 10 ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  <Upload className="h-12 w-12 mx-auto text-slate-400 mb-3" />
                  <p className="font-medium text-slate-700">
                    Click to upload photos
                  </p>
                  <p className="text-sm text-slate-500 mt-1">
                    PNG, JPEG, or WebP (max 10MB)
                  </p>
                  <p className="text-sm text-slate-500 mt-1">
                    {profileData.uploadedPhotos.length}/10 uploaded
                  </p>
                </label>
              </div>

              {/* Photo Grid */}
              {profileData.uploadedPhotos.length > 0 && (
                <div className="grid grid-cols-3 gap-4">
                  {profileData.uploadedPhotos.map((photoUrl, index) => (
                    <div key={photoUrl} className="relative group aspect-square">
                      <img
                        src={photoUrl}
                        alt={`Upload ${index + 1}`}
                        className="w-full h-full object-cover rounded-lg border-2 border-slate-200"
                      />
                      <button
                        onClick={() => handlePhotoDelete(photoUrl)}
                        className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                      >
                        <X className="h-4 w-4" />
                      </button>
                      {index === 0 && (
                        <div className="absolute bottom-2 left-2 px-2 py-1 bg-blue-600 text-white text-xs rounded">
                          Primary
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {profileData.uploadedPhotos.length < 3 && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3">
                  <Sparkles className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-amber-800">
                      {profileData.uploadedPhotos.length === 0
                        ? "No photos uploaded yet"
                        : `${3 - profileData.uploadedPhotos.length} more photo${
                            3 - profileData.uploadedPhotos.length > 1 ? "s" : ""
                          } needed`}
                    </p>
                    <p className="text-sm text-amber-700 mt-1">
                      Add at least 3 photos to continue
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        );

      // STEP 3: Basic Info (was Step 1)
      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <div className="h-16 w-16 mx-auto bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mb-4">
                <Briefcase className="h-8 w-8 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold">Tell us about yourself</h2>
              <p className="text-slate-600 mt-2">
                Basic information to get started
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="current_role">Current/Most Recent Role *</Label>
                <Input
                  id="current_role"
                  placeholder="e.g., Senior Software Engineer, Product Manager, CEO"
                  value={profileData.current_role}
                  onChange={(e) =>
                    setProfileData({
                      ...profileData,
                      current_role: e.target.value,
                    })
                  }
                />
              </div>

              <div>
                <Label htmlFor="years_experience">Years of Experience *</Label>
                <Select
                  value={profileData.years_experience}
                  onValueChange={(value) =>
                    setProfileData({ ...profileData, years_experience: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select years of experience" />
                  </SelectTrigger>
                  <SelectContent>
                    {["1-3", "3-5", "5-7", "7-10", "10+"].map((years) => (
                      <SelectItem key={years} value={years}>
                        {years} years
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        );

      // STEP 4: Skills (was Step 2)
      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <div className="h-16 w-16 mx-auto bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mb-4">
                <Code className="h-8 w-8 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold">Your Skills & Expertise</h2>
              <p className="text-slate-600 mt-2">What are you good at?</p>
            </div>

            <div className="space-y-6">
              <div>
                <Label>Technical Skills *</Label>
                <p className="text-sm text-slate-500 mb-2">
                  Add at least 3 skills
                </p>
                <div className="flex gap-2 mb-3">
                  <Input
                    placeholder="e.g., React, Python, AWS"
                    value={profileData.newTechnicalSkill}
                    onChange={(e) =>
                      setProfileData({
                        ...profileData,
                        newTechnicalSkill: e.target.value,
                      })
                    }
                    onKeyDown={(e) => {
                      if (
                        e.key === "Enter" &&
                        profileData.newTechnicalSkill.trim()
                      ) {
                        handleAddItem(
                          "newTechnicalSkill",
                          profileData.newTechnicalSkill,
                          "technical_skills"
                        );
                      }
                    }}
                  />
                  <Button
                    type="button"
                    onClick={() =>
                      handleAddItem(
                        "newTechnicalSkill",
                        profileData.newTechnicalSkill,
                        "technical_skills"
                      )
                    }
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {profileData.technical_skills.map((skill, index) => (
                    <Badge key={index} className="px-3 py-1">
                      {skill}
                      <button
                        onClick={() =>
                          handleRemoveItem("technical_skills", index)
                        }
                        className="ml-2 hover:text-red-500"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <Label>Soft Skills</Label>
                <p className="text-sm text-slate-500 mb-2">
                  Add your non-technical strengths
                </p>
                <div className="flex gap-2 mb-3">
                  <Input
                    placeholder="e.g., Leadership, Communication, Product Strategy"
                    value={profileData.newSoftSkill}
                    onChange={(e) =>
                      setProfileData({
                        ...profileData,
                        newSoftSkill: e.target.value,
                      })
                    }
                    onKeyDown={(e) => {
                      if (
                        e.key === "Enter" &&
                        profileData.newSoftSkill.trim()
                      ) {
                        handleAddItem(
                          "newSoftSkill",
                          profileData.newSoftSkill,
                          "soft_skills"
                        );
                      }
                    }}
                  />
                  <Button
                    type="button"
                    onClick={() =>
                      handleAddItem(
                        "newSoftSkill",
                        profileData.newSoftSkill,
                        "soft_skills"
                      )
                    }
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {profileData.soft_skills.map((skill, index) => (
                    <Badge key={index} variant="outline" className="px-3 py-1">
                      {skill}
                      <button
                        onClick={() => handleRemoveItem("soft_skills", index)}
                        className="ml-2 hover:text-red-500"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      // STEP 5: Looking For (was Step 3)
      case 5:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <div className="h-16 w-16 mx-auto bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mb-4">
                <Target className="h-8 w-8 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold">What are you looking for?</h2>
              <p className="text-slate-600 mt-2">
                Help us find your perfect match
              </p>
            </div>

            <div className="space-y-6">
              <div>
                <Label>Roles you're looking for in a co-founder *</Label>
                <p className="text-sm text-slate-500 mb-2">
                  What skills should they have?
                </p>
                <div className="flex gap-2 mb-3">
                  <Input
                    placeholder="e.g., CEO, CTO, Marketing Expert"
                    value={profileData.newSeekingRole}
                    onChange={(e) =>
                      setProfileData({
                        ...profileData,
                        newSeekingRole: e.target.value,
                      })
                    }
                    onKeyDown={(e) => {
                      if (
                        e.key === "Enter" &&
                        profileData.newSeekingRole.trim()
                      ) {
                        handleAddItem(
                          "newSeekingRole",
                          profileData.newSeekingRole,
                          "seeking_roles"
                        );
                      }
                    }}
                  />
                  <Button
                    type="button"
                    onClick={() =>
                      handleAddItem(
                        "newSeekingRole",
                        profileData.newSeekingRole,
                        "seeking_roles"
                      )
                    }
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {profileData.seeking_roles.map((role, index) => (
                    <Badge
                      key={index}
                      className="px-3 py-1 bg-purple-100 text-purple-700"
                    >
                      {role}
                      <button
                        onClick={() => handleRemoveItem("seeking_roles", index)}
                        className="ml-2 hover:text-red-500"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <Label>Industries you're interested in *</Label>
                <p className="text-sm text-slate-500 mb-2">
                  What sectors excite you?
                </p>
                <div className="flex gap-2 mb-3">
                  <Input
                    placeholder="e.g., SaaS, AI, Healthcare"
                    value={profileData.newIndustry}
                    onChange={(e) =>
                      setProfileData({
                        ...profileData,
                        newIndustry: e.target.value,
                      })
                    }
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && profileData.newIndustry.trim()) {
                        handleAddItem(
                          "newIndustry",
                          profileData.newIndustry,
                          "industries"
                        );
                      }
                    }}
                  />
                  <Button
                    type="button"
                    onClick={() =>
                      handleAddItem(
                        "newIndustry",
                        profileData.newIndustry,
                        "industries"
                      )
                    }
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {profileData.industries.map((industry, index) => (
                    <Badge key={index} variant="outline" className="px-3 py-1">
                      {industry}
                      <button
                        onClick={() => handleRemoveItem("industries", index)}
                        className="ml-2 hover:text-red-500"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      // STEP 6: Logistics (was Step 4)
      case 6:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <div className="h-16 w-16 mx-auto bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mb-4">
                <MapPin className="h-8 w-8 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold">Logistics & Availability</h2>
              <p className="text-slate-600 mt-2">
                How and where do you want to work?
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="commitment_level">Time Commitment *</Label>
                <Select
                  value={profileData.commitment_level}
                  onValueChange={(value) =>
                    setProfileData({ ...profileData, commitment_level: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select commitment level" />
                  </SelectTrigger>
                  <SelectContent>
                    {commitmentOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="location_preference">Work Preference *</Label>
                <Select
                  value={profileData.location_preference}
                  onValueChange={(value) =>
                    setProfileData({
                      ...profileData,
                      location_preference: value,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select work preference" />
                  </SelectTrigger>
                  <SelectContent>
                    {locationOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Preferred Locations</Label>
                <p className="text-sm text-slate-500 mb-2">
                  Cities or regions you prefer
                </p>
                <div className="flex gap-2 mb-3">
                  <Input
                    placeholder="e.g., San Francisco, Remote, Europe"
                    value={profileData.newLocation}
                    onChange={(e) =>
                      setProfileData({
                        ...profileData,
                        newLocation: e.target.value,
                      })
                    }
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && profileData.newLocation.trim()) {
                        handleAddItem(
                          "newLocation",
                          profileData.newLocation,
                          "preferred_locations"
                        );
                      }
                    }}
                  />
                  <Button
                    type="button"
                    onClick={() =>
                      handleAddItem(
                        "newLocation",
                        profileData.newLocation,
                        "preferred_locations"
                      )
                    }
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {profileData.preferred_locations.map((location, index) => (
                    <Badge key={index} variant="outline" className="px-3 py-1">
                      {location}
                      <button
                        onClick={() =>
                          handleRemoveItem("preferred_locations", index)
                        }
                        className="ml-2 hover:text-red-500"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      // STEP 7: Achievements (was Step 5)
      case 7:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <div className="h-16 w-16 mx-auto bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mb-4">
                <Award className="h-8 w-8 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold">Achievements & Background</h2>
              <p className="text-slate-600 mt-2">What makes you stand out?</p>
            </div>

            <div className="space-y-6">
              <div>
                <Label>Key Achievements</Label>
                <p className="text-sm text-slate-500 mb-2">
                  Notable accomplishments or milestones
                </p>
                <div className="flex gap-2 mb-3">
                  <Input
                    placeholder="e.g., Grew startup to $1M ARR, Built product used by 10K+ users"
                    value={profileData.newAchievement}
                    onChange={(e) =>
                      setProfileData({
                        ...profileData,
                        newAchievement: e.target.value,
                      })
                    }
                    onKeyDown={(e) => {
                      if (
                        e.key === "Enter" &&
                        profileData.newAchievement.trim()
                      ) {
                        handleAddItem(
                          "newAchievement",
                          profileData.newAchievement,
                          "achievements"
                        );
                      }
                    }}
                  />
                  <Button
                    type="button"
                    onClick={() =>
                      handleAddItem(
                        "newAchievement",
                        profileData.newAchievement,
                        "achievements"
                      )
                    }
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="space-y-2">
                  {profileData.achievements.map((achievement, index) => (
                    <div
                      key={index}
                      className="flex items-start justify-between p-3 border rounded-lg"
                    >
                      <span>{achievement}</span>
                      <button
                        onClick={() => handleRemoveItem("achievements", index)}
                        className="text-slate-400 hover:text-red-500"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Label>Education</Label>
                <p className="text-sm text-slate-500 mb-2">
                  Degrees, courses, or certifications
                </p>
                <div className="flex gap-2 mb-3">
                  <Input
                    placeholder="e.g., Stanford CS, MBA, AWS Certified"
                    value={profileData.newEducation}
                    onChange={(e) =>
                      setProfileData({
                        ...profileData,
                        newEducation: e.target.value,
                      })
                    }
                    onKeyDown={(e) => {
                      if (
                        e.key === "Enter" &&
                        profileData.newEducation.trim()
                      ) {
                        handleAddItem(
                          "newEducation",
                          profileData.newEducation,
                          "education"
                        );
                      }
                    }}
                  />
                  <Button
                    type="button"
                    onClick={() =>
                      handleAddItem(
                        "newEducation",
                        profileData.newEducation,
                        "education"
                      )
                    }
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {profileData.education.map((edu, index) => (
                    <Badge key={index} className="px-3 py-1">
                      {edu}
                      <button
                        onClick={() => handleRemoveItem("education", index)}
                        className="ml-2 hover:text-red-500"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      // STEP 8: Final Touches + Conditional Founder Project (was Step 6)
      case 8:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <div className="h-16 w-16 mx-auto bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mb-4">
                <Users className="h-8 w-8 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold">Final Touches</h2>
              <p className="text-slate-600 mt-2">
                Tell your story and add links
              </p>
            </div>

            <div className="space-y-6">
              <div>
                <Label htmlFor="bio">Your Bio *</Label>
                <p className="text-sm text-slate-500 mb-2">
                  Introduce yourself to potential co-founders
                </p>
                <Textarea
                  id="bio"
                  placeholder="Tell us about your background, what you're passionate about, and what kind of startup you want to build..."
                  value={profileData.bio}
                  onChange={(e) =>
                    setProfileData({ ...profileData, bio: e.target.value })
                  }
                  rows={6}
                  className="resize-none"
                />
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="linkedin_url">LinkedIn Profile URL</Label>
                  <Input
                    id="linkedin_url"
                    type="url"
                    placeholder="https://linkedin.com/in/yourname"
                    value={profileData.linkedin_url}
                    onChange={(e) =>
                      setProfileData({
                        ...profileData,
                        linkedin_url: e.target.value,
                      })
                    }
                  />
                </div>

                <div>
                  <Label htmlFor="portfolio_url">Portfolio/Website URL</Label>
                  <Input
                    id="portfolio_url"
                    type="url"
                    placeholder="https://yourwebsite.com"
                    value={profileData.portfolio_url}
                    onChange={(e) =>
                      setProfileData({
                        ...profileData,
                        portfolio_url: e.target.value,
                      })
                    }
                  />
                </div>
              </div>

              {/* Conditional Founder Project Section - Only if intent_type is "founder_with_idea" */}
              {profileData.intent_type === "founder_with_idea" && (
                <>
                  <Separator className="my-6" />
                  
                  <div className="bg-blue-50/50 rounded-lg p-6 space-y-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Lightbulb className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">Tell us about your idea</h3>
                        <p className="text-sm text-slate-600">
                          Help potential cofounders understand your vision
                        </p>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="idea_description">Idea Description</Label>
                      <p className="text-sm text-slate-500 mb-2">
                        What is your startup idea? Keep it concise (elevator pitch)
                      </p>
                      <Textarea
                        id="idea_description"
                        placeholder="e.g., Building an AI-powered recruiting platform that matches candidates with companies based on culture fit..."
                        value={profileData.idea_description}
                        onChange={(e) =>
                          setProfileData({ ...profileData, idea_description: e.target.value })
                        }
                        rows={4}
                        className="resize-none"
                      />
                    </div>

                    <div>
                      <Label htmlFor="problem_statement">Problem Statement</Label>
                      <p className="text-sm text-slate-500 mb-2">
                        What problem are you solving?
                      </p>
                      <Textarea
                        id="problem_statement"
                        placeholder="e.g., Current recruiting tools focus only on skills matching, but 50% of hires fail due to culture misfit..."
                        value={profileData.problem_statement}
                        onChange={(e) =>
                          setProfileData({ ...profileData, problem_statement: e.target.value })
                        }
                        rows={4}
                        className="resize-none"
                      />
                    </div>

                    <div>
                      <Label htmlFor="looking_for_description">What are you looking for</Label>
                      <p className="text-sm text-slate-500 mb-2">
                        Cofounders, team members, or contributors - describe who you need
                      </p>
                      <Textarea
                        id="looking_for_description"
                        placeholder="e.g., Looking for a technical cofounder with AI/ML expertise and experience building scalable platforms..."
                        value={profileData.looking_for_description}
                        onChange={(e) =>
                          setProfileData({ ...profileData, looking_for_description: e.target.value })
                        }
                        rows={4}
                        className="resize-none"
                      />
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const getStepTitle = () => {
    const titles = [
      "Intent Selection",
      "Photo Upload",
      "Basic Information",
      "Skills & Expertise",
      "Looking For",
      "Availability",
      "Achievements",
      "Final Touches",
    ];
    return titles[step - 1] || "";
  };

  // Show a minimal full-screen loader while checking if onboarding was already completed.
  if (initialLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50/50 to-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Layout>
        <div className="min-h-screen bg-gradient-to-b from-blue-50/50 to-white">
          <div className="max-w-2xl mx-auto p-4 py-8">
          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm text-slate-600">
                Step {step} of {totalSteps} • {getStepTitle()}
              </div>
              <div className="text-sm font-medium">
                {Math.round((step / totalSteps) * 100)}%
              </div>
            </div>
            <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full transition-all duration-300"
                style={{ width: `${(step / totalSteps) * 100}%` }}
              />
            </div>
          </div>

          {/* Form Card */}
          <Card className="border-0 shadow-xl">
            <CardHeader>
              <CardTitle className="text-center text-2xl">
                Create Your Cofounder Profile
              </CardTitle>
              <CardDescription className="text-center">
                Build a profile to find your perfect startup partner
              </CardDescription>
            </CardHeader>

            <CardContent>
              {renderStep()}

              {/* Navigation Buttons */}
              <div className="flex justify-between mt-8 pt-6 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleBack}
                  disabled={step === 1}
                >
                  Back
                </Button>

                {step < totalSteps ? (
                  <Button
                    type="button"
                    onClick={handleNext}
                    className="flex items-center gap-2"
                  >
                    Continue
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                ) : (
                  <Button
                    type="button"
                    onClick={handleSubmit}
                    disabled={loading}
                    className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                  >
                    {loading ? "Creating Profile..." : "Complete Profile"}
                    <Sparkles className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Skip for now option */}
          {step === 1 && (
            <div className="text-center mt-6">
              <Button
                variant="ghost"
                onClick={() => navigate("/founder/dashboard")}
                className="text-slate-500 hover:text-slate-700"
              >
                Skip and browse matches first
              </Button>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default CofounderOnboarding;
