import { test, expect, devices } from '@playwright/test';

test.describe('Responsive Design Tests', () => {
  test('Mobile navigation works correctly', async ({ browser }) => {
    const context = await browser.newContext({
      ...devices['iPhone 12'],
    });
    const page = await context.newPage();
    
    await page.goto('/');
    
    // Check mobile menu button is visible
    await expect(page.locator('[data-testid="mobile-menu-button"]')).toBeVisible();
    
    // Click mobile menu
    await page.click('[data-testid="mobile-menu-button"]');
    
    // Check mobile menu is open
    await expect(page.locator('[data-testid="mobile-menu"]')).toBeVisible();
    
    // Check navigation links are visible in mobile menu
    await expect(page.locator('[data-testid="mobile-menu"] a:has-text("Jobs")')).toBeVisible();
    await expect(page.locator('[data-testid="mobile-menu"] a:has-text("About")')).toBeVisible();
    await expect(page.locator('[data-testid="mobile-menu"] a:has-text("Login")')).toBeVisible();
    
    await context.close();
  });

  test('Job cards display correctly on mobile', async ({ browser }) => {
    const context = await browser.newContext({
      ...devices['Pixel 5'],
    });
    const page = await context.newPage();
    
    await page.goto('/jobs');
    
    // Check job cards stack vertically on mobile
    const jobCards = page.locator('[data-testid="job-card"]');
    const firstCard = jobCards.first();
    const secondCard = jobCards.nth(1);
    
    const firstCardBox = await firstCard.boundingBox();
    const secondCardBox = await secondCard.boundingBox();
    
    // Verify cards are stacked vertically (second card's Y position is below first card)
    expect(secondCardBox?.y).toBeGreaterThan((firstCardBox?.y || 0) + (firstCardBox?.height || 0));
    
    await context.close();
  });

  test('Forms are usable on mobile', async ({ browser }) => {
    const context = await browser.newContext({
      ...devices['iPhone 12'],
    });
    const page = await context.newPage();
    
    await page.goto('/login');
    
    // Check form elements are visible and accessible
    await expect(page.locator('[name="email"]')).toBeVisible();
    await expect(page.locator('[name="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
    
    // Verify form fields are full width on mobile
    const emailField = await page.locator('[name="email"]').boundingBox();
    const formContainer = await page.locator('form').boundingBox();
    
    // Email field should be nearly as wide as the form (allowing for padding)
    expect(emailField?.width).toBeGreaterThan((formContainer?.width || 0) * 0.9);
    
    await context.close();
  });

  test('Dashboard adapts to tablet view', async ({ browser }) => {
    const context = await browser.newContext({
      ...devices['iPad'],
    });
    const page = await context.newPage();
    
    // Login first
    await page.goto('/login');
    await page.fill('[name="email"]', 'jobseeker@example.com');
    await page.fill('[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/jobseeker/dashboard');
    
    // Check dashboard layout on tablet
    const statsGrid = page.locator('[data-testid="stats-grid"]');
    await expect(statsGrid).toBeVisible();
    
    // On tablet, stats should be in 2 columns
    const statCards = page.locator('[data-testid^="stat-"]');
    const cardCount = await statCards.count();
    
    if (cardCount >= 2) {
      const firstCard = statCards.first();
      const secondCard = statCards.nth(1);
      
      const firstBox = await firstCard.boundingBox();
      const secondBox = await secondCard.boundingBox();
      
      // Cards should be side by side on tablet
      expect(Math.abs((firstBox?.y || 0) - (secondBox?.y || 0))).toBeLessThan(10);
    }
    
    await context.close();
  });

  test('Images are responsive', async ({ browser }) => {
    const mobileContext = await browser.newContext({
      ...devices['iPhone 12'],
    });
    const desktopContext = await browser.newContext({
      ...devices['Desktop Chrome'],
    });
    
    const mobilePage = await mobileContext.newPage();
    const desktopPage = await desktopContext.newPage();
    
    await mobilePage.goto('/');
    await desktopPage.goto('/');
    
    // Check hero image on both mobile and desktop
    const mobileHeroImage = mobilePage.locator('[data-testid="hero-image"]').first();
    const desktopHeroImage = desktopPage.locator('[data-testid="hero-image"]').first();
    
    const mobileImageBox = await mobileHeroImage.boundingBox();
    const desktopImageBox = await desktopHeroImage.boundingBox();
    
    // Mobile image should be smaller than desktop
    expect(mobileImageBox?.width).toBeLessThan(desktopImageBox?.width || 0);
    
    await mobileContext.close();
    await desktopContext.close();
  });

  test('Touch interactions work on mobile', async ({ browser }) => {
    const context = await browser.newContext({
      ...devices['iPhone 12'],
      hasTouch: true,
    });
    const page = await context.newPage();
    
    await page.goto('/jobs');
    
    // Test swipe/scroll
    await page.locator('body').evaluate(() => {
      window.scrollTo(0, 500);
    });
    
    // Verify scroll worked
    const scrollY = await page.evaluate(() => window.scrollY);
    expect(scrollY).toBeGreaterThan(0);
    
    // Test tap on job card
    await page.tap('[data-testid="job-card"]');
    
    // Should navigate to job details
    await expect(page).toHaveURL(/\/jobs\/\d+/);
    
    await context.close();
  });

  test('Text is readable on small screens', async ({ browser }) => {
    const context = await browser.newContext({
      ...devices['iPhone SE'],
    });
    const page = await context.newPage();
    
    await page.goto('/');
    
    // Check font sizes are appropriate for mobile
    const heading = page.locator('h1').first();
    const paragraph = page.locator('p').first();
    
    const headingFontSize = await heading.evaluate(el => 
      window.getComputedStyle(el).fontSize
    );
    const paragraphFontSize = await paragraph.evaluate(el => 
      window.getComputedStyle(el).fontSize
    );
    
    // Font sizes should be at least 14px for readability
    expect(parseInt(paragraphFontSize)).toBeGreaterThanOrEqual(14);
    expect(parseInt(headingFontSize)).toBeGreaterThan(parseInt(paragraphFontSize));
    
    await context.close();
  });

  test('Modal dialogs are responsive', async ({ browser }) => {
    const context = await browser.newContext({
      ...devices['iPhone 12'],
    });
    const page = await context.newPage();
    
    // Login and navigate to a page with modals
    await page.goto('/login');
    await page.fill('[name="email"]', 'employer@example.com');
    await page.fill('[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/employer/dashboard');
    
    await page.goto('/employer/jobs');
    
    // Trigger a modal (e.g., create job)
    await page.click('text=Post New Job');
    
    // Check modal is visible and properly sized
    const modal = page.locator('[role="dialog"]');
    await expect(modal).toBeVisible();
    
    const modalBox = await modal.boundingBox();
    const viewportSize = page.viewportSize();
    
    // Modal should not exceed viewport width
    expect(modalBox?.width).toBeLessThanOrEqual(viewportSize?.width || 0);
    
    // Modal should have some padding from viewport edges
    expect(modalBox?.x).toBeGreaterThan(0);
    
    await context.close();
  });
});
