import React, { useState, useEffect, useRef } from 'react';
import Layout from "@/components/layout/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  Brain, 
  Target, 
  TrendingUp, 
  MapPin, 
  DollarSign, 
  Star, 
  Briefcase, 
  Calendar,
  Award,
  Users,
  AlertCircle,
  CheckCircle,
  Clock,
  X,
  Eye,
  FileText,
  Loader2
} from 'lucide-react';
import { aiJobMatchingService, EnhancedJobMatch } from '@/services/ai-job-matching.service';
import { jobMatchingService, MarketAnalysis } from '@/services/job-matching.service';
import { useAuth } from '@/hooks/use-auth';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import SmartJobSearch from "@/components/jobs/SmartJobSearch";
import EnhancedMarketAnalysis from "@/components/analysis/EnhancedMarketAnalysis";

export default function AIJobMatching() {
  const { profile, isAuthenticated, isLoading: authLoading } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [enhancedMatches, setEnhancedMatches] = useState<EnhancedJobMatch[]>([]);
  const [marketAnalysis, setMarketAnalysis] = useState<MarketAnalysis | null>(null);
  const [careerRecommendations, setCareerRecommendations] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('ai-matching');

  // Remove auto-loading to prevent initial loading issues
  // Users can manually trigger market analysis when needed

  const loadMarketAnalysis = async () => {
    try {
      setIsLoading(true);
      const analysis = await jobMatchingService.analyzeJobMarket();
      setMarketAnalysis(analysis);
    } catch (error) {
      console.error('Failed to load market analysis:', error);
      toast.error('Failed to load market analysis');
    } finally {
      setIsLoading(false);
    }
  };

  const getEnhancedAIMatches = async () => {
    if (!profile) {
      toast.error('Profile not available. Please complete your profile first.');
      return;
    }

    try {
      setIsLoading(true);
      const matches = await aiJobMatchingService.matchJobsWithAI(profile, {
        max_results: 15,
        min_match_score: 50,
        include_stretch_opportunities: true,
        focus_on_skill_growth: true
      });
      setEnhancedMatches(matches);
      setActiveTab('ai-matching');
      toast.success(`Found ${matches.length} AI-powered job matches!`);
    } catch (error) {
      console.error('AI matching failed:', error);
      toast.error('Failed to get AI job matches');
    } finally {
      setIsLoading(false);
    }
  };

  const getCareerRecommendations = async () => {
    if (!profile) {
      toast.error('Profile not available');
      return;
    }

    try {
      setIsLoading(true);
      const recommendations = await aiJobMatchingService.getCareerRecommendations(profile);
      setCareerRecommendations(recommendations);
      setActiveTab('career-insights');
      toast.success('Career recommendations generated!');
    } catch (error) {
      console.error('Career recommendations failed:', error);
      toast.error('Failed to get career recommendations');
    } finally {
      setIsLoading(false);
    }
  };

  const getMatchScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600 bg-green-50';
    if (score >= 80) return 'text-blue-600 bg-blue-50';
    if (score >= 70) return 'text-yellow-600 bg-yellow-50';
    if (score >= 60) return 'text-orange-600 bg-orange-50';
    return 'text-red-600 bg-red-50';
  };

  const getConfidenceBadgeColor = (confidence: string) => {
    switch (confidence) {
      case 'high': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const EnhancedJobCard: React.FC<{ match: EnhancedJobMatch }> = ({ match }) => (
    <Card className="hover:shadow-lg transition-shadow duration-200">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg font-semibold text-gray-900">
              {match.title}
            </CardTitle>
            <CardDescription className="text-gray-600">
              {match.company}
            </CardDescription>
          </div>
          <div className="text-right">
            <div className={`px-2 py-1 rounded-lg text-sm font-bold ${getMatchScoreColor(match.ai_score.overall_score)}`}>
              {match.ai_score.overall_score}%
            </div>
            <Badge className={`text-xs mt-1 ${getConfidenceBadgeColor(match.ai_score.match_confidence)}`}>
              {match.ai_score.match_confidence} confidence
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4 text-sm text-gray-600">
          <div className="flex items-center gap-1">
            <MapPin className="h-4 w-4" />
            <span>{match.location}</span>
          </div>
          {match.salary && (
            <div className="flex items-center gap-1">
              <DollarSign className="h-4 w-4" />
              <span>{match.salary}</span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-medium text-gray-700">Skills:</span>
            <span className="text-green-600 ml-1">{match.ai_score.skills_match}%</span>
          </div>
          <div>
            <span className="font-medium text-gray-700">Experience:</span>
            <span className="text-blue-600 ml-1">{match.ai_score.experience_match}%</span>
          </div>
          <div>
            <span className="font-medium text-gray-700">Location:</span>
            <span className="text-purple-600 ml-1">{match.ai_score.location_match}%</span>
          </div>
          <div>
            <span className="font-medium text-gray-700">Growth:</span>
            <span className="text-orange-600 ml-1">{match.ai_score.growth_potential}%</span>
          </div>
        </div>

        <div>
          <Label className="text-sm font-medium text-gray-700 mb-2 block">
            Why It's a Good Fit
          </Label>
          <ul className="text-sm text-gray-600 space-y-1">
            {match.personalized_insights.why_good_fit.slice(0, 2).map((reason, index) => (
              <li key={index} className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                {reason}
              </li>
            ))}
          </ul>
        </div>

        <div className="pt-2 border-t">
          <Button size="sm" className="w-full">
            View Full Analysis
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  if (!isAuthenticated) {
    return (
      <Layout>
        <div className="container mx-auto py-8">
          <Card className="text-center py-12">
            <CardContent>
              <Brain className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                AI Job Matching Requires Authentication
              </h3>
              <p className="text-gray-600 mb-4">
                Sign in to access AI-powered job matching and career insights
              </p>
              <Button onClick={() => window.location.href = '/login'}>Sign In</Button>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto py-8 space-y-6">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            AI-Powered Job Matching
          </h1>
          <p className="text-gray-600 max-w-3xl mx-auto">
            Leverage advanced AI to discover perfect job matches, get personalized career insights, 
            and accelerate your professional growth
          </p>
        </div>

        {/* Profile Warning */}
        {isAuthenticated && !profile && (
          <Card className="mb-6 border-yellow-200 bg-yellow-50">
            <CardContent className="py-4">
              <div className="flex items-center gap-2 text-yellow-800">
                <AlertCircle className="h-5 w-5" />
                <div>
                  <h3 className="font-medium">Profile Not Available</h3>
                  <p className="text-sm text-yellow-600">
                    Your profile is still loading or unavailable. Some AI features may be limited.
                    Please complete your profile in the Profile section to unlock full AI capabilities.
                  </p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="mt-2 border-yellow-300 text-yellow-700 hover:bg-yellow-100"
                    onClick={() => window.location.href = '/profile'}
                  >
                    Complete Profile
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Button 
            onClick={getEnhancedAIMatches} 
            disabled={isLoading}
            className="h-16 flex flex-col items-center justify-center space-y-1"
          >
            <Brain className="h-5 w-5" />
            <span>AI Job Matching</span>
          </Button>
          <Button 
            onClick={getCareerRecommendations} 
            disabled={isLoading}
            variant="outline"
            className="h-16 flex flex-col items-center justify-center space-y-1"
          >
            <Target className="h-5 w-5" />
            <span>Career Insights</span>
          </Button>
          <Button 
            onClick={() => setActiveTab('market-analysis')} 
            disabled={isLoading}
            variant="outline"
            className="h-16 flex flex-col items-center justify-center space-y-1"
          >
            <TrendingUp className="h-5 w-5" />
            <span>Market Analysis</span>
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="ai-matching">AI Matches</TabsTrigger>
            <TabsTrigger value="career-insights">Career Insights</TabsTrigger>
            <TabsTrigger value="market-analysis">Enhanced Market Analysis</TabsTrigger>
            <TabsTrigger value="job-search">Smart Search</TabsTrigger>
          </TabsList>

          <TabsContent value="ai-matching" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5" />
                  Enhanced AI Job Matches
                </CardTitle>
                <CardDescription>
                  Comprehensive AI analysis with personalized insights and application strategies
                </CardDescription>
              </CardHeader>
              <CardContent>
                {enhancedMatches.length === 0 && !isLoading && (
                  <div className="text-center py-8">
                    <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-4">No AI matches found yet</p>
                    <Button onClick={getEnhancedAIMatches} disabled={isLoading}>
                      {isLoading ? 'Analyzing...' : 'Get AI Job Matches'}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {isLoading && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <Card key={i}>
                    <CardHeader>
                      <Skeleton className="h-6 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                    </CardHeader>
                    <CardContent>
                      <Skeleton className="h-24 w-full" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {enhancedMatches.map((match) => (
                <EnhancedJobCard key={match.id} match={match} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="career-insights" className="space-y-6">
            {careerRecommendations ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="h-5 w-5" />
                      Recommended Roles
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {careerRecommendations.recommended_roles.map((role: string, index: number) => (
                        <Badge key={index} variant="secondary" className="mr-2 mb-2">
                          {role}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Award className="h-5 w-5" />
                      Skill Development Priorities
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {careerRecommendations.skill_development_priorities.map((skill: string, index: number) => (
                        <div key={index} className="flex items-center justify-between">
                          <span className="text-sm">{skill}</span>
                          <Badge variant="outline">Priority {index + 1}</Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="md:col-span-2">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="h-5 w-5" />
                      Career Timeline
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <h4 className="font-medium text-green-700 mb-2">Short-term (3-6 months)</h4>
                        <ul className="text-sm space-y-1">
                          {careerRecommendations.timeline.short_term.map((item: string, index: number) => (
                            <li key={index} className="flex items-start gap-2">
                              <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-medium text-blue-700 mb-2">Medium-term (6-18 months)</h4>
                        <ul className="text-sm space-y-1">
                          {careerRecommendations.timeline.medium_term.map((item: string, index: number) => (
                            <li key={index} className="flex items-start gap-2">
                              <Clock className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-medium text-purple-700 mb-2">Long-term (2-5 years)</h4>
                        <ul className="text-sm space-y-1">
                          {careerRecommendations.timeline.long_term.map((item: string, index: number) => (
                            <li key={index} className="flex items-start gap-2">
                              <Star className="h-4 w-4 text-purple-500 mt-0.5 flex-shrink-0" />
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-4">No career insights available</p>
                  <Button onClick={getCareerRecommendations} disabled={isLoading}>
                    {isLoading ? 'Generating...' : 'Get Career Recommendations'}
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="market-analysis" className="space-y-6">
            <EnhancedMarketAnalysis />
          </TabsContent>

          <TabsContent value="job-search">
            <SmartJobSearch />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
