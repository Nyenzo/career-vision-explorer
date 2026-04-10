import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PricingManager } from "./PricingManager";
import { FreelancerPricing } from "@/types/freelancer";

interface PricingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentHourlyRate?: number;
  currentPricing?: FreelancerPricing;
  onSave: (data: any) => Promise<void>;
}

export const PricingDialog = ({
  open,
  onOpenChange,
  currentHourlyRate,
  currentPricing,
  onSave
}: PricingDialogProps) => {
  const handleSave = async (data: any) => {
    await onSave(data);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Manage Your Pricing</DialogTitle>
          <DialogDescription>
            Set your hourly rate and create service packages to showcase your offerings
          </DialogDescription>
        </DialogHeader>
        <PricingManager
          currentHourlyRate={currentHourlyRate}
          currentPricing={currentPricing}
          onSave={handleSave}
        />
      </DialogContent>
    </Dialog>
  );
};
