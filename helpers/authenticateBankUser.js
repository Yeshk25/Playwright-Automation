const { BankLoginPage } = require('../pages/BankLoginPage');
const users = require('../test-data/users.json');
const { runStepWithFailureScreenshot } = require('./runStepWithFailureScreenshot');

async function authenticateBankUser(page, testInfo, scenario) {
  const loginPage = new BankLoginPage(page);
  const username = process.env.SECUREBANK_USERNAME || users.secureBank.username;
  const password = process.env.SECUREBANK_PASSWORD || users.secureBank.password;

  await runStepWithFailureScreenshot(
    page,
    testInfo,
    scenario,
    'Sign in to SecureBank',
    async () => {
      await loginPage.open();
      await loginPage.signIn(username, password);
      await loginPage.welcomeMessage.waitFor({ state: 'visible' });
    }
  );

  return loginPage;
}

module.exports = { authenticateBankUser };
