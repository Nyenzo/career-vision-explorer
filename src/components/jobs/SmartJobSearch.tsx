import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { 
  Search, 
  Filter,
  MapPin, 
  DollarSign, 
  Star, 
  Briefcase, 
  TrendingUp,
  ExternalLink,
  Heart,
  Clock,
  Building
} from 'lucide-react';
import { jobsService } from '@/services/jobs.service';
import { aiJobMatchingService } from '@/services/ai-job-matching.service';
import { useAuth } from '@/hooks/use-auth';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface SearchFilters {
  keyword: string;
  location: string;
  salaryMin: number;
  salaryMax: number;
  jobType: string;
  experienceLevel: string;
  skills: string[];
}

interface SearchResult {
  id: string;
  title: string;
  company: string;
  location: string;
  salary_range?: string;
  job_type: string;
  description: string;
  skills_required: string[];
  created_at: string;
  matchScore?: number;
  matchReason?: string;
}

const SmartJobSearch: React.FC = () => {
  const { profile } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [totalResults, setTotalResults] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<SearchFilters>({
    keyword: '',
    location: '',
    salaryMin: 0,
    salaryMax: 500000,
    jobType: '',
    experienceLevel: '',
    skills: []
  });
  const [newSkill, setNewSkill] = useState('');

  const performSearch = async (page = 1) => {
    try {
      setIsLoading(true);
      
      // Build search parameters for database filtering
      const searchParams: any = {
        page,
        limit: 20,
        is_active: true
      };

      // Add keyword search
      if (filters.keyword.trim()) {
        searchParams.search = filters.keyword.trim();
      }

      // Add location filter
      if (filters.location.trim()) {
        searchParams.location = filters.location.trim();
      }

      // Add job type filter
      if (filters.jobType && filters.jobType !== 'all') {
        searchParams.job_type = filters.jobType;
      }

      // Add experience level filter
      if (filters.experienceLevel && filters.experienceLevel !== 'all') {
        searchParams.experience_level = filters.experienceLevel;
      }

      // Perform database search
      const response = await jobsService.getJobs(searchParams);
      let jobs = response.jobs || [];

      // Filter by salary range if specified
      if (filters.salaryMin > 0 || filters.salaryMax < 500000) {
        jobs = jobs.filter(job => {
          if (!job.salary_range) return true;
          
          // Simple salary parsing - you might want to improve this
          const salaryNumbers = job.salary_range.match(/\d+/g);
          if (salaryNumbers && salaryNumbers.length >= 2) {
            const minSalary = parseInt(salaryNumbers[0]) * 1000; // Assuming it's in K
            const maxSalary = parseInt(salaryNumbers[1]) * 1000;
            return maxSalary >= filters.salaryMin && minSalary <= filters.salaryMax;
          }
          return true;
        });
      }

      // Filter by skills if specified
      if (filters.skills.length > 0) {
        jobs = jobs.filter(job => {
          const jobSkills = (job.skills_required || []).map(s => s.toLowerCase());
          return filters.skills.some(skill => 
            jobSkills.some(jobSkill => 
              jobSkill.includes(skill.toLowerCase()) || 
              skill.toLowerCase().includes(jobSkill)
            )
          );
        });
      }

      // Calculate AI match scores if user has profile
      if (profile && jobs.length > 0) {
        const jobsWithScores = await Promise.all(
          jobs.map(async (job) => {
            try {
              // Calculate match score using AI
              const matchScore = await calculateJobMatchScore(job);
              return {
                ...job,
                matchScore,
                matchReason: generateMatchReason(job, matchScore)
              };
            } catch (error) {
              // Fallback to basic matching
              const basicScore = calculateBasicMatchScore(job);
              return {
                ...job,
                matchScore: basicScore,
                matchReason: `${basicScore}% skill match based on requirements`
              };
            }
          })
        );

        // Sort by match score
        jobsWithScores.sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));
        setSearchResults(jobsWithScores);
      } else {
        setSearchResults(jobs);
      }

      setTotalResults(jobs.length);
      setCurrentPage(page);
      
      toast.success(`Found ${jobs.length} matching jobs`);
    } catch (error) {
      console.error('Search failed:', error);
      toast.error('Search failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const calculateJobMatchScore = async (job: any): Promise<number> => {
    if (!profile) return 50;

    try {
      // Use a simplified version of AI matching for individual jobs
      const userSkills = profile.skills || [];
      const jobSkills = job.skills_required || [];
      
      // Calculate skill overlap
      const matchedSkills = jobSkills.filter(jobSkill =>
        userSkills.some(userSkill =>
          userSkill.toLowerCase().includes(jobSkill.toLowerCase()) ||
          jobSkill.toLowerCase().includes(userSkill.toLowerCase())
        )
      );

      const skillScore = jobSkills.length > 0 
        ? (matchedSkills.length / jobSkills.length) * 100 
        : 50;

      // Add location matching bonus
      let locationScore = 50;
      if (profile.location && job.location) {
        if (job.location.toLowerCase().includes(profile.location.toLowerCase()) ||
            job.location.toLowerCase().includes('remote')) {
          locationScore = 100;
        }
      }

      // Weighted average
      const finalScore = Math.round((skillScore * 0.7) + (locationScore * 0.3));
      return Math.min(finalScore, 100);
    } catch (error) {
      return 50;
    }
  };

  const calculateBasicMatchScore = (job: any): number => {
    if (!profile) return 50;

    const userSkills = profile.skills || [];
    const jobSkills = job.skills_required || [];
    
    if (jobSkills.length === 0) return 50;

    const matchedSkills = jobSkills.filter(jobSkill =>
      userSkills.some(userSkill =>
        userSkill.toLowerCase().includes(jobSkill.toLowerCase()) ||
        jobSkill.toLowerCase().includes(userSkill.toLowerCase())
      )
    );

    return Math.round((matchedSkills.length / jobSkills.length) * 100);
  };

  const generateMatchReason = (job: any, score: number): string => {
    if (score >= 80) return 'Excellent match - most requirements align with your profile';
    if (score >= 60) return 'Good match - several skills align with your experience';
    if (score >= 40) return 'Partial match - some transferable skills identified';
    return 'Entry opportunity - potential for skill development';
  };

  const addSkill = () => {
    if (newSkill.trim() && !filters.skills.includes(newSkill.trim())) {
      setFilters(prev => ({
        ...prev,
        skills: [...prev.skills, newSkill.trim()]
      }));
      setNewSkill('');
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setFilters(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill !== skillToRemove)
    }));
  };

  const resetFilters = () => {
    setFilters({
      keyword: '',
      location: '',
      salaryMin: 0,
      salaryMax: 500000,
      jobType: '',
      experienceLevel: '',
      skills: []
    });
    setSearchResults([]);
    setTotalResults(0);
  };

  const getMatchScoreColor = (score?: number) => {
    if (!score) return 'bg-gray-100 text-gray-600';
    if (score >= 80) return 'bg-green-100 text-green-700';
    if (score >= 60) return 'bg-blue-100 text-blue-700';
    if (score >= 40) return 'bg-yellow-100 text-yellow-700';
    return 'bg-red-100 text-red-700';
  };

  const formatSalary = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'KES',
      maximumFractionDigits: 0
    }).format(value);
  };

  return (
    <div className="space-y-6">
      {/* Search Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Smart Job Search
          </CardTitle>
          <CardDescription>
            Search jobs using advanced filters with AI-powered match scoring
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Main Search Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="keyword">Job Title, Company, or Keywords</Label>
              <Input
                id="keyword"
                placeholder="e.g., Frontend Developer, React, Tech Company"
                value={filters.keyword}
                onChange={(e) => setFilters(prev => ({ ...prev, keyword: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                placeholder="e.g., Nairobi, Remote, Mombasa"
                value={filters.location}
                onChange={(e) => setFilters(prev => ({ ...prev, location: e.target.value }))}
              />
            </div>
          </div>

          {/* Job Type and Experience Level */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Job Type</Label>
              <Select value={filters.jobType} onValueChange={(value) => 
                setFilters(prev => ({ ...prev, jobType: value }))
              }>
                <SelectTrigger>
                  <SelectValue placeholder="Select job type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Any Type</SelectItem>
                  <SelectItem value="full-time">Full-time</SelectItem>
                  <SelectItem value="part-time">Part-time</SelectItem>
                  <SelectItem value="contract">Contract</SelectItem>
                  <SelectItem value="internship">Internship</SelectItem>
                  <SelectItem value="freelance">Freelance</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Experience Level</Label>
              <Select value={filters.experienceLevel} onValueChange={(value) => 
                setFilters(prev => ({ ...prev, experienceLevel: value }))
              }>
                <SelectTrigger>
                  <SelectValue placeholder="Select experience level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Any Level</SelectItem>
                  <SelectItem value="entry">Entry Level</SelectItem>
                  <SelectItem value="mid">Mid Level</SelectItem>
                  <SelectItem value="senior">Senior Level</SelectItem>
                  <SelectItem value="lead">Lead/Principal</SelectItem>
                  <SelectItem value="executive">Executive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Salary Range */}
          <div className="space-y-2">
            <Label>Salary Range (KES/month)</Label>
            <div className="px-3">
              <Slider
                value={[filters.salaryMin, filters.salaryMax]}
                max={500000}
                min={0}
                step={10000}
                onValueChange={([min, max]) => 
                  setFilters(prev => ({ ...prev, salaryMin: min, salaryMax: max }))
                }
                className="mb-2"
              />
              <div className="flex justify-between text-sm text-gray-600">
                <span>{formatSalary(filters.salaryMin)}</span>
                <span>{formatSalary(filters.salaryMax)}</span>
              </div>
            </div>
          </div>

          {/* Skills Filter */}
          <div className="space-y-2">
            <Label>Required Skills</Label>
            <div className="flex gap-2">
              <Input
                placeholder="Add a skill"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addSkill()}
              />
              <Button onClick={addSkill} variant="outline">Add</Button>
            </div>
            {filters.skills.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {filters.skills.map((skill) => (
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

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button onClick={() => performSearch(1)} disabled={isLoading} className="flex-1">
              {isLoading ? 'Searching...' : 'Search Jobs'}
            </Button>
            <Button onClick={resetFilters} variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Reset
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Search Results */}
      {totalResults > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Search Results ({totalResults} jobs found)</span>
              {profile && (
                <Badge variant="outline">
                  <Star className="h-3 w-3 mr-1" />
                  AI Match Scoring Enabled
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {isLoading && (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <Card key={i}>
                      <CardHeader>
                        <Skeleton className="h-6 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                      </CardHeader>
                      <CardContent>
                        <Skeleton className="h-16 w-full" />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              {!isLoading && searchResults.map((job) => (
                <Card key={job.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{job.title}</CardTitle>
                        <CardDescription className="flex items-center gap-2">
                          <Building className="h-4 w-4" />
                          {job.company}
                        </CardDescription>
                      </div>
                      {job.matchScore && (
                        <div className="text-right">
                          <Badge className={getMatchScoreColor(job.matchScore)}>
                            {job.matchScore}% Match
                          </Badge>
                          {job.matchReason && (
                            <p className="text-xs text-gray-500 mt-1 max-w-48">{job.matchReason}</p>
                          )}
                        </div>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
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
                      <div className="flex items-center gap-1">
                        <Briefcase className="h-4 w-4" />
                        <span>{job.job_type}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>{new Date(job.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>

                    <p className="text-sm text-gray-700 line-clamp-2">
                      {job.description}
                    </p>

                    {job.skills_required.length > 0 && (
                      <div>
                        <Label className="text-sm font-medium mb-2 block">Required Skills</Label>
                        <div className="flex flex-wrap gap-2">
                          {job.skills_required.slice(0, 6).map((skill, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {skill}
                            </Badge>
                          ))}
                          {job.skills_required.length > 6 && (
                            <Badge variant="outline" className="text-xs">
                              +{job.skills_required.length - 6} more
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="flex gap-2 pt-2">
                      <Button size="sm" className="flex-1">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        View Details
                      </Button>
                      <Button size="sm" variant="outline">
                        <Heart className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* No Results */}
      {!isLoading && totalResults === 0 && searchResults.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Start Your Job Search
            </h3>
            <p className="text-gray-600 mb-4">
              Use the filters above to find jobs that match your skills and preferences
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SmartJobSearch;
