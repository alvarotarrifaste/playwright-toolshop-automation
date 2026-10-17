# Playwright Toolshop Automation

A Playwright + TypeScript automation project targeting [Practice Software Testing / Toolshop](https://practicesoftwaretesting.com). Built as a hands-on QA automation engineering and portfolio project.

## Current scope and status

Four independent Authentication UI scenarios are implemented and passing locally in Chromium:

- Successful login: redirects to `/account` and displays `My account`.
- Rejected login with an incorrect password: displays `Invalid email or password`.
- Logout: signs out through the user dropdown and displays `Sign in`.
- Unauthenticated account access: opening `/account` redirects to login.

The tests use a `LoginPage` Page Object for interactions and keep assertions in the test file. Chromium is the only enabled browser project.

## Tech stack

- Playwright Test
- TypeScript
- Node.js and npm
- dotenv for local environment variables

## Project structure

```text
pages/
  LoginPage.ts          # Login and logout locators/actions
tests/
  login.spec.ts         # Four Authentication UI tests
playwright.config.ts   # Browser, base URL, reporting and environment loading
package.json           # Project dependencies
package-lock.json      # Locked dependency versions
.env.example           # Credential template without real values
.env                   # Local credentials; ignored by Git
.gitignore             # Excludes credentials, dependencies and artifacts
README.md              # Setup, execution and project scope
```

Local generated directories include `node_modules/` (dependencies), `playwright-report/` (HTML reports), and `test-results/` (execution artifacts). They are ignored by Git.

## Setup

Use Node.js 20 or newer, as required by the current Playwright dependency, with npm available. Run commands from the repository root.

1. Install dependencies:

   ```sh
   npm install
   ```

2. Install Chromium for the installed Playwright version:

   ```sh
   npx playwright install chromium
   ```

3. Copy `.env.example` to `.env`. In Windows PowerShell:

   ```powershell
   Copy-Item .env.example .env
   ```

4. Create a dedicated customer account in the target application and set its credentials in `.env`:

   ```dotenv
   TEST_USER_EMAIL=
   TEST_USER_PASSWORD=
   ```

dotenv loads `.env` without overriding externally supplied environment variables. Credential-dependent tests reject missing, empty or whitespace-only values with an explicit error; the original password is used unchanged. The unauthenticated-access test does not require credentials.

The public practice environment has been observed to remove accounts over time. If valid login starts failing, confirm the account still exists before changing the tests.

## Run Authentication tests

```sh
npx playwright test tests/login.spec.ts --project=chromium
```

If PowerShell blocks `npx.ps1`, use:

```powershell
npx.cmd playwright test tests/login.spec.ts --project=chromium
```

The same `npx.cmd` alternative can be used for browser installation and report viewing on Windows.

## Reporting

The configured HTML reporter writes results to `playwright-report/`. Open the latest report with:

```sh
npx playwright show-report
```

The report provides test outcomes, timings and failure details. Traces are configured for the first retry. Local runs have no retries by default, so local failures do not automatically produce traces; CI runs are configured with two retries.

## Security and test data

- Never commit `.env`; it is excluded by `.gitignore`.
- Keep `.env.example` limited to placeholders, with no working credentials.
- Valid credentials come from environment variables. The rejected-login test uses a fixed, non-secret incorrect password.
- Reports, error snapshots and traces may contain sensitive test data. They are ignored by Git and must be reviewed before sharing.

## Planned evolution — not implemented

- Product discovery coverage
- Cart coverage
- Checkout coverage
- API automation
- Git/GitHub workflow evolution
- Jenkins CI/CD
- Reporting and troubleshooting improvements
