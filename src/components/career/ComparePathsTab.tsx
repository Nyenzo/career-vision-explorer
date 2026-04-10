
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart2, Clock, Users, TrendingUp, CheckCircle2 } from "lucide-react";
import { useCareerPaths } from "@/hooks/use-career-paths";
import { useToast } from "@/hooks/use-toast";

const ComparePathsTab = () => {
  const { careerPaths } = useCareerPaths();
  const { toast } = useToast();
  const [selectedPaths, setSelectedPaths] = useState<string[]>([]);

  const handlePathSelection = (pathId: string) => {
    setSelectedPaths(prev => {
      if (prev.includes(pathId)) {
        return prev.filter(id => id !== pathId);
      }
      if (prev.length >= 3) {
        toast({
          title: "Maximum Selection Reached",
          description: "You can compare up to 3 career paths at once.",
          variant: "destructive"
        });
        return prev;
      }
      return [...prev, pathId];
    });
  };

  const getSkillsCount = (pathId: string) => {
    const path = careerPaths.find(p => p.id === pathId);
    if (!path) return 0;
    const allSkills = path.steps.flatMap(step => step.requiredSkills);
    return [...new Set(allSkills)].length;
  };

  const getSalaryRange = (pathId: string) => {
    const path = careerPaths.find(p => p.id === pathId);
    if (!path) return "N/A";
    // Mock salary data based on path difficulty and category
    if (path.category === 'Development') {
      return path.difficulty === 'Beginner' ? '$45k - $65k' : 
             path.difficulty === 'Intermediate' ? '$65k - $95k' : '$95k - $130k';
    }
    if (path.category === 'Data Science') {
      return path.difficulty === 'Beginner' ? '$55k - $75k' : 
             path.difficulty === 'Intermediate' ? '$75k - $110k' : '$110k - $150k';
    }
    return '$40k - $120k';
  };

  const getJobGrowth = (pathId: string) => {
    const path = careerPaths.find(p => p.id === pathId);
    if (!path) return "N/A";
    // Mock job growth data
    return path.category === 'Development' ? '+22%' : 
           path.category === 'Data Science' ? '+35%' : '+15%';
  };

  return (
    <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
      <CardHeader className="text-center pb-6">
        <CardTitle className="text-2xl flex items-center justify-center gap-2">
          <BarChart2 className="h-6 w-6 text-blue-600" />
          Compare Career Paths
        </CardTitle>
        <CardDescription className="text-base">
          Select up to 3 career paths to compare side-by-side
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        {/* Path Selection */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Select Paths to Compare</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {careerPaths.map((path) => (
              <Card 
                key={path.id}
                className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                  selectedPaths.includes(path.id) 
                    ? 'ring-2 ring-blue-500 bg-blue-50 border-blue-200' 
                    : 'hover:border-gray-300'
                }`}
                onClick={() => handlePathSelection(path.id)}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-semibold text-lg">{path.title}</h4>
                        {selectedPaths.includes(path.id) && (
                          <CheckCircle2 className="h-5 w-5 text-blue-600" />
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">{path.category}</p>
                      <Badge 
                        variant={path.difficulty === 'Beginner' ? 'secondary' : 
                               path.difficulty === 'Intermediate' ? 'default' : 'destructive'}
                        className="text-xs"
                      >
                        {path.difficulty}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Comparison Table */}
        {selectedPaths.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold mb-6">Path Comparison</h3>
            <div className="overflow-x-auto">
              <div className="min-w-full">
                <table className="w-full border-collapse bg-white rounded-lg overflow-hidden shadow-sm">
                  <thead>
                    <tr className="bg-gray-50 border-b-2 border-gray-200">
                      <th className="text-left p-4 font-semibold text-gray-700 min-w-[140px]">Attribute</th>
                      {selectedPaths.map(pathId => {
                        const path = careerPaths.find(p => p.id === pathId);
                        return (
                          <th key={pathId} className="text-left p-4 font-semibold text-gray-700 min-w-[200px]">
                            {path?.title}
                          </th>
                        );
                      })}
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-gray-100">
                      <td className="p-4 font-medium text-gray-700 bg-gray-50">Duration</td>
                      {selectedPaths.map(pathId => {
                        const path = careerPaths.find(p => p.id === pathId);
                        return (
                          <td key={pathId} className="p-4">
                            <Badge variant="secondary" className="flex items-center gap-1 w-fit">
                              <Clock className="h-3 w-3" />
                              {path?.estimatedDuration}
                            </Badge>
                          </td>
                        );
                      })}
                    </tr>
                    <tr className="border-b border-gray-100">
                      <td className="p-4 font-medium text-gray-700 bg-gray-50">Difficulty</td>
                      {selectedPaths.map(pathId => {
                        const path = careerPaths.find(p => p.id === pathId);
                        return (
                          <td key={pathId} className="p-4">
                            <Badge variant={path?.difficulty === 'Beginner' ? 'secondary' : 
                                         path?.difficulty === 'Intermediate' ? 'default' : 'destructive'}>
                              {path?.difficulty}
                            </Badge>
                          </td>
                        );
                      })}
                    </tr>
                    <tr className="border-b border-gray-100">
                      <td className="p-4 font-medium text-gray-700 bg-gray-50">Learning Steps</td>
                      {selectedPaths.map(pathId => {
                        const path = careerPaths.find(p => p.id === pathId);
                        return (
                          <td key={pathId} className="p-4">
                            <span className="font-medium">{path?.steps.length} stages</span>
                          </td>
                        );
                      })}
                    </tr>
                    <tr className="border-b border-gray-100">
                      <td className="p-4 font-medium text-gray-700 bg-gray-50">Skills Required</td>
                      {selectedPaths.map(pathId => {
                        const skillsCount = getSkillsCount(pathId);
                        return (
                          <td key={pathId} className="p-4">
                            <span className="font-medium">{skillsCount} skills</span>
                          </td>
                        );
                      })}
                    </tr>
                    <tr className="border-b border-gray-100">
                      <td className="p-4 font-medium text-gray-700 bg-gray-50">Category</td>
                      {selectedPaths.map(pathId => {
                        const path = careerPaths.find(p => p.id === pathId);
                        return (
                          <td key={pathId} className="p-4">
                            <Badge variant="outline">{path?.category}</Badge>
                          </td>
                        );
                      })}
                    </tr>
                    <tr className="border-b border-gray-100">
                      <td className="p-4 font-medium text-gray-700 bg-gray-50">Avg. Salary Range</td>
                      {selectedPaths.map(pathId => {
                        const salaryRange = getSalaryRange(pathId);
                        return (
                          <td key={pathId} className="p-4">
                            <span className="font-semibold text-green-600">{salaryRange}</span>
                          </td>
                        );
                      })}
                    </tr>
                    <tr>
                      <td className="p-4 font-medium text-gray-700 bg-gray-50">Job Growth</td>
                      {selectedPaths.map(pathId => {
                        const jobGrowth = getJobGrowth(pathId);
                        return (
                          <td key={pathId} className="p-4">
                            <Badge variant="secondary" className="flex items-center gap-1 w-fit bg-green-100 text-green-800">
                              <TrendingUp className="h-3 w-3" />
                              {jobGrowth}
                            </Badge>
                          </td>
                        );
                      })}
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {selectedPaths.length === 0 && (
          <div className="text-center py-12">
            <BarChart2 className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Select career paths above to start comparing</h3>
            <p className="text-gray-500">Choose up to 3 paths to see a detailed side-by-side comparison</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ComparePathsTab;
