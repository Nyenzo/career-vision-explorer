import { apiClient } from '../lib/api-client';
import { MarketData, IndustryInsight, RegionalData } from '../hooks/use-insights-data';

class InsightsService {
  // Fallback data for when backend is unavailable
  private fallbackMarketData: MarketData[] = [
    { id: "1", type: "job_openings", value: 128432, change: "+15%", label: "Job Openings" },
    { id: "2", type: "average_salary", value: 112500, change: "+5%", label: "Average Salary" },
    { id: "3", type: "remote_jobs", value: 32, change: "+8%", label: "Remote Jobs" },
  ];

  private fallbackIndustryInsights: IndustryInsight[] = [
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
  ];

  async getMarketInsights(): Promise<{
    marketData: MarketData[];
    industryInsights: IndustryInsight[];
    regionalData: RegionalData[];
  }> {
    try {
      // Try to fetch from backend first
      const response = await apiClient.get<any>('/insights/market');
      return response;
    } catch (error) {
      console.warn('Failed to fetch insights from backend, using fallback data');
      
      // Return fallback data
      return {
        marketData: this.fallbackMarketData,
        industryInsights: this.fallbackIndustryInsights,
        regionalData: [
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
        ]
      };
    }
  }

  async getIndustryAnalysis(industry: string): Promise<any> {
    try {
      const response = await apiClient.get(`/insights/industry/${industry}`);
      return response;
    } catch (error) {
      console.warn('Industry analysis not available from backend');
      
      // Return mock analysis
      return {
        industry,
        analysis: "This industry is experiencing steady growth with increasing demand for skilled professionals.",
        trends: ["Digital transformation", "Remote work adoption", "Skills gap widening"],
        opportunities: ["High demand for technical skills", "Competitive salaries", "Career advancement"],
        challenges: ["Rapid technology changes", "Increased competition", "Need for continuous learning"]
      };
    }
  }

  async getSkillTrends(): Promise<any> {
    try {
      const response = await apiClient.get('/insights/skill-trends');
      return response;
    } catch (error) {
      console.warn('Skill trends not available from backend');
      
      return {
        trending: ["AI/ML", "Cloud Computing", "Data Analysis", "Cybersecurity"],
        declining: ["Legacy Systems", "Manual Testing", "Basic HTML/CSS"],
        emerging: ["Quantum Computing", "Blockchain", "Edge Computing", "Green Tech"]
      };
    }
  }

  async getSalaryInsights(role?: string, location?: string): Promise<any> {
    try {
      const params = new URLSearchParams();
      if (role) params.append('role', role);
      if (location) params.append('location', location);
      
      const endpoint = params.toString() ? `/insights/salary?${params}` : '/insights/salary';
      const response = await apiClient.get(endpoint);
      return response;
    } catch (error) {
      console.warn('Salary insights not available from backend');
      
      return {
        average: 95000,
        median: 85000,
        range: { min: 60000, max: 150000 },
        percentiles: {
          p25: 70000,
          p50: 85000,
          p75: 110000,
          p90: 135000
        }
      };
    }
  }
}

export const insightsService = new InsightsService();
