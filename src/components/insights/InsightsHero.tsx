import { Badge } from "@/components/ui/badge";
import { Sparkles } from "lucide-react";

const InsightsHero = () => {
  return (
    <div className="text-center mb-6 sm:mb-8 md:mb-12 px-4 sm:px-6 lg:px-8">
      {/* Badge & Icon */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-2 mb-3 sm:mb-4">
        <Sparkles className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
        <Badge
          variant="secondary"
          className="text-xs sm:text-sm font-medium px-2 sm:px-3 py-1"
        >
          Market Intelligence
        </Badge>
      </div>

      {/* Heading */}
      <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4 md:mb-6 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent leading-snug sm:leading-tight">
        Market Insights & Analytics
      </h1>

      {/* Description */}
      <p className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-600 max-w-xl md:max-w-3xl mx-auto leading-relaxed sm:leading-relaxed md:leading-relaxed px-2 sm:px-4">
        Discover comprehensive market trends, salary benchmarks, and in-demand
        skills to make informed career decisions and stay ahead of the
        competition.
      </p>
    </div>
  );
};

export default InsightsHero;
