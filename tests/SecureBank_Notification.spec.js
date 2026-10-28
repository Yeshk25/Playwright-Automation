const { test, expect } = require('../helpers/test');
const { NotificationsPage } = require('../pages/NotificationsPage');
const { authenticateBankUser } = require('../helpers/authenticateBankUser');
const { runStepWithFailureScreenshot } = require('../helpers/runStepWithFailureScreenshot');

test.describe('Notification functionality', () => {
  test('Notifications - Open notifications page', async ({ page }, testInfo) => {
    test.setTimeout(60_000);
    await authenticateBankUser(page, testInfo, 'Notifications');
    const notificationsPage = new NotificationsPage(page);

    await runStepWithFailureScreenshot(
      page,
      testInfo,
      'Notifications',
      'Open the notifications page',
      async () => {
        await notificationsPage.open();
        await expect(notificationsPage.title).toBeVisible();
      }
    );
  });

  test('Notifications - Validate unread notification count', async ({ page }, testInfo) => {
    test.setTimeout(60_000);
    await authenticateBankUser(page, testInfo, 'Notifications');
    const notificationsPage = new NotificationsPage(page);

    await runStepWithFailureScreenshot(
      page,
      testInfo,
      'Notifications',
      'Open the notifications page',
      async () => {
        await notificationsPage.open();
        await expect(notificationsPage.title).toBeVisible();
      }
    );

    await runStepWithFailureScreenshot(
      page,
      testInfo,
      'Notifications',
      'Verify the unread notification count',
      async () => {
        const unreadCount = await notificationsPage.getUnreadCount();
        const actualUnreadCount = await notificationsPage.unreadNotifications.count();
        expect(unreadCount).toBeGreaterThan(0);
        expect(actualUnreadCount).toBe(unreadCount);
      }
    );
  });

  test('Notifications - Mark all notifications as read', async ({ page }, testInfo) => {
    test.setTimeout(60_000);
    await authenticateBankUser(page, testInfo, 'Notifications');
    const notificationsPage = new NotificationsPage(page);

    await runStepWithFailureScreenshot(
      page,
      testInfo,
      'Notifications',
      'Open the notifications page',
      async () => {
        await notificationsPage.open();
        await expect(notificationsPage.title).toBeVisible();
      }
    );

    await runStepWithFailureScreenshot(
      page,
      testInfo,
      'Notifications',
      'Mark notifications as read and verify the result',
      async () => {
        await notificationsPage.markAllAsRead();
        await expect(notificationsPage.allCaughtUpMessage).toBeVisible();
        await expect(notificationsPage.unreadMessage).toHaveCount(0);
      }
    );
  });

  test('Notifications - Log out of SecureBank', async ({ page }, testInfo) => {
    test.setTimeout(60_000);
    const loginPage = await authenticateBankUser(page, testInfo, 'Notifications');
    const notificationsPage = new NotificationsPage(page);

    await runStepWithFailureScreenshot(
      page,
      testInfo,
      'Notifications',
      'Log out and verify the sign-in page',
      async () => {
        await notificationsPage.logout();
        await expect(notificationsPage.signInButton).toBeVisible();
        await expect(loginPage.usernameInput).toBeVisible();
      }
    );
  });
});
