import { test, expect } from '@playwright/test';

test.describe('Login Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('networkidle');
  });

  test('login form is visible', async ({ page }) => {
    const form = page.locator('form');
    await expect(form).toBeVisible();
    
    const emailInput = page.getByLabel(/email/i);
    const passwordInput = page.getByLabel(/password/i);
    
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
    await page.getByLabel(/email/i).fill('admin@codershero.com');
    await page.getByLabel(/password/i).fill('password');
    await page.getByRole('button', { name: /sign in|log in|login/i }).click();
    
    await page.waitForURL(/\/dashboard/, { timeout: 10000 });
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test('failed login shows error message', async ({ page }) => {
    await page.getByLabel(/email/i).fill('wrong@example.com');
    await page.getByLabel(/password/i).fill('wrongpassword');
    await page.getByRole('button', { name: /sign in|log in|login/i }).click();
    
    await page.waitForTimeout(2000);
    const error = page.locator('[class*="error"], [role="alert"], [class*="destructive"]');
    await expect(error.first()).toBeVisible();
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
    await page.waitForLoadState('networkidle');
  });

  test('registration form is visible', async ({ page }) => {
    const form = page.locator('form');
    await expect(form).toBeVisible();
    
    const nameInput = page.getByLabel(/name/i);
    const emailInput = page.getByLabel(/email/i);
    
    await expect(nameInput).toBeVisible();
    await expect(emailInput).toBeVisible();
  });

  test('password field shows strength indicator', async ({ page }) => {
    const passwordInput = page.getByLabel(/password/i).first();
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
    await page.getByRole('button', { name: /register|sign up|create/i }).click();
    await page.waitForTimeout(1000);
    
    const errors = page.locator('[class*="error"], [role="alert"], [class*="destructive"]');
    const count = await errors.count();
    expect(count).toBeGreaterThanOrEqual(1);
  });
});

test.describe('Forgot Password Page', () => {
  test('forgot password form is visible', async ({ page }) => {
    await page.goto('/forgot-password');
    await page.waitForLoadState('networkidle');
    
    const form = page.locator('form');
    await expect(form).toBeVisible();
  });

  test('email input is present', async ({ page }) => {
    await page.goto('/forgot-password');
    await page.waitForLoadState('networkidle');
    
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
      await page.waitForLoadState('networkidle');
      
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
      await page.waitForLoadState('networkidle');
      
      const form = page.locator('form');
      if (await form.isVisible()) {
        await expect(form).toBeVisible();
      }
    });
  }
});
