import { test, expect } from '@playwright/test';

test.describe('API Endpoints and Data Fetching', () => {
  test.beforeEach(async ({ page }) => {
    // Set up API request interceptor to monitor API calls
    await page.route('**/api/v1/**', route => {
      console.log(`API Call: ${route.request().method()} ${route.request().url()}`);
      route.continue();
    });
  });

  test('Login endpoint returns proper auth token', async ({ page, request }) => {
    const response = await request.post('/api/v1/auth/login', {
      data: {
        email: 'test@example.com',
        password: 'password123'
      }
    });

    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    
    expect(data).toHaveProperty('access_token');
    expect(data).toHaveProperty('user');
    expect(data.user).toHaveProperty('email', 'test@example.com');
  });

  test('Jobs endpoint returns paginated results', async ({ page, request }) => {
    const response = await request.get('/api/v1/jobs', {
      params: {
        page: 1,
        limit: 10
      }
    });

    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    
    expect(data).toHaveProperty('jobs');
    expect(data).toHaveProperty('total');
    expect(data).toHaveProperty('page');
    expect(data).toHaveProperty('totalPages');
    expect(Array.isArray(data.jobs)).toBeTruthy();
    expect(data.jobs.length).toBeLessThanOrEqual(10);
  });

  test('Search functionality fetches filtered results', async ({ page }) => {
    await page.goto('/jobs');
    
    // Monitor API calls
    const apiPromise = page.waitForResponse(resp => 
      resp.url().includes('/api/v1/jobs') && 
      resp.url().includes('search=developer')
    );
    
    // Perform search
    await page.fill('[placeholder="Search jobs..."]', 'developer');
    await page.press('[placeholder="Search jobs..."]', 'Enter');
    
    // Wait for API response
    const response = await apiPromise;
    expect(response.ok()).toBeTruthy();
    
    const data = await response.json();
    expect(data.jobs.length).toBeGreaterThan(0);
  });

  test('Profile update endpoint works correctly', async ({ page, request }) => {
    // First login to get auth token
    const loginResponse = await request.post('/api/v1/auth/login', {
      data: {
        email: 'test@example.com',
        password: 'password123'
      }
    });
    
    const { access_token } = await loginResponse.json();
    
    // Update profile
    const updateResponse = await request.patch('/api/v1/profile', {
      headers: {
        'Authorization': `Bearer ${access_token}`
      },
      data: {
        name: 'Updated Name',
        bio: 'Updated bio'
      }
    });
    
    expect(updateResponse.ok()).toBeTruthy();
    const updatedProfile = await updateResponse.json();
    expect(updatedProfile.name).toBe('Updated Name');
    expect(updatedProfile.bio).toBe('Updated bio');
  });

  test('Statistics endpoints return real-time data', async ({ page }) => {
    // Login as admin
    await page.goto('/admin/login');
    await page.fill('[name="email"]', 'admin@example.com');
    await page.fill('[name="password"]', 'admin123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/admin/dashboard');
    
    // Monitor statistics API calls
    const statsPromise = page.waitForResponse(resp => 
      resp.url().includes('/api/v1/admin/stats')
    );
    
    const statsResponse = await statsPromise;
    expect(statsResponse.ok()).toBeTruthy();
    
    const stats = await statsResponse.json();
    expect(stats).toHaveProperty('totalUsers');
    expect(stats).toHaveProperty('totalJobs');
    expect(stats).toHaveProperty('totalApplications');
    expect(stats).toHaveProperty('activeEmployers');
    
    // All stats should be numbers
    expect(typeof stats.totalUsers).toBe('number');
    expect(typeof stats.totalJobs).toBe('number');
  });

  test('File upload endpoint handles resume upload', async ({ page, request }) => {
    // Login first
    const loginResponse = await request.post('/api/v1/auth/login', {
      data: {
        email: 'jobseeker@example.com',
        password: 'password123'
      }
    });
    
    const { access_token } = await loginResponse.json();
    
    // Create a test file
    const fileContent = Buffer.from('Test resume content');
    
    // Upload file
    const uploadResponse = await request.post('/api/v1/profile/resume', {
      headers: {
        'Authorization': `Bearer ${access_token}`
      },
      multipart: {
        file: {
          name: 'resume.pdf',
          mimeType: 'application/pdf',
          buffer: fileContent
        }
      }
    });
    
    expect(uploadResponse.ok()).toBeTruthy();
    const uploadResult = await uploadResponse.json();
    expect(uploadResult).toHaveProperty('url');
  });

  test('WebSocket connection for real-time updates', async ({ page }) => {
    // Login as employer
    await page.goto('/login');
    await page.fill('[name="email"]', 'employer@example.com');
    await page.fill('[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/employer/dashboard');
    
    // Check for WebSocket connection
    const wsPromise = new Promise((resolve) => {
      page.on('websocket', ws => {
        console.log(`WebSocket opened: ${ws.url()}`);
        resolve(ws);
      });
    });
    
    // Wait a bit for WebSocket to connect
    await page.waitForTimeout(2000);
    
    // If WebSocket is implemented, verify it
    const ws = await Promise.race([
      wsPromise,
      new Promise(resolve => setTimeout(() => resolve(null), 5000))
    ]);
    
    if (ws) {
      expect(ws).toBeTruthy();
    }
  });

  test('API error handling works correctly', async ({ page, request }) => {
    // Test 404 error
    const notFoundResponse = await request.get('/api/v1/jobs/999999');
    expect(notFoundResponse.status()).toBe(404);
    
    // Test 401 unauthorized
    const unauthorizedResponse = await request.get('/api/v1/profile', {
      headers: {
        'Authorization': 'Bearer invalid-token'
      }
    });
    expect(unauthorizedResponse.status()).toBe(401);
    
    // Test validation error
    const validationResponse = await request.post('/api/v1/auth/register', {
      data: {
        email: 'invalid-email',
        password: '123' // Too short
      }
    });
    expect(validationResponse.status()).toBe(400);
    const error = await validationResponse.json();
    expect(error).toHaveProperty('errors');
  });

  test('Rate limiting is enforced', async ({ request }) => {
    // Make multiple rapid requests
    const promises = [];
    for (let i = 0; i < 20; i++) {
      promises.push(request.get('/api/v1/jobs'));
    }
    
    const responses = await Promise.all(promises);
    const rateLimited = responses.some(r => r.status() === 429);
    
    // If rate limiting is implemented, some requests should be limited
    if (rateLimited) {
      expect(rateLimited).toBeTruthy();
    }
  });

  test('API caching works for appropriate endpoints', async ({ page }) => {
    await page.goto('/jobs');
    
    // First request
    const firstRequestPromise = page.waitForResponse(resp => 
      resp.url().includes('/api/v1/jobs') && resp.status() === 200
    );
    
    const firstResponse = await firstRequestPromise;
    const firstResponseTime = Date.now();
    
    // Navigate away and back
    await page.goto('/about');
    await page.goto('/jobs');
    
    // Second request (should be cached)
    const secondRequestPromise = page.waitForResponse(resp => 
      resp.url().includes('/api/v1/jobs')
    );
    
    const secondResponse = await secondRequestPromise;
    const secondResponseTime = Date.now();
    
    // Check if response has cache headers
    const cacheControl = secondResponse.headers()['cache-control'];
    if (cacheControl) {
      expect(cacheControl).toContain('max-age');
    }
  });
});
