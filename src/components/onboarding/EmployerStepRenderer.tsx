import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent } from "@/components/ui/card";
import { Briefcase, Globe, Users, Smile, Building, Image, Upload } from "lucide-react";
import { TypingQuestion } from "./steps/TypingQuestion";

interface EmployerStepRendererProps {
  currentStep: number;
  data: any;
  updateField: (field: string, value: any) => void;
  handleNext: () => void;
  handleLogoUpload: (file: File) => void;
}

export const EmployerStepRenderer = ({
  currentStep,
  data,
  updateField,
  handleNext,
  handleLogoUpload,
}: EmployerStepRendererProps) => {
  const steps = [
    // Step 0: Company Information
    () => (
      <TypingQuestion 
        question="Tell us about your company"
        icon={<Building className="w-8 h-8 text-blue-500" />}
        typingSpeed={30}
      >
        <div className="space-y-4">
          <Label>Company Name</Label>
          <Input
            placeholder="e.g., Tech Innovators Inc."
            value={data.companyName || ""}
            onChange={(e) => updateField("companyName", e.target.value)}
          />
          <Label>Website (Optional)</Label>
          <Input
            type="url"
            placeholder="https://yourcompany.com"
            value={data.website || ""}
            onChange={(e) => updateField("website", e.target.value)}
          />
          <Label>Industry</Label>
          <Input
            placeholder="e.g., Software Development"
            value={data.industry || ""}
            onChange={(e) => updateField("industry", e.target.value)}
          />
          <Label>Company Size</Label>
          <Input
            placeholder="e.g., 50-100"
            value={data.companySize || ""}
            onChange={(e) => updateField("companySize", e.target.value)}
          />
        </div>
      </TypingQuestion>
    ),
    // Step 1: Hiring Needs
    () => (
      <TypingQuestion 
        question="What are your hiring needs?"
        icon={<Users className="w-8 h-8 text-green-500" />}
        typingSpeed={30}
      >
        <div className="space-y-4">
          <Label>Positions to Fill</Label>
          <Textarea
            placeholder="e.g., Backend Developer, UX Designer"
            value={data.positions || ""}
            onChange={(e) => updateField("positions", e.target.value)}
            rows={3}
          />
          <Label>Team Size</Label>
          <Input
            placeholder="e.g., 5-10"
            value={data.teamSize || ""}
            onChange={(e) => updateField("teamSize", e.target.value)}
          />
          <Label>Hiring Timeline</Label>
          <Input
            placeholder="e.g., Within 3 months"
            value={data.hiringTimeline || ""}
            onChange={(e) => updateField("hiringTimeline", e.target.value)}
          />
        </div>
      </TypingQuestion>
    ),
    // Step 2: Company Culture and Values
    () => (
      <TypingQuestion 
        question="What's your company culture like?"
        icon={<Smile className="w-8 h-8 text-yellow-500" />}
        typingSpeed={30}
      >
        <div className="space-y-4">
          <Label>Describe Your Culture and Values</Label>
          <Textarea
            placeholder="e.g., Innovation-driven, open communication, work-life balance..."
            value={data.culture || ""}
            onChange={(e) => updateField("culture", e.target.value)}
            rows={4}
          />
        </div>
      </TypingQuestion>
    ),
    // Step 3: Work Arrangements
    () => (
      <TypingQuestion 
        question="What work arrangements do you offer?"
        icon={<Globe className="w-8 h-8 text-purple-500" />}
        typingSpeed={30}
      >
        <div className="space-y-4">
          <Label>Work Arrangements</Label>
          <RadioGroup value={data.workArrangement || "remote"} onValueChange={(value) => updateField("workArrangement", value)}>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="remote" id="arrangement1" />
              <Label htmlFor="arrangement1">Remote - Work from anywhere</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="hybrid" id="arrangement2" />
              <Label htmlFor="arrangement2">Hybrid - Mix of remote and office</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="onsite" id="arrangement3" />
              <Label htmlFor="arrangement3">On-site - Office based work</Label>
            </div>
          </RadioGroup>
        </div>
      </TypingQuestion>
    ),
    // Step 4: Benefits and Perks Offered
    () => (
      <TypingQuestion 
        question="What benefits and perks do you offer?"
        icon={<Smile className="w-8 h-8 text-pink-500" />}
        typingSpeed={30}
      >
        <div className="space-y-4">
          <Label>Benefits and Perks</Label>
          <Textarea
            placeholder="e.g., Health insurance, flexible hours, gym membership, professional development..."
            value={data.benefits || ""}
            onChange={(e) => updateField("benefits", e.target.value)}
            rows={4}
          />
        </div>
      </TypingQuestion>
    ),
    // Step 5: Company Logo Upload
    () => (
      <TypingQuestion 
        question="Would you like to upload your company logo?"
        icon={<Image className="w-8 h-8 text-indigo-500" />}
        typingSpeed={30}
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            A company logo helps give your job postings a professional appearance and builds trust with candidates.
          </p>

          {!data.companyLogo && (
            <div className="flex justify-center">
              <Button variant="outline" asChild>
                <label className="flex items-center gap-2 cursor-pointer">
                  <Upload className="w-4 h-4" />
                  Upload Logo
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleLogoUpload(file);
                    }}
                  />
                </label>
              </Button>
            </div>
          )}

          {data.companyLogo && (
            <Card className="border-blue-200 bg-blue-50">
              <CardContent className="pt-4">
                <div className="text-center space-y-2">
                  <img src={data.companyLogo} alt="Company Logo" className="h-20 mx-auto rounded" />
                  <p className="text-blue-800 font-medium">Logo uploaded successfully!</p>
                  <Button 
                    variant="link" 
                    onClick={() => updateField("companyLogo", null)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    Upload a different logo
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </TypingQuestion>
    )
  ];

  const StepComponent = steps[currentStep];

  // Safety check to prevent out of bounds access
  if (!StepComponent) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <StepComponent />
    </div>
  );
};