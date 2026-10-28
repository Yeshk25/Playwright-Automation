const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const projectRoot = path.resolve(__dirname, '..');
const resultsDirectory = path.join(projectRoot, 'allure-results');
const reportDirectory = path.join(projectRoot, 'allure-report');
const allureCli = path.join(projectRoot, 'node_modules', 'allure', 'cli.js');
const reportGenerator = path.join(__dirname, 'generate-allure-report.js');
const shouldGenerateReport = !process.argv.includes('--no-generate');
const resultFiles = fs.existsSync(resultsDirectory)
  ? fs.readdirSync(resultsDirectory).filter((file) => file.endsWith('-result.json'))
  : [];

if (resultFiles.length === 0) {
  console.error('No Allure test results found. Run `npm run test:allure` first.');
  process.exit(1);
}

if (shouldGenerateReport) {
  const generation = spawnSync(process.execPath, [reportGenerator], {
    cwd: projectRoot,
    stdio: 'inherit',
  });

  if (generation.error) {
    console.error(`Could not generate the Allure report: ${generation.error.message}`);
    process.exit(1);
  }

  if (generation.status !== 0) {
    process.exit(generation.status === null ? 1 : generation.status);
  }
}

if (!fs.existsSync(path.join(reportDirectory, 'index.html'))) {
  console.error('Allure report generation completed without creating index.html.');
  process.exit(1);
}

const result = spawnSync(
  process.execPath,
  [allureCli, 'open', reportDirectory],
  { cwd: projectRoot, stdio: 'inherit' }
);

if (result.error) {
  console.error(`Could not open the Allure report: ${result.error.message}`);
  process.exit(1);
}

process.exit(result.status === null ? 1 : result.status);
