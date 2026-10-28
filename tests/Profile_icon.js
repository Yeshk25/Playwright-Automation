const { test, expect } = require('@playwright/test');

test('Update Profile First Name', async ({ page }) => {

   await page.goto('https://qaplayground.com/bank/login');

    await page.locator('#login-username').fill('standard_user');
  await page.locator('#login-password').fill('bank_sauce');
  await page.locator('button[type="submit"]').click();

    await page.getByText('Profile', { exact: true }).click();

    console.log('Profile page opened');

    await page.getByRole('button', { name: 'Edit' }).click();

    console.log('Edit button clicked');

    const firstName = page.getByLabel('First Name');
    await firstName.fill('Alex4');
    console.log('First Name updated from Alex3 to Alex4');

    await page.getByRole('button', { name: 'Save Changes' }).click();
    console.log('Save Changes button clicked');

    const successMessage = page.getByText(
        'Profile updated successfully.'
    );

    await expect(successMessage).toBeVisible();
    console.log('Profile saved successfully message verified');

    const actualFirstName = page.getByText('Alex4', { exact: true });
    await expect(actualFirstName).toBeVisible();

    console.log('Profile name verification passed');
    console.log('Expected First Name: Alex4');
    console.log('Actual First Name: Alex4');

    await expect(actualFirstName).toHaveText('Alex4');
    console.log('Expected and Actual First Name matched');

    await page.close();

});