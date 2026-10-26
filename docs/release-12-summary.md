# Release 12 — Portfolio Architecture & Test Segmentation

## 1. Objective

Organize the existing suite for portfolio review and further UI/API coverage while preserving all 17 scenarios, assertions, resource ownership, controlled SUT and CI security behavior. Branch: `release/12-portfolio-architecture`. Base: merged Release 11 main, `99be0a4fe9662808d477c31b76092f0ff81ad39d`.

Step 0 is separate commit `4802a32`, `docs: close Release 11 purchase completion`. Explicit human approval L11 updates REQ-PURCHASE-001 and T-PURCHASE-001 and appends the [Release 11 closure](release-11-summary.md#16-post-merge-human-closure). Original Proposed history is preserved. Supplied post-merge evidence: PR #15, run 40403034808, 17/17 (16 UI + 1 API), strict typecheck, 3/3 security checks, one worker/zero retries, reset/seed and teardown PASS, sanitized controlled-results published, raw HTML withheld. Approval retains the exact authenticated seeded-customer COD scope; no settlement, fulfillment, shipping, email, guest or other-method claim is added.

## 2. Previous structure

Eight specs lived directly in `tests/`, mixing UI and request-only coverage. Five Page Objects lived directly in `pages/`. Tests were selected by remembered filenames; only the full controlled npm command existed. README carried substantial historical and release-level operational narrative.

## 3. New structure

| Previous spec under tests/ | Current spec under tests/ | Scenarios |
| --- | --- | --- |
| login.spec.ts | ui/authentication/authentication.spec.ts | 4 |
| product-discovery.spec.ts | ui/catalog/search.spec.ts | 3 |
| category-filtering.spec.ts | ui/catalog/filtering.spec.ts | 2 |
| cart.spec.ts | ui/cart/add-to-cart.spec.ts | 2 |
| cart-maintenance.spec.ts | ui/cart/cart-maintenance.spec.ts | 2 |
| checkout-billing.spec.ts | ui/checkout/identity-billing.spec.ts | 2 |
| purchase-completion.spec.ts | ui/checkout/purchase.spec.ts | 1 |
| api-authorization.spec.ts | api/authentication/authorization.spec.ts | 1 |

| Previous Page Object under pages/ | Current path under pages/ |
| --- | --- |
| LoginPage.ts | authentication/LoginPage.ts |
| CatalogPage.ts | catalog/CatalogPage.ts |
| ProductDetailsPage.ts | catalog/ProductDetailsPage.ts |
| CartPage.ts | cart/CartPage.ts |
| CheckoutPage.ts | checkout/CheckoutPage.ts |

No class renamed; no spec split; no scenario duplicated. Purchase remains a UI test despite independent backend readback through the authenticated application route. API authorization remains request-only inside the existing Chromium project.

## 4. Architectural rationale

Layer is the first test boundary, domain the next. Page Objects follow functional domains without an artificial UI/API hierarchy. Imports go straight to concrete classes, with no barrel files. Search retains its coherent product-discovery/details coverage. Purchase belongs to checkout; a separate purchase domain would add little value for one path.

Tests own business setup, assertions and expected values. Concrete Page Objects own locators/actions. Existing lifecycle and CI evidence modules keep their responsibilities. No BasePage, BaseTest, inheritance, generic framework/helper/API client/data factory, container, fixture hierarchy, dependency injection or Playwright wrapper was introduced. A new domain can add its own folder and direct imports without changing a framework registry.

Architecture gate: authentication is directly discoverable; UI/API are visibly distinct; each Page Object has a domain home; additional domains do not return to a flat root; native grep selects subsets; environment configuration is unchanged; readable oracles remain explicit. Complexity falls through navigation and selection improvements; runtime abstraction count is unchanged.

## 5. Test categorization convention

Native Playwright test details use `{ tag: [...] }`, keeping titles and documentation IDs unchanged.

- Exactly one layer: `@ui` or `@api`.
- Exactly one primary domain: `@auth`, `@catalog`, `@cart`, `@checkout`.
- All 17 scenarios: `@regression`.
- Five also have `@smoke`: successful UI login, matching catalog search, anonymous add-to-cart, authenticated COD purchase, API authorization boundary.

Smoke samples authentication, discovery, cart, purchase persistence and API protection without copying scenarios. It deliberately excludes negative login, filtering variants and duplicate session variants. Smoke includes one persistent purchase and therefore requires the same disposable-state envelope as full regression. Tags are engineering selection metadata, not requirement approval or P0/P1/P2 priorities. `@auth` spans both layers; combine native grep criteria when a narrower intersection is needed.

## 6. Execution commands

| Command | Native selection | Expected count |
| --- | --- | --- |
| npm run test:controlled | All discovered tests | 17 |
| npm run test:ui | --grep @ui | 16 |
| npm run test:api | --grep @api | 1 |
| npm run test:smoke | --grep @smoke | 5 |
| npm run test:auth | --grep @auth | 5 |
| npm run test:catalog | --grep @catalog | 5 |
| npm run test:cart | --grep @cart | 4 |
| npm run test:checkout | --grep @checkout | 3 |

Each new command delegates to `npm run test:controlled -- --grep ...`. There is one lifecycle implementation. Start services explicitly with `sut:up`; every test invocation checks readiness, resets/seeds and injects controlled credentials. Teardown remains explicit locally and always-run/verified in CI. Full regression remains the authoritative CI suite; no workflow filter, matrix or second pipeline is introduced.

## 7. README strategy

README is rewritten as a portfolio entry point: solution overview, concise coverage table, architecture, test organization, environment concept, setup/subset commands, CI/security, principles and phase-based evolution. Detailed historical evidence remains in release packages. Current requirements and catalogue paths follow the moved specs; historical packages retain original paths, commands and classifications as execution history. The README links the current release package and R11 closure instead of narrating every PR/run.

## 8. Configuration/hardcoding review

`playwright.config.ts` and `scripts/toolshop.ts` were inspected and retained unchanged. General direct execution has config-level CI defaults (including two retries); controlled execution and CI explicitly pass `--project=chromium --workers=1 --retries=0 --forbid-only`. CLI settings govern those runs. README documents precedence. No configuration change was necessary to deliver segmentation, avoiding a behavioral redesign during structural moves.

No new configuration URL, credential, generated resource ID, token or secret is added to executable code. Existing UI baseURL, controlled endpoints, digest metadata and injected credentials remain unchanged. The API pilot retains its existing fixed controlled loopback baseURL and trace-off override; this release does not generalize it into a configurable multi-environment API framework. Before supporting another API environment, make its endpoint part of that explicit configuration decision.

Seeded product names/prices, documented UI text, HTTP statuses, synthetic billing and initial invoice status remain readable intentional test oracles. Dynamic cart/invoice identities still come from runtime responses. No oracle was moved into a generic data layer. No dependencies, package-lock, env exclusions, source pins or secret-handling changes.

Documentation reconciliation corrects current catalogue R10/R11 Proposed wording using recorded L10 and supplied L11 human decisions. Tracked R7/R8 records contain no explicit REQ-CATALOG-005 approval; it remains Proposed pending a sourced human decision. REQ-CATALOG-002 and other Requires confirmation/Deferred items are not promoted. Historical packages remain historical.

## 9. Files moved/changed

Thirteen moves: eight specs and five Page Objects, mapped above. Test edits are solely import relocation and native tags; Page Object contents are unchanged. `package.json` adds seven aliases. README is rewritten. `docs/requirements.md` and `docs/test-catalogue.md` follow current test paths and approval wording. This detailed package is new. Step 0 separately updated requirements, catalogue and the append-only R11 closure.

The compact CI result builder now classifies layer from native `@api` metadata instead of the old API filename. Its existing third security test covers API and UI classification while retaining secret-exclusion/failure assertions; the check count stays three. Scanner rules, public-field allowlist, staging and publication are unchanged.

Protected unchanged files: Playwright/TypeScript config, toolshop helper, workflow, SUT lock, package-lock and environment exclusions/template. Existing unrelated untracked `output/` and `tmp/` are untouched and excluded from commits. Temporary comparison/validation scripts and raw results remain ignored under `.sut/`.

## 10. Functional-equivalence validation

A baseline comparison against merge `99be0a4` reverses only the exact import relocation and added `{ tag: [...] }` argument, then requires exact equality of every spec. It confirms all 17 titles, bodies, assertions, credential guards, synchronization, request handling and independence are unchanged. Five moved Page Objects match baseline contents exactly. Protected config/lifecycle/pin/dependency files also match baseline exactly. Reversing the one layer-classification expression makes the CI evidence module identical to baseline; scanning behavior is unchanged.

Strict TypeScript **PASS**. Native discovery **17 tests in 8 files**, 16 UI + 1 API, under the existing Chromium project; no duplicate legacy specs remain. Imports resolve through recursive existing tsconfig includes. CI evidence security tests **3/3 PASS**.

All seven npm subset commands were executed, each through the unchanged controlled lifecycle with confirmed reset/seed:

| Command | Result |
| --- | --- |
| npm run test:ui | **16/16 PASS** |
| npm run test:api | **1/1 PASS** |
| npm run test:smoke | **5/5 PASS** |
| npm run test:auth | **5/5 PASS** |
| npm run test:catalog | **5/5 PASS** |
| npm run test:cart | **4/4 PASS** |
| npm run test:checkout | **3/3 PASS** |

An initial UI invocation during startup was rejected by the existing lifecycle lock before tests/reset ran. After startup completed, all validation ran sequentially; no lock was removed or bypassed. This is operational exclusion evidence, not a scenario failure or retry.

Tag audit confirms the one-layer/one-domain convention for all 17 tests and exactly five smoke cases. Current README/requirements/catalogue/package file links resolve. Tracked source excludes injected controlled credentials. Unchanged workflow passes actionlint; `git diff --check` passes.

## 11. Full regression

`npx.cmd tsx scripts/ci-evidence.ts run`: **17/17 PASS**, 42.2s, **16 UI + 1 API**. Every exact repository title has one passed result at retry 0. Expected=17, unexpected/flaky/skipped/global errors=0, configured/actual workers=1, configured retries=[0], forbidOnly=true and resetSeedConfirmed=true.

The first compact summary exposed reporter normalization: JSON tags omit `@`, unlike source tag declarations. The classification expression and synthetic reporter fixture were corrected to `api`/`ui`; strict typecheck and all three security checks passed again. Compact evidence was regenerated from the same successful private JSON/console input, then scanned. This correction changes reporting metadata only. Hosted execution below validates the final classifier end to end.

`npx.cmd tsx scripts/ci-evidence.ts scan` approved the compact summary and withheld raw HTML as sensitive-or-uninspectable. Independent result verification confirmed all 17 exact titles, 16 UI + 1 API, execution flags, no failures/flakes/skips and clean sanitized summary. `npm.cmd run sut:down` passed; subsequent label-filtered Docker checks returned no controlled containers, networks or volumes.

## 12. CI/security evidence

Scanner rules and workflow remain unchanged; the compact builder's layer classification follows native tags after the move. Local security checks: **3/3 PASS**, including API/UI classification and existing failure/secret exclusion. Hosted full-suite run, artifact decision and teardown evidence will be recorded after execution. Raw local console/JSON/HTML stay private; public candidates are scanned/staged/re-scanned through the existing wrapper.

## 13. Risks/limitations

File-based bookmarks and external commands must use the new paths. Historical packages deliberately refer to original paths and commands. Native Playwright identities include file locations, so historical report grouping can change even though titles and documented IDs remain stable. Smoke is selective and cannot replace full regression. Adding a test requires assigning layer/domain/intent tags; full-suite discovery does not depend on those tags. Existing single-SUT, one-worker/no-concurrent-manual-run constraints still apply. Direct Playwright execution bypasses lifecycle protections; controlled commands are the reference path.

## 14. Reviewer guide

Review the separate R11 closure first, then the rename-aware diff. Check all eight spec moves against the map and compare bodies after stripping only tags/import changes. Open any test and follow its direct Page Object imports. Check npm aliases delegate to the existing runner. Read README as a fresh project introduction and use requirements/catalogue for current traceability. Review discovery, subset counts, full regression, unchanged scanner checks and hosted evidence before approval. Human owns merge.

## 15. Interview defense

- Why folders and tags? Folders locate ownership; native tags select cross-cutting execution intent without another runner.
- Why one browser project for API? The existing request-only case needs no browser fixture, and segregation does not require multiplying projects or pipelines.
- Why keep literal prices/statuses? They are explicit test oracles, not duplicated deployment configuration.
- Why no base framework? Five concrete Page Objects already express the necessary interactions; structural clarity needs no inheritance or fixture system.
- Why full CI after smoke? Smoke gives faster focused feedback; full regression protects all retained behavior and stays authoritative.
- Why preserve config? Existing controlled CLI overrides are deterministic and explicit; documenting their precedence avoids unnecessary execution change.
- Why no per-invoice cleanup? Existing reset/seed and disposable teardown own persisted purchase/queue/stock state; segmentation does not change lifecycle ownership.

## 16. Release status

Implementation complete; validation and hosted evidence in progress. Release 11 is CLOSED by explicit human approval. Release 12 will be delivered as an OPEN PR against main and will stop before human merge. Release 13 is not started.
