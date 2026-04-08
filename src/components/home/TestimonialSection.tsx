
import { Card, CardContent } from "@/components/ui/card";
import { Star, Quote } from "lucide-react";

interface TestimonialProps {
  testimonials: Array<{
    id: number;
    quote: string;
    author: string;
    role: string;
    image?: string;
    rating?: number;
  }>;
}

const TestimonialSection = ({ testimonials }: TestimonialProps) => {
  return (
    <section className="py-20 bg-gradient-to-br from-muted/20 via-background to-muted/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
            Success Stories
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            See how others have transformed their careers with Visiondrill.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial) => (
            <Card key={testimonial.id} className="group relative bg-card rounded-3xl shadow-sm hover:shadow-2xl transition-all duration-500 border border-border/50 hover:border-primary/20 hover:-translate-y-2 overflow-hidden">
              {/* Gradient accent */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-primary/60"></div>

              <CardContent className="p-8">
                {/* Quote icon */}
                <div className="flex justify-center mb-6">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <Quote className="h-6 w-6 text-primary" aria-hidden="true" />
                  </div>
                </div>

                {/* Rating */}
                {testimonial.rating && (
                  <div
                    className="flex justify-center gap-1 mb-6"
                    role="img"
                    aria-label={`${testimonial.rating} out of 5 stars`}
                  >
                    {Array.from({ length: testimonial.rating }, (_, i) => (
                      <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" aria-hidden="true" />
                    ))}
                  </div>
                )}

                {/* Testimonial text */}
                <blockquote className="text-muted-foreground italic text-center mb-8 leading-relaxed">
                  "{testimonial.quote}"
                </blockquote>

                {/* Author info */}
                <div className="flex items-center gap-4">
                  <div className="flex-shrink-0">
                    <img
                      src={testimonial.image || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&h=100"}
                      alt={testimonial.author ? `${testimonial.author}'s profile photo` : "Anonymous reviewer profile photo"}
                      className="w-12 h-12 rounded-full object-cover border-2 border-primary/20"
                    />
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-foreground group-hover:text-primary transition-colors">
                      {testimonial.author}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {testimonial.role}
                    </p>
                  </div>
                </div>
              </CardContent>

              {/* Decorative elements */}
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-br from-primary/10 to-transparent rounded-full blur-2xl group-hover:from-primary/20 transition-all duration-500"></div>
              <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-gradient-to-tr from-secondary/10 to-transparent rounded-full blur-xl group-hover:from-secondary/20 transition-all duration-500"></div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialSection;
