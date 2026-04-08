
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

const ToolsSection = () => {
  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Tools for Your Career Journey
          </h2>
          <p className="mt-4 max-w-2xl text-xl text-gray-500 mx-auto">
            Everything you need to plan, develop, and advance your career.
          </p>
        </div>

        <div className="mt-12">
          <Tabs defaultValue="skills" className="w-full">
            <TabsList className="flex flex-col sm:grid w-full sm:grid-cols-3 rounded-xl p-1 glassmorphism">
              <TabsTrigger value="skills" className="rounded-lg">
                <span className="hidden sm:inline">Skills Assessment</span>
                <span className="sm:hidden">Skills</span>
              </TabsTrigger>
              <TabsTrigger value="market" className="rounded-lg">
                <span className="hidden sm:inline">Market Insights</span>
                <span className="sm:hidden">Market</span>
              </TabsTrigger>
              <TabsTrigger value="planning" className="rounded-lg">
                <span className="hidden sm:inline">Career Planning</span>
                <span className="sm:hidden">Planning</span>
              </TabsTrigger>
            </TabsList>
            <TabsContent value="skills" className="mt-8 p-6 bg-gray-50 rounded-lg glassmorphism">
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">Assess Your Skills</h3>
                  <p className="mt-4 text-gray-600">
                    Identify your strengths and areas for improvement with our comprehensive skills
                    assessment tools. Get personalized recommendations for skill development.
                  </p>
                  <ul className="mt-6 space-y-3">
                    <li className="flex items-center">
                      <svg
                        className="h-5 w-5 mr-2 text-career-blue"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      Personalized skill gap analysis
                    </li>
                    <li className="flex items-center">
                      <svg
                        className="h-5 w-5 mr-2 text-career-blue"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      Targeted learning recommendations
                    </li>
                    <li className="flex items-center">
                      <svg
                        className="h-5 w-5 mr-2 text-career-blue"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      Industry benchmark comparisons
                    </li>
                  </ul>
                  <div className="mt-6">
                    <Link to="/skills">
                      <Button className="futuristic-btn">
                        Take Assessment
                      </Button>
                    </Link>
                  </div>
                </div>
                <div className="hidden md:block">
                  <img
                    src="https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=500&h=400"
                    alt="Skills Assessment"
                    className="rounded-lg shadow-md glassmorphism"
                  />
                </div>
              </div>
            </TabsContent>
            <TabsContent value="market" className="mt-8 p-6 bg-gray-50 rounded-lg glassmorphism">
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">Market Insights</h3>
                  <p className="mt-4 text-gray-600">
                    Stay informed about industry trends, salary benchmarks, and in-demand skills.
                    Our market insights help you make data-driven career decisions.
                  </p>
                  <ul className="mt-6 space-y-3">
                    <li className="flex items-center">
                      <svg
                        className="h-5 w-5 mr-2 text-career-blue"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      Salary data for different roles
                    </li>
                    <li className="flex items-center">
                      <svg
                        className="h-5 w-5 mr-2 text-career-blue"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      Emerging industry trends
                    </li>
                    <li className="flex items-center">
                      <svg
                        className="h-5 w-5 mr-2 text-career-blue"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      Regional job demand forecasts
                    </li>
                  </ul>
                  <div className="mt-6">
                    <Link to="/insights">
                      <Button className="futuristic-btn">
                        View Insights
                      </Button>
                    </Link>
                  </div>
                </div>
                <div className="hidden md:block">
                  <img
                    src="https://images.unsplash.com/photo-1487058792275-0ad4aaf24ca7?auto=format&fit=crop&w=500&h=400"
                    alt="Market Insights"
                    className="rounded-lg shadow-md glassmorphism"
                  />
                </div>
              </div>
            </TabsContent>
            <TabsContent value="planning" className="mt-8 p-6 bg-gray-50 rounded-lg glassmorphism">
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">Career Planning</h3>
                  <p className="mt-4 text-gray-600">
                    Set your career goals and create actionable plans to achieve them.
                    Visualize your path and track your progress along the way.
                  </p>
                  <ul className="mt-6 space-y-3">
                    <li className="flex items-center">
                      <svg
                        className="h-5 w-5 mr-2 text-career-blue"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      5-year career roadmap creation
                    </li>
                    <li className="flex items-center">
                      <svg
                        className="h-5 w-5 mr-2 text-career-blue"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      Milestone tracking and reminders
                    </li>
                    <li className="flex items-center">
                      <svg
                        className="h-5 w-5 mr-2 text-career-blue"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      Goal-oriented skill development plans
                    </li>
                  </ul>
                  <div className="mt-6">
                    <Link to="/career-paths">
                      <Button className="futuristic-btn">
                        Create Plan
                      </Button>
                    </Link>
                  </div>
                </div>
                <div className="hidden md:block">
                  <img
                    src="https://images.unsplash.com/photo-1531297484001-80022131f5a1?auto=format&fit=crop&w=500&h=400"
                    alt="Career Planning"
                    className="rounded-lg shadow-md glassmorphism"
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </section>
  );
};

export default ToolsSection;
