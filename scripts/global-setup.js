const fs = require('fs');
const path = require('path');

async function globalSetup() {
  if (process.env.PLAYWRIGHT_KEEP_ALLURE_RESULTS === 'true') {
    return;
  }

  const projectRoot = path.resolve(__dirname, '..');
  const resultsDirectory = path.join(projectRoot, 'allure-results');
  const reportDirectory = path.join(projectRoot, 'allure-report');

  fs.rmSync(resultsDirectory, { recursive: true, force: true });
  fs.rmSync(reportDirectory, { recursive: true, force: true });

  console.log('Cleared previous Allure results and report before test run.');
}

module.exports = globalSetup;
