# Release 5 — Add to Cart

> Sections 1–13 preserve the original anonymous-only PR #8 delivery and its eight-test evidence. Their Proposed requirement status describes that point in time. PR #8 is now merged. The human-approved refined requirement, added authenticated path and current closure readiness are recorded separately in section 14; T-CART-002 did not exist in the original run.

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

Verified [run 40010505128](https://github.com/alvarotarrifaste/playwright-toolshop-automation/actions/runs/40010505128), [job 120609355082](https://github.com/alvarotarrifaste/playwright-toolshop-automation/actions/runs/40010505128/job/120609355082), workflow_dispatch attempt 1, implementation SHA 1d2b9ef287d1014532609614f15f8d2568757b03, 2026-10-23 19:19–19:21 UTC. Job/run conclusion **success**. Ubuntu 24.04 AMD64, runner image 20261012.334.1, Node 22.23.3. No temporary triggers or validation failures added.

All npm installation, strict typecheck, Chromium/system dependency installation, Docker/Compose verification, QEMU setup and pinned provisioning steps passed. Logs verify Toolshop 2.5/SHA 9e7736c3841ec2bbb9a6822c9e6602353b7b9a65. API ready at 19:20:42, frontend ready at 19:20:48; separate sut:ready passed. Exact ARM64 gateway execution and scheduler exclusion checks passed; APP_ENV=local. Database reset/seed/cache clear/catalog readiness completed at 19:20:52 before browser tests.

Output: `Running Chromium against http://localhost:4200, all scenarios, one worker, zero retries.`, `Running 8 tests using 1 worker`, **8 passed (5.9s)**. Teardown succeeded at 19:21:01: controlled containers/network/volumes removed and all three project-label empty-list checks passed. HTML upload succeeded; failure-only diagnostics upload skipped on green. The only workflow edit is its stale seven-test step label; triggers/actions/QEMU, lifecycle commands, flags and artifact conditions are unchanged. No public-host target/secrets.

Verified [playwright-report artifact 12525762563](https://github.com/alvarotarrifaste/playwright-toolshop-automation/actions/runs/40010505128/artifacts/12525762563): 200,380 ZIP bytes, SHA256 `48e993afe7333976dc0aea5b1f5f1cdce11783812304dab65048e8bcaff706ec`, created 2026-10-23T19:21:02Z, expires 2026-11-06T19:21:01Z (14 days), unexpired at verification. Downloaded ZIP hash matches GitHub. `python .sut/inspect-r5.py .sut/release05-report.zip` parsed embedded report/detail JSON: total=8, expected=8, unexpected=0, flaky=0, skipped=0, actualWorkers=1, errors=[], exactly one passed result/retry=0 for each of the seven original titles plus the new title. ZIP contains index.html only and no failure attachments, as expected on green. Download/extract and inspect with `npx playwright show-report <directory>`.

## 9. Regression Result

**Final regression: 8/8 local and 8/8 GitHub Actions**, with all original seven names/assertions byte-for-byte unchanged. T-CART-001 also passed independently after another reset. Downloaded CI report matches all eight source titles and confirms first-attempt passes only. Native retain-on-failure trace and only-on-failure screenshot settings and failure-only artifact upload remain byte-for-byte intact; no retry introduced. The CI step's descriptive label is the only workflow edit.

Final `node .sut/review-release5.cjs` (ignored review scaffolding) passed: exactly the eight intended release files; unchanged original tests/diagnostics/SUT/lifecycle/dependencies; workflow differs only by label; credential-value scan clean; no Page Object assertions, fixtures, API helpers or arbitrary sleeps added. actionlint and git diff --check passed. The final evidence commit changes only this package after the hosted green implementation; runtime/test content remains identical. No generated configuration, reports, external source or unrelated output/tmp are staged.

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

VALIDATED — RELEASE 5 DEFINITION OF DONE SATISFIED; FINAL DELIVERY VIA OPEN PR. Evidence-supported REQ-CART-001/T-CART-001, actual cart behavior, local 8/8, isolated 1/1, hosted 8/8, report content and local/hosted cleanup verified. Seven baseline scenarios and all execution/failure-diagnostic contracts are preserved. Requirement remains Proposed for human review; no earlier approval statuses changed. Implementation commit: 1d2b9ef287d1014532609614f15f8d2568757b03. Final evidence-only commit is identified by Git history; PR will be authoritative URL/status. Ready for human review once this evidence is committed/pushed and OPEN PR against main exists. Stop immediately after creation; no merge or Release 6. No post-creation documentation commit planned. No remaining execution blocker; focused scope and infrastructure/diagnostic risks remain as listed.

## 14. Post-merge Release 5 Change Request — Authenticated Cart

### 14.1 Leadership decision and rationale

After PR #8 merged, human leadership approved this refinement: **A supported user session must be able to add an available product to cart and review the correct product and selected quantity in Cart Review.** REQ-CART-001 is now **Approved**. Release 5 must validate both anonymous and authenticated sessions; the original anonymous-only requirement was too narrow. This is a Release 5 follow-up, not Release 6. Other requirement approval statuses are unchanged.

Retain REQ-CART-001 → T-CART-001 anonymous coverage and add REQ-CART-001 → T-CART-002 authenticated coverage. Keep seeded Combination Pliers, stock=25, non-rental/non-location-offer and default quantity 1. The approved functional statement is not limited to anonymity; implemented data coverage remains deliberately focused. No claim is made about other quantities/products, cart ownership/merging or cross-session/device behavior.

### 14.2 Base and application observation

Branch hotfix/release-05-authenticated-cart starts from main 43a305f47dbfacb7948f71adaa0438a28958ea93, the merge of PR #8. The original PR #8 implementation/run/artifact above remain historical and unmodified. Inspected the current login/cart tests and existing four Page Objects, pinned cart/auth source, controlled configuration and diagnostics before implementation.

Local `npm.cmd run sut:up` / `npm.cmd run sut:reset` passed with exact Toolshop 2.5 SHA/images and bounded API/UI/DB/catalog readiness. `npx.cmd tsx .sut/observe-authenticated-cart.ts` (ignored TypeScript observation scaffolding) used a fresh en-US context, existing controlled positive credentials and existing LoginPage UI interactions. /account and My account verified successful login; navigation to discovery preserved the user menu and began with no cart link. Searching Combination Pliers opened the correct product/default quantity 1; adding/opening Cart Review yielded /checkout, exactly that product and quantity 1, with the user menu still visible. Observation passed without logging credentials. No navigation/session difference required a new abstraction. The initially interrupted invocation was rerun explicitly at the user's request; the completed invocation supplies this evidence.

### 14.3 Implementation and architecture impact

One new TypeScript test in tests/cart.spec.ts: `authenticated user adds a product to cart and sees the selected product and quantity` (T-CART-002). Validate the existing injected positive credential variables inside this test, perform its own LoginPage login, assert account URL/heading, use CatalogPage discovery with the exact product query, verify detail identity/default quantity, add/open via existing ProductDetailsPage/CartPage and assert /checkout, exact [Combination Pliers], quantity 1 and visible authenticated user menu. Final product/quantity assertions remain the primary oracle; the menu check prevents a silently anonymous fallback from satisfying authenticated coverage.

No Page Object, fixture, auth-state framework, API login/helper, storage-state reuse, data framework or shared cart abstraction is added. Every assertion is in the test. Fresh Playwright context per test prevents inherited auth/cart state; T-CART-002 does not depend on T-CART-001 or preceding login tests. Expected suite: 7 original + 2 cart cases = **9 Chromium scenarios**. Existing positive/negative seeded authentication account separation is unchanged. No account values are introduced into source/logs.

### 14.4 Files changed and preserved contracts

| File | Follow-up change |
| --- | --- |
| tests/cart.spec.ts | Import existing LoginPage; positive env injection/guards; append T-CART-002; preserve T-CART-001 body/assertions |
| docs/requirements.md | Human-approved session-neutral REQ-CART-001, L5 decision and two coverage paths |
| docs/test-catalogue.md | Retain T-CART-001; add T-CART-002 and nine-test traceability |
| README.md | Current nine-test/session scope and cart command wording |
| docs/release-05-summary.md | This explicitly separate post-merge follow-up record |

Original seven test files, anonymous cart test body, all Page Objects, SUT lock/tag/SHA/image/platform pins, reset/seed/helper, package/lock/tsconfig, Playwright config and complete workflow remain unchanged. Preserve one worker, zero retries, --forbid-only, native failure trace/screenshot capture, HTML report, failure-only diagnostics artifact and teardown verification. All new automation-owned implementation/scaffolding is TypeScript; no JS/CJS/MJS project source is introduced.

### 14.5 TypeScript and local validation

Observed on Windows, Node 22.21.0:

| Follow-up command / inspection | Result |
| --- | --- |
| npm.cmd run typecheck | Passed existing strict configuration across automation-owned TypeScript |
| npx.cmd playwright test --project=chromium --workers=1 --retries=0 --forbid-only --list | Exactly 9 tests in 3 files |
| npm.cmd run test:controlled -- tests/cart.spec.ts --grep "authenticated user adds a product to cart" | T-CART-002 independently **1 passed (7.7s)** |
| npm.cmd run test:controlled -- tests/cart.spec.ts | T-CART-001 and T-CART-002 **2 passed (9.7s)** |
| npm.cmd run test:controlled | All original seven plus both cart paths **9 passed (20.5s)** |
| npm.cmd run sut:down and project-label Docker container/network/volume queries | Cleanup in finally succeeded; all three resource lists empty |
| npx.cmd tsx .sut/review-authenticated-cart.ts; git diff --check | Passed; five intended files only, T-CART-001 body exactly unchanged, original seven/Page Objects/contracts unchanged, PR #8 history retained verbatim, credential scan clean, no JS/CJS/MJS project source introduced |

Each controlled test command completed bounded API/UI/database/catalog readiness and reset/seed/cache clear before tests, with **one worker, zero retries and --forbid-only**. The isolated case ran before either cart/full regression, proving it needed no preceding anonymous/authentication test. Non-fatal NO_COLOR/FORCE_COLOR warnings did not affect results. Local checkout/images/ignored configuration remain cached; all controlled runtime resources were removed. No local-only result substitutes for hosted validation below.

### 14.6 GitHub Actions evidence

Verified [follow-up run 40017255241](https://github.com/alvarotarrifaste/playwright-toolshop-automation/actions/runs/40017255241), [job 120632407394](https://github.com/alvarotarrifaste/playwright-toolshop-automation/actions/runs/40017255241/job/120632407394), workflow_dispatch attempt 1 on implementation SHA 55056d289970fbd5d71d77d4b4c6db85d43a35d1. Ran 2026-10-23 20:11–20:12 UTC; run/job conclusion **success**. Ubuntu 24.04 AMD64, runner image 20261012.334.1, Node 22.23.3. This is new post-merge evidence, not PR #8's eight-test run.

All setup steps passed, including npm ci and the existing strict `npm run typecheck`. Logs verified Toolshop 2.5 / SHA 9e7736c3841ec2bbb9a6822c9e6602353b7b9a65. API ready at 20:12:25, frontend at 20:12:35; separate readiness passed at 20:12:36. Exact pinned ARM64 gateway and scheduler-exclusion checks passed; APP_ENV=local. Controlled reset/seed/cache clear and seeded catalog readiness completed at 20:12:41. Browser output confirms localhost:4200, `Running 9 tests using 1 worker`, **9 passed (12.8s)**, zero retries.

Teardown passed at 20:12:57: controlled containers/network/volumes removed, all three project-label empty-list assertions passed. HTML upload succeeded; failure-only diagnostics upload skipped on green. The entire workflow, native trace/screenshot settings and artifact behavior are unchanged from merged PR #8. No temporary trigger, failing-test injection, public target or new repository secrets.

Verified [playwright-report artifact 12527974618](https://github.com/alvarotarrifaste/playwright-toolshop-automation/actions/runs/40017255241/artifacts/12527974618): 201,520 ZIP bytes; SHA256 `362ba953d6b4ee8e20c1e3326d2cdad57659f3aaf2948e5e1805d355dfdebf5b`; created 2026-10-23T20:12:58Z, expires 2026-11-06T20:12:57Z (14 days), unexpired at verification. Downloaded ZIP hash matches GitHub. `npx.cmd tsx .sut/inspect-auth-cart-report.ts .sut/authenticated-cart-report.zip` validated native embedded report/detail JSON: total=9, expected=9, unexpected=0, flaky=0, skipped=0, errors=[], actualWorkers=1, exactly one passed result/retry=0 per scenario. All nine exact source titles match the report, including T-CART-001/T-CART-002; no failure attachments. ZIP contains index.html only. Download/extract and use `npx playwright show-report <directory>` to inspect.

Final scope/history review passed again: only the five declared files differ; original seven, anonymous test body, all Page Objects/controlled contracts are unchanged; original PR #8 package content is retained verbatim; no credential values or JS/CJS/MJS project source added. Final evidence-only commit changes this package after the tested implementation; test/runtime content remains identical. This follow-up provides local isolated **1/1**, cart **2/2**, full **9/9** and hosted full **9/9** without weakening any original assertion.

### 14.7 Risks, review and interview defense

- Requirement approval comes from this explicit leadership decision, not green automation. Original PR #8's Proposed/8-test evidence remains historically accurate; this section supersedes it for current scope/status.
- Both session paths use one in-stock non-rental product and quantity 1. No broader cart behavior, identity ownership, anonymous-to-authenticated cart migration, cross-user isolation or checkout/payment coverage is claimed.
- The positive seeded user is shared as an identity by independent browser contexts; controlled reset/seed and separate negative account prevent lock-counter contamination. No tokens/cart IDs are reused. Concurrent manual resets remain unsupported.
- Native traces can contain authentication/test data on failure; generated configuration is never uploaded. Existing QEMU/registry/runner drift, capture-on-hard-termination and 14-day retention limitations remain.
- Reviewer: inspect leadership refinement → unchanged anonymous case → own UI login and authenticated indicator → exact cart contents → typecheck → isolated/cart/full local results → actual hosted 9/9/report/teardown → preserved contracts and credential scan.
- Why no shared cart helper? One short extra path fits existing Page Objects; factoring it would add indirection without demonstrated need.
- Why verify login and the final user menu? A passing anonymous cart flow alone does not prove authenticated-session coverage.
- Why keep the same oracle? Cart Review identifies the selected product/quantity in both sessions; toast/badge only are weaker.
- Why not mark Release 5 closed now? Follow-up execution evidence, human PR review/merge and post-merge checks are distinct gates.

### 14.8 Current Release 5 closure readiness

VALIDATED — POST-MERGE RELEASE 5 CHANGE REQUEST COMPLETE; READY FOR HUMAN REVIEW AND CLOSURE REVIEW. REQ-CART-001 is Approved for the refined session-neutral behavior. T-CART-001 remains unchanged, T-CART-002 passes independently, both cart paths pass together, local/hosted full regression is 9/9, strict typecheck passes and report/cleanup evidence is verified. No remaining execution blocker on the validated paths. Narrow product/quantity coverage and the risks above remain explicit.

Implementation SHA: 55056d289970fbd5d71d77d4b4c6db85d43a35d1; final evidence-only delivery SHA is identified by Git history. Ready to commit/push this record and create an OPEN PR against main. Release 5 is closure-ready subject to human follow-up PR review/merge and post-merge confirmation; it is **not marked CLOSED by this execution**. The eventual PR is authoritative URL/status. Stop immediately after PR creation; no merge, Release 6 or post-creation documentation commit.
