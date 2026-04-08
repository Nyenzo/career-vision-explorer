
import React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, Mail, Phone } from "lucide-react";
import { Applicant } from "@/hooks/use-applicants";
import { ApplicantProfileDialog } from "@/components/employer/ApplicantProfileDialog";

interface ApplicantTableProps {
  applicants: Applicant[];
  onStatusChange: (id: string, status: string) => void;
}

export const ApplicantTable = ({ applicants, onStatusChange }: ApplicantTableProps) => {
  const getScoreBadgeColor = (score: number) => {
    if (score >= 90) return "bg-green-100 text-green-800";
    if (score >= 80) return "bg-green-100 text-green-800";
    if (score >= 70) return "bg-yellow-100 text-yellow-800";
    return "bg-red-100 text-red-800";
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "Reviewing":
        return "bg-yellow-100 text-yellow-800";
      case "Interview":
        return "bg-blue-100 text-blue-800";
      case "Hired":
        return "bg-green-100 text-green-800";
      case "Rejected":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (applicants.length === 0) {
    return (
      <div className="text-center py-8">
        <h3 className="text-lg font-medium text-gray-900">No applicants found</h3>
        <p className="text-gray-500 mt-2">
          Try adjusting your search criteria.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-md">
      <Table className="min-w-[700px]">
        <TableHeader>
          <TableRow>
            <TableHead scope="col">Candidate</TableHead>
            <TableHead scope="col">Position</TableHead>
            <TableHead scope="col">Contact</TableHead>
            <TableHead scope="col">Applied</TableHead>
            <TableHead scope="col">Match Score</TableHead>
            <TableHead scope="col">Status</TableHead>
            <TableHead scope="col">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {applicants.map((applicant) => (
            <TableRow key={applicant.id}>
              <TableCell>
                <div>
                  <div className="font-medium">{applicant.name}</div>
                  {applicant.notes && (
                    <div className="text-sm text-gray-500 truncate max-w-xs">
                      {applicant.notes}
                    </div>
                  )}
                </div>
              </TableCell>
              <TableCell>{applicant.position}</TableCell>
              <TableCell>
                <div className="space-y-1">
                  <div className="flex items-center text-sm">
                    <Mail className="h-3 w-3 mr-1" aria-hidden="true" />
                    {applicant.email}
                  </div>
                  {applicant.phone && (
                    <div className="flex items-center text-sm">
                      <Phone className="h-3 w-3 mr-1" aria-hidden="true" />
                      {applicant.phone}
                    </div>
                  )}
                </div>
              </TableCell>
              <TableCell>{applicant.appliedTime}</TableCell>
              <TableCell>
                <Badge className={getScoreBadgeColor(applicant.matchScore)}>
                  {applicant.matchScore}%
                </Badge>
              </TableCell>
              <TableCell>
                <Badge className={getStatusBadgeColor(applicant.status)}>
                  {applicant.status}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <ApplicantProfileDialog
                    applicant={applicant}
                    onStatusChange={onStatusChange}
                  >
                    <Button variant="outline" size="sm">
                      View Profile
                    </Button>
                  </ApplicantProfileDialog>
                  {applicant.resumeUrl && (
                    <Button variant="outline" size="sm">
                      <Download className="h-3 w-3 mr-1" aria-hidden="true" />
                      Resume
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
