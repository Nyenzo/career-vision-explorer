// Project detail view with team roster, join requests, admin controls, and group chat
import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Users,
  UserPlus,
  UserMinus,
  Check,
  X,
  MessageSquare,
  Edit3,
  Trash2,
  Loader2,
  ArrowLeft,
  Crown,
  Clock,
  Shield,
  AlertCircle,
  Save,
} from "lucide-react";
import {
  cofounderMatchingService,
  ProjectWithMembers,
  ProjectMember,
  IdeaProject,
  MatchProfile,
} from "@/services/founder-matching.service";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface ProjectDetailViewProps {
  projectId: string;
  onBack: () => void;
  onNavigateToChat?: (conversationId: string) => void;
}

export const ProjectDetailView: React.FC<ProjectDetailViewProps> = ({
  projectId,
  onBack,
  onNavigateToChat,
}) => {
  const [project, setProject] = useState<ProjectWithMembers | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showAddMember, setShowAddMember] = useState(false);
  const [mutualMatches, setMutualMatches] = useState<MatchProfile[]>([]);
  const [matchesLoading, setMatchesLoading] = useState(false);
  const [editForm, setEditForm] = useState({
    title: "",
    idea_description: "",
    problem_statement: "",
    looking_for_description: "",
    tech_stack: "",
    stage: "",
    max_members: 10,
  });

  // Fetch project details
  const fetchProject = useCallback(async () => {
    try {
      setLoading(true);
      const data = await cofounderMatchingService.getProjectDetail(projectId);
      setProject(data);
      setEditForm({
        title: data.title || "",
        idea_description: data.description || "",
        problem_statement: data.problem_statement || "",
        looking_for_description: (data.roles_needed || []).join(", "),
        tech_stack: (data.tech_stack || []).join(", "),
        stage: data.stage || "",
        max_members: data.max_members || 10,
      });
    } catch (error) {
      console.error("Failed to load project:", error);
      toast.error("Failed to load project details");
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchProject();
  }, [fetchProject]);

  // Owner: approve or reject a pending member
  const handleMemberAction = async (
    memberId: string,
    action: "approve" | "reject" | "remove"
  ) => {
    setActionLoading(memberId);
    try {
      await cofounderMatchingService.respondToMember(memberId, action);
      toast.success(
        action === "approve"
          ? "Member approved!"
          : action === "reject"
          ? "Request rejected"
          : "Member removed"
      );
      await fetchProject();
    } catch (error: any) {
      toast.error(error?.message || `Failed to ${action} member`);
    } finally {
      setActionLoading(null);
    }
  };

  // Owner: remove an approved member
  const handleRemoveMember = async (memberProfileId: string) => {
    if (!project) return;
    setActionLoading(memberProfileId);
    try {
      await cofounderMatchingService.removeMember(project.id, memberProfileId);
      toast.success("Member removed from project");
      await fetchProject();
    } catch (error: any) {
      toast.error(error?.message || "Failed to remove member");
    } finally {
      setActionLoading(null);
    }
  };

  // Non-owner: request to join
  const handleJoinRequest = async () => {
    if (!project) return;
    setActionLoading("join");
    try {
      await cofounderMatchingService.requestJoinProject(project.id);
      toast.success("Join request sent!");
      await fetchProject();
    } catch (error: any) {
      toast.error(error?.message || "Failed to send join request");
    } finally {
      setActionLoading(null);
    }
  };

  // Owner: create group chat
  const handleCreateGroupChat = async () => {
    if (!project) return;
    setActionLoading("chat");
    try {
      const chat = await cofounderMatchingService.createProjectGroupChat(
        project.id,
        `${project.title} - Team Chat`
      );
      toast.success("Group chat created!");
      await fetchProject();
      if (onNavigateToChat && chat.conversation_id) {
        onNavigateToChat(chat.conversation_id);
      }
    } catch (error: any) {
      toast.error(error?.message || "Failed to create group chat");
    } finally {
      setActionLoading(null);
    }
  };

  // Owner: update project
  const handleSaveProject = async () => {
    if (!project) return;
    setActionLoading("save");
    try {
      await cofounderMatchingService.updateProject(project.id, {
        title: editForm.title,
        description: editForm.idea_description,
        problem_statement: editForm.problem_statement,
        roles_needed: editForm.looking_for_description
          .split(",")
          .map((r) => r.trim())
          .filter(Boolean),
        tech_stack: editForm.tech_stack
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
        stage: editForm.stage || undefined,
        max_members: editForm.max_members,
      });
      toast.success("Project updated!");
      setIsEditing(false);
      await fetchProject();
    } catch (error: any) {
      toast.error(error?.message || "Failed to update project");
    } finally {
      setActionLoading(null);
    }
  };

  // Owner: delete project
  const handleDeleteProject = async () => {
    if (!project || !confirm("Are you sure you want to delete this project?"))
      return;
    setActionLoading("delete");
    try {
      await cofounderMatchingService.deleteProject(project.id);
      toast.success("Project deleted");
      onBack();
    } catch (error: any) {
      toast.error(error?.message || "Failed to delete project");
    } finally {
      setActionLoading(null);
    }
  };

  // Owner: open add member panel and load mutual matches
  const handleOpenAddMember = async () => {
    setShowAddMember(true);
    setMatchesLoading(true);
    try {
      const result = await cofounderMatchingService.getMutualMatches();
      const matches = result?.mutual_matches || [];
      // Filter out users already in the project (owner + members)
      const existingProfileIds = new Set<string>([
        project?.profile_id || "",
        ...(project?.members || []).filter(m => m.status === "approved" || m.status === "pending").map(m => m.profile_id),
      ]);
      const available = matches.filter(m => !existingProfileIds.has(m.matched_profile.profile_id));
      setMutualMatches(available);
    } catch (error: any) {
      console.error("Failed to load matches:", error);
      toast.error("Failed to load matches");
    } finally {
      setMatchesLoading(false);
    }
  };

  // Owner: add a matched user to the project
  const handleAddMember = async (profileId: string) => {
    if (!project) return;
    setActionLoading(profileId);
    try {
      await cofounderMatchingService.addMemberToProject(project.id, profileId);
      toast.success("Member added to project!");
      setMutualMatches(prev => prev.filter(m => m.matched_profile.profile_id !== profileId));
      await fetchProject();
    } catch (error: any) {
      toast.error(error?.message || "Failed to add member");
    } finally {
      setActionLoading(null);
    }
  };

  const getInitials = (name: string) => {
    if (!name) return "??";
    return name
      .split(" ")
      .map((p) => p[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const isOwner = project?.user_membership_status === "owner";
  const pendingMembers = (project?.members || []).filter(
    (m) => m.status === "pending"
  );
  const approvedMembers = (project?.members || []).filter(
    (m) => m.status === "approved"
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="text-center py-20 text-slate-500">
        <AlertCircle className="h-10 w-10 mx-auto mb-3 opacity-40" />
        <p>Project not found</p>
        <Button variant="ghost" onClick={onBack} className="mt-4">
          <ArrowLeft className="h-4 w-4 mr-2" /> Go Back
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Navigation header */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Projects
        </Button>
        {isOwner && (
          <div className="flex gap-2">
            {!isEditing ? (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(true)}
                >
                  <Edit3 className="h-4 w-4 mr-1" /> Edit
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleDeleteProject}
                  disabled={actionLoading === "delete"}
                >
                  {actionLoading === "delete" ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4 mr-1" />
                  )}
                  Delete
                </Button>
              </>
            ) : (
              <>
                <Button
                  size="sm"
                  onClick={handleSaveProject}
                  disabled={actionLoading === "save"}
                >
                  {actionLoading === "save" ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-1" />
                  ) : (
                    <Save className="h-4 w-4 mr-1" />
                  )}
                  Save
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsEditing(false)}
                >
                  Cancel
                </Button>
              </>
            )}
          </div>
        )}
      </div>

      {/* Project header card */}
      <Card className="overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-5">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              {isEditing ? (
                <Input
                  value={editForm.title}
                  onChange={(e) =>
                    setEditForm({ ...editForm, title: e.target.value })
                  }
                  className="text-xl font-bold bg-white/20 text-white placeholder:text-white/60 border-white/30"
                  placeholder="Project Title"
                />
              ) : (
                <h2 className="text-2xl font-bold text-white">
                  {project.title}
                </h2>
              )}
              <div className="flex items-center gap-2 text-white/80 text-sm">
                <Crown className="h-4 w-4" />
                <span>{project.owner_name}</span>
                <span className="text-white/50">·</span>
                <Users className="h-4 w-4" />
                <span>
                  {project.member_count} member
                  {project.member_count !== 1 ? "s" : ""}
                </span>
                {project.stage && (
                  <>
                    <span className="text-white/50">·</span>
                    <Badge className="bg-white/20 text-white text-xs border-0">
                      {project.stage}
                    </Badge>
                  </>
                )}
              </div>
            </div>

            {/* Join button for non-owners */}
            {!isOwner && (
              <div className="shrink-0">
                {project.user_membership_status === "approved" ? (
                  <Badge className="bg-green-500/20 text-green-100 border-green-400/30">
                    <Check className="h-3 w-3 mr-1" /> Member
                  </Badge>
                ) : project.user_membership_status === "pending" ? (
                  <Badge className="bg-yellow-500/20 text-yellow-100 border-yellow-400/30">
                    <Clock className="h-3 w-3 mr-1" /> Pending
                  </Badge>
                ) : project.user_membership_status === "rejected" ? (
                  <Button
                    size="sm"
                    onClick={handleJoinRequest}
                    disabled={actionLoading === "join"}
                    className="bg-white text-blue-700 hover:bg-blue-50"
                  >
                    {actionLoading === "join" ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-1" />
                    ) : (
                      <UserPlus className="h-4 w-4 mr-1" />
                    )}
                    Re-request
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    onClick={handleJoinRequest}
                    disabled={actionLoading === "join"}
                    className="bg-white text-blue-700 hover:bg-blue-50"
                  >
                    {actionLoading === "join" ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-1" />
                    ) : (
                      <UserPlus className="h-4 w-4 mr-1" />
                    )}
                    Join Project
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>

        <CardContent className="p-6 space-y-5">
          {/* Description */}
          {isEditing ? (
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Description
                </label>
                <textarea
                  value={editForm.idea_description}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      idea_description: e.target.value,
                    })
                  }
                  className="w-full p-2 border rounded min-h-[80px] text-sm mt-1"
                  placeholder="Describe the project..."
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Problem Statement
                </label>
                <textarea
                  value={editForm.problem_statement}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      problem_statement: e.target.value,
                    })
                  }
                  className="w-full p-2 border rounded min-h-[60px] text-sm mt-1"
                  placeholder="What problem are you solving?"
                />
              </div>
              <div className="grid md:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Roles Needed (comma-separated)
                  </label>
                  <Input
                    value={editForm.looking_for_description}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        looking_for_description: e.target.value,
                      })
                    }
                    className="mt-1"
                    placeholder="CTO, Designer, Marketing..."
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Tech Stack (comma-separated)
                  </label>
                  <Input
                    value={editForm.tech_stack}
                    onChange={(e) =>
                      setEditForm({ ...editForm, tech_stack: e.target.value })
                    }
                    className="mt-1"
                    placeholder="React, Python, PostgreSQL..."
                  />
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Stage
                  </label>
                  <Input
                    value={editForm.stage}
                    onChange={(e) =>
                      setEditForm({ ...editForm, stage: e.target.value })
                    }
                    className="mt-1"
                    placeholder="Idea, MVP, Growth..."
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Max Members
                  </label>
                  <Input
                    type="number"
                    min={1}
                    max={50}
                    value={editForm.max_members}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        max_members: parseInt(e.target.value) || 10,
                      })
                    }
                    className="mt-1"
                  />
                </div>
              </div>
            </div>
          ) : (
            <>
              {project.description && (
                <div>
                  <h5 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    About
                  </h5>
                  <p className="text-sm text-slate-700 leading-relaxed">
                    {project.description}
                  </p>
                </div>
              )}
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
              {project.roles_needed && project.roles_needed.length > 0 && (
                <div>
                  <h5 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    Looking For
                  </h5>
                  <div className="bg-purple-50 border border-purple-100 rounded-lg p-4">
                    <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                      {project.roles_needed.join("\n")}
                    </p>
                  </div>
                </div>
              )}
              {project.tech_stack && project.tech_stack.length > 0 && (
                <div>
                  <h5 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    Tech Stack
                  </h5>
                  <div className="flex flex-wrap gap-2">
                    {project.tech_stack.map((tech, idx) => (
                      <Badge
                        key={idx}
                        className="px-3 py-1 text-xs bg-blue-100 text-blue-700 border-0 font-medium"
                      >
                        {tech}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Team Roster & Pending Requests side-by-side */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Team Roster */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-600" />
                Team ({approvedMembers.length + 1})
              </CardTitle>
              {isOwner && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleOpenAddMember}
                  className="text-xs"
                >
                  <UserPlus className="h-3.5 w-3.5 mr-1" />
                  Add Member
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {/* Add Member Panel */}
            {showAddMember && isOwner && (
              <div className="border border-blue-200 bg-blue-50/30 rounded-lg p-3 space-y-3 mb-2">
                <div className="flex items-center justify-between">
                  <h6 className="text-sm font-semibold text-blue-800">Add from your matches</h6>
                  <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setShowAddMember(false)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                {matchesLoading ? (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                  </div>
                ) : mutualMatches.length > 0 ? (
                  <ScrollArea className="max-h-48">
                    <div className="space-y-2">
                      {mutualMatches.map((match) => (
                        <div
                          key={match.match_id}
                          className="flex items-center gap-3 p-2 rounded-lg bg-white border border-slate-100"
                        >
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={match.matched_profile.photo_urls?.[0] || undefined} />
                            <AvatarFallback className="bg-slate-100 text-slate-600 text-xs">
                              {getInitials(match.matched_profile.name || "")}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{match.matched_profile.name || "Unknown"}</p>
                            <p className="text-xs text-muted-foreground truncate">{match.matched_profile.current_role || ""}</p>
                          </div>
                          <Button
                            size="sm"
                            className="h-7 text-xs bg-blue-600 hover:bg-blue-700"
                            onClick={() => handleAddMember(match.matched_profile.profile_id)}
                            disabled={actionLoading === match.matched_profile.profile_id}
                          >
                            {actionLoading === match.matched_profile.profile_id ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <>
                                <UserPlus className="h-3.5 w-3.5 mr-1" />
                                Add
                              </>
                            )}
                          </Button>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-3">
                    No available matches to add. Match with more people first!
                  </p>
                )}
              </div>
            )}

            {/* Owner */}
            <div className="flex items-center gap-3 p-2 rounded-lg bg-blue-50/50">
              <Avatar className="h-9 w-9">
                <AvatarImage src={project.owner_photo || undefined} />
                <AvatarFallback className="bg-blue-100 text-blue-700 text-xs">
                  {getInitials(project.owner_name || "")}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {project.owner_name}
                </p>
                <p className="text-xs text-muted-foreground">Founder</p>
              </div>
              <Badge
                variant="secondary"
                className="bg-blue-100 text-blue-700 text-xs"
              >
                <Crown className="h-3 w-3 mr-1" /> Owner
              </Badge>
            </div>

            {/* Approved Members */}
            {approvedMembers.length > 0 ? (
              approvedMembers.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={member.member_photo || undefined} />
                    <AvatarFallback className="bg-slate-100 text-slate-600 text-xs">
                      {getInitials(member.member_name || "")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {member.member_name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {member.member_role || member.role}
                    </p>
                  </div>
                  {isOwner && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-slate-400 hover:text-red-600"
                      onClick={() => handleRemoveMember(member.profile_id)}
                      disabled={actionLoading === member.profile_id}
                    >
                      {actionLoading === member.profile_id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <UserMinus className="h-4 w-4" />
                      )}
                    </Button>
                  )}
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                No team members yet
              </p>
            )}
          </CardContent>
        </Card>

        {/* Pending Requests (owner only) or Group Chat */}
        <div className="space-y-6">
          {isOwner && pendingMembers.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Clock className="h-5 w-5 text-amber-600" />
                  Pending Requests ({pendingMembers.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {pendingMembers.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center gap-3 p-3 rounded-lg bg-amber-50/50 border border-amber-100"
                  >
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={member.member_photo || undefined} />
                      <AvatarFallback className="bg-amber-100 text-amber-700 text-xs">
                        {getInitials(member.member_name || "")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {member.member_name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {member.member_role || "Wants to join"}
                      </p>
                    </div>
                    <div className="flex gap-1.5">
                      <Button
                        size="icon"
                        className="h-8 w-8 bg-green-600 hover:bg-green-700"
                        onClick={() =>
                          handleMemberAction(member.id, "approve")
                        }
                        disabled={actionLoading === member.id}
                      >
                        {actionLoading === member.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Check className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        size="icon"
                        variant="destructive"
                        className="h-8 w-8"
                        onClick={() =>
                          handleMemberAction(member.id, "reject")
                        }
                        disabled={actionLoading === member.id}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Group Chat Card */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-indigo-600" />
                Project Chat
              </CardTitle>
            </CardHeader>
            <CardContent>
              {project.has_group_chat && project.group_chat_conversation_id ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 p-3 rounded-lg">
                    <Check className="h-4 w-4" />
                    <span>Group chat is active</span>
                  </div>
                  {onNavigateToChat && (
                    <Button
                      className="w-full"
                      onClick={() =>
                        onNavigateToChat(project.group_chat_conversation_id!)
                      }
                    >
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Open Team Chat
                    </Button>
                  )}
                </div>
              ) : isOwner ? (
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    Create a group chat so your team can communicate. All
                    approved members will be added automatically.
                  </p>
                  <Button
                    className="w-full"
                    onClick={handleCreateGroupChat}
                    disabled={actionLoading === "chat"}
                  >
                    {actionLoading === "chat" ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <MessageSquare className="h-4 w-4 mr-2" />
                    )}
                    Create Group Chat
                  </Button>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-2">
                  The project owner hasn't created a group chat yet
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
