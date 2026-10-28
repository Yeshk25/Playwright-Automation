# Playwright Framework Guide - Starting from Zero

This guide is for someone who is new to programming, browser testing, and
automation frameworks. It explains the two main SecureBank programs in this
project:

1. **Profile:** open the profile and update the first name.
2. **Notifications:** open notifications, check unread notifications, mark them
   as read, and log out.

Login is a shared prerequisite used by both programs. It also has its own
standalone test case.

## 1. First, what are we testing?

Imagine a person manually checking a banking website:

1. Open the website.
2. Type a username and password.
3. Click a button.
4. Check that the expected page or message appears.

Browser automation does these actions with code. Playwright controls a real
browser and can check whether the website behaved as expected.

This project uses the demo SecureBank site. The tests are not the SecureBank
website itself: they are instructions that visit the site and check it.

## 2. What is a framework?

A **framework** is an organized set of tools, rules, and reusable code that
makes tests easier to write, run, and understand.

Without a framework, every test might repeat its own browser startup, login
steps, selectors, screenshots, and reporting code. Repetition makes tests long
and makes updates difficult. This framework separates responsibilities:

| Part | Simple meaning | Project location |
|---|---|---|
| Test runner | Starts tests and browsers, reads configuration, records results | Playwright Test |
| Tests | Describe one behavior to verify | `tests/` |
| Page Objects | Store page selectors and reusable actions | `pages/` |
| Test data | Store example users and expected values | `test-data/` |
| Helpers | Reusable supporting code | `helpers/` |
| Configuration | Shared browser and reporting settings | `playwright.config.js` |
| Reporter and report | Save and display the results | Allure and Playwright |

Think of a test as a recipe, a Page Object as a helper who knows where the
controls are, and the runner as the kitchen that prepares and records each run.

## 3. Project map: source files versus generated files

```text
PlayWrightAutomation - Copy\
├── tests\                         Test cases (the scenarios to verify)
│   ├── login.spec.js               Standalone valid-login test
│   ├── Profile_icon.spec.js        Profile functionality test cases
│   ├── SecureBank_Notification.spec.js  Notification functionality test cases
│   ├── example.spec.js             Playwright sample for playwright.dev
│   ├── Demo.js                     Older browser-fixture learning example
│   ├── Profile_icon.js             Older direct-selector profile example
│   └── playwright_notes            Older learning notes; not a test spec
├── pages\                          Page Object Model (POM)
│   ├── BankLoginPage.js             Login selectors and actions
│   ├── ProfilePage.js               Profile selectors and actions
│   └── NotificationsPage.js         Notification selectors and actions
├── test-data\                       Inputs and expected values for tests
│   ├── users.json                   Non-sensitive demo login
│   └── environment.json             URL, expected messages, profile test name
├── helpers\                         Reusable test support
│   ├── authenticateBankUser.js      Shared login prerequisite
│   ├── runStepWithFailureScreenshot.js  Allure step and failure screenshot
│   └── test.js                      Captures evidence for each test execution
├── scripts\                         Run setup and report commands
│   ├── global-setup.js              Clears old reports for normal runs
│   ├── run-tests.js                 Runs Playwright and refreshes Allure HTML
│   ├── run-allure.js                Runs banking specs together in the selected browser
│   ├── generate-allure-report.js    Builds the HTML report from result files
│   ├── open-allure-report.js        Builds and opens the HTML report
│   └── clean-allure-results.ps1     Manually clears raw Allure results
├── reporters\
│   └── execution-log-reporter.js    Writes a timestamped text log
├── utilities\
│   ├── excel-results-reporter.js    Writes test outcomes into Excel
│   └── test-case-results.xlsx       Automatically updated test case workbook
├── .github\workflows\
│   └── playwright.yml               Runs tests in GitHub Actions
├── screenshots\                     Retained execution and failure screenshots
├── execution-logs\                  Generated run and report logs
├── test-results\                    Playwright failure artifacts
├── allure-results\                  Raw Allure results and attachments
├── allure-report\                   Generated Allure website/report
├── playwright-report\               Generated Playwright HTML report
├── node_modules\                    Installed tools and libraries; do not edit
├── playwright.config.js             Shared test-runner configuration
├── package.json                     Dependencies and convenient commands
├── package-lock.json                Exact installed dependency versions
├── README.md                        Short getting-started instructions
├── Playwright-Framework-Notes.md    Framework notes
├── FRAMEWORK-GUIDE.md               This beginner guide
└── .gitignore                       Files Git should not include
```

### Which files does Playwright run?

Playwright automatically discovers files such as `*.spec.js` in `tests/`.
Therefore:

- `login.spec.js`, `Profile_icon.spec.js`, and
  `SecureBank_Notification.spec.js` are active banking test files.
- `example.spec.js` is also discovered by a general `npm test`; it tests
  `playwright.dev`, not SecureBank.
- `Demo.js` and `Profile_icon.js` are learning/older examples. They do not end
  in `.spec.js`, so Playwright does not discover them in a normal run.
- `playwright_notes` is a notes file, not an executable test.

Generated output folders contain things created by running tests. They are not
where you normally edit framework source code. In particular, never edit
`node_modules/` to change a test.

## 4. Three JavaScript ideas used throughout this project

### 4.1 `require` and `module.exports`: sharing code

JavaScript files can share functions and classes with one another.

```js
// In a file that needs another module:
const { BankLoginPage } = require('../pages/BankLoginPage');
```

This says: load the exported `BankLoginPage` from the `pages` folder. The
`../` means “go up one folder” from the current file.

The page file shares its class at the end:

```js
module.exports = { BankLoginPage };
```

This lets multiple tests reuse the same login selectors and actions instead of
copying them.

### 4.2 `async` and `await`: waiting for the browser

Browsers take time to navigate, click, and display content. Those operations
are asynchronous. `async` marks a function that can wait; `await` means “wait
for this browser action to finish before doing the next action.”

```js
async open() {
  await this.page.goto('/bank/login');
}
```

Without `await`, the next instruction might run before the page has finished
loading.

### 4.3 Objects and classes: keeping related things together

A **class** is a reusable description. An **object** is one working instance of
that description.

```js
const loginPage = new BankLoginPage(page);
```

Here `BankLoginPage` is the reusable description; `loginPage` is its instance
connected to this test's browser tab.

### 4.4 How a Page Object's code works

Here is a small version of the login Page Object:

```js
class BankLoginPage {
  constructor(page) {
    this.page = page;
    this.usernameInput = page.locator('#login-username');
    this.passwordInput = page.locator('#login-password');
    this.signInButton = page.locator('button[type="submit"]');
  }

  async open() {
    await this.page.goto('/bank/login');
  }

  async signIn(username, password) {
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.signInButton.click();
  }
}
```

What each part means:

- `class BankLoginPage` begins the reusable login-page description.
- `constructor(page)` runs when the test creates the object. Playwright passes
  in the current browser tab as `page`.
- `this.page = page` saves that tab on the object so its methods can use it.
- `this.usernameInput`, `this.passwordInput`, and `this.signInButton` are
  locators. They describe which page elements to operate on.
- `#login-username` means “find the element whose HTML id is
  `login-username`.” The `#` is CSS selector syntax.
- `button[type="submit"]` means “find a button whose type is submit.”
- `open()` and `signIn()` are methods: named actions the test can reuse.
- `fill(...)` types a value into an input; `click()` clicks a control.
- `this` means “the object currently running this method.”

Playwright locators do not usually search the page immediately when they are
declared. They describe how to find an element when an action or assertion uses
them. This allows Playwright to wait for the element to appear.

## 5. How a test starts and reaches the website

When you run `npm run test:profile`, the work flows through the framework:

```text
PowerShell command
  -> package.json finds the test:profile command
  -> scripts/run-tests.js clears old Allure output
  -> Playwright reads playwright.config.js
  -> Playwright runs tests/Profile_icon.spec.js
  -> the test calls shared login and Page Objects
  -> Playwright performs actions and assertions in a browser
  -> Allure records each test case, step, and attachment
  -> scripts/run-tests.js generates the fresh HTML report
```

The test-runner command returns a failing exit code if a test fails, even though
it still generates the report. This is useful in a terminal or CI system: the
report is available for debugging, and the failure is not hidden.

## 6. Program one: Profile

Main file: `tests/Profile_icon.spec.js`

This program contains two separate test cases:

1. **Profile - Open profile page:** sign in, open Profile, verify the Edit
   button is visible.
2. **Profile - Update first name:** sign in, open Profile, edit and save the
   configured first name, verify the success message and saved value.

Why separate test cases? If updating the name fails, the report still tells us
whether simply opening the Profile page works. Each case starts with a fresh
browser context and signs in independently.

Here is a simplified example of the pattern:

```js
test('Profile - Open profile page', async ({ page }, testInfo) => {
  await authenticateBankUser(page, testInfo, 'Profile');
  const profilePage = new ProfilePage(page);

  await runStepWithFailureScreenshot(
    page,
    testInfo,
    'Profile',
    'Open the profile page',
    async () => {
      await profilePage.open();
      await expect(profilePage.editButton).toBeVisible();
    }
  );
});
```

Read the example from top to bottom:

1. `test(...)` registers one named test case with Playwright.
2. `page` is a browser tab provided automatically by Playwright.
3. `testInfo` contains information about this run, including the browser name
   and retry number; it is used to attach evidence.
4. `authenticateBankUser(...)` runs the common login step.
5. `new ProfilePage(page)` gives the test access to Profile controls.
6. `runStepWithFailureScreenshot(...)` names the step in the Allure report.
7. `profilePage.open()` performs the page action.
8. `expect(...).toBeVisible()` checks the result. If it is not visible, the
   assertion fails the test step.

### What does `expect` do?

`expect` is an assertion: it checks that what the browser shows matches what
the test expects.

```js
await expect(profilePage.editButton).toBeVisible();
```

Read this as: “wait until the Edit button is visible; if it does not become
visible within the configured timeout, fail this test step.” Assertions make
the automation verify the result instead of just clicking controls and assuming
the action worked.

## 7. Program two: Notifications

Main file: `tests/SecureBank_Notification.spec.js`

This program contains four separate test cases:

1. **Notifications - Open notifications page**
2. **Notifications - Validate unread notification count**
3. **Notifications - Mark all notifications as read**
4. **Notifications - Log out of SecureBank**

Each Notifications case signs in independently. That gives every behavior its
own pass/fail result and keeps one failure from hiding results for the other
behaviors.

The unread-count case checks two values:

- The count in the message shown on the page.
- The actual number of unread notification elements.

The test passes only when those values agree and the count is greater than
zero. `NotificationsPage.getUnreadCount()` reads the page message and converts
the number from text into a JavaScript number.

## 8. Login: a shared prerequisite and a separate test

`tests/login.spec.js` independently checks that valid credentials sign in and
show the dashboard welcome message.

The other programs use `helpers/authenticateBankUser.js` to run the same login
flow before Profile or Notifications actions. This is a helper, not a hidden
shortcut: login appears as a named **Sign in to SecureBank** step in each
applicable test's Allure results.

Keeping login in one helper means a future login-page change is made once,
instead of copied into every test.

## 9. Page Objects: the `pages/` folder

A **locator** is a reusable description of how to find an element on a page,
such as a textbox or button. A **Page Object** stores those locators and the
actions that use them. Tests can then describe user behavior without repeating
low-level selectors.

### `pages/BankLoginPage.js`

- Stores the username textbox, password textbox, sign-in button, and welcome
  message locators.
- `open()` navigates to `/bank/login`.
- `signIn(username, password)` fills both fields and clicks Sign In.

The base URL is configured elsewhere, so the page can use a short route instead
of repeating a full website address.

### `pages/ProfilePage.js`

- Stores Profile page locators such as Edit, First Name, Save Changes, and the
  success message.
- `open()` opens Profile.
- `editFirstName(firstName)` clicks Edit and fills the textbox.
- `saveChanges()` saves the update.
- `updateFirstName(firstName)` combines the edit and save actions for callers
  that need the full operation in one reusable method.

### `pages/NotificationsPage.js`

- Stores locators for the page title, unread message and items, Mark all read,
  Logout, and Sign In.
- `open()` navigates to Notifications using the page link.
- `getUnreadCount()` extracts the number shown in the unread-message text. It
  throws a clear error if the page text does not have the expected format.
- `markAllAsRead()` and `logout()` perform their named actions.

**When adding a test:** put element-finding logic and repeatable page actions
in the relevant Page Object. Put the scenario's expected behavior and
assertions in `tests/`.

## 10. Test data: the `test-data/` folder

JSON files store data separately from the steps that use it. JSON is a simple
text format made of property names and values.

### `test-data/users.json`

Stores the non-sensitive demo username and password used by SecureBank tests.
The test code can override them using the `SECUREBANK_USERNAME` and
`SECUREBANK_PASSWORD` environment variables.

Do not put real or production passwords in a source-controlled JSON file. For
private credentials, set environment variables through your terminal or CI
secret store.

Example for one PowerShell window:

```powershell
$env:SECUREBANK_USERNAME = "your-test-username"
$env:SECUREBANK_PASSWORD = "your-test-password"
npm run test:profile
```

These values apply only to that PowerShell window. Closing it removes them.
The names after `$env:` must match the names the test code reads.

### `test-data/environment.json`

Stores:

- The default demo website URL.
- Expected welcome, notification, and profile messages.
- The first name the Profile test uses.

`BASE_URL` can override the default URL. Centralizing these values means that a
changed message or environment default can be updated in one place.

## 11. Failure screenshots and Allure steps

Allure is the reporting tool. It displays test cases, steps, pass/fail results,
errors, and attachments such as screenshots.

### `helpers/test.js`

The active test files import `test` and `expect` from this shared wrapper rather
than importing them directly from Playwright. The wrapper uses Playwright's
page fixture, waits for the test to finish, and then saves a full-page
screenshot for that execution attempt under
`execution-evidence/Run_<timestamp>_<run-id>/<scenario>/executions/`. It also
adds a tiny date/time and run-ID stamp to the image and attaches it to the test
result so it can be reviewed in Allure.

Each filename includes the test title, browser, retry number, timestamp,
process ID, and a random suffix. This makes screenshots unique even when the
same test is rerun quickly. The helper creates the scenario folders when
needed, and does not clear or replace earlier evidence.

### `helpers/runStepWithFailureScreenshot.js`

Tests wrap a meaningful action and its checks with this helper. It:

1. Creates a named Playwright step, which Allure displays.
2. Runs the step's action and assertions.
3. If the step fails, saves a screenshot with the test name, step name, browser,
   and retry number in its filename.
4. Attaches the screenshot while the step is active, so it appears underneath
   that failed step in Allure.
5. Rethrows the original error so the test correctly remains failed.

Failure-step images are saved below:

```text
execution-evidence\Run_<timestamp>_<run-id>\<scenario>\failures\
```

These step-level failure screenshots also use a unique timestamp, process ID,
and random suffix, so reruns do not overwrite evidence. In addition, every
test attempt has a full-execution screenshot under the run's
`executions/` folder. Both screenshot types include a tiny date/time and run-ID
stamp in the image.

Playwright also has its own automatic failure screenshot/video/error artifacts.
Those are saved in `test-results/`. The helper's named screenshot is additional
evidence associated with the exact step.

### `allure-results/` and `allure-report/`

- `allure-results/` contains raw result data and attachment files. The Allure
  report generator reads this folder.
- `allure-report/` is the readable generated report. Generate it using
  `npm run report:allure`; regenerate and open it using `npm run open:allure`.

The result folder is machine-oriented input; the report folder is intended for
people to review.

## 12. Configuration: `playwright.config.js`

This is the central Playwright configuration. In plain language, it tells
Playwright:

- Where the test files are (`testDir`).
- Which setup code to run first (`globalSetup`).
- How long a test or assertion may wait (`timeout`, `expect.timeout`).
- Which reporters to use (`reporter`).
- The common URL and failure evidence settings (`use`).
- Which browsers to run (`projects`).

This project defines three browser projects: Chromium, Firefox, and WebKit.
The configuration selects Chromium by default, including when you run the
Playwright CLI directly. Firefox and WebKit stay configured so you can opt in
with their explicit commands when needed. One configured worker is used because
the demo banking account has mutable data and the tests should not compete with
each other.

Useful terms:

- **Chromium:** the browser engine used by Chrome and similar browsers.
- **Firefox:** Mozilla's browser.
- **WebKit:** the browser engine used by Safari.
- **Headless:** the browser runs without displaying a visible window.
- **Reporter:** a tool that records and presents test results.
- **Retry:** another attempt after a test fails.
- **Trace/video/screenshot:** diagnostic evidence for investigating failures.

## 13. Runner scripts: the `scripts/` folder

### `scripts/run-tests.js`

The normal `npm test` and browser/scenario npm commands use this wrapper. It
clears stale Allure output, runs Playwright with the requested arguments, builds
the Allure report afterward, and returns a failure code if tests or report
generation fail.

### `scripts/run-allure.js`

The `npm run test:allure` command uses this combined runner. It runs the Profile
spec, login spec, and Notifications spec in sequence while preserving results
between those runs, then generates one combined report.

### `scripts/global-setup.js`

Playwright calls this before a run. For a normal run, it clears old Allure
results/report output. The runner sets an environment flag so intermediate
scenario runs do not erase results needed for the combined report.

### `scripts/generate-allure-report.js`

Checks that raw Allure test results exist, invokes the Allure command-line tool
to generate the report, and verifies that the generated report contains tests.
It writes a timestamped report-generation log.

### `scripts/open-allure-report.js`

Regenerates the Allure report from current results and opens it in a browser.
`npm run serve:allure` opens an already generated report without rebuilding it.

### `scripts/clean-allure-results.ps1`

Manually removes files inside `allure-results/`. It is an optional cleanup
command; regular runner commands already prepare a fresh report run.

## 14. Other project files

### `package.json`

The project's command menu and dependency list:

- `@playwright/test` provides the Playwright test runner, browser fixtures, and
  assertions.
- `allure-playwright` sends Playwright results and attachments to Allure.
- `allure` provides report-generation/opening commands.
- `exceljs` creates the automatically updated Excel test-results workbook.

Npm scripts are shortcuts so you do not need to type long Node/Playwright
commands each time.

### `package-lock.json`

Records exact dependency versions. `npm ci` uses it to install repeatable
versions on another computer or in CI. Usually do not edit it by hand.

### `reporters/execution-log-reporter.js`

A custom Playwright reporter. It writes the test start/end, result, duration,
console output, and errors to `execution-logs/`.

### `utilities/excel-results-reporter.js` and
`utilities/test-case-results.xlsx`

The reporter listens for Playwright test outcomes and writes them to Excel. A
normal run refreshes the workbook with that run's cases. The combined
`npm run test:allure` command preserves results between its sequential spec
runs so the final workbook includes Profile, login, and Notifications together.
Open the `.xlsx` file with Excel or another spreadsheet application to review
the Summary and Test Results sheets.

### `.github/workflows/playwright.yml`

A GitHub Actions workflow. GitHub runs these steps when changes are pushed or a
pull request is opened for the configured branches: install Node dependencies,
install browsers, run tests, and upload the Playwright report.

### `.gitignore`

Tells Git which files not to include in source control. This includes installed
packages, generated reports, run logs, screenshots, and `.env` files. Ignoring
`.env` helps avoid accidentally sharing secrets; the project does not
automatically load `.env`, so set environment variables in the shell or CI.

### `README.md` and `Playwright-Framework-Notes.md`

The README provides short setup and run instructions. The framework notes give
an additional overview. This file is the longer, from-zero explanation.

## 15. Generated folders

These are normally created/updated by running tests:

- `screenshots/`: named failure screenshots created by the step helper.
- `execution-logs/`: text logs from Playwright and report generation.
- `utilities/test-case-results.xlsx`: an Excel workbook automatically updated
  with each test case's status, browser, duration, retry, and failure message.
- `test-results/`: Playwright's per-test attachments, traces, screenshots, and
  error context.
- `allure-results/`: raw Allure data used to create reports.
- `allure-report/`: generated Allure HTML report.
- `playwright-report/`: generated Playwright HTML report.

You can inspect these outputs, but do not treat them as the source of the test
logic.

## 16. Getting started: commands in order

Open PowerShell in the project folder.

### First time on a computer

```powershell
npm install
npx playwright install
```

`npm install` installs the packages from `package.json`.
`npx playwright install` downloads the browser engines Playwright uses.

### Run one main program

```powershell
npm run test:profile
npm run test:securebank
```

Each command runs that program's test cases in Chromium and updates the Allure
report.

### Run only one browser

```powershell
npm run test:chromium
npm run test:firefox
npm run test:webkit
```

These are optional cross-browser runs. The project selection is also recognized
when using the Playwright CLI directly, for example:

```powershell
npx playwright test --project=firefox
```

For combined Allure runs, use:

```powershell
npm run test:allure:firefox
npm run test:allure:webkit
npm run test:allure:all-browsers
```

### Run every discovered test

```powershell
npm test
```

This also includes the Playwright sample tests in `example.spec.js`. The
framework wrapper selects Chromium unless you explicitly pass a browser
selection, for example `npm test -- --project=firefox`.

### Run both main programs and standalone login in one report

```powershell
npm run test:allure
```

### Generate the Allure report

```powershell
npm run report:allure
```

This generates the report without opening a browser.

To regenerate the report and open it in a browser, run:

```powershell
npm run open:allure
```

The report lists each functionality test separately. Open a failed case, expand
the failed step, then select its screenshot attachment to inspect the page at
the time that step failed. `npm run serve:allure` opens the existing generated
report without regenerating it.

## 17. How to make a small change

### Change the demo Profile name

Edit `profile.updatedFirstName` in `test-data/environment.json`. The Profile
test reads this value rather than embedding the value in the test code.

### Change a page locator or action

Edit the matching Page Object in `pages/`. For example, login textbox and button
locators belong in `pages/BankLoginPage.js`.

### Add a new behavior test

1. Add a separately named test in the relevant `*.spec.js` file, or create a
   new `*.spec.js` file under `tests/`.
2. Reuse the Page Object instead of writing duplicate selectors.
3. Use `expect(...)` to describe the result that should be true.
4. Wrap the meaningful action/assertions in
   `runStepWithFailureScreenshot(...)` so failures have step-level evidence.
5. Run the scenario command and inspect its Allure report.

## 18. Beginner glossary

- **Automation:** using code to perform work that a person might otherwise do
  manually.
- **Browser:** the application displaying a website.
- **Browser page:** one tab in that browser.
- **Test case:** one named behavior that can pass or fail on its own.
- **Spec:** short for specification; in this project, a JavaScript test file.
- **Test runner:** the program that discovers and runs tests.
- **Fixture:** something Playwright prepares and gives to a test, such as `page`.
- **Locator:** a reusable way to find an element on a website.
- **Action:** an operation such as click, fill, or navigate.
- **Assertion:** a statement that checks expected behavior.
- **POM:** Page Object Model; a way to keep page locators/actions in page classes.
- **Test data:** values consumed by tests, kept apart from their logic.
- **Pass/fail:** whether the observed result met the test's expectation.
- **Artifact:** extra evidence such as a screenshot, video, or trace.
- **CI:** Continuous Integration; automated checks run by a service such as
  GitHub Actions.

You do not have to understand every file before running the tests. Start with
the `tests/` case, follow the Page Object method it calls, and use the Allure
step and screenshot to see what happened.

## 19. Follow the code: one test from start to finish

This section traces the same login flow through the real files. A simple
successfully-running test has several layers:

```text
package.json command
  -> scripts/run-tests.js
    -> playwright.config.js
      -> tests/login.spec.js
        -> pages/BankLoginPage.js
          -> website controls
      -> reporters and Allure result files
    -> scripts/generate-allure-report.js
```

### Step 1: The command in `package.json`

When you type `npm run test:profile`, npm looks up the `test:profile` entry in
`package.json`. It runs `node scripts/run-tests.js tests/Profile_icon.spec.js`.
`node` is the JavaScript runtime, and the remaining words tell it which script
to run and which test file to pass along.

You can list the available commands with:

```powershell
npm run
```

### Step 2: The wrapper in `scripts/run-tests.js`

The wrapper clears the previous Allure results and report so the next report
represents the current run. It starts the Playwright command with the supplied
test-file arguments. If no browser project was specified, it adds Chromium.
After Playwright finishes, it asks `generate-allure-report.js` to build the
report. Finally, it returns a non-zero exit code if either the tests or report
generation failed. A non-zero exit code is how terminals and CI systems know
that a command failed.

This wrapper does not turn a failed test into a successful one: it still
generates a report for inspection, then returns the test failure status.

### Step 3: The shared settings in `playwright.config.js`

The config tells Playwright to find tests inside `tests/`, call
`scripts/global-setup.js`, and use the configured timeouts and reporters.
`baseURL` comes from the `BASE_URL` environment variable when one is provided;
otherwise it comes from `test-data/environment.json`.

The `projects` list controls browser selection. The project names are
Chromium, Firefox, and WebKit. When no project is requested, the config uses
Chromium only. A command that explicitly requests Firefox or WebKit selects
that browser instead. Requesting `*` selects all three. The config also checks
for misspelled browser names and reports an error rather than silently choosing
another browser.

`workers: 1` means one test worker runs at a time. This is intentional because
the demo account's profile and notifications can change during tests.

### Step 4: The actual login test in `tests/login.spec.js`

The important structure is:

```js
test('SecureBank - Sign in with valid credentials', async ({ page }, testInfo) => {
  const loginPage = new BankLoginPage(page);
  const username = process.env.SECUREBANK_USERNAME || users.secureBank.username;
  const password = process.env.SECUREBANK_PASSWORD || users.secureBank.password;

  await runStepWithFailureScreenshot(
    page,
    testInfo,
    'SecureBank_Login',
    'Authenticate and verify the dashboard',
    async () => {
      await loginPage.open();
      await loginPage.signIn(username, password);
      await expect(loginPage.welcomeMessage).toBeVisible();
    }
  );
});
```

Line by line, this says:

1. `test(...)` registers one named test case with the runner.
2. `async ({ page }, testInfo)` receives a browser tab and test details from
   Playwright. Playwright creates and cleans up the tab for the test.
3. `new BankLoginPage(page)` creates the login page object for this tab.
4. `process.env... || users...` prefers a supplied environment value, then
   falls back to the example data in `users.json`.
5. `runStepWithFailureScreenshot(...)` gives the action a readable step name
   and prepares failure evidence.
6. The callback passed as `async () => { ... }` contains the browser actions.
7. `open()` navigates to the login route; `signIn(...)` enters the values and
   submits the form.
8. `expect(...).toBeVisible()` verifies a successful result. A click alone is
   not proof that login worked.

The two curly-brace forms have different jobs: `{ page }` picks the `page`
fixture out of Playwright's supplied fixtures; `{ BankLoginPage }` in a
`require(...)` statement picks a named item out of another file's exports.

### Step 5: The login Page Object in `pages/BankLoginPage.js`

The constructor runs when a test creates `new BankLoginPage(page)`. It saves
the page and prepares locators:

```js
this.usernameInput = page.locator('#login-username');
this.passwordInput = page.locator('#login-password');
this.signInButton = page.locator('button[type="submit"]');
this.welcomeMessage = page.getByText(expected.welcomeMessage);
```

These expressions describe how to find controls; they do not type or click
anything yet. `#login-username` is a CSS selector for an element whose HTML
`id` is `login-username`. `getByText(...)` finds the expected welcome text.

The `open()` method uses `page.goto('/bank/login')`. Because the route is
relative, Playwright combines it with the configured base URL. The `signIn()`
method fills the two fields and clicks the submit button. Those actions are
kept in the Page Object so a test can reuse them without repeating selectors.

## 20. What each functionality case does

### Profile program: `tests/Profile_icon.spec.js`

There are two separately reported tests:

1. **Open profile page:** sign in, click the Profile link through
   `ProfilePage.open()`, then check that the Edit button appears.
2. **Update first name:** sign in, open Profile, edit the name, check the value
   in the input, save, then check the success message and displayed name.

Each test performs its own login. This makes the tests independent: if opening
Profile fails, Playwright can still run and report the name-update case.
`test.setTimeout(60_000)` gives these tests up to 60 seconds, which is longer
than the default configured test timeout.

The test file owns the scenario and assertions. `ProfilePage` owns the page's
locators and actions:

- `open()` clicks the exact `Profile` text.
- `editFirstName(firstName)` clicks Edit and fills the First Name field.
- `saveChanges()` clicks Save Changes.
- `updateFirstName(firstName)` is a reusable combination of editing and
  saving, for callers that want the full operation in one method.

The expected new name is read from `environment.json`, not embedded in the
scenario. The test then checks both the confirmation message and the visible
name. Those are two separate checks: the confirmation says the save completed,
while the displayed name says the expected data is present.

### Notifications program: `tests/SecureBank_Notification.spec.js`

There are four separately reported tests:

1. **Open notifications page:** sign in, follow the Notifications link, and
   verify the page heading.
2. **Validate unread notification count:** sign in, open the page, read the
   unread number from the message, count the unread items, and compare them.
3. **Mark all notifications as read:** sign in, open the page, click Mark all
   read, and verify the “All caught up” state and disappearance of the unread
   count.
4. **Log out of SecureBank:** sign in, click Logout, then verify that the
   sign-in controls are visible.

The notification tests log in separately for the same reason as Profile:
each case has its own setup and result. `NotificationsPage` keeps the selectors
for its heading, unread labels, message, buttons, and logout controls.

For unread validation, the test checks both the text's numeric value and the
number of elements marked unread. If the message says `3 unread notifications`
but only two unread elements exist, the check fails rather than accepting a
misleading label.

## 21. Helpers: why common code is outside the tests

### `helpers/authenticateBankUser.js`

This function is used by the Profile and Notifications tests. It:

1. Creates a `BankLoginPage` for the current browser tab.
2. Reads credentials from environment variables or the demo user JSON.
3. Opens the login page and signs in.
4. Waits for the welcome message to become visible inside a named Allure step.
5. Returns the login page object so the logout test can reuse its sign-in
   locator.

The helper receives `page`, `testInfo`, and a scenario name as arguments. An
argument is a value given to a function so it can do work for the current test.
The same helper can therefore be reused by different scenarios while giving
the report the appropriate scenario label.

### `helpers/runStepWithFailureScreenshot.js`

This helper combines a readable test step and a failure screenshot. Its
`safeName()` function replaces characters that are awkward in filenames with
hyphens and makes the result lowercase. The screenshot name includes the test
title, step title, browser project, retry number, and `failed.png`.

The `try` block runs the supplied action. If an action or assertion throws an
error, the `catch` block attempts a full-page screenshot and attaches the image
to the current test step with `testInfo.attach(...)`. It then throws the
original error again. Rethrowing is important: it lets Playwright mark the
step and test as failed. If screenshot capture itself fails, the helper logs
that additional problem but still rethrows the original test failure.

The helper saves named images under
`execution-evidence/Run_<timestamp>_<run-id>/<scenario>/failures/`. Allure
stores its own attachment copy under `allure-results/`; this is why the image
can be opened from the matching failed step in the report.

## 22. Reading and changing test data

### `test-data/users.json`

This file holds the example SecureBank user. The test-data file is JSON, not
JavaScript: it contains property names and values, but no functions or
statements. The code reads it using `require(...)` and then accesses
`users.secureBank.username` or `users.secureBank.password`.

For a private or environment-specific account, use the documented environment
variables instead of saving a real password in the repository. Never put
production credentials in test data.

### `test-data/environment.json`

This file holds the default website URL, expected messages, and the Profile
test's updated name. The config reads the URL; the page objects read expected
messages; the Profile test reads the name. Separating these values makes it
clear which text is test input and which code performs actions.

Changing a visible label on the website may require changing a locator in the
Page Object. Changing the expected success text should usually be done in this
JSON file. If the website's URL changes, use `BASE_URL` for a temporary
environment override or update the default URL here.

## 23. Reports, logs, and generated folders

The project has two kinds of result data:

| Folder | What it contains | Usually open/edit it? |
|---|---|---|
| `allure-results/` | Raw test result files and attachments consumed by Allure | Inspect for troubleshooting; do not hand-edit |
| `allure-report/` | Generated Allure website with cases, steps, statuses, and attachments | Open the report to review test results |
| `playwright-report/` | Playwright's separate HTML report | Open when using the Playwright reporter |
| `test-results/` | Playwright's per-test diagnostic artifacts such as traces and videos | Inspect when investigating a test |
| `screenshots/` | Retained per-execution and failed-step screenshots grouped by scenario | View test evidence |
| `execution-logs/` | Timestamped text logs from the custom reporter and report generator | Read when diagnosing a run |

Reports are generated output. If a report looks old, run the tests or
`npm run report:allure` to rebuild it from the current raw results. To rebuild
and open it automatically, use `npm run open:allure`. To open an existing
report without rebuilding, use `npm run serve:allure`.

`reporters/execution-log-reporter.js` listens to Playwright's run events. It
creates a timestamped log and records when each test starts and ends, its
status, duration, retries, standard output, and errors. This plain-text log is
useful when a terminal's output has scrolled away.

`utilities/excel-results-reporter.js` is another Playwright reporter. It
creates or updates `utilities/test-case-results.xlsx` after a run. The workbook
has a Summary sheet with status counts and a Test Results sheet with one row
per case and browser. Passing cases are highlighted green, failures red, and
skipped or not-run cases yellow. Failure rows include the error message. Close
the workbook in Excel before starting a new test run so Windows can update it.

## 24. Scripts and configuration files, in plain language

### `scripts/global-setup.js`

Playwright calls this once before a test run. In a regular run it removes
previous Allure results and report output so old results do not mix with new
ones. The combined runner sets `PLAYWRIGHT_KEEP_ALLURE_RESULTS=true` while it
runs each spec so later specs do not delete earlier specs' results.

### `scripts/run-allure.js`

This is the combined-run wrapper behind `npm run test:allure`. It clears old
results once, runs Profile, login, and Notifications in sequence, retains
results between those Playwright invocations, then generates one report. It
selects Chromium if no browser is explicitly supplied. The Profile run is
headed (a visible browser window); the other specs use the configured headless
setting.

### `scripts/generate-allure-report.js`

This script checks that raw test results exist, runs the Allure report
generator, and verifies that the report contains tests. It writes a timestamped
log under `execution-logs/`. This is the script used by
`npm run report:allure`; it does not open the report viewer.

### `scripts/open-allure-report.js`

By default, it regenerates the report and then opens the generated report in a
browser. `--no-generate` skips report generation and opens the existing report
instead; `npm run serve:allure` uses that option.

### `scripts/clean-allure-results.ps1`

This optional PowerShell script removes files inside `allure-results/`. It
does not delete the rest of the project. The ordinary test wrappers already
prepare fresh results, so manual cleanup is rarely needed.

### `playwright.config.js`

This is the central Playwright Test configuration. In addition to the browser
selection described above, it:

- discovers tests under `tests/`;
- applies test and assertion timeouts;
- retries twice in CI and does not retry locally;
- uses one worker to avoid concurrent changes to the demo account;
- configures terminal, custom log, Playwright HTML, and Allure reporters;
- sets headless mode, failure screenshots, retry traces, and failure videos.

### `package.json` and `package-lock.json`

`package.json` is both the dependency list and the command menu. The `scripts`
section defines shortcuts such as `test:profile`, `test:securebank`,
`report:allure`, and `open:allure`. The `devDependencies` section lists tools
needed to develop and run tests; they are not dependencies of the banking
website itself.

`package-lock.json` records exact resolved package versions so `npm ci` can
recreate a consistent install in CI. Let npm update it when dependencies
change; do not edit package versions in the lock file by hand.

### `.github/workflows/playwright.yml`

This is a GitHub Actions recipe. When changes are pushed or a pull request is
opened for `main` or `master`, GitHub checks out the code, sets up Node,
installs dependencies and Playwright browsers, runs tests, and uploads the
Playwright HTML report as an artifact.

### `.gitignore`

This tells Git to leave installed packages and generated reports, logs,
screenshots, and test artifacts out of normal source changes. It also ignores
`.env`, which helps avoid committing credentials. This project does not
automatically load `.env`; use the shell or CI environment variables described
earlier.

### `README.md`, `Playwright-Framework-Notes.md`, and this guide

`README.md` is the quick-start page. `Playwright-Framework-Notes.md` is a
shorter overview. `FRAMEWORK-GUIDE.md` is the detailed beginner tutorial.
Update the quick-start instructions if command behavior changes, and update
this guide when the architecture or source-file responsibilities change.

## 25. Older examples under `tests/`

`Demo.js` and `Profile_icon.js` are older learning examples. They do not end in
`.spec.js`, so the normal Playwright test discovery does not run them.
`example.spec.js` is Playwright's sample test and visits `playwright.dev`; it
is included in a general test discovery run. `playwright_notes` is a notes
file, not a test.

For the SecureBank framework, prefer the current `*.spec.js` files, Page
Objects, and shared helpers. Do not copy an old example into a new test without
checking it against the current framework structure.

## 26. Beginner troubleshooting checklist

1. **The command says no tests were found:** run it from the project root and
   check that the spec file is under `tests/` and ends with `.spec.js`.
2. **The browser does not start:** install dependencies with `npm install` and
   install browser binaries with `npx playwright install`.
3. **A test cannot sign in:** check the demo site is available and confirm
   `SECUREBANK_USERNAME` and `SECUREBANK_PASSWORD` are set correctly if you
   overrode the example account.
4. **The wrong website opens:** check `BASE_URL` in the current shell, then
   check the default in `test-data/environment.json`.
5. **A button or message is not found:** inspect the Allure failed step and
   screenshot. The website may have changed; update the relevant Page Object
   locator or expected test data.
6. **A test failed but the report exists:** this is expected. The runner
   generates a report even when a test fails so you can inspect the error,
   failed step, and screenshot. The test command still returns a failure code.
7. **The report does not open:** run `npm run open:allure` to generate and
   open it, or `npm run serve:allure` if a report has already been generated.

## 27. A safe learning path

If you are new to all of this, learn it in this order:

1. Run `npm run test:profile` and watch the terminal result.
2. Open `tests/Profile_icon.spec.js` and identify the test names.
3. Follow a method call such as `profilePage.open()` into
   `pages/ProfilePage.js`.
4. Find the text value it verifies in `test-data/environment.json`.
5. Run the same test again and inspect its case and steps in Allure.
6. Only then make a small change, such as changing the demo first name.
7. Run the relevant test again to prove the change behaves as expected.

The main idea is: **tests describe what should happen, Page Objects know how
to interact with a page, test data supplies the values, helpers handle shared
work, configuration controls the run, and reports show what happened.**
