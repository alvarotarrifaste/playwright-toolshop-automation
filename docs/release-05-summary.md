# Release 5 — Add to Cart

## 1. Objective

Add one focused UI regression for adding a product to cart, the first new functional coverage since the seven-test baseline. Preserve all original seven scenarios/assertions, controlled Toolshop, one worker, zero retries, forbid-only, strict TypeScript and Release 4 native failure diagnostics. Base: main 5287faf0a9495a94ed8c4d6969f961d9cfdd13cb (merged TypeScript hotfix PR #7); branch release/05-add-to-cart. No Release 6 work.

## 2. Requirement Evidence

REQ-CART-001: a fresh anonymous visitor can discover the seeded in-stock non-rental Combination Pliers, add default quantity 1 and review exactly that product and quantity in cart. Status **Proposed — human approval pending**. User authorizes implementing this focused coverage; automation execution does not independently confer business approval.

Official/project-owned evidence is pinned with the SUT: [Sprint 5 stories at SHA 9e7736c](https://github.com/testsmith-io/practice-software-testing/blob/9e7736c3841ec2bbb9a6822c9e6602353b7b9a65/docs/user-stories/v5.md), Product Detail AC3 (default quantity), AC8 (selected product/quantity added), Checkout – Cart Review AC1 (cart items/quantity table). Inspected from the clean external checkout, not a moving public deployment. Pinned [ProductSeeder](https://github.com/testsmith-io/practice-software-testing/blob/9e7736c3841ec2bbb9a6822c9e6602353b7b9a65/sprint5/API/database/seeders/ProductSeeder.php) defines Combination Pliers, stock=25, non-rental/non-location-offer. CartService/detail/header/cart source corroborates the anonymous session cart and table behavior; application observation below establishes actual runtime behavior.

Business/risk value: protect the product-to-cart purchase funnel and detect missing/wrong product, incorrect quantity or unexpected extra cart lines. A visible button, toast or count cannot identify the persisted product correctly on its own. Success-message wording, pricing/discounts and other cart operations are not included in this focused requirement.

## 3. Test Impact / Traceability

REQ-CART-001 → T-CART-001 → [tests/cart.spec.ts](../tests/cart.spec.ts) (`visitor adds a product to cart and sees the selected product and quantity`) → CatalogPage/ProductDetailsPage/CartPage → local/hosted results below. Layer: UI. Regression classification: functional happy path for Add to Cart; no priority/smoke tag approval implied. Requirements/test catalogues record evidence classification, business value, preconditions, expected result and implementation.

Preconditions: exact controlled SUT/reset/seed/readiness; fresh anonymous Playwright context with no inherited sessionStorage cart identity; seeded product available; default English Playwright test locale; default quantity 1. No authentication or stable product/cart ID required. Expected final state: /checkout, complete product-name collection exactly [Combination Pliers], one quantity value=1. Tests remain independent: no test supplies data to another and the new scenario performs its own discovery/add/review flow. Expected total is 8 (4 Authentication + 3 Product Discovery + 1 Add to Cart).

## 4. Application Behavior Observed

Before implementation, inspected current requirements/test catalogues, original tests, existing Page Objects, Release 1–4/hotfix conventions, clean pinned source and seeded catalogue. `npm.cmd run sut:up`; `npm.cmd run sut:reset` succeeded with condition-based API/UI/DB/catalog readiness.

Ignored exploratory Playwright script `.sut/observe-cart.ts` used existing CatalogPage/ProductDetailsPage against localhost:4200. In a fresh English context, cart link count was 0. Search Pliers opened Combination Pliers with quantity 1 and enabled Add to cart. Clicking it produced `Product added to shopping cart.` and badge 1. Opening the cart link navigated to /checkout and displayed exactly Combination Pliers with quantity 1. Anonymous UI screenshot was visually inspected. Reload preserved the same cart row/quantity. Observed application traffic: POST /carts 201, POST /carts/[id] 200, subsequent GET /carts/[id] 200. These are observation evidence, not API automation or a delivered helper.

A second fresh context had no cart identity and no cart link, corroborating per-test isolation. The initial standalone exploration inherited Spanish from Windows and could not find the existing English Search locator; matching Playwright Test's documented-in-installed-source default locale en-US resolved the observation-tool mismatch. No delivered config/selector changed. A trial assertion of the documented empty-checkout sentence was not observed; empty-cart behavior is outside this scope and is not used as an oracle. The successful exploration explicitly excludes that assumption. Do not infer a requirement for reload persistence or empty-cart messaging from this release.

## 5. Architecture Decision

Reuse CatalogPage's exact discovery flow. Add quantity locator and addToCart click method to ProductDetailsPage. Introduce a small CartPage because cart review is a distinct UI surface; it contains only the existing cart link and product/quantity locators, plus open(). All expectations stay in tests/cart.spec.ts. No fixtures, generic components, API helpers, data framework or broad refactor.

Primary oracle is the API-backed cart review UI: exact product collection and quantity. Cart-link click auto-waits until it appears after successful add (the pinned header only renders it for nonzero items), avoiding premature navigation/aborted add requests. Test-level URL and item assertions then wait for cart contents. No arbitrary sleeps, transient-toast assertion, internal storage manipulation or hardcoded IDs. The cart review fetches backend contents; the badge alone is not the pass criterion.

## 6. Files Changed

| File | Purpose |
| --- | --- |
| tests/cart.spec.ts | One independent Add to Cart regression |
| pages/ProductDetailsPage.ts | Quantity locator and add action |
| pages/CartPage.ts | Minimal cart navigation/product/quantity surface |
| docs/requirements.md | REQ-CART-001 and pinned evidence/classification |
| docs/test-catalogue.md | T-CART-001, eight-test mapping and preconditions/results |
| .github/workflows/playwright.yml | Rename stale seven-test step label to all Chromium scenarios; execution unchanged |
| README.md | Current eight-test scope, CartPage and execution guidance |
| docs/release-05-summary.md | Durable release record |

Original test files, login/catalog Page Objects, helper lifecycle, SUT lock, dependencies, tsconfig and Playwright config are unchanged. Historical release packages remain unchanged.

## 7. Local Validation

Commands/results observed locally (Windows, Node 22.21.0):

| Command / inspection | Result |
| --- | --- |
| npm.cmd run typecheck | Passed strict check across tests/Page Objects/config/helper |
| npx.cmd playwright test --project=chromium --workers=1 --retries=0 --forbid-only --list | Exactly 8 scenarios in 3 files |
| .sut/actionlint/actionlint.exe -shellcheck= .github/workflows/playwright.yml; git diff --check | Passed; actionlint 1.7.12, local ShellCheck unavailable |
| npm.cmd run test:controlled | Reset/seed/readiness passed; **8 passed (17.4s)**, 1 worker, zero retries; all 7 originals and T-CART-001 executed |
| npm.cmd run test:controlled -- tests/cart.spec.ts | Another reset/seed/readiness; isolated new scenario **1 passed (6.7s)**, 1 worker, zero retries; no preceding test supplied cart state |
| npm.cmd run sut:down | Exit 0; controlled containers/network/volumes removed |
| docker ps -a / network ls / volume ls with label=com.docker.compose.project=toolshop-controlled | All three returned empty output after teardown |
| git diff --exit-code origin/main -- original test files, LoginPage/CatalogPage, Playwright config, helper, lock/dependency files and tsconfig | Empty diff; baseline assertions and execution/diagnostic contracts preserved |

The exploratory observations above are separate from these delivered test executions. Non-fatal Playwright NO_COLOR/FORCE_COLOR warnings did not affect results. Checkout, image cache and ignored local environment variables remain for reuse; no live controlled Docker resources remain locally.

## 8. GitHub Actions Evidence

Pending actual hosted run and artifact inspection. Existing workflow_dispatch can validate this branch before opening the PR. Keep unchanged triggers/runner/action/QEMU pins, typecheck, provisioning/readiness/reset/seed, one worker, zero retries, forbid-only, teardown and HTML/failure artifact behavior. No public-host target or account secrets.

## 9. Regression Result

Local regression: all seven baseline scenarios passed unchanged alongside T-CART-001 (8/8); the new case also passed alone after reset. Hosted 8/8 evidence remains pending. Native retain-on-failure trace and only-on-failure screenshot settings and failure-only artifact upload remain byte-for-byte intact; no retry introduced. The CI step's descriptive label is the only workflow edit.

## 10. Known Risks / Limitations

- Requirement is focused and Proposed until human review; earlier requirement approval statuses are not upgraded by this test.
- One in-stock non-rental product and quantity 1 only. No quantity updates/bounds, repeated adds, multiple products, rentals, out-of-stock, removal, pricing/totals/discounts or checkout/payment progression.
- Anonymous session identity is isolated by Playwright context; suite reset handles backend data. Manual concurrent resets can invalidate the active cart; lifecycle usage must not overlap local tests.
- Cart link currently appears after successful add; if that UI contract changes, review navigation synchronization while preserving product/quantity assertions.
- Empty-checkout wording was not confirmed in exploration and is not used. Locale follows Playwright Test en-US; localization is not new coverage.
- Existing pinned ARM64 gateway/QEMU, external registry/runner drift and trace-sensitive-data/14-day artifact retention limitations remain.

## 11. Reviewer Guide

Review pinned requirement sources vs actual observation → focused requirement/status/value → test catalogue mapping → small POM changes → test-level exact product/quantity oracle → original seven unchanged → local/hosted 8/8 → artifact/teardown → diagnostics/pins preserved → risks. Álvaro + Automation workspace own approval/changes-requested and merge. Do not merge automatically.

## 12. Interview Defense

- Why cart contents? Toast/badge can report a successful click/count while the wrong item/quantity is stored; cart review identifies the actual product and quantity.
- Why this product? Existing deterministic discovery target and pinned seed show stock 25, non-rental, quantity default 1; no new data machinery needed.
- Why a CartPage? It is a new UI surface with three locators and one action, not a generic component framework.
- Where are assertions? At test level; Page Objects expose actions/locators only.
- How is synchronization deterministic? Auto-wait for the cart link rendered after successful add, followed by retrying URL/name/quantity expectations. No sleeps or transient toast dependency.
- Why independent? Fresh context gives each test its own cart identity; the new test performs its entire flow and requires no prior test's data.
- Does green mean requirement approved? No. Official evidence/observation support the Proposed candidate; human review decides approval.
- What is intentionally absent? Other cart/checkout behavior, API helpers, fixtures, data frameworks and new retries.

## 13. Release Status

IN PROGRESS — LOCAL AND HOSTED 8/8 VALIDATION REQUIRED. Commit/push for hosted validation, persist actual evidence, then open PR against main only when Definition of Done is satisfied. Final delivery SHA is recorded in Git history; the PR is authoritative URL/status. Stop immediately after creation, no merge or Release 6. No post-creation documentation commit planned.
