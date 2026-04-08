
import { Progress } from "@/components/ui/progress";

interface ProgressIndicatorProps {
  progress: number;
}

export const ProgressIndicator = ({ progress }: ProgressIndicatorProps) => {
  return (
    <div className="mt-2 mb-4">
      <Progress value={progress} className="h-1" aria-label={`Onboarding progress: ${Math.round(progress)}% complete`} />
      <div className="flex justify-between mt-1 text-xs text-gray-500">
        <span>Getting Started</span>
        <span>Profile Complete</span>
      </div>
    </div>
  );
};
