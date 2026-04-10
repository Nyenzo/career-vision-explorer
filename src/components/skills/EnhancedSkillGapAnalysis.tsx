import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Target, TrendingUp, Users, MapPin, Briefcase, Star, AlertCircle, CheckCircle2, ArrowRight, BarChart3, FileText, Trophy, Brain } from 'lucide-react';
import { jobMatchingService, MarketAnalysis, JobMatch, MarketInsight } from '@/services/job-matching.service';
import { toast } from 'sonner';

const EnhancedSkillGapAnalysis: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [marketAnalysis, setMarketAnalysis] = useState<MarketAnalysis | null>(null);
  const [activeTab, setActiveTab] = useState('overview');

  // Removed auto-loading to prevent performance issues
  // Users can now manually trigger analysis

  const loadMarketAnalysis = async () => {
    setIsLoading(true);
    try {
      const analysis = await jobMatchingService.analyzeJobMarket();
      setMarketAnalysis(analysis);
      toast.success('Market analysis loaded successfully!');
    } catch (error) {
      console.error('Market analysis failed:', error);
      toast.error('Failed to load market analysis');
    } finally {
      setIsLoading(false);
    }
  };

  const refreshAnalysis = () => {
    loadMarketAnalysis();
  };

  const getMatchScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getMatchScoreBg = (score: number) => {
    if (score >= 80) return 'bg-green-100 border-green-200';
    if (score >= 60) return 'bg-yellow-100 border-yellow-200';
    return 'bg-red-100 border-red-200';
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'strength': return <CheckCircle2 className="h-5 w-5 text-green-600" />;
      case 'opportunity': return <Target className="h-5 w-5 text-blue-600" />;
      case 'gap': return <AlertCircle className="h-5 w-5 text-red-600" />;
      case 'trend': return <TrendingUp className="h-5 w-5 text-purple-600" />;
      default: return <Star className="h-5 w-5 text-gray-600" />;
    }
  };

  if (isLoading && !marketAnalysis) {
    return (
      <div className="container mx-auto py-8 space-y-6">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Analyzing job market and calculating skill matches...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-3 mb-4">
          <Brain className="h-8 w-8 text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-900">
            Enhanced Skill Market Analysis
          </h1>
        </div>
        <p className="text-gray-600 max-w-3xl mx-auto">
          Discover how your skills match the current job market. Get personalized insights on your 
          competitiveness and recommendations for career growth.
        </p>
        <Button onClick={loadMarketAnalysis} disabled={isLoading} className="mt-4">
          {isLoading ? 'Analyzing...' : (marketAnalysis ? 'Refresh Analysis' : 'Start Market Analysis')}
        </Button>
      </div>

      {!marketAnalysis && !isLoading && (
        <Card className="text-center py-12">
          <CardContent>
            <Brain className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Ready to Analyze Your Market Position?</h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Click the button above to start analyzing how your skills match the current job market. 
              We'll examine 100+ active job listings and provide personalized insights.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <Briefcase className="h-4 w-4" />
                <span>Job Matching</span>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                <span>Skill Analysis</span>
              </div>
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4" />
                <span>Market Insights</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4" />
                <span>Career Tips</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {marketAnalysis && (
        <>
          {/* Market Overview Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Briefcase className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total Jobs Analyzed</p>
                    <p className="text-2xl font-bold text-gray-900">{marketAnalysis.totalJobs}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Trophy className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Average Match Score</p>
                    <p className={`text-2xl font-bold ${getMatchScoreColor(marketAnalysis.averageMatchScore)}`}>
                      {marketAnalysis.averageMatchScore}%
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Star className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Your Skills</p>
                    <p className="text-2xl font-bold text-gray-900">{marketAnalysis.userSkillsCount}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <BarChart3 className="h-6 w-6 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Market Skills</p>
                    <p className="text-2xl font-bold text-gray-900">{marketAnalysis.marketSkillsCount}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Market Overview</TabsTrigger>
              <TabsTrigger value="matches">Job Matches</TabsTrigger>
              <TabsTrigger value="skills">Skill Demand</TabsTrigger>
              <TabsTrigger value="insights">Career Insights</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Market Overview
                  </CardTitle>
                  <CardDescription>
                    Your overall competitiveness in the current job market
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="text-center">
                      <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${getMatchScoreBg(marketAnalysis.averageMatchScore)}`}>
                        <Trophy className={`h-5 w-5 ${getMatchScoreColor(marketAnalysis.averageMatchScore)}`} />
                        <span className={`font-bold ${getMatchScoreColor(marketAnalysis.averageMatchScore)}`}>
                          {marketAnalysis.averageMatchScore}% Average Match
                        </span>
                      </div>
                      <p className="text-gray-600 mt-2">
                        You match {marketAnalysis.averageMatchScore}% of job requirements on average
                      </p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 bg-blue-50 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <Briefcase className="h-5 w-5 text-blue-600" />
                          <span className="font-medium">Job Market</span>
                        </div>
                        <p className="text-2xl font-bold text-blue-600">{marketAnalysis.totalJobs}</p>
                        <p className="text-sm text-gray-600">Active job listings analyzed</p>
                      </div>
                      
                      <div className="p-4 bg-green-50 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <CheckCircle2 className="h-5 w-5 text-green-600" />
                          <span className="font-medium">Top Matches</span>
                        </div>
                        <p className="text-2xl font-bold text-green-600">{marketAnalysis.topMatches.length}</p>
                        <p className="text-sm text-gray-600">High-scoring job matches</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="matches" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    Top Job Matches
                  </CardTitle>
                  <CardDescription>
                    Jobs that best match your current skill set
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {marketAnalysis.topMatches.slice(0, 10).map((job, index) => (
                      <div key={index} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900">{job.title}</h4>
                            <p className="text-sm text-gray-600">{job.company}</p>
                            {job.location && (
                              <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                                <MapPin className="h-4 w-4" />
                                {job.location}
                              </p>
                            )}
                          </div>
                          <div className="text-right">
                            <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full ${getMatchScoreBg(job.matchScore)}`}>
                              <span className={`font-bold text-sm ${getMatchScoreColor(job.matchScore)}`}>
                                {job.matchScore}%
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                          {job.matchedSkills.length > 0 && (
                            <div>
                              <p className="text-sm font-medium text-green-700 mb-2">Matched Skills:</p>
                              <div className="flex flex-wrap gap-1">
                                {job.matchedSkills.slice(0, 5).map((skill, skillIndex) => (
                                  <Badge key={skillIndex} variant="secondary" className="text-xs bg-green-100 text-green-800">
                                    {skill}
                                  </Badge>
                                ))}
                                {job.matchedSkills.length > 5 && (
                                  <Badge variant="outline" className="text-xs">
                                    +{job.matchedSkills.length - 5} more
                                  </Badge>
                                )}
                              </div>
                            </div>
                          )}
                          
                          {job.missingSkills.length > 0 && (
                            <div>
                              <p className="text-sm font-medium text-red-700 mb-2">Missing Skills:</p>
                              <div className="flex flex-wrap gap-1">
                                {job.missingSkills.slice(0, 5).map((skill, skillIndex) => (
                                  <Badge key={skillIndex} variant="destructive" className="text-xs">
                                    {skill}
                                  </Badge>
                                ))}
                                {job.missingSkills.length > 5 && (
                                  <Badge variant="outline" className="text-xs">
                                    +{job.missingSkills.length - 5} more
                                  </Badge>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="skills" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Skill Demand Analysis
                  </CardTitle>
                  <CardDescription>
                    Most in-demand skills in the current job market
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {marketAnalysis.skillDemand.slice(0, 15).map((skill, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center gap-3 flex-1">
                          <span className="font-medium text-gray-900">{skill.skill}</span>
                          <div className="flex-1 bg-gray-200 rounded-full h-2 max-w-xs">
                            <div 
                              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${(skill.demand / marketAnalysis.skillDemand[0].demand) * 100}%` }}
                            ></div>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-sm font-bold text-blue-600">{skill.demand}</span>
                          <p className="text-xs text-gray-500">jobs</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="insights" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="h-5 w-5" />
                    Career Insights & Recommendations
                  </CardTitle>
                  <CardDescription>
                    Personalized recommendations based on your market analysis
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {marketAnalysis.insights.map((insight, index) => (
                      <div key={index} className="flex gap-4 p-4 rounded-lg border bg-gray-50">
                        <div className="flex-shrink-0">
                          {getInsightIcon(insight.type)}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900 mb-1">{insight.title}</h4>
                          <p className="text-sm text-gray-600">{insight.description}</p>
                          {insight.action && (
                            <div className="mt-2">
                              <Button variant="outline" size="sm" className="text-xs">
                                {insight.action}
                                <ArrowRight className="h-3 w-3 ml-1" />
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
};

export default EnhancedSkillGapAnalysis;
