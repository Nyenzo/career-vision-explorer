
import { Input } from "@/components/ui/input";
import  { TypingQuestion} from './TypingQuestion'

interface LocationStepProps {
  value: string;
  onChange: (value: string) => void;
}

export const LocationStep = ({ value, onChange }: LocationStepProps) => {
  return (
    <div className="space-y-4">
      <TypingQuestion
        question="What's your preferred location?"
        typingSpeed={25}>
      <h3 className="text-lg font-medium">What's your preferred location?</h3>
      <Input
        placeholder="Nairobi, Kenya"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      </TypingQuestion>
    </div>
  );
};
