import { Job, Profile } from '../types/api';

class FallbackDataService {
  private static instance: FallbackDataService;
  
  static getInstance(): FallbackDataService {
    if (!FallbackDataService.instance) {
      FallbackDataService.instance = new FallbackDataService();
    }
    return FallbackDataService.instance;
  }

  getFallbackJobs(): Job[] {
    return [
      {
        id: 'fallback-1',
        title: 'Senior Software Engineer',
        company: 'Tech Solutions Ltd',
        location: 'Nairobi, Kenya',
        job_type: 'Full-time',
        experience_level: 'Senior',
        salary_range: 'KES 150,000 - 200,000',
        description: 'We are looking for a skilled Senior Software Engineer to join our dynamic team...',
        requirements: 'Bachelor\'s degree in Computer Science, 5+ years experience...',
        skills_required: ['JavaScript', 'React', 'Node.js', 'Python', 'AWS'],
        benefits: ['Health Insurance', 'Remote Work', 'Professional Development'],
        is_active: true,
        remote_friendly: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        poster_id: 'employer-1'
      },
      {
        id: 'fallback-2',
        title: 'Frontend Developer',
        company: 'Digital Innovators',
        location: 'Mombasa, Kenya',
        job_type: 'Full-time',
        experience_level: 'Mid Level',
        salary_range: 'KES 100,000 - 140,000',
        description: 'Join our frontend team to build amazing user experiences...',
        requirements: 'Experience with modern frontend frameworks...',
        skills_required: ['React', 'TypeScript', 'CSS', 'HTML', 'Git'],
        benefits: ['Flexible Hours', 'Training Budget', 'Team Events'],
        is_active: true,
        remote_friendly: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        poster_id: 'employer-2'
      },
      {
        id: 'fallback-3',
        title: 'Data Analyst',
        company: 'Analytics Pro',
        location: 'Remote',
        job_type: 'Contract',
        experience_level: 'Mid Level',
        salary_range: 'KES 80,000 - 120,000',
        description: 'Analyze data to provide insights for business decisions...',
        requirements: 'Strong analytical skills and experience with SQL...',
        skills_required: ['SQL', 'Python', 'Excel', 'Tableau', 'Statistics'],
        benefits: ['Remote Work', 'Flexible Schedule', 'Performance Bonus'],
        is_active: true,
        remote_friendly: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        poster_id: 'employer-3'
      },
      {
        id: 'fallback-4',
        title: 'Full Stack Developer',
        company: 'StartupXYZ',
        location: 'Kisumu, Kenya',
        job_type: 'Full-time',
        experience_level: 'Junior',
        salary_range: 'KES 70,000 - 100,000',
        description: 'Work on both frontend and backend development...',
        requirements: 'Knowledge of web development technologies...',
        skills_required: ['JavaScript', 'React', 'Node.js', 'MongoDB', 'Express'],
        benefits: ['Learning Opportunities', 'Mentorship', 'Growth Path'],
        is_active: true,
        remote_friendly: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        poster_id: 'employer-4'
      },
      {
        id: 'fallback-5',
        title: 'DevOps Engineer',
        company: 'Cloud Masters',
        location: 'Nakuru, Kenya',
        job_type: 'Full-time',
        experience_level: 'Senior',
        salary_range: 'KES 180,000 - 250,000',
        description: 'Manage our cloud infrastructure and deployment pipelines...',
        requirements: 'Experience with cloud platforms and containerization...',
        skills_required: ['AWS', 'Docker', 'Kubernetes', 'Linux', 'CI/CD'],
        benefits: ['Stock Options', 'Conference Budget', 'Equipment Allowance'],
        is_active: true,
        remote_friendly: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        poster_id: 'employer-5'
      }
    ];
  }

  getFallbackProfile(): Partial<Profile> {
    return {
      name: 'Sample User',
      email: 'user@example.com',
      skills: ['JavaScript', 'React', 'Node.js', 'Python'],
      bio: 'Experienced software developer with a passion for creating innovative solutions.',
      location: 'Nairobi, Kenya',
      experience_years: 3,
      education: 'Bachelor of Science in Computer Science',
      phone: '+254-700-000-000',
      languages: ['English', 'Swahili'],
      certifications: ['AWS Certified Developer'],
      work_experience: [
        {
          company: 'Tech Company',
          position: 'Software Developer',
          duration: '2021 - Present',
          description: 'Develop and maintain web applications using modern technologies.'
        }
      ],
      projects: [
        {
          name: 'E-commerce Platform',
          description: 'Built a full-stack e-commerce solution with React and Node.js',
          tech_stack: ['React', 'Node.js', 'MongoDB'],
          url: null
        }
      ],
      preferences: {
        remote_work: true,
        max_commute: 30,
        notification_emails: true,
        preferred_industries: ['Technology', 'Fintech']
      },
      account_type: 'job_seeker' as const,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      profile_completion_percentage: 85
    };
  }

  getJobsWithFallback(): { jobs: Job[], total: number, page: number, per_page: number } {
    const jobs = this.getFallbackJobs();
    return {
      jobs,
      total: jobs.length,
      page: 1,
      per_page: jobs.length
    };
  }

  showFallbackMessage(operation: string): void {
    console.warn(`🔄 Using fallback data for ${operation} due to slow database response`);
  }
}

export const fallbackDataService = FallbackDataService.getInstance();
