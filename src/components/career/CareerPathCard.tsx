
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Route, Clock } from "lucide-react";

interface CareerPathCardProps {
  id: string;
  title: string;
  description: string;
  duration: string;
  difficulty: string;
  steps: number;
  category: string;
  color: string;
  onClick: (pathId: string) => void;
}

const CareerPathCard = ({
  id,
  title,
  description,
  duration,
  difficulty,
  steps,
  category,
  color,
  onClick
}: CareerPathCardProps) => {
  return (
    <Card 
      className="group hover:shadow-xl transition-all duration-300 cursor-pointer border-0 bg-white/90 backdrop-blur-sm hover:scale-105"
      onClick={() => onClick(id)}
    >
      <CardHeader className="pb-3">
        <div className={`w-12 h-12 rounded-lg ${color} flex items-center justify-center mb-3`}>
          <Route className="h-6 w-6 text-white" />
        </div>
        <CardTitle className="text-lg group-hover:text-blue-600 transition-colors">
          {title}
        </CardTitle>
        <CardDescription className="text-sm">
          {description}
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Duration</span>
            <Badge variant="secondary" className="text-xs">
              <Clock className="h-3 w-3 mr-1" />
              {duration}
            </Badge>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Difficulty</span>
            <Badge 
              variant={difficulty === 'Beginner' ? 'secondary' : 
                     difficulty === 'Intermediate' ? 'default' : 'destructive'}
              className="text-xs"
            >
              {difficulty}
            </Badge>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Steps</span>
            <span className="font-medium">{steps} stages</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Category</span>
            <Badge variant="outline" className="text-xs">
              {category}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CareerPathCard;
