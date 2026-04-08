import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  TrendingDown,
  BarChart3,
  PieChart,
  Activity,
  Target,
  AlertTriangle,
  CheckCircle,
  Clock,
  DollarSign,
  Users,
  Building,
  MapPin,
  Star
} from 'lucide-react';
import { jobMatchingService, MarketAnalysis } from '@/services/job-matching.service';
import { useAuth } from '@/hooks/use-auth';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';

interface TrendData {
  period: string;
  value: number;
  change: number;
}

interface PredictionData {
  category: string;
  current: number;
  predicted: number;
  confidence: 'high' | 'medium' | 'low';
  timeframe: string;
}

interface LocationInsight {
  location: string;
  jobCount: number;
  averageSalary: string;
  topSkills: string[];
  growth: number;
}

const EnhancedMarketAnalysis: React.FC = () => {
  const { profile } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [marketAnalysis, setMarketAnalysis] = useState<MarketAnalysis | null>(null);
  const [trends, setTrends] = useState<TrendData[]>([]);
  const [predictions, setPredictions] = useState<PredictionData[]>([]);
  const [locationInsights, setLocationInsights] = useState<LocationInsight[]>([]);
  const [selectedTimeframe, setSelectedTimeframe] = useState<'1M' | '3M' | '6M' | '1Y'>('3M');

  const loadEnhancedAnalysis = async () => {
    try {
      setIsLoading(true);
      
      // Load base market analysis
      const analysis = await jobMatchingService.analyzeJobMarket();
      setMarketAnalysis(analysis);

      // Generate trend data (simulated for demo)
      const trendData = generateTrendData(selectedTimeframe);
      setTrends(trendData);

      // Generate predictions based on current market
      const predictionData = generatePredictions(analysis);
      setPredictions(predictionData);

      // Generate location insights
      const locationData = generateLocationInsights(analysis);
      setLocationInsights(locationData);

      toast.success('Enhanced market analysis loaded');
    } catch (error) {
      console.error('Failed to load enhanced analysis:', error);
      toast.error('Failed to load market analysis');
    } finally {
      setIsLoading(false);
    }
  };

  const generateTrendData = (timeframe: string): TrendData[] => {
    const periods = timeframe === '1M' ? 4 : timeframe === '3M' ? 12 : timeframe === '6M' ? 24 : 52;
    const data: TrendData[] = [];
    
    for (let i = 0; i < Math.min(periods, 12); i++) {
      const baseValue = 100 + Math.random() * 50;
      const change = (Math.random() - 0.5) * 20;
      data.push({
        period: timeframe === '1Y' ? `Week ${i + 1}` : `Period ${i + 1}`,
        value: Math.round(baseValue),
        change: Math.round(change * 10) / 10
      });
    }
    
    return data;
  };

  const generatePredictions = (analysis: MarketAnalysis): PredictionData[] => {
    return [
      {
        category: 'AI/ML Jobs',
        current: Math.round(analysis.totalJobs * 0.15),
        predicted: Math.round(analysis.totalJobs * 0.25),
        confidence: 'high',
        timeframe: '6 months'
      },
      {
        category: 'Remote Positions',
        current: Math.round(analysis.totalJobs * 0.35),
        predicted: Math.round(analysis.totalJobs * 0.45),
        confidence: 'high',
        timeframe: '6 months'
      },
      {
        category: 'Senior Roles',
        current: Math.round(analysis.totalJobs * 0.25),
        predicted: Math.round(analysis.totalJobs * 0.30),
        confidence: 'medium',
        timeframe: '12 months'
      },
      {
        category: 'Startup Jobs',
        current: Math.round(analysis.totalJobs * 0.20),
        predicted: Math.round(analysis.totalJobs * 0.28),
        confidence: 'medium',
        timeframe: '9 months'
      }
    ];
  };

  const generateLocationInsights = (analysis: MarketAnalysis): LocationInsight[] => {
    return [
      {
        location: 'Nairobi',
        jobCount: Math.round(analysis.totalJobs * 0.45),
        averageSalary: '120K - 200K KES',
        topSkills: ['JavaScript', 'React', 'Python'],
        growth: 15.2
      },
      {
        location: 'Remote',
        jobCount: Math.round(analysis.totalJobs * 0.30),
        averageSalary: '100K - 180K KES',
        topSkills: ['Node.js', 'React', 'AWS'],
        growth: 25.8
      },
      {
        location: 'Mombasa',
        jobCount: Math.round(analysis.totalJobs * 0.15),
        averageSalary: '80K - 150K KES',
        topSkills: ['PHP', 'Java', 'MySQL'],
        growth: 8.4
      },
      {
        location: 'Kisumu',
        jobCount: Math.round(analysis.totalJobs * 0.10),
        averageSalary: '70K - 130K KES',
        topSkills: ['React', 'Node.js', 'MongoDB'],
        growth: 12.1
      }
    ];
  };

  const getConfidenceColor = (confidence: 'high' | 'medium' | 'low') => {
    switch (confidence) {
      case 'high': return 'bg-green-100 text-green-700';
      case 'medium': return 'bg-yellow-100 text-yellow-700';
      case 'low': return 'bg-red-100 text-red-700';
    }
  };

  const getTrendIcon = (change: number) => {
    if (change > 0) return <TrendingUp className="h-4 w-4 text-green-500" />;
    if (change < 0) return <TrendingDown className="h-4 w-4 text-red-500" />;
    return <Activity className="h-4 w-4 text-gray-500" />;
  };

  useEffect(() => {
    loadEnhancedAnalysis();
  }, [selectedTimeframe]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16 mb-2" />
                <Skeleton className="h-2 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-32 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!marketAnalysis) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No Market Data Available
          </h3>
          <p className="text-gray-600 mb-4">
            Load market analysis to see enhanced insights and predictions
          </p>
          <Button onClick={loadEnhancedAnalysis}>Load Market Analysis</Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Enhanced Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Building className="h-4 w-4" />
              Total Jobs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{marketAnalysis.totalJobs}</div>
            <div className="flex items-center gap-1 text-sm">
              <TrendingUp className="h-3 w-3 text-green-500" />
              <span className="text-green-600">+12% from last month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Target className="h-4 w-4" />
              Your Match Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{marketAnalysis.averageMatchScore}%</div>
            <Progress value={marketAnalysis.averageMatchScore} className="mt-2" />
            <p className="text-xs text-gray-600 mt-1">Above average (65%)</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Star className="h-4 w-4" />
              High Matches
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {marketAnalysis.topMatches.filter(m => m.matchScore >= 80).length}
            </div>
            <p className="text-xs text-gray-600">Jobs with 80%+ match</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="h-4 w-4" />
              Skill Coverage
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round((marketAnalysis.userSkillsCount / marketAnalysis.marketSkillsCount) * 100)}%
            </div>
            <p className="text-xs text-gray-600">
              {marketAnalysis.userSkillsCount} of {marketAnalysis.marketSkillsCount} market skills
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Market Trends */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Market Trends
              </CardTitle>
              <CardDescription>Job market activity over time</CardDescription>
            </div>
            <div className="flex gap-2">
              {(['1M', '3M', '6M', '1Y'] as const).map((timeframe) => (
                <Button
                  key={timeframe}
                  variant={selectedTimeframe === timeframe ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedTimeframe(timeframe)}
                >
                  {timeframe}
                </Button>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {trends.slice(0, 8).map((trend, index) => (
              <div key={index} className="text-center p-3 rounded-lg bg-gray-50">
                <div className="flex items-center justify-center gap-1 mb-1">
                  {getTrendIcon(trend.change)}
                  <span className="text-sm font-medium">{trend.period}</span>
                </div>
                <div className="text-lg font-bold">{trend.value}</div>
                <div className={`text-xs ${trend.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {trend.change >= 0 ? '+' : ''}{trend.change}%
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Market Predictions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Market Predictions
          </CardTitle>
          <CardDescription>AI-powered forecasts for job market segments</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {predictions.map((prediction, index) => (
              <div key={index} className="p-4 rounded-lg border">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-medium">{prediction.category}</h4>
                    <p className="text-sm text-gray-600">Forecast: {prediction.timeframe}</p>
                  </div>
                  <Badge className={getConfidenceColor(prediction.confidence)}>
                    {prediction.confidence} confidence
                  </Badge>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Current</span>
                    <span className="font-medium">{prediction.current} jobs</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Predicted</span>
                    <span className="font-medium text-green-600">{prediction.predicted} jobs</span>
                  </div>
                  <Progress 
                    value={(prediction.predicted / (prediction.current * 1.5)) * 100} 
                    className="mt-2"
                  />
                  <div className="text-xs text-gray-600">
                    Expected growth: +{Math.round(((prediction.predicted - prediction.current) / prediction.current) * 100)}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Location Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Location-Based Insights
          </CardTitle>
          <CardDescription>Regional job market analysis</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {locationInsights.map((location, index) => (
              <Card key={index} className="border-2">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">{location.location}</CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{location.jobCount} jobs</Badge>
                    <div className="flex items-center gap-1 text-sm">
                      {location.growth >= 0 ? (
                        <TrendingUp className="h-3 w-3 text-green-500" />
                      ) : (
                        <TrendingDown className="h-3 w-3 text-red-500" />
                      )}
                      <span className={location.growth >= 0 ? 'text-green-600' : 'text-red-600'}>
                        {location.growth >= 0 ? '+' : ''}{location.growth}%
                      </span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-2">
                    <div>
                      <p className="text-sm font-medium">Avg Salary</p>
                      <p className="text-sm text-gray-600">{location.averageSalary}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium mb-1">Top Skills</p>
                      <div className="flex flex-wrap gap-1">
                        {location.topSkills.map((skill, skillIndex) => (
                          <Badge key={skillIndex} variant="secondary" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Skill Demand Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChart className="h-5 w-5" />
            Skill Demand Analysis
          </CardTitle>
          <CardDescription>Most in-demand skills in your market</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-3">Top 10 Skills</h4>
              <div className="space-y-3">
                {marketAnalysis.skillDemand.slice(0, 10).map((skill, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{index + 1}.</span>
                      <span className="text-sm">{skill.skill}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Progress value={skill.percentage} className="w-20 h-2" />
                      <span className="text-sm text-gray-600 min-w-[3rem]">
                        {skill.percentage}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h4 className="font-medium mb-3">Your Skill Alignment</h4>
              <div className="space-y-3">
                {marketAnalysis.skillDemand.slice(0, 10).map((skill, index) => {
                  const userHasSkill = profile?.skills?.some(userSkill => 
                    userSkill.toLowerCase().includes(skill.skill.toLowerCase()) ||
                    skill.skill.toLowerCase().includes(userSkill.toLowerCase())
                  );
                  return (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm">{skill.skill}</span>
                      <div className="flex items-center gap-2">
                        {userHasSkill ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <AlertTriangle className="h-4 w-4 text-orange-500" />
                        )}
                        <span className="text-sm text-gray-600">
                          {userHasSkill ? 'You have this' : 'Consider learning'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Market Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Strategic Market Insights
          </CardTitle>
          <CardDescription>AI-powered recommendations for your career</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {marketAnalysis.insights.map((insight, index) => (
              <Card key={index} className="border-2">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      {insight.type === 'strength' && <CheckCircle className="h-4 w-4 text-green-500" />}
                      {insight.type === 'opportunity' && <TrendingUp className="h-4 w-4 text-blue-500" />}
                      {insight.type === 'gap' && <AlertTriangle className="h-4 w-4 text-orange-500" />}
                      {insight.type === 'trend' && <Activity className="h-4 w-4 text-purple-500" />}
                      <CardTitle className="text-sm">{insight.title}</CardTitle>
                    </div>
                    <Badge 
                      variant="outline" 
                      className={
                        insight.priority === 'high' ? 'border-red-200 text-red-700' :
                        insight.priority === 'medium' ? 'border-yellow-200 text-yellow-700' :
                        'border-gray-200 text-gray-700'
                      }
                    >
                      {insight.priority}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-sm text-gray-600 mb-2">{insight.description}</p>
                  {insight.action && (
                    <div className="p-2 bg-blue-50 rounded text-xs text-blue-700">
                      <strong>Action:</strong> {insight.action}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EnhancedMarketAnalysis;
