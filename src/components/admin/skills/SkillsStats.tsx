
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { BarChart, CheckCircle, TrendingUp, Users, Target, BookOpen } from "lucide-react";
import { useAdminSkills } from "@/hooks/use-admin-skills";

export const SkillsStats = () => {
  const { skills, categories } = useAdminSkills();

  const totalSkills = skills.length;
  const activeSkills = skills.filter(skill => skill.isActive).length;
  const verifiedSkills = skills.filter(skill => skill.isVerified).length;
  const highDemandSkills = skills.filter(skill => skill.industryDemand === 'High').length;

  const skillsByLevel = {
    Beginner: skills.filter(skill => skill.level === 'Beginner').length,
    Intermediate: skills.filter(skill => skill.level === 'Intermediate').length,
    Advanced: skills.filter(skill => skill.level === 'Advanced').length
  };

  const skillsByDemand = {
    High: skills.filter(skill => skill.industryDemand === 'High').length,
    Medium: skills.filter(skill => skill.industryDemand === 'Medium').length,
    Low: skills.filter(skill => skill.industryDemand === 'Low').length
  };

  const topCategories = categories
    .sort((a, b) => b.skillCount - a.skillCount)
    .slice(0, 3);

  const averageSalaryImpact = skills.length > 0 
    ? Math.round(skills.reduce((sum, skill) => sum + skill.averageSalaryImpact, 0) / skills.length)
    : 0;

  return (
    <div className="space-y-6">
      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Skills</CardTitle>
            <BarChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSkills}</div>
            <p className="text-xs text-muted-foreground">
              +2 from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Skills</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeSkills}</div>
            <p className="text-xs text-muted-foreground">
              {Math.round((activeSkills / totalSkills) * 100)}% of total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Verified Skills</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{verifiedSkills}</div>
            <p className="text-xs text-muted-foreground">
              {Math.round((verifiedSkills / totalSkills) * 100)}% verified
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">High Demand</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{highDemandSkills}</div>
            <p className="text-xs text-muted-foreground">
              {Math.round((highDemandSkills / totalSkills) * 100)}% high demand
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Skills by Level */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Skills by Difficulty Level
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Beginner</span>
                <span>{skillsByLevel.Beginner} skills</span>
              </div>
              <Progress 
                value={(skillsByLevel.Beginner / totalSkills) * 100} 
                className="h-2"
              />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Intermediate</span>
                <span>{skillsByLevel.Intermediate} skills</span>
              </div>
              <Progress 
                value={(skillsByLevel.Intermediate / totalSkills) * 100} 
                className="h-2"
              />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Advanced</span>
                <span>{skillsByLevel.Advanced} skills</span>
              </div>
              <Progress 
                value={(skillsByLevel.Advanced / totalSkills) * 100} 
                className="h-2"
              />
            </div>
          </CardContent>
        </Card>

        {/* Industry Demand */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Industry Demand Distribution
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>High Demand</span>
                <Badge variant="destructive">{skillsByDemand.High} skills</Badge>
              </div>
              <Progress 
                value={(skillsByDemand.High / totalSkills) * 100} 
                className="h-2"
              />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Medium Demand</span>
                <Badge variant="secondary">{skillsByDemand.Medium} skills</Badge>
              </div>
              <Progress 
                value={(skillsByDemand.Medium / totalSkills) * 100} 
                className="h-2"
              />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Low Demand</span>
                <Badge variant="outline">{skillsByDemand.Low} skills</Badge>
              </div>
              <Progress 
                value={(skillsByDemand.Low / totalSkills) * 100} 
                className="h-2"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Top Categories */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Top Skill Categories
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topCategories.map((category, index) => (
                <div key={category.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-semibold">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium">{category.name}</p>
                      <p className="text-sm text-muted-foreground">{category.description}</p>
                    </div>
                  </div>
                  <Badge variant="secondary">{category.skillCount} skills</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Insights */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Insights</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div>
                <p className="font-medium">Average Salary Impact</p>
                <p className="text-sm text-muted-foreground">Across all skills</p>
              </div>
              <div className="text-2xl font-bold text-blue-600">+{averageSalaryImpact}%</div>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div>
                <p className="font-medium">Verification Rate</p>
                <p className="text-sm text-muted-foreground">Skills verified by experts</p>
              </div>
              <div className="text-2xl font-bold text-green-600">
                {Math.round((verifiedSkills / totalSkills) * 100)}%
              </div>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
              <div>
                <p className="font-medium">Categories</p>
                <p className="text-sm text-muted-foreground">Total skill categories</p>
              </div>
              <div className="text-2xl font-bold text-yellow-600">{categories.length}</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
