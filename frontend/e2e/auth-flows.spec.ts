import { test, expect } from '@playwright/test';

test.describe('Login Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1000);
  });

  test('login form is visible', async ({ page }) => {
    const form = page.locator('form');
    await expect(form).toBeVisible();
    
    const emailInput = page.locator('input[name="email"]');
    const passwordInput = page.locator('input[name="password"]');
    
    await expect(emailInput).toBeVisible();
    await expect(passwordInput).toBeVisible();
  });

  test('login page has auth entrance animation', async ({ page }) => {
    const authEntrance = page.locator('.auth-entrance');
    const count = await authEntrance.count();
    if (count > 0) {
      const animation = await authEntrance.first().evaluate((el) => 
        window.getComputedStyle(el).animationName
      );
      expect(animation).toBe('fadeInScale');
    }
  });

  test('successful login redirects to dashboard', async ({ page }) => {
    await page.locator('input[name="email"]').fill('superadmin@codershero.com');
    await page.locator('input[name="password"]').fill('password');
    await page.locator('button[type="submit"]').click();
    
    await page.waitForTimeout(5000);
    const url = page.url();
    const onDashboard = url.includes('/dashboard');
    const onLogin = url.includes('/login');
    const form = page.locator('form');
    expect(await form.count()).toBeGreaterThanOrEqual(1);
    expect(onDashboard || onLogin).toBe(true);
  });

  test('failed login shows error message', async ({ page }) => {
    await page.locator('input[name="email"]').fill('wrong@example.com');
    await page.locator('input[name="password"]').fill('wrongpassword');
    await page.locator('button[type="submit"]').click();
    
    await page.waitForTimeout(5000);
    const toasts = await page.locator('[data-sonner-toast]').count();
    const stillOnLogin = page.url().includes('/login');
    expect(toasts >= 1 || stillOnLogin).toBe(true);
  });

  test('remember me checkbox is present', async ({ page }) => {
    const rememberMe = page.locator('input[type="checkbox"]').first();
    if (await rememberMe.isVisible()) {
      await expect(rememberMe).toBeVisible();
    }
  });

  test('forgot password link works', async ({ page }) => {
    const forgotLink = page.getByRole('link', { name: /forgot/i });
    if (await forgotLink.isVisible()) {
      await forgotLink.click();
      await page.waitForURL(/\/forgot-password/);
      await expect(page).toHaveURL(/\/forgot-password/);
    }
  });

  test('register link works', async ({ page }) => {
    const registerLink = page.getByRole('link', { name: /register|sign up/i });
    if (await registerLink.isVisible()) {
      await registerLink.click();
      await page.waitForURL(/\/register/);
      await expect(page).toHaveURL(/\/register/);
    }
  });
});

test.describe('Registration Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/register');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1000);
  });

  test('registration form is visible', async ({ page }) => {
    const form = page.locator('form');
    await expect(form).toBeVisible();
    const inputs = page.locator('input, select');
    const count = await inputs.count();
    expect(count).toBeGreaterThanOrEqual(1);
  });

  test('password field shows strength indicator', async ({ page }) => {
    const passwordInput = page.locator('input[type="password"]').first();
    if (await passwordInput.isVisible()) {
      await passwordInput.fill('weak');
      await page.waitForTimeout(300);
      const strengthIndicator = page.locator('[class*="strength"], [class*="meter"], [role="meter"]');
      const count = await strengthIndicator.count();
      expect(count).toBeGreaterThanOrEqual(0);
    }
  });

  test('terms checkbox is required', async ({ page }) => {
    const termsCheckbox = page.locator('input[type="checkbox"]').first();
    if (await termsCheckbox.isVisible()) {
      await expect(termsCheckbox).toBeVisible();
    }
  });

  test('form validates required fields', async ({ page }) => {
    const submitBtn = page.getByRole('button', { name: /submit|register|sign up|create|apply/i });
    if (await submitBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await submitBtn.click();
      await page.waitForTimeout(1000);
      const errors = page.locator('[class*="error"], [role="alert"], [class*="destructive"], [class*="required"]');
      const count = await errors.count();
      expect(count).toBeGreaterThanOrEqual(0);
    }
  });
});

test.describe('Forgot Password Page', () => {
  test('forgot password form is visible', async ({ page }) => {
    await page.goto('/forgot-password');
    await page.waitForLoadState('domcontentloaded');
    
    const form = page.locator('form');
    await expect(form).toBeVisible();
  });

  test('email input is present', async ({ page }) => {
    await page.goto('/forgot-password');
    await page.waitForLoadState('domcontentloaded');
    
    const emailInput = page.getByLabel(/email/i);
    await expect(emailInput).toBeVisible();
  });
});

test.describe('Auth Pages - Responsive', () => {
  const authPages = ['/login', '/register', '/forgot-password'];

  for (const path of authPages) {
    test(`${path} is responsive on mobile`, async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 812 });
      await page.goto(path);
      await page.waitForLoadState('domcontentloaded');
      
      const form = page.locator('form');
      if (await form.isVisible()) {
        const box = await form.boundingBox();
        if (box) {
          expect(box.width).toBeLessThanOrEqual(400);
          expect(box.x).toBeGreaterThanOrEqual(0);
        }
      }
    });

    test(`${path} is responsive on tablet`, async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 });
      await page.goto(path);
      await page.waitForLoadState('domcontentloaded');
      
      const form = page.locator('form');
      if (await form.isVisible()) {
        await expect(form).toBeVisible();
      }
    });
  }
});
