# Playwright Toolshop Automation

A QA automation portfolio for a representative **e-commerce application**: browsing products, managing a cart, checking out, and protecting customer access. Built with **Playwright Test and strict TypeScript**, running against a pinned Docker Toolshop environment locally and in GitHub Actions.

**Portfolio v1.0 review candidate · 26 scenarios · 23 UI + 3 API · Chromium**

## Coverage

| Domain | Representative coverage | Scenarios |
| --- | --- | --- |
| Authentication | Valid/invalid login, logout, protected account route | 4 UI |
| Catalog | Search, product information/image, category/brand filters, intersection, pagination | 8 UI |
| Cart | Anonymous/authenticated add, repeated-add merging, saved quantity/totals, selected/final-item removal | 6 UI |
| Checkout & purchase | Identity/billing progression, required-city blocking, authenticated/guest COD orders and cart clearing | 5 UI |
| API authentication | Anonymous/customer authorization, account locking, explicit token invalidation | 3 API |

Authenticated purchase includes independent persisted invoice readback. Guest purchase checks order acceptance and independent cart deletion; its invoice persistence is corroborated by operational audits outside the automated assertion path. Settlement, shipping, email delivery and exhaustive coverage are outside v1.0.

## Architecture

```text
tests/
  ui/{authentication,catalog,cart,checkout}/
  api/authentication/
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
.github/workflows/playwright.yml
docs/
playwright.config.ts
```

Tests own business setup, assertions, readable seeded expectations and scenario-specific network evidence. Five concrete Page Objects own UI locators/actions. The lifecycle script owns the controlled environment; the evidence module owns private result capture and sanitized publication. No base-page framework, generic API client or fixture hierarchy is needed at this scale.

## Run the project

Prerequisites: **Node.js 22**, npm, Git, Docker Engine using Linux containers and Compose v2. Local ports **4200/8091** must be available. The pinned ARM64 gateway requires ARM64 emulation on AMD64 hosts; CI installs QEMU support.

```sh
npm ci
npx playwright install chromium
npm run sut:provision
npm run sut:up
npm run typecheck
npm run test:controlled
npm run sut:down
```

Toolshop 2.5 source and images are fixed by the [environment lock](environment/toolshop.lock.json). Startup checks readiness; every controlled invocation resets/seeds and injects credentials from ignored configuration. UI: `http://localhost:4200`; API: `http://localhost:8091`. Teardown removes controlled containers, network and volumes. Queued inventory/email jobs are deliberately not processed. Do not overlap manual sessions, test runs or resets.

Provisioning creates ignored `.env.controlled`; external credentials take precedence. [.env.example](.env.example) documents optional direct-run inputs. Direct Playwright execution bypasses reset/seed and is outside the validated controlled contract. On Windows, use `npm.cmd`/`npx.cmd` if PowerShell blocks the `.ps1` launchers.

## Select tests

Start the environment, select a subset, then tear it down. Every alias reuses the same controlled runner and reset/seed.

| Command | Scenarios |
| --- | ---: |
| `npm run test:controlled` | 26 |
| `npm run test:ui` | 23 |
| `npm run test:api` | 3 |
| `npm run test:smoke` | 5 |
| `npm run test:auth` | 7 |
| `npm run test:catalog` | 8 |
| `npm run test:cart` | 6 |
| `npm run test:checkout` | 5 |

Native tags assign one layer (`@ui`/`@api`), one primary domain (`@auth`, `@catalog`, `@cart`, `@checkout`) and `@regression` to every case. Only five selected critical paths also have `@smoke`. Full regression is authoritative.

List tests with `npx playwright test --list --project=chromium`. Run one controlled spec with `npm run test:controlled -- tests/ui/checkout/guest-purchase.spec.ts`.

## CI and evidence

[GitHub Actions](.github/workflows/playwright.yml) validates PRs targeting `main`, pushes to `main`, and manual dispatches. It installs locked dependencies, runs strict types and three evidence security checks, starts pinned Toolshop and executes the full suite. The controlled CLI fixes **Chromium, one worker, zero retries and forbid-only**, overriding general Playwright configuration defaults.

Teardown runs even after failures and verifies resource absence. The scanner allowlists compact outcomes, stages and re-scans approved bytes, and publishes `controlled-results` for 14 days. Sensitive or opaque HTML/traces/screenshots are withheld; failures remain failures. Full local diagnostics can contain session data and require review before sharing. Open local reports with `npx playwright show-report`.

## Documentation

- [Solution architecture and defense](docs/solution-architecture-and-defense.md): primary technical deep dive, decisions, Docker/CI, debugging and limitations.
- [Requirements](docs/requirements.md) and [test catalogue](docs/test-catalogue.md): current approval states, exact mappings and coverage boundaries.
- [R16 stabilization evidence](docs/release-16-summary.md): reliability investigation, controlled failure exercises, repeatability and v1.0 review gate.

## Portfolio Evolution

| Release / Sprint | Branch | Incremental value |
| --- | --- | --- |
| R1 — Traceable baseline | `release/01-traceable-baseline` | Established requirements, test mappings and baseline evidence. |
| R2 — Controlled environment | `release/02-controlled-toolshop-environment` | Replaced shared-state dependence with pinned Docker execution. |
| R3 — GitHub Actions | `release/03-github-actions-baseline` | Added hosted controlled regression and verified teardown. |
| TypeScript migration | `ts-migration-hotfix` | Brought lifecycle scripts under strict TypeScript validation. |
| R4 — Failure diagnostics | `release/04-failure-diagnostics` | Exercised failure evidence and diagnostic capture. |
| R5 — Add to cart | `release/05-add-to-cart` | Covered the product-selection-to-cart path. |
| R5 — Authenticated follow-up | `hotfix/release-05-authenticated-cart` | Added signed-in cart entry after human review. |
| R6 — Cart maintenance | `release/06-cart-maintenance` | Verified saved quantities, selected removal and totals. |
| R7 — Category filtering | `release/07-category-filtering` | Added category clearing and search-reset behavior. |
| R8 — API authorization | `release/08-api-authorization` | Added a focused backend identity boundary and secure evidence. |
| R9 — Resource ownership | `release/09-resource-lifecycle-fixture` | Validated reset/teardown ownership without premature fixtures. |
| R10 — Billing progression | `release/10-billing-validation` | Distinguished anonymous and authenticated checkout identity steps. |
| R11 — Purchase completion | `release/11-purchase-completion` | Completed COD purchase with independent invoice readback. |
| R12 — Portfolio architecture | `release/12-portfolio-architecture` | Organized domains/layers and introduced native subset selection. |
| R13 — Authentication security | `release/13-authentication-security` | Added locking, explicit token invalidation and post-logout protection. |
| R14 — Catalog expansion | `release/14-catalog-expansion` | Strengthened product details, brand/intersection filters and browsing. |
| R15 — Cart/checkout edges | `release/15-cart-checkout-edge-coverage` | Added selected cart lifecycle, guest-order and billing-validation risks. |
| R16 — Stabilization | `release/16-portfolio-stabilization` | Investigated reliability, practiced debugging and consolidated v1.0 defense. |

Portfolio v1.0 freeze remains subject to final human review and merge.
