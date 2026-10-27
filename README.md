# Playwright Toolshop Automation

A QA automation portfolio project covering the Toolshop shopping journey with Playwright and strict TypeScript. UI and API tests run against a pinned Docker environment with deterministic reset/seed, giving local development and GitHub Actions the same controlled execution model.

## Solution Overview

- Playwright Test for browser and request-level automation.
- Domain-organized UI/API tests and focused Page Objects.
- Pinned Toolshop 2.5 source and image digests, managed through one TypeScript lifecycle script.
- Independent scenarios, freshly seeded state before each controlled invocation.
- GitHub Actions full regression with scanned, sanitized public evidence and verified teardown.

## Current Coverage

**26 independent scenarios: 23 UI + 3 API**, running through the Chromium project.

| Domain | Coverage | Scenarios |
| --- | --- | --- |
| Authentication | Successful/invalid login, logout with post-logout route protection, fresh protected account route | 4 UI |
| Catalog | Matching/empty search, richer product details, category/brand filtering and clearing, filter intersection, pagination | 8 UI |
| Cart | Anonymous/authenticated add, repeated-add merging, saved quantity changes, selected/final-item removal and empty state | 6 UI |
| Checkout | Anonymous/authenticated identity and billing progression, required-city validation | 3 UI |
| Purchase | Authenticated and guest COD orders, confirmation/cart clearing; authenticated invoice readback | 2 UI |
| API authentication | Anonymous/authenticated current-customer access, customer locking, explicit API logout invalidation | 3 API |

Authenticated purchase coverage checks initial `AWAITING_FULFILLMENT` state. Settlement, shipment, fulfillment and email delivery are outside this scope. See [requirements](docs/requirements.md) and the [test catalogue](docs/test-catalogue.md) for approval states and coverage boundaries.

## Architecture

```text
tests/
  ui/
    authentication/authentication.spec.ts
    catalog/{search,filtering,browsing}.spec.ts
    cart/{add-to-cart,cart-maintenance}.spec.ts
    checkout/{identity-billing,purchase,guest-purchase}.spec.ts
  api/
    authentication/{authorization,account-security}.spec.ts
pages/
  authentication/LoginPage.ts
  catalog/{CatalogPage,ProductDetailsPage}.ts
  cart/CartPage.ts
  checkout/CheckoutPage.ts
scripts/
  toolshop.ts
  ci-evidence.ts
  ci-evidence.test.ts
environment/toolshop.lock.json
docs/
.github/workflows/playwright.yml
playwright.config.ts
```

Tests own setup, assertions and expected values. Page Objects expose concrete locators and actions. `scripts/` owns controlled lifecycle and evidence handling; `environment/` pins the SUT. `docs/` holds requirements, mappings, decisions and release evidence. The workflow orchestrates CI using the same controlled runner.

## Test Organization

Folders separate execution layers and functional domains. Each test has native Playwright tags:

| Category | Convention |
| --- | --- |
| Layer | Exactly one of `@ui`, `@api` |
| Primary domain | Exactly one of `@auth`, `@catalog`, `@cart`, `@checkout` |
| Regression | All 26 scenarios have `@regression` |
| Smoke | Five critical paths also have `@smoke`: UI login, matching search, anonymous add-to-cart, COD purchase and API authorization |

Purchase belongs to checkout; API authorization belongs to authentication. Tags describe execution selection and do not confer requirement approval or priority. Full regression is authoritative.

## Controlled Test Environment

The [SUT lock](environment/toolshop.lock.json) fixes Toolshop 2.5 source and Docker image digests. The helper checks bounded readiness, resets/seeds before every test invocation and injects separate positive, negative and locking customer credentials from ignored environment configuration.

Local endpoints are UI `http://localhost:4200` and API `http://localhost:8091`. State is disposable: reset restores seed data, counters, queues and stock; teardown removes controlled containers, networks and volumes. Purchase jobs remain queued; tests start no queue workers or scheduler. Do not overlap controlled runs, manual sessions or resets.

Prerequisites: Node.js 22, npm, Git, Docker Engine using Linux containers and Compose v2. Ports 4200/8091 must be available. The pinned ARM64 gateway needs ARM64 emulation on AMD64 hosts. See [environment architecture](docs/adr-002-controlled-toolshop.md) for details.

## Running the Project

From the repository root:

```sh
npm ci
npx playwright install chromium
npm run sut:provision
npm run sut:up
npm run test:controlled
npm run sut:down
```

Start the environment once, run the required subsets, then tear it down:

| Command | Selection |
| --- | --- |
| `npm run test:controlled` | All 26 scenarios |
| `npm run test:ui` | 23 UI scenarios |
| `npm run test:api` | 3 API scenarios |
| `npm run test:smoke` | 5 critical paths |
| `npm run test:auth` | 4 UI + 3 API authentication scenarios |
| `npm run test:catalog` | 8 catalog scenarios |
| `npm run test:cart` | 6 cart scenarios |
| `npm run test:checkout` | 5 checkout/purchase scenarios |

Every subset delegates to `test:controlled` using Playwright `--grep`. Startup is explicit (`sut:up`); every invocation checks readiness and resets/seeds. The helper enforces Chromium, one worker, zero retries and forbid-only. Those command-line settings override the general defaults in `playwright.config.ts`, including direct-CI retries. CI uses this same helper through the evidence wrapper.

Additional commands:

```sh
npm run typecheck
npx playwright test --list --project=chromium
npm run test:controlled -- tests/ui/checkout/purchase.spec.ts
npx tsx --test scripts/ci-evidence.test.ts
npx playwright show-report
```

On Windows, use `npm.cmd` / `npx.cmd` if PowerShell blocks the `.ps1` launchers. Provisioning generates ignored `.env.controlled`; externally injected credentials take precedence. Optional direct Playwright execution uses `.env` (see [.env.example](.env.example)) and bypasses the controlled reset/seed contract. Direct API runs require `API_BASE_URL`; locking additionally requires its dedicated customer variables from the template.

## CI/CD

[GitHub Actions](.github/workflows/playwright.yml) runs on PRs targeting `main`, pushes to `main`, and manual dispatch. It installs locked dependencies, runs strict typecheck and three evidence security checks, starts the pinned environment and executes all 26 scenarios. Teardown runs even after test failure and verifies resource removal.

The evidence wrapper preserves test failures while keeping raw output private. The scanner stages and re-scans approved bytes before publishing `controlled-results` (14-day retention). HTML and failure diagnostics are published only when inspectable and clean; opaque or sensitive content is withheld. Local reports/traces can contain credentials or session data and require review before sharing. API tracing is disabled in both request-only authentication specs.

## Engineering Principles

- Strict TypeScript throughout tests, Page Objects and lifecycle scripts.
- Assertions and readable deterministic test oracles stay in tests.
- Independent sessions and test-owned resources; reset/teardown owns disposable state.
- Concrete Page Objects composed with Playwright `Page` and `Locator`.
- Abstractions added only for demonstrated needs.
- Credentials and generated identities stay outside committed source and public evidence.

## Project Evolution

| Phase | Focus | Status |
| --- | --- | --- |
| Phase 1 | Foundation, controlled execution, secure CI and functional purchase flow (R1–R11) | Complete |
| Phase 2 | Portfolio architecture and selected UI/API coverage (R12–R15) | In progress |
| Phase 3 | Reliability, debugging and engineering ownership | Planned |

| Release | Branch | Incremental value |
| --- | --- | --- |
| R15 — Cart & Checkout Edge Coverage | `release/15-cart-checkout-edge-coverage` | Selected cart lifecycle and alternate checkout risks before portfolio stabilization. |

[Release 12 architecture package](docs/release-12-summary.md) documents organization, preserved behavior and validation. [Release 11](docs/release-11-summary.md#16-post-merge-human-closure) records human-approved purchase closure. Historical investigations and release evidence remain under `docs/`.
