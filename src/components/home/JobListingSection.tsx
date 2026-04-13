
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, DollarSign, Building, Clock, ArrowRight } from "lucide-react";

interface JobListingProps {
  featuredJobs: Array<{
    id: number;
    title: string;
    company: string;
    location: string;
    salary: string;
    tags: string[];
  }>;
}

const JobListingSection = ({ featuredJobs }: JobListingProps) => {
  return (
    <section className="py-20 bg-gradient-to-br from-background via-muted/20 to-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
            Featured Jobs
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Explore top opportunities matched to your profile and start your next career adventure
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 mb-12">
          {featuredJobs.map((job, index) => (
            <div
              key={job.id}
              className="group relative bg-card rounded-3xl shadow-sm hover:shadow-2xl transition-all duration-500 border border-border/50 hover:border-primary/20 hover:-translate-y-2 overflow-hidden"
            >
              {/* Gradient accent */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-primary/60"></div>
              
              {/* Card content */}
              <div className="p-8">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-foreground group-hover:text-primary transition-colors duration-300 mb-2 line-clamp-2">
                      {job.title}
                    </h3>
                    <div className="flex items-center gap-2 text-muted-foreground mb-4">
                      <Building className="h-4 w-4 text-primary" />
                      <span className="font-medium">{job.company}</span>
                    </div>
                  </div>
                  <div className="ml-4">
                    <Badge className="bg-primary/10 text-primary border-primary/20 font-semibold">
                      New
                    </Badge>
                  </div>
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <div className="flex items-center justify-center w-8 h-8 bg-blue-50 rounded-lg">
                      <MapPin className="h-4 w-4 text-blue-600" />
                    </div>
                    <span className="text-sm font-medium">{job.location}</span>
                  </div>
                  
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <div className="flex items-center justify-center w-8 h-8 bg-green-50 rounded-lg">
                      <DollarSign className="h-4 w-4 text-green-600" />
                    </div>
                    <span className="text-sm font-medium">{job.salary}</span>
                  </div>

                  <div className="flex items-center gap-3 text-muted-foreground">
                    <div className="flex items-center justify-center w-8 h-8 bg-purple-50 rounded-lg">
                      <Clock className="h-4 w-4 text-purple-600" />
                    </div>
                    <span className="text-sm font-medium">Posted 2 days ago</span>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-2 mb-8">
                  {job.tags.map((tag, idx) => (
                    <Badge 
                      key={idx} 
                      variant="secondary" 
                      className="bg-muted/50 text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors px-3 py-1 font-medium"
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>

                <Link to={`/jobseeker/jobs/${job.id}`} className="block">
                  <Button 
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-3 shadow-md hover:shadow-lg transition-all duration-300 group"
                  >
                    View Details
                    <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                  </Button>
                </Link>
              </div>

              {/* Decorative elements */}
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-br from-primary/10 to-transparent rounded-full blur-2xl group-hover:from-primary/20 transition-all duration-500"></div>
              <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-gradient-to-tr from-secondary/10 to-transparent rounded-full blur-xl group-hover:from-secondary/20 transition-all duration-500"></div>
            </div>
          ))}
        </div>

        <div className="text-center">
          <Link to="/jobseeker/jobs">
            <Button 
              size="lg" 
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-8 py-6 text-lg shadow-xl hover:shadow-2xl transition-all duration-300 group"
            >
              View All Jobs
              <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default JobListingSection;
