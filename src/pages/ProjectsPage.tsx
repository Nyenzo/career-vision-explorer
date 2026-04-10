// src/pages/ProjectsPage.tsx
import React, { useState } from "react";
import {
  FolderOpen,
  Calendar,
  Users,
  Clock,
  CheckCircle,
  AlertCircle,
  MessageSquare,
  FileText,
  DollarSign,
  BarChart3,
  Play,
  Pause,
  MoreVertical,
  Plus,
} from "lucide-react";
import Layout from "@/components/layout/Layout";

const ProjectsPage = () => {
  const [activeTab, setActiveTab] = useState("all");

  const projects: any[] = [];

  const tabs = [
    { id: "all", label: "All Projects", count: 0 },
    { id: "active", label: "Active", count: 0 },
    { id: "review", label: "In Review", count: 0 },
    { id: "completed", label: "Completed", count: 0 },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "In Progress":
        return "bg-blue-100 text-blue-700";
      case "Review":
        return "bg-amber-100 text-amber-700";
      case "Completed":
        return "bg-emerald-100 text-emerald-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return "from-emerald-500 to-emerald-600";
    if (progress >= 50) return "from-blue-500 to-blue-600";
    return "from-amber-500 to-amber-600";
  };

  return (
    <Layout>
      <div className="space-y-8">
        {/* Header Section */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-8 border border-white/20">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                Project Management
              </h1>
              <p className="text-gray-600">
                Track project progress, manage deadlines, and communicate with
                freelancers
              </p>
            </div>
            <button className="mt-4 lg:mt-0 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white px-6 py-3 rounded-xl hover:from-emerald-700 hover:to-emerald-800 transition-all duration-200 flex items-center space-x-2 shadow-lg hover:shadow-xl">
              <Plus className="h-5 w-5" />
              <span>New Project</span>
            </button>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 p-4 rounded-xl">
              <div className="flex items-center space-x-3">
                <div className="bg-emerald-500 p-2 rounded-lg">
                  <FolderOpen className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-sm text-emerald-700">Active Projects</p>
                  <p className="text-xl font-bold text-emerald-800">0</p>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl">
              <div className="flex items-center space-x-3">
                <div className="bg-blue-500 p-2 rounded-lg">
                  <BarChart3 className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-sm text-blue-700">Avg. Progress</p>
                  <p className="text-xl font-bold text-blue-800">0%</p>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-xl">
              <div className="flex items-center space-x-3">
                <div className="bg-purple-500 p-2 rounded-lg">
                  <DollarSign className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-sm text-purple-700">Total Budget</p>
                  <p className="text-xl font-bold text-purple-800">$0</p>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-amber-50 to-amber-100 p-4 rounded-xl">
              <div className="flex items-center space-x-3">
                <div className="bg-amber-500 p-2 rounded-lg">
                  <Clock className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-sm text-amber-700">Due This Week</p>
                  <p className="text-xl font-bold text-amber-800">0</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/20">
          <div className="flex items-center space-x-4">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all duration-200 ${
                  activeTab === tab.id
                    ? "bg-emerald-100 text-emerald-700 font-medium"
                    : "text-gray-600 hover:text-emerald-600 hover:bg-emerald-50"
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`px-2 py-1 rounded-full text-xs ${
                    activeTab === tab.id ? "bg-emerald-200" : "bg-gray-200"
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {projects.length > 0 ? (
            projects.map((project) => (
              <div
                key={project.id}
                className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border border-white/20"
              >
                {/* Project Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-800 mb-1">
                      {project.title}
                    </h3>
                    <p className="text-sm text-gray-600">
                      Client: {project.client}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                        project.status
                      )}`}
                    >
                      {project.status}
                    </span>
                    <button className="p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-50 transition-all duration-200">
                      <MoreVertical className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Freelancer Info */}
                <div className="flex items-center space-x-3 mb-4 p-3 bg-gray-50/50 rounded-xl">
                  <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-2 rounded-xl">
                    <Users className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-800">
                      {project.freelancer}
                    </p>
                    <p className="text-xs text-gray-600">Freelancer</p>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">
                      Progress
                    </span>
                    <span className="text-sm font-bold text-gray-800">
                      {project.progress}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`bg-gradient-to-r ${getProgressColor(
                        project.progress
                      )} h-2 rounded-full transition-all duration-300`}
                      style={{ width: `${project.progress}%` }}
                    ></div>
                  </div>
                </div>

                {/* Project Details */}
                <div className="space-y-3 mb-4">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-2 text-gray-600">
                      <DollarSign className="h-4 w-4" />
                      <span>Budget</span>
                    </div>
                    <span className="font-medium text-gray-800">
                      {project.budget}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-2 text-gray-600">
                      <Calendar className="h-4 w-4" />
                      <span>Deadline</span>
                    </div>
                    <span
                      className={`font-medium ${
                        project.daysLeft <= 3
                          ? "text-red-600"
                          : project.daysLeft <= 7
                          ? "text-amber-600"
                          : "text-gray-800"
                      }`}
                    >
                      {project.daysLeft > 0
                        ? `${project.daysLeft} days left`
                        : "Completed"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-2 text-gray-600">
                      <CheckCircle className="h-4 w-4" />
                      <span>Tasks</span>
                    </div>
                    <span className="font-medium text-gray-800">
                      {project.tasks.completed}/{project.tasks.total}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div className="flex items-center space-x-2 text-sm text-gray-500">
                    <Clock className="h-4 w-4" />
                    <span>{project.lastActivity}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200">
                      <FileText className="h-4 w-4" />
                    </button>
                    <button className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all duration-200">
                      <MessageSquare className="h-4 w-4" />
                    </button>
                    <button className="px-3 py-2 bg-emerald-100 text-emerald-700 rounded-lg hover:bg-emerald-200 transition-all duration-200 text-sm font-medium">
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <div className="bg-gray-100 p-6 rounded-full w-24 h-24 mx-auto mb-6 flex items-center justify-center">
                <FolderOpen className="h-12 w-12 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                No projects yet
              </h3>
              <p className="text-gray-500 mb-6">
                Start your first project by hiring a freelancer from your job
                postings
              </p>
              <button className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white px-6 py-3 rounded-xl hover:from-emerald-700 hover:to-emerald-800 transition-all duration-200 flex items-center space-x-2 mx-auto shadow-lg hover:shadow-xl">
                <Plus className="h-5 w-5" />
                <span>Create Project</span>
              </button>
            </div>
          )}
        </div>

        {/* Quick Actions Panel */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/20">
          <h3 className="text-lg font-bold text-gray-800 mb-4">
            Quick Actions
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200 hover:border-blue-300 hover:shadow-md transition-all duration-200 text-left group">
              <div className="flex items-center space-x-3 mb-2">
                <div className="bg-blue-500 p-2 rounded-lg group-hover:scale-105 transition-transform duration-200">
                  <MessageSquare className="h-5 w-5 text-white" />
                </div>
                <h4 className="font-semibold text-gray-800">Team Chat</h4>
              </div>
              <p className="text-sm text-gray-600">
                Communicate with freelancers
              </p>
            </button>
            <button className="p-4 bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl border border-emerald-200 hover:border-emerald-300 hover:shadow-md transition-all duration-200 text-left group">
              <div className="flex items-center space-x-3 mb-2">
                <div className="bg-emerald-500 p-2 rounded-lg group-hover:scale-105 transition-transform duration-200">
                  <BarChart3 className="h-5 w-5 text-white" />
                </div>
                <h4 className="font-semibold text-gray-800">
                  Progress Reports
                </h4>
              </div>
              <p className="text-sm text-gray-600">Generate detailed reports</p>
            </button>
            <button className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl border border-purple-200 hover:border-purple-300 hover:shadow-md transition-all duration-200 text-left group">
              <div className="flex items-center space-x-3 mb-2">
                <div className="bg-purple-500 p-2 rounded-lg group-hover:scale-105 transition-transform duration-200">
                  <Calendar className="h-5 w-5 text-white" />
                </div>
                <h4 className="font-semibold text-gray-800">Schedule Review</h4>
              </div>
              <p className="text-sm text-gray-600">Plan milestone meetings</p>
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ProjectsPage;
