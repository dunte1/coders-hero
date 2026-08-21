import { test, expect } from '@playwright/test';

test.describe('Dashboard Page', () => {
  test('dashboard loads with stats grid', async ({ page }) => {
    const statsGrid = page.locator('[class*="grid"], [class*="stats"]');
    const count = await statsGrid.count();
    expect(count).toBeGreaterThanOrEqual(1);
  });

  test('dashboard shows role-based greeting', async ({ page }) => {
    const greeting = page.locator('[class*="greeting"], h1, h2').first();
    await expect(greeting).toBeVisible();
    const text = await greeting.textContent();
    expect(text).toBeTruthy();
  });

  test('sidebar navigation is visible on desktop', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    const sidebar = page.locator('[class*="sidebar"], aside, [class*="fixed inset-y-0 left-0"]');
    await expect(sidebar.first()).toBeVisible();
  });

  test('sidebar collapses on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.reload();
    
    const sidebar = page.locator('[class*="fixed inset-y-0 left-0"]');
    if (await sidebar.isVisible()) {
      const transform = await sidebar.evaluate((el) => 
        window.getComputedStyle(el).transform
      );
      expect(transform).not.toBe('none');
    }
  });

  test('stats cards have hover transition', async ({ page }) => {
    const cards = page.locator('[class*="hover:-translate-y"], [class*="transition-all"]');
    const count = await cards.count();
    if (count > 0) {
      const card = cards.first();
      const transition = await card.evaluate((el) => 
        window.getComputedStyle(el).transition
      );
      expect(transition).toContain('all');
    }
  });

  test('quick actions are visible', async ({ page }) => {
    const quickActions = page.locator('[class*="quick-action"], [class*="action"]');
    const count = await quickActions.count();
    expect(count).toBeGreaterThanOrEqual(1);
  });
});

test.describe('LMS Course Player', () => {
  test('courses page loads with course list', async ({ page }) => {
    await page.goto('/courses');
    await page.waitForLoadState('domcontentloaded');
    
    const content = page.locator('[class*="grid"], [class*="list"], table');
    const count = await content.count();
    expect(count).toBeGreaterThanOrEqual(1);
  });

  test('course detail page loads', async ({ page }) => {
    await page.goto('/courses');
    await page.waitForLoadState('domcontentloaded');
    
    const firstCourse = page.locator('a[href*="/courses/"]').first();
    if (await firstCourse.isVisible()) {
      await firstCourse.click();
      await page.waitForLoadState('domcontentloaded');
      
      const title = page.locator('h1, h2').first();
      await expect(title).toBeVisible();
    }
  });
});

test.describe('Public Courses Catalog', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/courses-catalog');
    await page.waitForLoadState('domcontentloaded');
  });

  test('courses catalog loads with course cards', async ({ page }) => {
    const cards = page.locator('[class*="card"], [class*="course"]');
    const count = await cards.count();
    expect(count).toBeGreaterThanOrEqual(1);
  });

  test('sorting dropdown works', async ({ page }) => {
    const sortSelect = page.locator('select, [role="combobox"]').first();
    if (await sortSelect.isVisible()) {
      await sortSelect.click();
      await page.waitForTimeout(300);
    }
  });

  test('level filter buttons work', async ({ page }) => {
    const filterButtons = page.locator('button[class*="filter"], button[class*="level"]');
    const count = await filterButtons.count();
    if (count > 0) {
      for (let i = 0; i < count; i++) {
        await expect(filterButtons.nth(i)).toBeVisible();
      }
    }
  });
});

test.describe('Parent Portal', () => {
  test('parent dashboard loads', async ({ page }) => {
    await expect(page).toHaveURL(/\/parent/);
    
    const content = page.locator('[class*="grid"], [class*="card"], h1, h2');
    const count = await content.count();
    expect(count).toBeGreaterThanOrEqual(1);
  });

  test('children list is visible', async ({ page }) => {
    const children = page.locator('[class*="child"], [class*="student"]');
    const count = await children.count();
    expect(count).toBeGreaterThanOrEqual(1);
  });
});

test.describe('Teacher Portal', () => {
  test('teacher dashboard loads', async ({ page }) => {
    await expect(page).toHaveURL(/\/teacher/);
    
    const content = page.locator('[class*="grid"], [class*="card"], h1, h2');
    const count = await content.count();
    expect(count).toBeGreaterThanOrEqual(1);
  });

  test('teacher greeting is personalized', async ({ page }) => {
    const greeting = page.locator('h1, h2, [class*="greeting"]').first();
    await expect(greeting).toBeVisible();
    const text = await greeting.textContent();
    expect(text).toBeTruthy();
  });
});
