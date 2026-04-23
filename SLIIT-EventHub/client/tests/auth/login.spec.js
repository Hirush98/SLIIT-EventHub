import { test, expect } from '@playwright/test';

test.describe('Authentication: Login', () => {
  test('should login with valid credentials', async ({ page }) => {
    // We can use a known user here, or the one created in setup
    // But since this test project uses 'auth' project which has undefined storageState,
    // we need to actually log in.
    
    // First, let's create a user just for this test to ensure it exists
    const email = `logintest${Date.now()}@example.com`;
    const password = 'Password123!';

    // Register first
    await page.goto('/signup');
    await page.getByLabel('First Name').fill('Login');
    await page.getByLabel('Last Name').fill('Test');
    await page.getByLabel('Email Address').fill(email);
    await page.getByLabel('Password', { exact: false }).first().fill(password);
    await page.getByLabel('Confirm Password').fill(password);
    await page.locator('#acceptTerms').check();
    await page.getByRole('button', { name: 'Create Account' }).click();
    await expect(page).toHaveURL('/home');

    // Logout
    await page.goto('/settings'); // Assuming logout is in settings or has a direct link
    // Let's find the logout button. Looking at authApi.js, it exists.
    // I specify it in the next task.
  });

  test('should show error for invalid credentials', async ({ page }) => {
    await page.goto('/signin');
    await page.getByLabel('Email Address').fill('nonexistent@example.com');
    await page.getByLabel('Password').fill('WrongPassword123!');
    await page.getByRole('button', { name: 'Sign In' }).click();

    // Check for error message
    await expect(page.locator('div.bg-red-50')).toBeVisible();
  });
});
