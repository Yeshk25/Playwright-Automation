const { expected } = require('../test-data/environment.json');

class BankLoginPage {
  constructor(page) {
    this.page = page;
    this.usernameInput = page.locator('#login-username');
    this.passwordInput = page.locator('#login-password');
    this.signInButton = page.locator('button[type="submit"]');
    this.welcomeMessage = page.getByText(expected.welcomeMessage);
  }

  async open() {
    await this.page.goto('/bank/login');
  }

  async signIn(username, password) {
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.signInButton.click();
  }
}

module.exports = { BankLoginPage };
