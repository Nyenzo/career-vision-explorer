import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { interviewService } from '../../services/interview.service';
import { 
  Brain, Briefcase, Code, Users, RefreshCw, Star, 
  Lightbulb, AlertCircle, CheckCircle2, Target,
  BookOpen, MessageSquare, TrendingUp, Sparkles,
  ChevronRight, Clock, Award, Zap
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/use-auth';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

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
  { value: 'Technical', label: 'Technical Skills', icon: Code, color: 'blue', bgColor: 'bg-blue-100', borderColor: 'border-blue-300' },
  { value: 'Behavioral', label: 'Behavioral', icon: Users, color: 'green', bgColor: 'bg-green-100', borderColor: 'border-green-300' },
  { value: 'Situational', label: 'Situational', icon: Briefcase, color: 'purple', bgColor: 'bg-purple-100', borderColor: 'border-purple-300' },
  { value: 'Job_Specific', label: 'Job Specific', icon: Target, color: 'orange', bgColor: 'bg-orange-100', borderColor: 'border-orange-300' },
  { value: 'Skill_Based', label: 'Skill Based', icon: BookOpen, color: 'red', bgColor: 'bg-red-100', borderColor: 'border-red-300' },
  { value: 'Culture_Fit', label: 'Culture Fit', icon: Star, color: 'yellow', bgColor: 'bg-yellow-100', borderColor: 'border-yellow-300' }
];

const getCategoryIcon = (category: string) => {
  const option = focusAreaOptions.find(opt => opt.value === category);
  return option ? <option.icon className="w-5 h-5" /> : <Brain className="w-5 h-5" />;
};

const getCategoryStyle = (category: string) => {
  const option = focusAreaOptions.find(opt => opt.value === category);
  return option || { color: 'gray', bgColor: 'bg-gray-100', borderColor: 'border-gray-300' };
};

export const InterviewPreparation: React.FC = () => {
  const { profile, isLoading: profileLoading } = useAuth();
  const [questions, setQuestions] = useState<CategorizedQuestions>({});
  const [loading, setLoading] = useState(false);
  const [hasGeneratedQuestions, setHasGeneratedQuestions] = useState(false);
  const [questionCount, setQuestionCount] = useState([10]);
  const [selectedFocusAreas, setSelectedFocusAreas] = useState<string[]>(['Technical', 'Behavioral']);
  const [profileSummary, setProfileSummary] = useState<ProfileSummary | null>(null);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);

  // Check profile completeness
  const checkProfileCompleteness = () => {
    if (!profile) return { isComplete: false, missing: ['profile'] };
    
    const missing = [];
    if (!profile.skills || profile.skills.length === 0) missing.push('skills');
    if (!profile.work_experience || profile.work_experience.length === 0) {
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
        setExpandedCategories(Object.keys(response.categorized_questions));
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

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center space-y-4"
      >
        <div className="flex justify-center">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full blur-xl opacity-20 animate-pulse"></div>
            <Brain className="w-16 h-16 text-blue-600 relative" />
          </div>
        </div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          AI Interview Coach
        </h1>
        <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Get personalized interview questions based on your unique profile and prepare with confidence
        </p>
      </motion.div>

      {/* Main Control Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Card className="border-2 hover:shadow-xl transition-shadow duration-300">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20">
            <CardTitle className="flex items-center gap-3">
              <div className="p-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                <Sparkles className="w-5 h-5 text-purple-600" />
              </div>
              Customize Your Interview Preparation
            </CardTitle>
            <CardDescription>
              Select your preferences to generate targeted interview questions
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-8 pt-6">
            {/* Question Count Slider */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-base font-semibold">Number of Questions</Label>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-lg font-bold px-3 py-1">
                    {questionCount[0]}
                  </Badge>
                  <span className="text-sm text-gray-500">questions</span>
                </div>
              </div>
              <Slider
                value={questionCount}
                onValueChange={setQuestionCount}
                min={5}
                max={20}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>Quick Practice</span>
                <span>Comprehensive Prep</span>
              </div>
            </div>

            {/* Focus Areas Selection */}
            <div className="space-y-4">
              <Label className="text-base font-semibold">Focus Areas</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {focusAreaOptions.map(area => {
                  const isSelected = selectedFocusAreas.includes(area.value);
                  return (
                    <motion.button
                      key={area.value}
                      onClick={() => toggleFocusArea(area.value)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={cn(
                        "p-4 rounded-lg border-2 transition-all duration-200",
                        "flex flex-col items-center gap-2 cursor-pointer",
                        isSelected ? [
                          area.bgColor,
                          area.borderColor,
                          `text-${area.color}-700`
                        ] : [
                          "bg-white dark:bg-gray-800",
                          "border-gray-200 dark:border-gray-700",
                          "hover:border-gray-300 dark:hover:border-gray-600"
                        ]
                      )}
                    >
                      <area.icon className={cn(
                        "w-6 h-6",
                        isSelected ? `text-${area.color}-600` : "text-gray-500"
                      )} />
                      <span className={cn(
                        "text-sm font-medium",
                        isSelected ? `text-${area.color}-700` : "text-gray-700 dark:text-gray-300"
                      )}>
                        {area.label}
                      </span>
                      {isSelected && (
                        <CheckCircle2 className={`w-4 h-4 text-${area.color}-600`} />
                      )}
                    </motion.button>
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

            {/* Profile Status */}
            {profile && !checkProfileCompleteness().isComplete && (
              <Alert className="border-amber-200 bg-amber-50 dark:bg-amber-950/20">
                <AlertCircle className="h-4 w-4 text-amber-600" />
                <AlertDescription className="text-amber-800 dark:text-amber-200">
                  Your profile is incomplete. Add {checkProfileCompleteness().missing.join(', ')} 
                  for more personalized questions.
                </AlertDescription>
              </Alert>
            )}

            {/* Generate Button */}
            <div className="flex justify-center pt-4">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button 
                  onClick={generateQuestions} 
                  disabled={loading || !profile || selectedFocusAreas.length === 0}
                  size="lg"
                  className={cn(
                    "gap-3 px-8 py-6 text-lg font-semibold rounded-xl shadow-lg",
                    "bg-gradient-to-r from-blue-600 to-purple-600",
                    "hover:from-blue-700 hover:to-purple-700",
                    "disabled:from-gray-400 disabled:to-gray-500",
                    "transition-all duration-300"
                  )}
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
                      <Zap className="w-5 h-5" />
                      Generate Interview Questions
                    </>
                  )}
                </Button>
              </motion.div>
            </div>

            {!profile && !profileLoading && (
              <div className="text-center text-sm text-gray-500">
                Please log in and complete your profile to generate personalized interview questions
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Generated Questions Display */}
      <AnimatePresence>
        {Object.keys(questions).length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            {/* Header */}
            <div className="flex items-center justify-between">
              <h2 className="text-3xl font-bold flex items-center gap-3">
                Your Interview Questions
                <Badge variant="secondary" className="text-base px-3 py-1">
                  {totalQuestions} Total
                </Badge>
              </h2>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Clock className="w-4 h-4" />
                <span>Estimated prep time: {Math.ceil(totalQuestions * 5)} minutes</span>
              </div>
            </div>

            {/* Profile Summary */}
            {profileSummary && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border-green-200">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                      Questions Tailored to Your Profile
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="flex items-center gap-2">
                        <Award className="w-4 h-4 text-green-600" />
                        <div>
                          <p className="text-xs text-gray-500">Experience</p>
                          <p className="font-semibold">{profileSummary.years_of_experience} years</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Briefcase className="w-4 h-4 text-green-600" />
                        <div>
                          <p className="text-xs text-gray-500">Current Role</p>
                          <p className="font-semibold text-sm">{profileSummary.current_role || 'Not specified'}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Code className="w-4 h-4 text-green-600" />
                        <div>
                          <p className="text-xs text-gray-500">Skills</p>
                          <p className="font-semibold">{profileSummary.skills.length} matched</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-green-600" />
                        <div>
                          <p className="text-xs text-gray-500">Projects</p>
                          <p className="font-semibold">{profileSummary.projects.length} included</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Questions by Category */}
            <div className="space-y-4">
              {Object.entries(questions).map(([category, categoryQuestions], categoryIndex) => {
                const categoryStyle = getCategoryStyle(category);
                const isExpanded = expandedCategories.includes(category);
                
                return (
                  <motion.div
                    key={category}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: categoryIndex * 0.1 }}
                  >
                    <Card className="overflow-hidden border-2 hover:shadow-lg transition-all duration-300">
                      <CardHeader 
                        className={cn(
                          "cursor-pointer select-none",
                          categoryStyle.bgColor,
                          "hover:opacity-90 transition-opacity"
                        )}
                        onClick={() => toggleCategory(category)}
                      >
                        <CardTitle className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={cn(
                              "p-2 rounded-lg",
                              `bg-${categoryStyle.color}-200 dark:bg-${categoryStyle.color}-900/50`
                            )}>
                              {getCategoryIcon(category)}
                            </div>
                            <span className={`text-${categoryStyle.color}-700 dark:text-${categoryStyle.color}-300`}>
                              {category.replace('_', ' ')} Questions
                            </span>
                          </div>
                          <div className="flex items-center gap-3">
                            <Badge variant="secondary" className="font-bold">
                              {categoryQuestions.length}
                            </Badge>
                            <ChevronRight className={cn(
                              "w-5 h-5 transition-transform duration-200",
                              isExpanded && "rotate-90"
                            )} />
                          </div>
                        </CardTitle>
                      </CardHeader>
                      
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0 }}
                            animate={{ height: "auto" }}
                            exit={{ height: 0 }}
                            transition={{ duration: 0.3 }}
                            style={{ overflow: "hidden" }}
                          >
                            <CardContent className="pt-6 space-y-4">
                              {categoryQuestions.map((question, index) => (
                                <motion.div
                                  key={index}
                                  initial={{ opacity: 0, y: 10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ duration: 0.3, delay: index * 0.05 }}
                                >
                                  <Card className={cn(
                                    "border-l-4 hover:shadow-md transition-all duration-200",
                                    `border-l-${categoryStyle.color}-500`
                                  )}>
                                    <CardContent className="pt-6">
                                      <div className="space-y-4">
                                        {/* Question */}
                                        <div className="flex items-start gap-3">
                                          <Badge 
                                            variant="outline" 
                                            className={cn(
                                              "mt-1 font-bold",
                                              `text-${categoryStyle.color}-600 border-${categoryStyle.color}-300`
                                            )}
                                          >
                                            Q{index + 1}
                                          </Badge>
                                          <p className="font-medium text-base flex-1">
                                            {question.question}
                                          </p>
                                        </div>

                                        {/* Guidance Accordion */}
                                        <Accordion type="single" collapsible className="w-full">
                                          {question.candidate_advice && (
                                            <AccordionItem value="advice" className="border-none">
                                              <AccordionTrigger className="text-sm hover:no-underline py-2 px-4 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">
                                                <div className="flex items-center gap-2 text-blue-600">
                                                  <Lightbulb className="w-4 h-4" />
                                                  How to Answer This Question
                                                </div>
                                              </AccordionTrigger>
                                              <AccordionContent>
                                                <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg mt-2">
                                                  <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                                                    {question.candidate_advice}
                                                  </p>
                                                </div>
                                              </AccordionContent>
                                            </AccordionItem>
                                          )}

                                          {question.employer_guidance && (
                                            <AccordionItem value="employer" className="border-none">
                                              <AccordionTrigger className="text-sm hover:no-underline py-2 px-4 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">
                                                <div className="flex items-center gap-2 text-green-600">
                                                  <Target className="w-4 h-4" />
                                                  What Interviewers Look For
                                                </div>
                                              </AccordionTrigger>
                                              <AccordionContent>
                                                <div className="bg-green-50 dark:bg-green-950/20 p-4 rounded-lg mt-2">
                                                  <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
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
                                </motion.div>
                              ))}
                            </CardContent>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </Card>
                  </motion.div>
                );
              })}
            </div>

            {/* Tips Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <Card className="bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-purple-950/20 dark:via-pink-950/20 dark:to-blue-950/20 border-2 border-purple-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-xl">
                    <div className="p-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                      <TrendingUp className="w-5 h-5 text-purple-600" />
                    </div>
                    Pro Interview Tips
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-4">
                    {[
                      { icon: MessageSquare, tip: "Practice your answers out loud to improve fluency and confidence" },
                      { icon: Star, tip: "Use the STAR method (Situation, Task, Action, Result) for behavioral questions" },
                      { icon: Target, tip: "Prepare specific examples from your experience for each question type" },
                      { icon: Users, tip: "Research the company culture and values to align your answers" },
                      { icon: Clock, tip: "Keep your answers concise - aim for 2-3 minutes per response" },
                      { icon: CheckCircle2, tip: "End each answer with how it relates to the role you're applying for" }
                    ].map((item, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                        className="flex items-start gap-3"
                      >
                        <div className="p-1.5 bg-purple-100 dark:bg-purple-900/50 rounded-lg">
                          <item.icon className="w-4 h-4 text-purple-600" />
                        </div>
                        <span className="text-sm text-gray-700 dark:text-gray-300">{item.tip}</span>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
