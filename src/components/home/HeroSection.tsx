
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Rocket } from "lucide-react";

const HeroSection = () => {
  return (
    <section className="bg-gradient-to-b from-career-blue to-career-purple relative overflow-hidden text-white">
      <div className="absolute inset-0 animated-bg opacity-10"></div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-24 lg:py-32 relative">
        <div className="lg:grid lg:grid-cols-2 lg:gap-8 items-center">
          <div className="sm:text-center lg:text-left animate-fade-in">
            <h1 className="text-4xl tracking-tight font-extrabold text-white sm:text-5xl md:text-6xl">
              <span className="block neon-text">AI-Driven job linkage</span>
            </h1>
            <p className="mt-3 text-base text-white/90 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto lg:mx-0">
              Visiondrill Careers Navigator uses advanced AI to match your skills with the
              perfect job, identify growth opportunities, and guide your career journey.
            </p>
            <div className="mt-8 sm:mt-10 sm:flex sm:justify-center lg:justify-start">
              <div className="rounded-md shadow">
                <Link to="/signup">
                  <Button className="w-full px-8 py-6 text-lg bg-career-blue text-white hover:bg-blue-700 font-bold shadow-lg border-2 border-career-blue">
                    Create Your Profile
                  </Button>
                </Link>
              </div>
              <div className="mt-3 sm:mt-0 sm:ml-3">
                <Link to="/jobs">
                  <Button variant="outline" className="w-full px-8 py-6 text-lg border-2 border-white bg-transparent text-white hover:bg-white hover:text-career-blue font-bold transition-all duration-200">
                    Explore Jobs
                  </Button>
                </Link>
              </div>
            </div>
          </div>
          <div className="mt-12 relative lg:mt-0 animate-fade-in">
            <div className="mx-auto max-w-md px-4 sm:max-w-2xl sm:px-6 lg:px-0 lg:max-w-none">
              <img
                className="w-full rounded-xl shadow-xl ring-1 ring-white/20 glassmorphism"
                src="https://images.unsplash.com/photo-1649972904349-6e44c42644a7?auto=format&fit=crop&w=600&h=400"
                alt="Career planning dashboard"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
