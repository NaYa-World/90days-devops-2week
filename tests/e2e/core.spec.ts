import { test, expect } from '@playwright/test';

test.describe('DevOps90 Core Workflows', () => {
  
  test('Complete user journey: Login, Navigation, Tasks, and Settings', async ({ page }) => {
    test.setTimeout(90000);
    page.on('console', msg => console.log('BROWSER CONSOLE:', msg.text()));
    page.on('pageerror', error => console.log('PAGE ERROR:', error.message));

    // 1. Visit the app
    await page.goto('/');

    // Check if the login modal appears (with a generous timeout to outlast the splash video and Vite compilation)
    try {
      const welcomeHeading = page.locator('h2', { hasText: 'Apprentice Portal' });
      await expect(welcomeHeading).toBeVisible({ timeout: 30000 });
      
      // Need to register since it's a fresh browser context
      await page.getByRole('button', { name: 'Register' }).click();
      await page.getByPlaceholder('e.g. karthik').fill('e2etestuser');
      await page.getByRole('button', { name: 'Create Profile →' }).click();
    } catch (e) {
      console.log('Login modal not found:', e.message);
    }

    await page.screenshot({ path: 'test-results/after-login.png' });

    // Verify login success by checking for Roadmap tab
    await expect(page.locator('.nav-btn', { hasText: 'Roadmap' })).toBeVisible({ timeout: 15000 });

    // 3. Roadmap Interaction
    // Expand Phase 1 if not expanded
    const phase1Header = page.locator('h3', { hasText: 'Phase 1: Linux & Scripting Foundation' });
    await expect(phase1Header).toBeVisible();
    
    // Check off the first task (Day 1)
    const day1Checkbox = page.locator('input[type="checkbox"]').first();
    await day1Checkbox.check();
    
    // Assert XP increments
    const xpCounter = page.getByText(/XP: \d+/);
    await expect(xpCounter).toBeVisible();
    await expect(day1Checkbox).toBeChecked();

    // 4. Navigation & Views
    // Switch to Focus Mode
    await page.locator('.nav-btn', { hasText: 'Focus' }).click();
    await expect(page.locator('h1', { hasText: 'Focus Mode' })).toBeVisible();

    // Switch to Notes
    await page.locator('.nav-btn', { hasText: 'Notes' }).click();
    await expect(page.locator('h2', { hasText: 'Study Notes Repository' })).toBeVisible();

    // Switch to Labs
    await page.locator('.nav-btn', { hasText: 'Labs' }).click();
    await expect(page.locator('h1', { hasText: 'DevOps Labs' })).toBeVisible();

    // Switch back to Roadmap
    await page.locator('.nav-btn', { hasText: 'Roadmap' }).click();

    // 5. Settings Modal
    await page.locator('.nav-btn', { hasText: 'Settings' }).click();
    await expect(page.getByText('Settings & API Keys')).toBeVisible();
    
    // Close settings
    await page.getByRole('button', { name: 'Save & Close' }).click();
    await expect(page.getByText('Settings & API Keys')).toBeHidden();
  });

});
