# Career Vision Explorer - Complete Documentation

## Table of Contents
1. [Quick Start](#quick-start)
2. [Architecture Overview](#architecture-overview)
3. [Features](#features)
4. [API Integration Guide](#api-integration-guide)
5. [Backend Integration](#backend-integration)
6. [Job Seeker Functionality](#job-seeker-functionality)
7. [Match Percentage Logic](#match-percentage-logic)
8. [Project Structure](#project-structure)
9. [Development Workflow](#development-workflow)
10. [Testing](#testing)
11. [Deployment](#deployment)
12. [Troubleshooting](#troubleshooting)

## Quick Start

### Prerequisites
- Node.js 18+ and npm
- Python 3.8+
- Git

### 1. Frontend Setup (React)

```bash
# Install dependencies
npm install

# Start the development server
npm run dev
```

The frontend will run on: **http://localhost:8080**

### 2. Backend Setup (FastAPI)

Open a new terminal and run:

```bash
# Navigate to backend directory
cd jobsportal

# Install Python dependencies
pip install -r requirements.txt

# Start the backend server
uvicorn main:app --reload --port 8000
```

The backend API will run on: **http://localhost:8000**

### 3. Access the Application

- **Web App**: http://localhost:8080
- **API Documentation**: http://localhost:8000/docs
- **API Alternative Docs**: http://localhost:8000/redoc

## Architecture Overview

```
Frontend (React + TypeScript)     Backend (FastAPI + Python)
├── Web App (Port 8080)          ├── API Server (Port 8000)
├── Mobile PWA Support           ├── AI Services (Gemini)
├── Offline Capabilities         ├── Database (Supabase)
└── Real-time Updates           └── Authentication (JWT)
```

### Frontend Architecture
```
Frontend (React + TypeScript)
├── API Client Layer (src/lib/api-client.ts)
├── Services Layer (src/services/)
├── Hooks Layer (src/hooks/ & src/core/hooks/)
├── Components Layer (src/components/)
└── Pages Layer (src/pages/)
```

### Backend Architecture
```
Backend (FastAPI + Python)
├── API Routes (jobsportal/app/routes/)
├── Services (jobsportal/app/services/)
├── Models (jobsportal/app/models/)
├── Schemas (jobsportal/app/schema/)
└── Database (Supabase PostgreSQL)
```

## Features

### For Job Seekers
- **Smart Job Search** with AI-powered matching
- **Skills Assessment** and gap analysis
- **Resume Analysis** with AI feedback
- **Application Tracking** and status updates
- **Career Path Recommendations**
- **Interview Preparation** with AI-generated questions

### For Employers
- **Job Posting Management**
- **Applicant Tracking System**
- **Bulk Application Processing**
- **Interview Scheduling**
- **Analytics Dashboard**

### For Administrators
- **User Management**
- **Content Management**
- **System Analytics**
- **Skills Database Management**

## API Integration Guide

### Basic Usage

```typescript
import { JobsApi } from '@/api/jobs-api';
import { ProfileApi } from '@/api/profile-api';
import { ApplicationsApi } from '@/api/applications-api';

// Search for jobs
const jobResults = await JobsApi.searchJobs({
  query: 'React Developer',
  location: 'Nairobi'
});

// Get user profile
const profile = await ProfileApi.getProfile();

// Submit job application
const application = await ApplicationsApi.submitApplication({
  jobId: 'job123',
  coverLetter: 'My cover letter...'
});
```

### Error Handling

```typescript
try {
  const jobs = await JobsApi.searchJobs(params);
  console.log('Jobs found:', jobs.jobs.length);
} catch (error) {
  console.error('API Error:', error);
  // Handle error appropriately
}
```

### React Hook Integration

```typescript
// Custom hook for API calls
import { useState, useEffect } from 'react';
import { JobsApi, JobSearchParams } from '@/api/jobs-api';

export const useJobs = (params: JobSearchParams) => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchJobs = async () => {
      setLoading(true);
      try {
        const result = await JobsApi.searchJobs(params);
        setJobs(result.jobs);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, [params]);

  return { jobs, loading, error };
};
```

## Backend Integration

### Environment Configuration

Create `.env` file in the root directory:
```env
# Backend API Configuration
VITE_API_BASE_URL=http://localhost:8000/api/v1
VITE_BACKEND_URL=http://localhost:8000

# Supabase Configuration
VITE_SUPABASE_URL=https://oxmwdtwhdslfiqspobch.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Key API Endpoints

#### Authentication
- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `POST /auth/refresh` - Token refresh
- `GET /auth/me` - Current user info

#### Jobs
- `GET /jobs` - Search jobs with filters
- `GET /jobs/{id}` - Get job details
- `POST /jobs` - Create job (employers)
- `PUT /jobs/{id}` - Update job
- `DELETE /jobs/{id}` - Delete job

#### Applications
- `GET /applications` - Get user applications
- `POST /applications` - Submit application
- `PUT /applications/{id}` - Update application
- `DELETE /applications/{id}` - Withdraw application

#### Profile
- `GET /profile` - Get user profile
- `PUT /profile` - Update profile
- `POST /profile/image` - Upload profile image
- `POST /profile/resume` - Upload resume

#### AI Features
- `POST /ai/analyze-resume` - Analyze resume
- `POST /ai/job-match` - Analyze job match
- `POST /ai/skill-gap` - Skill gap analysis
- `POST /ai/interview-questions` - Generate interview questions

## Job Seeker Functionality

### Backend Components
- **`auth.py` (routes):** User authentication endpoints
- **`profile.py` (routes):** Profile management endpoints
- **`jobs.py` (routes):** Job searching endpoints
- **`applications.py` (routes):** Application management endpoints
- **`ai.py` (routes):** AI-powered features
- **`skill_gap.py` (routes):** Advanced skill gap analysis

### Frontend Components
- **`useAuth.tsx` (hook):** Session management
- **`useUserProfile.tsx` (hook):** Profile data management
- **`useJobPosts.tsx` (hook):** Job listings management
- **`useJobApplications.tsx` (hook):** Application tracking
- **`Jobs.tsx` (page):** Main job listings page
- **`JobDetails.tsx` (page):** Individual job details
- **`Profile.tsx` (page):** User profile management

### Logic Flow
1. **Authentication:** Token-based authentication with auto-refresh
2. **Profile Management:** Centralized profile data fetching and updates
3. **Job Viewing:** Dynamic job listings with filtering and search
4. **Job Application:** Streamlined application process with status tracking

## Match Percentage Logic

### Backend Implementation
- **`job_service.py`:** Core match calculation logic
- **`cv_parser_service.py`:** Semantic similarity using spaCy

### Match Calculation Process
1. **Fetch User Skills:** Retrieve skills from user profile
2. **Fetch Job Requirements:** Extract required skills from job posting
3. **Calculate Similarity:** Use spaCy for semantic matching
4. **Weight Application:** Apply skill weights for final score
5. **Return Scored Results:** Jobs with match percentages and matched skills

### Frontend Display
- **`JobCard.tsx`:** Progress bar and badge display
- **`JobDetails.tsx`:** Detailed match breakdown
- **`use-jobs-filter.tsx`:** Filter jobs by match score

## Project Structure

### Recommended `src/` Directory Structure

```
src/
├── api/                # Centralized API service definitions
├── assets/             # Static assets (images, fonts, etc.)
├── components/         # Reusable UI components
│   ├── common/         # Shared components (Button, Input, Card, etc.)
│   ├── features/       # Feature-specific components
│   │   ├── auth/
│   │   ├── jobs/
│   │   └── profile/
│   └── layout/         # Layout components (Navbar, Footer, Sidebar)
├── config/             # Application configuration
├── hooks/              # Custom React hooks
├── lib/                # Third-party library configurations
├── pages/              # Page components mapped to routes
├── providers/          # Global application providers
├── routes/             # Routing configuration
├── services/           # Business logic and API communication
├── types/              # TypeScript type definitions
└── utils/              # Utility functions
```

## Development Workflow

### Running Both Frontend & Backend

1. **Terminal 1 - Frontend**:
   ```bash
   npm run dev
   ```

2. **Terminal 2 - Backend**:
   ```bash
   cd jobsportal
   uvicorn main:app --reload --port 8000
   ```

### Available Scripts

#### Frontend
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run test         # Run tests
npm run lint         # Run linting
```

#### Backend
```bash
cd jobsportal
uvicorn main:app --reload --port 8000    # Start development server
python -m pytest                         # Run tests
```

## Testing

### Test Accounts
**Admin Account**:
- Email: admin@visiondrill.com
- Password: admin123

**Employer Account**:
- Email: employer@visiondrill.com  
- Password: employer123

**Job Seeker Account**:
- Email: jobseeker@visiondrill.com
- Password: jobseeker123

### Frontend Testing
```bash
npm run test
npm run test:e2e
```

### Backend Testing
```bash
cd jobsportal
python -m pytest
```

### Integration Testing
```bash
npm run test:integration
```

## Deployment

### Production Environment Variables
```env
VITE_API_BASE_URL=https://your-api-domain.com/api/v1
VITE_BACKEND_URL=https://your-api-domain.com
```

### Build Commands
```bash
# Frontend
npm run build

# Backend
cd jobsportal
pip install -r requirements.txt
```

### Frontend (Netlify/Vercel)
```bash
npm run build
# Deploy the 'dist' folder
```

### Backend (Railway/Render/Heroku)
```bash
cd jobsportal
# Deploy using your preferred platform
```

## Troubleshooting

### Common Issues

1. **Frontend can't connect to backend**:
   - Ensure backend is running on port 8000
   - Check if `.env` file has correct API URLs

2. **Database connection errors**:
   - Verify Supabase credentials in `jobsportal/.env`
   - Check network connectivity

3. **Authentication not working**:
   - Clear browser localStorage
   - Restart both frontend and backend servers

### Logs & Debugging

- **Frontend**: Check browser console (F12)
- **Backend**: Check terminal output where uvicorn is running
- **API Requests**: Use Network tab in browser dev tools

### Performance Considerations

1. **API Response Caching**: Implemented in React Query
2. **Lazy Loading**: Components and routes loaded on demand
3. **Image Optimization**: Automatic image compression
4. **Bundle Splitting**: Code split by routes and features
5. **Service Worker**: Offline functionality and caching

### Security

1. **JWT Authentication**: Secure token-based auth
2. **Role-based Access**: Different permissions per user type
3. **Input Validation**: Both frontend and backend validation
4. **CORS Configuration**: Proper cross-origin settings
5. **Rate Limiting**: API rate limiting on backend

## Database

The application uses **Supabase (PostgreSQL)** with the following main tables:
- `profile` - User profiles and authentication
- `jobs_listing` - Job postings
- `applications` - Job applications
- `skills_listing` - Available skills
- `recommendations` - AI-generated recommendations

## Support

If you encounter any issues:
1. Check the troubleshooting section above
2. Review the terminal output for error messages
3. Ensure both frontend and backend servers are running
4. Verify database connectivity

---
