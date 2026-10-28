const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { test } = require('@playwright/test');
const { getEvidencePath } = require('../utilities/evidencePaths');
const { captureEvidenceScreenshot } = require('../utilities/captureEvidenceScreenshot');

function safeName(value) {
  return value
    .replace(/[^a-z0-9]+/gi, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase();
}

async function runStepWithFailureScreenshot(page, testInfo, scenario, stepName, action) {
  await test.step(stepName, async () => {
    try {
      await action();
    } catch (stepError) {
      if (page.isClosed()) {
        console.error(`Could not capture failure screenshot for "${stepName}": the page is closed.`);
        throw stepError;
      }

      const project = testInfo.project.name || 'default';
      const executionId = `${new Date().toISOString().replace(/[:.]/g, '-')}-${process.pid}-${crypto
        .randomBytes(6)
        .toString('hex')}`;
      const screenshotName = [
        safeName(testInfo.title),
        safeName(stepName),
        safeName(project),
        `retry-${testInfo.retry}`,
        executionId,
        'failed.png',
      ].join('-');
      const screenshotPath = getEvidencePath(scenario, 'failures', screenshotName);

      try {
        fs.mkdirSync(path.dirname(screenshotPath), { recursive: true });
        const screenshot = await captureEvidenceScreenshot(page, {
          path: screenshotPath,
          fullPage: true,
        });
        await testInfo.attach(screenshotName, {
          body: screenshot,
          contentType: 'image/png',
        });
      } catch (screenshotError) {
        console.error(
          `Could not capture or attach failure screenshot "${screenshotName}": ${screenshotError.message}`
        );
      }

      throw stepError;
    }
  });
}

module.exports = { runStepWithFailureScreenshot };
