import React, { useState, useEffect, useRef } from 'react';
import Layout from "@/components/layout/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Brain, 
  MapPin, 
  DollarSign, 
  Briefcase, 
  AlertCircle,
  CheckCircle,
  X,
  Eye,
  FileText,
  Loader2,
  Play,
  Pause,
  StopCircle
} from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { toast } from 'sonner';
import { enhancedJobMatchingService, JobMatchResult, BatchProgress } from '@/services/enhanced-job-matching.service';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useNavigate } from 'react-router-dom';

interface BatchProcessingState extends BatchProgress {
  isProcessing: boolean;
  isPaused: boolean;
}

export default function JobMatching() {
  const { profile, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [batchState, setBatchState] = useState<BatchProcessingState>({
    isProcessing: false,
    isPaused: false,
    currentBatch: 0,
    totalBatches: 0,
    processedJobs: 0,
    totalJobs: 0,
    matches: []
  });
  const [selectedMatch, setSelectedMatch] = useState<JobMatchResult | null>(null);
  const [showReport, setShowReport] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  const pauseRef = useRef(false);

  const startJobMatching = async () => {
    if (!profile) {
      toast.error('Please complete your profile first');
      return;
    }

    console.log('Starting job matching with profile:', profile);

    try {
      // Reset state
      setBatchState({
        isProcessing: true,
        isPaused: false,
        currentBatch: 0,
        totalBatches: 0,
        processedJobs: 0,
        totalJobs: 0,
        matches: []
      });
      pauseRef.current = false;

      // Create new abort controller
      abortControllerRef.current = new AbortController();

      // Process job matching with enhanced service
      await enhancedJobMatchingService.processJobMatching(
        {
          profile,
          batchSize: 5,
          minMatchScore: 60,
          signal: abortControllerRef.current.signal,
          pauseCheck: () => pauseRef.current
        },
        // Progress callback
        (progress) => {
          setBatchState(prev => ({
            ...prev,
            ...progress,
            isProcessing: true,
            isPaused: pauseRef.current
          }));
        },
        // Match callback (real-time updates)
        (match) => {
          setBatchState(prev => ({
            ...prev,
            matches: [...prev.matches, match].sort((a, b) => b.score - a.score)
          }));
        }
      );

      setBatchState(prev => ({
        ...prev,
        isProcessing: false
      }));

      // Get final match count from state
      setBatchState(prev => {
        toast.success(`Job matching complete! Found ${prev.matches.length} matches.`);
        return prev;
      });

    } catch (error) {
      console.error('Job matching error:', error);
      toast.error('An error occurred during job matching');
      setBatchState(prev => ({
        ...prev,
        isProcessing: false
      }));
    }
  };


  const pauseProcessing = () => {
    pauseRef.current = !pauseRef.current;
    setBatchState(prev => ({
      ...prev,
      isPaused: !prev.isPaused
    }));
  };

  const cancelProcessing = () => {
    abortControllerRef.current?.abort();
    setBatchState(prev => ({
      ...prev,
      isProcessing: false,
      isPaused: false
    }));
    toast.info('Job matching cancelled');
  };

  const viewJobDetails = (job: any) => {
    console.log('Navigating to job:', job);
    if (job && job.job_id) {
      navigate(`/jobs/${job.job_id}`);
    } else {
      toast.error('Job ID not found');
      console.error('Job object:', job);
    }
  };

  const viewMatchReport = (match: JobMatchResult) => {
    setSelectedMatch(match);
    setShowReport(true);
  };

  if (!isAuthenticated) {
    return (
      <Layout>
        <div className="container mx-auto py-8">
          <Card className="text-center py-12">
            <CardContent>
              <Brain className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Sign In Required
              </h3>
              <p className="text-gray-600 mb-4">
                Please sign in to access AI-powered job matching
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
            AI Job Matching
          </h1>
          <p className="text-gray-600 max-w-3xl mx-auto">
            Discover your perfect job matches with AI-powered analysis. We'll analyze hundreds of jobs 
            and show you the best matches in real-time.
          </p>
        </div>

        {/* Control Panel */}
        <Card>
          <CardHeader>
            <CardTitle>Job Matching Control Panel</CardTitle>
            <CardDescription>
              Start the AI matching process to find your ideal job opportunities
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {!batchState.isProcessing ? (
                <Button onClick={startJobMatching} className="w-full" size="lg">
                  <Play className="h-5 w-5 mr-2" />
                  Start Job Matching
                </Button>
              ) : (
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <Button
                      onClick={pauseProcessing}
                      variant="outline"
                      className="flex-1"
                    >
                      {batchState.isPaused ? (
                        <>
                          <Play className="h-4 w-4 mr-2" />
                          Resume
                        </>
                      ) : (
                        <>
                          <Pause className="h-4 w-4 mr-2" />
                          Pause
                        </>
                      )}
                    </Button>
                    <Button
                      onClick={cancelProcessing}
                      variant="destructive"
                      className="flex-1"
                    >
                      <StopCircle className="h-4 w-4 mr-2" />
                      Cancel
                    </Button>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Processing Batch {batchState.currentBatch} of {batchState.totalBatches}</span>
                      <span>{batchState.processedJobs} / {batchState.totalJobs} jobs analyzed</span>
                    </div>
                    <Progress 
                      value={(batchState.processedJobs / batchState.totalJobs) * 100} 
                      className="h-2"
                    />
                  </div>

                  {batchState.isPaused && (
                    <div className="flex items-center gap-2 text-yellow-600 text-sm">
                      <AlertCircle className="h-4 w-4" />
                      <span>Processing paused. Click Resume to continue.</span>
                    </div>
                  )}
                </div>
              )}

              <div className="flex items-center justify-between pt-4 border-t">
                <div className="text-sm text-gray-600">
                  <span className="font-medium">{batchState.matches.length}</span> matches found
                </div>
                <div className="text-sm text-gray-600">
                  Minimum match score: 60%
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Real-time Matches */}
        {batchState.matches.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Your Job Matches</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {batchState.matches.map((match, index) => (
                <Card key={`${match.job.id}-${index}`} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{match.job.title}</CardTitle>
                        <CardDescription>{match.job.company}</CardDescription>
                      </div>
                      <Badge className={
                        match.score >= 85 ? 'bg-green-100 text-green-800' :
                        match.score >= 70 ? 'bg-blue-100 text-blue-800' :
                        'bg-yellow-100 text-yellow-800'
                      }>
                        {match.score}% Match
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          <span>{match.job.location}</span>
                        </div>
                        {match.job.salary_range && (
                          <div className="flex items-center gap-1">
                            <DollarSign className="h-4 w-4" />
                            <span>{match.job.salary_range}</span>
                          </div>
                        )}
                      </div>

                      <div className="text-sm text-gray-600">
                        <p className="font-medium mb-1">Why it's a good fit:</p>
                        <p className="text-xs">{match.analysis.whyGoodFit.substring(0, 100)}...</p>
                      </div>

                      <div className="flex gap-2 pt-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => viewJobDetails(match.job)}
                          className="flex-1"
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View Job
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => viewMatchReport(match)}
                          className="flex-1"
                        >
                          <FileText className="h-4 w-4 mr-1" />
                          View Report
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Match Report Dialog */}
        <Dialog open={showReport} onOpenChange={setShowReport}>
          <DialogContent className="max-w-3xl max-h-[80vh]">
            <DialogHeader>
              <DialogTitle>Job Match Report</DialogTitle>
              <DialogDescription>
                Personalized analysis for {selectedMatch?.job.title} at {selectedMatch?.job.company}
              </DialogDescription>
            </DialogHeader>
            <ScrollArea className="h-[60vh] pr-4">
              {selectedMatch && (
                <div className="space-y-6">
                  <div>
                    <h3 className="font-semibold mb-2 flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      Match Score: {selectedMatch.score}%
                    </h3>
                    <Progress value={selectedMatch.score} className="h-3" />
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2">Why You're a Great Fit</h3>
                    <p className="text-gray-600">{selectedMatch.analysis.whyGoodFit}</p>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2">Your Key Strengths</h3>
                    <ul className="space-y-1">
                      {selectedMatch.analysis.keyStrengths.map((strength, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                          <span className="text-gray-600">{strength}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2">Areas to Highlight</h3>
                    <ul className="space-y-1">
                      {selectedMatch.analysis.improvementAreas.map((area, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <AlertCircle className="h-4 w-4 text-yellow-500 mt-0.5" />
                          <span className="text-gray-600">{area}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2">Application Tips</h3>
                    <ul className="space-y-1">
                      {selectedMatch.analysis.applicationTips.map((tip, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <Brain className="h-4 w-4 text-blue-500 mt-0.5" />
                          <span className="text-gray-600">{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="pt-4 border-t">
                    <Button 
                      className="w-full"
                      onClick={() => viewJobDetails(selectedMatch.job)}
                    >
                      Apply for This Position
                    </Button>
                  </div>
                </div>
              )}
            </ScrollArea>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}
