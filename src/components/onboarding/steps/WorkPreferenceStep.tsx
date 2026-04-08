
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { WorkPreference } from "../types";
import { TypingQuestion } from "./TypingQuestion";


interface WorkPreferenceStepProps {
  value: WorkPreference;
  onChange: (value: WorkPreference) => void;
}

export const WorkPreferenceStep = ({ value, onChange }: WorkPreferenceStepProps) => {
  return (
    <div className="space-y-4">
      <TypingQuestion
        question="What's your preferred work style?"
        typingSpeed={25}>
      <h3 className="text-lg font-medium">What's your preferred work style?</h3>
      <Select
        value={value || "remote"}
        onValueChange={(value) => onChange(value as WorkPreference)}
      >
        <SelectTrigger>
          <SelectValue placeholder="Select work preference" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="remote">Remote</SelectItem>
          <SelectItem value="in-person">In-Person</SelectItem>
          <SelectItem value="hybrid">Hybrid</SelectItem>
        </SelectContent>
      </Select>
      </TypingQuestion>
    </div>
  );
};
