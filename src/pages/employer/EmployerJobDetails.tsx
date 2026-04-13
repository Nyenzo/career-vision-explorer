import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Pencil } from "lucide-react";
import { JobHeader } from "@/components/jobs/JobHeader";
import { JobDetailsView } from "@/components/jobs/JobDetailsView";
import { CompanyInfoCard } from "@/components/jobs/CompanyInfoCard";
import { JobNotFound } from "@/components/jobs/JobNotFound";
import { jobsService } from "@/services/jobs.service";
import { Job } from "@/types/api";

const EmployerJobDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setError("Invalid job ID");
      setLoading(false);
      return;
    }

    const fetchEmployerJobDetails = async () => {
      setLoading(true);
      setError(null);
      try {
        const fetchedJob = await jobsService.getMyJobById(id);
        setJob(fetchedJob);
      } catch {
        setError("Job not found");
      } finally {
        setLoading(false);
      }
    };

    fetchEmployerJobDetails();
  }, [id]);

  if (loading) {
    return <Layout><div>Loading...</div></Layout>;
  }

  if (error || !job) {
    return (
      <Layout>
        <JobNotFound />
      </Layout>
    );
  }

  const rawJob = job as Job & Record<string, unknown>;
  const headerJob = {
    title: String(rawJob.job_title ?? rawJob.title ?? "Untitled Job"),
    company: String(rawJob.company_name ?? rawJob.company ?? "N/A"),
    location: String(rawJob.location ?? "N/A"),
    type: String(rawJob.job_type ?? "full_time"),
    posted: String(rawJob.created_at ?? ""),
    matchScore: 0,
  };

  return (
    <Layout>
      <div className="min-h-screen bg-surface">
        <main className="pt-12 pb-20 px-6 max-w-7xl mx-auto">
          <div className="mb-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <Button
                variant="ghost"
                onClick={() => navigate("/employer/jobs")}
                className="text-on-surface-variant hover:text-primary hover:bg-surface-container-low"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Jobs
              </Button>

              <Button onClick={() => navigate(`/employer/jobs/${id}/edit`)}>
                <Pencil className="mr-2 h-4 w-4" />
                Edit Job
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-8 space-y-8">
              <JobHeader job={headerJob} showMatchScore={false} />
              <JobDetailsView job={job} />
            </div>

            <aside className="lg:col-span-4 space-y-6">
              <CompanyInfoCard
                company={{
                  name: String(rawJob.company_name ?? "N/A"),
                  size: "N/A",
                  industry: "N/A",
                  founded: "N/A",
                  website: "#",
                  logoUrl: rawJob.company_logo_url as string | undefined,
                }}
              />
            </aside>
          </div>
        </main>
      </div>
    </Layout>
  );
};

export default EmployerJobDetails;
