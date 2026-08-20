import { test, expect } from '@playwright/test';

const PUBLIC_PAGES = [
  { path: '/', name: 'Home' },
  { path: '/about', name: 'About' },
  { path: '/services', name: 'Services' },
  { path: '/programs', name: 'Programs' },
  { path: '/robotics', name: 'Robotics' },
  { path: '/coding', name: 'Coding' },
  { path: '/gallery', name: 'Gallery' },
  { path: '/testimonials', name: 'Testimonials' },
  { path: '/blog', name: 'Blog' },
  { path: '/faqs', name: 'FAQs' },
  { path: '/events', name: 'Events' },
  { path: '/courses-catalog', name: 'Courses' },
  { path: '/contact', name: 'Contact' },
  { path: '/free-trial', name: 'Free Trial' },
  { path: '/school-partnerships', name: 'Partnerships' },
];

for (const pageDef of PUBLIC_PAGES) {
  test.describe(`${pageDef.name} Page (${pageDef.path})`, () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(pageDef.path);
      await page.waitForLoadState('networkidle');
    });

    test('page loads successfully', async ({ page }) => {
      await expect(page).not.toHaveURL(/error|404|500/);
    });

    test('page has correct title', async ({ page }) => {
      const title = await page.title();
      expect(title).toBeTruthy();
    });

    test('page transition animation plays', async ({ page }) => {
      const pageTransition = page.locator('.page-transition, [class*="pageFadeIn"]');
      const count = await pageTransition.count();
      if (count > 0) {
        await expect(pageTransition.first()).toBeVisible();
      }
    });

    test('scroll reveal elements exist', async ({ page }) => {
      const revealElements = page.locator('.reveal');
      const count = await revealElements.count();
      expect(count).toBeGreaterThanOrEqual(1);
    });

    test('hero section has fade-up animation', async ({ page }) => {
      const heroFadeUp = page.locator('.hero-fade-up');
      const count = await heroFadeUp.count();
      if (count > 0) {
        for (let i = 0; i < count; i++) {
          const animation = await heroFadeUp.nth(i).evaluate((el) => 
            window.getComputedStyle(el).animationName
          );
          expect(animation).toBe('heroFadeUp');
        }
      }
    });

    test('card hover transitions work', async ({ page }) => {
      const cards = page.locator('[class*="hover:-translate-y"], [class*="hover:shadow"]');
      const count = await cards.count();
      if (count > 0) {
        const card = cards.first();
        await expect(card).toBeVisible();
        
        const transition = await card.evaluate((el) => 
          window.getComputedStyle(el).transition
        );
        expect(transition).toContain('all');
      }
    });

    test('page is responsive at mobile breakpoint', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 812 });
      await page.reload();
      await page.waitForLoadState('networkidle');
      
      const body = page.locator('body');
      const width = await body.evaluate((el) => el.scrollWidth);
      expect(width).toBeLessThanOrEqual(400);
    });

    test('page is responsive at tablet breakpoint', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 });
      await page.reload();
      await page.waitForLoadState('networkidle');
      
      const body = page.locator('body');
      const width = await body.evaluate((el) => el.scrollWidth);
      expect(width).toBeLessThanOrEqual(800);
    });

    test('page is responsive at desktop breakpoint', async ({ page }) => {
      await page.setViewportSize({ width: 1440, height: 900 });
      await page.reload();
      await page.waitForLoadState('networkidle');
      
      const body = page.locator('body');
      const width = await body.evaluate((el) => el.scrollWidth);
      expect(width).toBeLessThanOrEqual(1500);
    });

    test('navbar is present', async ({ page }) => {
      const navbar = page.locator('nav');
      await expect(navbar.first()).toBeVisible();
    });

    test('footer is present', async ({ page }) => {
      const footer = page.locator('footer');
      await expect(footer).toBeVisible();
    });

    test('no console errors on load', async ({ page }) => {
      const errors: string[] = [];
      page.on('console', (msg) => {
        if (msg.type() === 'error') {
          errors.push(msg.text());
        }
      });
      
      await page.goto(pageDef.path);
      await page.waitForLoadState('networkidle');
      
      const criticalErrors = errors.filter(e => 
        !e.includes('favicon') && 
        !e.includes('404') &&
        !e.includes('Failed to load resource')
      );
      expect(criticalErrors).toHaveLength(0);
    });

    test('images have proper alt text', async ({ page }) => {
      const images = page.locator('img');
      const count = await images.count();
      
      for (let i = 0; i < Math.min(count, 10); i++) {
        const alt = await images.nth(i).getAttribute('alt');
        expect(alt).toBeTruthy();
      }
    });

    test('links have no empty href', async ({ page }) => {
      const links = page.locator('a[href]');
      const count = await links.count();
      
      for (let i = 0; i < Math.min(count, 20); i++) {
        const href = await links.nth(i).getAttribute('href');
        expect(href).not.toBe('');
        expect(href).not.toBe('#');
      }
    });
  });
}
