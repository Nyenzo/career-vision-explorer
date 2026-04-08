import { test, expect } from '@playwright/test';

test.describe('Application Management Features', () => {
  test.beforeEach(async ({ page }) => {
    // Login as job seeker
    await page.goto('/login');
    await page.fill('[name="email"]', 'jobseeker@example.com');
    await page.fill('[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/jobseeker/dashboard');
  });

  test('Job seeker can submit a job application', async ({ page }) => {
    // Navigate to jobs page
    await page.click('text=Find Jobs');
    await page.waitForURL('/jobs');

    // Click on a job card
    await page.locator('[data-testid="job-card"]').first().click();

    // Verify job details page
    await expect(page).toHaveURL(/\/jobs\/\d+/);

    // Check apply button is visible and click
    await expect(page.locator('button:has-text("Apply Now")')).toBeVisible();
    await page.click('button:has-text("Apply Now")');

    // Fill application form
    await page.fill('[name="coverLetter"]', 'I am very interested in this position because...');
    await page.setInputFiles('[name="resume"]', 'path/to/resume.pdf');

    // Submit application
    await page.click('button[type="submit"]');
    
    // Verify success message
    await expect(page.locator('text=Application submitted successfully')).toBeVisible();
  });

  test('Employer can view applications for a job', async ({ page }) => {
    // Logout and login as employer
    await page.click('button[aria-label="User menu"]');
    await page.click('text=Logout');

    await page.goto('/login');
    await page.fill('[name="email"]', 'employer@example.com');
    await page.fill('[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/employer/dashboard');

    // Navigate to jobs page
    await page.click('text=Jobs');
    await page.waitForURL('/employer/jobs');

    // Click on job card
    await page.locator('[data-testid="job-card"]').first().click();

    // Verify list of applications
    await expect(page.locator('[data-testid="application-card"]')).toHaveCount({ minimum: 1 });
  });

  test('Employer can review and update application status', async ({ page }) => {
    await page.goto('/employer/jobs');

    // Click on job card
    await page.locator('[data-testid="job-card"]').first().click();

    // Click on an application
    await page.locator('[data-testid="application-card"]').first().click();

    // Verify application details
    await expect(page.locator('text=Application Details')).toBeVisible();

    // Update application status
    await page.selectOption('[name="status"]', 'Accepted');
    await page.click('button:has-text("Save Changes")');

    // Verify success message
    await expect(page.locator('text=Application status updated')).toBeVisible();
  });
});

