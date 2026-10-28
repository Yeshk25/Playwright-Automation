const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { test: base, expect } = require('@playwright/test');
const { getEvidencePath } = require('../utilities/evidencePaths');
const { captureEvidenceScreenshot } = require('../utilities/captureEvidenceScreenshot');

const scenarioBySpec = {
  'login.spec.js': 'Login',
  'Profile_icon.spec.js': 'Profile',
  'SecureBank_Notification.spec.js': 'Notifications',
  'example.spec.js': 'Playwright_Sample',
};

function safeName(value) {
  return value
    .replace(/[^a-z0-9]+/gi, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase();
}

function executionId() {
  return `${new Date().toISOString().replace(/[:.]/g, '-')}-${process.pid}-${crypto
    .randomBytes(6)
    .toString('hex')}`;
}

const test = base.extend({
  page: async ({ page }, use, testInfo) => {
    await use(page);

    const specFile = path.basename(testInfo.file);
    const scenario = scenarioBySpec[specFile] || safeName(path.basename(specFile, '.spec.js'));
    const screenshotName = [
      safeName(testInfo.title),
      safeName(testInfo.project.name || 'default'),
      `retry-${testInfo.retry}`,
      executionId(),
      'execution.png',
    ].join('-');
    const screenshotPath = getEvidencePath(scenario, 'executions', screenshotName);

    try {
      if (page.isClosed()) {
        throw new Error('The browser page was closed before execution evidence could be captured.');
      }

      fs.mkdirSync(path.dirname(screenshotPath), { recursive: true });
      await captureEvidenceScreenshot(page, { path: screenshotPath, fullPage: true });
      await testInfo.attach(screenshotName, {
        path: screenshotPath,
        contentType: 'image/png',
      });
      console.log(`Execution screenshot: ${screenshotPath}`);
    } catch (error) {
      const message = `Could not capture execution screenshot for "${testInfo.title}": ${error.message}`;
      console.error(message);

      if (testInfo.status === 'passed') {
        throw new Error(message, { cause: error });
      }
    }
  },
});

module.exports = { test, expect };
