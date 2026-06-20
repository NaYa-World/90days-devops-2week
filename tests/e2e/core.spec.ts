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

    // Verify login success by checking for v2 Roadmap tab
    await expect(page.locator('.nav-tab', { hasText: 'v2 Roadmap' })).toBeVisible({ timeout: 15000 });

    // 3. Roadmap Interaction
    // Phase 1 (Weeks 1-2) is already expanded by default, but let's make sure the header is visible.
    const phase1Header = page.getByText('Weeks 1–2 — Your First Real Server').first();
    await expect(phase1Header).toBeVisible();

    // Expand Day 1
    const day1Header = page.locator('#day-0-0').getByText('Day 1', { exact: true });
    await day1Header.click();
    
    // Toggle the first task (🔴 SCENARIO: ...)
    const firstTask = page.locator('#day-0-0').getByText('🔴 SCENARIO:').first();
    await firstTask.click();
    
    // Assert XP and Done stats increment
    await expect(page.getByText('XP', { exact: true })).toBeVisible();
    await expect(page.getByText('~15', { exact: true })).toBeVisible();
    await expect(page.getByText('Done', { exact: true })).toBeVisible();

    // 4. Navigation & Views
    // Switch to Focus Mode
    await page.locator('.nav-tab', { hasText: 'Focus' }).click();
    await expect(page.getByRole('button', { name: 'Focus Today' })).toBeVisible();

    // Switch to Notes
    await page.locator('.nav-btn', { hasText: 'Notes' }).click();
    await expect(page.getByText('Trainer Beside You.').first()).toBeVisible();

    // Switch to Labs via Sidebar Drawer
    await page.locator('#ham-btn').click();
    await page.locator('.ham-item', { hasText: 'Labs' }).click();
    await expect(page.getByText('Daily DevOps Labs (Days 1–10)')).toBeVisible();

    // Switch back to v2 Roadmap
    await page.locator('.nav-tab', { hasText: 'v2 Roadmap' }).click();

    // 5. Settings Modal
    await page.locator('.nav-btn', { hasText: 'Settings' }).click();
    await expect(page.locator('div').filter({ hasText: /^⚙️ Settings & Profile$/ })).toBeVisible();
    
    // Close settings
    await page.getByRole('button', { name: 'Cancel' }).click();
    await expect(page.locator('div').filter({ hasText: /^⚙️ Settings & Profile$/ })).toBeHidden();
  });

});
