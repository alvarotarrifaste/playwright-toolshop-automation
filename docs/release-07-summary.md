# Release 7 — Category Filtering

## 1. Objective

Add the smallest useful category-filter coverage supported by pinned documentation and controlled observation, preserving the eleven existing scenarios and all execution contracts. Base main: **127cd227d9bacfb9a4649d02d4aade79e3666a18**, merged Release 6 PR #10. Branch: **release/07-category-filtering**. No Release 8 work or merge authorization.

Step 0 completed first in separate commit **9a77acb8ca951dc3a7be97231fb1171a688fe351**, `docs: close Release 6 cart maintenance`: current REQ-CART-002/003 and T-CART-003/004 mappings record explicit human leadership approval; Release 6 package appends post-merge closure with supplied run 40023526758, 11/11, strict typecheck, one worker/zero retries, controlled reset/seed and clean teardown. Original pre-merge Proposed history remains intact. Release 6 **CLOSED** by leadership, not by inferred test success.

## 2. Discovery / requirement evidence

Reviewed before implementing or deciding count:

- **P7 — Official/project-owned documentation:** [Sprint 5 stories at the exact pinned SHA](https://github.com/testsmith-io/practice-software-testing/blob/9e7736c3841ec2bbb9a6822c9e6602353b7b9a65/docs/user-stories/v5.md), Product Overview AC4 (search resets active filters), AC5 (one/more category checkboxes constrain products), AC6 (hierarchy), adjacent brand/combined-filter/pagination criteria to set boundaries.
- **I7 — Official pinned implementation:** [overview component](https://github.com/testsmith-io/practice-software-testing/blob/9e7736c3841ec2bbb9a6822c9e6602353b7b9a65/sprint5/UI/src/app/products/overview/overview.component.ts), template in the same directory, ProductService, CategorySeeder and ProductSeeder. The category handler updates selected IDs, refetches products and marks filter_completed; unchecking removes an ID. Search clears category arrays/checkbox state and fetches search results. CategoryService supplies a tree. ProductService source uses HTTP QUERY criteria; delivered tests do not assert transport or issue API calls.
- **O7 — Controlled observation:** fresh anonymous Chromium context, en-US locale, existing controlled UI; explicit sut:up readiness and sut:reset before exploration on 2026-10-24. Exact results recorded below. No public target.
- Existing CatalogPage, Product Discovery tests, all cart/auth baseline files, requirements/test catalogue, Release 1–6 decisions, strict TS/lifecycle/config/workflow and diagnostics conventions. External upstream checkout is clean at **9e7736c3841ec2bbb9a6822c9e6602353b7b9a65**. Toolshop tag 2.5 and all four immutable image digests remain unchanged.

Documentation/source corroborate behavior; observation establishes runtime behavior. Neither approves a requirement. No final count was selected until after observation.

## 3. Proposed requirements

Proposal recorded before implementation; human approval remains separate.

| ID / status | Documented / observed behavior and classification | Business/risk value | Recommended scenario | Explicit boundaries |
| --- | --- | --- | --- | --- |
| **REQ-CATALOG-005 — Proposed** | Selecting a category limits displayed products to that category; clearing the sole selection restores the category-unrestricted grid under the remaining default criteria. P7 AC5 documents selection; I7/O7 additionally support clearing. | Detect ignored filters, wrong-category leakage, missing category members and sticky constraints after clearing. | **T-CATALOG-004:** independently select Pliers, assert the complete seeded five-name set and checked state; clear it and assert unchecked state and complete nine-name initial-page set. | Anonymous desktop UI, one leaf category, no search/other filters, default price/rental criteria. Pliers has five products and fits one page. Clearing checks only restored page 1, not the whole catalogue. No sorting contract inferred. |
| **REQ-CATALOG-002 — existing Requires confirmation** | Existing meaning is unchanged: valid 3–40-character search returns matching products and resets active filters. P7 AC4 and I7/O7 support a focused category-reset slice. | Detect stale category constraints that hide valid search results or leave controls inconsistent. | **T-CATALOG-005:** independently select Pliers and verify its five products, search Hammer, assert search completion, no selected category checkboxes and the complete six-result Hammer set/count. | This is partial additional coverage, not a new approval or redefinition. Only category state is reset/validated; brand, price, sort, eco/spec filters, query bounds and search matching algorithm are not covered. |

Hierarchy AC6 is supported by source and partial observation but is deferred; multi-category unions, category switching, brands/combined filters and search→category intersection are not added. The two delivered paths target category membership/clearing and its documented search interaction without broadening every filter dimension.

## 4. Test traceability

REQ-CATALOG-005 → T-CATALOG-004; existing REQ-CATALOG-002 → original T-CATALOG-001 plus new T-CATALOG-005 (focused reset coverage) → tests/category-filtering.spec.ts → CatalogPage → local/hosted execution in this package. Existing T-CATALOG-001/002/003 and all other eleven baseline tests remain unchanged. Both new scenarios are independent UI functional regression; no smoke tag/priority inferred. Count chosen after discovery: **11 preserved + 2 new = 13 Chromium scenarios**.

## 5. Application behavior observed

Commands: `npm.cmd run sut:up`, `npm.cmd run sut:reset`, `npx.cmd tsx .sut/observe-category-filtering.ts` (ignored temporary TS exploration; not delivered framework code). Bounded API/frontend/database/seeded-catalog checks passed, accounts/lock counters/catalog restored before observation. Existing POs reused for search/navigation; UI checkbox actions observed directly.

- Initial first page: Combination Pliers, Pliers, Bolt Cutters, Long Nose Pliers, Slip Joint Pliers, Claw Hammer with Shock Reduction Grip, Hammer, Claw Hammer, Thor Hammer.
- Pliers checkbox is a labelled input[name=category_id] nested under Hand Tools, discoverable by exact accessible name, not a hard-coded seeded ID. Selection yields exactly Combination Pliers, Pliers, Bolt Cutters, Long Nose Pliers and Slip Joint Pliers. No pagination page buttons remain. This is category membership, not a product-name substring assumption; Bolt Cutters belongs, and out-of-stock Long Nose Pliers is still browsable.
- Clearing Pliers restores exactly the initial nine names. The category handler resets current page to 1; remaining default price/rental criteria still apply, so this is not a claim of an entirely unfiltered full catalogue.
- Pliers selected → search Hammer: search_completed; all selected category inputs count=0; exact caption `6 products found for 'Hammer'`; names: Claw Hammer with Shock Reduction Grip, Hammer, Claw Hammer, Thor Hammer, Claw Hammer with Fiberglass Handle, Court Hammer. No assertion of generic substring/token matching is inferred.
- Exploratory hierarchy: checking Hand Tools checked Hand Tools plus Hammer, Hand Saw, Wrench, Screwdriver, Pliers, Chisels and Measures. The full documented child-uncheck lifecycle was not exercised; no hierarchy scenario delivered.
- Exploratory inverse order: search Hammer then select Pliers retained the search and produced zero cards with `There are no products found.` This is observed but excluded from automated scope.

Primary assertions use exact cardinality and every expected product identity, independent of incidental ordering; transient completion markers are synchronization, not the membership oracle. No arbitrary sleeps, API setup or fixed category/product IDs.

## 6. Architecture impact

Implemented concrete CatalogPage additions only: scoped category checkbox collection/selected collection, exact-name checkbox locator and selection/clearing, and filter completion marker. Existing goto/search/openProduct methods are unchanged. Tests retain assertions, independent built-in contexts and explicit setup. No fixtures, generic filter framework/components, API helpers, data framework, storage state or parameterization infrastructure. All automation-owned delivered source is TypeScript. No changes to other POs, existing specs, dependency versions, strict config, controlled helper/pins or workflow/diagnostics. Clearing waits for the changed exact set rather than assuming a still-visible completion marker establishes a second response.

## 7. Files changed

| File | Purpose |
| --- | --- |
| docs/release-06-summary.md | Step 0 only: append human post-merge closure without rewriting prior history |
| docs/requirements.md | Step 0 approval/source reconciliation; Release 7 proposed 005 and precise extra coverage of unchanged 002 |
| docs/test-catalogue.md | Step 0 approved mappings; add T-CATALOG-004/005 and thirteen-case scope |
| pages/CatalogPage.ts | Concrete category locators and selection/clearing only |
| tests/category-filtering.spec.ts | Two independent UI scenarios with test-owned exact-set assertions |
| README.md | Current count/scope, spec and impacted-regression command; link closed Release 6 record |
| docs/release-07-summary.md | Persistent proposal, discovery, implementation, validation and review evidence |

Step 0's three documentation files were committed separately before Release 7 implementation. Local diff/protected-source inspection passed; final evidence-only diff review follows hosted execution. Unrelated pre-existing output/ and tmp/ are preserved, not staged; exploration/review/downloads stay ignored under .sut/.

## 8. Isolated validation

Local Windows execution on 2026-10-24, Node **v22.21.0**, npm **10.9.4**; npm lifecycle uses the existing TS helper:

| Command | Result |
| --- | --- |
| npm.cmd run typecheck | PASS, strict tsc --noEmit, exit 0 |
| npm.cmd run test:controlled -- tests/category-filtering.spec.ts --grep "visitor selects a category" | T-CATALOG-004 independently **1 passed (6.2s)**, exit 0 |
| npm.cmd run test:controlled -- tests/category-filtering.spec.ts --grep "visitor searches after category filtering" | T-CATALOG-005 independently **1 passed (5.2s)**, exit 0 |
| ./.sut/actionlint/actionlint.exe -shellcheck= .github/workflows/playwright.yml | PASS, unchanged workflow syntax |
| npx.cmd tsx .sut/review-release07.ts | PASS: separate three-doc closure commit; 22 protected baseline files unchanged; original CatalogPage methods unchanged; eleven existing specs/rows and requirement meanings/statuses after closure preserved; thirteen scenarios; exact seven-file scope; no generated credentials or JS source introduced |

Each controlled test invocation passed bounded API/frontend/database checks and independently reset/seeded accounts, lock counters and catalogue, then checked seeded-catalog readiness. Helper output confirms one Chromium worker and zero retries; unchanged child invocation includes --forbid-only. No arbitrary sleep, direct API setup, credentials output or inter-test state dependency.

## 9. Impacted regression

`npm.cmd run test:controlled -- tests/product-discovery.spec.ts tests/category-filtering.spec.ts`: **5 passed (11.3s)**, exit 0, fresh controlled reset/seed, one worker, zero retries. All three original Product Discovery scenarios and both new scenarios executed unchanged/independently.

## 10. Full regression

`npm.cmd run test:controlled`: **13 passed (35.4s)**, exit 0. All eleven original scenarios and both category scenarios executed; `Running 13 tests using 1 worker`, zero retries, unchanged --forbid-only, explicit controlled reset/seed and bounded API/frontend/database/catalog readiness. No functional assertion weakened, failure, skip or selection exclusion.

`npm.cmd run sut:down` exited 0: controlled containers/network/volumes removed; checkout/images retained. Subsequent `docker ps -aq`, `docker network ls -q` and `docker volume ls -q`, each filtered by label=com.docker.compose.project=toolshop-controlled, returned empty. A PowerShell guard failed if any remained; output: **Controlled containers, networks and volumes absent.**

Read-only environment checks: Docker client/engine **29.9.2**, Compose **v5.6.1**. Compose ps showed only angular-ui, laravel-api, web and mariadb at the unchanged four locked image digests (environment/toolshop.lock.json); UI/gateway loopback bindings unchanged. Gateway uname **aarch64**. Artisan APP_ENV **local**; schedule:list contained invoice:generate, queue:work --stop-when-empty and order:update, **no migrate:fresh registration**, and no cron service in the running service list. Existing FFI-module-already-loaded warning did not fail the checks.

## 11. GitHub Actions evidence

Actual [hosted run 40119286350](https://github.com/alvarotarrifaste/playwright-toolshop-automation/actions/runs/40119286350), [Chromium job 120947101085](https://github.com/alvarotarrifaste/playwright-toolshop-automation/actions/runs/40119286350/job/120947101085): **success**, workflow_dispatch attempt 1 on implementation commit **1ef4cb2a4b0bbb8307f740b4d274ab7f14d18159**, 2026-10-24 18:07–18:09 UTC. The existing workflow was dispatched with ref=release/07-category-filtering; no temporary triggers, flags or workflow changes. Final evidence-only commit changes this package, not the tested runtime tree.

Runner: Ubuntu 24.04 AMD64, image 20261012.334.1, Node **22.23.3**, npm **10.9.9**, Docker Engine **28.0.4**, Compose **v2.38.2**. Dependency install via npm ci, strict typecheck and Chromium/system dependency setup all passed.

| Hosted lifecycle evidence (UTC) | Result |
| --- | --- |
| 18:08:34 provisioning/start | Official tag 2.5 and exact upstream SHA verified; unchanged locked image environment provisioned |
| 18:09:04 API; 18:09:14 frontend | Bounded startup readiness passed; independent sut:ready passed at 18:09:15 |
| 18:09:15–16 architecture/scheduler | Exact pinned gateway inspected as linux/arm64, aarch64 execution through existing QEMU on AMD64 passed; APP_ENV=local, four controlled services, no destructive migrate:fresh registration |
| 18:09:19 reset/seed | Accounts, login counters and catalogue restored; API/frontend/seeded-catalog readiness passed before tests |
| 18:09:20–38 test execution | **13 passed (18.0s)**, one worker, zero retries, unchanged --forbid-only; all eleven baseline and both category scenarios executed |
| 18:09:40 teardown | sut:down passed; explicit label-filter guards verified **Controlled containers, networks and volumes absent.** |
| 18:09:41 artifacts | HTML report uploaded; failure-only diagnostics correctly skipped on green |

No public Toolshop target or account secrets introduced. Original assertions, controlled lifecycle and Release 4 retain-on-failure trace, only-on-failure screenshot, HTML reporter and failure-only artifact conditions are unchanged. Passing tests correctly retain no failure attachments. This is not a new controlled-failure experiment; historical failure-path evidence remains in the Release 4 package.

### Artifact/report verification

Downloaded [playwright-report artifact 12569799474](https://github.com/alvarotarrifaste/playwright-toolshop-automation/actions/runs/40119286350/artifacts/12569799474): **208,932 ZIP bytes**, unexpired when inspected; SHA256 **e2b7122f7817516de33d8c8684eca753cffe6fab03bdea285a238ca36c200a51** independently computed and equal to GitHub's digest. Created 2026-10-24T18:09:41Z, expires 2026-11-07T18:09:40Z (14 days).

Existing ignored authenticated GitHub helper downloaded /actions/artifacts/12569799474/zip to .sut/release07-report.zip. `npx.cmd tsx .sut/inspect-release07-report.ts .sut/release07-report.zip` inspected index.html and its native embedded report/detail JSON. Verified total=13, expected=13, unexpected=0, flaky=0, skipped=0, ok=true, actualWorkers=1, errors=[]; exact thirteen titles match current repository specs, with exactly one passed result each, retry=0, no retained failure attachments. Metadata links this run and tested implementation SHA. Both new tests are present, rather than inferred from a green job badge.

Review by downloading/extracting the artifact and running `npx playwright show-report <extracted-directory>`. Keep report files together. Future failures retain native trace/screenshot attachments and the separate playwright-test-results artifact; open traces with `npx playwright show-trace <trace.zip>`. Report retention is temporary; IDs, checksum and verified results are persisted here.

## 12. Risks / limitations

REQ-CATALOG-005 remains proposed; REQ-CATALOG-002 retains Requires confirmation. Exact expected sets depend on the controlled seed/pins; initial-page restoration does not cover other pages. Only category state is checked during search reset; no general all-filter reset claim. Anonymous/default English desktop Chromium only. Hierarchy, multiple categories, combination with brands/price, persistence/reload and authentication variants are deferred. Existing source/image provenance and hosted-runner drift limitations remain; no SUT redesign. Report/diagnostic retention is 14 days; diagnostics may contain test data. No new controlled-failure injection was performed; Release 4 settings and failure-only uploads remain unchanged. No blocker to this focused implementation or observed green execution.

## 13. Reviewer guide

First inspect the separate Release 6 closure commit and retained history. Then review pinned AC4/AC5 and runtime evidence → requirement proposal and precise boundaries → catalogue mappings → CatalogPage/spec → isolated/impacted/full/CI results → HTML artifact and teardown → protected baseline diff. Human leadership approves requirements/merge; do not infer approval from passing automation.

## 14. Interview defense

- Why these two paths? Category membership/clear and search resetting a stale category are distinct documented/observed risks, with small seed sets and strong visible oracles.
- Why include Bolt Cutters? It demonstrates that category membership is not equivalent to matching product names containing Pliers.
- Why exact sets without ordering? Count plus every expected identity detects missing/extra/wrong cards without inventing a sorting requirement.
- Why no all-page/category matrix? Pliers fits one page; the scoped contract is verifiable without adding pagination or broad filter infrastructure.
- Why reuse REQ-CATALOG-002? Its meaning already includes filter reset. Adding a narrow test improves traceability without repurposing an ID or claiming all its dimensions are covered.
- Why proposed/pending status? Product evidence and implementation are distinct from human approval; Release 6 closure demonstrates that distinction.

## 15. Release status

**Release 7 implementation and validation complete; ready for human review.** Release 6 CLOSED reconciliation is its separate first commit. Strict TS typecheck passed; isolated scenarios **1/1 each**; impacted regression **5/5**; full local **13/13**; hosted **13/13**, one worker, zero retries; artifact downloaded/checksum/native-report verified; local and hosted teardown verified. Protected-source and final diff review confirm existing eleven scenarios/assertions, previous CatalogPage methods, requirement meanings/statuses after Step 0, SUT pins, helper, dependencies, strict config, workflow and diagnostics are preserved. Original Release 6 pre-merge history remains intact. Only the seven listed files differ from main; no generated credential or new JavaScript source delivered.

Git delivery: base main 127cd227d9bacfb9a4649d02d4aade79e3666a18; branch release/07-category-filtering. First commit **9a77acb8ca951dc3a7be97231fb1171a688fe351**, docs: close Release 6 cart maintenance. Implementation **1ef4cb2a4b0bbb8307f740b4d274ab7f14d18159**, test: add Release 7 category filtering coverage. A final documentation-only evidence commit follows hosted verification. PR title **test: add category filtering coverage**, target main, open/not draft. Creation is the final delivery action after evidence commit/push; returned URL belongs in the handoff. Any automatic PR-event run begins afterward and is not represented as already complete here.

REQ-CATALOG-005 remains **Proposed**; existing REQ-CATALOG-002 remains **Requires confirmation**. Human leadership owns requirement approval and merge. No merge or Release 8 work.
