const executionFolder = require('./executionFolder');

function formatTimestamp(date) {
  const datePart = [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0'),
  ].join('-');
  const timePart = [
    String(date.getHours()).padStart(2, '0'),
    String(date.getMinutes()).padStart(2, '0'),
    String(date.getSeconds()).padStart(2, '0'),
  ].join(':');

  return `${datePart} ${timePart}`;
}

async function captureEvidenceScreenshot(page, options) {
  const runId = process.env.PLAYWRIGHT_EXECUTION_FOLDER || executionFolder;
  const timestamp = formatTimestamp(new Date());
  const stamp = await page.evaluateHandle(
    ({ text }) => {
      const element = document.createElement('div');
      element.textContent = text;
      Object.assign(element.style, {
        position: 'fixed',
        right: '2px',
        bottom: '2px',
        zIndex: '2147483647',
        padding: '1px 2px',
        color: '#ffffff',
        backgroundColor: 'rgba(0, 0, 0, 0.55)',
        font: '6px/1.2 Arial, sans-serif',
        whiteSpace: 'nowrap',
        pointerEvents: 'none',
      });
      document.documentElement.appendChild(element);
      return element;
    },
    { text: `${timestamp} | ${runId}` }
  );

  try {
    return await page.screenshot(options);
  } finally {
    try {
      await stamp.evaluate((element) => element.remove());
    } finally {
      await stamp.dispose();
    }
  }
}

module.exports = { captureEvidenceScreenshot };
