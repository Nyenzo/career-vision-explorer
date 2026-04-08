import { test, expect } from '@playwright/test';

test.describe('Authentication Flows', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('User can sign up as job seeker', async ({ page }) => {
    // Navigate to signup
    await page.click('text=Get Started');
    await page.waitForURL('/signup');

    // Fill signup form
    await page.fill('[name="name"]', 'Test User');
    await page.fill('[name="email"]', `test${Date.now()}@example.com`);
    await page.fill('[name="password"]', 'TestPassword123!');
    await page.fill('[name="confirmPassword"]', 'TestPassword123!');
    
    // Select role
    await page.click('label:has-text("Job Seeker")');
    
    // Submit form
    await page.click('button[type="submit"]');
    
    // Verify redirect to dashboard
    await expect(page).toHaveURL(/\/jobseeker\/dashboard/);
    
    // Verify user name is displayed
    await expect(page.locator('text=Test User')).toBeVisible();
  });

  test('User can sign up as employer', async ({ page }) => {
    await page.click('text=Get Started');
    await page.waitForURL('/signup');

    await page.fill('[name="name"]', 'Test Company');
    await page.fill('[name="email"]', `employer${Date.now()}@example.com`);
    await page.fill('[name="password"]', 'TestPassword123!');
    await page.fill('[name="confirmPassword"]', 'TestPassword123!');
    
    await page.click('label:has-text("Employer")');
    
    await page.click('button[type="submit"]');
    
    await expect(page).toHaveURL(/\/employer\/dashboard/);
  });

  test('User can login with valid credentials', async ({ page }) => {
    await page.click('text=Login');
    await page.waitForURL('/login');

    await page.fill('[name="email"]', 'test@example.com');
    await page.fill('[name="password"]', 'password123');
    
    await page.click('button[type="submit"]');
    
    // Should redirect to appropriate dashboard based on role
    await expect(page).toHaveURL(/\/(jobseeker|employer|admin)\/dashboard/);
  });

  test('Invalid login shows error message', async ({ page }) => {
    await page.goto('/login');

    await page.fill('[name="email"]', 'invalid@example.com');
    await page.fill('[name="password"]', 'wrongpassword');
    
    await page.click('button[type="submit"]');
    
    // Check for error message
    await expect(page.locator('text=Invalid credentials')).toBeVisible();
  });

  test('User can logout', async ({ page, context }) => {
    // First login
    await page.goto('/login');
    await page.fill('[name="email"]', 'test@example.com');
    await page.fill('[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    
    await page.waitForURL(/\/dashboard/);
    
    // Find and click logout button
    await page.click('button[aria-label="User menu"]');
    await page.click('text=Logout');
    
    // Should redirect to home
    await expect(page).toHaveURL('/');
    
    // Try to access protected route
    await page.goto('/dashboard');
    // Should redirect to login
    await expect(page).toHaveURL('/login');
  });

  test('Protected routes redirect to login when not authenticated', async ({ page }) => {
    const protectedRoutes = [
      '/dashboard',
      '/profile',
      '/jobseeker/dashboard',
      '/employer/dashboard',
      '/admin/dashboard'
    ];

    for (const route of protectedRoutes) {
      await page.goto(route);
      await expect(page).toHaveURL('/login');
    }
  });

  test('Role-based access control works correctly', async ({ page }) => {
    // Login as job seeker
    await page.goto('/login');
    await page.fill('[name="email"]', 'jobseeker@example.com');
    await page.fill('[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    
    await page.waitForURL('/jobseeker/dashboard');
    
    // Try to access employer dashboard
    await page.goto('/employer/dashboard');
    // Should redirect or show access denied
    await expect(page).not.toHaveURL('/employer/dashboard');
    
    // Try to access admin dashboard
    await page.goto('/admin/dashboard');
    await expect(page).not.toHaveURL('/admin/dashboard');
  });

  test('Remember me functionality works', async ({ page, context }) => {
    await page.goto('/login');
    
    await page.fill('[name="email"]', 'test@example.com');
    await page.fill('[name="password"]', 'password123');
    await page.check('[name="rememberMe"]');
    
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/dashboard/);
    
    // Get cookies
    const cookies = await context.cookies();
    const authCookie = cookies.find(c => c.name === 'auth-token' || c.name === 'session');
    
    // Check if cookie has extended expiry
    expect(authCookie).toBeDefined();
    expect(authCookie?.expires).toBeGreaterThan(Date.now() / 1000 + 24 * 60 * 60); // More than 24 hours
  });
});
