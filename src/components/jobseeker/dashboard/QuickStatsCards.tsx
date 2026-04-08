import React from "react";
import { Briefcase, Eye, Calendar, Star, MessageCircle } from "lucide-react";
import { StatCard } from "./StatCard";
import { useNavigate } from "react-router-dom";

export const QuickStatsCards = () => {
  const navigate = useNavigate();

  const stats = [
    {
      icon: Briefcase,
      value: "12",
      label: "Applications",
      gradient: "bg-primary",
      onClick: () => {
        // Navigate to applications tab in dashboard
        const event = new CustomEvent('switchTab', { detail: 'applications' });
        window.dispatchEvent(event);
      }
    },
    {
      icon: Calendar,
      value: "2",
      label: "Interviews",
      gradient: "bg-purple-500",
      onClick: () => {
        // Navigate to interviews tab in dashboard
        const event = new CustomEvent('switchTab', { detail: 'interviews' });
        window.dispatchEvent(event);
      }
    },
    {
      icon: Eye,
      value: "24",
      label: "Profile Views",
      gradient: "bg-green-500",
      onClick: () => navigate("/profile")
    },
    {
      icon: MessageCircle,
      value: "5",
      label: "Messages",
      gradient: "bg-orange-500",
      onClick: () => {
        // Navigate to messages tab in dashboard
        const event = new CustomEvent('switchTab', { detail: 'messages' });
        window.dispatchEvent(event);
      }
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {stats.map((stat, index) => (
        <StatCard
          key={index}
          icon={stat.icon}
          value={stat.value}
          label={stat.label}
          gradient={stat.gradient}
          onClick={stat.onClick}
        />
      ))}
    </div>
  );
};
