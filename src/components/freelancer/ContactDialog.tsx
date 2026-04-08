import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Send } from "lucide-react";
import { FreelancerPricing } from "@/types/freelancer";
import { toast } from "sonner";

interface ContactDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  freelancerName: string;
  pricing?: FreelancerPricing;
  initialSelectedTier?: "basic" | "standard" | "premium";
  onSendMessage: (data: {
    selectedTier?: string;
    tierPrice?: number;
    message: string;
  }) => Promise<void>;
}

export const ContactDialog = ({
  open,
  onOpenChange,
  freelancerName,
  pricing,
  initialSelectedTier,
  onSendMessage
}: ContactDialogProps) => {
  const [selectedTier, setSelectedTier] = useState<string>("");
  const [message, setMessage] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (open) {
      setSelectedTier(initialSelectedTier || "");
    }
  }, [open, initialSelectedTier]);

  const handleSend = async () => {
    if (!message.trim()) {
      toast.error("Please enter a message");
      return;
    }

    setIsLoading(true);
    try {
      let tierPrice: number | undefined;

      if (selectedTier && pricing) {
        const packageKey = `${selectedTier}_package` as keyof FreelancerPricing;
        const selectedPackage = pricing[packageKey];
        if (selectedPackage && typeof selectedPackage === 'object' && 'price' in selectedPackage) {
          tierPrice = selectedPackage.price;
        }
      }

      await onSendMessage({
        selectedTier: selectedTier || undefined,
        tierPrice,
        message: message.trim()
      });

      toast.success("Message sent successfully!");
      setMessage("");
      setSelectedTier("");
      onOpenChange(false);
    } catch (error) {
      toast.error("Failed to send message");
    } finally {
      setIsLoading(false);
    }
  };

  const renderPackageOption = (type: 'basic' | 'standard' | 'premium') => {
    const packageKey = `${type}_package` as keyof FreelancerPricing;
    const pkg = pricing?.[packageKey];

    if (!pkg || typeof pkg !== 'object') return null;

    const isPopular = type === 'standard';

    return (
      <div className="relative">
        {isPopular && (
          <span className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white text-xs px-2 py-0.5 rounded-full">
            Most Popular
          </span>
        )}
        <div
          className={`
            border rounded-lg p-4 cursor-pointer transition-all
            ${selectedTier === type ? 'border-blue-500 bg-blue-50 dark:bg-blue-950' : 'border-gray-200 dark:border-gray-700'}
            ${isPopular ? 'shadow-sm' : ''}
          `}
          onClick={() => setSelectedTier(type)}
        >
          <RadioGroupItem value={type} className="sr-only" />
          <div className="flex justify-between items-start mb-2">
            <div>
              <h4 className="font-semibold capitalize">{type}</h4>
              {'name' in pkg && <p className="text-sm text-gray-600 dark:text-gray-400">{pkg.name}</p>}
            </div>
            {'price' in pkg && (
              <span className="text-xl font-bold">${pkg.price}</span>
            )}
          </div>
          {'description' in pkg && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">{pkg.description}</p>
          )}
        </div>
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[calc(100vw-1.5rem)] max-w-2xl max-h-[90vh] overflow-hidden p-0">
        <div className="overflow-y-auto px-4 py-4 sm:px-6 sm:py-6">
          <DialogHeader>
            <DialogTitle>Send a Message</DialogTitle>
            <DialogDescription>
              Contact {freelancerName} about your project requirements
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 mt-4">
            {/* Service Tier Selection */}
            {pricing && (pricing.basic_package || pricing.standard_package || pricing.premium_package) && (
              <div className="space-y-3">
                <Label>Select a service tier (optional)</Label>
                <RadioGroup value={selectedTier} onValueChange={setSelectedTier}>
                  <div className="space-y-3">
                    {renderPackageOption('basic')}
                    {renderPackageOption('standard')}
                    {renderPackageOption('premium')}
                  </div>
                </RadioGroup>
              </div>
            )}

            {/* Message Input */}
            <div className="space-y-2">
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                placeholder="Describe your project requirements..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={6}
                className="resize-none"
              />
              <p className="text-xs text-gray-500">
                {message.length}/1000 characters
              </p>
            </div>

            {/* Send Button */}
            <Button
              onClick={handleSend}
              disabled={!message.trim() || isLoading}
              className="w-full"
              size="lg"
            >
              <Send className="w-4 h-4 mr-2" />
              {isLoading ? "Sending..." : "Send Message"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
