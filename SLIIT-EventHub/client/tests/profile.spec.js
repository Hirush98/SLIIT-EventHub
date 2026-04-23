import { test, expect } from '@playwright/test';

test.describe('Profile Management', () => {
  // Use the storage state from the setup
  test.use({ storageState: 'playwright/.auth/user.json' });

  test('should update profile information successfully', async ({ page }) => {
    await page.goto('/profile');

    // Click Edit Profile button
    await page.getByRole('button', { name: 'Edit Profile' }).click();

    // Fill in new details
    // Note: The app formats names (capitalizes first letter), so we should use lowercase and see if it capitalizes.
    const newFirstName = 'Updated';
    const newLastName = 'User';

    await page.getByLabel('First Name').fill(newFirstName);
    await page.getByLabel('Last Name').fill(newLastName);

    // Save changes
    await page.getByRole('button', { name: 'Save Changes' }).click();

    // Verify success message
    await expect(page.getByText('Profile updated successfully.')).toBeVisible();

    // Verify the names are updated in the view mode
    await expect(page.locator('h2')).toContainText(newFirstName);
    await expect(page.locator('h2')).toContainText(newLastName);
  });
});
