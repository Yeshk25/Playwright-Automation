const { expected } = require('../test-data/environment.json');

class NotificationsPage {
  constructor(page) {
    this.page = page;
    this.title = page.getByRole('heading', { name: expected.notificationsTitle, exact: true });
    this.unreadMessage = page.getByText(/^\d+ unread notifications?$/);
    this.unreadNotifications = page.getByLabel('Unread', { exact: true });
    this.allCaughtUpMessage = page.getByText(expected.allCaughtUpMessage, { exact: true });
    this.markAllReadButton = page.getByRole('button', { name: /mark all read/i });
    this.logoutButton = page.getByRole('button', { name: /logout/i });
    this.signInButton = page.getByRole('button', { name: 'Sign In' });
  }
  async open() {
    await this.page.getByRole('link', { name: /notifications/i }).first().click();
  }

  async markAllAsRead() {
    await this.markAllReadButton.click();
  }

  async getUnreadCount() {
    const unreadText = await this.unreadMessage.innerText();
    const unreadCountMatch = unreadText.match(/^(\d+) unread notifications?$/);

    if (!unreadCountMatch) {
      throw new Error(`Unexpected unread notification message: "${unreadText}"`);
    }

    return Number(unreadCountMatch[1]);
  }

  async logout() {
    await this.logoutButton.click();
  }
}

module.exports = { NotificationsPage };
