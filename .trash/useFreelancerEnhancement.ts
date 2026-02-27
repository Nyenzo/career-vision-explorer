import { useState } from 'react';
import { freelancerService } from '@/services/freelancer.service';
import { toast } from 'sonner';

export function useFreelancerEnhancement() {
  const [isEnhancing, setIsEnhancing] = useState(false);

  const enhanceFreelancerProfile = async (freelancerId: string) => {
    setIsEnhancing(true);
    try {
      // Call the auto-enhance endpoint
      const response = await freelancerService.autoEnhanceProfile(freelancerId);
      toast.success('Profile enhanced successfully!');
      return response;
    } catch (error) {
      console.error('Error enhancing profile:', error);
      toast.error('Failed to enhance profile');
      throw error;
    } finally {
      setIsEnhancing(false);
    }
  };

  const checkAndEnhanceIfNeeded = async (freelancer: any) => {
    // Check if profile needs enhancement
    const needsEnhancement = 
      freelancer.title === 'New Freelancer' || 
      !freelancer.skills || 
      freelancer.skills.length === 0 ||
      !freelancer.location;

    if (needsEnhancement) {
      try {
        const enhanced = await enhanceFreelancerProfile(freelancer.freelancer_id);
        return enhanced;
      } catch (error) {
        console.warn('Auto-enhancement failed, continuing with original data');
        return freelancer;
      }
    }

    return freelancer;
  };

  return {
    enhanceFreelancerProfile,
    checkAndEnhanceIfNeeded,
    isEnhancing
  };
}
