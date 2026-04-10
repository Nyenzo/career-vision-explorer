import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { interviewService } from '../../services/interview.service';
import { 
  Brain, Briefcase, Code, Users, RefreshCw, Star, 
  Lightbulb, AlertCircle, CheckCircle2, Target,
  BookOpen, MessageSquare, TrendingUp
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/use-auth';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

interface DetailedInterviewQuestion {
  question: string;
  employer_guidance?: string;
  candidate_advice?: string;
}

interface CategorizedQuestions {
  [category: string]: DetailedInterviewQuestion[];
}

interface ProfileSummary {
  skills: string[];
  work_experience: any[];
  education: string;
  projects: any[];
  years_of_experience: number;
  current_role: string;
}

const focusAreaOptions = [
  { 
    value: 'Technical', 
    label: 'Technical Skills', 
    icon: Code, 
    color: 'text-blue-600',
    bgColor: 'bg-blue-50 dark:bg-blue-950/20',
    borderColor: 'border-blue-200 dark:border-blue-800',
    selectedBg: 'bg-blue-100 dark:bg-blue-900/40'
  },
  { 
    value: 'Behavioral', 
    label: 'Behavioral', 
    icon: Users, 
    color: 'text-green-600',
    bgColor: 'bg-green-50 dark:bg-green-950/20',
    borderColor: 'border-green-200 dark:border-green-800',
    selectedBg: 'bg-green-100 dark:bg-green-900/40'
  },
  { 
    value: 'Situational', 
    label: 'Situational', 
    icon: Briefcase, 
    color: 'text-purple-600',
    bgColor: 'bg-purple-50 dark:bg-purple-950/20',
    borderColor: 'border-purple-200 dark:border-purple-800',
    selectedBg: 'bg-purple-100 dark:bg-purple-900/40'
  },
  { 
    value: 'Job_Specific', 
    label: 'Job Specific', 
    icon: Target, 
    color: 'text-orange-600',
    bgColor: 'bg-orange-50 dark:bg-orange-950/20',
    borderColor: 'border-orange-200 dark:border-orange-800',
    selectedBg: 'bg-orange-100 dark:bg-orange-900/40'
  },
  { 
    value: 'Skill_Based', 
    label: 'Skill Based', 
    icon: BookOpen, 
    color: 'text-red-600',
    bgColor: 'bg-red-50 dark:bg-red-950/20',
    borderColor: 'border-red-200 dark:border-red-800',
    selectedBg: 'bg-red-100 dark:bg-red-900/40'
  },
  { 
    value: 'Culture_Fit', 
    label: 'Culture Fit', 
    icon: Star, 
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50 dark:bg-yellow-950/20',
    borderColor: 'border-yellow-200 dark:border-yellow-800',
    selectedBg: 'bg-yellow-100 dark:bg-yellow-900/40'
  }
];

const getCategoryIcon = (category: string) => {
  const option = focusAreaOptions.find(opt => opt.value === category);
  return option ? <option.icon className="w-4 h-4" /> : <Brain className="w-4 h-4" />;
};

const getCategoryColor = (category: string) => {
  const option = focusAreaOptions.find(opt => opt.value === category);
  return option ? option.color : 'text-gray-600';
};

export const InterviewPreparation: React.FC = () => {
  const { profile, isLoading: profileLoading } = useAuth();
  const [questions, setQuestions] = useState<CategorizedQuestions>({});
  const [loading, setLoading] = useState(false);
  const [hasGeneratedQuestions, setHasGeneratedQuestions] = useState(false);
  const [questionCount, setQuestionCount] = useState<number[]>([10]);
  const [selectedFocusAreas, setSelectedFocusAreas] = useState<string[]>(['Technical', 'Behavioral']);
  const [profileSummary, setProfileSummary] = useState<ProfileSummary | null>(null);
  const [totalQuestions, setTotalQuestions] = useState(0);

  // Check profile completeness
  const checkProfileCompleteness = () => {
    if (!profile) return { isComplete: false, missing: ['profile'] };
    
    const missing = [];
    if (!profile.skills || profile.skills.length === 0) missing.push('skills');
    if (!profile.work_experience || profile.work_experience.length === 0) {
      // Work experience is optional, so we'll just check if they have skills
      if (!profile.education && !profile.bio) {
        missing.push('work experience or education');
      }
    }
    
    return {
      isComplete: missing.length === 0,
      missing
    };
  };

  const generateQuestions = async () => {
    if (!profile) {
      toast.error('Please log in to generate personalized interview questions');
      return;
    }

    const profileCheck = checkProfileCompleteness();
    if (!profileCheck.isComplete) {
      toast.error(`Please complete your profile: ${profileCheck.missing.join(', ')} required`);
      return;
    }

    setLoading(true);
    try {
      const response = await interviewService.getProfileBasedQuestions({
        question_count: questionCount[0],
        focus_areas: selectedFocusAreas
      });

      if (response.categorized_questions) {
        setQuestions(response.categorized_questions);
        setTotalQuestions(response.total_questions || 0);
        setProfileSummary(response.profile_summary);
        setHasGeneratedQuestions(true);
        toast.success(`Generated ${response.total_questions} personalized interview questions!`);
      }
    } catch (error: any) {
      console.error('Error generating questions:', error);
      toast.error(error.message || 'Failed to generate interview questions');
    } finally {
      setLoading(false);
    }
  };

  const toggleFocusArea = (area: string) => {
    setSelectedFocusAreas(prev => 
      prev.includes(area) 
        ? prev.filter(a => a !== area)
        : [...prev, area]
    );
  };

  return (
    <div className="space-y-6">
      {/* Main Control Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5" />
            AI-Powered Interview Preparation
          </CardTitle>
          <CardDescription>
            Generate personalized interview questions based on your professional profile
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Question Count Selector */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-base font-semibold">Number of Questions</Label>
              <Badge variant="secondary" className="text-sm">
                {questionCount[0]} questions selected
              </Badge>
            </div>
            
            <div className="grid grid-cols-4 gap-2">
              {[5, 10, 15, 20].map((count) => (
                <button
                  key={count}
                  onClick={() => setQuestionCount([count])}
                  className={`
                    relative p-4 rounded-lg border-2 transition-all duration-200
                    ${questionCount[0] === count
                      ? 'bg-blue-100 dark:bg-blue-900/40 border-blue-400 dark:border-blue-600 shadow-sm'
                      : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    }
                  `}
                >
                  <div className="text-center space-y-1">
                    <div className={`text-2xl font-bold ${
                      questionCount[0] === count ? 'text-blue-600' : 'text-gray-700 dark:text-gray-300'
                    }`}>
                      {count}
                    </div>
                    <div className="text-xs text-gray-500">
                      {count <= 5 ? 'Quick' : count <= 10 ? 'Standard' : count <= 15 ? 'Thorough' : 'Complete'}
                    </div>
                    <div className="text-xs text-gray-400">
                      ~{count * 4} mins
                    </div>
                  </div>
                  {questionCount[0] === count && (
                    <div className="absolute top-2 right-2">
                      <CheckCircle2 className="w-4 h-4 text-blue-600" />
                    </div>
                  )}
                </button>
              ))}
            </div>
            
            <p className="text-xs text-center text-gray-500">
              Choose based on your available preparation time
            </p>
          </div>

          {/* Focus Areas Selection */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-base font-semibold">Focus Areas</Label>
              <span className="text-xs text-gray-500">
                {selectedFocusAreas.length} selected
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {focusAreaOptions.map(area => {
                const isSelected = selectedFocusAreas.includes(area.value);
                return (
                  <button
                    key={area.value}
                    onClick={() => toggleFocusArea(area.value)}
                    className={`
                      relative p-4 rounded-lg border-2 transition-all duration-200
                      ${isSelected 
                        ? `${area.selectedBg} ${area.borderColor} shadow-sm` 
                        : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                      }
                    `}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${isSelected ? area.bgColor : 'bg-gray-100 dark:bg-gray-700'}`}>
                          <area.icon className={`w-5 h-5 ${isSelected ? area.color : 'text-gray-500'}`} />
                        </div>
                        <span className={`font-medium text-sm ${isSelected ? area.color : 'text-gray-700 dark:text-gray-300'}`}>
                          {area.label}
                        </span>
                      </div>
                      {isSelected && (
                        <CheckCircle2 className={`w-4 h-4 ${area.color}`} />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
            {selectedFocusAreas.length === 0 && (
              <p className="text-sm text-amber-600 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                Please select at least one focus area
              </p>
            )}
          </div>

          {/* Profile Completeness Check */}
          {profile && !checkProfileCompleteness().isComplete && (
            <Alert className="border-yellow-200 bg-yellow-50">
              <AlertCircle className="h-4 w-4 text-yellow-600" />
              <AlertDescription className="text-yellow-800">
                Your profile is incomplete. Please add {checkProfileCompleteness().missing.join(', ')} 
                for better personalized questions.
              </AlertDescription>
            </Alert>
          )}

          {/* Generate Button */}
          <div className="space-y-4">
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 p-6 rounded-lg">
              <div className="text-center space-y-4">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Ready to generate your personalized interview questions?
                  </p>
                  <p className="text-xs text-gray-500">
                    Estimated prep time: {questionCount[0] * 3}-{questionCount[0] * 5} minutes
                  </p>
                </div>
                
                <Button 
                  onClick={generateQuestions} 
                  disabled={loading || !profile || selectedFocusAreas.length === 0}
                  size="lg"
                  className="gap-3 px-8 py-6 text-base font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-5 h-5 animate-spin" />
                      Generating Your Questions...
                    </>
                  ) : hasGeneratedQuestions ? (
                    <>
                      <RefreshCw className="w-5 h-5" />
                      Generate New Questions
                    </>
                  ) : (
                    <>
                      <Brain className="w-5 h-5" />
                      Generate Interview Questions
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>

          {!profile && !profileLoading && (
            <div className="text-center text-sm text-gray-500">
              Please log in and complete your profile to generate personalized interview questions
            </div>
          )}
        </CardContent>
      </Card>

      {/* Generated Questions Display */}
      {Object.keys(questions).length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Your Interview Questions</h2>
            <Badge variant="secondary" className="text-sm">
              {totalQuestions} Questions Generated
            </Badge>
          </div>

          {/* Profile Summary Used */}
          {profileSummary && (
            <Card className="bg-gray-50 dark:bg-gray-900/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                  Generated based on your profile
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs">
                  <div>
                    <span className="font-medium">Experience:</span> {profileSummary.years_of_experience} years
                  </div>
                  <div>
                    <span className="font-medium">Role:</span> {profileSummary.current_role || 'Not specified'}
                  </div>
                  <div>
                    <span className="font-medium">Skills:</span> {profileSummary.skills.length} identified
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Questions by Category */}
          {Object.entries(questions).map(([category, categoryQuestions]) => (
            <Card key={category} className="overflow-hidden">
              <CardHeader className="bg-gray-50 dark:bg-gray-900/50">
                <CardTitle className={`flex items-center gap-2 text-lg ${getCategoryColor(category)}`}>
                  {getCategoryIcon(category)}
                  {category.replace('_', ' ')} Questions
                  <Badge variant="secondary" className="ml-auto">
                    {categoryQuestions.length} questions
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                {categoryQuestions.map((question, index) => (
                  <Card key={index} className="border-l-4 border-l-blue-500">
                    <CardContent className="pt-6">
                      <div className="space-y-4">
                        {/* Question */}
                        <div>
                          <div className="flex items-start gap-2">
                            <Badge variant="outline" className="mt-1">
                              Q{index + 1}
                            </Badge>
                            <p className="font-medium text-base flex-1">
                              {question.question}
                            </p>
                          </div>
                        </div>

                        {/* Guidance Accordion */}
                        <Accordion type="single" collapsible className="w-full">
                          {question.candidate_advice && (
                            <AccordionItem value="advice" className="border-none">
                              <AccordionTrigger className="text-sm hover:no-underline py-2">
                                <div className="flex items-center gap-2 text-blue-600">
                                  <Lightbulb className="w-4 h-4" />
                                  How to Answer This Question
                                </div>
                              </AccordionTrigger>
                              <AccordionContent>
                                <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg">
                                  <p className="text-sm text-gray-700 dark:text-gray-300">
                                    {question.candidate_advice}
                                  </p>
                                </div>
                              </AccordionContent>
                            </AccordionItem>
                          )}

                          {question.employer_guidance && (
                            <AccordionItem value="employer" className="border-none">
                              <AccordionTrigger className="text-sm hover:no-underline py-2">
                                <div className="flex items-center gap-2 text-green-600">
                                  <Target className="w-4 h-4" />
                                  What Interviewers Look For
                                </div>
                              </AccordionTrigger>
                              <AccordionContent>
                                <div className="bg-green-50 dark:bg-green-950/20 p-4 rounded-lg">
                                  <p className="text-sm text-gray-700 dark:text-gray-300">
                                    {question.employer_guidance}
                                  </p>
                                </div>
                              </AccordionContent>
                            </AccordionItem>
                          )}
                        </Accordion>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </CardContent>
            </Card>
          ))}

          {/* Tips Section */}
          <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <TrendingUp className="w-5 h-5" />
                Interview Success Tips
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5" />
                  <span>Practice your answers out loud to improve fluency and confidence</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5" />
                  <span>Use the STAR method (Situation, Task, Action, Result) for behavioral questions</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5" />
                  <span>Prepare specific examples from your experience for each question type</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5" />
                  <span>Research the company culture and values to align your answers</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};
