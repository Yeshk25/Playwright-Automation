const { test, expect } = require('../helpers/test');
const { BankLoginPage } = require('../pages/BankLoginPage');
const { runStepWithFailureScreenshot } = require('../helpers/runStepWithFailureScreenshot');
const users = require('../test-data/users.json');

test('SecureBank - Sign in with valid credentials', async ({ page }, testInfo) => {
  const loginPage = new BankLoginPage(page);
  const username = process.env.SECUREBANK_USERNAME || users.secureBank.username;
  const password = process.env.SECUREBANK_PASSWORD || users.secureBank.password;

  await runStepWithFailureScreenshot(
    page,
    testInfo,
    'Login',
    'Authenticate and verify the dashboard',
    async () => {
      await loginPage.open();
      await loginPage.signIn(username, password);
      await expect(loginPage.welcomeMessage).toBeVisible();
    }
  );
});
