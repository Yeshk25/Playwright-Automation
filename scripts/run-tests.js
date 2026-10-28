const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const projectRoot = path.resolve(__dirname, '..');
const executionFolder =
  process.env.PLAYWRIGHT_EXECUTION_FOLDER || require('../utilities/executionFolder');
const resultsDirectory = path.join(projectRoot, 'allure-results');
const reportDirectory = path.join(projectRoot, 'allure-report');
const playwrightCli = path.join(projectRoot, 'node_modules', 'playwright', 'cli.js');
const reportGenerator = path.join(__dirname, 'generate-allure-report.js');
const testArguments = process.argv.slice(2);
const hasProjectSelection = testArguments.some(
  (argument) => argument === '--project' || argument.startsWith('--project=')
);
const browserArguments = hasProjectSelection ? [] : ['--project=chromium'];

fs.rmSync(resultsDirectory, { recursive: true, force: true });
fs.rmSync(reportDirectory, { recursive: true, force: true });

const testRun = spawnSync(
  process.execPath,
  [playwrightCli, 'test', ...browserArguments, ...testArguments],
  {
    cwd: projectRoot,
    stdio: 'inherit',
    env: {
      ...process.env,
      PLAYWRIGHT_EXECUTION_FOLDER: executionFolder,
      PLAYWRIGHT_KEEP_ALLURE_RESULTS: 'true',
    },
  }
);

let testStatus = testRun.status === null ? 1 : testRun.status;
if (testRun.error) {
  console.error(`Could not run Playwright tests: ${testRun.error.message}`);
  testStatus = 1;
}

const reportRun = spawnSync(process.execPath, [reportGenerator], {
  cwd: projectRoot,
  stdio: 'inherit',
});

let reportStatus = reportRun.status === null ? 1 : reportRun.status;
if (reportRun.error) {
  console.error(`Could not generate the Allure report: ${reportRun.error.message}`);
  reportStatus = 1;
}

process.exit(testStatus || reportStatus);
