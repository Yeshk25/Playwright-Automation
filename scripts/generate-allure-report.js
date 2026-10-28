const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const projectRoot = path.resolve(__dirname, '..');
const reportDirectory = path.join(projectRoot, 'allure-report');
const resultsDirectory = path.join(projectRoot, 'allure-results');
const logDirectory = path.join(projectRoot, 'execution-logs');
const allureCli = path.join(projectRoot, 'node_modules', 'allure', 'cli.js');
const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
const logFile = path.join(logDirectory, `allure-report-${timestamp}-${process.pid}.log`);

fs.mkdirSync(logDirectory, { recursive: true });

function log(message) {
  fs.appendFileSync(logFile, `${new Date().toISOString()} ${message}\n`, 'utf8');
}

function logOutput(label, output) {
  if (!output) {
    return;
  }

  for (const line of output.toString().split(/\r?\n/)) {
    if (line) {
      log(`${label}: ${line}`);
    }
  }
}

log('ALLURE REPORT GENERATION STARTED');
log(`RESULTS DIRECTORY: ${resultsDirectory}`);
log(`REPORT DIRECTORY: ${reportDirectory}`);
const resultFiles = fs.existsSync(resultsDirectory)
  ? fs.readdirSync(resultsDirectory).filter((file) => file.endsWith('-result.json'))
  : [];
log(`TEST RESULT FILE COUNT: ${resultFiles.length}`);
console.log(`Allure report log: ${logFile}`);

if (resultFiles.length === 0) {
  const message = 'No Allure test results found. Run the tests before generating the report.';
  log(`ERROR: ${message}`);
  console.error(message);
  process.exit(1);
}

let exitCode = 1;

try {
  fs.rmSync(reportDirectory, { recursive: true, force: true });

  const result = spawnSync(
    process.execPath,
    [allureCli, 'allure2', './allure-results', '--output', './allure-report'],
    { cwd: projectRoot, encoding: 'utf8' }
  );

  if (result.stdout) {
    process.stdout.write(result.stdout);
  }
  if (result.stderr) {
    process.stderr.write(result.stderr);
  }
  logOutput('STDOUT', result.stdout);
  logOutput('STDERR', result.stderr);

  if (result.error) {
    log(`ERROR: ${result.error.message}`);
    console.error(`Could not generate the Allure report: ${result.error.message}`);
  } else {
    exitCode = result.status === null ? 1 : result.status;
    if (exitCode === 0) {
      const summaryPath = path.join(reportDirectory, 'summary.json');
      if (!fs.existsSync(summaryPath)) {
        log('ERROR: Allure CLI completed without creating summary.json.');
        console.error('Allure did not create a report summary.');
        exitCode = 1;
      } else {
        const summary = JSON.parse(fs.readFileSync(summaryPath, 'utf8'));
        if (!summary.stats || summary.stats.total === 0) {
          log('ERROR: Generated Allure report contains no tests.');
          console.error('Allure generated an empty report. Check the test result files.');
          exitCode = 1;
        }
      }
    }
  }
} catch (error) {
  log(`ERROR: ${error.message}`);
  console.error(`Could not generate the Allure report: ${error.message}`);
}

log(`ALLURE REPORT GENERATION ${exitCode === 0 ? 'SUCCEEDED' : 'FAILED'} (exit code: ${exitCode})`);
process.exit(exitCode);
