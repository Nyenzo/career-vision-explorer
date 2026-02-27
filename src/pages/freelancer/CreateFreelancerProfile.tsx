import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { X, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { freelancerService } from '@/services/freelancer.service';
import { toast } from 'sonner';
import Layout from '@/components/layout/Layout';
import type { Freelancer } from '@/types/freelancer';

export default function CreateFreelancerProfile() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, profile } = useAuth();

  // Determine mode from route path
  const isEditMode = location.pathname.includes('edit-profile');

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEditMode);
  const [existingProfile, setExistingProfile] = useState<Freelancer | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    bio: '',
    hourly_rate: '',
    skills: [] as string[],
    experience_years: 0,
    portfolio_url: '',
    location: profile?.location || '',
    languages: ['English'] as string[],
    available_for_hire: true,
  });
  const [skillInput, setSkillInput] = useState('');
  const [languageInput, setLanguageInput] = useState('');

  // Load existing freelancer profile when in edit mode
  useEffect(() => {
    const loadExistingProfile = async () => {
      if (!user?.user_id) return;
      try {
        setFetching(true);
        const existing = await freelancerService.getFreelancerByUserId(user.user_id);
        setExistingProfile(existing);
        setFormData({
          title: existing.title || '',
          bio: existing.bio || '',
          hourly_rate: existing.hourly_rate ? String(existing.hourly_rate) : '',
          skills: existing.skills || [],
          experience_years: existing.experience_years || 0,
          portfolio_url: existing.portfolio_url || '',
          location: existing.location || profile?.location || '',
          languages: existing.languages?.length ? existing.languages : ['English'],
          available_for_hire: existing.available_for_hire ?? true,
        });
      } catch (error: any) {
        if (isEditMode) {
          toast.info('No existing freelancer profile found. You can create one below.');
        }
      } finally {
        setFetching(false);
      }
    };

    if (isEditMode) {
      loadExistingProfile();
    }
  }, [user?.user_id, isEditMode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.bio) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      
      const payload = {
        title: formData.title,
        bio: formData.bio,
        hourly_rate: formData.hourly_rate ? parseFloat(formData.hourly_rate) : undefined,
        skills: [...new Set([...formData.skills])],
        experience_years: formData.experience_years,
        portfolio_url: formData.portfolio_url || undefined,
        available_for_hire: formData.available_for_hire,
        location: formData.location || undefined,
        languages: formData.languages,
      };

      if (existingProfile?.freelancer_id) {
        // ── Update existing profile ──
        await freelancerService.updateFreelancer(existingProfile.freelancer_id, payload);
        toast.success('Freelancer profile updated successfully!');
      } else {
        // ── Create new profile ──
        const newProfile = await freelancerService.createFreelancer(payload as any);
        if (newProfile.freelancer_id) {
          try {
            await freelancerService.syncPortfolio(newProfile.freelancer_id);
          } catch (syncError) {
            console.error('Portfolio sync failed:', syncError);
          }
        }
        toast.success('Freelancer profile created successfully!');
      }

      navigate('/freelancer/dashboard');
    } catch (error: any) {
      console.error('Error saving freelancer profile:', error);
      toast.error(error.message || 'Failed to save freelancer profile');
    } finally {
      setLoading(false);
    }
  };

  const addSkill = () => {
    if (skillInput.trim() && !formData.skills.includes(skillInput.trim())) {
      setFormData({ ...formData, skills: [...formData.skills, skillInput.trim()] });
      setSkillInput('');
    }
  };

  const removeSkill = (skill: string) => {
    setFormData({ ...formData, skills: formData.skills.filter(s => s !== skill) });
  };

  const addLanguage = () => {
    if (languageInput.trim() && !formData.languages.includes(languageInput.trim())) {
      setFormData({ ...formData, languages: [...formData.languages, languageInput.trim()] });
      setLanguageInput('');
    }
  };

  const removeLanguage = (language: string) => {
    if (formData.languages.length > 1) { // Keep at least one language
      setFormData({ ...formData, languages: formData.languages.filter(l => l !== language) });
    }
  };

  const pageTitle = existingProfile ? 'Edit Your Freelancer Profile' : 'Create Your Freelancer Profile';
  const pageDescription = existingProfile
    ? 'Update your freelancer profile details'
    : 'Set up your freelancer profile to start offering your services';
  const submitLabel = loading
    ? (existingProfile ? 'Saving...' : 'Creating...')
    : (existingProfile ? 'Save Changes' : 'Create Profile');

  if (fetching) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <p className="text-sm text-gray-500">Loading your profile...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="container mx-auto px-4 max-w-2xl">
          <Card>
            <CardHeader>
              <CardTitle>{pageTitle}</CardTitle>
              <CardDescription>{pageDescription}</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Title */}
                <div>
                  <Label htmlFor="title">Professional Title*</Label>
                  <Input
                    id="title"
                    placeholder="e.g., Full Stack Developer, UI/UX Designer"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                </div>

                {/* Bio */}
                <div>
                  <Label htmlFor="bio">Professional Bio*</Label>
                  <Textarea
                    id="bio"
                    placeholder="Describe your experience, skills, and what you can offer to clients..."
                    rows={5}
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    required
                  />
                </div>

                {/* Hourly Rate */}
                <div>
                  <Label htmlFor="hourly_rate">Hourly Rate ($)</Label>
                  <Input
                    id="hourly_rate"
                    type="number"
                    placeholder="e.g., 50"
                    value={formData.hourly_rate}
                    onChange={(e) => setFormData({ ...formData, hourly_rate: e.target.value })}
                  />
                </div>

                {/* Experience Years */}
                <div>
                  <Label htmlFor="experience_years">Years of Experience</Label>
                  <Input
                    id="experience_years"
                    type="number"
                    min="0"
                    value={formData.experience_years}
                    onChange={(e) => setFormData({ ...formData, experience_years: parseInt(e.target.value) || 0 })}
                  />
                </div>

                {/* Available for hire */}
                <div className="flex items-center gap-3">
                  <input
                    id="available_for_hire"
                    type="checkbox"
                    checked={formData.available_for_hire}
                    onChange={(e) => setFormData({ ...formData, available_for_hire: e.target.checked })}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <Label htmlFor="available_for_hire" className="cursor-pointer">Available for hire</Label>
                </div>

                {/* Skills */}
                <div>
                  <Label>Skills</Label>
                  <div className="flex gap-2 mb-2">
                    <Input
                      placeholder="Add a skill"
                      value={skillInput}
                      onChange={(e) => setSkillInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                    />
                    <Button type="button" onClick={addSkill} variant="outline">
                      Add
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.skills.map((skill) => (
                      <Badge key={skill} variant="default">
                        {skill}
                        <button
                          type="button"
                          onClick={() => removeSkill(skill)}
                          className="ml-2"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Languages */}
                <div>
                  <Label>Languages</Label>
                  <div className="flex gap-2 mb-2">
                    <Input
                      placeholder="Add a language"
                      value={languageInput}
                      onChange={(e) => setLanguageInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addLanguage())}
                    />
                    <Button type="button" onClick={addLanguage} variant="outline">
                      Add
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.languages.map((language) => (
                      <Badge key={language} variant="default">
                        {language}
                        {formData.languages.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeLanguage(language)}
                            className="ml-2"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        )}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Location */}
                <div>
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    placeholder="e.g., New York, NY"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  />
                </div>

                {/* Portfolio URL */}
                <div>
                  <Label htmlFor="portfolio_url">Portfolio URL</Label>
                  <Input
                    id="portfolio_url"
                    type="url"
                    placeholder="https://your-portfolio.com"
                    value={formData.portfolio_url}
                    onChange={(e) => setFormData({ ...formData, portfolio_url: e.target.value })}
                  />
                </div>

                {/* Submit Buttons */}
                <div className="flex gap-3">
                  <Button
                    type="submit"
                    disabled={loading}
                    className="flex-1"
                  >
                    {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    {submitLabel}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate(-1)}
                    disabled={loading}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
