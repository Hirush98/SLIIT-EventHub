import { test, expect } from '@playwright/test';

test.describe('Event Feedback Management', () => {
  let eventId;
  const eventTitle = `Feedback Test Event ${Date.now()}`;
  const adminEmail = 'testuser1@gmail.com';
  const adminPassword = 'Test@1234';

  // We need to run these tests sequentially
  test.describe.configure({ mode: 'serial' });

  test('Organiser: Create event and enable feedback', async ({ page }) => {
    // 1. Login as Admin/Organiser
    await page.goto('/signin');
    await page.getByLabel('Email Address').fill(adminEmail);
    await page.getByLabel('Password').fill(adminPassword);
    await page.getByRole('button', { name: 'Sign In' }).click();
    
    // Check for login success
    await expect(page).toHaveURL('/home', { timeout: 15000 });

    // 2. Go to Create Event
    await page.goto('/events/create');
    
    // 3. Fill Event Form
    await page.getByLabel('Event Title').fill(eventTitle);
    await page.locator('#description').fill('This is a test event for feedback functionality automation. It needs to be long enough to pass validation.');
    await page.locator('#category').selectOption('Workshop');
    
    // Use a date in the future
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateStr = tomorrow.toISOString().split('T')[0];
    await page.locator('#eventDate').fill(dateStr);
    
    await page.locator('#startTime').fill('09:00');
    await page.locator('#duration').selectOption('2');
    await page.getByLabel('Venue').fill('Virtual Room 101');
    await page.getByLabel('Capacity (10 – 500)').fill('50');

    // Submit
    await page.getByRole('button', { name: 'Submit Event for Approval' }).click();

    // 4. Wait for redirection to detail page
    await expect(page).toHaveURL(/\/events\/[a-f\d]{24}$/, { timeout: 20000 });
    const url = page.url();
    eventId = url.split('/').pop();

    // Diagnostic: Check user role and event status
    const userRole = await page.evaluate(() => JSON.parse(localStorage.getItem('eh_user'))?.role);
    const statusText = await page.locator('span.capitalize').nth(1).innerText(); 
    console.log(`Event ID: ${eventId}, Status: ${statusText}, User Role: ${userRole}`);

    // 5. Approve if pending
    if (statusText.toLowerCase() === 'pending') {
        const approveBtn = page.getByRole('button', { name: '✓ Approve Event' });
        await expect(approveBtn).toBeVisible({ timeout: 10000 });
        await approveBtn.click();
        
        // Wait for status to change
        await expect(page.locator('span.capitalize').nth(1)).toHaveText(/approved/i, { timeout: 10000 });
        console.log('Event approved successfully.');
        await page.reload();
    }

    // 6. Start Feedback
    await expect(page.getByText(/Feedback Access/i)).toBeVisible({ timeout: 15000 });
    
    const startBtn = page.getByRole('button').filter({ hasText: /^Start$/i }).first();
    await expect(startBtn).toBeVisible({ timeout: 10000 });
    await startBtn.click();
    
    // Verify it changed to 'Stop'
    await expect(page.getByText(/Stop/i)).toBeVisible({ timeout: 15000 });
    await expect(page.getByText(/Receiving Feedback/i)).toBeVisible({ timeout: 15000 });
  });



  test('Participant: Submit feedback', async ({ page }) => {
    if (!eventId) test.skip();
    
    // 1. Participant must be logged in to submit feedback
    const participantEmail = `participant${Date.now()}@example.com`;
    const password = 'Password123!';

    await page.goto('/signup');
    await page.getByLabel('First Name').fill('Parti');
    await page.getByLabel('Last Name').fill('Cipant');
    await page.getByLabel('Email Address').fill(participantEmail);
    await page.getByLabel('Password', { exact: false }).first().fill(password);
    await page.getByLabel('Confirm Password').fill(password);
    await page.locator('#acceptTerms').check();
    await page.getByRole('button', { name: 'Create Account' }).click();
    await expect(page).toHaveURL('/home', { timeout: 15000 });

    // 2. Go to feedback page
    await page.goto(`/feedback/${eventId}`);

    // Verify event title is correct
    await expect(page.getByRole('heading', { name: eventTitle })).toBeVisible({ timeout: 15000 });

    // 3. Fill feedback
    // Wait for stars to be visible (indicates form is ready)
    const stars = page.locator('button.transition-all.duration-200');
    await expect(stars.first()).toBeVisible({ timeout: 15000 });
    await stars.nth(3).click(); // 4 stars
    
    await page.locator('textarea').fill('Great workshop! Really enjoyed the hands-on session.');
    
    await page.getByRole('button', { name: 'Send Feedback' }).click();

    // Verify success
    await expect(page.getByText('Feedback Received!')).toBeVisible();
  });


  test('Organiser: Verify feedback received', async ({ page }) => {
    if (!eventId) test.skip();

    // Login as Admin
    await page.goto('/signin');
    await page.getByLabel('Email Address').fill(adminEmail);
    await page.getByLabel('Password').fill(adminPassword);
    await page.getByRole('button', { name: 'Sign In' }).click();
    
    // WAIT for login to complete
    await expect(page).toHaveURL('/home', { timeout: 15000 });

    await page.goto(`/events/${eventId}/feedback`);


    // Diagnostic: Log body if fails
    try {
        await expect(page.getByText(/Great workshop!/i)).toBeVisible({ timeout: 15000 });
        console.log('Found feedback comment successfully.');
    } catch (e) {
        const body = await page.evaluate(() => document.body.innerText);
        console.log('Feedback Page Text:', body);
        throw e;
    }
    
    // Verify summary exists
    await expect(page.getByText(/Summary/i)).toBeVisible({ timeout: 15000 });
  });


});

