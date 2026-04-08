import { test, expect } from '@playwright/test';

test.describe('Dashboard Statistics and Real-time Updates', () => {
  test('Admin dashboard shows correct statistics', async ({ page }) => {
    // Login as admin
    await page.goto('/admin/login');
    await page.fill('[name="email"]', 'admin@example.com');
    await page.fill('[name="password"]', 'admin123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/admin/dashboard');

    // Check statistics cards are visible
    await expect(page.locator('[data-testid="stat-total-users"]')).toBeVisible();
    await expect(page.locator('[data-testid="stat-total-jobs"]')).toBeVisible();
    await expect(page.locator('[data-testid="stat-total-applications"]')).toBeVisible();
    await expect(page.locator('[data-testid="stat-active-employers"]')).toBeVisible();

    // Verify statistics have numeric values
    const totalUsers = await page.locator('[data-testid="stat-total-users"]').textContent();
    expect(totalUsers).toMatch(/\d+/);

    // Check recent activity section
    await expect(page.locator('[data-testid="recent-activity"]')).toBeVisible();
    await expect(page.locator('[data-testid="activity-item"]')).toHaveCount({ minimum: 1 });

    // Check charts are rendered
    await expect(page.locator('[data-testid="user-growth-chart"]')).toBeVisible();
    await expect(page.locator('[data-testid="job-posting-trends"]')).toBeVisible();
  });

  test('Employer dashboard displays job statistics', async ({ page }) => {
    // Login as employer
    await page.goto('/login');
    await page.fill('[name="email"]', 'employer@example.com');
    await page.fill('[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/employer/dashboard');

    // Check employer-specific statistics
    await expect(page.locator('[data-testid="stat-active-jobs"]')).toBeVisible();
    await expect(page.locator('[data-testid="stat-total-applications"]')).toBeVisible();
    await expect(page.locator('[data-testid="stat-interviews-scheduled"]')).toBeVisible();
    await expect(page.locator('[data-testid="stat-positions-filled"]')).toBeVisible();

    // Check recent applications section
    await expect(page.locator('[data-testid="recent-applications"]')).toBeVisible();

    // Check job performance metrics
    await expect(page.locator('[data-testid="job-performance-table"]')).toBeVisible();
  });

  test('Job seeker dashboard shows personalized metrics', async ({ page }) => {
    // Login as job seeker
    await page.goto('/login');
    await page.fill('[name="email"]', 'jobseeker@example.com');
    await page.fill('[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/jobseeker/dashboard');

    // Check job seeker statistics
    await expect(page.locator('[data-testid="stat-applications-sent"]')).toBeVisible();
    await expect(page.locator('[data-testid="stat-interviews-scheduled"]')).toBeVisible();
    await expect(page.locator('[data-testid="stat-profile-views"]')).toBeVisible();
    await expect(page.locator('[data-testid="stat-skill-matches"]')).toBeVisible();

    // Check recommended jobs section
    await expect(page.locator('[data-testid="recommended-jobs"]')).toBeVisible();
    await expect(page.locator('[data-testid="job-recommendation"]')).toHaveCount({ minimum: 1 });

    // Check application status tracker
    await expect(page.locator('[data-testid="application-tracker"]')).toBeVisible();
  });

  test('Real-time updates work correctly', async ({ page, context }) => {
    // Login as employer
    await page.goto('/login');
    await page.fill('[name="email"]', 'employer@example.com');
    await page.fill('[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/employer/dashboard');

    // Get initial application count
    const initialCount = await page.locator('[data-testid="stat-total-applications"]').textContent();
    const initialNumber = parseInt(initialCount?.match(/\d+/)?.[0] || '0');

    // Open new browser context to simulate another user
    const page2 = await context.newPage();
    
    // Login as job seeker in second tab
    await page2.goto('/login');
    await page2.fill('[name="email"]', 'jobseeker@example.com');
    await page2.fill('[name="password"]', 'password123');
    await page2.click('button[type="submit"]');
    
    // Apply to a job
    await page2.goto('/jobs');
    await page2.locator('[data-testid="job-card"]').first().click();
    await page2.click('button:has-text("Apply Now")');
    await page2.fill('[name="coverLetter"]', 'Test application for real-time update');
    await page2.click('button[type="submit"]');

    // Wait for real-time update in employer dashboard
    await page.waitForTimeout(2000); // Wait for WebSocket update

    // Check if application count increased
    const updatedCount = await page.locator('[data-testid="stat-total-applications"]').textContent();
    const updatedNumber = parseInt(updatedCount?.match(/\d+/)?.[0] || '0');
    
    expect(updatedNumber).toBeGreaterThan(initialNumber);

    // Check if recent applications list updated
    await expect(page.locator('[data-testid="recent-applications"]').locator('text=Test application for real-time update')).toBeVisible();

    await page2.close();
  });

  test('Dashboard charts render and update correctly', async ({ page }) => {
    // Login as admin
    await page.goto('/admin/login');
    await page.fill('[name="email"]', 'admin@example.com');
    await page.fill('[name="password"]', 'admin123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/admin/dashboard');

    // Check if charts are rendered
    const userGrowthChart = page.locator('[data-testid="user-growth-chart"]');
    await expect(userGrowthChart).toBeVisible();

    // Check if chart has SVG elements (indicates it's rendered)
    await expect(userGrowthChart.locator('svg')).toBeVisible();
    await expect(userGrowthChart.locator('path')).toHaveCount({ minimum: 1 });

    // Change date range filter
    await page.selectOption('[data-testid="date-range-filter"]', '7days');
    
    // Wait for chart update
    await page.waitForTimeout(1000);
    
    // Verify chart still visible after update
    await expect(userGrowthChart).toBeVisible();
  });

  test('Dashboard notifications work correctly', async ({ page }) => {
    // Login as job seeker
    await page.goto('/login');
    await page.fill('[name="email"]', 'jobseeker@example.com');
    await page.fill('[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/jobseeker/dashboard');

    // Check notification bell
    await expect(page.locator('[data-testid="notification-bell"]')).toBeVisible();
    
    // Click notification bell
    await page.click('[data-testid="notification-bell"]');
    
    // Check notification dropdown
    await expect(page.locator('[data-testid="notification-dropdown"]')).toBeVisible();
    
    // Check if notifications are listed
    await expect(page.locator('[data-testid="notification-item"]')).toHaveCount({ minimum: 0 });
  });
});
