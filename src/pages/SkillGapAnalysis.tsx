import React, { useState } from 'react';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { skillGapAnalysisService, SkillGapAnalysis, LearningResource } from '../services/skill-gap-analysis.service';
import { Upload, Target, TrendingUp, BookOpen, Clock, Star, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';

const SkillGapAnalysisPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<SkillGapAnalysis | null>(null);
  const [learningResources, setLearningResources] = useState<{ [skill: string]: LearningResource[] }>({});
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState('');
  const [targetRole, setTargetRole] = useState('');

  const analyzeSkillGap = async () => {
    if (!resumeFile && !jobDescription && !targetRole) {
      toast.error('Please provide at least a resume file, job description, or target role');
      return;
    }

    setLoading(true);
    try {
      const result = await skillGapAnalysisService.analyzeSkillGap({
        candidate_resume: resumeFile || undefined,
        job_description: jobDescription || undefined,
        target_role: targetRole || undefined
      });
      setAnalysis(result);
      toast.success('Skill gap analysis completed!');

      // Load learning resources for identified gaps
      if (result.skill_gaps.length > 0) {
        const resourcePromises = result.skill_gaps.slice(0, 3).map(async (gap) => {
          try {
            const resources = await skillGapAnalysisService.getLearningResources(gap.skill);
            return { skill: gap.skill, resources: resources.resources };
          } catch (error) {
            return { skill: gap.skill, resources: [] };
          }
        });

        const resourceResults = await Promise.all(resourcePromises);
        const resourcesMap = resourceResults.reduce((acc, result) => {
          acc[result.skill] = result.resources;
          return acc;
        }, {} as { [skill: string]: LearningResource[] });
        
        setLearningResources(resourcesMap);
        console.log("Analysis:", result);
        console.log("Learning Resources:", resourcesMap);
      }
    } catch (error: any) {
      toast.error('Failed to analyze skill gap: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setResumeFile(file);
      toast.success('Resume uploaded successfully');
    }
  };

  const getImportanceColor = (importance: string) => {
    switch (importance) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'important': return 'bg-yellow-100 text-yellow-800';
      case 'nice-to-have': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Skill Gap Analysis
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Discover your skill gaps and get personalized learning recommendations to advance your career
          </p>
        </div>

      {/* Input Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            Analysis Input
          </CardTitle>
          <CardDescription>
            Provide your resume and target job information for comprehensive analysis
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="resume">Upload Resume (Optional)</Label>
                <div className="mt-2">
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Upload className="w-8 h-8 mb-2 text-gray-500" />
                      <p className="mb-2 text-sm text-gray-500">
                        {resumeFile ? resumeFile.name : 'Click to upload resume'}
                      </p>
                      <p className="text-xs text-gray-500">PDF, DOC, DOCX (MAX. 10MB)</p>
                    </div>
                    <input 
                      id="resume" 
                      type="file" 
                      className="hidden" 
                      accept=".pdf,.doc,.docx"
                      onChange={handleFileUpload}
                    />
                  </label>
                </div>
              </div>

              <div>
                <Label htmlFor="target-role">Target Role (Optional)</Label>
                <Input
                  id="target-role"
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  placeholder="e.g., Senior Frontend Developer"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="job-description">Job Description (Optional)</Label>
              <Textarea
                id="job-description"
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste the job description you're interested in..."
                className="min-h-[160px]"
              />
            </div>
          </div>

          <Button 
            onClick={analyzeSkillGap} 
            disabled={loading}
            className="w-full"
          >
            {loading ? 'Analyzing...' : 'Analyze Skill Gap'}
          </Button>
        </CardContent>
      </Card>

      {/* Results */}
      {analysis && (
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="gaps">Skill Gaps</TabsTrigger>
            <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
            <TabsTrigger value="resources">Learning Resources</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Overall Match</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-2">
                    <div className="text-3xl font-bold text-blue-600">
                      {analysis.overall_match}%
                    </div>
                    <Progress value={analysis.overall_match} className="flex-1" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Skill Gaps</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-red-600">
                    {analysis.skill_gaps.length}
                  </div>
                  <p className="text-sm text-gray-600">Areas for improvement</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Strengths</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-600">
                    {analysis.strengths.length}
                  </div>
                  <p className="text-sm text-gray-600">Your strong skills</p>
                </CardContent>
              </Card>
            </div>

            {analysis.strengths.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="w-5 h-5 text-yellow-500" />
                    Your Strengths
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {analysis.strengths.map((strength, index) => (
                      <Badge key={index} variant="secondary" className="bg-green-100 text-green-800">
                        {strength}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {analysis.career_progression && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-blue-500" />
                    Career Progression
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Current Role Fit</Label>
                      <div className="flex items-center space-x-2 mt-1">
                        <Progress value={analysis.career_progression.current_role_fit} className="flex-1" />
                        <span className="text-sm font-medium">{analysis.career_progression.current_role_fit}%</span>
                      </div>
                    </div>
                    <div>
                      <Label>Next Level Readiness</Label>
                      <div className="flex items-center space-x-2 mt-1">
                        <Progress value={analysis.career_progression.next_level_readiness} className="flex-1" />
                        <span className="text-sm font-medium">{analysis.career_progression.next_level_readiness}%</span>
                      </div>
                    </div>
                  </div>
                  {analysis.career_progression.suggested_roles.length > 0 && (
                    <div>
                      <Label className="mb-2 block">Suggested Next Roles</Label>
                      <div className="flex flex-wrap gap-2">
                        {analysis.career_progression.suggested_roles.map((role, index) => (
                          <Badge key={index} variant="outline">{role}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="gaps" className="space-y-4">
            {analysis.skill_gaps.map((gap, index) => (
              <Card key={index}>
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-semibold text-lg">{gap.skill}</h3>
                      <Badge className={getImportanceColor(gap.importance)}>
                        {gap.importance}
                      </Badge>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-600">Learning Time</div>
                      <div className="font-medium">{gap.estimated_learning_time}</div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Current Level</span>
                        <span>{gap.current_level}/10</span>
                      </div>
                      <Progress value={gap.current_level * 10} className="h-2" />
                    </div>

                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Required Level</span>
                        <span>{gap.required_level}/10</span>
                      </div>
                      <Progress value={gap.required_level * 10} className="h-2" />
                    </div>

                    {gap.learning_resources.length > 0 && (
                      <div>
                        <Label className="text-sm">Recommended Resources</Label>
                        <ul className="list-disc list-inside text-sm text-gray-600 mt-1">
                          {gap.learning_resources.slice(0, 3).map((resource, i) => (
                            <li key={i}>{resource}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="recommendations" className="space-y-4">
            {analysis.recommendations.map((rec, index) => (
              <Card key={index}>
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className={getPriorityColor(rec.priority)}>
                          {rec.priority} priority
                        </Badge>
                        <Clock className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-600">{rec.timeline}</span>
                      </div>
                      <h3 className="font-semibold mb-2">{rec.action}</h3>
                      <p className="text-gray-600 text-sm">{rec.rationale}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="resources" className="space-y-6">
            {Object.entries(learningResources).map(([skill, resources]) => (
              <Card key={skill}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5" />
                    Learning Resources for {skill}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {resources.slice(0, 6).map((resource, index) => (
                      <div key={index} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-2">
                          <Badge variant="outline">{resource.type}</Badge>
                          <Badge variant={resource.cost === 'free' ? 'secondary' : 'default'}>
                            {resource.cost}
                          </Badge>
                        </div>
                        <h4 className="font-medium mb-1">{resource.title}</h4>
                        <p className="text-sm text-gray-600 mb-2">{resource.provider}</p>
                        <p className="text-xs text-gray-500 mb-3">{resource.description}</p>
                        <div className="flex justify-between items-center text-xs">
                          <span>{resource.duration}</span>
                          <div className="flex items-center gap-1">
                            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                            <span>{resource.rating}</span>
                          </div>
                        </div>
                        <Button size="sm" variant="outline" className="w-full mt-2">
                          <ExternalLink className="w-3 h-3 mr-1" />
                          View Resource
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        </Tabs>
        )}
      </div>
    </Layout>
  );
};

export default SkillGapAnalysisPage;