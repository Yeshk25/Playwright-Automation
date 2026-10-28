const { test, expect } = require('../helpers/test');
const { ProfilePage } = require('../pages/ProfilePage');
const { authenticateBankUser } = require('../helpers/authenticateBankUser');
const { runStepWithFailureScreenshot } = require('../helpers/runStepWithFailureScreenshot');
const environment = require('../test-data/environment.json');

test.describe('Profile functionality', () => {
  test('Profile - Open profile page', async ({ page }, testInfo) => {
    test.setTimeout(60_000);
    await authenticateBankUser(page, testInfo, 'Profile');
    const profilePage = new ProfilePage(page);

    await runStepWithFailureScreenshot(
      page,
      testInfo,
      'Profile',
      'Open the profile page',
      async () => {
        await profilePage.open();
        await expect(profilePage.editButton).toBeVisible();
      }
    );
  });

  test('Profile - Update first name', async ({ page }, testInfo) => {
    test.setTimeout(60_000);
    await authenticateBankUser(page, testInfo, 'Profile');
    const profilePage = new ProfilePage(page);
    const updatedFirstName = environment.profile.updatedFirstName;

    await runStepWithFailureScreenshot(
      page,
      testInfo,
      'Profile',
      'Open the profile page',
      async () => {
        await profilePage.open();
        await expect(profilePage.editButton).toBeVisible();
      }
    );

    await runStepWithFailureScreenshot(
      page,
      testInfo,
      'Profile',
      'Edit the first name',
      async () => {
        await profilePage.editFirstName(updatedFirstName);
        await expect(profilePage.firstNameInput).toHaveValue(updatedFirstName);
      }
    );

    await runStepWithFailureScreenshot(
      page,
      testInfo,
      'Profile',
      'Save and verify the updated first name',
      async () => {
        await profilePage.saveChanges();
        await expect(profilePage.successMessage).toBeVisible();
        await expect(page.getByText(updatedFirstName, { exact: true })).toBeVisible();
      }
    );
  });
});
