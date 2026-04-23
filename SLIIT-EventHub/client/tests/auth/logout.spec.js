import { test, expect } from '@playwright/test';

test.describe('Authentication: Logout', () => {
  // Use the storage state from the setup
  test.use({ storageState: 'playwright/.auth/user.json' });

  test('should logout successfully', async ({ page }) => {
    await page.goto('/home');

    // Click on profile dropdown
    await page.getByRole('button', { name: /Setup User/i }).click();

    // Wait for the dropdown and click Sign Out
    const signOutBtn = page.getByRole('button', { name: 'Sign Out' });
    await expect(signOutBtn).toBeVisible();
    await signOutBtn.click();

    // Verify localStorage is cleared
    await expect.poll(async () => {
      return await page.evaluate(() => localStorage.getItem('eh_token'));
    }).toBeNull();

    // Should redirect to signin
    await expect(page).toHaveURL('/signin');

    // Trying to go home should redirect back to signin
    await page.goto('/home');
    await expect(page).toHaveURL('/signin');
  });
});
