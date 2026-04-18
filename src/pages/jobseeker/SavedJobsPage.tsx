import Layout from "@/components/layout/Layout";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useWishlist } from "@/hooks/use-wishlist";
import { useAuth } from "@/hooks/use-auth";
import { useJobApplications } from "@/hooks/use-job-applications";
import { Bookmark, Briefcase, MapPin, Plus, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { SavedJobCardSkeleton } from "@/components/ui/skeleton-loaders";

const SavedJobsPage = () => {
    const navigate = useNavigate();
    const { profile, user } = useAuth();
    const { wishlistJobs } = useWishlist();
    const { applications, isLoading: isApplicationsLoading } = useJobApplications();
    const [activeTab, setActiveTab] = useState<"saved" | "applied">("saved");
    const safeApplications = useMemo(
        () => (Array.isArray(applications) ? applications : []),
        [applications]
    );

    const sortedSavedJobs = useMemo(
        () =>
            [...wishlistJobs].sort(
                (a, b) => new Date(b.dateSaved).getTime() - new Date(a.dateSaved).getTime()
            ),
        [wishlistJobs]
    );

    const sortedAppliedJobs = useMemo(
        () =>
            [...safeApplications]
                .sort((a, b) => new Date(b.applied_at || b.created_at).getTime() - new Date(a.applied_at || a.created_at).getTime())
                .map((application) => ({
                    applicationId: application.application_id,
                    jobId: application.job_id,
                    title: application.job_title || application.job?.title || "Untitled Role",
                    company: application.company_name || application.job?.company || "Unknown Company",
                    appliedAt: application.applied_at || application.created_at,
                    status: application.status,
                    matchScore: application.match_score,
                })),
        [safeApplications]
    );

    const displayName =
        profile?.name ||
        user?.name ||
        (profile?.email ? profile.email.split("@")[0] : "The Architect");

    const initials = displayName
        .split(" ")
        .map((part) => part[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();

    return (
        <Layout>
            <div className="min-h-screen bg-[#eceef2] px-4 py-10 sm:px-8">
                <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 lg:grid-cols-[220px_1fr]">
                    <aside className="rounded-3xl bg-[#e4e7ec] p-5">
                        <div className="mb-8 flex flex-col items-center text-center">
                            <Avatar className="mb-3 h-16 w-16 ring-2 ring-white">
                                <AvatarImage src={profile?.avatar_url} alt={displayName} />
                                <AvatarFallback className="bg-primary text-primary-foreground">{initials}</AvatarFallback>
                            </Avatar>
                            <h2 className="text-lg font-semibold text-slate-900">{displayName}</h2>
                            <p className="text-xs uppercase tracking-wider text-slate-500">Premium Discovery</p>
                        </div>

                        <div className="space-y-2">
                            <button
                                type="button"
                                onClick={() => setActiveTab("saved")}
                                className={`flex w-full items-center gap-2 rounded-full px-3 py-2 text-sm font-medium transition-colors ${activeTab === "saved"
                                    ? "bg-white text-primary"
                                    : "text-slate-500 hover:bg-white/50"
                                    }`}
                            >
                                <Bookmark className="h-4 w-4" />
                                Saved Jobs
                            </button>
                            <button
                                type="button"
                                onClick={() => setActiveTab("applied")}
                                className={`flex w-full items-center gap-2 rounded-full px-3 py-2 text-sm font-medium transition-colors ${activeTab === "applied"
                                    ? "bg-white text-primary"
                                    : "text-slate-500 hover:bg-white/50"
                                    }`}
                            >
                                <Briefcase className="h-4 w-4" />
                                Applied
                            </button>
                        </div>
                    </aside>

                    <section>
                        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                            Curation Portfolio
                        </p>
                        <h1 className="mb-2 text-5xl font-bold tracking-tight text-slate-900">Saved Jobs</h1>
                        <p className="mb-8 max-w-2xl text-slate-600">
                            Manage your career trajectory. These opportunities are curated based on your vision and professional profile.
                        </p>

                        <div className="space-y-4">
                            {activeTab === "saved" && sortedSavedJobs.map((job) => (
                                <article
                                    key={job.job_id}
                                    className="rounded-3xl border border-slate-200 bg-white px-5 py-4 shadow-sm"
                                >
                                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                                        <div className="flex min-w-0 items-start gap-4">
                                            <Avatar className="h-14 w-14 border border-slate-200">
                                                <AvatarFallback className="bg-slate-900 text-white">
                                                    {job.company.slice(0, 2).toUpperCase()}
                                                </AvatarFallback>
                                            </Avatar>

                                            <div className="min-w-0">
                                                <div className="mb-1 flex flex-wrap items-center gap-2">
                                                    <h3 className="truncate text-2xl font-semibold text-slate-900">{job.title}</h3>
                                                    <Badge className="rounded-full bg-emerald-600 text-[10px] uppercase tracking-wide text-white">
                                                        {job.matchScore}% Match
                                                    </Badge>
                                                </div>
                                                <p className="mb-2 text-sm font-medium text-primary">{job.company}</p>

                                                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                                                    <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1">
                                                        <MapPin className="h-3 w-3" />
                                                        {job.location}
                                                    </span>
                                                    <span className="rounded-full bg-slate-100 px-2.5 py-1 uppercase">{job.type}</span>
                                                    <span className="rounded-full bg-slate-100 px-2.5 py-1">{job.salary}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex shrink-0 gap-2">
                                            <Button
                                                variant="secondary"
                                                className="rounded-full bg-slate-200 px-5 text-slate-800 hover:bg-slate-300"
                                                onClick={() => navigate(`/jobseeker/jobs/${job.job_id}`)}
                                            >
                                                View Details
                                            </Button>
                                            <Button
                                                className="rounded-full px-5"
                                                onClick={() => navigate(`/jobseeker/jobs/${job.job_id}`)}
                                            >
                                                Apply Now
                                            </Button>
                                        </div>
                                    </div>
                                </article>
                            ))}

                            {activeTab === "applied" && sortedAppliedJobs.map((application) => (
                                <article
                                    key={application.applicationId}
                                    className="rounded-3xl border border-slate-200 bg-white px-5 py-4 shadow-sm"
                                >
                                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                                        <div className="flex min-w-0 items-start gap-4">
                                            <Avatar className="h-14 w-14 border border-slate-200">
                                                <AvatarFallback className="bg-slate-900 text-white">
                                                    {application.company.slice(0, 2).toUpperCase()}
                                                </AvatarFallback>
                                            </Avatar>

                                            <div className="min-w-0">
                                                <div className="mb-1 flex flex-wrap items-center gap-2">
                                                    <h3 className="truncate text-2xl font-semibold text-slate-900">{application.title}</h3>
                                                    <Badge className="rounded-full bg-blue-600 text-[10px] uppercase tracking-wide text-white">
                                                        {application.status}
                                                    </Badge>
                                                    {typeof application.matchScore === "number" && (
                                                        <Badge className="rounded-full bg-emerald-600 text-[10px] uppercase tracking-wide text-white">
                                                            {application.matchScore}% Match
                                                        </Badge>
                                                    )}
                                                </div>
                                                <p className="mb-2 text-sm font-medium text-primary">{application.company}</p>

                                                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                                                    <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1">
                                                        <MapPin className="h-3 w-3" />
                                                        Applied {new Date(application.appliedAt).toLocaleDateString()}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex shrink-0 gap-2">
                                            <Button
                                                variant="secondary"
                                                className="rounded-full bg-slate-200 px-5 text-slate-800 hover:bg-slate-300"
                                                onClick={() => navigate(`/jobseeker/jobs/${application.jobId}`)}
                                            >
                                                View Details
                                            </Button>
                                        </div>
                                    </div>
                                </article>
                            ))}

                            <article className="rounded-3xl border border-dashed border-slate-300 bg-[#f1f3f6] px-5 py-6">
                                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                                    <div className="flex items-start gap-4">
                                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white text-slate-500">
                                            <Plus className="h-7 w-7" />
                                        </div>
                                        <div>
                                            <h3 className="text-3xl font-semibold text-slate-900">Discover More Roles</h3>
                                            <p className="max-w-xl text-slate-600">
                                                Our engine identified fresh opportunities based on your latest profile and interactions.
                                            </p>
                                        </div>
                                    </div>
                                    <Button
                                        className="rounded-full bg-slate-900 px-6 text-white hover:bg-slate-800"
                                        onClick={() => navigate("/jobseeker/jobs")}
                                    >
                                        <Search className="mr-2 h-4 w-4" />
                                        Explore New Jobs
                                    </Button>
                                </div>
                            </article>

                            {activeTab === "saved" && sortedSavedJobs.length === 0 && (
                                <article className="rounded-3xl border border-slate-200 bg-white px-6 py-10 text-center shadow-sm">
                                    <h3 className="text-2xl font-semibold text-slate-900">No saved jobs yet</h3>
                                    <p className="mt-2 text-slate-600">
                                        Save opportunities from the jobs page and they will appear here.
                                    </p>
                                    <Button className="mt-5 rounded-full" onClick={() => navigate("/jobseeker/jobs")}>Browse Jobs</Button>
                                </article>
                            )}

                            {activeTab === "applied" && isApplicationsLoading && (
                                <>
                                    <SavedJobCardSkeleton />
                                    <SavedJobCardSkeleton />
                                </>
                            )}

                            {activeTab === "applied" && !isApplicationsLoading && sortedAppliedJobs.length === 0 && (
                                <article className="rounded-3xl border border-slate-200 bg-white px-6 py-10 text-center shadow-sm">
                                    <h3 className="text-2xl font-semibold text-slate-900">No applied jobs yet</h3>
                                    <p className="mt-2 text-slate-600">
                                        Once you apply to jobs, they will appear in this tab.
                                    </p>
                                    <Button className="mt-5 rounded-full" onClick={() => navigate("/jobseeker/jobs")}>Explore Jobs</Button>
                                </article>
                            )}
                        </div>
                    </section>
                </div>
            </div>
        </Layout>
    );
};

export default SavedJobsPage;
