
import { FileText } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface CoverLetterSectionProps {
  coverLetter: string;
  setCoverLetter: (value: string) => void;
}

export const CoverLetterSection = ({ coverLetter, setCoverLetter }: CoverLetterSectionProps) => {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <FileText className="h-5 w-5 text-primary" />
        <Label htmlFor="coverLetter" className="text-lg font-semibold">Cover Letter</Label>
      </div>
      <Textarea
        id="coverLetter"
        placeholder="Tell us why you're the perfect fit for this role. Highlight your relevant experience and what excites you about this opportunity..."
        value={coverLetter}
        onChange={(e) => setCoverLetter(e.target.value)}
        rows={6}
        className="resize-none"
        required
      />
      <p className="text-sm text-on-surface-variant">
        {coverLetter.length}/500 characters recommended
      </p>
    </div>
  );
};
