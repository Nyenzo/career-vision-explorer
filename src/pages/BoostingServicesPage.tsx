import React, { useState } from "react";
import {
  TrendingUp,
  Target,
  Eye,
  Star,
  Zap,
  Crown,
  Rocket,
  Users,
  Clock,
  CheckCircle,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import Layout from "@/components/layout/Layout";

const BoostingServicesPage = () => {
  const [selectedPlan, setSelectedPlan] = useState("premium");

  const boostingPlans = [
    {
      id: "basic",
      name: "Basic Boost",
      price: "$29",
      period: "/week",
      icon: TrendingUp,
      color: "from-blue-500 to-blue-600",
      bgColor: "from-blue-50 to-blue-100",
      features: [
        "Featured placement for 7 days",
        "2x more visibility",
        "Basic analytics",
        "Email support",
      ],
    },
    {
      id: "premium",
      name: "Premium Boost",
      price: "$79",
      period: "/week",
      icon: Crown,
      color: "from-blue-500 to-blue-600",
      bgColor: "from-blue-50 to-blue-100",
      popular: true,
      features: [
        "Top placement for 7 days",
        "5x more visibility",
        "Advanced analytics",
        "Priority support",
        "Freelancer recommendations",
      ],
    },
    {
      id: "enterprise",
      name: "Enterprise Boost",
      price: "$149",
      period: "/week",
      icon: Rocket,
      color: "from-blue-500 to-blue-600",
      bgColor: "from-blue-50 to-blue-100",
      features: [
        "Premium placement for 14 days",
        "10x more visibility",
        "Full analytics suite",
        "Dedicated account manager",
        "Custom targeting",
        "Multiple job boost",
      ],
    },
  ];

  const activeBoosts = [];

  const additionalServices = [
    {
      title: "Profile Enhancement",
      description: "Professional profile optimization to attract top talent",
      price: "$49",
      icon: Star,
      features: [
        "Professional bio writing",
        "Skill highlighting",
        "Portfolio optimization",
      ],
    },
    {
      title: "Targeted Advertising",
      description: "Reach specific demographics and skill sets",
      price: "$99",
      icon: Target,
      features: [
        "Custom audience targeting",
        "Geographic filtering",
        "Skill-based matching",
      ],
    },
    {
      title: "Priority Support",
      description: "24/7 dedicated support for all your hiring needs",
      price: "$199",
      icon: Zap,
      features: [
        "Dedicated account manager",
        "Phone support",
        "Custom solutions",
      ],
    },
  ];

  return (
    <Layout>
      <div className="space-y-8">
        {/* Header Section */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-8 border border-white/20">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-lg mb-4">
              <Sparkles className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent mb-2">
              Boosting Services
            </h1>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Amplify your job postings and projects to reach the best talent
              faster. Get premium visibility and attract top-quality
              applications.
            </p>
          </div>
        </div>

        {/* Boosting Plans */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-8 border border-white/20">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Choose Your Boost Plan
            </h2>
            <p className="text-gray-600">
              Select the perfect plan to maximize your job visibility
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {boostingPlans.map((plan) => {
              const Icon = plan.icon;
              return (
                <div
                  key={plan.id}
                  className={`relative rounded-2xl border-2 transition-all duration-300 cursor-pointer ${
                    selectedPlan === plan.id
                      ? "border-blue-500 shadow-lg shadow-blue-500/20"
                      : "border-gray-200 hover:border-gray-300"
                  } ${
                    plan.popular ? "ring-2 ring-blue-500 ring-opacity-20" : ""
                  }`}
                  onClick={() => setSelectedPlan(plan.id)}
                >
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg">
                        Most Popular
                      </div>
                    </div>
                  )}

                  <div
                    className={`p-6 bg-gradient-to-br ${plan.bgColor} rounded-t-2xl`}
                  >
                    <div className="text-center">
                      <div
                        className={`inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br ${plan.color} rounded-xl shadow-lg mb-4`}
                      >
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-800 mb-2">
                        {plan.name}
                      </h3>
                      <div className="flex items-center justify-center space-x-1 mb-4">
                        <span className="text-3xl font-bold text-gray-800">
                          {plan.price}
                        </span>
                        <span className="text-gray-600">{plan.period}</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 bg-white rounded-b-2xl">
                    <ul className="space-y-3">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-center space-x-3">
                          <CheckCircle className="h-5 w-5 text-emerald-500 flex-shrink-0" />
                          <span className="text-gray-700">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <button
                      className={`w-full mt-6 px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                        selectedPlan === plan.id
                          ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg hover:shadow-xl"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      {selectedPlan === plan.id
                        ? "Selected Plan"
                        : "Select Plan"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {/* Active Boosts */}
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/20">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-800">Active Boosts</h3>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-gray-600">Live tracking</span>
              </div>
            </div>

            <div className="space-y-4">
              {activeBoosts.length > 0 ? (
                activeBoosts.map((boost) => (
                  <div
                    key={boost.id}
                    className="p-4 bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-100"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-semibold text-gray-800">
                          {boost.jobTitle}
                        </h4>
                        <p className="text-sm text-gray-600">{boost.plan}</p>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          boost.status === "Active"
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-amber-100 text-amber-700"
                        }`}
                      >
                        {boost.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-4 mb-3">
                      <div className="text-center">
                        <div className="flex items-center justify-center space-x-1 mb-1">
                          <Eye className="h-4 w-4 text-blue-500" />
                          <span className="text-sm font-semibold text-gray-800">
                            {boost.views}
                          </span>
                        </div>
                        <p className="text-xs text-gray-600">Views</p>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center justify-center space-x-1 mb-1">
                          <Users className="h-4 w-4 text-emerald-500" />
                          <span className="text-sm font-semibold text-gray-800">
                            {boost.applications}
                          </span>
                        </div>
                        <p className="text-xs text-gray-600">Applications</p>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center justify-center space-x-1 mb-1">
                          <Clock className="h-4 w-4 text-amber-500" />
                          <span className="text-sm font-semibold text-gray-800">
                            {boost.remaining}
                          </span>
                        </div>
                        <p className="text-xs text-gray-600">Remaining</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">
                        {boost.startDate} - {boost.endDate}
                      </span>
                      <button className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-all duration-200 text-sm font-medium">
                        View Details
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <div className="bg-gray-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                    <TrendingUp className="h-8 w-8 text-gray-400" />
                  </div>
                  <p className="text-gray-500 font-medium">No active boosts</p>
                  <p className="text-gray-400 text-sm">
                    Boost your jobs to get more visibility and applications
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Additional Services */}
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/20">
            <h3 className="text-xl font-bold text-gray-800 mb-6">
              Additional Services
            </h3>

            <div className="space-y-4">
              {additionalServices.map((service, index) => {
                const Icon = service.icon;
                return (
                  <div
                    key={index}
                    className="p-4 bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-100 hover:border-gray-200 transition-all duration-200 group"
                  >
                    <div className="flex items-start space-x-4">
                      <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-3 rounded-xl shadow-lg group-hover:scale-105 transition-transform duration-200">
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold text-gray-800">
                            {service.title}
                          </h4>
                          <span className="text-xl font-bold text-gray-800">
                            {service.price}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-3">
                          {service.description}
                        </p>
                        <div className="space-y-1 mb-4">
                          {service.features.map((feature, featureIndex) => (
                            <div
                              key={featureIndex}
                              className="flex items-center space-x-2"
                            >
                              <CheckCircle className="h-3 w-3 text-emerald-500" />
                              <span className="text-xs text-gray-600">
                                {feature}
                              </span>
                            </div>
                          ))}
                        </div>
                        <button className="w-full px-4 py-2 bg-gradient-to-r from-blue-100 to-blue-200 text-blue-700 rounded-lg hover:from-blue-200 hover:to-blue-300 transition-all duration-200 text-sm font-medium flex items-center justify-center space-x-2">
                          <span>Learn More</span>
                          <ArrowRight className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default BoostingServicesPage;
