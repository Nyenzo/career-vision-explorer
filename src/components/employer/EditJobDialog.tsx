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
import { useEmployerJobs } from "@/hooks/use-employer-jobs";
import { toast } from "sonner";

// Updated schema to match backend JobUpdate structure
const formSchema = z.object({
  title: z.string().min(5, "Job title must be at least 5 characters"),
  description: z.string().min(20, "Description must be at least 20 characters"),
  location: z.string().min(2, "Location is required"),
  job_type: z.string().min(2, "Job type is required"),
  salary_range: z.string().optional(),
  experience_level: z.string().optional(),
  requirements: z
    .string()
    .min(10, "Requirements must be at least 10 characters"),
});

type FormValues = z.infer<typeof formSchema>;

interface EditJobDialogProps {
  job: any;
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
      job_type: job.job_type || job.type || "",
      salary_range: job.salary_range || "",
      experience_level: job.experience_level || job.experience || "",
      requirements: Array.isArray(job.requirements)
        ? job.requirements.join("\n")
        : job.requirements || "",
    },
  });

  // Reset form when job changes or dialog opens
  React.useEffect(() => {
    if (open && job) {
      form.reset({
        title: job.title || "",
        description: job.description || "",
        location: job.location || "",
        job_type: job.job_type || job.type || "",
        salary_range: job.salary_range || "",
        experience_level: job.experience_level || job.experience || "",
        requirements: Array.isArray(job.requirements)
          ? job.requirements.join("\n")
          : job.requirements || "",
      });
    }
  }, [open, job, form]);

  async function onSubmit(values: FormValues) {
    try {
      console.log("🔄 Starting job update for:", job.job_id);
      console.log("📝 Update data:", values);

      // Map the form values to the correct API field names
      const updateData: JobUpdate = {
        title: values.title,
        description: values.description,
        location: values.location,
        job_type: values.job_type,
        salary_range: values.salary_range,
        experience_level: values.experience_level,
        requirements: values.requirements,
        // Note: We're NOT sending 'company' for updates since it shouldn't change
        // Note: We're NOT sending 'type' and 'salary' - using 'job_type' and 'salary_range' instead
      };

      console.log("🚀 Sending update to API:", updateData);

      await updateJob(job.job_id, updateData);

      console.log("Job update successful, calling onJobUpdated");
      toast.success("Job updated successfully!");
      onJobUpdated();
    } catch (error: any) {
      console.error("Failed to update job:", error);
      toast.error(error.message || "Failed to update job");
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
                    <FormControl>
                      <Input
                        placeholder="Full-time, Part-time, Contract"
                        {...field}
                      />
                    </FormControl>
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
                    <FormControl>
                      <Input placeholder="e.g., Mid Level, Senior" {...field} />
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
