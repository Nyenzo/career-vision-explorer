import { Job, Application } from '@/types/api';

// Mock data for employer dashboard when API is unavailable
export class EmployerMockService {
  private static instance: EmployerMockService;

  private constructor() {}

  static getInstance(): EmployerMockService {
    if (!EmployerMockService.instance) {
      EmployerMockService.instance = new EmployerMockService();
    }
    return EmployerMockService.instance;
  }

  // Generate mock employer stats
  async getEmployerStats() {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    return {
      total_jobs: 12,
      active_jobs: 8,
      total_applications: 45,
      companies_count: 1,
      locations_count: 3,
      avg_applications_per_job: 3.75
    };
  }

  // Generate mock jobs for employer
  async getEmployerJobs(): Promise<Job[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const mockJobs: Job[] = [
      {
        job_id: '1',
        title: 'Senior Frontend Developer',
        company: 'TechCorp Solutions',
        location: 'San Francisco, CA',
        salary_range: '$120,000 - $150,000',
        job_type: 'full-time',
        experience_level: 'Senior',
        description: 'We are looking for an experienced Frontend Developer...',
        requirements: ['React', 'TypeScript', '5+ years experience'],
        benefits: ['Health insurance', '401k', 'Remote work'],
        skills: ['React', 'TypeScript', 'Node.js'],
        is_active: true,
        created_at: '2024-01-15T10:00:00Z',
        updated_at: '2024-01-15T10:00:00Z',
        posted_by: 'employer-123',
        posted_by_company: 'TechCorp Solutions',
        application_count: 12
      },
      {
        job_id: '2',
        title: 'Full Stack Developer',
        company: 'TechCorp Solutions',
        location: 'New York, NY',
        salary_range: '$100,000 - $130,000',
        job_type: 'full-time',
        experience_level: 'Mid-level',
        description: 'Join our team as a Full Stack Developer...',
        requirements: ['React', 'Python', '3+ years experience'],
        benefits: ['Health insurance', 'Stock options'],
        skills: ['React', 'Python', 'PostgreSQL'],
        is_active: true,
        created_at: '2024-01-10T10:00:00Z',
        updated_at: '2024-01-10T10:00:00Z',
        posted_by: 'employer-123',
        posted_by_company: 'TechCorp Solutions',
        application_count: 8
      },
      {
        job_id: '3',
        title: 'DevOps Engineer',
        company: 'TechCorp Solutions',
        location: 'Austin, TX',
        salary_range: '$110,000 - $140,000',
        job_type: 'full-time',
        experience_level: 'Senior',
        description: 'We need a DevOps engineer to manage our infrastructure...',
        requirements: ['AWS', 'Kubernetes', 'CI/CD'],
        benefits: ['Health insurance', 'Flexible hours'],
        skills: ['AWS', 'Docker', 'Kubernetes'],
        is_active: false,
        created_at: '2024-01-05T10:00:00Z',
        updated_at: '2024-01-20T10:00:00Z',
        posted_by: 'employer-123',
        posted_by_company: 'TechCorp Solutions',
        application_count: 15
      }
    ];

    return mockJobs;
  }

  // Generate mock applications for employer
  async getEmployerApplications(): Promise<Application[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const mockApplications: Application[] = [
      {
        application_id: 'app-1',
        job_id: '1',
        user_id: 'user-123',
        applicant_name: 'John Doe',
        applicant_email: 'john.doe@email.com',
        job_title: 'Senior Frontend Developer',
        company_name: 'TechCorp Solutions',
        status: 'Pending',
        applied_at: '2024-01-20T14:00:00Z',
        cover_letter: 'I am excited to apply for this position...',
        resume_link: 'https://example.com/resume.pdf'
      },
      {
        application_id: 'app-2',
        job_id: '1',
        user_id: 'user-456',
        applicant_name: 'Jane Smith',
        applicant_email: 'jane.smith@email.com',
        job_title: 'Senior Frontend Developer',
        company_name: 'TechCorp Solutions',
        status: 'Reviewed',
        applied_at: '2024-01-19T10:00:00Z',
        cover_letter: 'With my 7 years of experience...',
        resume_link: 'https://example.com/resume2.pdf'
      },
      {
        application_id: 'app-3',
        job_id: '2',
        user_id: 'user-789',
        applicant_name: 'Bob Johnson',
        applicant_email: 'bob.j@email.com',
        job_title: 'Full Stack Developer',
        company_name: 'TechCorp Solutions',
        status: 'Accepted',
        applied_at: '2024-01-18T09:00:00Z',
        cover_letter: 'I am a passionate full stack developer...',
        resume_link: 'https://example.com/resume3.pdf'
      },
      {
        application_id: 'app-4',
        job_id: '2',
        user_id: 'user-101',
        applicant_name: 'Alice Williams',
        applicant_email: 'alice.w@email.com',
        job_title: 'Full Stack Developer',
        company_name: 'TechCorp Solutions',
        status: 'Rejected',
        applied_at: '2024-01-17T15:00:00Z',
        cover_letter: 'I would love to join your team...',
        resume_link: null
      },
      {
        application_id: 'app-5',
        job_id: '3',
        user_id: 'user-102',
        applicant_name: 'Charlie Brown',
        applicant_email: 'charlie.b@email.com',
        job_title: 'DevOps Engineer',
        company_name: 'TechCorp Solutions',
        status: 'Pending',
        applied_at: '2024-01-16T11:00:00Z',
        cover_letter: 'As an experienced DevOps engineer...',
        resume_link: 'https://example.com/resume5.pdf'
      }
    ];

    return mockApplications;
  }
}

export const employerMockService = EmployerMockService.getInstance();
