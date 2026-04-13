
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { User, LayoutGrid, Briefcase } from "lucide-react";

const CareerJourneySection = () => {
  return (
    <section className="py-20 bg-gradient-to-br from-background via-muted/30 to-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
            Your Career Journey with Us
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Follow these simple steps to kickstart your professional growth and unlock your career potential
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
          {/* Step 1: Create Your Profile */}
          <div className="group relative">
            <div className="text-center bg-card rounded-3xl p-8 shadow-sm hover:shadow-xl transition-all duration-300 border border-border/50 hover:border-primary/20 hover:-translate-y-2">
              <div className="flex justify-center mb-8">
                <div className="relative">
                  <div className="w-20 h-20 bg-gradient-to-br from-primary to-primary/80 text-primary-foreground rounded-full flex items-center justify-center text-2xl font-bold shadow-lg group-hover:scale-110 transition-transform duration-300">
                    1
                  </div>
                  <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2">
                    <div className="w-12 h-12 bg-background rounded-full border-4 border-primary/20 flex items-center justify-center shadow-md">
                      <User className="h-6 w-6 text-primary" />
                    </div>
                  </div>
                </div>
              </div>
              <h3 className="text-2xl font-bold mb-4 text-foreground group-hover:text-primary transition-colors">
                Create Your Profile
              </h3>
              <p className="text-muted-foreground mb-8 leading-relaxed">
                Build your comprehensive profile with our AI-powered onboarding wizard that understands your career goals.
              </p>
              <Link to="/signup">
                <Button className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-6 py-3 shadow-md hover:shadow-lg transition-all duration-300">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>

          {/* Step 2: Explore Your Dashboard */}
          <div className="group relative">
            <div className="text-center bg-card rounded-3xl p-8 shadow-sm hover:shadow-xl transition-all duration-300 border border-border/50 hover:border-primary/20 hover:-translate-y-2">
              <div className="flex justify-center mb-8">
                <div className="relative">
                  <div className="w-20 h-20 bg-gradient-to-br from-primary to-primary/80 text-primary-foreground rounded-full flex items-center justify-center text-2xl font-bold shadow-lg group-hover:scale-110 transition-transform duration-300">
                    2
                  </div>
                  <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2">
                    <div className="w-12 h-12 bg-background rounded-full border-4 border-primary/20 flex items-center justify-center shadow-md">
                      <LayoutGrid className="h-6 w-6 text-primary" />
                    </div>
                  </div>
                </div>
              </div>
              <h3 className="text-2xl font-bold mb-4 text-foreground group-hover:text-primary transition-colors">
                Explore Your Dashboard
              </h3>
              <p className="text-muted-foreground mb-8 leading-relaxed">
                Get insights on your career readiness, skill gaps, and personalized recommendations tailored to your goals.
              </p>
              <Link to="/profile">
                <Button className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-6 py-3 shadow-md hover:shadow-lg transition-all duration-300">
                  View Dashboard
                </Button>
              </Link>
            </div>
          </div>

          {/* Step 3: Apply to Top Jobs */}
          <div className="group relative">
            <div className="text-center bg-card rounded-3xl p-8 shadow-sm hover:shadow-xl transition-all duration-300 border border-border/50 hover:border-primary/20 hover:-translate-y-2">
              <div className="flex justify-center mb-8">
                <div className="relative">
                  <div className="w-20 h-20 bg-gradient-to-br from-primary to-primary/80 text-primary-foreground rounded-full flex items-center justify-center text-2xl font-bold shadow-lg group-hover:scale-110 transition-transform duration-300">
                    3
                  </div>
                  <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2">
                    <div className="w-12 h-12 bg-background rounded-full border-4 border-primary/20 flex items-center justify-center shadow-md">
                      <Briefcase className="h-6 w-6 text-primary" />
                    </div>
                  </div>
                </div>
              </div>
              <h3 className="text-2xl font-bold mb-4 text-foreground group-hover:text-primary transition-colors">
                Apply to Top Jobs
              </h3>
              <p className="text-muted-foreground mb-8 leading-relaxed">
                Get matched with opportunities aligned with your skills and career goals from top employers.
              </p>
              <Link to="/jobseeker/jobs">
                <Button className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-6 py-3 shadow-md hover:shadow-lg transition-all duration-300">
                  Find Jobs
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Connection Lines for larger screens */}
        <div className="hidden lg:block absolute inset-0 pointer-events-none">
          <div className="relative h-full w-full max-w-7xl mx-auto">
            <svg className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" width="600" height="2">
              <defs>
                <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.3" />
                  <stop offset="50%" stopColor="hsl(var(--primary))" stopOpacity="0.6" />
                  <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.3" />
                </linearGradient>
              </defs>
              <line x1="0" y1="1" x2="600" y2="1" stroke="url(#lineGradient)" strokeWidth="2" strokeDasharray="8,4" />
            </svg>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CareerJourneySection;
