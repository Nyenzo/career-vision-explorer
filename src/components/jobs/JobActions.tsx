import { toast } from "sonner";
import { Copy, Bookmark, BookmarkCheck } from "lucide-react";

interface JobActionsProps {
  job: {
    id?: string;
    salary?: string;
    job_id?: string;
    salary_range: string | null;
  };
  isApplied: boolean;
  isSaved: boolean;
  onApply: () => void;
  onSave: () => void;
}

export const JobActions = ({ job, isApplied, isSaved, onApply, onSave }: JobActionsProps) => {
  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Job link copied to clipboard");
  };

  const displaySalary = job.salary ?? job.salary_range ?? 'Not specified';

  return (
    <div className="bg-surface-container-lowest p-8 rounded-lg shadow-sm sticky top-28 border border-surface-container">
        <div className="flex justify-between items-start mb-8">
            <div>
                <p className="text-sm font-label text-on-surface-variant uppercase tracking-widest mb-1">Estimated Salary</p>
                <h3 className="text-3xl font-headline font-bold text-on-surface">{displaySalary}</h3>
                {displaySalary !== 'Not specified' && (
                    <p className="text-xs text-on-surface-variant mt-1">+ Benefits (if applicable)</p>
                )}
            </div>
            <button 
                onClick={handleShare}
                className="p-2 text-outline hover:text-primary transition-colors tooltip tooltip-left"
                data-tip="Copy link"
            >
                <Copy className="h-5 w-5" />
            </button>
        </div>

        <div className="space-y-4">
            <button 
                onClick={onApply}
                disabled={isApplied}
                className={`w-full py-4 font-headline font-bold rounded-full shadow-sm transition-all duration-200 ${
                    isApplied 
                    ? 'bg-secondary-fixed text-on-secondary-fixed cursor-default shadow-none'
                    : 'gradient-btn text-on-primary hover:scale-[1.02] active:scale-95 shadow-primary/20'
                }`}
            >
                {isApplied ? 'Applied ✓' : 'Apply Now'}
            </button>
            <button 
                onClick={onSave}
                className={`w-full py-4 text-on-surface font-headline font-bold rounded-full transition-colors flex items-center justify-center gap-2 border ${
                    isSaved ? 'bg-primary/10 border-primary text-primary' : 'bg-surface border-outline hover:bg-surface-container-low text-outline'
                }`}
            >
                {isSaved ? <BookmarkCheck className="h-5 w-5" /> : <Bookmark className="h-5 w-5" />}
                {isSaved ? 'Saved' : 'Save for later'}
            </button>
        </div>

        {isApplied && (
            <div className="mt-6 bg-tertiary-container/30 border border-tertiary-container rounded-lg p-4 text-center">
                <div className="flex items-center justify-center gap-2 text-on-tertiary-container font-medium text-sm">
                    <span className="material-symbols-outlined text-[20px]" style={{fontVariationSettings: "'FILL' 1"}}>check_circle</span>
                    Application submitted successfully
                </div>
            </div>
        )}
    </div>
  );
};
