
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle, 
  CardFooter 
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Search, Building, MapPin, BookOpen, TrendingUp, HeartHandshake, ChevronDown, ChevronUp } from "lucide-react";

interface Job {
  job_id: number;
  title: string;
  company: string;
  location: string;
  salary: string;
  description: string;
  postedDate: string;
  matchScore: number;
  tags: string[];
  skillsRequired: {
    name: string;
    level: number; // 0-100
  }[];
  requirements: string[];
  benefits: string[];
}

const JobMatcher = () => {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchLocation, setSearchLocation] = useState("");
  const [jobType, setJobType] = useState<string>("");
  const [experienceLevel, setExperienceLevel] = useState<string>("");
  const [salaryRange, setSalaryRange] = useState([0, 500000]); // KES
  const [isLoading, setIsLoading] = useState(false);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [expandedJobId, setExpandedJobId] = useState<number | null>(null);
  
  const handleSearch = () => {
    setIsLoading(true);
    
    // Simulate API call with a delay
    setTimeout(() => {
      const mockJobs: Job[] = [
        {
          job_id: 1,
          title: "Senior Frontend Engineer",
          company: "TechNova",
          location: "Nairobi, Kenya",
          salary: "150,000 - 250,000 KES",
          description: "We are looking for a Senior Frontend Engineer to join our growing team. You will be responsible for building responsive web applications using React and TypeScript.",
          postedDate: "2 days ago",
          matchScore: 92,
          tags: ["React", "TypeScript", "Remote"],
          skillsRequired: [
            { name: "React", level: 90 },
            { name: "TypeScript", level: 85 },
            { name: "CSS", level: 80 },
            { name: "Testing", level: 75 },
          ],
          requirements: [
            "5+ years of experience in frontend development",
            "Strong knowledge of React and state management",
            "Experience with TypeScript and modern JavaScript",
            "Understanding of responsive design and CSS frameworks"
          ],
          benefits: [
            "Flexible working hours",
            "Remote work options",
            "Health insurance",
            "Stock options",
            "Professional development budget"
          ]
        },
        {
          job_id: 2,
          title: "UX/UI Designer",
          company: "CreativeHubs",
          location: "Remote",
          salary: "100,000 - 180,000 KES",
          description: "Join our design team to create beautiful, intuitive interfaces for web and mobile applications. You'll work closely with developers to bring designs to life.",
          postedDate: "1 week ago",
          matchScore: 87,
          tags: ["UI", "UX", "Figma", "Remote"],
          skillsRequired: [
            { name: "Figma", level: 95 },
            { name: "UI Design", level: 90 },
            { name: "Prototyping", level: 85 },
            { name: "User Research", level: 70 },
          ],
          requirements: [
            "3+ years of experience in UX/UI design",
            "Strong portfolio showcasing your design work",
            "Experience with Figma and design systems",
            "Understanding of user-centered design principles"
          ],
          benefits: [
            "Flexible schedule",
            "Remote work",
            "Learning stipend",
            "Design conference budget"
          ]
        },
        {
          job_id: 3,
          title: "Full Stack Developer",
          company: "FinTech Solutions",
          location: "Nairobi, Kenya",
          salary: "120,000 - 200,000 KES",
          description: "We're seeking a talented Full Stack Developer to help build our next-generation financial platform. You'll work on both frontend and backend systems.",
          postedDate: "3 days ago",
          matchScore: 78,
          tags: ["Full Stack", "Node.js", "React", "SQL"],
          skillsRequired: [
            { name: "JavaScript", level: 90 },
            { name: "Node.js", level: 85 },
            { name: "React", level: 80 },
            { name: "SQL", level: 75 },
          ],
          requirements: [
            "4+ years of full stack development experience",
            "Strong knowledge of Node.js and React",
            "Experience with SQL databases",
            "Understanding of RESTful API design"
          ],
          benefits: [
            "Competitive salary",
            "Health and dental insurance",
            "Retirement benefits",
            "Paid time off"
          ]
        },
        {
          job_id: 4,
          title: "Product Manager",
          company: "InnovateTech",
          location: "Hybrid - Nairobi",
          salary: "180,000 - 250,000 KES",
          description: "Lead product development for our SaaS platform, working closely with engineering, design, and marketing teams to deliver exceptional user experiences.",
          postedDate: "1 day ago",
          matchScore: 68,
          tags: ["Product", "SaaS", "Agile", "Hybrid"],
          skillsRequired: [
            { name: "Product Strategy", level: 90 },
            { name: "Agile", level: 85 },
            { name: "User Research", level: 80 },
            { name: "Data Analysis", level: 75 },
          ],
          requirements: [
            "5+ years of experience in product management",
            "Experience with SaaS products",
            "Strong analytical and problem-solving skills",
            "Excellent communication and stakeholder management"
          ],
          benefits: [
            "Performance bonuses",
            "Flexible work arrangements",
            "Professional development",
            "Team retreats"
          ]
        }
      ];
      
      setJobs(mockJobs);
      setIsLoading(false);
      
      toast({
        title: "Search Complete",
        description: `Found ${mockJobs.length} matching jobs based on your profile and preferences.`,
      });
    }, 1500);
  };
  
  const toggleJobExpand = (jobId: number) => {
    setExpandedJobId(expandedJobId === jobId ? null : jobId);
  };
  
  const formatSalary = (value: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      maximumFractionDigits: 0
    }).format(value);
  };
  
  const getMatchScoreColor = (score: number) => {
    if (score >= 85) return "bg-green-100 text-green-800";
    if (score >= 70) return "bg-amber-100 text-amber-800";
    return "bg-blue-100 text-blue-800";
  };
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Find Your Perfect Match</CardTitle>
          <CardDescription>
            Our AI-powered job matcher finds opportunities that align with your skills and preferences.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Job title, skills, or keywords"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full"
                />
              </div>
              <div className="flex-1">
                <Input
                  placeholder="Location"
                  value={searchLocation}
                  onChange={(e) => setSearchLocation(e.target.value)}
                  className="w-full"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium block mb-1">Job Type</label>
                <Select value={jobType} onValueChange={setJobType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select job type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="full-time">Full-time</SelectItem>
                    <SelectItem value="part-time">Part-time</SelectItem>
                    <SelectItem value="contract">Contract</SelectItem>
                    <SelectItem value="freelance">Freelance</SelectItem>
                    <SelectItem value="internship">Internship</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-sm font-medium block mb-1">Experience Level</label>
                <Select value={experienceLevel} onValueChange={setExperienceLevel}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select experience level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="entry">Entry Level</SelectItem>
                    <SelectItem value="mid">Mid Level</SelectItem>
                    <SelectItem value="senior">Senior Level</SelectItem>
                    <SelectItem value="executive">Executive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between mb-1">
                <label className="text-sm font-medium">Salary Range (KES)</label>
                <span className="text-sm text-gray-500">
                  {formatSalary(salaryRange[0])} - {formatSalary(salaryRange[1])}
                </span>
              </div>
              <Slider
                defaultValue={salaryRange}
                max={500000}
                step={10000}
                onValueChange={(value) => setSalaryRange(value as number[])}
              />
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button 
            className="w-full"
            onClick={handleSearch}
            disabled={isLoading}
          >
            {isLoading ? (
              "Searching..."
            ) : (
              <>
                <Search className="mr-2 h-4 w-4" />
                Find Matching Jobs
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
      
      {isLoading && (
        <Card>
          <CardContent className="py-6">
            <div className="text-center space-y-4">
              <p>Analyzing your profile and finding the best matches...</p>
              <Progress value={65} className="max-w-md mx-auto" />
            </div>
          </CardContent>
        </Card>
      )}
      
      {jobs.length > 0 && (
        <div className="space-y-4">
          {jobs.map((job) => (
            <Card key={job.job_id} className="overflow-hidden">
              <div className="border-l-4 border-blue-500">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>{job.title}</CardTitle>
                      <CardDescription className="mt-1 flex items-center">
                        <Building className="h-4 w-4 mr-1" />
                        {job.company}
                        <span className="mx-2">•</span>
                        <MapPin className="h-4 w-4 mr-1" />
                        {job.location}
                      </CardDescription>
                    </div>
                    <div>
                      <Badge 
                        className={`${getMatchScoreColor(job.matchScore)} whitespace-nowrap`}
                      >
                        {job.matchScore}% Match
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="pb-3">
                  <div className="space-y-3">
                    <div>
                      <div className="flex items-center text-sm text-gray-500">
                        <TrendingUp className="h-4 w-4 mr-1" />
                        Salary: {job.salary}
                        <span className="mx-2">•</span>
                        Posted: {job.postedDate}
                      </div>
                    </div>
                    
                    <p className="text-sm">{job.description}</p>
                    
                    <div className="flex flex-wrap gap-2 pt-1">
                      {job.tags.map((tag) => (
                        <Badge key={tag} variant="outline">{tag}</Badge>
                      ))}
                    </div>
                    
                    {expandedJobId === job.job_id && (
                      <div className="border-t pt-3 mt-3 space-y-4">
                        <div>
                          <h4 className="text-sm font-medium mb-2">Required Skills</h4>
                          <div className="space-y-2">
                            {job.skillsRequired.map((skill) => (
                              <div key={skill.name} className="space-y-1">
                                <div className="flex justify-between text-xs">
                                  <span>{skill.name}</span>
                                  <span>Proficiency: {skill.level}%</span>
                                </div>
                                <Progress value={skill.level} className="h-1.5" />
                              </div>
                            ))}
                          </div>
                        </div>
                        
                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <h4 className="text-sm font-medium mb-2">Requirements</h4>
                            <ul className="text-sm space-y-1 list-disc pl-5">
                              {job.requirements.map((req, idx) => (
                                <li key={idx}>{req}</li>
                              ))}
                            </ul>
                          </div>
                          
                          <div>
                            <h4 className="text-sm font-medium mb-2">Benefits</h4>
                            <ul className="text-sm space-y-1 list-disc pl-5">
                              {job.benefits.map((benefit, idx) => (
                                <li key={idx}>{benefit}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                        
                        <div className="bg-blue-50 p-3 rounded-md text-sm">
                          <p className="font-medium flex items-center mb-1">
                            <HeartHandshake className="h-4 w-4 mr-1" />
                            How you match this role
                          </p>
                          <p>
                            Your profile shows strong alignment with the required technical skills.
                            Your experience level is suitable for this position, and your preferred
                            work style matches the company's culture.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
                
                <CardFooter className="flex flex-col sm:flex-row gap-3 pt-0">
                  <Button className="w-full sm:w-auto">Apply Now</Button>
                  <Button 
                    variant="outline" 
                    className="w-full sm:w-auto"
                    onClick={() => toggleJobExpand(job.job_id)}
                  >
                    {expandedJobId === job.job_id ? (
                      <>
                        Show Less
                        <ChevronUp className="ml-1 h-4 w-4" />
                      </>
                    ) : (
                      <>
                        Show More
                        <ChevronDown className="ml-1 h-4 w-4" />
                      </>
                    )}
                  </Button>
                  <Button variant="ghost" className="w-full sm:w-auto">Save</Button>
                </CardFooter>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default JobMatcher;
