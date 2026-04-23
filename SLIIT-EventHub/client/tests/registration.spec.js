import { test, expect } from '@playwright/test';

test.describe('Authentication: Registration', () => {
  const testEmail = `testuser${Date.now()}${Math.floor(Math.random() * 1000)}@example.com`;
  const testPassword = 'Password123!';

  test('should register a new user successfully', async ({ page }) => {
    // Navigate to signup page
    await page.goto('/signup');

    // Fill in the form
    await page.getByLabel('First Name').fill('Test');
    await page.getByLabel('Last Name').fill('User');
    await page.getByLabel('Email Address').fill(testEmail);
    await page.getByLabel('Password', { exact: false }).first().fill(testPassword);
    await page.getByLabel('Confirm Password').fill(testPassword);
    
    // Check Terms and Conditions
    await page.locator('#acceptTerms').check();

    // Click register button
    await page.getByRole('button', { name: 'Create Account' }).click();

    // Should redirect to home
    await expect(page).toHaveURL('/home');
    
    // Check if user is logged in (could check for a logout button or user profile)
    // For now, let's just wait for the URL change.
  });

  test('should show error for existing email', async ({ page }) => {
    // This assumes the backend returns an error for duplicate emails
    await page.goto('/signup');

    await page.getByLabel('First Name').fill('Duplicate');
    await page.getByLabel('Last Name').fill('User');
    await page.getByLabel('Email Address').fill(testEmail); // Use the email we just registered
    await page.getByLabel('Password', { exact: false }).first().fill('Password123!');
    await page.getByLabel('Confirm Password').fill('Password123!');
    await page.locator('#acceptTerms').check();

    await page.getByRole('button', { name: 'Create Account' }).click();

    // Check for error message
    await expect(page.getByText('An account with this email already exists.')).toBeVisible();
  });
});
