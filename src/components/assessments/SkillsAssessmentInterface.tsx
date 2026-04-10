
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle,
  CardFooter
} from "@/components/ui/card";
import { toast } from "sonner";

type QuestionType = 'multiple-choice' | 'coding' | 'situational';

interface AssessmentQuestion {
  id: number;
  type: QuestionType;
  question: string;
  options?: string[];
  correctAnswer?: string | number;
}

const mockQuestions: AssessmentQuestion[] = [
  {
    id: 1,
    type: 'multiple-choice',
    question: 'Which of the following is NOT a JavaScript data type?',
    options: ['String', 'Boolean', 'Float', 'Object'],
    correctAnswer: 2
  },
  {
    id: 2,
    type: 'multiple-choice',
    question: 'What does CSS stand for?',
    options: ['Computer Style Sheets', 'Creative Style Sheets', 'Cascading Style Sheets', 'Colorful Style Sheets'],
    correctAnswer: 2
  },
  {
    id: 3,
    type: 'situational',
    question: 'Your team member consistently submits work late. How would you address this issue?',
    options: [
      'Report them to the manager immediately',
      'Ignore it as it\'s not your responsibility',
      'Have a private conversation to understand the challenges they\'re facing',
      'Take over their tasks to ensure timely completion'
    ],
    correctAnswer: 2
  }
];

export const SkillsAssessmentInterface = () => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>(Array(mockQuestions.length).fill(null));
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [assessmentComplete, setAssessmentComplete] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);
  
  const handleOptionSelect = (optionIndex: number) => {
    setSelectedOption(optionIndex);
  };
  
  const handleNextQuestion = () => {
    if (selectedOption !== null) {
      // Save the answer
      const newAnswers = [...answers];
      newAnswers[currentQuestion] = selectedOption;
      setAnswers(newAnswers);
      
      // Move to next question or finish assessment
      if (currentQuestion < mockQuestions.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
        setSelectedOption(null);
      } else {
        completeAssessment(newAnswers);
      }
    } else {
      toast.error("Please select an answer before continuing");
    }
  };
  
  const completeAssessment = (finalAnswers: (number | null)[]) => {
    setAssessmentComplete(true);
    
    // Calculate score
    let correctCount = 0;
    finalAnswers.forEach((answer, index) => {
      if (answer === mockQuestions[index].correctAnswer) {
        correctCount++;
      }
    });
    
    const finalScore = Math.round((correctCount / mockQuestions.length) * 100);
    setScore(finalScore);
    
    toast.success("Assessment completed!", {
      description: `You scored ${finalScore}% on this assessment`
    });
  };
  
  const viewDetailedResults = () => {
    setShowResults(true);
  };
  
  const currentQ = mockQuestions[currentQuestion];
  const progress = ((currentQuestion + 1) / mockQuestions.length) * 100;
  
  return (
    <Card className="w-full max-w-3xl">
      <CardHeader>
        <CardTitle>Skills Assessment</CardTitle>
        <CardDescription>
          {!assessmentComplete 
            ? "Complete this assessment to improve your job match accuracy" 
            : "Assessment completed! Here's your result"}
        </CardDescription>
      </CardHeader>
      
      {!assessmentComplete ? (
        <>
          <CardContent>
            <div className="mb-4">
              <div className="flex justify-between text-sm mb-1">
                <span>Question {currentQuestion + 1} of {mockQuestions.length}</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} />
            </div>
            
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-4">{currentQ.question}</h3>
              
              <div className="space-y-3">
                {currentQ.options?.map((option, index) => (
                  <div 
                    key={index} 
                    className={`flex items-center space-x-2 p-3 rounded-md cursor-pointer border ${
                      selectedOption === index ? 'border-primary bg-primary/5' : 'border-gray-200'
                    }`}
                    onClick={() => handleOptionSelect(index)}
                  >
                    <Checkbox 
                      checked={selectedOption === index}
                      onCheckedChange={() => handleOptionSelect(index)}
                    />
                    <label className="text-sm cursor-pointer flex-grow">{option}</label>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
          
          <CardFooter>
            <Button 
              onClick={handleNextQuestion} 
              className="w-full"
              disabled={selectedOption === null}
            >
              {currentQuestion < mockQuestions.length - 1 ? 'Next Question' : 'Complete Assessment'}
            </Button>
          </CardFooter>
        </>
      ) : (
        <CardContent className="space-y-6">
          {!showResults ? (
            <div className="text-center space-y-4">
              <div className="inline-flex h-24 w-24 rounded-full bg-green-100 p-2">
                <div className="rounded-full bg-green-200 h-full w-full flex items-center justify-center">
                  <span className="text-2xl font-bold text-green-700">{score}%</span>
                </div>
              </div>
              
              <div className="space-y-2">
                <h3 className="text-xl font-medium">Assessment Complete!</h3>
                <p className="text-gray-500 text-sm">
                  {score >= 80 ? (
                    "Excellent! You've demonstrated strong knowledge in this area."
                  ) : score >= 60 ? (
                    "Good work! You've shown solid understanding with some room for growth."
                  ) : (
                    "You've completed the assessment. We've identified some areas for improvement."
                  )}
                </p>
              </div>
              
              <div className="pt-4 space-y-3">
                <Button 
                  onClick={viewDetailedResults}
                  className="w-full"
                >
                  View Detailed Results
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => window.location.href = '/skills'}
                >
                  See Recommended Courses
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <h3 className="text-lg font-medium">Question Analysis</h3>
              
              {mockQuestions.map((q, index) => {
                const isCorrect = answers[index] === q.correctAnswer;
                
                return (
                  <div key={q.id} className="border rounded-md p-4 space-y-2">
                    <div className="flex justify-between">
                      <span className="font-medium">Question {index + 1}</span>
                      <span className={isCorrect ? "text-green-600" : "text-red-600"}>
                        {isCorrect ? "Correct" : "Incorrect"}
                      </span>
                    </div>
                    <p className="text-sm">{q.question}</p>
                    
                    <div className="text-sm text-gray-500">
                      <p>Your answer: {q.options?.[answers[index] ?? 0]}</p>
                      <p>Correct answer: {q.options?.[q.correctAnswer as number]}</p>
                    </div>
                  </div>
                );
              })}
              
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => window.location.href = '/skills'}
              >
                See Recommended Courses
              </Button>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
};
