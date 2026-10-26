# Playwright Toolshop Automation

A Playwright + TypeScript automation project targeting [Practice Software Testing / Toolshop](https://practicesoftwaretesting.com). Built as a hands-on QA automation engineering and portfolio project.

## Current scope and status

Sixteen independent scenarios are implemented: one Release 8 API authorization pilot and fifteen UI scenarios, including two Release 10 checkout identity/billing-progression cases. UI coverage includes the original seven Authentication/Product Discovery tests, anonymous and authenticated Release 5 Add to Cart paths, two Release 6 Cart Maintenance paths, and two Release 7 category-filter paths. All eleven pre-Release 7 scenarios retain their assertions. See the [Release 7 Package](docs/release-07-summary.md) for category selection/clearing, search interaction and requirement-review boundaries. See the [Release 6 Package](docs/release-06-summary.md) for quantity-update/removal evidence and the separate post-merge human approval/closure record. See the [Release 5 Package](docs/release-05-summary.md) for clearly separated original PR #8 and post-merge change-request evidence; [Release 1 history](docs/release-01-validation.md) records the earlier public-host account investigation.

Authentication:

- Successful login: redirects to `/account` and displays `My account`.
- Rejected login with an incorrect password: displays `Invalid email or password`.
- Logout: signs out through the user dropdown and displays `Sign in`.
- Unauthenticated account access: opening `/account` redirects to login.

Product Discovery:

- Search with matching results.
- Search with no results.
- Open a product from search results and validate its name and visible Add to cart button.
- Select Pliers and verify its exact five seeded products; clear it and verify the initial nine-card page is restored.
- Search Hammer after selecting Pliers; verify category state resets and all six seeded search results appear.

Add to Cart:

- Discover the seeded Combination Pliers, add quantity 1 and verify that Cart Review contains exactly that product and quantity, both anonymously and after an independent UI login with the controlled seeded positive customer.

Cart Maintenance:

- Change seeded Combination Pliers quantity from 1 to 2; verify saved product/quantity and recalculated line/cart totals after reload.
- Remove Combination Pliers from a two-item cart; verify exactly Pliers quantity 1 remains with recalculated totals after reload.
- Both maintenance paths use fresh anonymous contexts; empty-cart messaging, repeated adds, discounts and authenticated maintenance remain outside this focused scope.

The tests use `LoginPage`, `CatalogPage`, `ProductDetailsPage`, `CartPage` and `CheckoutPage` Page Objects for interactions and locators, with assertions in the test files. Chromium is the only enabled browser project.

## Release 1 traceable baseline

- [Requirements and evidence](docs/requirements.md): approval status is separate from evidence; existing tests do not establish official intent.
- [Test catalogue and mapping](docs/test-catalogue.md): sixteen implemented scenarios (15 UI + 1 API), prerequisites and coverage gaps; original seven and anonymous cart coverage preserved.
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
  CatalogPage.ts        # Catalog search, category selection/clearing and product navigation
  ProductDetailsPage.ts # Product detail locators
  CartPage.ts           # Cart navigation, quantity/removal/proceed actions and cart-value locators
  CheckoutPage.ts       # Scoped checkout identity and billing controls
tests/
  login.spec.ts         # Four Authentication UI tests
  product-discovery.spec.ts # Three original Product Discovery UI tests
  category-filtering.spec.ts # Two category selection/clear/search-reset scenarios
  cart.spec.ts          # Anonymous and authenticated Add to Cart UI regression
  cart-maintenance.spec.ts # Quantity update and selected-product removal
  checkout-billing.spec.ts # Anonymous identity prompt and authenticated billing continuation
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

Use Node.js 22 with npm for the controlled environment and CI. Run commands from the repository root.

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

The environment helper is TypeScript: `scripts/toolshop.ts`. Existing npm lifecycle commands execute it through the development dependency `tsx`. Run `npm run typecheck` to check the helper, tests, Page Objects and Playwright configuration with strict TypeScript (`tsc --noEmit`); CI runs that check after `npm ci`. No compiled JavaScript is generated or committed. See the [TS migration hotfix record](docs/ts-migration-hotfix-summary.md).

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

`test:controlled` resets/seeds before every run, then executes all sixteen scenarios (15 UI + 1 API) through the Chromium project with one worker and zero retries. It does not run a tag-filtered subset. To repeat Authentication only after a restart, use `npm run test:controlled -- tests/login.spec.ts`; both Add to Cart paths use `npm run test:controlled -- tests/cart.spec.ts`. Run all cart coverage with `npm run test:controlled -- tests/cart.spec.ts tests/cart-maintenance.spec.ts`. Product Discovery/category regression uses `npm run test:controlled -- tests/product-discovery.spec.ts tests/category-filtering.spec.ts`. Reports remain in ignored `playwright-report/`. `sut:down` removes the controlled containers, network and volumes; it retains images, the external checkout and local credential file for reuse.

On startup/readiness failure, the command exits nonzero and prints service status plus a focused logs command; it does not start tests. If a lifecycle command is forcibly interrupted, confirm no operation is running before removing the empty `.sut/operation.lock` directory. Lifecycle commands serialize access to this one local environment; direct Playwright/manual sessions must not overlap resets.

See [ADR-002](docs/adr-002-controlled-toolshop.md) and the [persistent Release Package](docs/release-02-summary.md) for rationale, evidence and remaining prerequisites.

## GitHub Actions baseline

The [controlled Chromium workflow](.github/workflows/playwright.yml) runs on pull requests targeting `main`, pushes to `main`, and manual dispatch (after the workflow exists on `main`). It uses Ubuntu 24.04 AMD64, Node 22, `npm ci`, and `npx playwright install --with-deps chromium`. The pinned ARM64 gateway runs through Docker's QEMU setup; API/UI/database run natively on AMD64. The SUT version and image digests are unchanged from Release 2.

CI runs `sut:provision`, `sut:up`, `sut:ready` and `npx tsx scripts/ci-evidence.ts run`. The wrapper invokes the unchanged controlled helper, resets/seeds and runs all sixteen scenarios (15 UI + 1 API), with one worker, zero retries and `--forbid-only`. It retains raw console output privately and preserves the test exit code. It generates/injects the ignored controlled accounts; no public-host account secrets are required. Teardown runs with `always()` after dependency installation and checks that project containers, networks and volumes are absent.

Download `controlled-results` for compact test outcomes and the artifact scan manifest. Built-in Playwright JSON is the private input; only allowlisted result fields enter public evidence. Every candidate artifact is scanned, then exact approved bytes are staged and re-scanned before upload. Raw HTML/failure diagnostics are uploaded only when fully inspectable and clean; native embedded reports, archives, screenshots and sensitive text are withheld. Workflow logs and the job summary record withholding without printing matched values. Retention is 14 days. See the [Release 8 Package](docs/release-08-summary.md) for this bounded security decision and validation; Release 3/4 packages remain historical CI/diagnostic evidence.

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

The report provides test outcomes, timings and failure details. Playwright records traces with `retain-on-failure` and screenshots with `only-on-failure`, including a failed first attempt. Passing tests discard their trace recordings. Video remains off to avoid adding capture/storage cost alongside trace snapshots and screenshots. Controlled execution continues to enforce one worker, zero retries and `--forbid-only`, overriding the legacy direct-CI retry default in the config.

For failed public CI runs, inspect the sanitized `controlled-results` artifact first: failures remain failures even when raw diagnostics are withheld. Full local HTML, traces, screenshots and raw console/JSON remain available in ignored local directories. Open local traces with `npx playwright show-trace <path/to/trace.zip>`. These local files can contain injected credentials and request/session data and must not be shared without review. Public uploads are restricted to scanner-approved staging paths; no encryption or reporting dependency is added.

## Security and test data

- Never commit `.env`; it is excluded by `.gitignore`.
- Keep `.env.example` limited to placeholders, with no working credentials.
- Valid credentials come from environment variables. The rejected-login test uses a fixed, non-secret incorrect password.
- Reports, error snapshots and traces may contain sensitive test data. They are ignored by Git and must be reviewed before sharing.

## Planned evolution — not implemented

- Further cart coverage (repeated adds, quantity limits and other deferred variants)
- Checkout/payment coverage beyond Release 10 identity/billing progression
- API automation beyond the Release 8 authorization pilot
- Git/GitHub workflow evolution
- Jenkins CI/CD
- Reporting and troubleshooting improvements

## Release 8 API pilot

Current controlled coverage is **16 scenarios: 15 Chromium UI + 1 API**; Release 8 introduced its first API scenario. [Release 8 Package](docs/release-08-summary.md) records the proposed requirement, pinned discovery and validation evidence. `tests/api-authorization.spec.ts` directly validates `GET /users/me`: anonymous access is rejected, then a fresh login permits access to the intended seeded customer's profile. No browser fixture or reusable API framework is introduced.

Run it independently with `npm run test:controlled -- tests/api-authorization.spec.ts`. The normal `npm run test:controlled` and existing GitHub Actions job discover all sixteen scenarios through the same Chromium project, one worker, zero retries and `--forbid-only`. API tracing is disabled only in this spec because request traces may capture authentication secrets; existing UI failure diagnostics remain unchanged. Use injected controlled credentials; do not enable API request debug logging or attach raw login/token/profile data.

To exercise the public reporting boundary locally, use `npx tsx scripts/ci-evidence.ts run [optional spec]`, followed by `npx tsx scripts/ci-evidence.ts scan`. The wrapper writes raw output under ignored `.sut/`; the scan stages only clean candidates under `.sut/ci-public/`. Local `npm run test:controlled` retains the existing HTML reporting behavior.

## Release 10 Billing Validation

[Release 10 Package](docs/release-10-summary.md) records the Proposed REQ-CHECKOUT-001 and T-CHECKOUT-001/002. Normal checkout presents an identity-choice step **before Billing Address**: anonymous sessions see the default login form plus guest option; an already signed-in customer is acknowledged and can continue to billing without another login prompt. Guest checkout can reach billing without account login, so this is not a universal mandatory-login or backend payment-security claim. Both new UI tests create their own session/cart and stop at the identity prompt or Billing Address. No final purchase, payment/invoice creation or new fixture.

Run independently with `npm run test:controlled -- tests/checkout-billing.spec.ts --grep "anonymous checkout presents"` or `--grep "authenticated checkout continues"`. Impacted regression: `npm run test:controlled -- tests/login.spec.ts tests/cart.spec.ts tests/cart-maintenance.spec.ts tests/api-authorization.spec.ts tests/checkout-billing.spec.ts`. Normal controlled execution/CI includes all 16 scenarios with one worker, zero retries, reset/seed, forbid-only and the unchanged sanitized artifact policy.
