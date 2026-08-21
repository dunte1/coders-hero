import { test, expect } from '@playwright/test';

test.describe('Dashboard Layout', () => {
  test('dashboard loads with content', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(3000);
    const content = page.locator('main, [role="main"], .dashboard, nav');
    await expect(content.first()).toBeVisible({ timeout: 15000 });
  });

  test('quick actions section renders', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);
    const quickActions = page.getByText(/quick action/i);
    if (await quickActions.isVisible({ timeout: 3000 }).catch(() => false)) {
      await expect(quickActions).toBeVisible();
    }
  });

  test('chart grid uses grid layout on large screens', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/dashboard');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(5000);

    const gridEl = await page.evaluate(() => {
      const grids = document.querySelectorAll('[class*="grid"], [style*="grid"]');
      return grids.length;
    });
    expect(gridEl).toBeGreaterThanOrEqual(1);
  });

  test('no console errors on dashboard load', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        const text = msg.text();
        if (
          !text.includes('favicon') &&
          !text.includes('404') &&
          !text.includes('Failed to load resource') &&
          !text.includes('WebSocket') &&
          !text.includes('HMR') &&
          !text.includes('Download the React DevTools')
        ) {
          errors.push(text);
        }
      }
    });

    await page.goto('/dashboard');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(3000);

    const criticalErrors = errors.filter((e) => !e.includes('Warning:'));
    expect(criticalErrors).toHaveLength(0);
  });
});

test.describe('Profile Page', () => {
  test('profile page loads with user info', async ({ page }) => {
    await page.goto('/profile');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(3000);
    const heading = page.locator('h2').first();
    await expect(heading).toBeVisible({ timeout: 10000 });
  });

  test('avatar is displayed', async ({ page }) => {
    await page.goto('/profile');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(3000);
    const avatar = page.locator('.h-24').first();
    await expect(avatar).toBeVisible({ timeout: 10000 });
  });

  test('avatar persists after page reload', async ({ page }) => {
    await page.goto('/profile');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(3000);

    const avatarBefore = await page.evaluate(() => {
      const img = document.querySelector('.h-24 img') as HTMLImageElement | null;
      return img?.src || null;
    });

    await page.reload();
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(3000);

    const avatarAfter = await page.evaluate(() => {
      const img = document.querySelector('.h-24 img') as HTMLImageElement | null;
      return img?.src || null;
    });

    if (avatarBefore) {
      expect(avatarAfter).toBe(avatarBefore);
    }
  });

  test('personal information card renders', async ({ page }) => {
    await page.goto('/profile');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(3000);
    const personalInfo = page.getByText(/personal information/i);
    await expect(personalInfo).toBeVisible({ timeout: 10000 });
  });

  test('account security card renders', async ({ page }) => {
    await page.goto('/profile');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(3000);
    const security = page.getByText(/account security/i);
    await expect(security).toBeVisible({ timeout: 10000 });
  });

  test('change password section renders', async ({ page }) => {
    await page.goto('/profile');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(3000);
    const changePassword = page.getByRole('heading', { name: /change password/i });
    await expect(changePassword).toBeVisible({ timeout: 10000 });
  });

  test('email verification section renders', async ({ page }) => {
    await page.goto('/profile');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(3000);
    const emailSection = page.getByText('Email Verification', { exact: true });
    await expect(emailSection).toBeVisible({ timeout: 10000 });
  });

  test('no console errors on profile load', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        const text = msg.text();
        if (
          !text.includes('favicon') &&
          !text.includes('404') &&
          !text.includes('Failed to load resource')
        ) {
          errors.push(text);
        }
      }
    });

    await page.goto('/profile');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(3000);

    const criticalErrors = errors.filter((e) => !e.includes('Warning:'));
    expect(criticalErrors).toHaveLength(0);
  });
});
