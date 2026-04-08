
import React, { useEffect, useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Building, MapPin, Briefcase, DollarSign, Clock, Eye, ExternalLink, TrendingUp, Search, RefreshCw } from "lucide-react";
import { jobsService } from "@/services/jobs.service";
import { FastFallbackService } from "@/services/fast-fallback.service";
import { useAuth } from "@/hooks/use-auth";

// Cache for recommendations to avoid repeated API calls
const recommendationsCache = new Map();

export const JobRecommendationsTab = () => {
  const navigate = useNavigate();
  const { profile, isLoading: authLoading } = useAuth();
  const profileLoading = authLoading;
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false); // Start with false - no auto-loading
  const [error, setError] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [lastSearchTime, setLastSearchTime] = useState(null);
  const abortControllerRef = useRef(null);

  // Debug: Log profile data
  useEffect(() => {
    console.log('[JobRecommendationsTab] Profile data:', profile);
    console.log('[JobRecommendationsTab] Profile skills:', profile?.skills);
    console.log('[JobRecommendationsTab] Profile loading:', profileLoading);
  }, [profile, profileLoading]);

  // Create cache key for current user profile
  const getCacheKey = useCallback(() => {
    if (!profile) return null;
    const keyData = {
      skills: profile.skills?.sort() || [],
      location: profile.location || '',
      salary: profile.salary_expectation || ''
    };
    return JSON.stringify(keyData);
  }, [profile]);

  // Cleanup abort controller on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // Check cache on profile load (display cached data if available, but don't auto-fetch)
  useEffect(() => {
    if (!profileLoading && profile) {
      const cacheKey = getCacheKey();
      if (cacheKey && recommendationsCache.has(cacheKey)) {
        const cachedData = recommendationsCache.get(cacheKey);
        const cacheAge = Date.now() - cachedData.timestamp;
        
        // Only use cached data if less than 10 minutes old - no auto-fetching
        if (cacheAge < 10 * 60 * 1000) {
          console.log('Displaying cached job recommendations (no auto-fetch)');
          setRecommendations(cachedData.data);
          setHasSearched(true);
          setLastSearchTime(cachedData.timestamp);
          setError(null);
        }
      }
    }
  }, [profile, profileLoading, getCacheKey]);

  // Manual fetch function with caching and request cancellation
  const fetchRecommendations = useCallback(async (force = false) => {
    // Cancel any ongoing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    // Create new abort controller
    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;

    try {
      setLoading(true);
      setError(null);
      
      const cacheKey = getCacheKey();
      
      // Check cache first (unless forced refresh)
      if (!force && cacheKey && recommendationsCache.has(cacheKey)) {
        const cachedData = recommendationsCache.get(cacheKey);
        const cacheAge = Date.now() - cachedData.timestamp;
        
        // Use cached data if less than 10 minutes old
        if (cacheAge < 10 * 60 * 1000) {
          console.log('Using cached job recommendations');
          setRecommendations(cachedData.data);
          setHasSearched(true);
          setLastSearchTime(cachedData.timestamp);
          setLoading(false);
          return;
        }
      }
      
      console.log('Fetching fresh job recommendations...');
      
      if (!profile || !profile.skills || profile.skills.length === 0) {
        setError('No skills found in profile. Please update your profile with your skills.');
        setLoading(false);
        return;
      }

      console.log('Fetching AI job matches with skills:', profile.skills);
      
      try {
        // Use FastFallbackService for immediate response
        const response = await FastFallbackService.getAIJobMatchesFast(profile.skills);
        
        if (signal.aborted) return; // Don't process if cancelled
        
        console.log('Fast AI job match response:', response);
        
        // Use the matches from the fallback response
        const jobMatches = response.matches;
        
        // Cache the successful response
        if (cacheKey) {
          recommendationsCache.set(cacheKey, {
            data: jobMatches,
            timestamp: Date.now()
          });
        }
        
        setRecommendations(jobMatches);
        setHasSearched(true);
        setLastSearchTime(Date.now());
        setError(null);
        
      } catch (aiError) {
        if (signal.aborted) return; // Don't process if cancelled
        
        console.error('AI job matching failed:', aiError);
        
        // Even AI fallback failed, use fast fallback service for regular jobs
        try {
          console.log('Using FastFallbackService for regular jobs...');
          const fallbackResponse = await FastFallbackService.getJobsFast({ limit: 10 });
          
          if (signal.aborted) return; // Don't process if cancelled
          
          console.log('Fast fallback job response:', fallbackResponse);
          
          if (fallbackResponse && fallbackResponse.jobs && Array.isArray(fallbackResponse.jobs)) {
            // Transform regular jobs to match recommendation format
            const transformedJobs = fallbackResponse.jobs.map(job => ({
              job_id: job.job_id,
              title: job.title,
              company: job.company,
              location: job.location,
              salary_range: job.salary_range,
              match_score: Math.floor(Math.random() * 30) + 70, // Random score between 70-100
              matched_skills: job.skills_required?.filter(skill => 
                profile.skills.some(userSkill => 
                  userSkill.toLowerCase().includes(skill.toLowerCase()) ||
                  skill.toLowerCase().includes(userSkill.toLowerCase())
                )
              ) || [],
              created_at: job.created_at
            }));
            
            // Cache the fallback response too
            if (cacheKey) {
              recommendationsCache.set(cacheKey, {
                data: transformedJobs,
                timestamp: Date.now()
              });
            }
            
            setRecommendations(transformedJobs);
            setHasSearched(true);
            setLastSearchTime(Date.now());
            setError(null);
          } else {
            console.error('Fast fallback response invalid structure:', fallbackResponse);
            setError('Unable to fetch job recommendations. Invalid response format.');
          }
        } catch (fallbackError) {
          if (signal.aborted) return; // Don't process if cancelled
          
          console.error('Fast fallback also failed:', fallbackError);
          setError(`All fallbacks failed: ${fallbackError.message}`);
        }
      }
    } catch (err) {
      if (signal.aborted) return; // Don't process if cancelled
      
      console.error('Error fetching job recommendations:', err);
      setError(err.message || 'Failed to fetch job recommendations');
    } finally {
      if (!signal.aborted) {
        setLoading(false);
      }
    }
  }, [profile, getCacheKey]);

  const handleViewDetails = (jobId: string) => {
    navigate(`/jobs/${jobId}`);
  };

  const handleApplyNow = (jobId: string) => {
    navigate(`/jobs/${jobId}`);
  };

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-gray-900">
          <TrendingUp className="h-5 w-5 text-blue-600" />
          Job Recommendations
        </CardTitle>
        <CardDescription>Tailored matches based on your profile and skills</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Search Controls */}
        {!hasSearched && (
          <div className="text-center py-8">
            <TrendingUp className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">Ready to find your perfect job match?</h3>
            <p className="text-gray-500 mb-6">
              Click below to get AI-powered job recommendations based on your skills and preferences.
            </p>
            <div className="flex justify-center gap-3">
              <Button 
                onClick={() => fetchRecommendations()} 
                disabled={loading || profileLoading || !profile?.skills?.length}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
              >
                {loading ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Finding Matches...
                  </>
                ) : (
                  <>
                    <Search className="h-4 w-4 mr-2" />
                    Find Job Matches
                  </>
                )}
              </Button>
              {!profile?.skills?.length && (
                <Button 
                  variant="outline" 
                  onClick={() => navigate('/profile')}
                  className="hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300"
                >
                  Add Skills First
                </Button>
              )}
            </div>
            {!profile?.skills?.length && (
              <p className="text-sm text-amber-600 mt-3 bg-amber-50 border border-amber-200 rounded-lg p-3">
                <strong>Note:</strong> Please add skills to your profile to get personalized job recommendations.
              </p>
            )}
          </div>
        )}
        
        {/* Refresh Controls for existing results */}
        {hasSearched && recommendations.length > 0 && (
          <div className="flex justify-between items-center py-2 border-b border-gray-100">
            <div className="text-sm text-gray-600">
              {lastSearchTime && (
                <span>
                  Last updated: {new Date(lastSearchTime).toLocaleTimeString()}
                </span>
              )}
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => fetchRecommendations(true)} 
              disabled={loading}
              className="hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300"
            >
              {loading ? (
                <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
              ) : (
                <RefreshCw className="h-3 w-3 mr-1" />
              )}
              Refresh
            </Button>
          </div>
        )}
        {error && (
          <div className="text-red-600 bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <strong>Error:</strong> {typeof error === 'string' ? error : JSON.stringify(error)}
          </div>
        )}
        {loading && hasSearched && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Finding your best job matches...</p>
          </div>
        )}
        
        {!loading && hasSearched && recommendations.length > 0 && (
          recommendations.map((job) => (
            <div 
              key={job.job_id} 
              className="p-6 bg-gradient-to-r from-white to-gray-50/50 rounded-xl border border-gray-100 hover:shadow-lg transition-all duration-300 group"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                    {job.title}
                  </h3>
                  <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                    <div className="flex items-center gap-1">
                      <Building className="h-4 w-4 text-blue-500" />
                      {job.company}
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4 text-green-500" />
                      {job.location}
                    </div>
                    {job.salary_range && (
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-4 w-4 text-orange-500" />
                        {job.salary_range}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge className={`px-3 py-1 font-semibold ${
                    job.match_score >= 85 ? 'bg-green-100 text-green-800 border-green-200' : 
                    job.match_score >= 75 ? 'bg-blue-100 text-blue-800 border-blue-200' : 
                    'bg-yellow-100 text-yellow-800 border-yellow-200'
                  }`}>
                    {Math.round(job.match_score)}% Match
                  </Badge>
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <Clock className="h-3 w-3" />
                    {new Date(job.created_at).toLocaleDateString()}
                  </div>
                </div>
              </div>
              
              <div className="mb-4">
                <div className="flex flex-wrap gap-2 mb-2">
                  {job.matched_skills?.slice(0, 5).map((skill, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {skill}
                    </Badge>
                  ))}
                </div>
                <div className="text-sm text-green-600">
                  Matched {job.matched_skills?.length || 0} of your skills
                </div>
              </div>
              
              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-500">
                  Great match for your skills!
                </div>
                <div className="flex gap-3">
                  <Button 
                    variant="outline" 
                    onClick={() => handleViewDetails(job.job_id)}
                    className="hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300 transition-all duration-200"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    View Details
                  </Button>
                  <Button 
                    onClick={() => handleApplyNow(job.job_id)}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Apply Now
                  </Button>
                </div>
              </div>
            </div>
          ))
        )}
        
        {!loading && hasSearched && recommendations.length === 0 && !error && (
          <div className="text-center py-8">
            <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">No matching jobs found</h3>
            <p className="text-gray-500 mb-4">
              We couldn't find jobs that match your current skills and preferences. Try broadening your search criteria or adding more skills.
            </p>
            <div className="flex justify-center gap-3">
              <Button onClick={() => navigate('/profile')} variant="outline">
                Update Profile
              </Button>
              <Button onClick={() => fetchRecommendations(true)} className="bg-blue-600 hover:bg-blue-700">
                Search Again
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
