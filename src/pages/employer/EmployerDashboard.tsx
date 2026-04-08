import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/admin/DashboardLayout";
import { StatisticsCards } from "@/components/employer/StatisticsCards";
import { RecentApplicantsTable } from "@/components/employer/RecentApplicantsTable";
import { JobListingsTable } from "@/components/employer/JobListingsTable";
import { MessagesFromFreelancers } from "@/components/employer/MessagesFromFreelancers";
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, Users, Briefcase, MessageCircle } from "lucide-react";

const EmployerDashboard = () => {
  return (
    <DashboardLayout title="Employer Dashboard" role="employer">
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
        <div className="max-w-7xl mx-auto space-y-6 p-4 sm:p-6 lg:p-8">
          {/* Welcome Section */}
          <div className="bg-card/80 backdrop-blur-sm rounded-xl shadow-sm border border-border/50 p-6 lg:p-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="space-y-2">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-primary via-primary to-secondary bg-clip-text text-transparent">
                  Welcome Back!
                </h1>
                <p className="text-muted-foreground text-sm sm:text-base lg:text-lg max-w-2xl">
                  Manage your job postings and connect with top talent from around the world
                </p>
              </div>
              <div className="flex-shrink-0">
                <div className="bg-gradient-to-br from-primary/10 to-secondary/10 p-4 rounded-xl border border-primary/20">
                  <TrendingUp className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
                </div>
              </div>
            </div>
          </div>

          {/* Job Post Header */}
          <div className="bg-card/90 backdrop-blur-sm rounded-xl shadow-sm border border-border/50 overflow-hidden">
            <JobPostHeader />
          </div>

          {/* Statistics Cards */}
          <div className="bg-card/90 backdrop-blur-sm rounded-xl shadow-sm border border-border/50 p-6 lg:p-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="bg-gradient-to-br from-primary/10 to-secondary/10 p-3 rounded-xl border border-primary/20">
                  <Briefcase className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl lg:text-2xl font-semibold text-foreground">Quick Overview</h2>
                  <p className="text-sm text-muted-foreground">Your recruitment metrics at a glance</p>
                </div>
              </div>
            </div>
            <StatisticsCards />
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-8">
            {/* Messages from Freelancers */}
            <div className="lg:col-span-1 xl:col-span-1">
              <div className="bg-card/90 backdrop-blur-sm rounded-xl shadow-sm border border-border/50 overflow-hidden h-full">
                <div className="p-6 border-b border-border/50 bg-gradient-to-r from-card to-muted/10">
                  <div className="flex items-center gap-3">
                    <div className="bg-gradient-to-br from-secondary/10 to-accent/10 p-3 rounded-xl border border-secondary/20">
                      <MessageCircle className="h-5 w-5 text-secondary-foreground" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-foreground">Messages</h3>
                      <p className="text-sm text-muted-foreground">Recent communications</p>
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  <MessagesFromFreelancers />
                </div>
              </div>
            </div>
            
            {/* Job Listings */}
            <Card className="lg:col-span-1 xl:col-span-1 bg-card/90 backdrop-blur-sm border-border/50 shadow-sm hover:shadow-md transition-all duration-200">
              <CardContent className="p-0 h-full flex flex-col">
                <div className="p-6 border-b border-border/50 bg-gradient-to-r from-card to-muted/10">
                  <div className="flex items-center gap-3">
                    <div className="bg-gradient-to-br from-primary/10 to-secondary/10 p-3 rounded-xl border border-primary/20">
                      <Briefcase className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-foreground">Active Jobs</h3>
                      <p className="text-sm text-muted-foreground">Your current job listings</p>
                    </div>
                  </div>
                </div>
                <div className="p-6 flex-1">
                  <JobListingsTable />
                </div>
              </CardContent>
            </Card>

            {/* Recent Applicants */}
            <Card className="lg:col-span-2 xl:col-span-1 bg-card/90 backdrop-blur-sm border-border/50 shadow-sm hover:shadow-md transition-all duration-200">
              <CardContent className="p-0 h-full flex flex-col">
                <div className="p-6 border-b border-border/50 bg-gradient-to-r from-card to-muted/10">
                  <div className="flex items-center gap-3">
                    <div className="bg-gradient-to-br from-accent/10 to-secondary/10 p-3 rounded-xl border border-accent/20">
                      <Users className="h-5 w-5 text-accent-foreground" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-foreground">Recent Applications</h3>
                      <p className="text-sm text-muted-foreground">Latest candidate submissions</p>
                    </div>
                  </div>
                </div>
                <div className="p-6 flex-1">
                  <RecentApplicantsTable />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Bottom Spacing */}
          <div className="h-8"></div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default EmployerDashboard;
