import React, { useState } from "react";
import { FolderOpen, Plus, Eye } from "lucide-react";

const ProjectsPage = ({ projects = [] }) => {
  const [activeTab, setActiveTab] = useState("all");

  const tabs = [
    { id: "all", label: "All Projects", count: projects.length },
    {
      id: "active",
      label: "Active",
      count: projects.filter((p) => p.status === "Active").length,
    },
    {
      id: "review",
      label: "In Review",
      count: projects.filter((p) => p.status === "In Review").length,
    },
    {
      id: "pending",
      label: "Pending",
      count: projects.filter((p) => p.status === "Pending").length,
    },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case "Active":
        return "bg-blue-100 text-blue-700";
      case "In Review":
        return "bg-blue-100 text-blue-600";
      case "Pending":
        return "bg-blue-50 text-blue-500";
      case "Completed":
        return "bg-blue-100 text-blue-700";
      default:
        return "bg-blue-50 text-blue-500";
    }
  };

  const getProgressColor = (progress) => {
    if (progress >= 80) return "from-blue-600 to-blue-700";
    if (progress >= 50) return "from-blue-500 to-blue-600";
    return "from-blue-400 to-blue-500";
  };

  const filteredProjects =
    activeTab === "all"
      ? projects
      : projects.filter((project) => {
          if (activeTab === "active") return project.status === "Active";
          if (activeTab === "review") return project.status === "In Review";
          if (activeTab === "pending") return project.status === "Pending";
          return true;
        });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="w-full px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Header */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-6 sm:p-8 border border-white/20 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex-1">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
              Project Management
            </h1>
            <p className="text-gray-600 text-sm sm:text-base">
              View listed projects, manage applicants, get freelancer
              recommendations, control deadlines, and communicate with assigned
              freelancers
            </p>
          </div>
          <button className="mt-2 lg:mt-0 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl text-sm sm:text-base">
            <Plus className="h-4 w-4 sm:h-5 sm:w-5" />
            <span>New Project</span>
          </button>
        </div>

        {/* Tabs */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-4 sm:p-6 border border-white/20 overflow-x-auto">
          <div className="flex gap-2 min-w-max">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl transition-all duration-200 whitespace-nowrap flex-shrink-0 ${
                  activeTab === tab.id
                    ? "bg-blue-100 text-blue-700 font-medium"
                    : "text-gray-600 hover:text-blue-600 hover:bg-blue-50"
                }`}
              >
                <span className="text-sm sm:text-base">{tab.label}</span>
                <span
                  className={`px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full text-xs sm:text-sm ${
                    activeTab === tab.id ? "bg-blue-200" : "bg-gray-200"
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Projects Table - Desktop */}
        <div className="hidden sm:block bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 overflow-x-auto">
          {filteredProjects.length > 0 ? (
            <table className="w-full min-w-[800px]">
              <thead className="bg-gray-50/50 border-b border-gray-200">
                <tr>
                  <th className="text-left p-4 sm:p-6 text-sm sm:text-base font-semibold text-gray-700">
                    Project
                  </th>
                  <th className="text-left p-4 sm:p-6 text-sm sm:text-base font-semibold text-gray-700">
                    Status
                  </th>
                  <th className="text-left p-4 sm:p-6 text-sm sm:text-base font-semibold text-gray-700">
                    Freelancer
                  </th>
                  <th className="text-left p-4 sm:p-6 text-sm sm:text-base font-semibold text-gray-700">
                    Applicants
                  </th>
                  <th className="text-left p-4 sm:p-6 text-sm sm:text-base font-semibold text-gray-700">
                    Progress
                  </th>
                  <th className="text-left p-4 sm:p-6 text-sm sm:text-base font-semibold text-gray-700">
                    Budget
                  </th>
                  <th className="text-left p-4 sm:p-6 text-sm sm:text-base font-semibold text-gray-700">
                    Deadline
                  </th>
                  <th className="text-left p-4 sm:p-6 text-sm sm:text-base font-semibold text-gray-700">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredProjects.map((project, idx) => (
                  <tr
                    key={idx}
                    className="border-t border-gray-100 hover:bg-blue-50/20 transition-colors cursor-pointer"
                  >
                    <td className="p-4 sm:p-6 text-sm sm:text-base">
                      {project.title}
                    </td>
                    <td className="p-4 sm:p-6">
                      <span
                        className={`px-2 py-1 rounded-full text-xs sm:text-sm font-medium ${getStatusColor(
                          project.status,
                        )}`}
                      >
                        {project.status}
                      </span>
                    </td>
                    <td className="p-4 sm:p-6 text-sm sm:text-base">
                      {project.freelancer}
                    </td>
                    <td className="p-4 sm:p-6 text-sm sm:text-base">
                      {project.applicants}
                    </td>
                    <td className="p-4 sm:p-6">
                      <div className="w-full sm:w-36 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className={`h-2 rounded-full bg-gradient-to-r ${getProgressColor(
                            project.progress,
                          )}`}
                          style={{ width: `${project.progress}%` }}
                        />
                      </div>
                    </td>
                    <td className="p-4 sm:p-6 text-sm sm:text-base">
                      {project.budget}
                    </td>
                    <td className="p-4 sm:p-6 text-sm sm:text-base">
                      {project.deadline}
                    </td>
                    <td className="p-4 sm:p-6 text-sm sm:text-base">
                      <button className="p-2 rounded hover:bg-blue-50">
                        <Eye className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="text-center py-16">
              <div className="bg-gray-100 p-6 rounded-full w-24 h-24 mx-auto mb-6 flex items-center justify-center">
                <FolderOpen className="h-12 w-12 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                No projects yet
              </h3>
              <p className="text-gray-500 mb-6">
                Start your first project by creating a new job posting and
                hiring freelancers
              </p>
              <button className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 flex items-center space-x-2 mx-auto shadow-lg hover:shadow-xl">
                <Plus className="h-5 w-5" />
                <span>Create Project</span>
              </button>
            </div>
          )}
        </div>

        {/* Projects Cards - Mobile */}
        <div className="sm:hidden space-y-4">
          {filteredProjects.length > 0 ? (
            filteredProjects.map((project, idx) => (
              <div
                key={idx}
                className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-4"
              >
                <div className="flex justify-between items-start mb-2 flex-wrap gap-2">
                  <h3 className="font-medium text-gray-900 text-base">
                    {project.title}
                  </h3>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                      project.status,
                    )}`}
                  >
                    {project.status}
                  </span>
                </div>
                <div className="flex flex-col space-y-1 text-sm text-gray-600">
                  <div>
                    <strong>Freelancer:</strong> {project.freelancer}
                  </div>
                  <div>
                    <strong>Applicants:</strong> {project.applicants}
                  </div>
                  <div>
                    <strong>Progress:</strong>
                    <div className="w-full h-2 bg-gray-200 rounded-full mt-1">
                      <div
                        className={`h-2 rounded-full bg-gradient-to-r ${getProgressColor(
                          project.progress,
                        )}`}
                        style={{ width: `${project.progress}%` }}
                      />
                    </div>
                  </div>
                  <div>
                    <strong>Budget:</strong> {project.budget}
                  </div>
                  <div>
                    <strong>Deadline:</strong> {project.deadline}
                  </div>
                </div>
                <div className="flex justify-end mt-3">
                  <button className="p-2 rounded hover:bg-blue-50">
                    <Eye className="h-4 w-4 text-blue-600" />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-16">
              <div className="bg-gray-100 p-6 rounded-full w-24 h-24 mx-auto mb-6 flex items-center justify-center">
                <FolderOpen className="h-12 w-12 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                No projects yet
              </h3>
              <p className="text-gray-500 mb-6">
                Start your first project by creating a new job posting and
                hiring freelancers
              </p>
              <button className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 flex items-center space-x-2 mx-auto shadow-lg hover:shadow-xl">
                <Plus className="h-5 w-5" />
                <span>Create Project</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectsPage;
