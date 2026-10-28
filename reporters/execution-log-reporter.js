const fs = require('fs');
const path = require('path');

class ExecutionLogReporter {
  onBegin(config, suite) {
    const logDirectory = path.resolve('execution-logs');
    fs.mkdirSync(logDirectory, { recursive: true });

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    this.logFile = path.join(logDirectory, `playwright-${timestamp}-${process.pid}.log`);
    this.write(`RUN STARTED: ${suite.allTests().length} test(s)`);
    this.write(`WORKERS: ${config.workers}`);
    console.log(`Execution log: ${this.logFile}`);
  }

  onTestBegin(test) {
    this.write(`TEST STARTED: ${test.titlePath().filter(Boolean).join(' > ')}`);
    this.write(`SPEC: ${path.basename(test.location.file)}:${test.location.line}`);
  }

  onStdOut(chunk, test) {
    this.writeOutput('STDOUT', chunk, test);
  }

  onStdErr(chunk, test) {
    this.writeOutput('STDERR', chunk, test);
  }

  onTestEnd(test, result) {
    this.write(
      `TEST ${result.status.toUpperCase()}: ${test.titlePath().filter(Boolean).join(' > ')} ` +
        `(duration: ${result.duration}ms, retry: ${result.retry})`
    );

    if (result.error) {
      this.write(`ERROR: ${result.error.message}`);
      if (result.error.stack) {
        this.write(result.error.stack);
      }
    }
  }

  onEnd(result) {
    this.write(`RUN FINISHED: ${result.status.toUpperCase()}`);
  }

  writeOutput(label, chunk, test) {
    const testName = test ? test.titlePath().filter(Boolean).join(' > ') : 'runner';
    for (const line of String(chunk).split(/\r?\n/)) {
      if (line) {
        this.write(`${label} [${testName}]: ${line}`);
      }
    }
  }

  write(message) {
    fs.appendFileSync(this.logFile, `${new Date().toISOString()} ${message}\n`, 'utf8');
  }
}

module.exports = ExecutionLogReporter;
