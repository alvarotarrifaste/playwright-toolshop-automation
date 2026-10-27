# Release 16 — Reliability, Stabilization & Portfolio Defense

## 1. Objective

Final engineering sprint before Portfolio v1.0 freeze. Base: merged main **8b9424eb5f7ba9956ce0013d795d373aaa24b8f7**. Branch: `release/16-portfolio-stabilization`. Preserve **26 scenarios: 23 UI + 3 API** and improve reliability evidence, debugging practice, current-state documentation and technical defensibility. No new functional release, deferred feature, framework, browser, parallel runner or API endpoint.

## 2. R15 closure

Separate commit **b7b74ac**, `docs: close Release 15 cart and checkout coverage`, appends [post-merge human closure](release-15-summary.md#22-post-merge-human-closure), preserving original sections and Proposed/failure history. PR #19 merged at **8b9424eb5f7ba9956ce0013d795d373aaa24b8f7**. Main push [run 40553420592](https://github.com/alvarotarrifaste/playwright-toolshop-automation/actions/runs/40553420592), job **122362968527**, independently verified **completed/success** at that exact SHA.

Verified: **26/26 — 23 UI + 3 API**, exact titles, strict TypeScript PASS, CI security **3/3 PASS**, configured/actual worker 1, retries [0], one passed retry-0 result each, forbid-only, reset/seed and teardown. Only controlled-results artifact **12756815168**, 1531 bytes; ZIP hash **d3495743b8d6b9fd16cafd3c5c565d42de98abcc7364c0c30b672a69a9e5e60c**, result hash **519c3e87a9f8282c02891dab55b336b23979b8c1ce6bb4bae6988420c9920bc6**, metadata/manifest matched. HTML withheld as sensitive-or-uninspectable; diagnostic metadata clean and failure-only upload skipped; **23 public logs clean**.

Human L15 approves REQ-CART-004/005, REQ-PURCHASE-002 and REQ-CHECKOUT-002 with exact existing scope. Guest acceptance is creation/server amount/reference/null ownership/matching UI/cart deletion/independent cart GET 404; operational invoice audit remains outside the automated path. Authenticated purchase retains independent persisted invoice readback. **Release 15 CLOSED.**

## 3. v1.0 baseline

26 tests across 11 spec files; UI 23, API 3, smoke 5, auth 7, catalog 8, cart 6, checkout 5. Native layer/domain/regression taxonomy is unchanged. Five concrete Page Objects, test-owned assertions, strict TypeScript, pinned Toolshop 2.5 and the same controlled one-worker/zero-retry/forbid-only path. No production code, functional test, config, dependency or workflow change is required by the investigation.

## 4. Reliability signals reviewed

| Signal | First reported failure / retained evidence | What can be concluded |
| --- | --- | --- |
| R14 initial local 21/22 | Anonymous checkout exhausted 30s test budget; later proceed check failed after product-name toHaveText took 28.8s. Private trace/timing and compact failure/scan retained; isolated/final full passed unchanged. | Timing overrun is confirmed. Successful catalogue/product requests in that trace were about 65–80ms; some product GETs aborted. A slow backend or wrong selector is not established by these samples. |
| R15 initial local 25/26 | Anonymous add timed out filling Search while navigation was pending, before cart actions. Compact failure/scan and recorded symptom retained; isolated/final local/hosted runs passed unchanged. | First affected phase is navigation/search, not demonstrated cart behavior. Original raw trace was not retained for full causal reconstruction. Same cause as R14 is unproven. |

Source review found service readiness checks API/bootstrap HTML rather than Angular route/render completion, while tests rely on Playwright locator/action/assertion waiting within their unchanged budgets. This is a hypothesis direction, not proof of a missing test wait. No CPU/browser telemetry from the historical incidents establishes host pressure. Do not label either signal a confirmed Application or Automation bug.

## 5. Debugging exercises

All four exercises were actually run against the controlled SUT using existing cases selected independently. Ignored local scripts backed up source, injected one fault, captured private evidence and restored bytes in finally; durable original backups/checksums were verified against merged main. Child-only env overrides did not modify .env files. No deliberate defect or extra test remains in the final suite.

| Exercise | Injection / first failure | Evidence and result |
| --- | --- | --- |
| B1 assertion | Detail unit-price expectation 14.15 → 99.99 | Nonzero exit, 1 unexpected; expected 99.99/received 14.15. Screenshot inspected: correct product/14.15 visible. Trace inspected: unit-price assertion; product requests succeeded. Restore exact expected value. |
| B2 locator | Search placeholder → R16 Missing Search | Nonzero exit, 1 timedOut at fill. Trace requests nonexistent placeholder; screenshot shows rendered catalogue, DOM/error context shows real textbox Search, product QUERY 200. Restore exact locator. |
| B3 data | Child positive email → non-seeded reserved-domain identity | Nonzero exit, 1 unexpected; reset/seed succeeded and test began; API login expected 200/received 401. No real customer received a threshold sequence. Request tracing off by policy; status/console suffice. Remove override. |
| B4 setup | Child TEST_USER_PASSWORD empty | Nonzero exit, reportAvailable=false, zero tests and no reset confirmation; required-variable guard stopped execution. Restore setup, not a product assertion. |

For B1/B2, native screenshots/trace archives were privately copied before another run could replace them and were visually/structurally inspected. All experiment compact summaries scanned clean; opaque/sensitive HTML/diagnostics were withheld. Existing API failure context can contain auth-shaped source text, and setup may leave older native folders in a reused workspace; current compact/console and execution stage determine relevance. No raw artifact is committed or published.

## 6. Failure classifications

| Primary category | R16 application |
| --- | --- |
| Application | No actual Application defect was injected or confirmed; correct supported behavior must contradict a reviewed requirement before assigning this ownership. |
| Automation | B1 wrong oracle and B2 nonexistent selector: confirmed injected causes, correct SUT rendering corroborated. |
| Environment / Data | B3 non-seeded identity after successful startup/reset; test and SUT can both be correct. |
| Pipeline / Setup | B4 missing mandatory configuration before reset/tests. |

Every exercise followed stop-stage → SUT → reset/seed → test start → first failing step → current evidence → isolated reproduction → supported category → smallest restoration. The injected causes are known and confirmed; they are not explanations retrofitted to historical timeouts.

## 7. Root-cause findings and hypotheses

Confirmed roots: deliberately wrong assertion, deliberately wrong locator, deliberately wrong identity, deliberately missing setup input. Confirmed historical symptoms: local budget exhaustion and navigation/search delay. Historical root causes remain **unresolved intermittent observations**. Frontend/render scheduling, browser/host pressure, aborted/reissued requests and automation readiness are hypotheses; no evidence proves one shared cause.

No timeout/retry inflation, assertion weakening, navigation wrapper or production-code fix is justified. Further recurrence should preserve current raw JSON/console/trace before replacement, record host/Docker/browser timing and correlate the first delayed operation. Reruns should test an isolation/restoration hypothesis; they must not erase the first failure or substitute for investigation.

## 8. Maintainability audit

The deep dive contains the detailed finding/action table. Classification summary:

- **Fix before v1.0:** duplicate current requirement entries, stale release-centric counts/status narration and scattered defense material. Consolidate docs, not test architecture.
- **Acceptable explicit duplication:** scenario-owned login/cart/billing setup and a few direct auth requests; concrete guest-form interaction already reused in CheckoutPage.
- **Intentional controlled oracle:** pinned products/prices/sets/synthetic data, observed empty copy and correlated runtime identities.
- **Future improvement:** row-scoped multi-line quantity editing if needed, simpler direct-run config defaults, telemetry/run correlation and long-lived/concurrent ownership.
- **No action:** current Page Object boundaries, tags/aliases, pins, lifecycle, conservative evidence scanner and one-SUT contract.

No BasePage, API client, generic filter/form/flow helper, factory or fixture hierarchy is added. Expected engineering outcome is less ambiguity with unchanged functional code.

## 9. Locator review

Semantic roles/labels and stable app hooks dominate. Cart delete uses one identified row plus scoped a.btn-danger because the pinned delete anchor lacks a usable accessible name/test hook. Two nth quantity checks exist in the exact two-row R6 case, both expecting 1 and constrained by product/totals assertions; no failure supports mechanically rewriting them. Checkout component/tab scoping avoids duplicate email/field labels.

R15 exact empty copy is intentionally retained: it is pinned source/runtime evidence within the human-approved scoped case, and zero-items/total/proceed/readback independently protect business state. The story discrepancy remains explicit. No observed reliability failure is tied to that copy, so R16 neither changes its meaning nor weakens it merely because wording differs. No new locator factory or SUT test hook.

## 10. Configuration/hardcoding audit

Functional tests contain no application URLs/ports, real credentials, JWT constants, generated IDs, invoice IDs or machine paths. UI navigations use baseURL; API specs use injected API_BASE_URL; the guest cart read derives origin from its actual creation response. Lifecycle owns controlled endpoints/ports and pinned Compose; configuration/template manual defaults are documented rather than hidden in tests. Deliberate wrong passwords and seeded expected values are legitimate inputs/oracles.

No fixed test sleeps; readiness polling is bounded infrastructure logic. Storage access checks cart correlation/clear state or auth absence, not token extraction. Scenario-specific method/path/owned-ID response predicates remain test-owned. CLI controlled flags override general config defaults; unsupported direct Playwright execution bypasses lifecycle protections. No config change is forced without a demonstrated defect.

## 11. Architecture decisions

Retain UI/API domain layout, five composed Page Objects, direct imports and assertions in tests. Explicit oracles are more understandable than a generic data layer. Reset/down owns persistent state; browser isolation alone does not. R9's fixture investigation and R15's two-purchase recovery support no custom cleanup fixture within this envelope. User-visible sign-out and backend token revocation remain different; guest acceptance does not pretend to have anonymous invoice readback. Coverage stops at 26 representative risks.

## 12. Documentation consolidation

README becomes the concise project entry point. New [solution-architecture-and-defense.md](solution-architecture-and-defense.md) is the single primary technical deep dive covering architecture, strategy, Docker, exact CI chain, Git delivery, durable decisions, debugging/taxonomy, limitations and defense prompts. Requirements/catalogue become authoritative current-state references. Historical release packages/ADRs retain their original truth, with only R15 closure appended.

## 13. README final state

Purpose/e-commerce, Playwright/TypeScript stack, 26-case scope, directory ownership, controlled setup/lifecycle, eight selections, high-level CI/security and four documentation links. No requirement matrix, interview script, individual CI/PR/hash diary or Docker tutorial. Guest/authenticated oracle distinction is concise. v1.0 is a review candidate, not declared merged/frozen.

## 14. Portfolio Evolution

Compact three-column history: Release/Sprint, actual branch, short incremental value. R1–R16 plus meaningful TypeScript migration and authenticated-cart follow-up use existing local/remote refs; no invented branches. R9 value explicitly states the ownership investigation did not introduce a fixture. No PR, commit, run, artifact or requirement IDs in that table.

## 15. Solution architecture/defense document

Ten sections centralize the durable model. Nineteen concise question/concept/evidence prompts cover automation, TypeScript, Page Objects/no BasePage, Docker/public target/reset, Actions/failure triage, one worker/zero retries, UI/API selection, secrets, sign-out/revocation, intermittence ownership, 26-case scope, AI assistance and future team improvements. AI-assisted authorship and human scope/review/acceptance are stated accurately; agent-executed evidence is not mislabeled independent personal mastery or seniority.

## 16. Requirements/catalogue reconciliation

One current entry per requirement, current paths and full IDs; one row per exact test title/ID. All R15 proposals now human-approved L15 with unchanged boundaries; original proposal records remain in historical packages/closure. AUTH-003/004 and CATALOG-002/003/004 remain Requires confirmation. No arbitrary approvals or new requirements. Historical counts are removed from current-state narration rather than altering historical packages.

## 17. Subset validation

All seven subset aliases were actually executed through npm.cmd on Windows after exact injection restoration. Each invoked the existing controlled lifecycle, reset/seed and Chromium; all had one actual/configured worker, retries [0], forbid-only, zero unexpected/flaky/skipped/global errors and one passed retry-0 result per selected test. Native discovery listed **26 tests in 11 files**; the independent source/tag audit matched all exact titles, one layer/domain/regression and the original five smoke cases.

| Command | Result | Playwright duration |
| --- | --- | --- |
| npm run test:ui | **23/23 PASS** | 66.915s |
| npm run test:api | **3/3 PASS** | 2.676s |
| npm run test:smoke | **5/5 PASS** | 17.652s |
| npm run test:auth | **7/7 PASS** | 11.082s |
| npm run test:catalog | **8/8 PASS** | 16.199s |
| npm run test:cart | **6/6 PASS** | 22.949s |
| npm run test:checkout | **5/5 PASS** | 20.461s |

Durations are native suite durations, excluding reset/seed and audit overhead. Every subset's compact summary scanned clean; HTML was withheld as sensitive-or-uninspectable. Full controlled command results follow below. Private console/native JSON/compact/scan files remain ignored under .sut/release16-validation, with before/after host memory/CPU snapshots. Those coarse snapshots are not continuous telemetry and cannot establish the historical root cause.

## 18. Repeat full regression

Two planned independent **npm run test:controlled** invocations both passed **26/26: 23 UI + 3 API** after their own reset/seed. Playwright durations: **66.329s** and **62.958s**. Both had expected=26, unexpected=0, flaky=0, skipped=0, globalErrors=0, configured/actual worker=1, retries=[0], forbid-only and exactly one passed retry-0 result per unchanged title. No unexpected failure occurred anywhere in the nine-command final matrix. These are finite local repeatability samples, not a zero-flake SLA or a root-cause resolution for R14/R15.

Read-only operational audits after each full run confirmed 202 invoices, exactly one guest invoice, guest Combination Pliers x1/14.15/COD/initial AWAITING_FULFILLMENT. Both state snapshots matched: 202 invoices, 659 lines, 202 payments, 42 COD details; two inventory and two checkout-email jobs pending, no failed jobs, stock 25. Remaining nine carts/eight lines belong to the other scenario-owned cart flows, not failed purchase deletion. This audit remains outside the guest test's shipped assertion path.

An explicit final reset restored the exact selected pre-validation snapshot: carts/items/jobs/failed jobs/job-information=0; seeded invoices=200, lines=657, payments=200, COD details=40, stock=25; no guest invoice. This proves cleanup of both purchase resource sets and queued jobs without processing workers. Final down succeeded; independent successful Docker queries confirmed project containers, networks and volumes absent. Private per-run native/compact/scan/console and snapshots are retained locally; no raw diagnostics are committed. All final compact summaries scanned clean, HTML withheld, diagnostics metadata clean.

## 19. CI/security evidence

After debug restoration, strict typecheck and existing security self-tests **3/3 PASS**. Hosted full run/artifact/log audit pending. Scanner, allowlist, raw private diagnostics, fixed staging/re-scan and workflow publication stay unchanged. No deliberate fault is dispatched to public CI.

## 20. Remaining limitations

Chromium/single worker/single SUT; no parallel/manual overlap, broad API/security matrix, multi-browser, new price/quantity/payment/endpoint expansion or workers. Guest invoice persistence audit remains outside the automated assertion path. Pinned default page partitions are not universal ordering. Five requirements remain Requires confirmation. Historical local timing signals are unresolved; passing repeat runs do not prove a zero-flake SLA. Setup can fail due external dependency/image availability/emulation. Personal explanation/replay remains part of human acceptance.

## 21. Portfolio v1.0 readiness assessment

| Acceptance topic | Repository support | Final gate |
| --- | --- | --- |
| Automation design | Current tests, five Page Objects, requirements/catalogue, layer/oracle/isolation rationale | Human can follow a test/import and defend its oracle |
| Docker | Lock/helper, four-service/QEMU/readiness/reset/down explanation and resource evidence | Human can explain lifecycle and async boundary |
| Git/delivery | Actual branch history, focused commits, open-PR/human merge model | Human reviews/merges; no agent auto-merge |
| Actions | Exact source-derived execution/evidence/teardown chain | Hosted result/hash audit plus explanation |
| Debugging | Four executed private exercises, inspected screenshots/traces/status/guard evidence | Human personally replays/explains a representative failure |
| Judgment | No forced abstraction or coverage increase; limits and uncertain roots explicit | Human accepts scope and residual uncertainty |

Green CI alone does not complete Portfolio v1.0. Readiness requires the repository/documentation/evidence plus final human review, technical explanation and merge. No freeze/tag or seniority claim is inferred from agent execution.

## 22. Reviewer guide

Review separate R15 closure and preserved historical prefix. Confirm production tests/pages/scripts/config/dependencies/workflow/pins are unchanged after exact injection restoration. Read current scope/status and the deep dive as primary material; inspect the failure taxonomy and facts versus hypotheses. Check exercise summaries/artifact withholding, all alias counts, planned repeat full runs, reset recovery and hosted integrity. Review README evolution refs and AI-assisted wording. Perform a short explanation/replay before final human acceptance.

## 23. Release status

Investigation, controlled debugging, maintainability review, documentation consolidation, all subsets, both full regressions and reset/resource recovery complete; hosted evidence in progress. Baseline remains 26. R15 CLOSED. Delivery will stop at an OPEN PR; Portfolio v1.0 requires human review/merge. No Release 17 is started or mandatory.
