import { test, expect } from '@playwright/test';

test.describe('Job Listings CRUD Operations', () => {
  test.beforeEach(async ({ page }) => {
    // Login as employer
    await page.goto('/login');
    await page.fill('[name="email"]', 'employer@example.com');
    await page.fill('[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/employer/dashboard');
  });

  test('Employer can create a new job listing', async ({ page }) => {
    // Navigate to jobs page
    await page.click('text=Jobs');
    await page.waitForURL('/employer/jobs');
    
    // Click create new job
    await page.click('text=Post New Job');
    
    // Fill job details
    await page.fill('[name="title"]', 'Senior Software Engineer');
    await page.fill('[name="company"]', 'Test Company');
    await page.fill('[name="location"]', 'Remote');
    await page.selectOption('[name="type"]', 'full-time');
    await page.fill('[name="salary_min"]', '100000');
    await page.fill('[name="salary_max"]', '150000');
    
    // Fill description using rich text editor
    await page.fill('[data-testid="job-description"]', 'We are looking for a talented Senior Software Engineer...');
    
    // Add requirements
    await page.fill('[data-testid="job-requirements"]', '- 5+ years of experience\n- Strong JavaScript skills\n- React expertise');
    
    // Add skills
    await page.click('[data-testid="add-skill"]');
    await page.fill('[placeholder="Add skill"]', 'JavaScript');
    await page.press('[placeholder="Add skill"]', 'Enter');
    await page.fill('[placeholder="Add skill"]', 'React');
    await page.press('[placeholder="Add skill"]', 'Enter');
    
    // Submit form
    await page.click('button:has-text("Create Job")');
    
    // Verify success message
    await expect(page.locator('text=Job created successfully')).toBeVisible();
    
    // Verify job appears in list
    await expect(page.locator('text=Senior Software Engineer')).toBeVisible();
  });

  test('Employer can view job listings', async ({ page }) => {
    await page.goto('/employer/jobs');
    
    // Check if job listings are displayed
    await expect(page.locator('[data-testid="job-card"]')).toHaveCount({ minimum: 1 });
    
    // Check job card contains necessary information
    const jobCard = page.locator('[data-testid="job-card"]').first();
    await expect(jobCard.locator('[data-testid="job-title"]')).toBeVisible();
    await expect(jobCard.locator('[data-testid="job-location"]')).toBeVisible();
    await expect(jobCard.locator('[data-testid="job-type"]')).toBeVisible();
    await expect(jobCard.locator('[data-testid="job-posted-date"]')).toBeVisible();
  });

  test('Employer can update job listing', async ({ page }) => {
    await page.goto('/employer/jobs');
    
    // Click edit on first job
    await page.locator('[data-testid="job-card"]').first().locator('button:has-text("Edit")').click();
    
    // Update job details
    await page.fill('[name="title"]', 'Updated Senior Software Engineer');
    await page.fill('[name="salary_max"]', '180000');
    
    // Save changes
    await page.click('button:has-text("Save Changes")');
    
    // Verify success message
    await expect(page.locator('text=Job updated successfully')).toBeVisible();
    
    // Verify updated title appears
    await expect(page.locator('text=Updated Senior Software Engineer')).toBeVisible();
  });

  test('Employer can delete job listing', async ({ page }) => {
    await page.goto('/employer/jobs');
    
    // Get initial job count
    const initialCount = await page.locator('[data-testid="job-card"]').count();
    
    // Click delete on first job
    await page.locator('[data-testid="job-card"]').first().locator('button:has-text("Delete")').click();
    
    // Confirm deletion
    await page.click('button:has-text("Confirm Delete")');
    
    // Verify success message
    await expect(page.locator('text=Job deleted successfully')).toBeVisible();
    
    // Verify job count decreased
    await expect(page.locator('[data-testid="job-card"]')).toHaveCount(initialCount - 1);
  });

  test('Job seeker can search and filter jobs', async ({ page }) => {
    // Logout and login as job seeker
    await page.click('button[aria-label="User menu"]');
    await page.click('text=Logout');
    
    await page.goto('/login');
    await page.fill('[name="email"]', 'jobseeker@example.com');
    await page.fill('[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    
    // Navigate to jobs page
    await page.goto('/jobs');
    
    // Search for jobs
    await page.fill('[placeholder="Search jobs..."]', 'Software Engineer');
    await page.press('[placeholder="Search jobs..."]', 'Enter');
    
    // Verify search results
    await expect(page.locator('[data-testid="job-card"]')).toHaveCount({ minimum: 1 });
    await expect(page.locator('text=Software Engineer')).toBeVisible();
    
    // Apply filters
    await page.click('button:has-text("Filters")');
    await page.selectOption('[name="job_type"]', 'full-time');
    await page.selectOption('[name="experience_level"]', 'senior');
    await page.fill('[name="min_salary"]', '100000');
    await page.click('button:has-text("Apply Filters")');
    
    // Verify filtered results
    await expect(page.locator('[data-testid="job-type"]:has-text("Full Time")')).toBeVisible();
  });

  test('Job seeker can view job details', async ({ page }) => {
    // Login as job seeker
    await page.goto('/login');
    await page.fill('[name="email"]', 'jobseeker@example.com');
    await page.fill('[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    
    await page.goto('/jobs');
    
    // Click on first job
    await page.locator('[data-testid="job-card"]').first().click();
    
    // Verify job details page
    await expect(page).toHaveURL(/\/jobs\/\d+/);
    
    // Check all job details are displayed
    await expect(page.locator('h1[data-testid="job-title"]')).toBeVisible();
    await expect(page.locator('[data-testid="job-company"]')).toBeVisible();
    await expect(page.locator('[data-testid="job-location"]')).toBeVisible();
    await expect(page.locator('[data-testid="job-salary"]')).toBeVisible();
    await expect(page.locator('[data-testid="job-description"]')).toBeVisible();
    await expect(page.locator('[data-testid="job-requirements"]')).toBeVisible();
    
    // Check apply button is visible
    await expect(page.locator('button:has-text("Apply Now")')).toBeVisible();
  });

  test('Pagination works correctly', async ({ page }) => {
    await page.goto('/jobs');
    
    // Check if pagination exists when there are many jobs
    const jobCount = await page.locator('[data-testid="job-card"]').count();
    
    if (jobCount >= 10) {
      // Check pagination controls
      await expect(page.locator('[data-testid="pagination"]')).toBeVisible();
      
      // Go to next page
      await page.click('button[aria-label="Next page"]');
      
      // Verify URL updated with page parameter
      await expect(page).toHaveURL(/[?&]page=2/);
      
      // Verify different jobs are shown
      const firstJobTitle = await page.locator('[data-testid="job-title"]').first().textContent();
      
      // Go back to first page
      await page.click('button[aria-label="Previous page"]');
      
      const newFirstJobTitle = await page.locator('[data-testid="job-title"]').first().textContent();
      expect(firstJobTitle).not.toBe(newFirstJobTitle);
    }
  });
});
