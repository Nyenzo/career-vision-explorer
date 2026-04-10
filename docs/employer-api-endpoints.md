# Employer Dashboard API Endpoints

This document outlines the correct API endpoints for the employer dashboard based on the backend OpenAPI specification.

## Authentication

All employer endpoints require authentication with a valid JWT token in the Authorization header:
```
Authorization: Bearer <access_token>
```

## Employer-Specific Endpoints

### 1. Get My Jobs
- **Endpoint**: `GET /api/v1/jobs/my-jobs`
- **Description**: Get all jobs posted by the current employer
- **Query Parameters**:
  - `include_inactive` (boolean, optional): Include deactivated jobs (default: false)
- **Response**: Array of Job objects
- **Example**:
  ```javascript
  // Get active jobs only
  fetch('/api/v1/jobs/my-jobs', {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });

  // Get all jobs including inactive
  fetch('/api/v1/jobs/my-jobs?include_inactive=true', {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  ```

### 2. Get My Job Statistics
- **Endpoint**: `GET /api/v1/jobs/my-stats`
- **Description**: Get job statistics for the current employer
- **Response**:
  ```json
  {
    "total_jobs": 10,
    "active_jobs": 7,
    "total_applications": 45,
    "companies_count": 1,
    "locations_count": 3,
    "avg_applications_per_job": 4.5
  }
  ```

### 3. Get Applications for My Jobs
- **Endpoint**: `GET /api/v1/applications/`
- **Description**: For employers, returns applications for their job postings
- **Query Parameters**:
  - `status_filter` (string, optional): Filter by status (Pending|Reviewed|Accepted|Rejected)
  - `job_id` (string, optional): Filter by specific job
  - `page` (integer, optional): Page number (default: 1)
  - `limit` (integer, optional): Results per page (default: 20, max: 100)
- **Response**: Paginated response with applications array
- **Note**: The backend automatically filters based on the authenticated user's role

### 4. Get Applications for Specific Job
- **Endpoint**: `GET /api/v1/applications/job/{job_id}`
- **Description**: Get all applications for a specific job (employers can only see applications for their own jobs)
- **Path Parameters**:
  - `job_id` (string, required): The job ID
- **Query Parameters**:
  - `status_filter` (string, optional): Filter by status
- **Response**: Array of Application objects

### 5. Review Application
- **Endpoint**: `POST /api/v1/applications/{application_id}/review`
- **Description**: Review and update application status
- **Path Parameters**:
  - `application_id` (string, required): The application ID
- **Query Parameters**:
  - `status` (string, required): New status (Reviewed|Accepted|Rejected)
  - `notes` (string, optional): Review notes (max 1000 chars)
- **Example**:
  ```javascript
  fetch(`/api/v1/applications/${applicationId}/review?status=Reviewed&notes=Good candidate`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  ```

### 6. Get Employer Dashboard Data
- **Endpoint**: `GET /api/v1/jobs/employer/dashboard`
- **Description**: Get comprehensive dashboard data for employer
- **Response**: String (HTML or structured data)

## Job Management Endpoints

### Create Job
- **Endpoint**: `POST /api/v1/jobs/`
- **Description**: Create a new job listing
- **Request Body**: JobCreate object

### Update Job
- **Endpoint**: `PUT /api/v1/jobs/{job_id}`
- **Description**: Update job listing (only by the employer who posted it)

### Delete Job (Soft Delete)
- **Endpoint**: `DELETE /api/v1/jobs/{job_id}`
- **Description**: Soft delete - sets is_active to false

### Activate Job
- **Endpoint**: `POST /api/v1/jobs/{job_id}/activate`
- **Description**: Reactivate a deactivated job

### Deactivate Job
- **Endpoint**: `POST /api/v1/jobs/{job_id}/deactivate`
- **Description**: Deactivate an active job

## Error Handling

The API returns standard HTTP status codes:
- `200`: Success
- `201`: Created
- `400`: Bad Request
- `401`: Unauthorized (invalid or expired token)
- `403`: Forbidden (insufficient permissions)
- `404`: Not Found
- `422`: Validation Error
- `500`: Internal Server Error

Error responses include a detail message:
```json
{
  "detail": "Error message here"
}
```

## Frontend Service Integration

The frontend services have been updated to use these correct endpoints:

```typescript
// jobs.service.ts
async getMyJobs(includeInactive = false): Promise<Job[]> {
  const endpoint = includeInactive ? `/jobs/my-jobs?include_inactive=true` : '/jobs/my-jobs';
  return await apiClient.get<Job[]>(endpoint);
}

async getMyJobStats(): Promise<JobStats> {
  return await apiClient.get('/jobs/my-stats');
}

// applications.service.ts
async getEmployerApplications(): Promise<Application[]> {
  const response = await apiClient.get<PaginatedResponse<Application>>('/applications/');
  return response.applications || [];
}
```

## Testing Endpoints

Use the provided test script (`test-employer-endpoints.js`) to verify the endpoints are working correctly. Run it in the browser console when logged in as an employer.

## Fallback Strategy

The frontend implements a fallback strategy using mock data when API calls fail:
- Network errors trigger mock data usage
- 404 errors trigger mock data usage
- Users see a notification that demo data is being used
- The UI remains functional even when the backend is unavailable
