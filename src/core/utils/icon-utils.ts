
import { Target, TrendingUp, Shield, Star, Users, Award, BarChart3 } from "lucide-react";

export const iconOptions = [
  { value: "Target", label: "Target", icon: Target },
  { value: "TrendingUp", label: "Trending Up", icon: TrendingUp },
  { value: "Shield", label: "Shield", icon: Shield },
  { value: "Star", label: "Star", icon: Star },
  { value: "Users", label: "Users", icon: Users },
  { value: "Award", label: "Award", icon: Award },
  { value: "BarChart3", label: "Bar Chart", icon: BarChart3 },
];

export const getIconComponent = (iconName: string) => {
  const iconOption = iconOptions.find(option => option.value === iconName);
  return iconOption ? iconOption.icon : Target;
};
