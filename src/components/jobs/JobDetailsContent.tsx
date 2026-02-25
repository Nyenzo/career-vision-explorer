
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Target, Zap, Award, Briefcase, Heart, Calendar, MapPin, DollarSign, User, CheckCircle, Clock, ClipboardList, Info, Users, Link } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { jobsService } from "@/services/jobs.service";
import { toast } from "sonner";

/* Updated interface to fix TS error */
interface JobDetailsContentProps {
  job: any;
  onUpdate?: (updatedJob: any) => void;
}

export const JobDetailsContent = ({ job, onUpdate }: JobDetailsContentProps) => {
 const [formData, setFormData] = useState<any>({
   job_id: job.job_id || "",
   title: job.title || "",
   company: job.company || "",
   requirements: job.requirements || "",
   location: job.location || "",
   salary_range: job.salary_range || "",
   posted_by: job.posted_by || "",
   is_active: job.is_active ?? true,
   created_at: job.created_at || "",
   updated_at: job.updated_at || "",
   job_type: job.job_type || "",
   experience_level: job.experience_level || "",
   skills_required: job.skills_required || [],
   description: job.description || "",
   benefits: job.benefits || [],
   application_deadline: job.application_deadline || "",
   remote_friendly: job.remote_friendly ?? false,
   match_score: job.match_score || 0,
   responsibilities: job.responsibilities || [],
   company_info: job.company_info || {},
 });

 useEffect(() => {
   setFormData({
     job_id: job.job_id || "",
     title: job.title || "",
     company: job.company || "",
     requirements: job.requirements || "",
     location: job.location || "",
     salary_range: job.salary_range || "",
     posted_by: job.posted_by || "",
     is_active: job.is_active ?? true,
     created_at: job.created_at || "",
     updated_at: job.updated_at || "",
     job_type: job.job_type || "",
     experience_level: job.experience_level || "",
     skills_required: job.skills_required || [],
     description: job.description || "",
     benefits: job.benefits || [],
     application_deadline: job.application_deadline || "",
     remote_friendly: job.remote_friendly ?? false,
     match_score: job.match_score || 0,
     responsibilities: job.responsibilities || [],
     company_info: job.company_info || {},
   });
 }, [job]);

 const handleInputChange = (field: string, value: any) => {
   setFormData((prev: any) => ({
     ...prev,
     [field]: value,
   }));
 };

 const handleArrayChange = (field: string, index: number, value: string) => {
   const updatedArray = [...(formData[field] || [])];
   updatedArray[index] = value;
   setFormData((prev: any) => ({
     ...prev,
     [field]: updatedArray,
   }));
 };

 const handleAddArrayItem = (field: string) => {
   setFormData((prev: any) => ({
     ...prev,
     [field]: [...(prev[field] || []), ""],
   }));
 };

 const handleRemoveArrayItem = (field: string, index: number) => {
   const updatedArray = [...(formData[field] || [])];
   updatedArray.splice(index, 1);
   setFormData((prev: any) => ({
     ...prev,
     [field]: updatedArray,
   }));
 };

 const handleCompanyInfoChange = (field: string, value: any) => {
   setFormData((prev: any) => ({
     ...prev,
     company_info: {
       ...prev.company_info,
       [field]: value,
     },
   }));
 };

 const handleSave = async () => {
   try {
     const updateData = {
       title: formData.title,
       company: formData.company,
       requirements: formData.requirements,
       location: formData.location,
       salary: formData.salary_range,
       posted_by: formData.posted_by,
       is_active: formData.is_active,
       type: formData.job_type,
       experienceLevel: formData.experience_level,
       skills: formData.skills_required,
       description: formData.description,
       benefits: formData.benefits,
       application_deadline: formData.application_deadline || null,
       remote_friendly: formData.remote_friendly,
       responsibilities: formData.responsibilities,
       companyInfo: formData.company_info,
     };
     const updatedJob = await jobsService.updateJob(formData.job_id, updateData);
     toast.success("Job updated successfully");
     if (onUpdate) {
       onUpdate(updatedJob);
     }
   } catch (error) {
     toast.error("Failed to update job");
   }
 };

 return (
   <Card className="career-card">
     <CardContent className="p-8 space-y-6">
       {/* Job Basic Info */}
       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
         <div>
           <label className="block font-semibold mb-1">Job ID</label>
           <Input value={formData.job_id} disabled />
         </div>
         <div>
           <label className="block font-semibold mb-1">Title</label>
           <Input
             value={formData.title}
             onChange={(e) => handleInputChange("title", e.target.value)}
           />
         </div>
         <div>
           <label className="block font-semibold mb-1">Company</label>
           <Input
             value={formData.company}
             onChange={(e) => handleInputChange("company", e.target.value)}
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
           <label className="block font-semibold mb-1">Posted By</label>
           <Input
             value={formData.posted_by}
             onChange={(e) => handleInputChange("posted_by", e.target.value)}
           />
         </div>
         <div>
           <label className="block font-semibold mb-1">Job Type</label>
           <Input
             value={formData.job_type}
             onChange={(e) => handleInputChange("job_type", e.target.value)}
           />
         </div>
         <div>
           <label className="block font-semibold mb-1">Experience Level</label>
           <Input
             value={formData.experience_level}
             onChange={(e) => handleInputChange("experience_level", e.target.value)}
           />
         </div>
         <div>
           <label className="block font-semibold mb-1">Application Deadline</label>
           <Input
             type="date"
             value={formData.application_deadline}
             onChange={(e) => handleInputChange("application_deadline", e.target.value)}
           />
         </div>
         <div className="flex items-center space-x-2">
           <Switch
             checked={formData.is_active}
             onCheckedChange={(checked) => handleInputChange("is_active", checked)}
           />
           <label className="font-semibold">Is Active</label>
         </div>
         <div className="flex items-center space-x-2">
           <Switch
             checked={formData.remote_friendly}
             onCheckedChange={(checked) => handleInputChange("remote_friendly", checked)}
           />
           <label className="font-semibold">Remote Friendly</label>
         </div>
         <div>
           <label className="block font-semibold mb-1">Match Score</label>
           <Input
             type="number"
             value={formData.match_score}
             onChange={(e) => handleInputChange("match_score", Number(e.target.value))}
           />
         </div>
         <div>
           <label className="block font-semibold mb-1">Created At</label>
           <Input
             type="text"
             value={formData.created_at}
             disabled
           />
         </div>
         <div>
           <label className="block font-semibold mb-1">Updated At</label>
           <Input
             type="text"
             value={formData.updated_at}
             disabled
           />
         </div>
       </div>
 
       <Separator />
 
       {/* Description */}
       <div>
         <label className="block font-semibold mb-1">Description</label>
         <Textarea
           value={formData.description}
           onChange={(e) => handleInputChange("description", e.target.value)}
           rows={4}
         />
       </div>

       {/* Skills Required */}
       <div>
         <label className="block font-semibold mb-1">Skills Required</label>
         {formData.skills_required.map((skill: string, index: number) => (
           <div key={index} className="flex items-center space-x-2 mb-2">
             <Input
               value={skill}
               onChange={(e) => handleArrayChange("skills_required", index, e.target.value)}
             />
             <Button variant="destructive" onClick={() => handleRemoveArrayItem("skills_required", index)}>Remove</Button>
           </div>
         ))}
         <Button onClick={() => handleAddArrayItem("skills_required")}>Add Skill</Button>
       </div>

       {/* Requirements */}
       <div>
         <label className="block font-semibold mb-1">Requirements</label>
         <Textarea
           value={formData.requirements}
           onChange={(e) => handleInputChange("requirements", e.target.value)}
           rows={4}
         />
       </div>

       {/* Responsibilities */}
       <div>
         <label className="block font-semibold mb-1">Responsibilities</label>
         {formData.responsibilities.map((resp: string, index: number) => (
           <div key={index} className="flex items-center space-x-2 mb-2">
             <Input
               value={resp}
               onChange={(e) => handleArrayChange("responsibilities", index, e.target.value)}
             />
             <Button variant="destructive" onClick={() => handleRemoveArrayItem("responsibilities", index)}>Remove</Button>
           </div>
         ))}
         <Button onClick={() => handleAddArrayItem("responsibilities")}>Add Responsibility</Button>
       </div>

       {/* Benefits */}
       <div>
         <label className="block font-semibold mb-1">Benefits</label>
         {formData.benefits.map((benefit: string, index: number) => (
           <div key={index} className="flex items-center space-x-2 mb-2">
             <Input
               value={benefit}
               onChange={(e) => handleArrayChange("benefits", index, e.target.value)}
             />
             <Button variant="destructive" onClick={() => handleRemoveArrayItem("benefits", index)}>Remove</Button>
           </div>
         ))}
         <Button onClick={() => handleAddArrayItem("benefits")}>Add Benefit</Button>
       </div>

       <Separator />

       {/* Company Info */}
       <div>
         <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
           <Users className="h-6 w-6 text-primary" />
           Company Info
         </h3>
         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           <div>
             <label className="block font-semibold mb-1">Size</label>
             <Input
               value={formData.company_info.size || ""}
               onChange={(e) => handleCompanyInfoChange("size", e.target.value)}
             />
           </div>
           <div>
             <label className="block font-semibold mb-1">Industry</label>
             <Input
               value={formData.company_info.industry || ""}
               onChange={(e) => handleCompanyInfoChange("industry", e.target.value)}
             />
           </div>
           <div>
             <label className="block font-semibold mb-1">Founded</label>
             <Input
               value={formData.company_info.founded || ""}
               onChange={(e) => handleCompanyInfoChange("founded", e.target.value)}
             />
           </div>
           <div>
             <label className="block font-semibold mb-1">Website</label>
             <Input
               value={formData.company_info.website || ""}
               onChange={(e) => handleCompanyInfoChange("website", e.target.value)}
             />
           </div>
         </div>
       </div>

       <Button className="mt-6" onClick={handleSave}>
         Save Changes
       </Button>
     </CardContent>
   </Card>
 );
};
