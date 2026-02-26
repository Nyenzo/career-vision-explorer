import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  TrendingUp,
  TrendingDown,
  Users,
  DollarSign,
  Briefcase,
  BarChart3,
  LineChart as LineChartIcon,
  PieChart as PieChartIcon,
  Sparkles,
} from "lucide-react";
import {
  MarketData,
  SalaryByRole,
  JobTrend,
  SkillDemand,
} from "@/hooks/use-insights-data";

interface MarketOverviewTabProps {
  marketData: MarketData[];
  salaryByRoleData: SalaryByRole[];
  jobTrendData: JobTrend[];
  skillDemandData: SkillDemand[];
}

const MarketOverviewTab = ({
  marketData,
  salaryByRoleData,
  jobTrendData,
  skillDemandData,
}: MarketOverviewTabProps) => {
  const SKILL_COLORS = [
    "#3b82f6",
    "#8b5cf6",
    "#6366f1",
    "#a855f7",
    "#ec4899",
    "#14b8a6",
  ];

  const formatValue = (type: string, value: number) => {
    if (type === "average_salary") return `$${value.toLocaleString()}`;
    if (type === "remote_jobs") return `${value}%`;
    return value.toLocaleString();
  };

  const getIcon = (type: string) => {
    if (type === "average_salary")
      return <DollarSign className="h-5 w-5 sm:h-6 sm:w-6" />;
    if (type === "remote_jobs")
      return <Users className="h-5 w-5 sm:h-6 sm:w-6" />;
    return <Briefcase className="h-5 w-5 sm:h-6 sm:w-6" />;
  };

  const getChangeColor = (change: string) =>
    change.startsWith("+")
      ? "text-green-600"
      : change.startsWith("-")
        ? "text-red-600"
        : "text-gray-600";
  const getChangeIcon = (change: string) =>
    change.startsWith("+") ? (
      <TrendingUp className="h-4 w-4" />
    ) : change.startsWith("-") ? (
      <TrendingDown className="h-4 w-4" />
    ) : null;

  return (
    <div className="space-y-8 mt-6">
      {/* Market Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {marketData.map((data) => (
          <Card
            key={data.id}
            className="relative overflow-hidden border-0 shadow-xl bg-white/90 backdrop-blur-sm hover:shadow-2xl transition-all duration-300 group"
          >
            <CardHeader className="pb-2 sm:pb-3">
              <div className="flex items-center justify-between">
                <div className="p-2 sm:p-3 rounded-xl bg-blue-100 text-blue-600 group-hover:bg-blue-200 transition-colors">
                  {getIcon(data.type)}
                </div>
                <div
                  className={`flex items-center gap-1 ${getChangeColor(data.change)}`}
                >
                  {getChangeIcon(data.change)}
                  <span className="text-xs sm:text-sm font-medium">
                    {data.change}
                  </span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <CardTitle className="text-xs sm:text-sm font-medium text-gray-600 mb-1 sm:mb-2">
                {data.label}
              </CardTitle>
              <div className="text-xl sm:text-3xl font-bold text-gray-900 mb-1">
                {formatValue(data.type, data.value)}
              </div>
              <p className="text-xs sm:text-sm text-gray-500">
                from last month
              </p>
            </CardContent>
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
          </Card>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
        {/* Salary by Role */}
        <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
          <CardHeader className="pb-2 sm:pb-4">
            <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
              <BarChart3 className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
              Salary by Role
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col space-y-2">
              {salaryByRoleData.map((role, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center p-2 sm:p-3 bg-gray-50 rounded-lg"
                >
                  <span className="text-sm sm:text-base font-medium text-gray-700">
                    {role.name}
                  </span>
                  <span className="text-sm sm:text-lg font-bold text-blue-600">
                    ${role.salary.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-2 text-center">
              Chart temporarily unavailable - showing data table
            </p>
          </CardContent>
        </Card>

        {/* Job Openings Trend */}
        <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
          <CardHeader className="pb-2 sm:pb-4">
            <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
              <LineChartIcon className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600" />
              Job Openings Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-2">
              {jobTrendData.slice(-6).map((trend, index) => (
                <div
                  key={index}
                  className="text-center p-2 sm:p-3 bg-purple-50 rounded-lg"
                >
                  <div className="text-xs sm:text-sm text-gray-600">
                    {trend.month}
                  </div>
                  <div className="text-sm sm:text-base font-bold text-purple-600">
                    {trend.jobs.toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-2 text-center">
              Chart temporarily unavailable - showing recent trends
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Skills Section */}
      <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
        <CardHeader className="pb-2 sm:pb-4">
          <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
            <PieChartIcon className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
            In-demand Skills Analysis
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
          <div className="flex flex-col space-y-2">
            {skillDemandData.map((skill, index) => (
              <div
                key={index}
                className="flex justify-between items-center p-2 sm:p-3 rounded-lg"
                style={{
                  backgroundColor: `${SKILL_COLORS[index % SKILL_COLORS.length]}15`,
                }}
              >
                <div className="flex items-center gap-2 sm:gap-3">
                  <div
                    className="w-3 h-3 sm:w-4 sm:h-4 rounded-full"
                    style={{
                      backgroundColor:
                        SKILL_COLORS[index % SKILL_COLORS.length],
                    }}
                  ></div>
                  <span className="text-sm sm:text-base font-medium text-gray-700">
                    {skill.name}
                  </span>
                </div>
                <span
                  className="text-sm sm:text-base font-bold"
                  style={{ color: SKILL_COLORS[index % SKILL_COLORS.length] }}
                >
                  {skill.value}%
                </span>
              </div>
            ))}
            <p className="text-xs text-gray-500 mt-2 text-center">
              Chart temporarily unavailable - showing skill data
            </p>
          </div>

          <div className="space-y-2 sm:space-y-4">
            <h3 className="text-lg sm:text-xl font-bold text-gray-900">
              Key Market Insights
            </h3>
            {[
              { skill: "React", trend: "dominate", color: "bg-blue-500" },
              { skill: "Python", trend: "high demand", color: "bg-purple-500" },
              {
                skill: "Data Analysis",
                trend: "growing",
                color: "bg-indigo-500",
              },
              {
                skill: "Cloud Services",
                trend: "expanding",
                color: "bg-violet-500",
              },
            ].map((item, index) => (
              <div
                key={index}
                className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <div
                  className={`w-3 h-3 sm:w-4 sm:h-4 rounded-full ${item.color}`}
                ></div>
                <span className="text-sm sm:text-base font-medium text-gray-900">
                  {item.skill}
                </span>
                <span className="text-xs sm:text-sm text-gray-600">
                  continues to {item.trend}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Market Trends */}
      <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
        <CardHeader className="pb-2 sm:pb-4">
          <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
            <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
            Market Trends & Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {[
              {
                title: "Remote Work Revolution",
                description:
                  "32% of positions now offer remote options, transforming how companies attract talent globally.",
                icon: <Users className="h-5 w-5 sm:h-6 sm:w-6" />,
                color: "bg-blue-100 text-blue-600",
              },
              {
                title: "AI & Automation Impact",
                description:
                  "Growing demand for workers who can collaborate with AI systems and leverage automation tools.",
                icon: <Sparkles className="h-5 w-5 sm:h-6 sm:w-6" />,
                color: "bg-purple-100 text-purple-600",
              },
              {
                title: "Skills-based Hiring",
                description:
                  "Employers prioritize demonstrated skills over traditional credentials, creating new opportunities.",
                icon: <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6" />,
                color: "bg-green-100 text-green-600",
              },
            ].map((trend, index) => (
              <div
                key={index}
                className="p-4 sm:p-6 rounded-xl border border-gray-200 hover:border-gray-300 transition-all hover:shadow-md"
              >
                <div
                  className={`inline-flex p-2 sm:p-3 rounded-lg ${trend.color} mb-3 sm:mb-4`}
                >
                  {trend.icon}
                </div>
                <h3 className="text-sm sm:text-lg font-semibold text-gray-900 mb-2">
                  {trend.title}
                </h3>
                <p className="text-xs sm:text-base text-gray-600 leading-relaxed">
                  {trend.description}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MarketOverviewTab;
