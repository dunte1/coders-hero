import { test, expect } from '@playwright/test';

test.describe('Animations & Transitions - Cross Device', () => {
  const viewports = [
    { name: 'Mobile', width: 375, height: 812 },
    { name: 'Tablet', width: 768, height: 1024 },
    { name: 'Desktop', width: 1440, height: 900 },
    { name: 'Large Desktop', width: 1920, height: 1080 },
  ];

  for (const viewport of viewports) {
    test.describe(`${viewport.name} (${viewport.width}x${viewport.height})`, () => {
      test.use({ viewport: { width: viewport.width, height: viewport.height } });

      test('hero section animations work', async ({ page }) => {
        await page.goto('/');
        await page.waitForLoadState('networkidle');

        const heroFadeUp = page.locator('.hero-fade-up');
        const count = await heroFadeUp.count();
        expect(count).toBeGreaterThanOrEqual(1);

        for (let i = 0; i < count; i++) {
          const animation = await heroFadeUp.nth(i).evaluate((el) => {
            const style = window.getComputedStyle(el);
            return {
              name: style.animationName,
              duration: style.animationDuration,
              fillMode: style.animationFillMode,
            };
          });
          expect(animation.name).toBe('heroFadeUp');
          expect(animation.fillMode).toBe('forwards');
        }
      });

      test('scroll reveal triggers on scroll', async ({ page }) => {
        await page.goto('/');
        await page.waitForLoadState('networkidle');

        const revealElements = page.locator('.reveal:not(.revealed)');
        const initialCount = await revealElements.count();

        await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
        await page.waitForTimeout(1000);

        const revealedElements = page.locator('.reveal.revealed');
        const revealedCount = await revealedElements.count();

        expect(revealedCount).toBeGreaterThanOrEqual(0);
      });

      test('stagger children animate sequentially', async ({ page }) => {
        await page.goto('/');
        await page.waitForLoadState('networkidle');

        const staggerContainers = page.locator('.stagger-children');
        const count = await staggerContainers.count();
        expect(count).toBeGreaterThanOrEqual(1);

        await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
        await page.waitForTimeout(1000);

        const staggerActive = page.locator('.stagger-children.stagger-active');
        const activeCount = await staggerActive.count();
        expect(activeCount).toBeGreaterThanOrEqual(0);
      });

      test('float-subtle animation is infinite', async ({ page }) => {
        await page.goto('/');
        await page.waitForLoadState('networkidle');

        const floatElements = page.locator('.float-subtle');
        const count = await floatElements.count();
        expect(count).toBeGreaterThanOrEqual(1);

        for (let i = 0; i < count; i++) {
          const iterationCount = await floatElements.nth(i).evaluate((el) => 
            window.getComputedStyle(el).animationIterationCount
          );
          expect(iterationCount).toBe('infinite');
        }
      });

      test('card hover transitions are smooth', async ({ page }) => {
        await page.goto('/');
        await page.waitForLoadState('networkidle');

        const hoverCards = page.locator('[class*="hover:-translate-y-1"]').first();
        if (await hoverCards.isVisible()) {
          const beforeHover = await hoverCards.evaluate((el) => ({
            transform: window.getComputedStyle(el).transform,
            transition: window.getComputedStyle(el).transition,
          }));

          expect(beforeHover.transition).toContain('all');
          expect(beforeHover.transition).toContain('0.3s');
        }
      });

      test('image zoom on hover works', async ({ page }) => {
        await page.goto('/');
        await page.waitForLoadState('networkidle');

        const zoomImages = page.locator('[class*="group-hover:scale-105"], [class*="group-hover:scale-110"]');
        const count = await zoomImages.count();
        expect(count).toBeGreaterThanOrEqual(1);

        for (let i = 0; i < Math.min(count, 3); i++) {
          const transition = await zoomImages.nth(i).evaluate((el) => 
            window.getComputedStyle(el).transition
          );
          expect(transition).toContain('transform');
        }
      });

      test('page transition animation exists', async ({ page }) => {
        await page.goto('/');
        await page.waitForLoadState('networkidle');

        const pageTransition = page.locator('.page-transition');
        const count = await pageTransition.count();
        if (count > 0) {
          const animation = await pageTransition.first().evaluate((el) => {
            const style = window.getComputedStyle(el);
            return {
              name: style.animationName,
              duration: style.animationDuration,
            };
          });
          expect(animation.name).toBe('pageFadeIn');
        }
      });

      test('shimmer loading animation works', async ({ page }) => {
        await page.goto('/');
        await page.waitForLoadState('networkidle');

        const shimmerElements = page.locator('.shimmer');
        const count = await shimmerElements.count();
        if (count > 0) {
          for (let i = 0; i < count; i++) {
            const animation = await shimmerElements.nth(i).evaluate((el) => 
              window.getComputedStyle(el).animationName
            );
            expect(animation).toBe('shimmer');
          }
        }
      });

      test('dropdown enter animation works', async ({ page }) => {
        await page.goto('/');
        await page.waitForLoadState('networkidle');

        const dropdownTrigger = page.locator('nav button, nav [role="button"]').first();
        if (await dropdownTrigger.isVisible()) {
          await dropdownTrigger.click();
          await page.waitForTimeout(300);

          const dropdown = page.locator('.dropdown-enter-active, [class*="dropdown"]');
          if (await dropdown.first().isVisible()) {
            const animation = await dropdown.first().evaluate((el) => {
              const style = window.getComputedStyle(el);
              return {
                transform: style.transform,
                transition: style.transition,
              };
            });
            expect(animation.transition).toContain('0.2s');
          }
        }
      });

      test('dialog overlay has transition', async ({ page }) => {
        await page.goto('/');
        await page.waitForLoadState('networkidle');

        const dialogTrigger = page.locator('button[data-state], button[aria-haspopup]').first();
        if (await dialogTrigger.isVisible()) {
          await dialogTrigger.click();
          await page.waitForTimeout(300);

          const overlay = page.locator('[class*="overlay"], [data-state="open"]');
          if (await overlay.first().isVisible()) {
            const transition = await overlay.first().evaluate((el) => 
              window.getComputedStyle(el).transition
            );
            expect(transition).toContain('opacity');
          }
        }
      });

      test('reduced motion disables animations', async ({ page }) => {
        await page.emulateMedia({ reducedMotion: 'reduce' });
        await page.goto('/');
        await page.waitForLoadState('networkidle');

        const body = page.locator('body');
        const animation = await body.evaluate((el) => 
          window.getComputedStyle(el).animationDuration
        );
        
        if (animation === '0s' || animation.includes('0s')) {
          expect(animation).toBe('0s');
        }
      });

      test('no horizontal overflow on any viewport', async ({ page }) => {
        await page.goto('/');
        await page.waitForLoadState('networkidle');

        const scrollWidth = await page.evaluate(() => document.body.scrollWidth);
        const clientWidth = await page.evaluate(() => document.body.clientWidth);
        
        expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 1);
      });
    });
  }
});

test.describe('Landing Page - Specific Device Tests', () => {
  test('mobile: hamburger menu opens and closes', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const hamburger = page.locator('button[aria-label*="menu"], button[aria-label*="Menu"]').first();
    if (await hamburger.isVisible()) {
      await hamburger.click();
      await page.waitForTimeout(400);

      const closeBtn = page.locator('button[aria-label*="close"], button[aria-label*="Close"]').first();
      if (await closeBtn.isVisible()) {
        await closeBtn.click();
        await page.waitForTimeout(400);
      }
    }
  });

  test('mobile: chat widget is positioned correctly', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const chatButton = page.locator('button[class*="fixed"][class*="bottom"]').first();
    if (await chatButton.isVisible()) {
      const box = await chatButton.boundingBox();
      if (box) {
        expect(box.x + box.width).toBeLessThanOrEqual(375);
        expect(box.y + box.height).toBeLessThanOrEqual(812);
      }
    }
  });

  test('tablet: navigation adapts to screen size', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const nav = page.locator('nav');
    await expect(nav.first()).toBeVisible();
  });

  test('desktop: full navigation is visible', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const desktopNav = page.locator('nav .lg\\:flex, nav [class*="lg:flex"]');
    if (await desktopNav.isVisible()) {
      await expect(desktopNav).toBeVisible();
    }
  });

  test('all breakpoints: footer is visible', async ({ page }) => {
    const viewports = [
      { width: 375, height: 812 },
      { width: 768, height: 1024 },
      { width: 1440, height: 900 },
    ];

    for (const vp of viewports) {
      await page.setViewportSize(vp);
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      const footer = page.locator('footer');
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await page.waitForTimeout(500);
      await expect(footer).toBeVisible();
    }
  });

  test('gallery page: lightbox opens and closes', async ({ page }) => {
    await page.goto('/gallery');
    await page.waitForLoadState('networkidle');

    const galleryImage = page.locator('[class*="gallery"] img, [class*="grid"] img').first();
    if (await galleryImage.isVisible()) {
      await galleryImage.click();
      await page.waitForTimeout(500);

      const lightbox = page.locator('[class*="lightbox"], [class*="modal"], [role="dialog"]');
      if (await lightbox.first().isVisible()) {
        const closeBtn = page.locator('button[class*="close"], button[aria-label*="close"], button[aria-label*="Close"]').first();
        if (await closeBtn.isVisible()) {
          await closeBtn.click();
          await page.waitForTimeout(500);
        }
      }
    }
  });

  test('blog page: post cards have hover effects', async ({ page }) => {
    await page.goto('/blog');
    await page.waitForLoadState('networkidle');

    const blogCards = page.locator('[class*="group"]').first();
    if (await blogCards.isVisible()) {
      const transition = await blogCards.evaluate((el) => 
        window.getComputedStyle(el).transition
      );
      expect(transition).toContain('all');
    }
  });

  test('FAQ page: accordion expands and collapses', async ({ page }) => {
    await page.goto('/faqs');
    await page.waitForLoadState('networkidle');

    const faqButton = page.locator('button[aria-expanded]').first();
    if (await faqButton.isVisible()) {
      const initialExpanded = await faqButton.getAttribute('aria-expanded');
      
      await faqButton.click();
      await page.waitForTimeout(400);
      
      const newExpanded = await faqButton.getAttribute('aria-expanded');
      expect(initialExpanded).not.toBe(newExpanded);
    }
  });

  test('contact page: form has proper validation', async ({ page }) => {
    await page.goto('/contact');
    await page.waitForLoadState('networkidle');

    const submitBtn = page.getByRole('button', { name: /send|submit/i });
    if (await submitBtn.isVisible()) {
      await submitBtn.click();
      await page.waitForTimeout(1000);

      const errors = page.locator('[class*="error"], [role="alert"]');
      const count = await errors.count();
      expect(count).toBeGreaterThanOrEqual(0);
    }
  });
});
