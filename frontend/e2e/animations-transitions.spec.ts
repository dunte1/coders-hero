import { test, expect, type Page } from '@playwright/test';

async function loadLandingPage(page: Page) {
  await page.goto('/');
  await page.waitForFunction(
    () => document.querySelectorAll('.hero-fade-up').length >= 1,
    { timeout: 30000 }
  );
  await page.waitForTimeout(2000);
}

test.describe('Hero Fade-Up Animations', () => {
  test('hero elements animate with heroFadeUp keyframes', async ({ page }) => {
    await loadLandingPage(page);

    const heroFadeUp = page.locator('.hero-fade-up');
    const count = await heroFadeUp.count();
    expect(count).toBeGreaterThanOrEqual(1);

    for (let i = 0; i < count; i++) {
      const animation = await heroFadeUp.nth(i).evaluate((el) => {
        const style = window.getComputedStyle(el);
        return {
          name: style.animationName,
          fillMode: style.animationFillMode,
        };
      });
      expect(animation.name).toBe('heroFadeUp');
      expect(animation.fillMode).toBe('forwards');
    }
  });

  test('hero fade-up has staggered delays', async ({ page }) => {
    await loadLandingPage(page);

    const heroElements = page.locator('.hero-fade-up');
    const count = await heroElements.count();
    expect(count).toBeGreaterThanOrEqual(2);

    const delays = await Promise.all(
      Array.from({ length: Math.min(count, 5) }, (_, i) =>
        heroElements.nth(i).evaluate((el) =>
          window.getComputedStyle(el).animationDelay
        )
      )
    );
    const parsedDelays = delays.map((d) => parseFloat(d) * 1000);
    expect(parsedDelays[0]).toBeLessThanOrEqual(parsedDelays[1]);
  });

  test('hero badge, title, subtitle, body, buttons all have fade-up', async ({ page }) => {
    await loadLandingPage(page);

    const count = await page.locator('.hero-fade-up').count();
    expect(count).toBeGreaterThanOrEqual(3);
  });
});

test.describe('Scroll Reveal', () => {
  test('.reveal elements become visible on scroll', async ({ page }) => {
    await loadLandingPage(page);

    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(2500);

    const revealedCount = await page.evaluate(() =>
      document.querySelectorAll('.reveal.revealed').length
    );
    expect(revealedCount).toBeGreaterThanOrEqual(1);
  });

  test('reveal transition uses 0.7s cubic-bezier timing', async ({ page }) => {
    await loadLandingPage(page);

    const transition = await page.evaluate(() => {
      const el = document.querySelector('.reveal');
      if (!el) return null;
      return window.getComputedStyle(el).transition;
    });
    if (transition) {
      expect(transition).toContain('opacity');
      expect(transition).toContain('transform');
      expect(transition).toContain('0.7s');
    }
  });

  test('safety fallback forces reveal after 2s', async ({ page }) => {
    await loadLandingPage(page);
    await page.waitForTimeout(1000);

    const allRevealed = await page.evaluate(() => {
      const all = document.querySelectorAll('.reveal');
      if (all.length === 0) return true;
      return Array.from(all).every((el) => el.classList.contains('revealed'));
    });
    expect(allRevealed).toBe(true);
  });

  test('reveal-ready class is added to container', async ({ page }) => {
    await loadLandingPage(page);

    const hasRevealReady = await page.evaluate(() =>
      document.querySelector('.reveal-ready') !== null
    );
    expect(hasRevealReady).toBe(true);
  });
});

test.describe('Stagger Children', () => {
  test('stagger-children containers exist', async ({ page }) => {
    await loadLandingPage(page);

    const count = await page.locator('.stagger-children').count();
    expect(count).toBeGreaterThanOrEqual(1);
  });

  test('stagger children activate after scroll', async ({ page }) => {
    await loadLandingPage(page);

    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(3000);

    const staggerActive = await page.evaluate(() =>
      document.querySelectorAll('.stagger-children.stagger-active').length
    );
    expect(staggerActive).toBeGreaterThanOrEqual(1);
  });

  test('stagger children have sequential animation delays', async ({ page }) => {
    await loadLandingPage(page);

    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(3000);

    const delays = await page.evaluate(() => {
      const container = document.querySelector('.stagger-children.stagger-active');
      if (!container) return [];
      const children = Array.from(container.children).slice(0, 4);
      return children.map((el) =>
        parseFloat(window.getComputedStyle(el).animationDelay) * 1000
      );
    });
    if (delays.length >= 2) {
      for (let i = 1; i < delays.length; i++) {
        expect(delays[i]).toBeGreaterThan(delays[i - 1]);
      }
    }
  });
});

test.describe('Float Subtle (Floating Elements)', () => {
  test('floating decorative orbs exist in hero and CTA', async ({ page }) => {
    await loadLandingPage(page);

    const count = await page.locator('.float-subtle').count();
    expect(count).toBeGreaterThanOrEqual(2);
  });

  test('float-subtle has infinite animation', async ({ page }) => {
    await loadLandingPage(page);

    const count = await page.locator('.float-subtle').count();
    for (let i = 0; i < count; i++) {
      const iterationCount = await page.locator('.float-subtle').nth(i).evaluate((el) =>
        window.getComputedStyle(el).animationIterationCount
      );
      expect(iterationCount).toBe('infinite');
    }
  });

  test('float-subtle uses floatSubtle keyframes (6s duration)', async ({ page }) => {
    await loadLandingPage(page);

    const count = await page.locator('.float-subtle').count();
    for (let i = 0; i < count; i++) {
      const anim = await page.locator('.float-subtle').nth(i).evaluate((el) => {
        const s = window.getComputedStyle(el);
        return { name: s.animationName, duration: s.animationDuration };
      });
      expect(anim.name).toBe('floatSubtle');
      expect(anim.duration).toBe('6s');
    }
  });

  test('floating elements have staggered animation delays', async ({ page }) => {
    await loadLandingPage(page);

    const count = await page.locator('.float-subtle').count();
    expect(count).toBeGreaterThanOrEqual(2);
    const delays = await Promise.all(
      Array.from({ length: count }, (_, i) =>
        page.locator('.float-subtle').nth(i).evaluate((el) =>
          window.getComputedStyle(el).animationDelay
        )
      )
    );
    const parsed = delays.map((d) => parseFloat(d));
    expect(parsed.some((d) => d > 0)).toBe(true);
  });

  test('floating orbs use blur-3xl effect', async ({ page }) => {
    await loadLandingPage(page);

    const blurCount = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('.float-subtle')).filter((el) =>
        el.className.includes('blur-3xl')
      ).length;
    });
    expect(blurCount).toBeGreaterThanOrEqual(1);
  });

  test('floating orbs are absolutely positioned', async ({ page }) => {
    await loadLandingPage(page);

    const absCount = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('.float-subtle')).filter((el) =>
        window.getComputedStyle(el).position === 'absolute'
      ).length;
    });
    expect(absCount).toBeGreaterThanOrEqual(1);
  });
});

test.describe('Page Transitions', () => {
  test('page transition element exists', async ({ page }) => {
    await loadLandingPage(page);
    const count = await page.locator('.page-transition').count();
    expect(count).toBeGreaterThanOrEqual(1);
  });

  test('page transition uses pageFadeIn (0.3s)', async ({ page }) => {
    await loadLandingPage(page);
    const anim = await page.evaluate(() => {
      const el = document.querySelector('.page-transition');
      if (!el) return null;
      const s = window.getComputedStyle(el);
      return { name: s.animationName, duration: s.animationDuration };
    });
    if (anim) {
      expect(anim.name).toBe('pageFadeIn');
      expect(anim.duration).toBe('0.3s');
    }
  });

  test('navigating between pages triggers page transition', async ({ page }) => {
    await loadLandingPage(page);
    const aboutLink = page.locator('nav a[href="/about"]').first();
    if (await aboutLink.isVisible()) {
      await aboutLink.click();
      await page.waitForTimeout(500);
      const count = await page.locator('.page-transition').count();
      expect(count).toBeGreaterThanOrEqual(1);
    }
  });
});

test.describe('Hover Effects', () => {
  test('cards have hover translate-y-1 transition', async ({ page }) => {
    await loadLandingPage(page);
    const card = page.locator('[class*="hover:-translate-y-1"]').first();
    if (await card.isVisible()) {
      const transition = await card.evaluate((el) =>
        window.getComputedStyle(el).transition
      );
      expect(transition).toMatch(/(transform|opacity)/);
    }
  });

  test('hover cards have shadow transitions', async ({ page }) => {
    await loadLandingPage(page);
    const card = page.locator('[class*="hover:shadow"]').first();
    if (await card.isVisible()) {
      const transition = await card.evaluate((el) =>
        window.getComputedStyle(el).transition
      );
      expect(transition).toMatch(/(box-shadow|shadow)/);
    }
  });

  test('gallery images have scale-on-hover transform transition', async ({ page }) => {
    await loadLandingPage(page);
    const img = page.locator('[class*="group-hover:scale-105"], [class*="group-hover:scale-110"]').first();
    if (await img.isVisible()) {
      const transition = await img.evaluate((el) =>
        window.getComputedStyle(el).transition
      );
      expect(transition).toContain('transform');
    }
  });
});

test.describe('Reduced Motion', () => {
  test('disables hero animations', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await loadLandingPage(page);
    const duration = await page.evaluate(() => {
      const el = document.querySelector('.hero-fade-up');
      return el ? window.getComputedStyle(el).animationDuration : null;
    });
    if (duration) {
      const ms = parseFloat(duration);
      expect(ms).toBeLessThanOrEqual(0.01);
    }
  });

  test('disables scroll reveal transitions', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await loadLandingPage(page);
    const t = await page.evaluate(() => {
      const el = document.querySelector('.reveal');
      return el ? window.getComputedStyle(el).transitionDuration : null;
    });
    if (t) {
      const ms = parseFloat(t);
      expect(ms).toBeLessThanOrEqual(0.01);
    }
  });

  test('disables float-subtle animations', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await loadLandingPage(page);
    const duration = await page.evaluate(() => {
      const el = document.querySelector('.float-subtle');
      return el ? window.getComputedStyle(el).animationDuration : null;
    });
    if (duration) {
      const ms = parseFloat(duration);
      expect(ms).toBeLessThanOrEqual(0.01);
    }
  });

  test('disables stagger animations', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await loadLandingPage(page);
    const duration = await page.evaluate(() => {
      const el = document.querySelector('.stagger-children > *');
      return el ? window.getComputedStyle(el).animationDuration : null;
    });
    if (duration) {
      const ms = parseFloat(duration);
      expect(ms).toBeLessThanOrEqual(0.01);
    }
  });

  test('disables page transition animation', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await loadLandingPage(page);
    const duration = await page.evaluate(() => {
      const el = document.querySelector('.page-transition');
      return el ? window.getComputedStyle(el).animationDuration : null;
    });
    if (duration) {
      const ms = parseFloat(duration);
      expect(ms).toBeLessThanOrEqual(0.01);
    }
  });

  test('sets scroll-behavior to auto', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await loadLandingPage(page);
    const scrollBehavior = await page.evaluate(() =>
      window.getComputedStyle(document.documentElement).scrollBehavior
    );
    expect(scrollBehavior).toBe('auto');
  });
});

test.describe('No Horizontal Overflow', () => {
  test('no horizontal overflow on page', async ({ page }) => {
    await loadLandingPage(page);
    const scrollWidth = await page.evaluate(() => document.body.scrollWidth);
    const clientWidth = await page.evaluate(() => document.body.clientWidth);
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 1);
  });
});

test.describe('Hero Section Visual Elements', () => {
  test('hero has dark background (bg-slate-900)', async ({ page }) => {
    await loadLandingPage(page);
    const hero = page.locator('section.bg-slate-900').first();
    await expect(hero).toBeVisible();
  });

  test('hero has circuit pattern overlay', async ({ page }) => {
    await loadLandingPage(page);
    const overlays = await page.evaluate(() => {
      const hero = document.querySelector('section.bg-slate-900');
      return hero ? hero.querySelectorAll('[class*="absolute"]').length : 0;
    });
    expect(overlays).toBeGreaterThanOrEqual(2);
  });

  test('hero has gradient accents', async ({ page }) => {
    await loadLandingPage(page);
    const gradients = await page.evaluate(() => {
      const hero = document.querySelector('section.bg-slate-900');
      return hero ? hero.querySelectorAll('[class*="bg-gradient-to"]').length : 0;
    });
    expect(gradients).toBeGreaterThanOrEqual(1);
  });

  test('hero CTA buttons have hover transitions', async ({ page }) => {
    await loadLandingPage(page);
    const cta = page.locator('a[class*="bg-brand-500"]').first();
    if (await cta.isVisible()) {
      const transition = await cta.evaluate((el) =>
        window.getComputedStyle(el).transition
      );
      expect(transition).not.toBe('none');
      expect(transition.length).toBeGreaterThan(5);
    }
  });
});

test.describe('CTA Section', () => {
  test('CTA has floating orbs', async ({ page }) => {
    await loadLandingPage(page);
    const ctaFloats = await page.evaluate(() => {
      const sections = document.querySelectorAll('section.bg-slate-900');
      let count = 0;
      sections.forEach((s) => {
        count += s.querySelectorAll('.float-subtle').length;
      });
      return count;
    });
    expect(ctaFloats).toBeGreaterThanOrEqual(2);
  });

  test('hero and CTA both have dark backgrounds', async ({ page }) => {
    await loadLandingPage(page);
    const darkSections = await page.evaluate(() =>
      document.querySelectorAll('section.bg-slate-900').length
    );
    expect(darkSections).toBeGreaterThanOrEqual(2);
  });
});

test.describe('Social Proof Counters', () => {
  test('social proof section renders with icons', async ({ page }) => {
    await loadLandingPage(page);
    const icons = await page.locator('svg.h-8.w-8').count();
    expect(icons).toBeGreaterThanOrEqual(1);
  });
});
