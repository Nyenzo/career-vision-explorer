import { Button } from "@/components/ui/button";
import { Linkedin } from "lucide-react";
import { toast } from "sonner";
import { TypingQuestion } from "./TypingQuestion";

interface LinkedInImportStepProps {
  onImport: (data: any) => void;
  onSkip: () => void;
}

export const LinkedInImportStep = ({ onImport, onSkip }: LinkedInImportStepProps) => {
  const handleImportClick = () => {
    // In a real app, this would open LinkedIn OAuth flow
    toast.info("Connecting to LinkedIn", {
      description: "Please authorize Visiondrill to access your LinkedIn profile"
    });
    
    // Simulate successful import after 1.5 seconds
    setTimeout(() => {
      const mockLinkedInData = {
        name: "Jane Doe",
        title: "Software Developer",
        skills: ["JavaScript", "React", "Node.js"],
        education: ["BSc Computer Science, University of Nairobi"],
        experience: [
          {
            company: "Tech Solutions Inc",
            role: "Junior Developer",
            duration: "2 years"
          }
        ]
      };
      
      onImport(mockLinkedInData);
    }, 1500);
  };
  
  return (
    <TypingQuestion 
      question="Would you like to import your LinkedIn profile?"
      icon={<Linkedin className="w-8 h-8 text-[#0077B5]" />}
      typingSpeed={25}
    >
      <div className="space-y-4">
        <p className="text-sm text-gray-500">
          This will help us pre-fill your profile information and provide more accurate job recommendations.
        </p>
        
        <div className="flex flex-col gap-3">
          <Button 
            onClick={handleImportClick} 
            className="bg-[#0077B5] hover:bg-[#0077B5]/90"
          >
            <Linkedin className="mr-2 h-4 w-4" />
            Import from LinkedIn
          </Button>
          <Button 
            variant="outline" 
            onClick={onSkip}
          >
            Skip, I'll enter details manually
          </Button>
        </div>
      </div>
    </TypingQuestion>
  );
};