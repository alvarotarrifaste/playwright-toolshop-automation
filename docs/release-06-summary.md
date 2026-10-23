# Release 6 — Cart Maintenance

## 1. Objective

Extend the completed nine-scenario Release 5 baseline with focused cart-maintenance coverage. Base: current main `db419ea86bbd720f5c95ac18b43ef16111502792` (merged authenticated Release 5 follow-up PR #9). Branch: `release/06-cart-maintenance`. Preserve all nine existing scenarios, assertions, strict TypeScript, pinned controlled SUT and execution/diagnostic contracts. This is Release 6; no checkout progression or Release 7 work.

## 2. Discovery / evidence

Inspected before requirement proposal or implementation:

- [Pinned Sprint 5 stories](https://github.com/testsmith-io/practice-software-testing/blob/9e7736c3841ec2bbb9a6822c9e6602353b7b9a65/docs/user-stories/v5.md), Checkout – Cart Review AC2 (quantity, totals, confirmation), AC3 (delete, recalculated total), AC4 (empty cart), and adjacent checkout/discount criteria to establish boundaries.
- [Pinned cart template](https://github.com/testsmith-io/practice-software-testing/blob/9e7736c3841ec2bbb9a6822c9e6602353b7b9a65/sprint5/UI/src/app/checkout/cart/cart.component.html), component in the same directory and [CartService](https://github.com/testsmith-io/practice-software-testing/blob/9e7736c3841ec2bbb9a6822c9e6602353b7b9a65/sprint5/UI/src/app/_services/cart.service.ts). Quantity change commits on input change, calls replacement API, refetches cart and displays confirmation. Delete operates on the selected product and refetches the cart. Source corroborates behavior; it is not runtime evidence.
- [Pinned ProductSeeder](https://github.com/testsmith-io/practice-software-testing/blob/9e7736c3841ec2bbb9a6822c9e6602353b7b9a65/sprint5/API/database/seeders/ProductSeeder.php): Combination Pliers $14.15 and Pliers $12.01, stock 25 each, non-rental/non-location offers. Final category-based CO2 override sets both Pliers-category products to D; these samples do not invoke eco or mixed-rental discounts.
- Existing CartPage, both cart tests, LoginPage/CatalogPage/ProductDetailsPage, requirements/test catalogues, Release 1–5 packages, strict TS config, lifecycle helper, lock and workflow. External checkout HEAD equals `9e7736c3841ec2bbb9a6822c9e6602353b7b9a65`; its tracked working tree was clean.

Evidence classification: official/project-owned pinned documentation and implementation, plus controlled application observation on 2026-10-23. These support proposals; they do not confer leadership approval. No public Toolshop execution.

## 3. Proposed requirements

Proposal recorded before implementation. REQ-CART-001 and its approved two-session scope remain unchanged.

| ID / status | Supported behavior | Business/risk value | Recommended scenario | Boundaries |
| --- | --- | --- | --- | --- |
| REQ-CART-002 — Proposed | Changing an existing cart item's valid quantity updates the saved quantity, line total and cart total, with the documented confirmation. Stories AC2 + pinned implementation + controlled observation. | Detect optimistic-only edits, lost quantity changes and incorrect order totals before purchase. | T-CART-003: anonymous fresh context; independently add Combination Pliers quantity 1; change to 2; assert confirmation, exact item/quantity and $28.30 line/cart totals; reload and assert saved state. | One in-stock regular product, valid increase 1→2. No boundary/invalid input, discounts, rental, checkout or authentication matrix. Reload corroborates persistence in the same session, not across sessions/devices. |
| REQ-CART-003 — Proposed | Removing a selected cart item removes that product, preserves the remaining product/quantity and recalculates the cart total. Stories AC3 + pinned implementation + controlled observation. | Detect wrong-row deletion, accidental cart clearing, stale totals and lost unrelated selections. | T-CART-004: anonymous fresh context; independently add Combination Pliers and Pliers quantity 1 each; assert $26.16 total; remove Combination Pliers; assert exactly Pliers quantity 1 and $12.01 line/cart totals; reload and assert saved state. | Two distinct regular seeded items; one removal leaving one item. No last-item empty message, repeated-add aggregation, discounts, ownership, checkout/payment or login transitions. |

## 4. Test traceability

REQ-CART-001 → unchanged T-CART-001/T-CART-002 → tests/cart.spec.ts → historical Release 5 package. New proposed mappings: REQ-CART-002 → T-CART-003 and REQ-CART-003 → T-CART-004 → tests/cart-maintenance.spec.ts → CartPage/CatalogPage/ProductDetailsPage → this package. Both new tests are UI functional regression, with no approved priority/smoke tag inferred. Planned count after discovery: nine preserved + two focused scenarios = eleven. Execution results are recorded separately below.

## 5. Application behavior observed

Executed `npm.cmd run sut:up`, `npm.cmd run sut:reset`, then ignored temporary TypeScript exploration via `npx.cmd tsx .sut/observe-cart-maintenance.ts` using fresh anonymous Chromium context and en-US locale, matching Playwright Test. No delivered framework helper or test was created for discovery.

- Initial Combination Pliers: quantity 1, unit/line/cart $14.15. Fill quantity 2 then Tab commits the native change event. Exact `Product quantity updated.` appeared; line/cart became $28.30. Reload preserved product and quantity 2 and totals.
- Two-item cart: Combination Pliers $14.15 + Pliers $12.01, quantity 1 each; total $26.16. Row-specific deletion of Combination Pliers left exactly Pliers quantity 1, line/cart $12.01. Reload preserved that state.
- Initial exploration intentionally tested the story's exact empty sentence and failed to find it. Follow-up observation confirmed last-item deletion instead displays `The cart is empty. Nothing to display.` and removes the total element, persisting after reload. This discrepancy is recorded, not turned into a new requirement or delivered assertion. No last-item scenario is delivered.
- Delete is an unlabeled anchor without href/data-test/accessible name, containing an xmark icon. A product-scoped row plus `a.btn-danger` is necessary for the existing DOM; no SUT accessibility/source modification.
- Repeated-add source increments cached quantity, but complete backend aggregation behavior was not established. Deferred rather than inferred as a Release 6 requirement.
- Runtime footer reports `v6.0.0 | Built 2026-07-05 | Angular 20.0.5` despite the existing upstream tag 2.5 selection. Runtime images remain the exact Release 2 digests. The footer is not treated as a new SUT version selection or proof of source/image build provenance.

## 6. Architecture impact

Implemented minimal change: concrete CartPage quantity/row-removal interactions and price/total/confirmation locators; two independent tests in a new TypeScript spec. Existing nine test bodies remain byte-for-byte preserved. Native input blur commits changes; success confirmation synchronizes quantity mutation before reload. Removal waits for exact remaining contents and recalculated total before reload. Primary oracles remain exact cart contents and totals, not toast or badge alone. Assertions stay in test files. No fixtures, API utilities, storage-state reuse, data framework, generic helper/component, dependency or lifecycle/config/workflow changes. The quantity action deliberately targets the single-item cart used in T-CART-003; no untested multi-row quantity abstraction.

## 7. Files changed

| File | Change |
| --- | --- |
| pages/CartPage.ts | Concrete quantity update and product-scoped removal; unit/line/cart values and confirmation locators |
| tests/cart-maintenance.spec.ts | T-CART-003 and T-CART-004, independent anonymous UI scenarios |
| docs/requirements.md | Append proposed 002/003, evidence/risk/boundaries; preserve entire existing requirement baseline |
| docs/test-catalogue.md | New mappings/preconditions/oracles and eleven-case count; preserve existing nine rows |
| README.md | Current scope/count, cart execution command, maintenance spec and deferred variants |
| docs/release-06-summary.md | Persistent discovery, proposal, implementation, execution and review record |

Ignored exploration/review/artifact-inspection scripts and output are local scaffolding, not delivered source. Unrelated pre-existing untracked output/ and tmp/ are preserved and excluded from delivery.

## 8. Isolated validation

Local Windows execution, Node v22.21.0 / npm 10.9.4, on 2026-10-23:

| Command | Result |
| --- | --- |
| npm.cmd run typecheck | PASS, strict tsc --noEmit, exit 0 |
| npm.cmd run test:controlled -- tests/cart-maintenance.spec.ts --grep "visitor updates a cart quantity" | T-CART-003 independently: 1 passed (6.7s), exit 0 |
| npm.cmd run test:controlled -- tests/cart-maintenance.spec.ts --grep "visitor removes a cart product" | T-CART-004 independently: 1 passed (7.6s), exit 0 |
| ./.sut/actionlint/actionlint.exe -shellcheck= .github/workflows/playwright.yml | PASS, unchanged workflow syntax |
| npx.cmd tsx .sut/review-release06.ts | PASS: 21 protected baseline files unchanged; existing requirements prefix and nine catalogue rows unchanged; exactly eleven tests; no Page Object assertions, bypasses, new JS source or generated credentials in delivered files |

Each test command independently reported API/frontend/database readiness, explicit reset/seed with restored accounts/lock counters/catalog, seeded-catalog readiness, one Chromium worker and zero retries. The unchanged helper invokes --forbid-only. No arbitrary sleep or retry, inherited cart, fixed ID or credential output.

## 9. Full regression

Cart regression command `npm.cmd run test:controlled -- tests/cart.spec.ts tests/cart-maintenance.spec.ts`: **4 passed (17.2s)**, exit 0, one worker, zero retries, explicit reset/seed. This includes both unchanged Add to Cart session paths and both independent maintenance paths.

Full command `npm.cmd run test:controlled`: **11 passed (25.7s)**, exit 0; all nine preserved scenarios plus T-CART-003/T-CART-004 executed. Output confirmed `Running 11 tests using 1 worker`, zero retries, explicit database reset/seed and bounded API/frontend/seeded-catalog readiness. No failure, skip or assertion modification.

`npm.cmd run sut:down` exited 0: controlled containers/network/volumes removed. Subsequent `docker ps -aq`, `docker network ls -q` and `docker volume ls -q`, each filtered by label=com.docker.compose.project=toolshop-controlled, all returned empty; a PowerShell guard failed if any resource remained. Result: **Controlled containers, networks and volumes absent.** Cached images, pinned checkout, ignored configuration and reports are retained for reuse.

Read-only local lifecycle checks: Docker client/engine **29.9.2**, Compose **v5.6.1**. Compose ps showed exactly angular-ui, laravel-api, mariadb and web at the unchanged four image digests in environment/toolshop.lock.json, with UI/gateway ports bound to loopback. Gateway uname **aarch64**. Artisan env **local**; schedule:list contained only invoice:generate, queue:work --stop-when-empty and order:update, with **no migrate:fresh registration**. No scheduler/cron service was started. Artisan emitted the pre-existing FFI-module-already-loaded warning; checks exited 0.

## 10. GitHub Actions evidence

Pending actual GitHub-hosted run, report artifact inspection and teardown evidence. A local pass alone does not close this release.

## 11. Risks / limitations

Requirements 002/003 remain proposed pending human review. Anonymous happy paths only; no inferred authenticated-maintenance coverage. Fixed prices intentionally belong to the controlled seed/pins. Delete locator depends on the unlabelled upstream DOM. The empty-message discrepancy, source/image build provenance and untested repeated-add aggregation remain limitations. No discounts, limits, stock exhaustion, checkout/payment or cross-session persistence claimed. Existing native failure traces/screenshots/HTML and failure-only diagnostic upload must remain unchanged; no new failure injection is required for these functional additions.

## 12. Reviewer guide

Review pinned AC2/AC3 and observation above → proposed requirements/catalogue mapping → concrete CartPage changes → independent scenarios and test-level assertions → isolated/full/CI results → report artifact and teardown → final diff and limitations. Compare existing nine tests, REQ-CART-001, pins, helper, strict config, workflow and diagnostics against base. Human reviewer decides approval/merge; this branch must only open a PR.

## 13. Interview defense

- Why two tests? Quantity editing and selected-item removal are distinct documented risks with independently observed behavior; this is the smallest focused set protecting both, without inventing broad cart coverage.
- Why fixed seed prices? The immutable environment and seeded samples give an independent numeric oracle; deriving expected totals from displayed totals would hide pricing defects.
- Why reload? Input binding can look correct before persistence. Confirmation plus a fresh cart read after reload checks the saved same-session state.
- Why anonymous maintenance? No observed authentication prerequisite; existing Release 5 keeps both Add to Cart session paths. A maintenance authentication matrix is additional coverage requiring its own scope decision.
- Why not empty/repeated-add tests? Actual empty wording differs from documentation and aggregation was not fully established. Explicit boundaries avoid encoding assumptions.
- Why keep assertions in tests? Page Objects expose concrete interactions/locators; scenarios retain visible business expectations and requirement traceability.

## 14. Release status

Discovery/proposal, implementation, strict typecheck, both isolated runs, cart regression, full 11/11 local regression and verified teardown complete. Baseline/protected-source review and workflow syntax passed. An implementation commit/push is necessary to run the unchanged manual-dispatch workflow on GitHub-hosted infrastructure before PR creation. CI/artifact verification and final evidence commit/review remain pending. Proposed requirements await human leadership review; no merge or release approval claimed.
