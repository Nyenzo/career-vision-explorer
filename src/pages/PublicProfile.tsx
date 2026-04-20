
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { ProfileCardSkeleton } from "@/components/ui/skeleton-loaders";
import { useToast } from "@/hooks/use-toast";
import { profileService } from "@/services/profile.service";

interface PublicProfileData {
  user_id: string;
  full_name?: string;
  avatar_url?: string;
  location?: string;
  bio?: string;
  skills?: string[];
  experience_years?: number;
  education?: Array<Record<string, unknown>>;
  work_experience?: Array<Record<string, unknown>>;
  projects?: Array<Record<string, unknown>>;
  linkedin_url?: string;
  github_url?: string;
  portfolio_url?: string;
  created_at?: string;
}

const PublicProfile = () => {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const [profile, setProfile] = useState<PublicProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!id) return;
      setLoading(true);
      setNotFound(false);
      try {
        const data = await profileService.getPublicProfile(id);
        setProfile(data as unknown as PublicProfileData);
      } catch (error: any) {
        if (error?.status === 404 || error?.response?.status === 404) {
          setNotFound(true);
        } else {
          toast({
            title: "Error",
            description: "Failed to load profile",
            variant: "destructive",
          });
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
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

  if (!profile || notFound) {
    return (
      <Layout>
        <div className="container py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Profile Not Found</h1>
            <p className="text-gray-600">This profile doesn't exist or is unavailable.</p>
          </div>
        </div>
      </Layout>
    );
  }

  const educationList = Array.isArray(profile.education)
    ? (profile.education as any[]).filter(
        (e: any) => e && typeof e === "object" && (e.degree || e.institution || e.field_of_study),
      )
    : [];
  const workExpList = Array.isArray(profile.work_experience)
    ? (profile.work_experience as any[])
    : [];
  const projectsList = Array.isArray(profile.projects)
    ? (profile.projects as any[]).filter((p: any) => p && typeof p === "object" && p.title)
    : [];
  const displayName = profile.full_name || "Unknown User";
  const avatarInitial = displayName.charAt(0).toUpperCase();

  return (
    <Layout>
      <main className="pt-2 pb-20 px-4 md:px-8 max-w-screen-2xl mx-auto font-body bg-[#f1f5f9] text-on-surface antialiased">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Sidebar */}
          <aside className="lg:col-span-4 space-y-8">
            {/* Quick Stats */}
            <section className="bg-surface-container-lowest rounded-lg p-8 shadow-[0_20px_40px_rgba(25,28,30,0.04)]">
              <h3 className="font-headline text-lg font-bold mb-8 text-slate-900">
                Quick Stats
              </h3>
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-slate-400">history_edu</span>
                    <span className="text-sm font-medium text-slate-600">Experience</span>
                  </div>
                  <span className="text-sm font-bold text-slate-900">
                    {profile.experience_years || 0} Years
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-slate-400">psychology</span>
                    <span className="text-sm font-medium text-slate-600">Skills</span>
                  </div>
                  <span className="text-sm font-bold text-slate-900">
                    {profile.skills?.length || 0} Listed
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-slate-400">school</span>
                    <span className="text-sm font-medium text-slate-600">Education</span>
                  </div>
                  <span className="text-sm font-bold text-slate-900">
                    {educationList.length} {educationList.length === 1 ? "Entry" : "Entries"}
                  </span>
                </div>
              </div>
            </section>

            {/* Social Links */}
            {(profile.linkedin_url || profile.github_url || profile.portfolio_url) && (
              <section className="bg-surface-container-lowest rounded-lg p-8 shadow-[0_20px_40px_rgba(25,28,30,0.04)]">
                <h3 className="font-headline text-lg font-bold mb-6 text-slate-900">
                  Social Links
                </h3>
                <div className="space-y-3">
                  {profile.linkedin_url && (
                    <a
                      href={profile.linkedin_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 rounded-xl bg-surface-container-low hover:bg-slate-100 transition-colors group"
                    >
                      <span className="w-8 h-8 flex items-center justify-center bg-[#0077B5] rounded-lg flex-shrink-0">
                        <svg className="w-4 h-4 fill-white" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                        </svg>
                      </span>
                      <span className="text-sm font-semibold text-slate-700 group-hover:text-primary transition-colors truncate">
                        LinkedIn
                      </span>
                      <span className="material-symbols-outlined text-[16px] text-slate-400 ml-auto">open_in_new</span>
                    </a>
                  )}
                  {profile.github_url && (
                    <a
                      href={profile.github_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 rounded-xl bg-surface-container-low hover:bg-slate-100 transition-colors group"
                    >
                      <span className="w-8 h-8 flex items-center justify-center bg-slate-800 rounded-lg flex-shrink-0">
                        <svg className="w-4 h-4 fill-white" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
                        </svg>
                      </span>
                      <span className="text-sm font-semibold text-slate-700 group-hover:text-primary transition-colors truncate">
                        GitHub
                      </span>
                      <span className="material-symbols-outlined text-[16px] text-slate-400 ml-auto">open_in_new</span>
                    </a>
                  )}
                  {profile.portfolio_url && (
                    <a
                      href={profile.portfolio_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 rounded-xl bg-surface-container-low hover:bg-slate-100 transition-colors group"
                    >
                      <span className="w-8 h-8 flex items-center justify-center bg-primary rounded-lg flex-shrink-0">
                        <span className="material-symbols-outlined text-white text-[18px]">language</span>
                      </span>
                      <span className="text-sm font-semibold text-slate-700 group-hover:text-primary transition-colors truncate">
                        Portfolio
                      </span>
                      <span className="material-symbols-outlined text-[16px] text-slate-400 ml-auto">open_in_new</span>
                    </a>
                  )}
                </div>
              </section>
            )}
          </aside>

          {/* Main Content */}
          <div className="lg:col-span-8 space-y-8">
            {/* Profile Header */}
            <header className="bg-surface-container-lowest rounded-lg p-8 shadow-[0_20px_40px_rgba(25,28,30,0.04)] relative overflow-hidden flex flex-col md:flex-row items-center md:items-start gap-6">
              <div className="flex flex-col md:flex-row items-center md:items-start gap-6 relative z-10 flex-1">
                <div className="flex-shrink-0">
                  <div className="w-24 h-24 rounded-[20px] overflow-hidden border-2 border-white shadow-sm bg-surface-container-high">
                    {profile.avatar_url ? (
                      <img
                        src={profile.avatar_url}
                        alt={displayName}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-3xl font-bold text-slate-400">
                        {avatarInitial}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex-1 text-center md:text-left pt-1">
                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-3">
                    <h1 className="font-headline text-2xl font-bold text-slate-900">
                      {displayName}
                    </h1>
                    <span className="px-3 py-1 bg-[#E8F5E9] text-[#2E7D32] font-label text-[10px] font-bold tracking-widest uppercase rounded-full">
                      Job Seeker
                    </span>
                  </div>

                  <div className="flex flex-col gap-2 text-sm text-slate-500 font-medium">
                    {profile.location && (
                      <div className="flex flex-wrap justify-center md:justify-start gap-x-6 gap-y-2">
                        <div className="flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-[16px] text-slate-400">location_on</span>
                          {profile.location}
                        </div>
                      </div>
                    )}
                    {profile.linkedin_url && (
                      <div className="flex items-center gap-1.5 justify-center md:justify-start">
                        <span className="material-symbols-outlined text-[16px] text-slate-400">link</span>
                        <a
                          href={profile.linkedin_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:text-primary transition-colors truncate max-w-[250px] text-slate-600"
                        >
                          {profile.linkedin_url.replace("https://www.", "").replace("https://", "")}
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </header>

            {/* Bio */}
            {profile.bio && (
              <section className="bg-surface-container-lowest rounded-lg pt-6 pb-6 px-8 shadow-[0_20px_40px_rgba(25,28,30,0.04)]">
                <h3 className="font-headline text-lg font-bold mb-4 text-slate-900 border-b border-surface-container-low pb-4">
                  Bio
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                  {profile.bio}
                </p>
              </section>
            )}

            {/* Technical Skills */}
            {profile.skills && profile.skills.length > 0 && (
              <section className="bg-surface-container-lowest rounded-lg pt-6 pb-8 px-8 shadow-[0_20px_40px_rgba(25,28,30,0.04)]">
                <div className="mb-6 border-b border-surface-container-low pb-4">
                  <h3 className="font-headline text-lg font-bold text-slate-900">
                    Technical Skills
                  </h3>
                </div>
                <div className="flex flex-wrap gap-2.5">
                  {profile.skills.map((skill, idx) => (
                    <span
                      key={idx}
                      className="px-4 py-1.5 bg-[#F0F4FF] text-[#1a56db] text-sm font-semibold rounded-full border border-[#dce8ff] hover:bg-[#e0eaff] transition-colors cursor-default"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </section>
            )}

            {/* Work Experience */}
            {workExpList.length > 0 && (
              <section className="bg-surface-container-lowest rounded-lg pt-6 pb-8 px-8 shadow-[0_20px_40px_rgba(25,28,30,0.04)]">
                <div className="mb-6 border-b border-surface-container-low pb-4">
                  <h3 className="font-headline text-lg font-bold text-slate-900">
                    Work Experience
                  </h3>
                </div>
                <div className="space-y-0">
                  {workExpList.map((exp, idx) => (
                    <div key={idx}>
                      <div className="flex gap-5 items-start py-5">
                        <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="material-symbols-outlined text-slate-500 text-2xl">corporate_fare</span>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-start justify-between">
                            <div>
                              <h4 className="text-base font-bold text-slate-900 leading-tight">
                                {exp.position || exp.title}
                              </h4>
                              {exp.company && (
                                <p className="text-[#1a56db] font-semibold text-sm mt-0.5">
                                  {exp.company}
                                </p>
                              )}
                            </div>
                            {(exp.start_date || exp.duration) && (
                              <span className="text-xs text-slate-400 font-medium bg-slate-50 px-2.5 py-1 rounded-full border border-slate-100 flex-shrink-0 ml-4">
                                {exp.start_date
                                  ? `${exp.start_date} – ${exp.currently_working ? "Present" : exp.end_date || ""}`
                                  : exp.duration}
                              </span>
                            )}
                          </div>
                          {exp.description && (
                            <p className="text-slate-500 text-sm leading-relaxed mt-2">
                              {exp.description}
                            </p>
                          )}
                        </div>
                      </div>
                      {idx < workExpList.length - 1 && (
                        <div className="border-b border-surface-container-low" />
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Education */}
            {educationList.length > 0 && (
              <section className="bg-surface-container-lowest rounded-lg pt-6 pb-8 px-8 shadow-[0_20px_40px_rgba(25,28,30,0.04)]">
                <div className="mb-6 border-b border-surface-container-low pb-4">
                  <h3 className="font-headline text-lg font-bold text-slate-900">
                    Education
                  </h3>
                </div>
                <div className="space-y-0">
                  {educationList.map((edu, idx) => (
                    <div key={idx}>
                      <div className="flex gap-5 items-start py-5">
                        <div className="w-12 h-12 rounded-xl bg-[#EEF2FF] flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="material-symbols-outlined text-[#6366f1] text-[22px]">school</span>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-start justify-between">
                            <div>
                              <h5 className="font-bold text-slate-900 text-base leading-tight">
                                {edu.degree || "Degree"}
                                {edu.field_of_study ? ` in ${edu.field_of_study}` : ""}
                              </h5>
                              <p className="text-[#1a56db] font-semibold text-sm mt-0.5">
                                {edu.institution || "Institution"}
                              </p>
                            </div>
                            {(edu.start_year || edu.end_year) && (
                              <span className="text-xs text-slate-400 font-medium bg-slate-50 px-2.5 py-1 rounded-full border border-slate-100 flex-shrink-0 ml-4">
                                {edu.start_year || "—"} – {edu.end_year || "Present"}
                              </span>
                            )}
                          </div>
                          {edu.gpa && (
                            <span className="inline-block mt-2 text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                              GPA: {edu.gpa}
                            </span>
                          )}
                        </div>
                      </div>
                      {idx < educationList.length - 1 && (
                        <div className="border-b border-surface-container-low" />
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Projects */}
            {projectsList.length > 0 && (
              <section className="bg-surface-container-lowest rounded-lg pt-6 pb-8 px-8 shadow-[0_20px_40px_rgba(25,28,30,0.04)]">
                <div className="mb-6 border-b border-surface-container-low pb-4">
                  <h3 className="font-headline text-lg font-bold text-slate-900">
                    Projects
                  </h3>
                </div>
                <div className="space-y-0">
                  {projectsList.map((proj, idx) => (
                    <div key={idx}>
                      <div className="flex gap-5 items-start py-5">
                        <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="material-symbols-outlined text-amber-500 text-2xl">rocket_launch</span>
                        </div>
                        <div className="flex-1">
                          <h4 className="text-base font-bold text-slate-900">{proj.title}</h4>
                          {proj.description && (
                            <p className="text-slate-500 text-sm leading-relaxed mb-2 mt-1">{proj.description}</p>
                          )}
                          {proj.link && (
                            <a
                              href={proj.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[#1a56db] text-xs font-bold hover:underline inline-flex items-center gap-1"
                            >
                              <span className="material-symbols-outlined text-[14px]">open_in_new</span>{" "}
                              View Project
                            </a>
                          )}
                        </div>
                      </div>
                      {idx < projectsList.length - 1 && (
                        <div className="border-b border-surface-container-low" />
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        </div>
      </main>
    </Layout>
  );
};

export default PublicProfile;
