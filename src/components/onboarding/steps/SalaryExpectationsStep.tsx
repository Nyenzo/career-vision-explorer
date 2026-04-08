import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { SalaryRange } from "../types";
import { TypingQuestion } from './TypingQuestion';
import { DollarSign } from "lucide-react";

interface SalaryExpectationsStepProps {
  value: SalaryRange;
  onChange: (value: SalaryRange) => void;
  data?: any;
  updateField?: (field: string, value: any) => void;
}

export const SalaryExpectationsStep = ({ value, onChange, data, updateField }: SalaryExpectationsStepProps) => {
  return (
    <TypingQuestion
      question="What are your salary expectations and rates?"
      icon={<DollarSign className="w-8 h-8 text-green-500" />}
      typingSpeed={25}
    >
      <div className="space-y-6">
        {/* Salary Range Selection */}
        <div className="space-y-2">
          <Label>Expected Salary Range</Label>
          <Select
            value={value || "entry"}
            onValueChange={(value) => onChange(value as SalaryRange)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select salary range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="entry">Entry Level (30K-50K KES/month)</SelectItem>
              <SelectItem value="mid">Mid Level (50K-100K KES/month)</SelectItem>
              <SelectItem value="senior">Senior Level (100K-200K KES/month)</SelectItem>
              <SelectItem value="executive">Executive Level (200K+ KES/month)</SelectItem>
            </SelectContent>
          </Select>
        </div>
    

        {/* Hourly Rate for Freelance/Contract Work */}
        
          <div className="space-y-2">
            <Label>Hourly Rate  Work (USD) - Optional</Label>
            <Input
              type="number"
              placeholder="e.g., 2500"
              value={data?.hourlyRate || ""}
              onChange={(e) => updateField("hourlyRate", e.target.value ? Number(e.target.value) : "")}
            />
            <p className="text-sm text-gray-500">For project-based or contract opportunities</p>
          </div>
        


        


        {/* Hours per week */}
       
          <div className="space-y-2">
            <Label>How many hours per week are you available?</Label>
            <Select
              value={data?.hoursPerWeek || ""}
              onValueChange={(value) => updateField("hoursPerWeek", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select hours per week" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10-20">10-20 hours/week</SelectItem>
                <SelectItem value="20-30">20-30 hours/week</SelectItem>
                <SelectItem value="30-40">30-40 hours/week</SelectItem>
                <SelectItem value="40+">40+ hours/week</SelectItem>
                <SelectItem value="flexible">Flexible based on project</SelectItem>
              </SelectContent>
            </Select>
          </div>


    

       
      </div>
    </TypingQuestion>
  );
};