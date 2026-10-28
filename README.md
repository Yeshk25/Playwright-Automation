# Playwright Automation Framework

For a beginner, start with [FRAMEWORK-GUIDE.md](./FRAMEWORK-GUIDE.md). It
explains the two SecureBank programs, every source and output folder, basic
JavaScript, how the runner works, and how to read the Allure report.

## Project folders

- `tests/` contains separate Playwright test cases for login, profile, and
  notifications functionality.
- `pages/` contains the page objects: `BankLoginPage.js` handles shared login,
  `ProfilePage.js` handles profile editing, and `NotificationsPage.js` handles
  notification actions and logout. Page objects keep selectors, page actions,
  and reusable business functions separate from individual test cases.
- `test-data/` contains demo user credentials and environment-specific defaults,
  expected messages, and profile values used by tests and page objects.
- `playwright.config.js` is the central runner configuration. The default
  test run selects Chromium. Firefox and WebKit are available through explicit
  optional commands.
- `execution-evidence/Run_<timestamp>_<run-id>/<scenario>/` stores separate
  full-page execution and failed-step screenshots for every run. Each image has
  a tiny capture date/time and run-ID stamp. Evidence is retained across runs
  and attached to Allure.
- `helpers/test.js` captures and attaches non-overwriting screenshots for
  complete test executions; `helpers/runStepWithFailureScreenshot.js` captures
  separate step-level failure evidence; `helpers/authenticateBankUser.js`
  shares login setup.
- `execution-logs/` is created by Playwright and stores a timestamped `.log` file
  for every test run. It records test start/end, status, duration, console output,
  and errors.
- `allure-results/` stores raw Allure test results; `allure-report/` is generated
  HTML output.
- `utilities/test-case-results.xlsx` is refreshed automatically after a test
  run with each case's status, browser, duration, retry, and failure message.

## Allure in VS Code

This workspace recommends the official Allure VS Code extension
(`qameta.allure-vscode`). When prompted by VS Code, select **Install** to use
the extension to generate and serve Allure reports from the Explorer.

The project already includes the Allure Playwright reporter and a local Allure
CLI. Run `npm run test:allure` to generate fresh results and an HTML report, or
use `npm run open:allure` to generate and open it in your browser. The extension
also supports generating reports from the Explorer; that feature requires the
Allure CLI to be available system-wide.

## Run the test

```bash
npm install
npm run test:securebank
```

The test uses the demo credentials by default. Override them with
`SECUREBANK_USERNAME` and `SECUREBANK_PASSWORD` environment variables. Set
`BASE_URL` to run against another environment.

Run only one browser when needed:

```bash
npm run test:chromium
npm run test:firefox
npm run test:webkit
npm run test:profile
npm run test:securebank
```

Chromium is the default for `npm test`, scenario commands, and
`npm run test:allure`. Firefox and WebKit are not run unless explicitly
selected. To run the combined banking scenarios in another browser, use
`npm run test:allure:firefox` or `npm run test:allure:webkit`. Use
`npm run test:allure:all-browsers` when you intentionally want all three.

Each of these npm test commands regenerates `allure-report/` after the run,
including when a test fails. Each functionality is a separate test case;
actions and assertions appear as individual Allure steps with their own pass or
fail status. A failure screenshot with a descriptive name is attached within
the corresponding failed step. Generate the report without opening a browser:

```bash
npm run report:allure
```

To regenerate the report and open it automatically in the browser, run:

```bash
npm run open:allure
```

`npm run serve:allure` opens the already generated report without regenerating it.

Install the Playwright-managed browser binaries after installing dependencies:

```bash
npx playwright install
```

Run the two headed scenarios separately:

```bash
npm run test:profile -- --headed
npm run test:securebank -- --headed
```

Run both together in a single Playwright invocation if preferred:

```bash
npm test -- tests/Profile_icon.spec.js tests/SecureBank_Notification.spec.js --headed
```

## Run tests and refresh the Allure report

All Playwright test invocations automatically remove the previous
`allure-results/` and `allure-report/` at startup. Use the combined command below
to run both scenarios and generate one fresh report containing both results:

```bash
npm run test:allure
```

This runs the Profile, login, and SecureBank notification test cases in
Chromium. The combined runner preserves the results between its invocations,
then generates the report. To only regenerate the HTML without opening it, use:

```bash
npm run report:allure
```

Execution logs are created automatically during every Playwright run, including
when running an individual spec. Find them in `execution-logs/`; each run writes
a separate file named with its start timestamp.

`npm run open:allure` regenerates the HTML report and opens it in the browser.
`npm run serve:allure` only opens the report that was generated by a previous
test or report command.

Each test command creates a fresh report and clears the previous run's results.
Use `npm run test:allure` to run all framework scenarios and include their
individual cases in one report.

The Allure command-line tool runs on Node.js and does not require Java. The
Playwright HTML report is also available with `npm run report`.
