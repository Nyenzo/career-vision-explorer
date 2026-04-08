
import { Textarea } from "@/components/ui/textarea";
import { TypingQuestion } from "./TypingQuestion";

interface CareerGoalsStepProps {
  value: string;
  onChange: (value: string) => void;
}

export const CareerGoalsStep = ({ value, onChange }: CareerGoalsStepProps) => {
  return (
    <div className="space-y-4">
      <TypingQuestion
        question="What are your career goals?"
        typingSpeed={25}
        >
      <h3 className="text-lg font-medium">What are your career goals?</h3>
      <Textarea
        placeholder="I'm looking to advance my career in software development with a focus on machine learning and AI..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="min-h-[120px]"
      />
      </TypingQuestion>
    </div>
  );
};
