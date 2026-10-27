# Release 14 — Catalog Browsing & Filtering Expansion

## 1. Objective

Expand catalog breadth across distinct product-information, brand, browsing and combined-filter risks while preserving the R12 domain structure and deterministic controlled execution. Base: merged main **09884c2cb6b7b900679df00be6cc2e17c0f3ce2c**. Branch: `release/14-catalog-expansion`.

Discovery selected **four coverage increments: one strengthened existing scenario and three new UI scenarios**. Final suite **22 scenarios: 19 UI + 3 API**; catalog **8 UI**; smoke remains five. No data-only product-name variants or duplicate detail scenario.

## 2. R13 closure

Separate commit **0060c54**, `docs: close Release 13 authentication security`, appends [post-merge human closure](release-13-summary.md#20-post-merge-human-closure), updates REQ-API-AUTH-002 to Approved and maps T-API-AUTH-002 to that approved requirement. Original R13 sections 1–19, including Proposed history, remain unchanged. REQ-AUTH-005 approved implementation is confirmed; UI sign-out remains separate from explicit backend invalidation.

Supplied closure evidence: PR #17 merged, merge **09884c2cb6b7b900679df00be6cc2e17c0f3ce2c**, post-merge run **40523760365**, **19/19 PASS — 16 UI + 3 API**, strict types, 3/3 security checks, one worker/zero retries, reset/seed and teardown PASS, sanitized controlled-results artifact **12742912935**, raw HTML withheld. **Release 13 CLOSED.**

## 3. Catalog discovery

Inspected pinned Toolshop **2.5**, commit **9e7736c3841ec2bbb9a6822c9e6602353b7b9a65**, official stories, overview/detail/pagination templates and controllers, ProductService/Model/query middleware, client product service, product/brand/image/category seeds, and anonymous controlled runtime. Source and runtime evidence are separate; expected sets were derived from seeds before comparing UI results.

**P14 — Official pinned documentation:** [Sprint 5 stories](https://github.com/testsmith-io/practice-software-testing/blob/9e7736c3841ec2bbb9a6822c9e6602353b7b9a65/docs/user-stories/v5.md). Product Detail AC1 explicitly requires image, name, description, price, category badge and brand badge. Product Overview AC3 supports paginated browsing; AC7 supports one or more brand selections; AC8 requires category/brand intersection; AC10/11 describe price range. AC4 search resets filters and existing category coverage remain preserved.

**I14 — Official pinned source:** [overview component](https://github.com/testsmith-io/practice-software-testing/blob/9e7736c3841ec2bbb9a6822c9e6602353b7b9a65/sprint5/UI/src/app/products/overview/overview.component.ts), [overview template](https://github.com/testsmith-io/practice-software-testing/blob/9e7736c3841ec2bbb9a6822c9e6602353b7b9a65/sprint5/UI/src/app/products/overview/overview.component.html), [detail template](https://github.com/testsmith-io/practice-software-testing/blob/9e7736c3841ec2bbb9a6822c9e6602353b7b9a65/sprint5/UI/src/app/products/detail/detail.component.html), [pagination](https://github.com/testsmith-io/practice-software-testing/blob/9e7736c3841ec2bbb9a6822c9e6602353b7b9a65/sprint5/UI/src/app/pagination/pagination.component.ts), [ProductService](https://github.com/testsmith-io/practice-software-testing/blob/9e7736c3841ec2bbb9a6822c9e6602353b7b9a65/sprint5/API/app/Services/ProductService.php), [Product model](https://github.com/testsmith-io/practice-software-testing/blob/9e7736c3841ec2bbb9a6822c9e6602353b7b9a65/sprint5/API/app/Models/Product.php).

Brand changes preserve category/search/price criteria in requests and support multiple checked brands; clearing the sole brand removes its constraint. Backend category/brand whereIn scopes are chained, giving AND across dimensions and OR within one dimension. Those broader interactions were inspected, not all automated. Pagination uses nine items/page and contiguous numbered controls, next/previous guards, and source-driven current/last page metadata. First Previous and last Next are visually disabled on parent list items; they lack native disabled/aria-disabled on the button-role anchor. No DOM-class boundary oracle was added.

Price defaults are 1–100, slider floor 0/ceiling 200. It uses native keyboard-focusable slider roles named ngx-slider and ngx-slider-max and updates on userChangeEnd. Runtime Home on the upper slider shifted the range to 0–1, swapping handle roles rather than setting only the maximum. Numeric price filtering is feasible with deliberate keyboard steps, but adds handle/range/event synchronization beyond the selected AC8 risk. It is deferred, not declared unsupported; no pixel dragging, SUT mutation or hidden component-property injection.

**O14 — Controlled runtime:** matched all source-derived first/second/last default-page identities, nine MightyCraft default-range products, Pliers five → category/brand intersection three with both checked, and Combination Pliers price/category/brand/description/image. Image loaded with natural width 640. No generated resource ID was captured as an oracle. All observation scaffolding stays ignored under .sut/.

## 4. Existing coverage/gaps

Baseline catalog five: matching search, empty search, selected detail URL/name/button, category select/clear and search resetting category. T-CATALOG-003 lacked the other AC1 product information; there was no brand, pagination or AND-filter test. All nineteen R13 scenarios remain, with no baseline test removed/renamed and no shared action rewritten. R14 does not add price/sort/multi-brand/hierarchy matrices, related products, stock/discount/rental detail variants or every search/filter reset combination.

## 5. Requirement decisions

| Requirement | Status | Decision |
| --- | --- | --- |
| REQ-CATALOG-004 | **Requires confirmation**, unchanged | Stronger P14 Detail AC1 + I14/O14 evidence; extend existing T-CATALOG-003 without silently approving the broader candidate. |
| REQ-CATALOG-006 | **Proposed, human review pending** | Single-brand membership and sole-selection clearing; T-CATALOG-006. AC7 covers membership, source/runtime corroborate clearing. |
| REQ-CATALOG-007 | **Proposed, human review pending** | Pagination navigation/return; T-CATALOG-007. AC3 plus pinned controls/runtime support next/previous/numbered navigation. |
| REQ-CATALOG-008 | **Proposed, human review pending** | Category/brand intersection retaining both selections; T-CATALOG-008. AC8 + I14/O14. |

Requirements and evidence were recorded before new test implementation. REQ-CATALOG-002/003 remain Requires confirmation; REQ-CATALOG-005 stays Approved. Passing tests, documented behavior and stronger evidence do not confer human approval. No existing requirement meaning is broadened or ID repurposed.

## 6. Scenario selection rationale

- **Strengthen detail:** protect correct purchase-decision information, beyond successful navigation and a button. One seeded regular product is enough; a second nearly identical navigation case is unnecessary.
- **Brand select/clear:** protect brand membership and removal of a sticky constraint. One complete seeded brand fits one page, so cardinality plus every identity checks the entire default-range brand result.
- **Pagination:** protect access to products beyond the first nine and correct return paths, including a numbered jump to the last seeded page. This detects no-op/stale page updates and wrong page slices.
- **Category + brand:** protect AND semantics, distinct from standalone brand membership. An implementation that replaces category with brand, ignores brand or unions the dimensions can pass a brand-only test but fails the exact three-product intersection.

Four meaningful increments require only three additional test cases. No new smoke selections or coverage count target. Numeric price behavior and further combinations are deferred in favor of the explicit, high-value AC8 intersection contract.

## 7. Seed/oracle evidence

Sources: [ProductSeeder](https://github.com/testsmith-io/practice-software-testing/blob/9e7736c3841ec2bbb9a6822c9e6602353b7b9a65/sprint5/API/database/seeders/ProductSeeder.php), [BrandSeeder](https://github.com/testsmith-io/practice-software-testing/blob/9e7736c3841ec2bbb9a6822c9e6602353b7b9a65/sprint5/API/database/seeders/BrandSeeder.php), [ProductImageSeeder](https://github.com/testsmith-io/practice-software-testing/blob/9e7736c3841ec2bbb9a6822c9e6602353b7b9a65/sprint5/API/database/seeders/ProductImageSeeder.php). Local source extraction read names/prices/brand/category/rental flags, excluded rentals and applied the default range, then compared resulting oracles against runtime UI. No dynamic API result becomes the test's expected filter set.

| Oracle | Pinned source + controlled runtime |
| --- | --- |
| Catalog population | 53 seeded rows; 45 non-rental products under default 1–100 range; 9/page, 5 pages |
| Detail | Combination Pliers, 14.15, Pliers, ForgeFlex Tools; description includes “gripping, bending, and cutting wire”; local image pliers01.avif with matching alt and successfully loaded pixels |
| Default page 1 | Combination Pliers; Pliers; Bolt Cutters; Long Nose Pliers; Slip Joint Pliers; Claw Hammer with Shock Reduction Grip; Hammer; Claw Hammer; Thor Hammer |
| Default page 2 | Sledgehammer; Claw Hammer with Fiberglass Handle; Court Hammer; Wood Saw; Adjustable Wrench; Angled Spanner; Open-end Spanners (Set); Phillips Screwdriver; Mini Screwdriver |
| Default page 5 | Washers; Drawer Tool Cabinet; Tool Cabinet; Leather toolbelt; Sheet Sander; Belt Sander; Circular Saw; Cordless Drill 24V; Cordless Drill 12V |
| MightyCraft default-range set | Bolt Cutters; Long Nose Pliers; Slip Joint Pliers; Claw Hammer; Chisels Set; Screws; Drawer Tool Cabinet; Belt Sander; Cordless Drill 12V |
| Pliers category | Combination Pliers; Pliers; Bolt Cutters; Long Nose Pliers; Slip Joint Pliers |
| Pliers ∩ MightyCraft | Bolt Cutters; Long Nose Pliers; Slip Joint Pliers |

ForgeFlex has 36 and MightyCraft nine default-range members. Out-of-stock products remain in the catalog, so Long Nose Pliers is intentionally included; brand filtering is not an in-stock filter. Location-offer products are included by identity without adding discount/geo-price assertions.

Page partitions follow the fixed seed insertion/default controlled query behavior, independently observed after reset; they are not a universal ordering requirement. Tests assert exact cardinality and identity membership, not incidental order within each page. Pages 3/4 are not traversed. The brand-clear test snapshots the initial nine-card grid after a seeded anchor/count check and demands its exact identity restoration, avoiding another substantial duplicate first-page array. Existing small Pliers arrays remain readable local oracles; extracting data modules would change baseline tests without improving this release's clarity.

## 8. Test design

**T-CATALOG-003:** retain all old URL/name/button assertions, then assert 14.15, Pliers, ForgeFlex, visible meaningful description excerpt, correct image alt/src, visible image and successful load. No exact long description paragraph, stock counter, image dimensions, arbitrary generated ID or related metadata assertion.

**T-CATALOG-006:** own anonymous default catalog; initial nine cards and Combination Pliers anchor, snapshot names; check MightyCraft; selected state plus exactly all nine source-derived products; uncheck and assert original names/count restored. State and count alone cannot pass.

**T-CATALOG-007:** own default page 1 with exact nine identities, Page-5 present/Page-6 absent; Next → exact page 2; Previous → exact page 1; Page-5 → exact last-page set; Page-1 → exact initial set. Reused first-page array and explicit control actions keep all navigation/oracles visible.

**T-CATALOG-008:** own anonymous catalog; select Pliers and assert all five; select MightyCraft; both selections remain checked and exactly three expected identities remain. Rejects ignored/replacement/OR criteria without an exhaustive combination matrix.

Tests own their browser state and all assertions; no login, cart, test order, external data service, resource creation or backend mutation. Existing reset/seed supplies the same source data for every controlled invocation.

## 9. Architecture/Page Object impact

CatalogPage adds scoped brand checkbox/selection/clear and explicit Next/Previous/numbered-page actions. ProductDetailsPage adds only unit-price/category/brand/description/product-image locators. Existing constructors' members, search/product selection/category/cart actions and locators are unchanged. No generic applyFilter, strategy/service, BasePage, component framework, fixtures, data factory or test-data framework.

Existing filtering.spec.ts owns brand and intersection alongside category/search-reset. Search.spec.ts retains strengthened product discovery/detail. One browsing.spec.ts owns coherent pagination responsibility; no separate brand/price/details tiny files. All three new tests use @ui/@catalog/@regression. Existing npm test:catalog automatically discovers eight; smoke remains five.

Architecture gate: every increment protects a distinct risk **yes**; data-only duplicates **none**; oracles defensible **seed + runtime**; CatalogPage readable **concrete additive methods**; ProductDetailsPage focused **locators/actions only**; unjustified helper **none**; catalog directory ownership clear **search/filtering/browsing**; full domain selected by existing command **yes**; assertions stronger than visibility **exact metadata/sets/transitions**; suite deterministic **verified below**.

## 10. Locator decisions

Brand checkbox uses exact accessible name intersected with input[name=brand_id], matching the established category style and avoiding generated checkbox IDs. Pagination uses exact button-role accessible names Next, Previous and Page-N. No nth, coordinates, XPath, deep DOM chain or current-page Bootstrap class is introduced.

Detail unit price/category/brand use pinned aria-labels; description uses the existing semantic product-description test hook. The product image is scoped by native figure role and image role, excluding related-card/banner images. Alt and local asset filename identify the selected product; expect.poll checks complete/naturalWidth for actual loading without a fixed sleep. Stable seeded filename is an oracle, not a generated resource ID or application URL. No test hook is added to the external SUT.

## 11. Files changed

Separate closure: docs/release-13-summary.md, docs/requirements.md, docs/test-catalogue.md. Coverage: pages/catalog/CatalogPage.ts, pages/catalog/ProductDetailsPage.ts, tests/ui/catalog/search.spec.ts, tests/ui/catalog/filtering.spec.ts, new tests/ui/catalog/browsing.spec.ts. Current documentation: README.md, requirements/catalogue, new docs/release-14-summary.md.

Runner, Playwright/TypeScript config, npm commands/dependencies/lockfile, API/auth tests, scanner/security tests, workflow, environment template/exclusions and source/image pins remain unchanged. Unrelated output/ and tmp/ stay untouched/uncommitted; temporary observation/audit/results remain ignored in .sut/.

## 12. Isolated validation

Strict TypeScript **PASS**; discovery **22 tests in 10 files**; existing CI security checks **3/3 PASS**. **Strengthened detail 1/1 PASS; brand select/clear 1/1 PASS; pagination 1/1 PASS; category/brand intersection 1/1 PASS**, each independently through the existing controlled wrapper. Each run confirms reset/seed, one worker, zero retries, forbid-only and one passed result at retry 0. Compact results scanned clean; raw HTML withheld.

## 13. Catalog regression

`npm.cmd run test:catalog`: **8/8 UI PASS**, with private reporter capture and independently verified compact metadata. Original matching/no-match/detail/category-clear/search-reset and all three additions execute through the same domain tag selection. Reset/seed=true, configured/actual workers=1, retries=[0], forbidOnly=true; no unexpected/flaky/skipped/global errors.

## 14. Impacted regression

Existing cart suite: **4/4 PASS** after reset/seed, including anonymous/authenticated add, saved quantity update and selected-product removal. Both Page Objects retain all original actions/locators exactly. No checkout/purchase-specific run was planned for additive locators; investigation of the initial full-run timeout below additionally verified anonymous checkout **1/1 PASS**. Full regression includes all three checkout/purchase cases.

## 15. Full regression

**Final controlled full regression: 22/22 PASS — 19 UI + 3 API**, 63.9s. Every exact repository title has one passed retry-0 result. Expected=22, unexpected/flaky/skipped/global errors=0, configured/actual worker=1, configuredRetries=[0], forbidOnly=true and resetSeedConfirmed=true.

The first full execution had **21 passes and one unchanged anonymous-checkout timeout**. Private trace timing showed an earlier toHaveText assertion taking about 28.8s of the unchanged 30s test budget; a later proceed-button check then exhausted that budget. This identifies the timing overrun, not an established underlying cause. All catalog increments passed in that run. No assertion, action, test budget or retry setting was changed. The affected checkout case passed independently after controlled reset, and a separate full invocation then passed 22/22. Initial failure and scan decisions remain preserved privately; it is not relabeled as a pass or an automatic retry. Initial failed raw diagnostics and HTML were withheld by the unchanged scanner.

Independent source comparison confirms all nineteen baseline cases/assertions retained; only detail assertions are additive. Removing only new Page Object members restores both original files exactly. All other Page Objects, helper/config, npm aliases/dependencies/lockfile, API/auth specs, scanner/security tests, workflow and SUT pins are unchanged. Source-derived arrays match the implemented expected sets. Tag audit confirms 22 tests with one layer/domain/regression and five smoke cases. Current file links resolve and changed source/docs contain no injected credentials. actionlint and git diff --check PASS.

Final public compact evidence scanned clean; raw HTML withheld. Result SHA256 **bd2ffcae105667601d760a4e3f00d6719fd046123727f92418929c19ce4141f1**. npm.cmd run sut:down PASS; independent Docker label queries verified no controlled containers, networks or volumes.

## 16. CI/security evidence

Local security checks **3/3 PASS**. Hosted [run 40531788650](https://github.com/alvarotarrifaste/playwright-toolshop-automation/actions/runs/40531788650), job **122286279519**, at **0ebc35b9136b98ec8c9aa30a690467311d8ec916**: **SUCCESS**. Subsequent delivery edits only record this evidence in documentation.

| Hosted evidence | Result |
| --- | --- |
| Strict TypeScript | **PASS** |
| CI evidence security checks | **3/3 PASS** |
| Full controlled regression | **22/22 PASS — 19 UI + 3 API** |
| Result integrity | All 22 exact repository titles; expected=22; unexpected/flaky/skipped/global errors=0 |
| Execution contract | Configured/actual worker=1; retries=[0]; every case passed at retry 0; forbidOnly=true |
| Reset/seed | **PASS**, confirmed in compact evidence |
| Teardown | **PASS**, logs confirm controlled containers/networks/volumes absent |
| Public artifact | Only sanitized **controlled-results**, artifact **12745639517**, **1399 bytes**, 14-day retention |
| Scan decisions | Summary clean; raw HTML withheld as sensitive-or-uninspectable; diagnostic metadata clean, no failure upload on green run |
| Public log audit | **23 log files scanned clean** against injected credentials/auth material |

Downloaded ZIP contains exactly results.json and scan.json. ZIP SHA256 **0a8682bf0939c1b7fa575408aaf3e63ffc99626c50f049ebb5cd388203ef045f** matches GitHub artifact metadata. Result SHA256 **bd2ffcae105667601d760a4e3f00d6719fd046123727f92418929c19ce4141f1** matches the scan manifest. Independent inspection verifies exact title/outcome/retry records, UI/API counts, execution flags, reset/seed, resource absence, publication decisions and log security. Existing scanner, compact allowlist, request-only API trace policy, private diagnostics, sanitized staging/re-scan, workflow publication and teardown contracts remain unchanged. No credentials, tokens or runtime IDs enter tags, titles or oracle data.

## 17. Risks/limitations

New requirements 006/007/008 remain Proposed; existing candidates 002/003/004 remain Requires confirmation. Pinned seeded page partitions are controlled-environment oracles, not a production sort guarantee. One single-brand and one leaf-category/brand intersection do not prove multi-brand, hierarchy, price/sort/search combinations or pagination retention/reset under filters. Price keyboard interaction and visual disabled boundary semantics were inspected but not automated. Image verification checks identity/load, not screenshot similarity. Existing one-SUT, one-worker, zero-retry/reset/seed and no overlapping manual-run constraints remain.

One initial local baseline checkout timeout remains part of the evidence history. Its isolated follow-up, final local full run and hosted full run passed without assertion, action, timeout or retry-setting changes; the underlying timing-overrun cause was not established. This is not hidden by automatic retries or represented as a first-run pass.

## 18. Reviewer guide

Review separate R13 closure and unchanged historical prefix, then P14/I14/O14 and source-derived oracle table. Compare the three proposed requirements to exact implemented scope. Read the strengthened detail assertions and additive concrete Page Object members; compare original method bodies. Review brand clearing versus AND semantics as distinct risks and browsing's exact page memberships without an ordering claim. Check isolated/catalog/cart/full results, seed/runtime comparison, protected baseline diff, typecheck/security/hosted evidence, withheld HTML and teardown. Human owns requirement approval and merge.

## 19. Interview defense

- Why extend detail? It is the same selected-product responsibility; AC1 provides meaningful metadata oracles without duplicate navigation.
- Why both brand and intersection? Membership/clear cannot detect replacing or OR-ing category during combination; AC8 has a separate business rule.
- Why one browsing file? Pagination is a coherent navigation responsibility; filter/detail coverage remains in its existing files.
- Why literal sets? They are readable controlled data oracles backed by pinned seeds and runtime, not configuration or generated IDs.
- Why defer price? Semantic control exists, but handle/event behavior needs focused design; the explicit AND contract offers clear distinct value within four increments.
- Why no generic filter abstraction? Category/brand/pagination are a few concrete actions; a framework would hide behavior and assertions.
- Why no new smoke tests? Smoke intent is a deliberate critical-path subset, not a reward for adding coverage.

## 20. Release status

**Release 14 implementation and validation complete; ready for human review through an OPEN PR against main.** Four catalog increments delivered through one strengthened and three new UI tests, preserving all nineteen baseline scenarios. Catalog 8/8, cart 4/4, isolated increments, strict types, security 3/3, final local/hosted 22/22, artifact/log integrity, teardown and diff checks pass. Source/runtime-backed proposed requirements await human approval. Initial local timeout and coverage limits remain explicit. Release 13 is CLOSED. Delivery stops before merge; Release 15 is not started.
