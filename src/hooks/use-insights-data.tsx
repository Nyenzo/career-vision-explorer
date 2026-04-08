
import { useState, useEffect } from "react";

export interface MarketData {
  id: string;
  type: "job_openings" | "average_salary" | "remote_jobs";
  value: number;
  change: string;
  label: string;
}

export interface IndustryInsight {
  id: string;
  industry: string;
  topRoles: string[];
  averageSalary: string;
  growthRate: string;
  topSkills: string[];
}

export interface RegionalData {
  id: string;
  region: string;
  topIndustries: string[];
  averageSalary: string;
  jobGrowth: string;
  costOfLiving: string;
}

export interface SalaryByRole {
  name: string;
  salary: number;
}

export interface JobTrend {
  month: string;
  jobs: number;
}

export interface SkillDemand {
  name: string;
  value: number;
}

const useInsightsData = () => {
  const [marketData, setMarketData] = useState<MarketData[]>([
    { id: "1", type: "job_openings", value: 128432, change: "+15%", label: "Job Openings" },
    { id: "2", type: "average_salary", value: 112500, change: "+5%", label: "Average Salary" },
    { id: "3", type: "remote_jobs", value: 32, change: "+8%", label: "Remote Jobs" },
  ]);

  const [industryInsights, setIndustryInsights] = useState<IndustryInsight[]>([
    {
      id: "1",
      industry: "Technology",
      topRoles: ["Software Engineer", "Product Manager", "Data Scientist"],
      averageSalary: "$115,000",
      growthRate: "+18%",
      topSkills: ["Programming", "System Design", "AI/ML"],
    },
    {
      id: "2",
      industry: "Finance",
      topRoles: ["Financial Analyst", "Investment Banker", "Risk Manager"],
      averageSalary: "$105,000",
      growthRate: "+8%",
      topSkills: ["Financial Modeling", "Risk Assessment", "Regulatory Compliance"],
    },
    {
      id: "3",
      industry: "Healthcare",
      topRoles: ["Medical Technician", "Healthcare Administrator", "Nurse Practitioner"],
      averageSalary: "$95,000",
      growthRate: "+15%",
      topSkills: ["Patient Care", "Medical Knowledge", "Regulatory Compliance"],
    },
  ]);

  const [regionalData, setRegionalData] = useState<RegionalData[]>([
    {
      id: "1",
      region: "San Francisco Bay Area",
      topIndustries: ["Tech", "Biotech", "Finance"],
      averageSalary: "$145,000",
      jobGrowth: "+12%",
      costOfLiving: "Very High",
    },
    {
      id: "2",
      region: "New York City",
      topIndustries: ["Finance", "Media", "Fashion"],
      averageSalary: "$125,000",
      jobGrowth: "+9%",
      costOfLiving: "Very High",
    },
    {
      id: "3",
      region: "Austin, TX",
      topIndustries: ["Tech", "Education", "Healthcare"],
      averageSalary: "$95,000",
      jobGrowth: "+15%",
      costOfLiving: "Medium",
    },
  ]);

  const [salaryByRoleData] = useState<SalaryByRole[]>([
    { name: "Software Engineer", salary: 110000 },
    { name: "Data Scientist", salary: 120000 },
    { name: "Product Manager", salary: 125000 },
    { name: "UX Designer", salary: 95000 },
    { name: "DevOps Engineer", salary: 115000 },
    { name: "Marketing Manager", salary: 90000 },
  ]);

  const [jobTrendData] = useState<JobTrend[]>([
    { month: "Jan", jobs: 5200 },
    { month: "Feb", jobs: 5000 },
    { month: "Mar", jobs: 5400 },
    { month: "Apr", jobs: 5600 },
    { month: "May", jobs: 6000 },
    { month: "Jun", jobs: 5800 },
    { month: "Jul", jobs: 6200 },
    { month: "Aug", jobs: 6400 },
    { month: "Sep", jobs: 6700 },
    { month: "Oct", jobs: 6500 },
    { month: "Nov", jobs: 6800 },
    { month: "Dec", jobs: 7000 },
  ]);

  const [skillDemandData] = useState<SkillDemand[]>([
    { name: "React", value: 25 },
    { name: "Python", value: 20 },
    { name: "Data Analysis", value: 15 },
    { name: "Cloud Services", value: 12 },
    { name: "UX Design", value: 10 },
    { name: "Leadership", value: 18 },
  ]);

  const updateMarketData = (id: string, data: Partial<MarketData>) => {
    setMarketData(prev => prev.map(item => 
      item.id === id ? { ...item, ...data } : item
    ));
  };

  const addMarketData = (data: Omit<MarketData, 'id'>) => {
    const newItem: MarketData = {
      ...data,
      id: Date.now().toString(),
    };
    setMarketData(prev => [...prev, newItem]);
  };

  const deleteMarketData = (id: string) => {
    setMarketData(prev => prev.filter(item => item.id !== id));
  };

  const updateIndustryInsight = (id: string, data: Partial<IndustryInsight>) => {
    setIndustryInsights(prev => prev.map(item => 
      item.id === id ? { ...item, ...data } : item
    ));
  };

  const addIndustryInsight = (data: Omit<IndustryInsight, 'id'>) => {
    const newItem: IndustryInsight = {
      ...data,
      id: Date.now().toString(),
    };
    setIndustryInsights(prev => [...prev, newItem]);
  };

  const deleteIndustryInsight = (id: string) => {
    setIndustryInsights(prev => prev.filter(item => item.id !== id));
  };

  const updateRegionalData = (id: string, data: Partial<RegionalData>) => {
    setRegionalData(prev => prev.map(item => 
      item.id === id ? { ...item, ...data } : item
    ));
  };

  const addRegionalData = (data: Omit<RegionalData, 'id'>) => {
    const newItem: RegionalData = {
      ...data,
      id: Date.now().toString(),
    };
    setRegionalData(prev => [...prev, newItem]);
  };

  const deleteRegionalData = (id: string) => {
    setRegionalData(prev => prev.filter(item => item.id !== id));
  };

  return {
    marketData,
    industryInsights,
    regionalData,
    salaryByRoleData,
    jobTrendData,
    skillDemandData,
    updateMarketData,
    addMarketData,
    deleteMarketData,
    updateIndustryInsight,
    addIndustryInsight,
    deleteIndustryInsight,
    updateRegionalData,
    addRegionalData,
    deleteRegionalData,
  };
};

export default useInsightsData;
