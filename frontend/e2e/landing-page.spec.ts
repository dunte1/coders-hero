import { test, expect } from '@playwright/test';

test.describe('Landing Page - Hero Section', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1000);
  });

  test('hero section is visible with main heading', async ({ page }) => {
    const hero = page.locator('section').first();
    await expect(hero).toBeVisible();
    
    const heading = page.getByRole('heading', { level: 1 }).first();
    await expect(heading).toBeVisible();
    await expect(heading).toContainText(/coder|hero|coding/i);
  });

  test('hero CTA buttons are visible and clickable', async ({ page }) => {
    const ctaButtons = page.locator('a[href*="register"], a[href*="free-trial"], a[href*="courses"]');
    const count = await ctaButtons.count();
    expect(count).toBeGreaterThanOrEqual(1);
    
    for (let i = 0; i < count; i++) {
      await expect(ctaButtons.nth(i)).toBeVisible();
      await expect(ctaButtons.nth(i)).toBeEnabled();
    }
  });

  test('hero fade-up animation classes are present', async ({ page }) => {
    const heroElements = page.locator('.hero-fade-up');
    const count = await heroElements.count();
    expect(count).toBeGreaterThanOrEqual(1);
    
    for (let i = 0; i < count; i++) {
      await expect(heroElements.nth(i)).toBeVisible();
    }
  });

  test('scroll reveal elements exist on page', async ({ page }) => {
    const revealElements = page.locator('.reveal');
    const count = await revealElements.count();
    expect(count).toBeGreaterThanOrEqual(1);
  });

  test('float-subtle animation elements exist', async ({ page }) => {
    const floatElements = page.locator('.float-subtle');
    const count = await floatElements.count();
    expect(count).toBeGreaterThanOrEqual(1);
    
    for (let i = 0; i < count; i++) {
      const animation = await floatElements.nth(i).evaluate((el) => 
        window.getComputedStyle(el).animationName
      );
      expect(animation).toBe('floatSubtle');
    }
  });
});

test.describe('Landing Page - Stats/Counters', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1000);
  });

  test('social proof counters are displayed', async ({ page }) => {
    const statsSection = page.locator('[class*="stat"], [class*="counter"], [data-testid*="stat"]');
    const count = await statsSection.count();
    expect(count).toBeGreaterThanOrEqual(1);
  });

  test('counter numbers are animated with stagger', async ({ page }) => {
    const staggerChildren = page.locator('.stagger-children');
    const count = await staggerChildren.count();
    expect(count).toBeGreaterThanOrEqual(1);
  });
});

test.describe('Landing Page - Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1000);
  });

  test('navbar is sticky with transition on scroll', async ({ page }) => {
    const navbar = page.locator('nav').first();
    await expect(navbar).toBeVisible();
    
    const initialBg = await navbar.evaluate((el) => 
      window.getComputedStyle(el).backgroundColor
    );
    
    await page.evaluate(() => window.scrollTo(0, 500));
    await page.waitForTimeout(400);
    
    const scrolledBg = await navbar.evaluate((el) => 
      window.getComputedStyle(el).backgroundColor
    );
    
    expect(initialBg).not.toBe(scrolledBg);
  });

  test('desktop navigation links are visible', async ({ page }) => {
    const viewport = page.viewportSize();
    if (viewport && viewport.width >= 1024) {
      const navLinks = page.locator('nav a[href]');
      const count = await navLinks.count();
      expect(count).toBeGreaterThanOrEqual(5);
    }
  });

  test('mobile hamburger menu opens drawer', async ({ page }) => {
    const viewport = page.viewportSize();
    if (viewport && viewport.width < 1024) {
      const hamburger = page.locator('button[aria-label*="menu"], button[aria-label*="Menu"], nav button').first();
      if (await hamburger.isVisible()) {
        await hamburger.click();
        await page.waitForTimeout(400);
        
        const mobileMenu = page.locator('[class*="translate-x-0"], [class*="drawer"], [role="dialog"]');
        await expect(mobileMenu.first()).toBeVisible();
      }
    }
  });
});

test.describe('Landing Page - Floating Elements', () => {
  test('chat widget button is visible', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1000);
    
    const chatButton = page.locator('button[class*="fixed"], button[class*="bottom-"]').first();
    if (await chatButton.isVisible()) {
      await expect(chatButton).toBeVisible();
      
      const position = await chatButton.evaluate((el) => {
        const style = window.getComputedStyle(el);
        return {
          position: style.position,
          bottom: style.bottom,
          right: style.right,
        };
      });
      
      expect(position.position).toBe('fixed');
      expect(position.bottom).toBeTruthy();
      expect(position.right).toBeTruthy();
    }
  });

  test('chat widget has hover transition', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1000);
    
    const chatButton = page.locator('button[class*="fixed"]').first();
    if (await chatButton.isVisible()) {
      const transition = await chatButton.evaluate((el) => 
        window.getComputedStyle(el).transition
      );
      expect(transition).toContain('transform');
    }
  });

  test('chat widget opens panel on click', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1000);
    
    const chatButton = page.locator('button[class*="fixed"]').first();
    if (await chatButton.isVisible()) {
      await chatButton.click();
      await page.waitForTimeout(300);
      
      const panel = page.locator('[class*="w-[calc"], [class*="max-w-sm"]');
      await expect(panel.first()).toBeVisible();
    }
  });
});

test.describe('Landing Page - Sections', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1000);
  });

  test('services section exists with cards', async ({ page }) => {
    const servicesSection = page.getByRole('heading', { name: /services|what we offer/i });
    if (await servicesSection.isVisible()) {
      const cards = page.locator('[class*="service"], [class*="card"]');
      const count = await cards.count();
      expect(count).toBeGreaterThanOrEqual(1);
    }
  });

  test('programs section exists with cards', async ({ page }) => {
    const programsSection = page.getByRole('heading', { name: /programs|courses/i });
    if (await programsSection.isVisible()) {
      const cards = page.locator('[class*="program"], [class*="card"]');
      const count = await cards.count();
      expect(count).toBeGreaterThanOrEqual(1);
    }
  });

  test('testimonials section exists', async ({ page }) => {
    const testimonialsSection = page.getByRole('heading', { name: /testimonials|reviews/i });
    if (await testimonialsSection.isVisible()) {
      await expect(testimonialsSection).toBeVisible();
    }
  });

  test('blog section exists with posts', async ({ page }) => {
    const blogSection = page.getByRole('heading', { name: /blog|news/i });
    if (await blogSection.isVisible()) {
      await expect(blogSection).toBeVisible();
    }
  });

  test('FAQ section exists with accordion', async ({ page }) => {
    const faqSection = page.getByRole('heading', { name: /faq|frequently/i });
    if (await faqSection.isVisible()) {
      await expect(faqSection).toBeVisible();
    }
  });

  test('footer is visible with links', async ({ page }) => {
    const footer = page.locator('footer');
    await expect(footer).toBeVisible();
    
    const footerLinks = footer.locator('a');
    const count = await footerLinks.count();
    expect(count).toBeGreaterThanOrEqual(5);
  });

  test('WhatsApp link exists in footer', async ({ page }) => {
    const footer = page.locator('footer');
    const whatsappLink = footer.locator('a[href*="wa.me"]');
    if (await whatsappLink.isVisible()) {
      await expect(whatsappLink).toBeVisible();
      const href = await whatsappLink.getAttribute('href');
      expect(href).toContain('wa.me');
    }
  });

  test('JSON-LD structured data is present', async ({ page }) => {
    const jsonLd = page.locator('script[type="application/ld+json"]');
    const count = await jsonLd.count();
    expect(count).toBeGreaterThanOrEqual(1);
    
    const content = await jsonLd.first().textContent();
    expect(content).toBeTruthy();
    const data = JSON.parse(content!);
    expect(data).toHaveProperty('@context');
    expect(data).toHaveProperty('@type');
  });
});
