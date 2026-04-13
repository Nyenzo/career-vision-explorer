import React from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useEmployerJobs, EmployerJob } from "@/hooks/use-employer-jobs";
import { JobUpdate } from "@/types/api";
import { toast } from "sonner";

// Updated schema to match backend JobUpdate structure
const formSchema = z.object({
  title: z.string().min(5, "Job title must be at least 5 characters"),
  description: z.string().min(20, "Description must be at least 20 characters"),
  location: z.string().optional(),
  job_type: z.enum(["full_time", "part_time", "internship", "remote"]),
  salary_range: z.string().optional(),
  experience_level: z.enum([
    "entry_level",
    "mid_level",
    "senior_level",
    "executive_level",
  ]),
  requirements: z.string().optional(),
  responsibilities: z.string().optional(),
  benefits: z.string().optional(),
  required_skills: z.string().optional(),
  status: z.enum(["draft", "open", "closed"]),
  application_deadline: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;
type JobType = FormValues["job_type"];
type ExperienceLevel = FormValues["experience_level"];
type JobStatus = FormValues["status"];

const toJobType = (value?: string): JobType => {
  const normalized = (value || "").toLowerCase().replace(/[-\s]/g, "_");
  if (normalized === "part_time") return "part_time";
  if (normalized === "internship") return "internship";
  if (normalized === "remote") return "remote";
  return "full_time";
};

const toExperienceLevel = (value?: string): ExperienceLevel => {
  const normalized = (value || "").toLowerCase().replace(/[-\s]/g, "_");
  if (normalized === "entry_level" || normalized === "entry") return "entry_level";
  if (normalized === "senior_level" || normalized === "senior") return "senior_level";
  if (normalized === "executive_level" || normalized === "executive" || normalized === "lead") {
    return "executive_level";
  }
  return "mid_level";
};

const toStatus = (status?: string, isActive?: boolean): JobStatus => {
  if (status === "draft" || status === "open" || status === "closed") return status;
  return isActive ? "open" : "closed";
};

interface EditJobDialogProps {
  job: EmployerJob;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onJobUpdated: () => void;
}

export function EditJobDialog({
  job,
  open,
  onOpenChange,
  onJobUpdated,
}: EditJobDialogProps) {
  const { updateJob } = useEmployerJobs();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: job.title || "",
      description: job.description || "",
      location: job.location || "",
      job_type: toJobType(job.job_type || job.type),
      salary_range: job.salary_range || "",
      experience_level: toExperienceLevel(job.experience_level || job.experience),
      requirements: Array.isArray(job.requirements)
        ? job.requirements.join("\n")
        : job.requirements || "",
      responsibilities: Array.isArray(job.responsibilities)
        ? job.responsibilities.join("\n")
        : "",
      benefits: Array.isArray(job.benefits) ? job.benefits.join("\n") : "",
      required_skills: Array.isArray(job.required_skills)
        ? job.required_skills.join("\n")
        : "",
      status: toStatus(job.status, job.is_active),
      application_deadline: job.application_deadline || "",
    },
  });

  // Reset form when job changes or dialog opens
  React.useEffect(() => {
    if (open && job) {
      form.reset({
        title: job.title || "",
        description: job.description || "",
        location: job.location || "",
        job_type: toJobType(job.job_type || job.type),
        salary_range: job.salary_range || "",
        experience_level: toExperienceLevel(job.experience_level || job.experience),
        requirements: Array.isArray(job.requirements)
          ? job.requirements.join("\n")
          : job.requirements || "",
        responsibilities: Array.isArray(job.responsibilities)
          ? job.responsibilities.join("\n")
          : "",
        benefits: Array.isArray(job.benefits) ? job.benefits.join("\n") : "",
        required_skills: Array.isArray(job.required_skills)
          ? job.required_skills.join("\n")
          : "",
        status: toStatus(job.status, job.is_active),
        application_deadline: job.application_deadline || "",
      });
    }
  }, [open, job, form]);

  async function onSubmit(values: FormValues) {
    try {
      console.log("🔄 Starting job update for:", job.job_id);
      console.log("📝 Update data:", values);

      // Map the form values to the correct API field names
      const updateData: JobUpdate = {
        job_title: values.title,
        job_description: values.description,
        location: values.location,
        job_type: values.job_type,
        salary_range: values.salary_range,
        experience_level: values.experience_level,
        requirements: (values.requirements || "")
          .split("\n")
          .map((item) => item.trim())
          .filter(Boolean),
        responsibilities: (values.responsibilities || "")
          .split("\n")
          .map((item) => item.trim())
          .filter(Boolean),
        benefits: (values.benefits || "")
          .split("\n")
          .map((item) => item.trim())
          .filter(Boolean),
        required_skills: (values.required_skills || "")
          .split("\n")
          .map((item) => item.trim())
          .filter(Boolean),
        status: values.status,
        application_deadline: values.application_deadline || undefined,
      };

      console.log("🚀 Sending update to API:", updateData);

      await updateJob(job.job_id, updateData);

      console.log("Job update successful, calling onJobUpdated");
      toast.success("Job updated successfully!");
      onJobUpdated();
    } catch (error: unknown) {
      console.error("Failed to update job:", error);
      toast.error(error instanceof Error ? error.message : "Failed to update job");
    }
  }

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      // Reset form when closing
      form.reset();
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Edit Job</DialogTitle>
          <DialogDescription>
            Update the details for your job listing.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Job Title</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., Senior Frontend Developer"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Detail the job responsibilities and requirements"
                      {...field}
                      rows={3}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="requirements"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Requirements</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="List the job requirements and qualifications"
                      {...field}
                      rows={3}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., Remote, New York, etc."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="job_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Job Type</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select job type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="full_time">Full-time</SelectItem>
                        <SelectItem value="part_time">Part-time</SelectItem>
                        <SelectItem value="internship">Internship</SelectItem>
                        <SelectItem value="remote">Remote</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="salary_range"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Salary Range</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., $80,000 - $100,000"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="experience_level"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Experience Level</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select experience level" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="entry_level">Entry Level</SelectItem>
                        <SelectItem value="mid_level">Mid Level</SelectItem>
                        <SelectItem value="senior_level">Senior Level</SelectItem>
                        <SelectItem value="executive_level">Executive</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="open">Open</SelectItem>
                        <SelectItem value="closed">Closed</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="application_deadline"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Application Deadline</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="required_skills"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Required Skills</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="One skill per line"
                      {...field}
                      rows={3}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="responsibilities"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Responsibilities</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="One responsibility per line"
                        {...field}
                        rows={3}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="benefits"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Benefits</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="One benefit per line"
                        {...field}
                        rows={3}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOpenChange(false)}
                disabled={form.formState.isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? "Updating..." : "Update Job"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
