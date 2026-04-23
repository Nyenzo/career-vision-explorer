import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Camera,
  Check,
  ChevronLeft,
  ChevronRight,
  Lightbulb,
  Loader2,
  Plus,
  Target,
  Users,
  X,
} from "lucide-react";
import { toast } from "sonner";
import Navbar from "@/components/layout/Navbar";
import { cn } from "@/lib/utils";
import { cofounderMatchingService } from "@/services/founder-matching.service";
import type {
  CommitmentLevel,
  IdeaProject,
  IntentType,
  LocationPreference,
  OnboardingData,
} from "@/types/founder-matching";

const MIN_PHOTOS = 3;

const BASE_STEPS = [
  { id: "intent", title: "What brings you here?" },
  { id: "photos", title: "Add your photos" },
  { id: "skills", title: "Skills" },
  { id: "seeking", title: "What you're looking for" },
  { id: "workstyle", title: "Availability and location" },
  { id: "background", title: "Background" },
  { id: "bio", title: "Bio and links" },
] as const;

const PROJECT_STEP = { id: "project", title: "Your startup idea" } as const;

function ChipInput({
  label,
  hint,
  placeholder,
  values,
  onChange,
}: {
  label: string;
  hint?: string;
  placeholder: string;
  values: string[];
  onChange: (values: string[]) => void;
}) {
  const [draft, setDraft] = useState("");

  const addValue = () => {
    const trimmed = draft.trim();
    if (!trimmed) return;
    if (!values.includes(trimmed)) {
      onChange([...values, trimmed]);
    }
    setDraft("");
  };

  return (
    <div>
      <label className="mb-1.5 block text-sm font-semibold text-gray-700">{label}</label>
      {hint ? <p className="mb-2 text-xs text-gray-500">{hint}</p> : null}
      <div className="flex gap-2">
        <input
          type="text"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === ",") {
              event.preventDefault();
              addValue();
            }
          }}
          placeholder={placeholder}
          className="flex-1 rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
        />
        <button
          type="button"
          onClick={addValue}
          className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white transition hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {values.map((value) => (
          <span
            key={value}
            className="inline-flex items-center gap-1 rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700"
          >
            {value}
            <button
              type="button"
              onClick={() => onChange(values.filter((item) => item !== value))}
              aria-label={`Remove ${value}`}
              className="text-blue-400 hover:text-blue-700"
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
      </div>
    </div>
  );
}

function OptionButton<T extends string>({
  value,
  label,
  current,
  onClick,
}: {
  value: T;
  label: string;
  current: T | undefined;
  onClick: (value: T) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onClick(value)}
      className={cn(
        "rounded-xl border-2 px-4 py-3 text-sm font-semibold transition",
        current === value
          ? "border-blue-500 bg-blue-50 text-blue-700"
          : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
      )}
    >
      {label}
    </button>
  );
}

export default function CofounderOnboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [photoUrls, setPhotoUrls] = useState<string[]>([]);
  const [maxPhotos, setMaxPhotos] = useState(6);
  const [data, setData] = useState<OnboardingData>({
    technical_skills: [],
    soft_skills: [],
    seeking_roles: [],
    industries: [],
    preferred_locations: [],
    achievements: [],
    education: [],
    certifications: [],
  });
  const [projectData, setProjectData] = useState<Partial<IdeaProject>>({
    tech_stack: [],
    stage: "idea",
  });

  const steps = useMemo(
    () => (data.intent_type === "founder" ? [...BASE_STEPS, PROJECT_STEP] : [...BASE_STEPS]),
    [data.intent_type]
  );

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const profile = await cofounderMatchingService.getProfile();
        if (cancelled) return;

        if (profile.onboarding_completed && (profile.photo_urls?.length ?? 0) >= MIN_PHOTOS) {
          navigate("/founder/dashboard", { replace: true });
          return;
        }

        setPhotoUrls(profile.photo_urls ?? []);
        setData((prev) => ({
          ...prev,
          intent_type: profile.intent_type,
          current_role: profile.current_role,
          years_experience: profile.years_experience,
          technical_skills: profile.technical_skills ?? [],
          soft_skills: profile.soft_skills ?? [],
          seeking_roles: profile.seeking_roles ?? [],
          industries: profile.industries ?? [],
          commitment_level: profile.commitment_level,
          location_preference: profile.location_preference,
          preferred_locations: profile.preferred_locations ?? [],
          achievements: profile.achievements ?? [],
          education: profile.education ?? [],
          certifications: profile.certifications ?? [],
          bio: profile.bio,
          looking_for: profile.looking_for,
          availability: profile.availability,
          linkedin_url: profile.linkedin_url,
          portfolio_url: profile.portfolio_url,
        }));

        if (profile.intent_type === "founder") {
          try {
            const ideaProject = await cofounderMatchingService.getIdeaProject();
            if (!cancelled && ideaProject) {
              setProjectData({
                title: ideaProject.title,
                idea_description: ideaProject.idea_description,
                problem_statement: ideaProject.problem_statement,
                looking_for_description: ideaProject.looking_for_description,
                stage: ideaProject.stage ?? "idea",
                industry: ideaProject.industry,
                tech_stack: ideaProject.tech_stack ?? [],
                max_members: ideaProject.max_members,
              });
            }
          } catch {
            // No existing idea project yet.
          }
        }

        try {
          const status = await cofounderMatchingService.getPhotoStatus();
          if (!cancelled) {
            setPhotoUrls(status.photo_urls);
            setMaxPhotos(status.max_photos);
          }
        } catch {
          // Non-blocking.
        }
      } catch {
        // First-time founder onboarding is allowed to start empty.
      } finally {
        if (!cancelled) {
          setIsInitialLoading(false);
        }
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [navigate]);

  const merge = (partial: Partial<OnboardingData>) => {
    setData((prev) => ({ ...prev, ...partial }));
  };

  const mergeProject = (partial: Partial<IdeaProject>) => {
    setProjectData((prev) => ({ ...prev, ...partial }));
  };

  const handlePhotoUpload = async (file: File) => {
    if (photoUrls.length >= maxPhotos) {
      toast.error(`Maximum ${maxPhotos} photos allowed.`);
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Photo is too large. Maximum file size is 5 MB.");
      return;
    }

    setIsUploading(true);
    try {
      await cofounderMatchingService.uploadPhoto(file);
      const status = await cofounderMatchingService.getPhotoStatus();
      setPhotoUrls(status.photo_urls);
      setMaxPhotos(status.max_photos);
      toast.success(`Photo uploaded. ${status.total_photos}/${status.max_photos}`);
    } catch {
      toast.error("Failed to upload photo.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeletePhoto = async (url: string) => {
    try {
      await cofounderMatchingService.deletePhoto(url);
      const status = await cofounderMatchingService.getPhotoStatus();
      setPhotoUrls(status.photo_urls);
      setMaxPhotos(status.max_photos);
      toast.success("Photo removed.");
    } catch {
      toast.error("Failed to delete photo.");
    }
  };

  const normalizePayload = (): OnboardingData => ({
    intent_type: data.intent_type,
    current_role: data.current_role?.trim() || undefined,
    years_experience: data.years_experience,
    technical_skills: data.technical_skills?.filter(Boolean) ?? [],
    soft_skills: data.soft_skills?.filter(Boolean) ?? [],
    seeking_roles: data.seeking_roles?.filter(Boolean) ?? [],
    industries: data.industries?.filter(Boolean) ?? [],
    commitment_level: data.commitment_level,
    location_preference: data.location_preference,
    preferred_locations: data.preferred_locations?.filter(Boolean) ?? [],
    achievements: data.achievements?.filter(Boolean) ?? [],
    education: data.education?.filter(Boolean) ?? [],
    certifications: data.certifications?.filter(Boolean) ?? [],
    bio: data.bio?.trim() || undefined,
    looking_for:
      data.looking_for?.trim() ||
      (data.seeking_roles?.length ? data.seeking_roles.join(", ") : undefined),
    availability: data.availability || data.commitment_level,
    linkedin_url: data.linkedin_url?.trim() || undefined,
    portfolio_url: data.portfolio_url?.trim() || undefined,
    idea_description: projectData.idea_description?.trim() || data.idea_description,
    problem_statement: projectData.problem_statement?.trim() || data.problem_statement,
    looking_for_description:
      projectData.looking_for_description?.trim() || data.looking_for_description,
  });

  const validateStep = (): boolean => {
    const currentStepId = steps[step]?.id;

    if (currentStepId === "intent" && !data.intent_type) {
      toast.error("Select how you want to use cofounder matching.");
      return false;
    }

    if (currentStepId === "photos" && photoUrls.length < MIN_PHOTOS) {
      toast.error(`Upload at least ${MIN_PHOTOS} photos to continue.`);
      return false;
    }

    if (currentStepId === "skills" && !(data.technical_skills?.length)) {
      toast.error("Add at least one technical skill.");
      return false;
    }

    if (currentStepId === "seeking" && (!(data.seeking_roles?.length) || !(data.industries?.length))) {
      toast.error("Add at least one role and one industry you're looking for.");
      return false;
    }

    if (
      currentStepId === "workstyle" &&
      (!data.commitment_level || !data.location_preference || !(data.preferred_locations?.length))
    ) {
      toast.error("Set your commitment, location preference, and at least one preferred location.");
      return false;
    }

    if (currentStepId === "bio" && !data.bio?.trim()) {
      toast.error("Add a short bio before continuing.");
      return false;
    }

    if (currentStepId === "project" && (!projectData.title?.trim() || !projectData.idea_description?.trim())) {
      toast.error("Founders need a project name and idea description.");
      return false;
    }

    return true;
  };

  const saveProgress = async () => {
    setIsSaving(true);
    try {
      await cofounderMatchingService.updateOnboardingProfile(normalizePayload());

      if (data.intent_type === "founder" && projectData.title?.trim()) {
        const projectPayload: Partial<IdeaProject> = {
          title: projectData.title.trim(),
          idea_description: projectData.idea_description?.trim(),
          problem_statement: projectData.problem_statement?.trim(),
          looking_for_description: projectData.looking_for_description?.trim(),
          stage: projectData.stage,
          industry: projectData.industry?.trim(),
          tech_stack: projectData.tech_stack ?? [],
          max_members: projectData.max_members,
        };

        try {
          await cofounderMatchingService.updateIdeaProject(projectPayload);
        } catch {
          await cofounderMatchingService.createIdeaProject(projectPayload);
        }
      }

      return true;
    } catch {
      toast.error("Failed to save onboarding progress.");
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  const handleNext = async () => {
    if (!validateStep()) return;

    const saved = await saveProgress();
    if (!saved) return;

    const isLast = step === steps.length - 1;
    if (!isLast) {
      setStep((prev) => prev + 1);
      return;
    }

    setIsCompleting(true);
    try {
      await cofounderMatchingService.completeOnboarding();
      toast.success("Onboarding complete.");
      navigate("/founder/dashboard", { replace: true });
    } catch (error: any) {
      const detail = error?.response?.data?.detail;
      toast.error(typeof detail === "string" ? detail : "Failed to complete onboarding.");
    } finally {
      setIsCompleting(false);
    }
  };

  if (isInitialLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const progress = Math.round(((step + 1) / steps.length) * 100);
  const currentStep = steps[step]?.id;

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <main className="px-4 py-8">
        <div className="mx-auto max-w-3xl">
          <section className="mb-8 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-blue-600">
                Visiondrill Founder Network
              </p>
              <h1 className="text-3xl font-bold tracking-tight text-gray-900">Build your cofounder profile</h1>
            </div>
          </section>

          <section className="mb-6">
            <div className="mb-2 flex items-center justify-between text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">
              <span>Step {step + 1} of {steps.length}</span>
              <span>{progress}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-gray-200">
              <div
                className="h-full rounded-full bg-blue-400 transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </section>

          <section className="rounded-3xl bg-white p-6 shadow-2xl sm:p-8">
            <h2 className="mb-6 text-2xl font-bold text-gray-900">{steps[step].title}</h2>

            {currentStep === "intent" ? (
              <div className="grid gap-3">
                {[
                  {
                    key: "founder" as IntentType,
                    label: "I have an idea",
                    desc: "You already have a startup idea and want the right founding partner.",
                    icon: <Lightbulb className="h-5 w-5" />,
                  },
                  {
                    key: "cofounder" as IntentType,
                    label: "I want to join as a cofounder",
                    desc: "You want to join an existing venture as a founding team member.",
                    icon: <Users className="h-5 w-5" />,
                  },
                  {
                    key: "collaborator" as IntentType,
                    label: "I'm exploring both",
                    desc: "You're open to collaborating with founders or joining early teams while you explore the right fit.",
                    icon: <Target className="h-5 w-5" />,
                  },
                ].map((option) => (
                  <button
                    key={option.key}
                    type="button"
                    onClick={() => merge({ intent_type: option.key })}
                    className={cn(
                      "rounded-2xl border-2 px-5 py-4 text-left transition",
                      data.intent_type === option.key
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 bg-white hover:border-gray-300"
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 rounded-lg bg-blue-100 p-2 text-blue-700">{option.icon}</div>
                      <div>
                        <p className="font-semibold text-gray-900">{option.label}</p>
                        <p className="mt-1 text-sm text-gray-500">{option.desc}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            ) : null}

            {currentStep === "photos" ? (
              <div className="space-y-5">
                <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
                  You need at least {MIN_PHOTOS} photos to access cofounder matching.
                </div>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                  {photoUrls.map((url, index) => (
                    <div key={url} className="relative aspect-square overflow-hidden rounded-2xl bg-gray-100">
                      <img src={url} alt={`Photo ${index + 1}`} className="h-full w-full object-cover" />
                      <button
                        type="button"
                        onClick={() => handleDeletePhoto(url)}
                        className="absolute right-2 top-2 inline-flex h-8 w-8 items-center justify-center rounded-full bg-black/65 text-white hover:bg-black/80"
                        aria-label={`Delete photo ${index + 1}`}
                      >
                        <X className="h-4 w-4" />
                      </button>
                      {index === 0 ? (
                        <span className="absolute bottom-2 left-2 rounded-full bg-blue-600 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-white">
                          Primary
                        </span>
                      ) : null}
                    </div>
                  ))}

                  {photoUrls.length < maxPhotos ? (
                    <label className="flex aspect-square cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50 text-center text-gray-500 transition hover:border-blue-400 hover:text-blue-600">
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(event) => {
                          const file = event.target.files?.[0];
                          if (file) handlePhotoUpload(file);
                          event.target.value = "";
                        }}
                        disabled={isUploading}
                      />
                      {isUploading ? <Loader2 className="h-6 w-6 animate-spin" /> : <Camera className="h-6 w-6" />}
                      <span className="mt-2 text-xs font-semibold">Add Photo</span>
                    </label>
                  ) : null}
                </div>
                <p className="text-sm text-gray-500">
                  {photoUrls.length}/{maxPhotos} uploaded
                  {photoUrls.length < MIN_PHOTOS ? `, ${MIN_PHOTOS - photoUrls.length} more needed` : ""}
                </p>
              </div>
            ) : null}

            {currentStep === "skills" ? (
              <div className="space-y-5">
                <ChipInput
                  label="Technical skills"
                  hint="At least one is required."
                  placeholder="React, Python, AWS"
                  values={data.technical_skills ?? []}
                  onChange={(values) => merge({ technical_skills: values })}
                />
                <ChipInput
                  label="Soft skills"
                  placeholder="Leadership, Communication, Product Strategy"
                  values={data.soft_skills ?? []}
                  onChange={(values) => merge({ soft_skills: values })}
                />
              </div>
            ) : null}

            {currentStep === "seeking" ? (
              <div className="space-y-5">
                <ChipInput
                  label="Roles you're looking for"
                  hint="These drive your match recommendations."
                  placeholder="CTO, Product Designer, Growth Lead"
                  values={data.seeking_roles ?? []}
                  onChange={(values) => merge({ seeking_roles: values })}
                />
                <ChipInput
                  label="Industries"
                  placeholder="SaaS, AI, Healthcare"
                  values={data.industries ?? []}
                  onChange={(values) => merge({ industries: values })}
                />
              </div>
            ) : null}

            {currentStep === "workstyle" ? (
              <div className="space-y-6">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">Commitment level</label>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {[
                      ["full_time", "Full-time"],
                      ["part_time", "Part-time"],
                      ["flexible", "Flexible"],
                      ["contract", "Contract"],
                    ].map(([value, label]) => (
                      <OptionButton
                        key={value}
                        value={value as CommitmentLevel}
                        label={label}
                        current={data.commitment_level}
                        onClick={(selected) => merge({ commitment_level: selected, availability: selected })}
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">Location preference</label>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {[
                      ["remote", "Remote"],
                      ["hybrid", "Hybrid"],
                      ["on_site", "On-site"],
                      ["flexible", "Flexible"],
                    ].map(([value, label]) => (
                      <OptionButton
                        key={value}
                        value={value as LocationPreference}
                        label={label}
                        current={data.location_preference}
                        onClick={(selected) => merge({ location_preference: selected })}
                      />
                    ))}
                  </div>
                </div>

                <ChipInput
                  label="Preferred locations"
                  placeholder="Remote, New York, Lagos, London"
                  values={data.preferred_locations ?? []}
                  onChange={(values) => merge({ preferred_locations: values })}
                />
              </div>
            ) : null}

            {currentStep === "background" ? (
              <div className="space-y-5">
                <ChipInput
                  label="Achievements"
                  placeholder="Built an MVP in 6 weeks, Raised seed funding"
                  values={data.achievements ?? []}
                  onChange={(values) => merge({ achievements: values })}
                />
                <ChipInput
                  label="Education"
                  placeholder="BSc Computer Science, YC Startup School"
                  values={data.education ?? []}
                  onChange={(values) => merge({ education: values })}
                />
                <ChipInput
                  label="Certifications"
                  placeholder="AWS Solutions Architect, PMP"
                  values={data.certifications ?? []}
                  onChange={(values) => merge({ certifications: values })}
                />
              </div>
            ) : null}

            {currentStep === "bio" ? (
              <div className="space-y-5">
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-gray-700">Bio</label>
                  <textarea
                    rows={5}
                    value={data.bio ?? ""}
                    onChange={(event) => merge({ bio: event.target.value })}
                    placeholder="Tell potential cofounders who you are, what you've built, and what kind of venture you want to be part of."
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-gray-700">Looking for</label>
                  <textarea
                    rows={3}
                    value={data.looking_for ?? ""}
                    onChange={(event) => merge({ looking_for: event.target.value })}
                    placeholder="Describe the kind of cofounder or collaborator you want to meet."
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                  />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-gray-700">LinkedIn URL</label>
                    <input
                      type="url"
                      value={data.linkedin_url ?? ""}
                      onChange={(event) => merge({ linkedin_url: event.target.value })}
                      placeholder="https://linkedin.com/in/..."
                      className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-gray-700">Portfolio URL</label>
                    <input
                      type="url"
                      value={data.portfolio_url ?? ""}
                      onChange={(event) => merge({ portfolio_url: event.target.value })}
                      placeholder="https://your-portfolio.com"
                      className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                    />
                  </div>
                </div>
              </div>
            ) : null}

            {currentStep === "project" ? (
              <div className="space-y-5">
                <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4 text-sm text-blue-900">
                  Founders should describe the venture they want help building so discovery can surface the right matches.
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-gray-700">Startup or project name</label>
                  <input
                    type="text"
                    value={projectData.title ?? ""}
                    onChange={(event) => mergeProject({ title: event.target.value })}
                    placeholder="e.g. HealthPilot"
                    className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-gray-700">Idea description</label>
                  <textarea
                    rows={4}
                    value={projectData.idea_description ?? ""}
                    onChange={(event) => mergeProject({ idea_description: event.target.value })}
                    placeholder="What are you building and why does it matter?"
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-gray-700">Problem statement</label>
                  <textarea
                    rows={3}
                    value={projectData.problem_statement ?? ""}
                    onChange={(event) => mergeProject({ problem_statement: event.target.value })}
                    placeholder="What pain point are you solving?"
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-gray-700">Who are you looking for?</label>
                  <textarea
                    rows={3}
                    value={projectData.looking_for_description ?? ""}
                    onChange={(event) => mergeProject({ looking_for_description: event.target.value })}
                    placeholder="Describe the cofounder or early team profile you need."
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                  />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-gray-700">Stage</label>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        ["idea", "Idea"],
                        ["mvp", "MVP"],
                        ["active", "Active"],
                        ["paused", "Paused"],
                      ].map(([value, label]) => (
                        <OptionButton
                          key={value}
                          value={value as NonNullable<IdeaProject["stage"]>}
                          label={label}
                          current={projectData.stage}
                          onClick={(selected) => mergeProject({ stage: selected })}
                        />
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-gray-700">Industry</label>
                    <input
                      type="text"
                      value={projectData.industry ?? ""}
                      onChange={(event) => mergeProject({ industry: event.target.value })}
                      placeholder="SaaS, AI, HealthTech"
                      className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                    />
                  </div>
                </div>
                <ChipInput
                  label="Tech stack"
                  placeholder="React, Python, Supabase"
                  values={projectData.tech_stack ?? []}
                  onChange={(values) => mergeProject({ tech_stack: values })}
                />
              </div>
            ) : null}

            <div className="mt-8 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setStep((prev) => Math.max(0, prev - 1))}
                disabled={step === 0 || isSaving || isCompleting}
                className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-600 transition hover:bg-gray-50 disabled:opacity-40"
              >
                <ChevronLeft className="h-4 w-4" />
                Back
              </button>

              <button
                type="button"
                onClick={handleNext}
                disabled={isSaving || isCompleting}
                className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-60"
              >
                {isSaving || isCompleting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : step === steps.length - 1 ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
                {isCompleting ? "Completing..." : isSaving ? "Saving..." : step === steps.length - 1 ? "Complete" : "Next"}
              </button>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
