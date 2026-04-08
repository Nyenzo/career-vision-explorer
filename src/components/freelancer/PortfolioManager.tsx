import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Freelancer } from "@/types/freelancer";
import { freelancerService } from "@/services/freelancer.service";
import { toast } from "sonner";

interface PortfolioProps {
  freelancerId: string;
}

export default function PortfolioManager({ freelancerId }: PortfolioProps) {
  const [loading, setLoading] = useState(false);
  const [portfolioItems, setPortfolioItems] = useState<
    Freelancer["portfolio_items"]
  >([]);

  useEffect(() => {
    loadPortfolio();
  }, [freelancerId]);

  const loadPortfolio = async () => {
    try {
      setLoading(true);
      const freelancer = await freelancerService.getFreelancer(freelancerId);

      // ✅ Ensure no duplicates
      const uniqueItems = (freelancer.portfolio_items || []).filter(
        (item, index, self) => index === self.findIndex((p) => p.id === item.id)
      );

      setPortfolioItems(uniqueItems);
    } catch (error) {
      console.error("Error loading portfolio:", error);
      toast.error("Failed to load portfolio.");
    } finally {
      setLoading(false);
    }
  };

  const handleSyncPortfolio = async () => {
    try {
      setLoading(true);
      const result = await freelancerService.syncPortfolio(freelancerId);
      toast.success(result.message);
      await loadPortfolio(); // ✅ reload without duplicating
    } catch (error) {
      console.error("Error syncing portfolio:", error);
      toast.error("Failed to sync portfolio.");
    } finally {
      setLoading(false);
    }
  };

  const handleEnhanceImages = async () => {
    try {
      setLoading(true);
      const result = await freelancerService.enhancePortfolioImages(
        freelancerId
      );
      toast.success(result.message);
      await loadPortfolio(); // ✅ reload without duplicating
    } catch (error) {
      console.error("Error enhancing images:", error);
      toast.error("Failed to enhance images.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="mb-8">
      <div className="flex justify-between items-center mb-4 px-4 py-2">
        <h2 className="text-lg font-medium">Portfolio</h2>
        <div>
          <Button
            onClick={handleSyncPortfolio}
            disabled={loading}
            variant="outline"
          >
            Sync Portfolio
          </Button>
          <Button
            onClick={handleEnhanceImages}
            disabled={loading}
            className="ml-2"
          >
            Enhance Images
          </Button>
        </div>
      </div>
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 px-4 pb-4">
        {portfolioItems.map((item) => (
          <div
            key={item.id}
            className="bg-white shadow overflow-hidden sm:rounded-lg"
          >
            <img
              src={item.image_url}
              alt={item.title}
              className="w-full h-48 object-cover"
            />
            <div className="p-4">
              <h3 className="text-xl font-semibold">{item.title}</h3>
              <p className="mt-2 text-sm text-gray-600">{item.description}</p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
