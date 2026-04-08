import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import {
  MapPin,
  DollarSign,
  Star,
  Briefcase,
  TrendingUp,
  Filter,
  Sparkles,
  Heart,
  ExternalLink
} from 'lucide-react';
import { jobsService } from '@/services/jobs.service';
import { enhancedAIService } from '@/services/enhanced-ai.service';
import { aiJobMatchingService } from '@/services/ai-job-matching.service';
import { jobMatchingService } from '@/services/job-matching.service';
import { useAuth } from '@/hooks/use-auth';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

import { Job } from '@/types/api';

interface JobMatch {
  job_id: string;
  title: string;
  company: string;
  location: string;
  salary_range?: string;
  match_score: number;
  matched_skills: string[];
  created_at: string;
}

interface JobRecommendation extends Job {
  reasons: string[];
  match_score: number;
}

const AIJobRecommendations: React.FC = () => {
  const { user, profile, isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [skillBasedJobs, setSkillBasedJobs] = useState<JobMatch[]>([]);
  const [aiRecommendations, setAiRecommendations] = useState<JobRecommendation[]>([]);
  const [aiSearchResults, setAiSearchResults] = useState<JobMatch[]>([]);
  const [searchPreferences, setSearchPreferences] = useState({
    location: '',
    salary_expectation: '',
    skills: [] as string[]
  });
  const [newSkill, setNewSkill] = useState('');
  const [activeTab, setActiveTab] = useState('skills');
  const effectiveRole = profile?.active_role || user?.account_type;

  useEffect(() => {
    if (isAuthenticated && effectiveRole === 'job_seeker' && profile) {
      // Set preferences from profile but don't auto-load
      setSearchPreferences(prev => ({
        ...prev,
        location: profile.location || prev.location,
        salary_expectation: profile.salary_expectation || prev.salary_expectation,
        skills: profile.skills?.length ? profile.skills : prev.skills,
      }));
    }
  }, [isAuthenticated, effectiveRole, profile]);

  const loadSkillBasedRecommendations = async () => {
    try {
      setIsLoading(true);
      const skillBasedMatches = await jobsService.searchJobsBySkills();
      setSkillBasedJobs(skillBasedMatches);
    } catch (error) {
      console.error('Failed to load skill-based recommendations:', error);
      toast.error('Failed to load job recommendations');
    } finally {
      setIsLoading(false);
    }
  };

  const getAIRecommendations = async () => {
    try {
      setIsLoading(true);

      // Use the enhanced AI job matching service for better results
      const enhancedMatches = await aiJobMatchingService.matchJobsWithAI(profile, {
        max_results: 20,
        min_match_score: 60,
        include_stretch_opportunities: true,
        focus_on_skill_growth: true
      });

      if (enhancedMatches.length > 0) {
        // Convert enhanced matches to JobRecommendation format
        const jobRecommendations: JobRecommendation[] = enhancedMatches.map(match => ({
          ...match,
          job_id: match.id,
          skills_required: match.requiredSkills,
          reasons: match.personalized_insights.why_good_fit || ['AI-generated match'],
          created_at: match.postedDate || new Date().toISOString()
        }));

        setAiRecommendations(jobRecommendations);
        console.log('Enhanced AI Recommendations set:', jobRecommendations);
        setActiveTab('ai-recommendations');
        toast.success('AI recommendations generated with enhanced matching!');
        return;
      }

      // Fallback to original enhanced AI service
      const recommendations = await enhancedAIService.getJobRecommendations({
        location: searchPreferences.location || profile?.location,
        salary_range: searchPreferences.salary_expectation || profile?.salary_expectation,
        job_type: 'full-time'
      });

      const recommendationPromises = recommendations.map(async (rec) => {
        try {
          const jobDetails = await jobsService.getJobById(rec.job_id);
          return { ...jobDetails, ...rec };
        } catch (error) {
          console.error(`Failed to fetch details for job ${rec.job_id}:`, error);
          return null;
        }
      });

      const detailedRecommendations = (await Promise.all(recommendationPromises))
        .filter((rec): rec is JobRecommendation => rec !== null);

      if (detailedRecommendations.length < recommendations.length) {
        toast.warning('Some recommended jobs could not be loaded.');
      }

      setAiRecommendations(detailedRecommendations);
      console.log('AI Recommendations set:', detailedRecommendations);
      setActiveTab('ai-recommendations');
      toast.success('AI recommendations generated!');
    } catch (error) {
      console.error('Failed to get AI recommendations:', (error as Error).message);
      toast.error('Failed to generate AI recommendations. Please check the console for more details.');
    } finally {
      setIsLoading(false);
    }
  };

  const searchWithAI = async () => {
    if (searchPreferences.skills.length === 0) {
      toast.error('Please add at least one skill for AI matching');
      return;
    }

    try {
      setIsLoading(true);
      const aiMatches = await jobsService.aiMatchJobs({
        skills: searchPreferences.skills,
        location_preference: searchPreferences.location,
        salary_expectation: searchPreferences.salary_expectation,
      });
      setAiSearchResults(aiMatches);
      setActiveTab('ai-search');
      toast.success('AI job search completed!');
    } catch (error) {
      console.error('AI job search failed:', error);
      toast.error('AI job search failed');
    } finally {
      setIsLoading(false);
    }
  };


  const addSkill = () => {
    if (newSkill.trim() && !searchPreferences.skills.includes(newSkill.trim())) {
      setSearchPreferences(prev => ({
        ...prev,
        skills: [...prev.skills, newSkill.trim()]
      }));
      setNewSkill('');
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setSearchPreferences(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill !== skillToRemove)
    }));
  };

  const savePreferences = async () => {
    try {
      // In a real app, you'd save this to a backend
      toast.success('Preferences saved!');
    } catch (error) {
      toast.error('Failed to save preferences.');
    }
  };

  const getMatchColor = (score: number) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const JobCard: React.FC<{ job: JobMatch | JobRecommendation }> = ({ job }) => {
    const skills = ('matched_skills' in job) ? job.matched_skills : (job as JobRecommendation).skills_required || [];

    return (
      <Card className="hover:shadow-lg transition-shadow duration-200">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-lg font-semibold text-gray-900">
                {job.title}
              </CardTitle>
              <CardDescription className="text-gray-600">
                {job.company}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${getMatchColor(job.match_score)}`} />
              <span className="text-sm font-medium">{job.match_score}% match</span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              <span>{job.location}</span>
            </div>
            {job.salary_range && (
              <div className="flex items-center gap-1">
                <DollarSign className="h-4 w-4" />
                <span>{job.salary_range}</span>
              </div>
            )}
          </div>

          {skills.length > 0 && (
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-2 block">
                Matched Skills
              </Label>
              <div className="flex flex-wrap gap-2">
                {skills.map((skill, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-2">
            <Button size="sm" className="flex-1" onClick={() => handleViewDetails(job)}>
              <ExternalLink className="h-4 w-4 mr-2" />
              View Details
            </Button>
            <Button size="sm" variant="outline">
              <Heart className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  const [selectedJob, setSelectedJob] = React.useState<JobMatch | JobRecommendation | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = React.useState(false);

  const handleViewDetails = (job: JobMatch | JobRecommendation) => {
    setSelectedJob(job);
    setIsViewDialogOpen(true);
  };

  if (isAuthLoading) {
    return (
      <div className="container mx-auto py-8 space-y-6">
        <div className="text-center mb-8">
          <Skeleton className="h-10 w-1/2 mx-auto" />
          <Skeleton className="h-4 w-2/3 mx-auto mt-2" />
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-1/3" />
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-48 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <Card className="text-center py-12">
        <CardContent>
          <Sparkles className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Sign in for Personalized Recommendations
          </h3>
          <p className="text-gray-600 mb-4">
            Get AI-powered job recommendations based on your skills and preferences
          </p>
          <Button onClick={() => navigate('/login', { state: { from: location } })}>Sign In</Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="container mx-auto py-8 space-y-6">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            AI Job Recommendations
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Discover opportunities that match your skills with our advanced AI matching system
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="skills">Skill-Based</TabsTrigger>
            <TabsTrigger value="ai-search">AI Search</TabsTrigger>
            <TabsTrigger value="ai-recommendations">AI Recommendations</TabsTrigger>
            <TabsTrigger value="preferences">Preferences</TabsTrigger>
          </TabsList>

          <TabsContent value="skills" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Jobs Matching Your Skills
                </CardTitle>
                <CardDescription>
                  Based on skills in your profile
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={loadSkillBasedRecommendations}
                  disabled={isLoading}
                  className="mb-4"
                >
                  {isLoading ? 'Loading...' : 'Refresh Recommendations'}
                </Button>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {skillBasedJobs.map((job) => (
                <JobCard key={job.job_id} job={job} />
              ))}
            </div>

            {skillBasedJobs.length === 0 && !isLoading && (
              <Card>
                <CardContent className="text-center py-12">
                  <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No job matches found. Try updating your skills in your profile.</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="ai-search" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5" />
                  AI-Powered Job Search
                </CardTitle>
                <CardDescription>
                  Search with custom skills and preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="location-pref">Location Preference</Label>
                  <Input
                    id="location-pref"
                    placeholder="e.g. New York, Remote, San Francisco"
                    value={searchPreferences.location}
                    onChange={(e) => setSearchPreferences(prev => ({ ...prev, location: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="salary-exp">Salary Expectation</Label>
                  <Input
                    id="salary-exp"
                    placeholder="e.g. $80k-$120k, $100k+"
                    value={searchPreferences.salary_expectation}
                    onChange={(e) => setSearchPreferences(prev => ({ ...prev, salary_expectation: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Skills</Label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add a skill"
                      value={newSkill}
                      onChange={(e) => setNewSkill(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && addSkill()}
                    />
                    <Button onClick={addSkill} variant="outline">Add</Button>
                  </div>

                  {searchPreferences.skills.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {searchPreferences.skills.map((skill) => (
                        <Badge
                          key={skill}
                          variant="secondary"
                          className="cursor-pointer"
                          onClick={() => removeSkill(skill)}
                        >
                          {skill} ×
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                <Button
                  onClick={searchWithAI}
                  disabled={isLoading || searchPreferences.skills.length === 0}
                  className="w-full"
                >
                  {isLoading ? 'Searching...' : 'Search with AI'}
                </Button>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {aiSearchResults.map((job) => (
                <JobCard key={job.job_id} job={job} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="ai-recommendations" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5" />
                  Personalized AI Recommendations
                </CardTitle>
                <CardDescription>
                  Based on your profile and career goals
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={getAIRecommendations}
                  disabled={isLoading}
                  className="mb-4"
                >
                  {isLoading ? 'Generating...' : 'Generate AI Recommendations'}
                </Button>
              </CardContent>
            </Card>

            {aiRecommendations.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {aiRecommendations.map((job) => (
                  <JobCard key={job.job_id} job={job} />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <Sparkles className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">
                    No AI recommendations found at the moment.
                  </p>
                  <p className="text-sm text-gray-500 mt-2">
                    Try updating your profile with more skills for better matches.
                  </p>
                  <p className="text-sm text-gray-500 mt-2">
                    If your profile is complete and you still see no recommendations, the AI service may need review.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="preferences" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Filter className="h-5 w-5" />
                  Search Preferences
                </CardTitle>
                <CardDescription>
                  Customize your job search criteria
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>Preferred Location</Label>
                  <Input
                    placeholder="City, State or Remote"
                    value={searchPreferences.location}
                    onChange={(e) => setSearchPreferences(prev => ({ ...prev, location: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Salary Expectation</Label>
                  <Input
                    placeholder="e.g. $80,000 - $120,000"
                    value={searchPreferences.salary_expectation}
                    onChange={(e) => setSearchPreferences(prev => ({ ...prev, salary_expectation: e.target.value }))}
                  />
                </div>

                <Button className="w-full" onClick={savePreferences}>Save Preferences</Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedJob?.title}</DialogTitle>
            <DialogDescription>
              {selectedJob?.company} • {selectedJob?.location}
            </DialogDescription>
          </DialogHeader>

          {selectedJob && (
            <div className="space-y-6">
              <div>
                <h3 className="font-medium text-gray-900">Matched Skills</h3>
                <ul className="list-disc list-inside space-y-1">
                  {(selectedJob && (('matched_skills' in selectedJob) ? selectedJob.matched_skills : (selectedJob as JobRecommendation).skills_required || [])).map((skill, idx) => (
                    <li key={idx} className="text-gray-600">{skill}</li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="font-medium text-gray-900">Match Score</h3>
                <p className="text-gray-600">{selectedJob.match_score}%</p>
              </div>

              <div>
                <h3 className="font-medium text-gray-900">Location</h3>
                <p className="text-gray-600">{selectedJob.location}</p>
              </div>

              <div>
                <h3 className="font-medium text-gray-900">Salary Range</h3>
                <p className="text-gray-600">{selectedJob.salary_range || "N/A"}</p>
              </div>

              <div>
                <h3 className="font-medium text-gray-900">Posted Date</h3>
                <p className="text-gray-600">{new Date(selectedJob.created_at).toLocaleDateString()}</p>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AIJobRecommendations;