
import Layout from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, Target, TrendingUp, Shield, Star, ArrowRight, CheckCircle, Award, Zap } from "lucide-react";
import { Link } from "react-router-dom";

const About = () => {
  const features = [
    {
      icon: <Target className="h-6 w-6" />,
      title: "Smart Job Matching",
      description: "Our AI algorithms analyze your skills, experience, and preferences to find the perfect job matches."
    },
    {
      icon: <TrendingUp className="h-6 w-6" />,
      title: "Career Path Guidance",
      description: "Get personalized career roadmaps and skill development recommendations."
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: "Skills Assessment",
      description: "Comprehensive skills evaluation to help you understand your strengths and growth areas."
    },
    {
      icon: <Star className="h-6 w-6" />,
      title: "Market Insights",
      description: "Stay informed about industry trends, salary benchmarks, and in-demand skills."
    }
  ];

  const stats = [
    { number: "10K+", label: "Job Seekers", icon: <Users className="h-5 w-5" /> },
    { number: "500+", label: "Companies", icon: <Award className="h-5 w-5" /> },
    { number: "95%", label: "Match Accuracy", icon: <CheckCircle className="h-5 w-5" /> },
    { number: "24/7", label: "Support", icon: <Zap className="h-5 w-5" /> }
  ];

  const achievements = [
    "5,000+ successful job placements",
    "500+ partner companies",
    "95% user satisfaction rate",
    "AI-powered matching technology"
  ];

  return (
    <Layout>
      <div className="min-h-screen bg-background">
        {/* Enhanced Hero Section */}
        <div className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-secondary/5">
          <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))]" />
          <div className="relative max-w-7xl mx-auto px-4 py-24 lg:py-32">
            <div className="text-center space-y-8 max-w-4xl mx-auto">
              <div className="animate-fade-in">
                <Badge variant="secondary" className="mb-6 px-4 py-2 text-sm font-medium bg-primary/10 text-primary border-primary/20">
                  ✨ About Visiondrill
                </Badge>
              </div>
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight animate-slide-in">
                Navigate your career journey with 
                <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent"> confidence</span>
              </h1>
              <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed max-w-3xl mx-auto animate-fade-in">
                We believe that everyone deserves to find meaningful work that aligns with their skills, values, and aspirations. Our AI-driven platform connects talent with opportunity.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8 animate-fade-in">
                <Link to="/jobs">
                  <Button size="lg" className="w-full sm:w-auto px-8 py-4 text-base font-semibold shadow-lg hover:shadow-xl transition-all duration-300">
                    Explore Jobs
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link to="/contact">
                  <Button variant="outline" size="lg" className="w-full sm:w-auto px-8 py-4 text-base font-semibold border-2 hover:bg-primary/5">
                    Contact Us
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Stats Section */}
        <div className="border-y bg-gradient-to-r from-card/50 to-secondary/5 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 py-20">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <div key={index} className="text-center group hover:scale-105 transition-transform duration-300">
                  <div className="flex items-center justify-center mb-3">
                    <div className="p-3 bg-primary/10 text-primary rounded-xl group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                      {stat.icon}
                    </div>
                  </div>
                  <div className="text-3xl lg:text-4xl font-bold text-primary mb-2 group-hover:scale-110 transition-transform duration-300">
                    {stat.number}
                  </div>
                  <div className="text-muted-foreground font-medium text-sm lg:text-base">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-20 space-y-32">
          {/* Enhanced Mission Section */}
          <section className="text-center space-y-8">
            <div className="animate-fade-in">
              <Badge variant="outline" className="mb-6 px-4 py-2 border-primary/30 text-primary">
                🎯 Our Mission
              </Badge>
            </div>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
              Democratizing Career Success
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground max-w-4xl mx-auto leading-relaxed">
              At Visiondrill Career Explorer, we're committed to breaking down barriers in career development. 
              Our platform leverages cutting-edge AI technology to provide personalized career guidance that was 
              once only available to a privileged few.
            </p>
          </section>

          {/* Enhanced Features Section */}
          <section className="space-y-16">
            <div className="text-center space-y-6">
              <Badge variant="outline" className="border-primary/30 text-primary px-4 py-2">
                🚀 What We Do
              </Badge>
              <h2 className="text-3xl md:text-5xl font-bold tracking-tight">
                Powerful Tools for Your Career
              </h2>
              <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                Our comprehensive suite of tools is designed to support you at every stage of your career journey.
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8">
              {features.map((feature, index) => (
                <Card key={index} className="group hover:shadow-2xl transition-all duration-500 border-border/50 hover:border-primary/30 bg-gradient-to-br from-card to-card/50 backdrop-blur-sm">
                  <CardHeader className="pb-4">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-gradient-to-br from-primary/10 to-primary/5 text-primary rounded-xl group-hover:from-primary group-hover:to-primary/80 group-hover:text-white transition-all duration-300 group-hover:scale-110">
                        {feature.icon}
                      </div>
                      <CardTitle className="text-xl md:text-2xl group-hover:text-primary transition-colors duration-300">{feature.title}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground leading-relaxed text-base">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* Enhanced Story Section */}
          <section className="space-y-16">
            <div className="text-center space-y-6">
              <Badge variant="outline" className="border-primary/30 text-primary px-4 py-2">
                📖 Our Story
              </Badge>
              <h2 className="text-3xl md:text-5xl font-bold tracking-tight">
                Building the Future of Work
              </h2>
            </div>
            
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div className="space-y-8">
                <div className="space-y-6">
                  <p className="text-lg text-muted-foreground leading-relaxed">
                    Founded in 2024, Visiondrill Career Explorer was born from the vision to democratize 
                    career guidance and make quality career advice accessible to everyone. Our team of 
                    career experts, data scientists, and technologists work together to create innovative 
                    solutions for the modern job market.
                  </p>
                  <p className="text-lg text-muted-foreground leading-relaxed">
                    We're committed to helping professionals at every stage of their career journey, 
                    from recent graduates to experienced executives looking for their next challenge.
                  </p>
                </div>
                
                <div className="space-y-4">
                  {achievements.map((achievement, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-primary/5 hover:bg-primary/10 transition-colors duration-300">
                      <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />
                      <span className="text-sm font-medium">{achievement}</span>
                    </div>
                  ))}
                </div>

                <div className="flex items-center gap-4 p-6 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-xl border border-primary/20">
                  <Users className="h-10 w-10 text-primary" />
                  <div>
                    <div className="font-semibold text-lg">Expert Team</div>
                    <div className="text-sm text-muted-foreground">
                      Career advisors, AI specialists, and industry experts
                    </div>
                  </div>
                </div>
              </div>
              
              <Card className="bg-gradient-to-br from-primary/5 via-card to-secondary/5 border-primary/20 shadow-xl">
                <CardContent className="p-8">
                  <div className="space-y-8">
                    <div className="text-center">
                      <div className="text-5xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent mb-3">2024</div>
                      <div className="text-muted-foreground font-medium">Founded</div>
                    </div>
                    <div className="space-y-6">
                      <div className="flex justify-between items-center p-4 bg-white/50 rounded-lg">
                        <span className="text-sm text-muted-foreground font-medium">Job Placements</span>
                        <span className="font-bold text-lg text-primary">5,000+</span>
                      </div>
                      <div className="flex justify-between items-center p-4 bg-white/50 rounded-lg">
                        <span className="text-sm text-muted-foreground font-medium">Partner Companies</span>
                        <span className="font-bold text-lg text-primary">500+</span>
                      </div>
                      <div className="flex justify-between items-center p-4 bg-white/50 rounded-lg">
                        <span className="text-sm text-muted-foreground font-medium">Success Rate</span>
                        <span className="font-bold text-lg text-primary">95%</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Enhanced CTA Section */}
          <section className="text-center space-y-10 py-20 relative">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-secondary/5 rounded-3xl" />
            <div className="relative space-y-6">
              <h2 className="text-3xl md:text-5xl font-bold tracking-tight">
                Ready to Transform Your Career?
              </h2>
              <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                Join thousands of professionals who have already discovered their perfect career path with Visiondrill.
              </p>
            </div>
            <div className="relative flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Link to="/signup">
                <Button size="lg" className="w-full sm:w-auto px-8 py-4 text-base font-semibold shadow-xl hover:shadow-2xl transition-all duration-300">
                  Get Started Today
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link to="/jobs">
                <Button variant="outline" size="lg" className="w-full sm:w-auto px-8 py-4 text-base font-semibold border-2 hover:bg-primary/5">
                  Browse Jobs
                </Button>
              </Link>
            </div>
          </section>
        </div>
      </div>
    </Layout>
  );
};

export default About;
