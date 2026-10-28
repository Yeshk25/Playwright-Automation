const fs = require('fs');
const path = require('path');
const ExcelJS = require('exceljs');

const workbookPath = path.resolve(__dirname, 'test-case-results.xlsx');
const headers = [
  'Test Case',
  'Spec File',
  'Browser',
  'Status',
  'Duration (ms)',
  'Retry',
  'Last Updated',
  'Error',
];

class ExcelResultsReporter {
  async onBegin(config, suite) {
    fs.mkdirSync(__dirname, { recursive: true });
    this.workbook = new ExcelJS.Workbook();
    this.resultsSheet = this.workbook.addWorksheet('Test Results');
    this.resultsSheet.addRow(headers);
    this.resultsSheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    this.resultsSheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF1F4E78' },
    };
    this.resultsSheet.views = [{ state: 'frozen', ySplit: 1 }];
    this.resultsSheet.columns = [
      { width: 55 },
      { width: 34 },
      { width: 14 },
      { width: 14 },
      { width: 16 },
      { width: 10 },
      { width: 24 },
      { width: 80 },
    ];

    if (
      process.env.PLAYWRIGHT_KEEP_EXCEL_RESULTS === 'true' &&
      fs.existsSync(workbookPath)
    ) {
      await this.workbook.xlsx.readFile(workbookPath);
      this.resultsSheet = this.workbook.getWorksheet('Test Results');
      if (!this.resultsSheet) {
        throw new Error(`The Excel workbook is missing its "Test Results" sheet: ${workbookPath}`);
      }
    }

    this.rowByKey = new Map();
    for (let rowNumber = 2; rowNumber <= this.resultsSheet.rowCount; rowNumber += 1) {
      const row = this.resultsSheet.getRow(rowNumber);
      const key = `${row.getCell(2).value}|${row.getCell(3).value}|${row.getCell(1).value}`;
      this.rowByKey.set(key, rowNumber);
    }

    for (const test of suite.allTests()) {
      const testCase = test.titlePath().filter(Boolean).join(' > ');
      const specFile = path.basename(test.location.file);
      const browser = test.parent.project()?.name || 'default';
      const key = `${specFile}|${browser}|${testCase}`;
      if (!this.rowByKey.has(key)) {
        const row = this.resultsSheet.addRow([
          testCase,
          specFile,
          browser,
          'Not Run',
          '',
          '',
          new Date().toLocaleString(),
          '',
        ]);
        this.rowByKey.set(key, row.number);
      }
    }

    this.resultsSheet.views = [{ state: 'frozen', ySplit: 1 }];
  }

  onTestEnd(test, result) {
    const testCase = test.titlePath().filter(Boolean).join(' > ');
    const specFile = path.basename(test.location.file);
    const browser = test.parent.project()?.name || 'default';
    const key = `${specFile}|${browser}|${testCase}`;
    const rowNumber = this.rowByKey.get(key);

    if (!rowNumber) {
      throw new Error(`Could not find the Excel result row for test "${testCase}".`);
    }

    const row = this.resultsSheet.getRow(rowNumber);
    const errorMessage = result.error?.message || '';
    const displayStatus = {
      passed: 'PASS',
      failed: 'FAIL',
      timedOut: 'FAIL',
      skipped: 'SKIPPED',
      interrupted: 'INTERRUPTED',
    }[result.status] || result.status.toUpperCase();
    row.getCell(4).value = displayStatus;
    row.getCell(5).value = result.duration;
    row.getCell(6).value = result.retry;
    row.getCell(7).value = new Date().toLocaleString();
    row.getCell(8).value = errorMessage;
    row.getCell(8).alignment = { wrapText: true, vertical: 'top' };

    const statusColor = {
      PASS: 'FFC6EFCE',
      FAIL: 'FFFFC7CE',
      SKIPPED: 'FFFFEB9C',
      INTERRUPTED: 'FFFFEB9C',
    }[displayStatus];

    if (statusColor) {
      row.getCell(4).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: statusColor },
      };
    }
  }

  async onEnd(result) {
    this.resultsSheet.autoFilter = {
      from: 'A1',
      to: `H${this.resultsSheet.rowCount}`,
    };

    const summarySheet = this.workbook.getWorksheet('Summary') || this.workbook.addWorksheet('Summary');
    summarySheet.spliceRows(1, summarySheet.rowCount);
    summarySheet.addRow(['Playwright Test Results']);
    summarySheet.getRow(1).font = { bold: true, size: 16 };
    summarySheet.addRow(['Report updated', new Date().toLocaleString()]);
    summarySheet.addRow(['Overall run status', result.status]);
    summarySheet.addRow([]);
    summarySheet.addRow(['Test status', 'Count']);

    const counts = new Map([
      ['PASS', 0],
      ['FAIL', 0],
      ['SKIPPED', 0],
      ['INTERRUPTED', 0],
      ['Not Run', 0],
    ]);

    for (let rowNumber = 2; rowNumber <= this.resultsSheet.rowCount; rowNumber += 1) {
      const status = this.resultsSheet.getRow(rowNumber).getCell(4).value;
      counts.set(status, (counts.get(status) || 0) + 1);
    }

    for (const [status, count] of counts) {
      summarySheet.addRow([status, count]);
    }

    summarySheet.getColumn(1).width = 24;
    summarySheet.getColumn(2).width = 28;
    summarySheet.getRow(5).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    summarySheet.getRow(5).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF1F4E78' },
    };
    await this.workbook.xlsx.writeFile(workbookPath);
    console.log(`Excel test results: ${workbookPath}`);
  }
}

module.exports = ExcelResultsReporter;
