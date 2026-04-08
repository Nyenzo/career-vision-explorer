import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  icon: LucideIcon;
  value: string;
  label: string;
  gradient: string;
}

export const StatCard = ({
  icon: Icon,
  value,
  label,
  gradient,
}: StatCardProps) => {
  return (
    <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 group">
      <CardContent className="p-6">
        <div className="flex items-center gap-4">
          <div
            className={`h-12 w-12 bg-gradient-to-br ${gradient} rounded-xl flex items-center justify-center text-white group-hover:scale-110 transition-transform duration-300`}
          >
            <Icon className="h-6 w-6" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            <p className="text-sm text-gray-600">{label}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
