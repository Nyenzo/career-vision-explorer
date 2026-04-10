
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Clock, Users, DollarSign, TrendingUp, CheckCircle2, Circle, ArrowRight } from "lucide-react";
import { useCareerPaths } from "@/hooks/use-career-paths";
import { useToast } from "@/hooks/use-toast";

const CareerPathVisualizer = () => {
  const { careerPaths } = useCareerPaths();
  const { toast } = useToast();
  const [selectedPathId, setSelectedPathId] = useState<string>(careerPaths[0]?.id || "");
  const [currentStep, setCurrentStep] = useState(0);

  const selectedPath = careerPaths.find(path => path.id === selectedPathId);

  const handleStepClick = (stepIndex: number) => {
    setCurrentStep(stepIndex);
    toast({
      title: "Step Selected",
      description: `Now viewing: ${selectedPath?.steps[stepIndex]?.title}`,
    });
  };

  const handleStartPath = () => {
    toast({
      title: "Career Path Started",
      description: `You've started the ${selectedPath?.title} career path!`,
    });
  };

  if (!selectedPath) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No career paths available</p>
      </div>
    );
  }

  const progress = ((currentStep + 1) / selectedPath.steps.length) * 100;

  return (
    <div className="space-y-6">
      {/* Path Selection */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold mb-2">Select Career Path</h3>
          <Select value={selectedPathId} onValueChange={setSelectedPathId}>
            <SelectTrigger className="w-full sm:w-80">
              <SelectValue placeholder="Choose a career path" />
            </SelectTrigger>
            <SelectContent>
              {careerPaths.map((path) => (
                <SelectItem key={path.id} value={path.id}>
                  {path.title} - {path.category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button onClick={handleStartPath} className="w-full sm:w-auto">
          Start This Path
        </Button>
      </div>

      {/* Path Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {selectedPath.title}
            <Badge variant={selectedPath.difficulty === 'Beginner' ? 'secondary' : 
                         selectedPath.difficulty === 'Intermediate' ? 'default' : 'destructive'}>
              {selectedPath.difficulty}
            </Badge>
          </CardTitle>
          <CardDescription>{selectedPath.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-blue-600" />
              <span className="text-sm">Duration: {selectedPath.estimatedDuration}</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-green-600" />
              <span className="text-sm">Category: {selectedPath.category}</span>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-purple-600" />
              <span className="text-sm">Steps: {selectedPath.steps.length}</span>
            </div>
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-orange-600" />
              <span className="text-sm">Salary: $50K-120K</span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progress</span>
              <span>{Math.round(progress)}% Complete</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Steps Visualization */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Learning Path Steps</h3>
        <div className="space-y-4">
          {selectedPath.steps.map((step, index) => (
            <Card 
              key={step.id}
              className={`cursor-pointer transition-all ${
                index === currentStep 
                  ? 'ring-2 ring-blue-500 bg-blue-50' 
                  : index < currentStep 
                    ? 'bg-green-50 border-green-200' 
                    : 'hover:shadow-md'
              }`}
              onClick={() => handleStepClick(index)}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 mt-1">
                    {index < currentStep ? (
                      <CheckCircle2 className="h-6 w-6 text-green-600" />
                    ) : index === currentStep ? (
                      <Circle className="h-6 w-6 text-blue-600 fill-blue-600" />
                    ) : (
                      <Circle className="h-6 w-6 text-gray-400" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">
                        Step {step.order}: {step.title}
                      </h4>
                      <Badge variant="outline" className="text-xs">
                        <Clock className="h-3 w-3 mr-1" />
                        {step.estimatedDuration}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      {step.description}
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {step.requiredSkills.map((skill) => (
                        <Badge key={skill} variant="secondary" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  {index < selectedPath.steps.length - 1 && (
                    <ArrowRight className="h-4 w-4 text-muted-foreground mt-8" />
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Current Step Details */}
      {selectedPath.steps[currentStep] && (
        <Card>
          <CardHeader>
            <CardTitle>Current Step Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">{selectedPath.steps[currentStep].title}</h4>
                <p className="text-muted-foreground">{selectedPath.steps[currentStep].description}</p>
              </div>
              <div>
                <h5 className="font-medium mb-2">Required Skills:</h5>
                <div className="flex flex-wrap gap-2">
                  {selectedPath.steps[currentStep].requiredSkills.map((skill) => (
                    <Badge key={skill} variant="outline">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  disabled={currentStep === 0}
                  onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
                >
                  Previous Step
                </Button>
                <Button 
                  size="sm"
                  disabled={currentStep === selectedPath.steps.length - 1}
                  onClick={() => setCurrentStep(Math.min(selectedPath.steps.length - 1, currentStep + 1))}
                >
                  Next Step
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CareerPathVisualizer;
