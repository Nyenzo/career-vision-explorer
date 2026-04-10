
import { Sparkles } from "lucide-react";

const CareerPathsHero = () => {
  return (
    <div className="text-center mb-12">
      <div className="flex items-center justify-center gap-2 mb-4">
        <Sparkles className="h-6 w-6 text-blue-600" />
        <span className="text-sm font-medium text-blue-600 uppercase tracking-wide">Career Guidance</span>
      </div>
      <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
        Explore Career Paths
      </h1>
      <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
        Discover structured career journeys tailored to your goals. Visualize progression steps, 
        required skills, and timelines to achieve your dream role.
      </p>
    </div>
  );
};

export default CareerPathsHero;
