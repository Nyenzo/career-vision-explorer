import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Loader2, Plus, Users, Trash2, MessageSquare, RefreshCcw, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { cofounderMatchingService } from "@/services/founder-matching.service";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/lib/supabase";
import { authStorage } from "@/lib/session-auth-storage";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import type {
    CofounderMatchWithProfile,
    CofounderMatchProfile,
    IdeaProject,
    MemberStatus,
    ProjectMember,
    ProjectWithMembers,
} from "@/types/founder-matching";
import { cn } from "@/lib/utils";

interface ProjectsTabProps {
    onOpenConversation?: (conversationId: string, profileName: string) => void;
    currentProfile?: CofounderMatchProfile | null;
}

type ProjectDetailMap = Record<string, ProjectWithMembers | undefined>;

interface CreateProjectForm {
    title: string;
    idea_description: string;
    industry: string;
}

const INITIAL_CREATE_FORM: CreateProjectForm = {
    title: "",
    idea_description: "",
    industry: "",
};

function PendingActions({
    members,
    onAction,
    loadingMemberId,
}: {
    members: ProjectMember[];
    onAction: (member: ProjectMember, action: "approve" | "reject" | "remove") => void;
    loadingMemberId?: string;
}) {
    const pending = members.filter((member) => member.status === "pending");
    const approved = members.filter((member) => member.status === "approved");
    const getDisplayRole = (member: ProjectMember) => {
        if (member.member_role) {
            return member.member_role;
        }
        if (member.member_intent_type) {
            return member.member_intent_type;
        }
        return member.role;
    };

    return (
        <div className="mt-4 space-y-3">
            <div>
                <p className="text-xs font-bold tracking-wider text-gray-400 uppercase">Pending requests</p>
                <div className="mt-2 space-y-2">
                    {pending.length === 0 && (
                        <p className="text-xs text-gray-500">No pending requests.</p>
                    )}
                    {pending.map((member) => (
                        <div key={member.id} className="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50 px-3 py-2">
                            <div>
                                <p className="text-sm font-semibold text-gray-800">{member.member_name || member.profile_id}</p>
                                <p className="text-xs text-gray-500">Requested role: {getDisplayRole(member)}</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => onAction(member, "approve")}
                                    disabled={loadingMemberId === member.id}
                                    className="rounded-lg bg-emerald-600 px-2.5 py-1 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
                                >
                                    Approve
                                </button>
                                <button
                                    onClick={() => onAction(member, "reject")}
                                    disabled={loadingMemberId === member.id}
                                    className="rounded-lg bg-gray-700 px-2.5 py-1 text-xs font-semibold text-white hover:bg-gray-800 disabled:opacity-60"
                                >
                                    Reject
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div>
                <p className="text-xs font-bold tracking-wider text-gray-400 uppercase">Approved members</p>
                <div className="mt-2 space-y-2">
                    {approved.length === 0 && (
                        <p className="text-xs text-gray-500">No approved members yet.</p>
                    )}
                    {approved.map((member) => (
                        <div key={member.id} className="flex items-center justify-between rounded-xl border border-gray-100 bg-white px-3 py-2">
                            <div>
                                <p className="text-sm font-semibold text-gray-800">{member.member_name || member.profile_id}</p>
                                <p className="text-xs text-gray-500">Role: {getDisplayRole(member)}</p>
                            </div>
                            <button
                                onClick={() => onAction(member, "remove")}
                                disabled={loadingMemberId === member.id}
                                className="rounded-lg bg-red-600 px-2.5 py-1 text-xs font-semibold text-white hover:bg-red-700 disabled:opacity-60"
                            >
                                Remove
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export function ProjectsTab({ onOpenConversation, currentProfile }: ProjectsTabProps) {
    const { isAuthenticated, user } = useAuth();
    const [profile, setProfile] = useState<CofounderMatchProfile | null>(currentProfile ?? null);
    const [projects, setProjects] = useState<ProjectWithMembers[]>([]);
    const [projectDetails, setProjectDetails] = useState<ProjectDetailMap>({});
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [expandedProjectId, setExpandedProjectId] = useState<string | null>(null);
    const [memberActionLoadingId, setMemberActionLoadingId] = useState<string | undefined>();
    const [inviteLoadingProfileId, setInviteLoadingProfileId] = useState<string | undefined>();
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [inviteProjectId, setInviteProjectId] = useState<string | null>(null);
    const [mutualMatches, setMutualMatches] = useState<CofounderMatchWithProfile[]>([]);
    const [isLoadingInviteCandidates, setIsLoadingInviteCandidates] = useState(false);
    const [createForm, setCreateForm] = useState<CreateProjectForm>(INITIAL_CREATE_FORM);

    const isFounder = useMemo(() => profile?.intent_type === "founder", [profile?.intent_type]);

    useEffect(() => {
        if (currentProfile) {
            setProfile(currentProfile);
        }
    }, [currentProfile]);

    const loadProjects = useCallback(async () => {
        setIsLoading(true);
        try {
            const me = currentProfile ?? await cofounderMatchingService.getProfile();
            setProfile(me);
            const list = me.intent_type === "founder"
                ? await cofounderMatchingService.listProjects()
                : await cofounderMatchingService.browseMatchedProjects();
            setProjects(list || []);
        } catch {
            toast.error("Failed to load projects");
        } finally {
            setIsLoading(false);
        }
    }, [currentProfile]);

    useEffect(() => {
        loadProjects();
    }, [loadProjects]);

    const loadProjectDetail = useCallback(async (projectId: string) => {
        try {
            const detail = await cofounderMatchingService.getProjectDetail(projectId);
            setProjectDetails((prev) => ({ ...prev, [projectId]: detail }));
            return detail;
        } catch {
            toast.error("Failed to load project details");
            return undefined;
        }
    }, []);

    useEffect(() => {
        if (!isAuthenticated || !user?.user_id || !supabase) {
            return;
        }

        const accessToken = authStorage.getAccessToken();
        if (accessToken) {
            supabase.realtime.setAuth(accessToken);
        }

        const channel = supabase
            .channel(`cofounder-project-notifications:${user.user_id}`)
            .on(
                "postgres_changes",
                {
                    event: "INSERT",
                    schema: "public",
                    table: "notifications",
                    filter: `user_id=eq.${user.user_id}`,
                },
                (payload) => {
                    const next = payload.new as { type?: string };
                    if (
                        next.type !== "cofounder_project_join_request"
                        && next.type !== "cofounder_project_approved"
                    ) {
                        return;
                    }

                    void loadProjects();
                    if (expandedProjectId) {
                        void loadProjectDetail(expandedProjectId);
                    }
                },
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [expandedProjectId, isAuthenticated, loadProjectDetail, loadProjects, user?.user_id]);

    const handleCreateProject = useCallback(async () => {
        if (!createForm.title.trim()) {
            toast.error("Project title is required");
            return;
        }

        setIsSubmitting(true);
        try {
            await cofounderMatchingService.createProject({
                title: createForm.title.trim(),
                idea_description: createForm.idea_description.trim() || undefined,
                industry: createForm.industry.trim() || undefined,
            } as Partial<IdeaProject>);
            toast.success("Project created");
            setIsCreateDialogOpen(false);
            setCreateForm(INITIAL_CREATE_FORM);
            await loadProjects();
        } catch {
            toast.error("Could not create project");
        } finally {
            setIsSubmitting(false);
        }
    }, [createForm.idea_description, createForm.industry, createForm.title, loadProjects]);

    const handleDeleteProject = useCallback(async (projectId: string) => {
        try {
            await cofounderMatchingService.deleteProject(projectId);
            toast.success("Project deleted");
            await loadProjects();
        } catch {
            toast.error("Could not delete project");
        }
    }, [loadProjects]);

    const handleJoinProject = useCallback(async (projectId: string) => {
        try {
            await cofounderMatchingService.requestJoinProject(projectId);
            toast.success("Join request sent");
            await loadProjects();
        } catch {
            toast.error("Could not submit join request");
        }
    }, [loadProjects]);

    const handleCreateGroupChat = useCallback(async (projectId: string, title: string) => {
        try {
            const conversation = await cofounderMatchingService.createProjectGroupChat(projectId, `${title} Team Chat`);
            toast.success("Group chat ready");
            if (conversation.conversation_id && onOpenConversation) {
                onOpenConversation(conversation.conversation_id, conversation.title || `${title} Team Chat`);
            }
        } catch {
            toast.error("Could not create group chat");
        }
    }, [onOpenConversation]);

    const handleMemberAction = useCallback(async (member: ProjectMember, action: "approve" | "reject" | "remove") => {
        setMemberActionLoadingId(member.id);
        try {
            if (!expandedProjectId) {
                return;
            }
            if (action === "remove") {
                await cofounderMatchingService.removeProjectMember(expandedProjectId, member.profile_id);
            } else {
                await cofounderMatchingService.respondToMember(member.id, action);
            }
            toast.success(`Member ${action}d`);
            if (expandedProjectId) {
                await loadProjectDetail(expandedProjectId);
            }
        } catch {
            toast.error("Could not update member");
        } finally {
            setMemberActionLoadingId(undefined);
        }
    }, [expandedProjectId, loadProjectDetail]);

    const handleOpenInviteCandidates = useCallback(async (projectId: string) => {
        setInviteProjectId((prev) => prev === projectId ? null : projectId);
        if (!projectDetails[projectId]) {
            await loadProjectDetail(projectId);
        }
        if (mutualMatches.length > 0) {
            return;
        }
        setIsLoadingInviteCandidates(true);
        try {
            const result = await cofounderMatchingService.getMutualMatches();
            setMutualMatches(result.mutual_matches || []);
        } catch {
            toast.error("Could not load matched cofounders");
        } finally {
            setIsLoadingInviteCandidates(false);
        }
    }, [loadProjectDetail, mutualMatches.length, projectDetails]);

    const handleInviteMatchedCofounder = useCallback(async (projectId: string, profileId: string, role: "cofounder" | "collaborator") => {
        setInviteLoadingProfileId(profileId);
        try {
            await cofounderMatchingService.addProjectMember(projectId, profileId, role);
            toast.success("Invitation sent");
            void loadProjectDetail(projectId);
        } catch {
            toast.error("Could not invite matched cofounder");
        } finally {
            setInviteLoadingProfileId(undefined);
        }
    }, [loadProjectDetail]);

    const renderProjectDetails = useCallback((project: ProjectWithMembers, detail?: ProjectWithMembers) => {
        const projectData = detail || project;
        const techStack = projectData.tech_stack || [];

        return (
            <div className="mt-4 space-y-4 rounded-2xl border border-gray-100 bg-gray-50/70 p-4">
                <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-3">
                        <div>
                            <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Idea</p>
                            <p className="mt-1 text-sm text-gray-700">{projectData.idea_description || "No idea summary yet."}</p>
                        </div>
                        <div>
                            <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Problem</p>
                            <p className="mt-1 text-sm text-gray-700">{projectData.problem_statement || "No problem statement yet."}</p>
                        </div>
                        <div>
                            <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Looking For</p>
                            <p className="mt-1 text-sm text-gray-700">{projectData.looking_for_description || "No hiring brief yet."}</p>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-3 text-sm text-gray-700">
                            <div className="rounded-xl bg-white px-3 py-2">
                                <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Stage</p>
                                <p className="mt-1 font-semibold text-gray-900">{projectData.stage || "idea"}</p>
                            </div>
                            <div className="rounded-xl bg-white px-3 py-2">
                                <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Industry</p>
                                <p className="mt-1 font-semibold text-gray-900">{projectData.industry || "Not specified"}</p>
                            </div>
                            <div className="rounded-xl bg-white px-3 py-2">
                                <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Max Team</p>
                                <p className="mt-1 font-semibold text-gray-900">{projectData.max_members || "Open"}</p>
                            </div>
                            <div className="rounded-xl bg-white px-3 py-2">
                                <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Owner</p>
                                <p className="mt-1 font-semibold text-gray-900">{projectData.owner_name || "Founder"}</p>
                            </div>
                        </div>

                        <div className="rounded-xl bg-white px-3 py-2">
                            <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Tech Stack</p>
                            <div className="mt-2 flex flex-wrap gap-2">
                                {techStack.length > 0 ? techStack.map((item) => (
                                    <span key={item} className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">
                                        {item}
                                    </span>
                                )) : <p className="text-sm text-gray-500">No stack listed yet.</p>}
                            </div>
                        </div>

                        <div className="rounded-xl bg-white px-3 py-2 text-sm text-gray-700">
                            <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Group Chat</p>
                            <p className="mt-1 font-semibold text-gray-900">
                                {projectData.has_group_chat ? "Ready" : "Not created yet"}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }, []);

    const renderMembershipStatus = (status?: MemberStatus | "owner" | null) => {
        if (!status) {
            return null;
        }
        const label = status === "owner" ? "Owner" : status.charAt(0).toUpperCase() + status.slice(1);
        return (
            <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-0.5 text-[11px] font-bold text-blue-700">
                {label}
            </span>
        );
    };

    if (isLoading) {
        return (
            <div className="rounded-3xl border border-gray-100 bg-white p-8 shadow-sm flex items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between gap-3">
                    <div>
                        <h3 className="text-lg font-bold text-gray-900">Projects</h3>
                        <p className="text-sm text-gray-500">
                            {isFounder
                                ? "Create and manage your startup projects, members, and team chats."
                                : "Browse matched founder projects and request to join."}
                        </p>
                    </div>
                    <button
                        onClick={loadProjects}
                        className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                    >
                        <RefreshCcw className="h-4 w-4" />
                        Refresh
                    </button>
                </div>

                {isFounder && (
                    <div className="mt-5 flex justify-end">
                        <button
                            onClick={() => setIsCreateDialogOpen(true)}
                            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                        >
                            <Plus className="h-4 w-4" />
                            New Project
                        </button>
                    </div>
                )}
            </div>

            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogContent className="sm:max-w-xl">
                    <DialogHeader>
                        <DialogTitle>Create a New Project</DialogTitle>
                        <DialogDescription>
                            Draft the project first. The new project form stays hidden until you open it from the button.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-3">
                        <input
                            value={createForm.title}
                            onChange={(event) => setCreateForm((prev) => ({ ...prev, title: event.target.value }))}
                            placeholder="Project title"
                            className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                        />
                        <input
                            value={createForm.industry}
                            onChange={(event) => setCreateForm((prev) => ({ ...prev, industry: event.target.value }))}
                            placeholder="Industry"
                            className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                        />
                        <textarea
                            value={createForm.idea_description}
                            onChange={(event) => setCreateForm((prev) => ({ ...prev, idea_description: event.target.value }))}
                            placeholder="What are you building?"
                            rows={5}
                            className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                        />
                    </div>

                    <DialogFooter>
                        <button
                            type="button"
                            onClick={() => setIsCreateDialogOpen(false)}
                            className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            onClick={handleCreateProject}
                            disabled={isSubmitting}
                            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
                        >
                            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                            Create Project
                        </button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {projects.length === 0 && (
                <div className="rounded-3xl border border-gray-100 bg-white p-8 text-sm text-gray-500 shadow-sm">
                    {isFounder ? "No projects yet. Create your first project above." : "No matched projects available yet."}
                </div>
            )}

            {projects.map((project) => {
                const detail = projectDetails[project.id];
                const memberCount = detail?.members?.filter((member) => member.status === "approved").length
                    ?? project.members?.filter((member) => member.status === "approved").length
                    ?? 0;
                const pendingCount = detail?.members?.filter((member) => member.status === "pending").length
                    ?? project.members?.filter((member) => member.status === "pending").length
                    ?? 0;
                const membershipStatus = detail?.user_membership_status ?? project.user_membership_status;
                const isExpanded = expandedProjectId === project.id;
                const isProjectOwner = String(membershipStatus || "") === "owner" || project.user_id === profile?.user_id;

                return (
                    <div key={project.id} className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm">
                        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                            <div>
                                <h4 className="text-lg font-bold text-gray-900">{project.title}</h4>
                                {project.idea_description && (
                                    <p className="mt-1 text-sm text-gray-600">{project.idea_description}</p>
                                )}
                                <div className="mt-2 flex items-center gap-2 text-xs text-gray-500">
                                    <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5">
                                        <Users className="h-3.5 w-3.5" />
                                        {memberCount} members
                                    </span>
                                    {pendingCount > 0 && (
                                        <span className="inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 font-semibold text-amber-800">
                                            {pendingCount} pending
                                        </span>
                                    )}
                                    {renderMembershipStatus(membershipStatus)}
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-2">
                                <button
                                    onClick={async () => {
                                        setExpandedProjectId((prev) => prev === project.id ? null : project.id);
                                        await loadProjectDetail(project.id);
                                    }}
                                    className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                                >
                                    {isExpanded ? "Hide Details" : "Show Details"}
                                </button>

                                {isProjectOwner ? (
                                    <>
                                        <button
                                            onClick={() => handleOpenInviteCandidates(project.id)}
                                            className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-100"
                                        >
                                            <UserPlus className="h-3.5 w-3.5" />
                                            Invite Matched Cofounders
                                        </button>
                                        <button
                                            onClick={() => handleCreateGroupChat(project.id, project.title)}
                                            className="inline-flex items-center gap-1.5 rounded-lg border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 hover:bg-blue-100"
                                        >
                                            <MessageSquare className="h-3.5 w-3.5" />
                                            Team Chat
                                        </button>
                                        <button
                                            onClick={() => handleDeleteProject(project.id)}
                                            className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-100"
                                        >
                                            <Trash2 className="h-3.5 w-3.5" />
                                            Delete
                                        </button>
                                    </>
                                ) : (
                                    <button
                                        onClick={() => handleJoinProject(project.id)}
                                        className={cn(
                                            "rounded-lg px-3 py-1.5 text-xs font-semibold",
                                            isProjectOwner || membershipStatus === "approved" || membershipStatus === "pending"
                                                ? "bg-gray-100 text-gray-500 cursor-not-allowed"
                                                : "bg-blue-600 text-white hover:bg-blue-700"
                                        )}
                                        disabled={isProjectOwner || membershipStatus === "approved" || membershipStatus === "pending"}
                                    >
                                        {isProjectOwner
                                            ? "Owner"
                                            : membershipStatus === "approved"
                                                ? "Already Joined"
                                                : membershipStatus === "pending"
                                                    ? "Join Requested"
                                                    : "Request Join"}
                                    </button>
                                )}
                            </div>
                        </div>

                        {isExpanded && renderProjectDetails(project, detail)}

                        {isProjectOwner && inviteProjectId === project.id && (
                            <div className="mt-4 rounded-2xl border border-emerald-100 bg-emerald-50/60 p-4">
                                <div className="flex items-center justify-between gap-3">
                                    <div>
                                        <p className="text-sm font-bold text-emerald-900">Invite matched cofounders</p>
                                        <p className="text-xs text-emerald-800/80">Only mutual matches who are not already on this project are shown.</p>
                                    </div>
                                </div>

                                <div className="mt-3 space-y-2">
                                    {isLoadingInviteCandidates && (
                                        <div className="flex items-center gap-2 text-sm text-emerald-900">
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                            Loading matched cofounders...
                                        </div>
                                    )}

                                    {!isLoadingInviteCandidates && mutualMatches
                                        .filter((match) => !new Set((detail?.members || project.members || []).map((member) => member.profile_id)).has(match.matched_profile.profile_id))
                                        .map((match) => {
                                            const matchedProfile = match.matched_profile;
                                            const suggestedRole = matchedProfile.intent_type === "collaborator" ? "collaborator" : "cofounder";
                                            return (
                                                <div key={matchedProfile.profile_id} className="flex items-center justify-between rounded-xl border border-emerald-100 bg-white px-3 py-2">
                                                    <div>
                                                        <p className="text-sm font-semibold text-gray-900">{matchedProfile.name || matchedProfile.current_role || "Matched cofounder"}</p>
                                                        <p className="text-xs text-gray-500">
                                                            {matchedProfile.current_role || "No role specified"}
                                                            {matchedProfile.intent_type ? ` • ${matchedProfile.intent_type}` : ""}
                                                        </p>
                                                    </div>
                                                    <button
                                                        onClick={() => handleInviteMatchedCofounder(project.id, matchedProfile.profile_id, suggestedRole)}
                                                        disabled={inviteLoadingProfileId === matchedProfile.profile_id}
                                                        className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
                                                    >
                                                        {inviteLoadingProfileId === matchedProfile.profile_id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <UserPlus className="h-3.5 w-3.5" />}
                                                        Invite
                                                    </button>
                                                </div>
                                            );
                                        })}

                                    {!isLoadingInviteCandidates && mutualMatches.filter((match) => !new Set((detail?.members || project.members || []).map((member) => member.profile_id)).has(match.matched_profile.profile_id)).length === 0 && (
                                        <p className="text-sm text-emerald-900">No eligible matched cofounders to invite yet.</p>
                                    )}
                                </div>
                            </div>
                        )}

                        {isExpanded && detail?.members && isProjectOwner && (
                            <PendingActions
                                members={detail.members}
                                onAction={handleMemberAction}
                                loadingMemberId={memberActionLoadingId}
                            />
                        )}
                    </div>
                );
            })}
        </div>
    );
}
