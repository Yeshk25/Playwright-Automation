# Playwright Framework Notes: Beginner Guide

> For the full from-zero explanation of both programs, JavaScript basics,
> folders, files, commands, and reports, see [FRAMEWORK-GUIDE.md](./FRAMEWORK-GUIDE.md).

This guide explains the Playwright framework, its independent functionality
test cases, and what each important file and folder does.

## 1. What is a test automation framework?

A test automation framework is a set of tools and organized code that lets a
computer repeat user actions and check the results. In this project, Playwright
opens a browser, visits the demo banking site, clicks and fills controls, and
checks that expected messages appear.

The main functionality areas are:

1. Sign in to SecureBank.
2. Open the Profile page and update the first name.
3. Open Notifications, validate unread counts, mark notifications as read, and
   log out.

## 2. Project structure

```text
D:\PlayWrightAutomation - Copy\
├── pages\                  Page objects: page elements and reusable actions
├── tests\                  Test scenarios
├── test-data\              Demo credentials and environment-specific test data
├── scripts\                Test setup and Allure commands
├── helpers\                Login and step-level failure screenshot helpers
├── reporters\              Custom test logging
├── .github\workflows\      GitHub Actions automation
├── screenshots\            Named screenshots for failed test steps
├── execution-logs\         Timestamped Playwright and Allure logs
├── allure-results\         Raw test results read by Allure
├── allure-report\          Saved Allure HTML report
├── playwright-report\      Playwright HTML report
├── test-results\           Playwright attachments and failure artifacts
├── node_modules\            Installed JavaScript packages
├── package.json             Dependencies and runnable commands
├── package-lock.json        Exact dependency versions for repeatable installs
├── playwright.config.js     Shared Playwright configuration
├── README.md                Short project and run instructions
└── .gitignore               Generated files excluded from source control
```

Folders such as screenshots, reports, logs, and test-results are generated as
the tests run. They are output, not the main source code. `node_modules/` is
created by installing dependencies; do not edit its contents.

## 3. Essential terms

- **Browser:** The application that opens the website, such as Chromium.
- **Page:** One browser tab controlled by Playwright.
- **Test/spec:** A script that describes a user scenario and verifies outcomes.
- **Locator:** A reusable way to find a web element, such as a button or input.
- **Assertion:** A check that passes or fails based on what the page shows.
- **Fixture:** An object Playwright provides to a test. The `page` fixture is a
  ready-to-use browser tab.
- **Page Object Model (POM):** A pattern where page selectors and actions are
  kept in page classes, separate from the scenario steps.
- **Reporter:** A component that records test results, for example in the
  terminal, a log file, or an Allure report.

## 4. How a test runs

```text
Run command
   ↓
Playwright reads playwright.config.js
   ↓
global-setup.js clears previous Allure output
   ↓
The test spec runs and calls page objects
   ↓
Playwright controls the browser and checks assertions
   ↓
Screenshots, test results, and logs are saved
   ↓
Allure converts raw results into a report
```

Most browser operations are asynchronous: the browser needs time to respond.
JavaScript uses `async` on a function that performs asynchronous work and
`await` to wait for each operation to finish before continuing.

## 5. Individual functionality test cases

### `tests/Profile_icon.spec.js`

Contains separate test cases to open the Profile page and update the first name.
Each case authenticates independently, so its result is reported separately.

### `tests/SecureBank_Notification.spec.js`

Contains separate cases to open Notifications, validate the unread count, mark
all notifications as read, and log out. Every case starts with a fresh login.

### `tests/login.spec.js`

Validates SecureBank authentication independently from the Profile and
Notifications scenarios.

## 6. Page Object Model files

A page object groups selectors and actions that belong to one page. This keeps
each action reusable while keeping each test case independently reportable.

### `pages/BankLoginPage.js`

This page object contains the username field, password field, sign-in button,
and welcome message locator. Its `open()` method navigates to the login page;
`signIn()` fills the credentials and submits the form.

The specs load the demo username and password from `test-data/users.json` and
pass them to `signIn()`. `SECUREBANK_USERNAME` and `SECUREBANK_PASSWORD`
environment variables can override those non-sensitive demo values.

### `pages/ProfilePage.js`

This page object contains the Edit button, First Name field, Save Changes button,
and profile success message. It has `open()`, `editFirstName()`,
`saveChanges()`, and reusable `updateFirstName()` methods. Profile tests call
these actions in separate reported steps.

### `pages/NotificationsPage.js`

This page object contains locators for the Notifications title, unread count,
unread notification items, Mark all read, logout, and Sign In controls. Its
methods open the notification page, mark notifications as read, and log out.

There is no shared `BasePage.js` in this project. Each page object receives the
Playwright `page` and defines its own selectors and actions.

### `helpers/runStepWithFailureScreenshot.js`

This helper wraps a functional test step. If it fails, it saves a descriptively
named screenshot under
`execution-evidence/Run_<timestamp>_<run-id>/<scenario>/failures/` and attaches
it while that step is active, so the image appears beneath the failed step in
Allure. Each image includes a tiny capture date/time and run-ID stamp. Passed
steps do not create these failure screenshots.
`helpers/authenticateBankUser.js` provides the shared, separately reported
login prerequisite step.

## 7. Configuration and support files

### `playwright.config.js`

This is the central Playwright configuration. It sets the tests directory,
global setup, timeouts, retries and worker count in CI, reporters, and browser
projects for Chromium, Firefox, and WebKit. The base URL defaults to the value in
`test-data/environment.json`; `BASE_URL` can override it. It also configures
failure screenshots, retry traces, and failure videos.
The configuration and test wrappers select Chromium by default; Firefox and
WebKit remain available as explicit optional selections.
The suite uses one worker because the banking scenarios share a mutable demo
account; running those scenarios concurrently can make them interfere.

### `test-data/users.json` and `test-data/environment.json`

These files keep demo credentials, the default base URL, expected messages, and
profile test values outside of test steps and page objects. Do not store real
credentials in these files; use environment variables for environment-specific
credentials.

### `package.json`

This file lists the project's JavaScript dependencies and short commands called
npm scripts. Important packages include `@playwright/test`,
`allure-playwright`, and `allure`.

Useful commands:

```powershell
npm test                 # Run discovered specs in Chromium
npm run test:chromium    # Run discovered specs in Chromium only
npm run test:firefox     # Run discovered specs in Firefox only
npm run test:webkit      # Run discovered specs in WebKit only
npm run test:profile     # Run the Profile scenario and refresh the Allure report
npm run test:securebank  # Run the notifications scenario and refresh the report
npm run test:allure      # Run all framework scenarios in Chromium and generate the report
npm run test:allure:firefox  # Optional combined run in Firefox
npm run test:allure:webkit   # Optional combined run in WebKit
npm run test:allure:all-browsers # Optional combined run in all browsers
npm run report:allure      # Generate the HTML report without opening it
npm run open:allure        # Regenerate the report and open it in a browser
npm run serve:allure       # Open the already generated report
npm run clean:allure   # Manually clear raw Allure result files
```

### `package-lock.json`

This records the exact dependency versions installed. `npm ci` uses it for a
consistent dependency installation.

### `scripts/global-setup.js`

Playwright runs this before tests. It removes previous `allure-results/` and
`allure-report/` output so a regular test run does not combine with old Allure
data. The combined runner uses an environment flag to preserve results while it
runs its two specs separately.

### `scripts/run-allure.js`

This runner clears previous Allure output once, runs the Profile spec headed and
the login and SecureBank specs normally, then generates a report. It preserves
results between its Playwright commands so every functionality case appears in
the same report, even if a scenario fails.

### `scripts/run-tests.js`

The npm test commands use this wrapper to clear stale Allure output, run the
requested Playwright tests, and regenerate the report whether the tests pass or
fail. The test command's failure status is still returned after report generation.
Allure stores the Playwright pass/fail status on each test case and step.
Failed-step screenshots are captured and attached to the active step by the
shared helper.

### `scripts/generate-allure-report.js`

This checks that raw test results exist, removes the old saved HTML report,
generates a new one, verifies it contains tests, and writes a report-generation
log.

### `scripts/open-allure-report.js`

This generates the report from the current results and opens it in a browser.
To generate the report without opening a browser, use `npm run report:allure`.

### `scripts/clean-allure-results.ps1`

This PowerShell script manually removes the contents of `allure-results/`. It
is available through `npm run clean:allure`. Normal Playwright runs already
clean prior Allure output automatically.

### `reporters/execution-log-reporter.js`

This custom Playwright reporter writes test start/end, status, duration,
standard output, and errors to a timestamped `.log` file in `execution-logs/`.
Allure generation creates its own `allure-report-*.log` file there.

### `.github/workflows/playwright.yml`

This GitHub Actions workflow runs when code is pushed or a pull request targets
the main/master branches. It installs Node packages and Playwright browsers,
runs Playwright tests, and uploads the Playwright HTML report as an artifact.

### `README.md`

The short project instructions: install dependencies, run tests, and open
reports. This longer guide is the framework learning note.

### `.gitignore`

This tells Git not to include installed packages, screenshots, temporary test
output, logs, and generated reports when saving source changes.

## 8. Output folders

- `screenshots/` — named failure screenshots attached beneath the failed Allure
  step.
- `execution-logs/` — timestamped Playwright execution logs and Allure
  generation logs.
- `allure-results/` — raw JSON and attachment files written by the Allure
  Playwright reporter. This is input data, not the human-friendly report.
- `allure-report/` — saved Allure HTML output generated from raw results.
- `playwright-report/` — Playwright's own HTML report, separate from Allure.
- `test-results/` — Playwright output such as failure screenshots, traces, and
  error context.

Generated folders may be cleared or regenerated by test commands, so don’t
treat them as source code.

## 9. Other files in `tests/`

- `tests/Profile_icon.js` is an older direct-selector Profile example. The main
  POM tests are in `Profile_icon.spec.js`.
- `tests/Demo.js` is a learning example about browser/page fixtures. It is not
  part of the banking functionality tests.
- `tests/example.spec.js` is the standard Playwright sample that visits
  playwright.dev. It is not part of the banking functionality tests.
- `tests/playwright_notes` contains these framework notes plus older commented
  learning notes.

The combined `npm run test:allure` script selects the login, Profile, and
Notifications specs in Chromium. A general `npm test` also discovers the sample
`example.spec.js` tests in Chromium. Firefox and WebKit are opt-in through the
browser-specific commands.

## 10. Run the scenarios and open the report

From PowerShell in the project folder:

```powershell
npm run test:allure
npm run open:allure
```

The Profile scenario runs with the browser visible (`--headed`); the login and
Notifications scenarios run normally. The combined command makes one fresh
report containing each individual functionality test result, without opening a
browser. `npm run open:allure` regenerates that report and opens it. To open an
already generated report without rebuilding it, run:

```powershell
npm run serve:allure
```
