
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { 
  Calendar, 
  MapPin, 
  Building, 
  DollarSign, 
  Clock, 
  FileText,
  ExternalLink
} from "lucide-react";

interface ApplicationDetailsDialogProps {
  application: {
    id: number;
    company: string;
    position: string;
    status: string;
    date: string;
  } | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ApplicationDetailsDialog = ({ 
  application, 
  open, 
  onOpenChange 
}: ApplicationDetailsDialogProps) => {
  if (!application) return null;

  // Mock additional details for the application
  const applicationDetails = {
    ...application,
    location: "Nairobi, Kenya",
    type: "Full-time",
    salary: "$70,000 - $100,000",
    appliedDate: application.date,
    lastUpdate: application.date,
    coverLetter: "I am excited to apply for this position...",
    resume: "John_Doe_Resume.pdf",
    notes: "Application submitted successfully. Waiting for response.",
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "interview scheduled":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "application received":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "rejected":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-gray-900">
            Application Details
          </DialogTitle>
          <DialogDescription>
            View and manage your job application
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Job Information */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg">
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              {applicationDetails.position}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2 text-gray-600">
                <Building className="h-4 w-4 text-blue-500" />
                {applicationDetails.company}
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <MapPin className="h-4 w-4 text-green-500" />
                {applicationDetails.location}
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <DollarSign className="h-4 w-4 text-orange-500" />
                {applicationDetails.salary}
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Clock className="h-4 w-4 text-purple-500" />
                {applicationDetails.type}
              </div>
            </div>
          </div>

          <Separator />

          {/* Application Status */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-gray-900">Application Status</h4>
            <div className="flex items-center justify-between">
              <Badge className={`px-3 py-1 ${getStatusColor(applicationDetails.status)}`}>
                {applicationDetails.status}
              </Badge>
              <div className="text-sm text-gray-500">
                Last updated: {applicationDetails.lastUpdate}
              </div>
            </div>
          </div>

          <Separator />

          {/* Application Details */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-gray-900">Application Details</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Applied Date</label>
                <div className="flex items-center gap-2 text-gray-600">
                  <Calendar className="h-4 w-4" />
                  {applicationDetails.appliedDate}
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Resume</label>
                <div className="flex items-center gap-2 text-gray-600">
                  <FileText className="h-4 w-4" />
                  {applicationDetails.resume}
                </div>
              </div>
            </div>
          </div>

          {/* Cover Letter */}
          <div className="space-y-3">
            <h4 className="text-lg font-semibold text-gray-900">Cover Letter</h4>
            <div className="p-4 bg-gray-50 rounded-lg text-sm text-gray-700 leading-relaxed">
              {applicationDetails.coverLetter}
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-3">
            <h4 className="text-lg font-semibold text-gray-900">Notes</h4>
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-gray-700">
              {applicationDetails.notes}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button 
              variant="outline" 
              className="flex-1"
              onClick={() => onOpenChange(false)}
            >
              Close
            </Button>
            <Button 
              className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              View Job Posting
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
