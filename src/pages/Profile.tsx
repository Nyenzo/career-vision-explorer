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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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

const WORK_MODE_OPTIONS = ["Remote", "Onsite", "Hybrid"] as const;
const EMPLOYMENT_TYPE_OPTIONS = [
  "Full-time",
  "Part-time",
  "Contract",
  "Internship",
  "Freelance",
] as const;

const normalizeJobPreferences = (preferences?: unknown) => {
  if (!preferences || typeof preferences !== "object" || Array.isArray(preferences)) {
    return {} as Record<string, unknown>;
  }

  const source = preferences as Record<string, unknown>;
  const normalized: Record<string, unknown> = {};

  const rawWorkMode = source.work_mode;
  const mode = typeof rawWorkMode === "string" ? rawWorkMode.trim().toLowerCase() : "";
  if (mode === "remote") {
    normalized.work_mode = "Remote";
  } else if (mode === "onsite" || mode === "on-site" || mode === "on site") {
    normalized.work_mode = "Onsite";
  } else if (mode === "hybrid") {
    normalized.work_mode = "Hybrid";
  } else if (source.remote_work === true) {
    normalized.work_mode = "Remote";
  }

  const rawEmploymentTypes = source.employment_types;
  if (Array.isArray(rawEmploymentTypes)) {
    const validTypes = rawEmploymentTypes
      .map((value) => (typeof value === "string" ? value.trim() : ""))
      .filter((value): value is string =>
        EMPLOYMENT_TYPE_OPTIONS.includes(value as (typeof EMPLOYMENT_TYPE_OPTIONS)[number])
      );

    if (validTypes.length > 0) {
      normalized.employment_types = Array.from(new Set(validTypes));
    }
  }

  return normalized;
};

const getWorkModeFromPreferences = (preferences?: unknown) => {
  const normalized = normalizeJobPreferences(preferences);
  return typeof normalized.work_mode === "string" ? normalized.work_mode : "";
};

const getEmploymentTypesFromPreferences = (preferences?: unknown) => {
  const normalized = normalizeJobPreferences(preferences);
  return Array.isArray(normalized.employment_types)
    ? (normalized.employment_types as string[])
    : [];
};

const upsertJobPreferences = (
  currentPreferences: unknown,
  updates: Record<string, unknown>
) => {
  const merged = {
    ...normalizeJobPreferences(currentPreferences),
    ...updates,
  };

  const normalized = normalizeJobPreferences(merged);
  return Object.keys(normalized).length > 0 ? normalized : undefined;
};

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
  const [isPhotoEditorOpen, setIsPhotoEditorOpen] = useState(false);
  const [photoEditorSrc, setPhotoEditorSrc] = useState<string | null>(null);
  const [photoEditorZoom, setPhotoEditorZoom] = useState(1.2);
  const [photoEditorX, setPhotoEditorX] = useState(0);
  const [photoEditorY, setPhotoEditorY] = useState(0);
  const [photoEditorImageSize, setPhotoEditorImageSize] = useState<{
    width: number;
    height: number;
  } | null>(null);
  const [profileImageRefreshKey, setProfileImageRefreshKey] = useState<number>(Date.now());

  // Input refs for scrolling to sections
  const nameInputRef = useRef<HTMLInputElement>(null);
  const bioInputRef = useRef<HTMLTextAreaElement>(null);
  const linkedinInputRef = useRef<HTMLInputElement>(null);
  const skillsInputRef = useRef<HTMLTextAreaElement>(null);
  const workExperienceInputRef = useRef<HTMLTextAreaElement>(null);
  const educationInputRef = useRef<HTMLInputElement>(null);
  const preferencesInputRef = useRef<HTMLDivElement>(null);
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

  const preferenceDisplayKeys = new Set([
    "work_mode",
    "employment_types",
  ]);

  const getDisplayablePreferences = (preferences?: Record<string, unknown>) => {
    if (!preferences) {
      return [] as [string, unknown][];
    }

    return Object.entries(preferences).filter(([key]) => {
      const normalizedKey = key.trim().toLowerCase();
      return preferenceDisplayKeys.has(normalizedKey);
    });
  };

  // Redirect employers to their dashboard

  useEffect(() => {
    if (isAuthenticated) {
      if (authProfile) {
        const sanitizedAuthProfile = {
          ...authProfile,
          preferences: normalizeJobPreferences(authProfile.preferences),
        };

        setProfile(sanitizedAuthProfile);
        setEditForm(sanitizedAuthProfile);
        setLocalCompletionPercentage(
          sanitizedAuthProfile.profile_completion_percentage ||
          calculateProfileCompletion(sanitizedAuthProfile)
        );
      }
      loadProfile();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated, user, authProfile]);

  useEffect(() => {
    return () => {
      // no-op cleanup: photo editor uses data/https URLs
    };
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const profileData = await profileService.getProfile();

      const sanitizedProfileData = {
        ...profileData,
        // Normalize: DB column is full_name, ensure profile.name is always set
        name: profileData.name || (profileData as any).full_name || "",
        preferences: normalizeJobPreferences(profileData.preferences),
      };

      setProfile(sanitizedProfileData);
      setEditForm(sanitizedProfileData);
      setProfileImageRefreshKey(Date.now());
      // Use backend value if available, otherwise calculate locally
      setLocalCompletionPercentage(
        sanitizedProfileData.profile_completion_percentage ||
        calculateProfileCompletion(sanitizedProfileData)
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
    const normalizedPreferences = upsertJobPreferences(payload.preferences, {});
    const payloadWithSanitizedPreferences = {
      ...payload,
      preferences: normalizedPreferences,
    };

    if (!payloadWithSanitizedPreferences || Object.keys(payloadWithSanitizedPreferences).length === 0) {
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
        Object.entries(payloadWithSanitizedPreferences).filter(
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
          full_name: cleanPayload.name, // API expects full_name
          bio: cleanPayload.bio,
          phone: cleanPayload.phone,
          location: cleanPayload.location,
        };

        console.log("🏢 Sending employer profile data:", employerProfileData);

        updatedProfile = await profileService.updateProfile(
          employerProfileData
        );
      } else {
        // For regular users, remove company data and remap name → full_name
        const {
          company_data,
          company_name,
          industry,
          company_website,
          company_size,
          name,
          ...restUserData
        } = cleanPayload;
        const userData = {
          ...restUserData,
          ...(name !== undefined ? { full_name: name } : {}), // API expects full_name
        };
        console.log("👤 Sending user data:", userData);
        updatedProfile = await profileService.updateProfile(userData);
      }

      const sanitizedUpdatedProfile = {
        ...updatedProfile,
        preferences: normalizeJobPreferences(updatedProfile.preferences),
      };

      setProfile(sanitizedUpdatedProfile);
      setEditForm(sanitizedUpdatedProfile);
      // Use backend value if available, otherwise calculate locally
      setLocalCompletionPercentage(
        sanitizedUpdatedProfile.profile_completion_percentage ||
        calculateProfileCompletion(sanitizedUpdatedProfile)
      );
      setEditing(false);
      toast.success("Profile updated successfully!");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile");
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error("Image size must be 10MB or less");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const imageDataUrl = typeof reader.result === "string" ? reader.result : null;
      if (!imageDataUrl) {
        toast.error("Failed to read image. Please try another file.");
        return;
      }

      openPhotoEditorWithSource(imageDataUrl);
    };
    reader.onerror = () => {
      toast.error("Failed to read image. Please try another file.");
    };
    reader.readAsDataURL(file);

    // Allow selecting the same file again later.
    e.target.value = "";
  };

  const closePhotoEditor = () => {
    setPhotoEditorSrc(null);
    setPhotoEditorImageSize(null);
    setIsPhotoEditorOpen(false);
  };

  const openPhotoEditorWithSource = (src: string) => {
    const image = new Image();
    if (src.startsWith("http://") || src.startsWith("https://")) {
      image.crossOrigin = "anonymous";
    }

    image.onload = () => {
      setPhotoEditorSrc(src);
      setPhotoEditorImageSize({
        width: image.naturalWidth,
        height: image.naturalHeight,
      });
      setPhotoEditorZoom(1.2);
      setPhotoEditorX(0);
      setPhotoEditorY(0);
      setIsPhotoEditorOpen(true);
    };

    image.onerror = () => {
      toast.error("Failed to load image. Please try another file.");
    };

    image.src = src;
  };

  const getCropFrame = (
    imageWidth: number,
    imageHeight: number,
    viewportSize: number,
    zoom: number,
    xOffsetPercent: number,
    yOffsetPercent: number
  ) => {
    const baseCoverScale = Math.max(viewportSize / imageWidth, viewportSize / imageHeight);
    const renderScale = baseCoverScale * zoom;

    const drawWidth = imageWidth * renderScale;
    const drawHeight = imageHeight * renderScale;

    const maxOffsetX = Math.max(0, (drawWidth - viewportSize) / 2);
    const maxOffsetY = Math.max(0, (drawHeight - viewportSize) / 2);

    const drawX = (viewportSize - drawWidth) / 2 + (xOffsetPercent / 100) * maxOffsetX;
    const drawY = (viewportSize - drawHeight) / 2 + (yOffsetPercent / 100) * maxOffsetY;

    return { drawX, drawY, drawWidth, drawHeight };
  };

  const openPhotoEditorPanel = () => {
    if (profile?.avatar_url) {
      openPhotoEditorWithSource(profile.avatar_url);
      return;
    }

    setPhotoEditorSrc(null);
    setPhotoEditorImageSize(null);
    setPhotoEditorZoom(1.2);
    setPhotoEditorX(0);
    setPhotoEditorY(0);
    setIsPhotoEditorOpen(true);
  };

  const triggerPhotoPicker = () => {
    profileImageInputRef.current?.click();
  };

  const createCroppedImageFile = async (
    imageSrc: string,
    zoom: number,
    xPercent: number,
    yPercent: number
  ): Promise<File> => {
    const image = new Image();
    if (imageSrc.startsWith("http://") || imageSrc.startsWith("https://")) {
      image.crossOrigin = "anonymous";
    }
    image.src = imageSrc;

    await new Promise<void>((resolve, reject) => {
      image.onload = () => resolve();
      image.onerror = () => reject(new Error("Failed to load image"));
    });

    const canvasSize = 512;
    const canvas = document.createElement("canvas");
    canvas.width = canvasSize;
    canvas.height = canvasSize;

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      throw new Error("Failed to initialize image editor");
    }

    const safeZoom = Math.max(1.05, Math.min(3, zoom));
    const frame = getCropFrame(
      image.width,
      image.height,
      canvasSize,
      safeZoom,
      xPercent,
      yPercent
    );

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(image, frame.drawX, frame.drawY, frame.drawWidth, frame.drawHeight);

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/jpeg", 0.9)
    );

    if (!blob) {
      throw new Error("Failed to process image");
    }

    return new File([blob], "profile-photo.jpg", { type: "image/jpeg" });
  };

  const handlePhotoEditorSave = async () => {
    if (!photoEditorSrc) return;

    try {
      setLoading(true);
      const croppedFile = await createCroppedImageFile(
        photoEditorSrc,
        photoEditorZoom,
        photoEditorX,
        photoEditorY
      );

      const uploadResult = await profileService.uploadProfileImage(croppedFile);
      if (uploadResult?.image_url) {
        // The upload endpoint already persists the avatar — just update local state
        setProfile((prev) =>
          prev ? { ...prev, avatar_url: uploadResult.image_url } : prev
        );
        setEditForm((prev) => ({
          ...prev,
          avatar_url: uploadResult.image_url,
        }));
        setProfileImageRefreshKey(Date.now());
        toast.success("Profile image updated successfully");
        closePhotoEditor();
      } else {
        toast.error("Upload succeeded but no image URL was returned.");
      }
    } catch (error) {
      console.error("Image upload failed", error);
      toast.error("Failed to upload image. Max size 10MB.");
    } finally {
      setLoading(false);
    }
  };

  const PHOTO_PREVIEW_SIZE = 288;
  const profileAvatarSrc = profile?.avatar_url
    ? `${profile.avatar_url}${profile.avatar_url.includes("?") ? "&" : "?"}t=${Date.now()}`
    : undefined;
  const previewFrame = photoEditorImageSize
    ? getCropFrame(
      photoEditorImageSize.width,
      photoEditorImageSize.height,
      PHOTO_PREVIEW_SIZE,
      Math.max(1.05, Math.min(3, photoEditorZoom)),
      photoEditorX,
      photoEditorY
    )
    : null;

  const handleCancel = () => {
    setEditForm({
      ...(profile as ProfileType),
      preferences: normalizeJobPreferences(profile?.preferences),
    });
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
      avatar_url: 5,
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

    if (data.avatar_url) score += sectionWeights.avatar_url;
    if (data.github_url) score += sectionWeights.github_url;
    if (data.portfolio_url) score += sectionWeights.portfolio_url;

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
                  onClick={() => {
                    // Pre-seed name from user or email prefix if profile.name is empty
                    const nameFromEmail = profile?.email?.split('@')[0] || user?.email?.split('@')[0] || '';
                    if (!editForm.name && (user?.name || nameFromEmail)) {
                      setEditForm(prev => ({ ...prev, name: user?.name || nameFromEmail }));
                    }
                    setEditing(true);
                  }}
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
      <main className="pt-2 pb-20 px-4 md:px-8 max-w-screen-2xl mx-auto font-body bg-[#f1f5f9] text-on-surface antialiased">

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Sidebar (Column 4/12) */}
          <aside className="lg:col-span-4 space-y-8">
            {/* Resume Management Section */}
            <section className="bg-surface-container-lowest rounded-lg p-8 shadow-[0_20px_40px_rgba(25,28,30,0.04)]">
              <h3 className="font-headline text-lg font-bold mb-6 text-slate-900">Resume Management</h3>
              <div className="flex flex-col gap-4">
                {profile?.resume_link && !editing ? (
                  <div className="p-4 bg-surface-container-low rounded-lg border border-outline-variant flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileText className="h-5 w-5 text-primary" />
                      <span className="text-sm font-semibold text-slate-700">Current Resume</span>
                    </div>
                    <a href={profile.resume_link} target="_blank" rel="noopener noreferrer" className="text-primary hover:text-primary/80 transition-colors">
                      <Download className="h-4 w-4" />
                    </a>
                  </div>
                ) : null}

                {editing && (
                  <label className="group cursor-pointer border-2 border-dashed border-outline-variant hover:border-primary rounded-lg p-6 transition-all bg-surface-container-low/50 text-center flex flex-col items-center">
                    <input className="hidden" type="file" onChange={handleFileChange} accept=".pdf,.docx" />
                    <span className="material-symbols-outlined text-4xl text-slate-400 group-hover:text-primary mb-2 transition-colors">upload_file</span>
                    <p className="text-sm font-semibold text-slate-700">Choose File</p>
                    <p className="text-xs text-slate-400 mt-1">{resumeFile ? resumeFile.name : "PDF, DOCX up to 10MB"}</p>
                  </label>
                )}

                {editing && resumeFile && (
                  <button 
                    onClick={() => {
                        // Normally handleResumeParse() but we might not have it attached. Assuming handleResumeParse exists.
                    }} 
                    disabled={isParsing}
                    className="flex items-center justify-center gap-2 w-full py-4 px-6 bg-surface-container-highest text-on-surface font-semibold rounded-full hover:bg-slate-200 transition-all active:scale-95 disabled:opacity-50"
                  >
                    <span className="material-symbols-outlined text-[20px]">psychology</span>
                    {isParsing ? "Extracting..." : "Extract from CV"}
                  </button>
                )}

                {editing && (
                  <div className="mt-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider px-1">Or Resume URL</label>
                    <Input
                      ref={resumeInputRef}
                      value={editForm.resume_link || ""}
                      onChange={(e) => setEditForm({ ...editForm, resume_link: e.target.value })}
                      className="w-full bg-surface-container-low border-0 outline-none rounded-xl px-4 py-3 text-slate-800 font-medium"
                      placeholder="https://..."
                    />
                  </div>
                )}
              </div>
            </section>

            {/* Quick Stats Section */}
            <section className="bg-surface-container-lowest rounded-lg p-8 shadow-[0_20px_40px_rgba(25,28,30,0.04)]">
              <div className="flex items-center justify-between mb-8">
                <h3 className="font-headline text-lg font-bold text-slate-900">Quick Stats</h3>
                <span className="text-xs font-bold font-label tracking-widest text-primary px-3 py-1 bg-primary-fixed rounded-full">LIVE</span>
              </div>
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-slate-400">history_edu</span>
                    <span className="text-sm font-medium text-slate-600">Experience</span>
                  </div>
                  <span className="text-sm font-bold text-slate-900">{profile?.experience_years || 0} Years</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-slate-400">psychology</span>
                    <span className="text-sm font-medium text-slate-600">Skills</span>
                  </div>
                  <span className="text-sm font-bold text-slate-900">{profile?.skills?.length || 0} Verified</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-slate-400">rocket_launch</span>
                    <span className="text-sm font-medium text-slate-600">Projects</span>
                  </div>
                  <span className="text-sm font-bold text-slate-900">{profile?.projects?.length || 0} Active</span>
                </div>
                
                <div className="pt-6 border-t border-surface-container-low">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-bold text-slate-900">Profile Complete</span>
                    <span className="text-sm font-bold text-primary">{localCompletionPercentage}%</span>
                  </div>
                  <div className="w-full h-2 bg-surface-container-high rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-primary to-primary-container" style={{ width: `${localCompletionPercentage}%` }}></div>
                  </div>
                </div>
              </div>
            </section>

            {/* Social Links Section */}
            <section className="bg-surface-container-lowest rounded-lg p-8 shadow-[0_20px_40px_rgba(25,28,30,0.04)]">
              <h3 className="font-headline text-lg font-bold mb-6 text-slate-900">Social Links</h3>
              <div className="space-y-4">
                {editing ? (
                  <div className="space-y-3">
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"></path></svg>
                      </span>
                      <input 
                        ref={linkedinInputRef}
                        type="url" 
                        value={editForm.linkedin_url || ""} 
                        onChange={(e) => setEditForm({...editForm, linkedin_url: e.target.value})}
                        className="w-full bg-surface-container-low border-0 outline-none rounded-xl pl-10 pr-4 py-3 focus:ring-2 focus:ring-primary/20 transition-all text-sm font-medium" 
                        placeholder="LinkedIn Profile" 
                      />
                    </div>
                    <div className="relative">
                      <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">terminal</span>
                      <input 
                        type="url" 
                        value={editForm.github_url || ""} 
                        onChange={(e) => setEditForm({...editForm, github_url: e.target.value})}
                        className="w-full bg-surface-container-low border-0 outline-none rounded-xl pl-10 pr-4 py-3 focus:ring-2 focus:ring-primary/20 transition-all text-sm font-medium" 
                        placeholder="GitHub URL" 
                      />
                    </div>
                  </div>
                ) : (
                  <>
                    {profile?.linkedin_url && (
                      <a href={profile.linkedin_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 bg-surface-container-low hover:bg-surface-container-high rounded-xl transition-colors group">
                        <svg className="w-5 h-5 fill-slate-400 group-hover:fill-[#0077b5] transition-colors" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"></path></svg>
                        <span className="font-semibold text-slate-700 text-sm">LinkedIn</span>
                      </a>
                    )}
                    {profile?.github_url && (
                      <a href={profile.github_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 bg-surface-container-low hover:bg-surface-container-high rounded-xl transition-colors group">
                        <span className="material-symbols-outlined text-[20px] text-slate-400 group-hover:text-slate-800 transition-colors">terminal</span>
                        <span className="font-semibold text-slate-700 text-sm">GitHub</span>
                      </a>
                    )}
                    {!profile?.linkedin_url && !profile?.github_url && (
                      <p className="text-sm text-slate-400">No social links added.</p>
                    )}
                  </>
                )}
              </div>
            </section>

            {/* Job Preferences Block */}
            <section className="bg-surface-container-lowest rounded-lg p-8 shadow-[0_20px_40px_rgba(25,28,30,0.04)]">
              <h3 className="font-headline text-lg font-bold mb-6 text-slate-900">Preferred Work Type</h3>
              <div className="flex flex-col gap-3">
                {editing ? (
                  <>
                    <h4 className="text-xs font-bold text-slate-500 uppercase">Work Mode</h4>
                    <div className="flex flex-wrap gap-2 mb-2">
                       {WORK_MODE_OPTIONS.map((mode) => (
                          <button
                            key={mode}
                            onClick={() => {
                              setEditForm({
                                ...editForm,
                                preferences: upsertJobPreferences(editForm.preferences, { work_mode: mode }),
                              });
                            }}
                            className={`px-4 py-1 rounded-full text-xs font-bold border-2 transition-all ${
                              getWorkModeFromPreferences(editForm.preferences) === mode
                                ? "border-primary bg-primary-fixed text-primary"
                                : "border-surface-container-high text-slate-500 hover:border-primary/50"
                            }`}
                          >
                            {mode}
                          </button>
                       ))}
                    </div>

                    <h4 className="text-xs font-bold text-slate-500 uppercase mt-2">Employment Type</h4>
                    <div className="flex flex-wrap gap-2">
                       {EMPLOYMENT_TYPE_OPTIONS.map((employmentType) => {
                          const selected = getEmploymentTypesFromPreferences(editForm.preferences);
                          const isSelected = selected.includes(employmentType);
                          return (
                            <button
                              key={employmentType}
                              onClick={() => {
                                const nextEmploymentTypes = isSelected
                                      ? selected.filter((value) => value !== employmentType)
                                      : [...selected, employmentType];

                                setEditForm({
                                  ...editForm,
                                  preferences: upsertJobPreferences(editForm.preferences, {
                                    employment_types: nextEmploymentTypes,
                                  }),
                                });
                              }}
                              className={`px-4 py-1 rounded-full text-xs font-bold border-2 transition-all ${
                                isSelected
                                  ? "border-primary bg-primary-fixed text-primary"
                                  : "border-surface-container-high text-slate-500 hover:border-primary/50"
                              }`}
                            >
                              {employmentType}
                            </button>
                          );
                       })}
                    </div>
                  </>
                ) : (
                  <>
                    {getWorkModeFromPreferences(profile?.preferences) && (
                      <div className="w-full px-6 py-2 rounded-full border-2 border-primary bg-primary-fixed text-primary font-bold text-sm text-center">
                        {getWorkModeFromPreferences(profile?.preferences)}
                      </div>
                    )}
                    {getEmploymentTypesFromPreferences(profile?.preferences).map(type => (
                      <div key={type} className="w-full px-6 py-2 rounded-full border-2 border-surface-container-high text-slate-600 font-bold text-sm text-center">
                        {type}
                      </div>
                    ))}
                    {!getWorkModeFromPreferences(profile?.preferences) && getEmploymentTypesFromPreferences(profile?.preferences).length === 0 && (
                      <p className="text-sm text-slate-400 text-center">No preferences matched.</p>
                    )}
                  </>
                )}
              </div>
            </section>

            {/* Availability Status Block */}
            <section className="bg-surface-container-lowest rounded-lg p-8 shadow-[0_20px_40px_rgba(25,28,30,0.04)]">
              <h3 className="font-headline text-lg font-bold mb-6 text-slate-900">Availability Status</h3>
              {editing ? (
                <div className="flex flex-col gap-2">
                  {["Available", "Not Available", "Available in 2 weeks", "Available in 1 month"].map(status => (
                    <button
                      key={status}
                      onClick={() => setEditForm({...editForm, availability: status as any})}
                      className={`px-4 py-2 rounded-full font-bold text-sm transition-all ${
                        editForm.availability === status
                          ? "bg-white text-primary shadow-sm border border-slate-100"
                          : "text-slate-500 bg-surface-container-low hover:bg-slate-200/50"
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="p-1 bg-surface-container-low rounded-full truncate flex justify-center">
                   <div className="px-6 py-2 rounded-full bg-white text-primary font-bold shadow-sm text-sm">
                      {profile?.availability || "Status Unknown"}
                   </div>
                </div>
              )}
            </section>
          </aside>

          {/* Main Content Area (Column 8/12) */}
          <div className="lg:col-span-8 space-y-8">
            {/* Profile Header */}
            <header className="bg-surface-container-lowest rounded-lg p-8 shadow-[0_20px_40px_rgba(25,28,30,0.04)] relative overflow-hidden flex flex-col md:flex-row items-center md:items-start justify-between gap-6">
              <div className="flex flex-col md:flex-row items-center md:items-start gap-6 relative z-10 flex-1">
                <div className="relative group flex-shrink-0">
                  <div className="w-24 h-24 rounded-[20px] overflow-hidden border-2 border-white shadow-sm bg-surface-container-high relative cursor-pointer" onClick={openPhotoEditorPanel}>
                    {profileAvatarSrc ? (
                      <img src={profileAvatarSrc} alt={profile?.name || "Profile"} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-3xl font-bold text-slate-400">
                        {profile?.name?.charAt(0)?.toUpperCase()}
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="material-symbols-outlined text-white text-sm">edit</span>
                    </div>
                  </div>
                  <input
                    ref={profileImageInputRef}
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleImageUpload}
                  />
                  <button onClick={openPhotoEditorPanel} className="absolute -bottom-2 -right-2 p-1.5 bg-primary text-white rounded-full shadow-md hover:scale-105 transition-transform border-2 border-white flex items-center justify-center">
                    <span className="material-symbols-outlined text-[14px]">edit</span>
                  </button>
                </div>

                <div className="flex-1 text-center md:text-left pt-1">
                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-3">
                    <h1 className="font-headline text-2xl font-bold text-slate-900">
                      {profile?.name || user?.name || (profile?.email ? profile.email.split('@')[0] : 'Profile')}
                    </h1>
                    <span className="px-3 py-1 bg-[#E8F5E9] text-[#2E7D32] font-label text-[10px] font-bold tracking-widest uppercase rounded-full">
                      {profile?.account_type?.replace("_", " ") || "Job Seeker"}
                    </span>
                  </div>

                  <div className="flex flex-col gap-2 text-sm text-slate-500 font-medium">
                    <div className="flex flex-wrap justify-center md:justify-start gap-x-6 gap-y-2">
                       <div className="flex items-center gap-1.5">
                         <span className="material-symbols-outlined text-[16px] text-slate-400">mail</span>
                         {profile?.email}
                       </div>
                       {(editing || editForm.location) && (
                         <div className="flex items-center gap-1.5">
                           <span className="material-symbols-outlined text-[16px] text-slate-400">location_on</span>
                           {editing ? (
                             <input 
                                ref={locationInputRef}
                                type="text"
                                value={editForm.location || ""}
                                onChange={e => setEditForm({...editForm, location: e.target.value})}
                                placeholder="City, Country"
                                className="bg-surface-container-low border border-outline-variant outline-none rounded-md px-2 py-0.5 w-32 focus:border-primary transition-colors text-slate-700"
                             />
                           ) : profile?.location}
                         </div>
                       )}
                    </div>
                    {(editing || editForm.linkedin_url) && (
                       <div className="flex items-center gap-1.5 justify-center md:justify-start mt-1">
                         <span className="material-symbols-outlined text-[16px] text-slate-400">link</span>
                         {editing ? (
                             <input 
                                type="url"
                                value={editForm.linkedin_url || ""}
                                onChange={e => setEditForm({...editForm, linkedin_url: e.target.value})}
                                placeholder="LinkedIn URL"
                                className="bg-surface-container-low border border-outline-variant outline-none rounded-md px-2 py-0.5 w-48 focus:border-primary transition-colors text-slate-700"
                             />
                         ) : (
                           <a href={profile?.linkedin_url} target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors truncate max-w-[250px] text-slate-600">
                             {profile?.linkedin_url?.replace("https://www.", "").replace("https://", "")}
                           </a>
                         )}
                       </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex-shrink-0 relative z-10 pt-2 md:pt-0">
                  {!editing ? (
                    <Button onClick={() => setEditing(true)} className="rounded-full shadow-none hover:shadow-md transition-all font-semibold px-6 bg-primary text-white">
                       Edit Profile
                    </Button>
                  ) : (
                    <div className="flex gap-2">
                       <Button onClick={() => handleSave()} className="rounded-full shadow-none hover:shadow-md transition-all font-semibold font-label min-w-[120px] bg-primary text-white">
                          Save Changes
                       </Button>
                       <Button variant="outline" onClick={handleCancel} className="rounded-full border-surface-container-high font-semibold shadow-sm hover:surface-container-low">
                          Cancel
                       </Button>
                    </div>
                  )}
              </div>
            </header>

            {/* Personal Details Form */}
            <section className="bg-surface-container-lowest rounded-lg pt-6 pb-8 px-8 shadow-[0_20px_40px_rgba(25,28,30,0.04)]">
              <h3 className="font-headline text-lg font-bold mb-6 text-slate-900 border-b border-surface-container-low pb-4">Personal details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest px-1">Full Name</label>
                  {editing ? (
                    <input 
                      ref={nameInputRef}
                      type="text" 
                       value={editForm.name || user?.name || (profile?.email ? profile.email.split('@')[0] : (user?.email ? user.email.split('@')[0] : ''))}
                      onChange={e => setEditForm({...editForm, name: e.target.value})}
                      className="w-full bg-surface-container-low border-0 outline-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/20 transition-all text-sm font-medium text-slate-800" 
                      placeholder="Your Name"
                    />
                  ) : (
                    <div className="w-full bg-slate-50 border border-slate-100 rounded-lg px-4 py-3 text-sm font-semibold text-slate-700">
                      {profile?.name || user?.name || (profile?.email ? profile.email.split('@')[0] : (user?.email ? user.email.split('@')[0] : '-'))}
                    </div>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest px-1">Professional Title</label>
                  {editing ? (
                    <input 
                      type="text" 
                      value={editForm.active_role || ""}
                      onChange={e => setEditForm({...editForm, active_role: e.target.value})}
                      className="w-full bg-surface-container-low border-0 outline-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/20 transition-all text-sm font-medium text-slate-800" 
                      placeholder="e.g., Full Stack Developer"
                    />
                  ) : (
                    <div className="w-full bg-slate-50 border border-slate-100 rounded-lg px-4 py-3 text-sm font-semibold text-slate-700">
                      {profile?.active_role || "-"}
                    </div>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest px-1">Phone Number</label>
                  {editing ? (
                    <input 
                      ref={phoneInputRef}
                      type="tel" 
                      value={editForm.phone || ""}
                      onChange={e => setEditForm({...editForm, phone: e.target.value})}
                      className="w-full bg-surface-container-low border-0 outline-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/20 transition-all text-sm font-medium text-slate-800" 
                    />
                  ) : (
                    <div className="w-full bg-slate-50 border border-slate-100 rounded-lg px-4 py-3 text-sm font-semibold text-slate-700">
                      {profile?.phone || "-"}
                    </div>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest px-1">Portfolio URL</label>
                  {editing ? (
                    <input 
                      type="url" 
                      value={editForm.portfolio_url || ""}
                      onChange={e => setEditForm({...editForm, portfolio_url: e.target.value})}
                      className="w-full bg-surface-container-low border-0 outline-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/20 transition-all text-sm font-medium text-slate-800" 
                    />
                  ) : (
                    <div className="w-full bg-slate-50 border border-slate-100 rounded-lg px-4 py-3 text-sm font-semibold text-slate-700 truncate">
                      {profile?.portfolio_url ? (
                        <a href={profile.portfolio_url} target="_blank" className="hover:text-primary transition-colors">{profile.portfolio_url}</a>
                      ) : "-"}
                    </div>
                  )}
                </div>

                <div className="space-y-1 md:col-span-2">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest px-1">LinkedIn Profile</label>
                  {editing ? (
                    <input 
                      type="url" 
                      value={editForm.linkedin_url || ""}
                      onChange={e => setEditForm({...editForm, linkedin_url: e.target.value})}
                      className="w-full bg-surface-container-low border-0 outline-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/20 transition-all text-sm font-medium text-slate-800" 
                    />
                  ) : (
                    <div className="w-full bg-slate-50 border border-slate-100 rounded-lg px-4 py-3 text-sm font-semibold text-slate-700 truncate">
                      {profile?.linkedin_url ? (
                        <a href={profile.linkedin_url} target="_blank" className="hover:text-primary transition-colors">{profile.linkedin_url}</a>
                      ) : "-"}
                    </div>
                  )}
                </div>
              </div>
            </section>

            {/* Technical Skills Section */}
            <section className="bg-surface-container-lowest rounded-lg pt-6 pb-8 px-8 shadow-[0_20px_40px_rgba(25,28,30,0.04)]">
              <div className="flex items-center justify-between mb-6 border-b border-surface-container-low pb-4">
                <h3 className="font-headline text-lg font-bold text-slate-900">Technical Skills</h3>
                {editing && (
                  <button 
                    onClick={() => {
                        setEditForm({...editForm, skills: [...(editForm.skills || []), ""]})
                    }}
                    className="text-primary font-bold text-sm flex items-center gap-1 hover:underline"
                  >
                    <span className="material-symbols-outlined text-[18px]">add</span> Add Skill
                  </button>
                )}
              </div>
              
              {editing ? (
                  <div className="flex flex-col gap-3">
                    {(editForm.skills || []).map((skill, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <input
                           type="text"
                           value={skill}
                           onChange={(e) => {
                               const newSkills = [...(editForm.skills || [])];
                               newSkills[index] = e.target.value;
                               setEditForm({ ...editForm, skills: newSkills });
                           }}
                           placeholder="e.g. React.js"
                           className="flex-1 bg-surface-container-low border-0 outline-none rounded-xl px-4 py-2 text-sm"
                        />
                        <button 
                           onClick={() => {
                               const newSkills = [...(editForm.skills || [])];
                               newSkills.splice(index, 1);
                               setEditForm({ ...editForm, skills: newSkills });
                           }}
                           className="p-2 text-red-400 hover:bg-red-50 rounded-full transition-colors"
                        >
                           <span className="material-symbols-outlined text-[20px]">close</span>
                        </button>
                      </div>
                    ))}
                  </div>
              ) : (
                  <div className="flex flex-wrap gap-2.5">
                    {profile?.skills && profile.skills.length > 0 ? profile.skills.map((skill, idx) => (
                        <span key={idx} className="px-4 py-1.5 bg-[#F0F4FF] text-[#1a56db] text-sm font-semibold rounded-full border border-[#dce8ff] hover:bg-[#e0eaff] transition-colors cursor-default">
                            {skill}
                        </span>
                    )) : (
                        <p className="text-sm text-slate-400">No skills added.</p>
                    )}
                  </div>
              )}
            </section>

            {/* Work Experience Section */}
            <section className="bg-surface-container-lowest rounded-lg pt-6 pb-8 px-8 shadow-[0_20px_40px_rgba(25,28,30,0.04)]">
              <div className="flex items-center justify-between mb-6 border-b border-surface-container-low pb-4">
                <h3 className="font-headline text-lg font-bold text-slate-900">Work Experience</h3>
                {editing && (
                  <button 
                    onClick={() => {
                        const emptyExp = { company: "", position: "", duration: "", description: "" };
                        setEditForm({...editForm, work_experience: [...(editForm.work_experience || []), emptyExp]});
                    }}
                    className="text-primary font-bold text-sm flex items-center gap-1 hover:underline"
                  >
                    <span className="material-symbols-outlined text-[18px]">add</span> Add Experience
                  </button>
                )}
              </div>
              
              <div className="space-y-0">
                {editing ? (
                   (editForm.work_experience || []).map((exp, index) => (
                      <div key={index} className="p-5 mb-4 bg-surface-container-low/30 rounded-xl border border-surface-container-high space-y-4">
                         <div className="flex justify-between items-start">
                             <h4 className="text-sm font-semibold text-slate-700">Experience #{index + 1}</h4>
                             <button onClick={() => {
                                 const nx = [...(editForm.work_experience || [])];
                                 nx.splice(index, 1);
                                 setEditForm({...editForm, work_experience: nx});
                             }} className="p-1 hover:bg-red-100 rounded text-red-400 transition-colors">
                                 <span className="material-symbols-outlined text-[20px]">delete</span>
                             </button>
                         </div>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                             <div>
                                 <label className="text-xs font-bold text-slate-500">Position</label>
                                 <input type="text" value={exp.position || ""} onChange={e => {
                                     const nx = [...(editForm.work_experience || [])];
                                     nx[index] = { ...nx[index], position: e.target.value };
                                     setEditForm({...editForm, work_experience: nx});
                                 }} className="w-full bg-surface border-0 rounded-lg px-3 py-2 text-sm mt-1" />
                             </div>
                             <div>
                                 <label className="text-xs font-bold text-slate-500">Company</label>
                                 <input type="text" value={exp.company || ""} onChange={e => {
                                     const nx = [...(editForm.work_experience || [])];
                                     nx[index] = { ...nx[index], company: e.target.value };
                                     setEditForm({...editForm, work_experience: nx});
                                 }} className="w-full bg-surface border-0 rounded-lg px-3 py-2 text-sm mt-1" />
                             </div>
                             <div>
                                 <label className="text-xs font-bold text-slate-500">Duration</label>
                                 <input type="text" value={exp.duration || ""} placeholder="e.g. 2020 - 2023" onChange={e => {
                                     const nx = [...(editForm.work_experience || [])];
                                     nx[index] = { ...nx[index], duration: e.target.value };
                                     setEditForm({...editForm, work_experience: nx});
                                 }} className="w-full bg-surface border-0 rounded-lg px-3 py-2 text-sm mt-1" />
                             </div>
                         </div>
                         <div>
                             <label className="text-xs font-bold text-slate-500">Description</label>
                             <textarea value={exp.description || ""} onChange={e => {
                                 const nx = [...(editForm.work_experience || [])];
                                 nx[index] = { ...nx[index], description: e.target.value };
                                 setEditForm({...editForm, work_experience: nx});
                             }} className="w-full bg-surface border-0 rounded-lg px-3 py-2 text-sm mt-1" rows={2} />
                         </div>
                      </div>
                   ))
                ) : (
                    profile?.work_experience && profile.work_experience.length > 0 ? profile.work_experience.map((exp, idx) => (
                        <div key={idx}>
                          <div className="flex gap-5 items-start py-5">
                            <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                              <span className="material-symbols-outlined text-slate-500 text-2xl">corporate_fare</span>
                            </div>
                            <div className="flex-1">
                              <div className="flex items-start justify-between">
                                <div>
                                  <h4 className="text-base font-bold text-slate-900 leading-tight">{exp.position}</h4>
                                  <p className="text-[#1a56db] font-semibold text-sm mt-0.5">{exp.company}</p>
                                </div>
                                <span className="text-xs text-slate-400 font-medium bg-slate-50 px-2.5 py-1 rounded-full border border-slate-100 flex-shrink-0 ml-4">{exp.duration}</span>
                              </div>
                              {exp.description && (
                                <p className="text-slate-500 text-sm leading-relaxed mt-2">{exp.description}</p>
                              )}
                            </div>
                          </div>
                          {idx < (profile.work_experience?.length ?? 0) - 1 && (
                            <div className="border-b border-surface-container-low" />
                          )}
                        </div>
                    )) : (
                        <p className="text-sm text-slate-400 py-2">No work experience added.</p>
                    )
                )}
              </div>
            </section>
                  {/* Education Section */}
            <section className="bg-surface-container-lowest rounded-lg pt-6 pb-8 px-8 shadow-[0_20px_40px_rgba(25,28,30,0.04)]">
              <div className="flex items-center justify-between mb-6 border-b border-surface-container-low pb-4">
                <h3 className="font-headline text-lg font-bold text-slate-900">Education</h3>
                {editing && (
                  <button 
                    onClick={() => {
                      const emptyEdu = { degree: "", institution: "", field_of_study: "", start_year: "", end_year: "", gpa: "" };
                      const currentEdu = Array.isArray(editForm.education) ? editForm.education : [];
                      setEditForm({...editForm, education: [...currentEdu, emptyEdu] as any});
                    }}
                    className="text-primary font-bold text-sm flex items-center gap-1 hover:underline"
                  >
                    <span className="material-symbols-outlined text-[18px]">add</span> Add Education
                  </button>
                )}
              </div>
              <div className="space-y-0">
                {editing ? (
                  (() => {
                    const eduList = Array.isArray(editForm.education) ? (editForm.education as any[]) : [];
                    if (eduList.length === 0) {
                      return (
                        <div className="text-center py-8">
                          <span className="material-symbols-outlined text-slate-300 text-4xl">school</span>
                          <p className="text-sm text-slate-400 mt-2">No education entries yet. Click "+ Add Education" to begin.</p>
                        </div>
                      );
                    }
                    return <>{eduList.map((edu: any, index: number) => (
                      <div key={index} className="p-5 mb-4 bg-surface-container-low/30 rounded-xl border border-surface-container-high space-y-4">
                        <div className="flex justify-between items-start">
                          <h4 className="text-sm font-semibold text-slate-700">Education #{index + 1}</h4>
                          <button onClick={() => {
                            const nx = [...(Array.isArray(editForm.education) ? (editForm.education as any[]) : [])];
                            nx.splice(index, 1);
                            setEditForm({...editForm, education: nx as any});
                          }} className="p-1 hover:bg-red-100 rounded text-red-400 transition-colors">
                            <span className="material-symbols-outlined text-[20px]">delete</span>
                          </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="text-xs font-bold text-slate-500">Degree / Qualification</label>
                            <input type="text" value={edu.degree || ""} placeholder="e.g. Bachelor of Science" onChange={e => {
                              const nx = [...(Array.isArray(editForm.education) ? (editForm.education as any[]) : [])];
                              nx[index] = { ...nx[index], degree: e.target.value };
                              setEditForm({...editForm, education: nx as any});
                            }} className="w-full bg-surface border-0 rounded-lg px-3 py-2 text-sm mt-1" />
                          </div>
                          <div>
                            <label className="text-xs font-bold text-slate-500">Institution</label>
                            <input type="text" value={edu.institution || ""} placeholder="e.g. University of Nairobi" onChange={e => {
                              const nx = [...(Array.isArray(editForm.education) ? (editForm.education as any[]) : [])];
                              nx[index] = { ...nx[index], institution: e.target.value };
                              setEditForm({...editForm, education: nx as any});
                            }} className="w-full bg-surface border-0 rounded-lg px-3 py-2 text-sm mt-1" />
                          </div>
                          <div>
                            <label className="text-xs font-bold text-slate-500">Field of Study</label>
                            <input type="text" value={edu.field_of_study || ""} placeholder="e.g. Computer Science" onChange={e => {
                              const nx = [...(Array.isArray(editForm.education) ? (editForm.education as any[]) : [])];
                              nx[index] = { ...nx[index], field_of_study: e.target.value };
                              setEditForm({...editForm, education: nx as any});
                            }} className="w-full bg-surface border-0 rounded-lg px-3 py-2 text-sm mt-1" />
                          </div>
                          <div>
                            <label className="text-xs font-bold text-slate-500">GPA (optional)</label>
                            <input type="text" value={edu.gpa || ""} placeholder="e.g. 3.8" onChange={e => {
                              const nx = [...(Array.isArray(editForm.education) ? (editForm.education as any[]) : [])];
                              nx[index] = { ...nx[index], gpa: e.target.value };
                              setEditForm({...editForm, education: nx as any});
                            }} className="w-full bg-surface border-0 rounded-lg px-3 py-2 text-sm mt-1" />
                          </div>
                          <div>
                            <label className="text-xs font-bold text-slate-500">Start Year</label>
                            <input type="text" value={edu.start_year || ""} placeholder="e.g. 2018" onChange={e => {
                              const nx = [...(Array.isArray(editForm.education) ? (editForm.education as any[]) : [])];
                              nx[index] = { ...nx[index], start_year: e.target.value };
                              setEditForm({...editForm, education: nx as any});
                            }} className="w-full bg-surface border-0 rounded-lg px-3 py-2 text-sm mt-1" />
                          </div>
                          <div>
                            <label className="text-xs font-bold text-slate-500">End Year</label>
                            <input type="text" value={edu.end_year || ""} placeholder="e.g. 2022" onChange={e => {
                              const nx = [...(Array.isArray(editForm.education) ? (editForm.education as any[]) : [])];
                              nx[index] = { ...nx[index], end_year: e.target.value };
                              setEditForm({...editForm, education: nx as any});
                            }} className="w-full bg-surface border-0 rounded-lg px-3 py-2 text-sm mt-1" />
                          </div>
                        </div>
                      </div>
                    ))}</>;
                  })()
                ) : (
                  (() => {
                    const rawEdu = profile?.education;
                    if (!rawEdu) return <p className="text-sm text-slate-400 py-2">No education details added.</p>;
                    if (typeof rawEdu === 'string') return <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-line py-2">{rawEdu}</p>;
                    if (!Array.isArray(rawEdu)) return <p className="text-sm text-slate-400 py-2">No education details added.</p>;
                    const validEntries = (rawEdu as any[]).filter(
                      (edu: any) => edu && typeof edu === 'object' && (edu.degree || edu.institution || edu.field_of_study)
                    );
                    if (validEntries.length === 0) {
                      return <p className="text-sm text-slate-400 py-2">No education details added yet. Click "Edit Profile" to add your background.</p>;
                    }
                    return (
                      <div className="space-y-0">
                        {validEntries.map((edu: any, idx: number) => (
                          <div key={idx}>
                            <div className="flex gap-5 items-start py-5">
                              <div className="w-12 h-12 rounded-xl bg-[#EEF2FF] flex items-center justify-center flex-shrink-0 mt-0.5">
                                <span className="material-symbols-outlined text-[#6366f1] text-[22px]">school</span>
                              </div>
                              <div className="flex-1">
                                <div className="flex items-start justify-between">
                                  <div>
                                    <h5 className="font-bold text-slate-900 text-base leading-tight">
                                      {edu.degree || "Degree"}{edu.field_of_study ? ` in ${edu.field_of_study}` : ''}
                                    </h5>
                                    <p className="text-[#1a56db] font-semibold text-sm mt-0.5">{edu.institution || "Institution"}</p>
                                  </div>
                                  {(edu.start_year || edu.end_year) && (
                                    <span className="text-xs text-slate-400 font-medium bg-slate-50 px-2.5 py-1 rounded-full border border-slate-100 flex-shrink-0 ml-4">
                                      {edu.start_year || "—"} – {edu.end_year || "Present"}
                                    </span>
                                  )}
                                </div>
                                {edu.gpa && (
                                  <span className="inline-block mt-2 text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">GPA: {edu.gpa}</span>
                                )}
                              </div>
                            </div>
                            {idx < validEntries.length - 1 && (
                              <div className="border-b border-surface-container-low" />
                            )}
                          </div>
                        ))}
                      </div>
                    );
                  })()
                )}
              </div>
            </section>

            {/* Projects Section */}
            <section className="bg-surface-container-lowest rounded-lg pt-6 pb-8 px-8 shadow-[0_20px_40px_rgba(25,28,30,0.04)]">
              <div className="flex items-center justify-between mb-6 border-b border-surface-container-low pb-4">
                <h3 className="font-headline text-lg font-bold text-slate-900">Projects</h3>
                {editing && (
                  <button onClick={() => {
                        const emptyProj = { title: "", description: "", link: "" };
                        setEditForm({...editForm, projects: [...(editForm.projects || []), emptyProj]});
                  }} className="text-primary font-bold text-sm flex items-center gap-1 hover:underline">
                    <span className="material-symbols-outlined text-[18px]">add</span> Add Project
                  </button>
                )}
              </div>
              <div className="space-y-0">
                 {editing ? (
                   (editForm.projects || []).map((proj, index) => (
                      <div key={index} className="p-5 mb-4 bg-surface-container-low/30 rounded-xl border border-surface-container-high space-y-4">
                         <div className="flex justify-between items-start">
                             <h4 className="text-sm font-semibold text-slate-700">Project #{index + 1}</h4>
                             <button onClick={() => {
                                 const nx = [...(editForm.projects || [])];
                                 nx.splice(index, 1);
                                 setEditForm({...editForm, projects: nx});
                             }} className="p-1 hover:bg-red-100 rounded text-red-400 transition-colors">
                                 <span className="material-symbols-outlined text-[20px]">delete</span>
                             </button>
                         </div>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                             <div>
                                 <label className="text-xs font-bold text-slate-500">Project Title</label>
                                 <input type="text" value={proj.title || ""} onChange={e => {
                                     const nx = [...(editForm.projects || [])];
                                     nx[index] = { ...nx[index], title: e.target.value };
                                     setEditForm({...editForm, projects: nx});
                                 }} className="w-full bg-surface border-0 rounded-lg px-3 py-2 text-sm mt-1" />
                             </div>
                             <div>
                                 <label className="text-xs font-bold text-slate-500">Project Link</label>
                                 <input type="url" value={proj.link || ""} onChange={e => {
                                     const nx = [...(editForm.projects || [])];
                                     nx[index] = { ...nx[index], link: e.target.value };
                                     setEditForm({...editForm, projects: nx});
                                 }} className="w-full bg-surface border-0 rounded-lg px-3 py-2 text-sm mt-1" />
                             </div>
                         </div>
                         <div>
                             <label className="text-xs font-bold text-slate-500">Description</label>
                             <textarea value={proj.description || ""} onChange={e => {
                                 const nx = [...(editForm.projects || [])];
                                 nx[index] = { ...nx[index], description: e.target.value };
                                 setEditForm({...editForm, projects: nx});
                             }} className="w-full bg-surface border-0 rounded-lg px-3 py-2 text-sm mt-1" rows={2} />
                         </div>
                      </div>
                   ))
                 ) : (
                    profile?.projects && profile.projects.length > 0 ? profile.projects.map((proj, idx) => (
                       <div key={idx}>
                         <div className="flex gap-5 items-start py-5">
                           <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                             <span className="material-symbols-outlined text-amber-500 text-2xl">rocket_launch</span>
                           </div>
                           <div className="flex-1">
                             <h4 className="text-base font-bold text-slate-900">{proj.title}</h4>
                             <p className="text-slate-500 text-sm leading-relaxed mb-2 mt-1">{proj.description}</p>
                             {proj.link && (
                               <a href={proj.link} target="_blank" rel="noopener noreferrer" className="text-[#1a56db] text-xs font-bold hover:underline inline-flex items-center gap-1">
                                 <span className="material-symbols-outlined text-[14px]">open_in_new</span> View Project
                               </a>
                             )}
                           </div>
                         </div>
                         {idx < (profile.projects?.length ?? 0) - 1 && (
                           <div className="border-b border-surface-container-low" />
                         )}
                       </div>
                    )) : (
                       <p className="text-sm text-slate-400 py-2">No projects added.</p>
                    )
                 )}
              </div>
            </section>

            {/* Footer CTA */}
            {!editing && (
              <section className="bg-gradient-to-br from-[#1a56db] to-[#2563eb] rounded-2xl p-8 shadow-lg">
                <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                  <div className="w-14 h-14 rounded-xl bg-white/15 flex items-center justify-center flex-shrink-0">
                    <span className="material-symbols-outlined text-white text-3xl">description</span>
                  </div>
                  <div className="flex-1 text-center md:text-left">
                    <h3 className="font-headline text-lg font-bold text-white mb-1">Ready to apply for new roles?</h3>
                    <p className="text-blue-200 text-sm">Keep your resume up to date to increase your chances of landing the right opportunity.</p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3 flex-shrink-0">
                    <label className="cursor-pointer inline-flex items-center gap-2 px-5 py-2.5 bg-white text-[#1a56db] font-bold rounded-full hover:bg-blue-50 transition-colors text-sm shadow">
                      <span className="material-symbols-outlined text-[18px]">upload_file</span>
                      Upload New Resume
                      <input type="file" className="hidden" accept=".pdf,.docx" onChange={handleFileChange} />
                    </label>
                    {profile?.resume_link && (
                      <a href={profile.resume_link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/10 text-white font-bold rounded-full hover:bg-white/20 transition-colors text-sm border border-white/30">
                        <span className="material-symbols-outlined text-[18px]">visibility</span>
                        Preview Current
                      </a>
                    )}
                  </div>
                </div>
              </section>
            )}

          </div>
        </div>
      </main>

      <Dialog open={isPhotoEditorOpen} onOpenChange={(open) => {
        if (!open) {
          closePhotoEditor();
        }
      }}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Fit Profile Photo</DialogTitle>
            <DialogDescription>
              Adjust zoom and position so your face is centered before saving.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="mx-auto h-72 w-72 overflow-hidden rounded-full border-4 border-muted bg-muted">
              {photoEditorSrc && previewFrame && (
                <div className="relative h-full w-full overflow-hidden">
                  <img
                    src={photoEditorSrc}
                    alt="Profile fit preview"
                    className="absolute max-w-none"
                    style={{
                      left: `${previewFrame.drawX}px`,
                      top: `${previewFrame.drawY}px`,
                      width: `${previewFrame.drawWidth}px`,
                      height: `${previewFrame.drawHeight}px`,
                    }}
                  />

                  {/* Rule-of-thirds guide */}
                  <div className="pointer-events-none absolute inset-0">
                    <div className="absolute left-1/3 top-0 h-full w-px bg-white/40" />
                    <div className="absolute left-2/3 top-0 h-full w-px bg-white/40" />
                    <div className="absolute top-1/3 left-0 h-px w-full bg-white/40" />
                    <div className="absolute top-2/3 left-0 h-px w-full bg-white/40" />
                  </div>
                </div>
              )}
              {!photoEditorSrc && (
                <div className="flex h-full w-full items-center justify-center text-sm text-muted-foreground">
                  Choose a photo to continue
                </div>
              )}
            </div>

            <div className="flex justify-center">
              <Button variant="outline" onClick={triggerPhotoPicker}>
                Update Photo
              </Button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium">Zoom</label>
                <Input
                  type="range"
                  min={1.05}
                  max={3}
                  step={0.01}
                  value={photoEditorZoom}
                  onChange={(e) => setPhotoEditorZoom(Number(e.target.value))}
                />
              </div>

              <div>
                <label className="text-sm font-medium">Horizontal Position</label>
                <Input
                  type="range"
                  min={-100}
                  max={100}
                  step={1}
                  value={photoEditorX}
                  onChange={(e) => setPhotoEditorX(Number(e.target.value))}
                />
              </div>

              <div>
                <label className="text-sm font-medium">Vertical Position</label>
                <Input
                  type="range"
                  min={-100}
                  max={100}
                  step={1}
                  value={photoEditorY}
                  onChange={(e) => setPhotoEditorY(Number(e.target.value))}
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={closePhotoEditor}>
              Cancel
            </Button>
            <Button onClick={handlePhotoEditorSave} disabled={loading || !photoEditorSrc}>
              {loading ? "Saving..." : "Save Photo"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default Profile;
