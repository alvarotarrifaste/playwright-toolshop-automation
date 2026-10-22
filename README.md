# Playwright Toolshop Automation

A Playwright + TypeScript automation project targeting [Practice Software Testing / Toolshop](https://practicesoftwaretesting.com). Built as a hands-on QA automation engineering and portfolio project.

## Current scope and status

Seven independent UI scenarios are implemented. The latest Release 1 Chromium execution passed all 7 tests with 0 failures (13.9 seconds), after the human reviewer reported unlocking the account. See [execution history and investigation](docs/release-01-validation.md) for earlier failures. No test behavior was changed to obtain a green result.

Authentication:

- Successful login: redirects to `/account` and displays `My account`.
- Rejected login with an incorrect password: displays `Invalid email or password`.
- Logout: signs out through the user dropdown and displays `Sign in`.
- Unauthenticated account access: opening `/account` redirects to login.

Product Discovery:

- Search with matching results.
- Search with no results.
- Open a product from search results and validate its name and visible Add to cart button.

The tests use `LoginPage`, `CatalogPage`, and `ProductDetailsPage` Page Objects for interactions and locators, with assertions in the test files. Chromium is the only enabled browser project.

## Release 1 traceable baseline

- [Requirements and evidence](docs/requirements.md): approval status is separate from evidence; existing tests do not establish official intent.
- [Seven-test catalogue and mapping](docs/test-catalogue.md): implemented assertions, prerequisites and coverage gaps.
- [ADR-001: preserve current architecture](docs/adr-001-preserve-baseline.md).
- [Release 1 validation evidence](docs/release-01-validation.md).

Release 1 changes documentation only. Authentication approval follows leadership review; logout, protected-route intent and Product Discovery decisions remain pending. Account-locking requirements are approved with implementation deferred. Repeated incorrect-password runs may lock shared accounts; no separate negative-test account is required in this release.

The SDTE prepares the branch, local evidence and PR. Álvaro is the human merge gate. Release 2 introduces a controlled Toolshop environment; GitHub Actions is deferred to Release 3. The earlier CI proposal in PR #3 is unmerged and is not a prerequisite for this branch. Every release must commit its Release Package in `docs/`.

## Tech stack

- Playwright Test
- TypeScript
- Node.js and npm
- dotenv for local environment variables

## Project structure

```text
pages/
  LoginPage.ts          # Login and logout locators/actions
  CatalogPage.ts        # Catalog search and product navigation
  ProductDetailsPage.ts # Product detail locators
tests/
  login.spec.ts         # Four Authentication UI tests
  product-discovery.spec.ts # Three Product Discovery UI tests
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

The controlled environment below is the reference target. The public deployment is for optional manual/exploratory comparison only; a public-host pass is not controlled-environment evidence.

Use Node.js 20 or newer, as required by the current Playwright dependency, with npm available. Run commands from the repository root.

1. Install dependencies:

   ```sh
   npm install
   ```

2. Install Chromium for the installed Playwright version:

   ```sh
   npx playwright install chromium
   ```

3. For optional direct/manual execution, copy `.env.example` to `.env`. In Windows PowerShell:

   ```powershell
   Copy-Item .env.example .env
   ```

4. For direct execution, set `BASE_URL`, positive credentials and a separate negative-test customer in `.env`. Do not reuse public accounts for the controlled run:

   ```dotenv
   BASE_URL=http://localhost:4200
   TEST_USER_EMAIL=
   TEST_USER_PASSWORD=
   TEST_NEGATIVE_USER_EMAIL=
   ```

dotenv loads `.env` without overriding externally supplied environment variables. Credential-dependent tests reject missing, empty or whitespace-only values with an explicit error; the original password is used unchanged. The unauthenticated-access test does not require credentials.

The public practice environment has been observed to remove accounts over time. If valid login starts failing, confirm the account still exists before changing the tests.

## Controlled environment

Prerequisites: Node.js 22 with npm, Git, and Docker Engine with **Linux containers** and Docker Compose v2 or newer running (Docker Desktop with WSL2 on Windows). Allow the initial image download; ports `4200` and `8091` must be free. API/UI/database use `linux/amd64`; the pinned official gateway is `linux/arm64` and requires ARM64 emulation on AMD64 hosts (validated with Docker Desktop).

Official Toolshop **tag `2.5`**, commit `9e7736c3841ec2bbb9a6822c9e6602353b7b9a65`, is fetched into ignored `.sut/upstream/`. UI/API release images and web/database images are fixed by digest in [the SUT lock](environment/toolshop.lock.json). No application source is committed here.

```sh
npm ci
npx playwright install chromium
npm run sut:provision
npm run sut:up
npm run sut:reset
npm run test:controlled
npm run sut:down
```

UI: `http://localhost:4200`. API: `http://localhost:8091`. `sut:up` provisions if necessary and checks bounded API/frontend readiness; `sut:ready` checks again. `sut:reset` destroys and reseeds **this controlled database**, restoring accounts, login counters and catalog, and clears application cache. Do not run resets while using the environment manually.

Provisioning generates ignored `.env.controlled` from the pinned official seeder without printing its values. Required variables are `TEST_USER_EMAIL`, `TEST_USER_PASSWORD`, and `TEST_NEGATIVE_USER_EMAIL`; positive tests use the first seeded customer and the incorrect-password test uses the second. No passwords are embedded in tests or documentation. Existing `.env.controlled` is preserved; external environment variables take precedence.

`test:controlled` resets/seeds before every run, then executes all seven Chromium scenarios against the controlled UI with one worker and zero retries. It does not run a tag-filtered subset. To repeat Authentication only after a restart, use `npm run test:controlled -- tests/login.spec.ts`. Reports remain in ignored `playwright-report/`. `sut:down` removes the controlled containers, network and volumes; it retains images, the external checkout and local credential file for reuse.

On startup/readiness failure, the command exits nonzero and prints service status plus a focused logs command; it does not start tests. If a lifecycle command is forcibly interrupted, confirm no operation is running before removing the empty `.sut/operation.lock` directory. Lifecycle commands serialize access to this one local environment; direct Playwright/manual sessions must not overlap resets.

See [ADR-002](docs/adr-002-controlled-toolshop.md) and the [persistent Release Package](docs/release-02-summary.md) for rationale, evidence and remaining prerequisites.

## GitHub Actions baseline

The [controlled Chromium workflow](.github/workflows/playwright.yml) runs on pull requests targeting `main`, pushes to `main`, and manual dispatch (after the workflow exists on `main`). It uses Ubuntu 24.04 AMD64, Node 22, `npm ci`, and `npx playwright install --with-deps chromium`. The pinned ARM64 gateway runs through Docker's QEMU setup; API/UI/database run natively on AMD64. The SUT version and image digests are unchanged from Release 2.

CI runs `sut:provision`, `sut:up`, `sut:ready` and `test:controlled`. The last command resets/seeds and runs all seven scenarios, including incorrect-password authentication, with one worker, zero retries and `--forbid-only`. It generates/injects the ignored controlled accounts; no public-host account secrets are required. Teardown runs with `always()` after dependency installation and checks that project containers, networks and volumes are absent.

Download `playwright-report` from the workflow run's Artifacts section, extract it and open with `npx playwright show-report <directory>`. HTML reports are retained for 14 days and uploaded when test execution was attempted, including test failure. Setup failures before tests may generate no report. No retry traces are produced under this zero-retry contract. See the [Release 3 Package](docs/release-03-summary.md) for actual hosted evidence and limitations.

## Run tests locally

Run the full Chromium suite:

```sh
npx playwright test --project=chromium
```

Run Authentication only:

```sh
npx playwright test tests/login.spec.ts --project=chromium
```

Run Product Discovery only:

```sh
npx playwright test tests/product-discovery.spec.ts --project=chromium
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

- Cart coverage
- Checkout coverage
- API automation
- Git/GitHub workflow evolution
- Jenkins CI/CD
- Reporting and troubleshooting improvements
