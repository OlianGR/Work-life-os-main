import { test, expect } from '@playwright/test';

test.describe('Auth Flow', () => {
  test('should show landing page and navigate to login', async ({ page }) => {
    await page.goto('/');

    // Check Landing Hero
    await expect(page.getByRole('heading', { name: 'Work Life OS' })).toBeVisible();
    await expect(page.getByText('Entrar al Sistema')).toBeVisible();

    // Click Enter
    await page.getByText('Entrar al Sistema').click();

    // Should see login form
    await expect(page.getByText('Bienvenido de nuevo')).toBeVisible();
    await expect(page.getByPlaceholder('email@ejemplo.com')).toBeVisible();
  });

  test('should show error on invalid login', async ({ page }) => {
    await page.goto('/');
    await page.getByText('Entrar al Sistema').click();

    await page.getByPlaceholder('email@ejemplo.com').fill('test@invalid.com');
    await page.getByPlaceholder('••••••••').fill('wrongpassword');
    
    // Check legal checkbox
    await page.locator('input[type="checkbox"]').check();

    await page.getByText('Entrar al Panel').click();

    // Should see error (using the regex to handle variations)
    await expect(page.getByText(/Acceso denegado/i)).toBeVisible();
  });
});

test.describe('Support Page Flow', () => {
  test('should allow entering a support message', async ({ page }) => {
    await page.goto('/apoyar-proyecto');

    const textarea = page.getByPlaceholder(/¡Gracias por las herramientas!/i);
    await expect(textarea).toBeVisible();

    await textarea.fill('Testing Playwright Message');
    
    // Verify it stays
    await expect(textarea).toHaveValue('Testing Playwright Message');
  });
});
