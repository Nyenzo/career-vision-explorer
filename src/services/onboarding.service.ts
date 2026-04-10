import { OnboardingData } from "@/components/onboarding/types";
import { profileService } from "./profile.service";
import { ProfileUpdate } from "@/types/api";
import { apiClient } from "../lib/api-client";

export async function submitOnboardingData(
  data: OnboardingData, 
  signupData?: any,
  userRole: 'jobseeker' | 'employer' | 'freelancer' = 'jobseeker'
) {
  try {
    // Map the onboarding data to the profile update format
    const profileData: ProfileUpdate = {
      // Parse skills from comma-separated string to array
      skills: data.skills ? data.skills.split(',').map(s => s.trim()).filter(Boolean) : [],
      location: data.location,
      // Map salary expectations to actual range strings
      salary_expectation: mapSalaryRange(data.salaryExpectations),
      // Map work preference to job type
      preferred_job_type: mapWorkPreference(data.workPreference) as ProfileUpdate['preferred_job_type'],
      // Store career goals in bio
      bio: data.careerGoals,
      // Set availability for job seekers
      availability: userRole === 'jobseeker' ? 'Available' : undefined,
    };

    // Include role-specific fields from signup if available
    if (signupData) {
      // For freelancers
      if (userRole === 'freelancer') {
        if (signupData.professionalTitle) {
          // Store professional title in bio or education field
          profileData.bio = `${signupData.professionalTitle}. ${profileData.bio || ''}`;
        }
        if (signupData.portfolioUrl) {
          profileData.portfolio_url = signupData.portfolioUrl;
        }
      }
    }

    // If the user is an employer, add/update company details
    if (userRole === 'employer' && (signupData || data.companyName)) {
      const companyData = {
        name: data.companyName || signupData?.companyName,
        website: data.website || signupData?.companyWebsite,
        industry: data.industry || signupData?.industry,
        size: data.companySize,
        culture: data.culture,
        benefits: data.benefits,
        work_arrangement: data.workArrangement,
        logo: data.companyLogo,
      };
      
      try {
        await profileService.updateCompanyProfile(companyData);
      } catch (companyError) {
        console.error('Failed to update company profile:', companyError);
        // Continue with user profile update even if company update fails
      }
    }

    // Update the user profile with the onboarding data
    const response = await profileService.updateProfile(profileData);
    
    // If there's a video introduction, handle it separately
    if (data.videoIntroduction) {
      try {
        await uploadVideoIntro(data.videoIntroduction);
        console.log('Video introduction uploaded successfully');
      } catch (error) {
        console.error('Failed to upload video introduction:', error);
        // Continue with profile update even if video upload fails
      }
    }

    return response;
  } catch (error) {
    console.error('Failed to submit onboarding data:', error);
    throw error;
  }
}

function mapSalaryRange(range: string): string {
  const salaryMap: Record<string, string> = {
    'entry': '$40,000 - $60,000',
    'mid': '$60,000 - $100,000',
    'senior': '$100,000 - $150,000',
    'executive': '$150,000+',
    '': 'Not specified'
  };
  return salaryMap[range] || 'Not specified';
}

function mapWorkPreference(preference: string): string {
  const preferenceMap: Record<string, string> = {
    'remote': 'Remote',
    'in-person': 'Full-time', // Map to Full-time as On-site is not a valid job type
    'hybrid': 'Remote', // Map hybrid to Remote as Hybrid is not a valid job type
    '': 'Full-time' // Default to Full-time
  };
  return preferenceMap[preference] || 'Full-time';
}

async function uploadVideoIntro(videoFile: File): Promise<void> {
  const formData = new FormData();
  formData.append('video', videoFile);
  
  try {
    const response = await apiClient.post('/profile/upload-video-intro', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    if (response.data.status === 'success') {
      console.log('Video uploaded successfully:', response.data.video_url);
    } else {
      throw new Error('Video upload failed');
    }
  } catch (error) {
    console.error('Video upload error:', error);
    throw error;
  }
}
