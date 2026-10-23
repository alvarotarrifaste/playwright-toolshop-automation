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

Verified actual [GitHub-hosted run 40021985728](https://github.com/alvarotarrifaste/playwright-toolshop-automation/actions/runs/40021985728), [Chromium job 120648575896](https://github.com/alvarotarrifaste/playwright-toolshop-automation/actions/runs/40021985728/job/120648575896): workflow_dispatch, attempt 1, implementation commit **28dee21cc3827c1f607d721d138474c50fbecca3**, 2026-10-23 20:48–20:49 UTC. Run/job conclusion **success**. Existing workflow dispatched with ref=release/06-cart-maintenance; no temporary trigger, failure injection or workflow change. Final evidence-only commit changes this package, not the tested runtime tree.

Runner: Ubuntu 24.04 AMD64 (OS 24.04.5 LTS), image 20261012.334.1, Node 22.23.3 / npm 10.9.9, Docker Engine 28.0.4, Compose v2.38.2. npm ci, strict typecheck and Chromium/system dependency installation passed.

| Lifecycle evidence (UTC) | Observed result |
| --- | --- |
| 20:48:39, provision / up | Official tag 2.5 and exact SHA 9e7736c3841ec2bbb9a6822c9e6602353b7b9a65 verified; unchanged pinned environment provisioned |
| 20:49:09 API; 20:49:19 UI | Bounded startup readiness passed; separate sut:ready passed at 20:49:20 |
| 20:49:20–21 architecture/scheduler check | Exact pinned web image inspected as linux/arm64; gateway execution aarch64 through existing QEMU on AMD64; four controlled services; APP_ENV=local; no destructive migrate:fresh registration |
| 20:49:25 reset/seed | Database/accounts/lock counters/catalog restored; API/frontend/seeded-catalog readiness passed before browser execution |
| 20:49:26–43 Chromium | **11 passed (17.4s)**; Running 11 tests using 1 worker; zero retries, unchanged --forbid-only helper; all nine baseline and two maintenance scenarios executed |
| 20:49:45 teardown | sut:down succeeded; explicit project-label guards confirmed **Controlled containers, networks and volumes absent.** |
| 20:49:46 artifacts | HTML upload succeeded; failure-only raw diagnostics upload skipped as expected on green |

No public Toolshop dependency, repository account secrets, assertions weakened, retries introduced or baseline tests excluded. Release 4 retain-on-failure trace, only-on-failure screenshot, HTML reporter and failure-only diagnostics artifact remain byte-for-byte unchanged. Green tests correctly retain no trace/screenshot attachments; this release does not claim a new controlled-failure experiment (see Release 4 for that historical evidence).

### Report artifact and inspection

Downloaded [playwright-report artifact 12531211362](https://github.com/alvarotarrifaste/playwright-toolshop-automation/actions/runs/40021985728/artifacts/12531211362), **205,639 ZIP bytes**, unexpired when inspected. SHA256 **a8b541b20fe1433b3833dbdd77a383a45beae6011614e16f3243493ec3aaa565**, independently computed from download and equal to GitHub's digest. Created 2026-10-23T20:49:46Z; expiry 2026-11-06T20:49:45Z (14-day retention).

Inspection command: existing ignored GitHub download helper fetched /actions/artifacts/12531211362/zip into .sut/release06-report.zip; `npx.cmd tsx .sut/inspect-release06-report.ts .sut/release06-report.zip` extracted the native HTML's embedded report JSON. Outer ZIP contains index.html; native report metadata links this run and implementation SHA. Verified total=11, expected=11, unexpected=0, flaky=0, skipped=0, ok=true, actualWorkers=1, errors=[]; exact eleven test titles match repository specs, each with one passed result and retry=0, no retained failure attachments. This proves both new scenarios executed, rather than relying solely on a green job badge.

To review: download/extract playwright-report and run `npx playwright show-report <extracted-directory>`. Select each maintenance scenario to review its actions and expectations. On a future failure, use the unchanged report attachments and playwright-test-results artifact; `npx playwright show-trace <trace.zip>` opens the trace and the PNG can be viewed directly. Keep report files together; diagnostics may contain test data. Artifacts expire, so these durable results/IDs/digest supplement the temporary downloadable report.

## 11. Risks / limitations

Requirements 002/003 remain proposed pending human review. Anonymous happy paths only; no inferred authenticated-maintenance coverage. Fixed prices intentionally belong to the controlled seed/pins. Delete locator depends on the unlabelled upstream DOM. The empty-message discrepancy, source/image build provenance and untested repeated-add aggregation remain limitations. No discounts, limits, stock exhaustion, checkout/payment or cross-session persistence claimed. Native failure traces/screenshots/HTML and failure-only diagnostic upload are unchanged; no new failure injection was performed for these functional additions. GitHub runner/Node patch versions can drift and hosted report retention is 14 days. None blocked this scoped implementation or its observed green execution.

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

**Implementation and validation complete; ready for human review.** Strict typecheck passed; isolated scenarios 1/1 each; cart regression 4/4; full local regression 11/11; GitHub-hosted regression 11/11, one worker, zero retries; report downloaded/verified; local and hosted teardown verified. Baseline/protected-source review and unchanged-workflow syntax passed. Entire original requirement prefix (including REQ-CART-001), all nine existing tests and their catalogue rows, pins, lifecycle, dependencies, config, diagnostics and workflow are preserved. Final diff is limited to the six files in section 7; no credential or JavaScript source introduced.

Git delivery: base main db419ea86bbd720f5c95ac18b43ef16111502792; branch release/06-cart-maintenance; implementation commit 28dee21cc3827c1f607d721d138474c50fbecca3. A final documentation-only evidence commit follows the verified hosted run. PR title: **test: add cart maintenance coverage**; target main; open, not draft, with no merge authorization. PR creation is the final delivery action after evidence commit/push; its returned URL belongs in the handoff. The automatic PR-event run may start afterward and is not represented as an already completed run here. Human leadership retains requirement approval and merge decisions. No Release 7 work.
