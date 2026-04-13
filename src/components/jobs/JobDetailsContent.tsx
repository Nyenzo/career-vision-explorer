import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { jobsService } from "@/services/jobs.service";
import { toast } from "sonner";
import { Job } from "@/types/api";
import { useNavigate } from "react-router-dom";

interface JobDetailsContentProps {
  job: Job;
  onUpdate?: (updatedJob: Job) => void;
}

interface EmployerJobFormState {
  id: string;
  job_title: string;
  job_description: string;
  requirements: string;
  responsibilities: string;
  benefits: string;
  required_skills: string;
  location: string;
  job_type: "full_time" | "part_time" | "remote" | "internship";
  salary_range: string;
  experience_level: "entry_level" | "mid_level" | "senior_level" | "executive_level";
  status: "draft" | "open" | "closed";
  application_deadline: string;
  created_at: string;
  updated_at: string;
}

const toStringArray = (value: unknown): string[] => {
  if (Array.isArray(value)) {
    return value
      .map((item) => String(item).trim())
      .filter((item) => item.length > 0);
  }

  if (typeof value === "string") {
    return value
      .split(/\n|,/g)
      .map((item) => item.trim())
      .filter((item) => item.length > 0);
  }

  return [];
};

const toMultilineText = (value: unknown): string => {
  if (Array.isArray(value)) {
    return value
      .map((item) => String(item))
      .join("\n");
  }

  if (typeof value === "string") {
    return value;
  }

  return "";
};

const normalizeJob = (job: Job): EmployerJobFormState => ({
  id: String(job.id || job.job_id || ""),
  job_title: String(job.job_title || job.title || ""),
  job_description: String(job.job_description || job.description || ""),
  requirements: toMultilineText(job.requirements),
  responsibilities: toMultilineText(job.responsibilities),
  benefits: toMultilineText(job.benefits),
  required_skills: toMultilineText(job.required_skills || job.skills_required),
  location: String(job.location || ""),
  job_type: (job.job_type || "full_time") as EmployerJobFormState["job_type"],
  salary_range: String(job.salary_range || ""),
  experience_level: (job.experience_level || "mid_level") as EmployerJobFormState["experience_level"],
  status: (job.status || "draft") as EmployerJobFormState["status"],
  application_deadline: job.application_deadline || "",
  created_at: String(job.created_at || ""),
  updated_at: String(job.updated_at || ""),
});

export const JobDetailsContent = ({ job, onUpdate }: JobDetailsContentProps) => {
  const [formData, setFormData] = useState<EmployerJobFormState>(normalizeJob(job));
  const navigate = useNavigate();

  useEffect(() => {
    setFormData(normalizeJob(job));
  }, [job]);

  const handleInputChange = <K extends keyof EmployerJobFormState>(field: K, value: EmployerJobFormState[K]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!formData.id) {
      toast.error("Invalid job id");
      return;
    }

    if (!formData.job_title.trim() || !formData.job_description.trim()) {
      toast.error("Job title and job description are required");
      return;
    }

    try {
      const updatedJob = await jobsService.updateJob(formData.id, {
        job_title: formData.job_title,
        job_description: formData.job_description,
        requirements: toStringArray(formData.requirements),
        responsibilities: toStringArray(formData.responsibilities),
        benefits: toStringArray(formData.benefits),
        required_skills: toStringArray(formData.required_skills),
        location: formData.location || undefined,
        job_type: formData.job_type,
        salary_range: formData.salary_range || undefined,
        experience_level: formData.experience_level,
        status: formData.status,
        application_deadline: formData.application_deadline || undefined,
      });

      toast.success("Job updated successfully");
      if (onUpdate) {
        onUpdate(updatedJob);
      }
      navigate(`/employer/jobs/${formData.id}`);
    } catch {
      toast.error("Failed to update job");
    }
  };

  return (
    <Card className="career-card">
      <CardContent className="p-8 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block font-semibold mb-1">Job ID</label>
            <Input value={formData.id} disabled />
          </div>
          <div>
            <label className="block font-semibold mb-1">Job Title</label>
            <Input
              value={formData.job_title}
              onChange={(e) => handleInputChange("job_title", e.target.value)}
            />
          </div>
          <div>
            <label className="block font-semibold mb-1">Location</label>
            <Input
              value={formData.location}
              onChange={(e) => handleInputChange("location", e.target.value)}
            />
          </div>
          <div>
            <label className="block font-semibold mb-1">Salary Range</label>
            <Input
              value={formData.salary_range}
              onChange={(e) => handleInputChange("salary_range", e.target.value)}
            />
          </div>
          <div>
            <label className="block font-semibold mb-1">Job Type</label>
            <Select value={formData.job_type} onValueChange={(value) => handleInputChange("job_type", value as EmployerJobFormState["job_type"])}>
              <SelectTrigger>
                <SelectValue placeholder="Select job type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="full_time">Full-time</SelectItem>
                <SelectItem value="part_time">Part-time</SelectItem>
                <SelectItem value="remote">Remote</SelectItem>
                <SelectItem value="internship">Internship</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="block font-semibold mb-1">Experience Level</label>
            <Select
              value={formData.experience_level}
              onValueChange={(value) => handleInputChange("experience_level", value as EmployerJobFormState["experience_level"])}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select experience level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="entry_level">Entry Level</SelectItem>
                <SelectItem value="mid_level">Mid Level</SelectItem>
                <SelectItem value="senior_level">Senior Level</SelectItem>
                <SelectItem value="executive_level">Executive</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="block font-semibold mb-1">Status</label>
            <Select value={formData.status} onValueChange={(value) => handleInputChange("status", value as EmployerJobFormState["status"])}>
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="block font-semibold mb-1">Application Deadline</label>
            <Input
              type="date"
              value={formData.application_deadline || ""}
              onChange={(e) => handleInputChange("application_deadline", e.target.value)}
            />
          </div>
          <div>
            <label className="block font-semibold mb-1">Created At</label>
            <Input value={formData.created_at} disabled />
          </div>
          <div>
            <label className="block font-semibold mb-1">Updated At</label>
            <Input value={formData.updated_at} disabled />
          </div>
        </div>

        <Separator />

        <div>
          <label className="block font-semibold mb-1">Job Description</label>
          <Textarea
            value={formData.job_description}
            onChange={(e) => handleInputChange("job_description", e.target.value)}
            rows={5}
          />
        </div>

        <div>
          <label className="block font-semibold mb-1">Requirements (one per line)</label>
          <Textarea
            value={formData.requirements}
            onChange={(e) => handleInputChange("requirements", e.target.value)}
            rows={4}
          />
        </div>

        <div>
          <label className="block font-semibold mb-1">Responsibilities (one per line)</label>
          <Textarea
            value={formData.responsibilities}
            onChange={(e) => handleInputChange("responsibilities", e.target.value)}
            rows={4}
          />
        </div>

        <div>
          <label className="block font-semibold mb-1">Benefits (one per line)</label>
          <Textarea
            value={formData.benefits}
            onChange={(e) => handleInputChange("benefits", e.target.value)}
            rows={4}
          />
        </div>

        <div>
          <label className="block font-semibold mb-1">Required Skills (one per line)</label>
          <Textarea
            value={formData.required_skills}
            onChange={(e) => handleInputChange("required_skills", e.target.value)}
            rows={4}
          />
        </div>

        <div className="pt-2">
          <Button onClick={handleSave}>Save Changes</Button>
        </div>
      </CardContent>
    </Card>
  );
};
