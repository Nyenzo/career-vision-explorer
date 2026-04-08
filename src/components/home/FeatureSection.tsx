
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Search, User, Book, MessageCircle } from "lucide-react";
import { useFeatures } from "@/hooks/use-features";

const FeatureSection = () => {
  const { features } = useFeatures();

  const allFeatures = [
    {
      icon: Search,
      title: "AI-Powered Job Matching",
      description: "Our intelligent system finds the perfect job matches based on your skills, experience, and preferences.",
      bgColor: "bg-blue-50",
      iconColor: "text-blue-600",
      featureKey: "jobMatching" as const,
    },
    {
      icon: User,
      title: "Skills Assessment",
      description: "Identify your strengths and areas for improvement through integrated assessments and get a personalized readiness score.",
      bgColor: "bg-purple-50",
      iconColor: "text-purple-600",
      featureKey: "skillsAssessment" as const,
    },
    {
      icon: Book,
      title: "Microlearning Paths",
      description: "Fill skill gaps with personalized learning recommendations and track your progress toward career goals.",
      bgColor: "bg-green-50",
      iconColor: "text-green-600",
      featureKey: "microlearning" as const,
    },
    {
      icon: MessageCircle,
      title: "AI Interview Practice",
      description: "Practice interviews with our AI coach that provides feedback on your responses, tone, and delivery.",
      bgColor: "bg-orange-50",
      iconColor: "text-orange-600",
      featureKey: "aiInterviewPractice" as const,
    },
  ];

  // Filter features based on toggles
  const enabledFeatures = allFeatures.filter(feature => features[feature.featureKey]);

  // Don't render the section if no features are enabled
  if (enabledFeatures.length === 0) {
    return null;
  }

  return (
    <section className="py-20 bg-gradient-to-br from-background via-muted/20 to-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
            How Visiondrill Careers Works
          </h2>
          <p className="max-w-3xl mx-auto text-xl text-muted-foreground leading-relaxed">
            Our intelligent platform combines AI technology with personalized career development to help you find and succeed in your dream job.
          </p>
        </div>

        <div className={`grid grid-cols-1 md:grid-cols-2 ${enabledFeatures.length >= 3 ? 'lg:grid-cols-4' : enabledFeatures.length === 2 ? 'lg:grid-cols-2' : 'lg:grid-cols-1'} gap-8 mb-12`}>
          {enabledFeatures.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="group relative bg-card rounded-2xl p-8 shadow-sm hover:shadow-xl transition-all duration-300 border border-border/50 hover:border-primary/20 hover:-translate-y-1"
              >
                <div className={`${feature.bgColor} w-16 h-16 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className={`h-8 w-8 ${feature.iconColor}`} aria-hidden="true" />
                </div>
                <h3 className="text-xl font-bold mb-4 text-foreground group-hover:text-primary transition-colors">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>

                {/* Decorative element */}
                <div className="absolute top-4 right-4 w-2 h-2 bg-primary/20 rounded-full group-hover:bg-primary/40 transition-colors"></div>
              </div>
            );
          })}
        </div>

        <div className="text-center">
          <Link to="/jobs">
            <Button
              size="lg"
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-8 py-6 text-lg shadow-xl hover:shadow-2xl transition-all duration-300"
            >
              Discover More
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FeatureSection;
