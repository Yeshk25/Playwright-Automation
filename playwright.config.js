const { defineConfig, devices } = require('@playwright/test');
const environment = require('./test-data/environment.json');
const executionFolder = require('./utilities/executionFolder');

if (!process.env.PLAYWRIGHT_EXECUTION_FOLDER) {
  process.env.PLAYWRIGHT_EXECUTION_FOLDER = executionFolder;
}

const availableProjects = {
  chromium: { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  firefox: { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
  webkit: { name: 'webkit', use: { ...devices['Desktop Safari'] } },
};
const projectArguments = process.argv.slice(2);
const requestedProjects = [];

for (let index = 0; index < projectArguments.length; index += 1) {
  const argument = projectArguments[index];
  if (argument.startsWith('--project=')) {
    requestedProjects.push(argument.slice('--project='.length));
  } else if (argument === '--project' && projectArguments[index + 1]) {
    requestedProjects.push(projectArguments[index + 1]);
    index += 1;
  }
}

const selectedProjects =
  requestedProjects.length === 0 || requestedProjects.includes('*')
    ? requestedProjects.includes('*')
      ? Object.keys(availableProjects)
      : ['chromium']
    : [...new Set(requestedProjects)];
const unknownProjects = selectedProjects.filter((name) => !availableProjects[name]);

if (unknownProjects.length > 0) {
  throw new Error(
    `Unknown Playwright project(s): ${unknownProjects.join(', ')}. ` +
      `Choose from ${Object.keys(availableProjects).join(', ')}.`
  );
}

module.exports = defineConfig({
  testDir: './tests',
  globalSetup: './scripts/global-setup.js',
  timeout: 30_000,
  expect: {
    timeout: 5_000,
  },
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: [
    ['list'],
    ['./reporters/execution-log-reporter.js'],
    ['./utilities/excel-results-reporter.js'],
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
    ['allure-playwright', { outputFolder: 'allure-results' }],
  ],
  use: {
    baseURL: process.env.BASE_URL || environment.baseURL,
    headless: true,
    screenshot: 'only-on-failure',
    trace: 'on-first-retry',
    video: 'retain-on-failure',
  },
  projects: selectedProjects.map((name) => availableProjects[name]),
});
