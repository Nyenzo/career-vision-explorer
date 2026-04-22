import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Camera, Trash2, Loader2, Save, Plus } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import { cofounderMatchingService } from "@/services/founder-matching.service";
import { toast } from "sonner";
import type {
    CofounderMatchProfile,
    CommitmentLevel,
    LocationPreference,
    IntentType,
} from "@/types/founder-matching";

// ----- Mini components -----

function TagInput({
    label,
    values,
    placeholder,
    onChange,
}: {
    label: string;
    values: string[];
    placeholder: string;
    onChange: (v: string[]) => void;
}) {
    const [draft, setDraft] = useState("");
    const add = () => {
        const v = draft.trim();
        if (v && !values.includes(v)) onChange([...values, v]);
        setDraft("");
    };
    return (
        <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">{label}</label>
            <div className="flex gap-2 mb-2">
                <input
                    type="text"
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === ",") { e.preventDefault(); add(); }
                    }}
                    placeholder={placeholder}
                    className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                />
                <button type="button" onClick={add}
                    className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition">
                    <Plus className="h-4 w-4" />
                </button>
            </div>
            <div className="flex flex-wrap gap-1.5">
                {values.map((v) => (
                    <span key={v}
                        className="inline-flex items-center gap-1 rounded-full border border-blue-200 bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700">
                        {v}
                        <button onClick={() => onChange(values.filter((x) => x !== v))}
                            className="text-blue-400 hover:text-blue-700 transition">×</button>
                    </span>
                ))}
            </div>
        </div>
    );
}

function Select<T extends string>({
    label,
    value,
    options,
    onChange,
}: {
    label: string;
    value: T | undefined;
    options: { key: T; label: string }[];
    onChange: (v: T) => void;
}) {
    return (
        <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">{label}</label>
            <select
                value={value ?? ""}
                onChange={(e) => onChange(e.target.value as T)}
                className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white"
            >
                <option value="">Select…</option>
                {options.map((o) => (
                    <option key={o.key} value={o.key}>{o.label}</option>
                ))}
            </select>
        </div>
    );
}

// ----- Photo management -----

interface PhotoGridProps {
    photos: string[];
    isUploading: boolean;
    onUpload: (file: File) => void;
    onDelete: (url: string) => void;
}

function PhotoGrid({ photos, isUploading, onUpload, onDelete }: PhotoGridProps) {
    const inputRef = useRef<HTMLInputElement>(null);

    const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) onUpload(file);
        e.target.value = "";
    };

    return (
        <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Photos</label>
            <div className="grid grid-cols-3 gap-2">
                {photos.map((url, i) => (
                    <div key={url} className="relative aspect-square rounded-xl overflow-hidden bg-gray-100 group">
                        <img src={url} alt={`Photo ${i + 1}`} className="h-full w-full object-cover" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                            <button
                                onClick={() => onDelete(url)}
                                className="flex h-8 w-8 items-center justify-center rounded-full bg-red-500 text-white hover:bg-red-600 transition"
                                aria-label="Delete photo"
                            >
                                <Trash2 className="h-4 w-4" />
                            </button>
                        </div>
                        {i === 0 && (
                            <span className="absolute bottom-1 left-1 rounded bg-black/60 px-1.5 py-0.5 text-[9px] font-bold text-white uppercase">
                                Primary
                            </span>
                        )}
                    </div>
                ))}

                {/* Upload slot */}
                <button
                    onClick={() => inputRef.current?.click()}
                    disabled={isUploading}
                    className="aspect-square rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center gap-1 text-gray-400 hover:border-blue-400 hover:text-blue-500 transition disabled:opacity-50"
                >
                    {isUploading ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                        <>
                            <Camera className="h-5 w-5" />
                            <span className="text-[10px] font-semibold">Add Photo</span>
                        </>
                    )}
                </button>
            </div>
            <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
        </div>
    );
}

// ----- Main page -----

export default function FounderProfile() {
    const navigate = useNavigate();
    const [profile, setProfile] = useState<CofounderMatchProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [form, setForm] = useState<Partial<CofounderMatchProfile>>({});

    const load = useCallback(async () => {
        setIsLoading(true);
        try {
            const p = await cofounderMatchingService.getProfile();
            setProfile(p);
            setForm(p);
        } catch {
            toast.error("Failed to load profile");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => { load(); }, [load]);

    const merge = (partial: Partial<CofounderMatchProfile>) =>
        setForm((prev) => ({ ...prev, ...partial }));

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const updated = await cofounderMatchingService.updateProfile(form as any);
            setProfile(updated);
            setForm(updated);
            toast.success("Profile saved!");
        } catch {
            toast.error("Failed to save profile");
        } finally {
            setIsSaving(false);
        }
    };

    const handleUpload = async (file: File) => {
        if (file.size > 5 * 1024 * 1024) {
            toast.error("Photo is too large. Maximum file size is 5 MB.");
            return;
        }
        setIsUploading(true);
        try {
            await cofounderMatchingService.uploadPhoto(file);
            toast.success("Photo uploaded!");
            // Refresh photos
            const status = await cofounderMatchingService.getPhotoStatus();
            merge({ photo_urls: status.photo_urls });
        } catch {
            toast.error("Failed to upload photo");
        } finally {
            setIsUploading(false);
        }
    };

    const handleDeletePhoto = async (url: string) => {
        try {
            await cofounderMatchingService.deletePhoto(url);
            merge({ photo_urls: (form.photo_urls ?? []).filter((u) => u !== url) });
            toast.success("Photo removed");
        } catch {
            toast.error("Failed to delete photo");
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />

            <div className="mx-auto max-w-3xl px-4 py-6 flex flex-col gap-6">
                <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                        <div className="space-y-2">
                            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-blue-600">
                                Visiondrill Founder Network
                            </p>
                            <div>
                                <h1 className="text-3xl font-bold tracking-tight text-gray-900">Edit founder profile</h1>
                                <p className="mt-2 text-sm text-gray-600">
                                    Keep your founder identity aligned with your main Visiondrill profile while tuning the details that shape match quality.
                                </p>
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                            <button
                                onClick={() => navigate("/founder/dashboard")}
                                className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm font-semibold text-gray-700 transition hover:border-gray-300 hover:bg-gray-50"
                            >
                                <ArrowLeft className="h-4 w-4" />
                                Founder dashboard
                            </button>

                            <button
                                onClick={handleSave}
                                disabled={isSaving}
                                className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50"
                            >
                                {isSaving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                                Save profile
                            </button>
                        </div>
                    </div>
                </section>

                {/* Photos */}
                <section className="rounded-xl bg-white border border-gray-100 p-5 shadow-sm">
                    <PhotoGrid
                        photos={form.photo_urls ?? []}
                        isUploading={isUploading}
                        onUpload={handleUpload}
                        onDelete={handleDeletePhoto}
                    />
                </section>

                {/* Basic info */}
                <section className="rounded-xl bg-white border border-gray-100 p-5 shadow-sm flex flex-col gap-4">
                    <h2 className="font-bold text-gray-800">Basic Information</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Name</label>
                            <input type="text" value={form.name ?? ""}
                                onChange={(e) => merge({ name: e.target.value })}
                                className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                                placeholder="Your full name" />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Current Role</label>
                            <input type="text" value={form.current_role ?? ""}
                                onChange={(e) => merge({ current_role: e.target.value })}
                                className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                                placeholder="e.g. Senior Engineer" />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Years of Experience</label>
                            <input type="number" min={0} max={50} value={form.years_experience ?? ""}
                                onChange={(e) => merge({ years_experience: e.target.value ? parseInt(e.target.value) : undefined })}
                                className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                                placeholder="e.g. 8" />
                        </div>
                        <Select
                            label="Intent Type"
                            value={form.intent_type}
                            options={[
                                { key: "founder" as IntentType, label: "Founder" },
                                { key: "cofounder" as IntentType, label: "Co-Founder" },
                                { key: "collaborator" as IntentType, label: "Collaborator" },
                            ]}
                            onChange={(v) => merge({ intent_type: v })}
                        />
                        <Select
                            label="Commitment"
                            value={form.commitment_level}
                            options={[
                                { key: "full_time" as CommitmentLevel, label: "Full-time" },
                                { key: "part_time" as CommitmentLevel, label: "Part-time" },
                                { key: "flexible" as CommitmentLevel, label: "Flexible" },
                                { key: "contract" as CommitmentLevel, label: "Contract" },
                            ]}
                            onChange={(v) => merge({ commitment_level: v })}
                        />
                        <Select
                            label="Location Preference"
                            value={form.location_preference}
                            options={[
                                { key: "remote" as LocationPreference, label: "Remote" },
                                { key: "on_site" as LocationPreference, label: "On-site" },
                                { key: "hybrid" as LocationPreference, label: "Hybrid" },
                                { key: "flexible" as LocationPreference, label: "Flexible" },
                            ]}
                            onChange={(v) => merge({ location_preference: v })}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Bio</label>
                        <textarea value={form.bio ?? ""}
                            onChange={(e) => merge({ bio: e.target.value })}
                            rows={4} maxLength={1000}
                            placeholder="Tell potential co-founders about yourself..."
                            className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 resize-none" />
                        <p className="mt-1 text-xs text-right text-gray-400">{(form.bio ?? "").length}/1000</p>
                    </div>
                </section>

                {/* Skills & Roles */}
                <section className="rounded-xl bg-white border border-gray-100 p-5 shadow-sm flex flex-col gap-4">
                    <h2 className="font-bold text-gray-800">Skills & Roles</h2>
                    <TagInput label="Technical Skills" placeholder="e.g. React, Python" values={form.technical_skills ?? []} onChange={(v) => merge({ technical_skills: v })} />
                    <TagInput label="Soft Skills" placeholder="e.g. Leadership" values={form.soft_skills ?? []} onChange={(v) => merge({ soft_skills: v })} />
                    <TagInput label="Seeking Roles" placeholder="e.g. CTO" values={form.seeking_roles ?? []} onChange={(v) => merge({ seeking_roles: v })} />
                </section>

                {/* Industries */}
                <section className="rounded-xl bg-white border border-gray-100 p-5 shadow-sm flex flex-col gap-4">
                    <h2 className="font-bold text-gray-800">Industries</h2>
                    <TagInput label="Industries" placeholder="e.g. FinTech, SaaS" values={form.industries ?? []} onChange={(v) => merge({ industries: v })} />
                </section>

                {/* Experience */}
                <section className="rounded-xl bg-white border border-gray-100 p-5 shadow-sm flex flex-col gap-4">
                    <h2 className="font-bold text-gray-800">Experience & Education</h2>
                    <TagInput label="Achievements / Past Exits" placeholder="e.g. Series B Startup" values={form.achievements ?? []} onChange={(v) => merge({ achievements: v })} />
                    <TagInput label="Education" placeholder="e.g. Stanford CS" values={form.education ?? []} onChange={(v) => merge({ education: v })} />
                    <TagInput label="Certifications" placeholder="e.g. AWS Certified" values={form.certifications ?? []} onChange={(v) => merge({ certifications: v })} />
                </section>

                {/* Bottom save */}
                <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="w-full rounded-xl bg-blue-600 py-3 text-sm font-bold text-white hover:bg-blue-700 disabled:opacity-50 transition"
                >
                    {isSaving ? (
                        <span className="inline-flex items-center gap-2 justify-center">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Saving...
                        </span>
                    ) : "Save Profile"}
                </button>
            </div>
        </div>
    );
}
