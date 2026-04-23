import { test as setup, expect } from '@playwright/test';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const authFile = path.join(__dirname, '../playwright/.auth/user.json');

setup('authenticate', async ({ page }) => {
  const testEmail = `setupuser${Date.now()}@example.com`;
  const testPassword = 'Password123!';

  // Perform registration to get a valid session
  await page.goto('/signup');
  await page.getByLabel('First Name').fill('Setup');
  await page.getByLabel('Last Name').fill('User');
  await page.getByLabel('Email Address').fill(testEmail);
  await page.getByLabel('Password', { exact: false }).first().fill(testPassword);
  await page.getByLabel('Confirm Password').fill(testPassword);
  await page.locator('#acceptTerms').check();
  await page.getByRole('button', { name: 'Create Account' }).click();

  // Wait for either navigation or an error message
  await Promise.race([
    page.waitForURL('**/home', { timeout: 10000 }),
    page.waitForSelector('div.bg-red-50', { timeout: 10000 })
  ]);

  const errorVisible = await page.locator('div.bg-red-50').isVisible();
  if (errorVisible) {
    const errorText = await page.locator('div.bg-red-50 p').innerText();
    throw new Error(`Registration failed with error: ${errorText}`);
  }

  // Double check we are on home
  await expect(page).toHaveURL('/home');

  // Save the state
  await page.context().storageState({ path: authFile });
});
