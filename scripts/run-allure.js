const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const projectRoot = path.resolve(__dirname, '..');
const executionFolder =
  process.env.PLAYWRIGHT_EXECUTION_FOLDER || require('../utilities/executionFolder');
const resultsDirectory = path.join(projectRoot, 'allure-results');
const reportDirectory = path.join(projectRoot, 'allure-report');
const excelResults = path.join(projectRoot, 'utilities', 'test-case-results.xlsx');
const playwrightCli = path.join(projectRoot, 'node_modules', 'playwright', 'cli.js');
const runArguments = process.argv.slice(2);
const requestedProjectArguments = runArguments.flatMap((argument, index) => {
  if (argument === '--project') {
    return [argument, runArguments[index + 1]].filter(Boolean);
  }
  return argument.startsWith('--project=') ? [argument] : [];
});
const projectArguments =
  requestedProjectArguments.length > 0 ? requestedProjectArguments : ['--project=chromium'];

fs.rmSync(resultsDirectory, { recursive: true, force: true });
fs.rmSync(reportDirectory, { recursive: true, force: true });
fs.rmSync(excelResults, { force: true });

function run(command, args) {
  const result = spawnSync(command, args, {
    cwd: projectRoot,
    stdio: 'inherit',
    env: {
      ...process.env,
      PLAYWRIGHT_EXECUTION_FOLDER: executionFolder,
      PLAYWRIGHT_KEEP_ALLURE_RESULTS: 'true',
      PLAYWRIGHT_KEEP_EXCEL_RESULTS: 'true',
    },
  });

  if (result.error) {
    console.error(`Could not run ${args.join(' ')}: ${result.error.message}`);
    return 1;
  }

  return result.status === null ? 1 : result.status;
}

const profileStatus = run(process.execPath, [
  playwrightCli,
  'test',
  'tests/Profile_icon.spec.js',
  '--headed',
  ...projectArguments,
]);
const loginStatus = run(process.execPath, [
  playwrightCli,
  'test',
  'tests/login.spec.js',
  ...projectArguments,
]);
const notificationsStatus = run(process.execPath, [
  playwrightCli,
  'test',
  'tests/SecureBank_Notification.spec.js',
  ...projectArguments,
]);
const reportStatus = run(process.execPath, [
  path.join(__dirname, 'generate-allure-report.js'),
]);

if (profileStatus !== 0 || loginStatus !== 0 || notificationsStatus !== 0) {
  process.exit(1);
}

process.exit(reportStatus);
