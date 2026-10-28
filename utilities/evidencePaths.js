const path = require('path');
const executionFolder = require('./executionFolder');

const evidenceRoot = path.resolve(__dirname, '..', 'execution-evidence');

function getEvidencePath(scenario, evidenceType, screenshotName) {
  const scenarioFolder = String(scenario)
    .replace(/[^a-z0-9]+/gi, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase();

  if (!scenarioFolder) {
    throw new Error('A scenario name is required for screenshot evidence.');
  }

  if (evidenceType !== 'executions' && evidenceType !== 'failures') {
    throw new Error(`Unsupported screenshot evidence type: ${evidenceType}`);
  }

  return path.join(
    evidenceRoot,
    process.env.PLAYWRIGHT_EXECUTION_FOLDER || executionFolder,
    scenarioFolder,
    evidenceType,
    screenshotName
  );
}

module.exports = { getEvidencePath };