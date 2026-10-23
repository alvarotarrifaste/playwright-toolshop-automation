# Release 4 — Failure Diagnostics

## 1. Objective and Test Impact

Make first-attempt failures of the seven existing Chromium scenarios diagnosable without retries. Preserve all test names/assertions, Page Objects, requirements/coverage and the Release 2–3 controlled Toolshop contract. Base: current main, fe6ebcb31997c66b4fae73dcb6f7fb67e58814b7 (Release 3 PR #5 merge). Branch: release/04-failure-diagnostics. No new functional tests.

## 2. Diagnostic Architecture Decision

Use Playwright 1.64.1 native `trace: 'retain-on-failure'` and `screenshot: 'only-on-failure'`. The previous on-first-retry setting never captured controlled CI failures because the helper enforces --retries=0. Retain-on-failure records each attempt and discards passing recordings, preserving a failed first attempt. Screenshot captures the failure page. Video stays at the native off default: trace action/DOM/network data and screenshot provide sufficient baseline evidence without another recording/storage cost. No custom reporter or reporting framework.

Official references inspected: [test options](https://playwright.dev/docs/test-use-options), [trace option](https://playwright.dev/docs/api/class-testoptions#test-options-trace), [Trace Viewer](https://playwright.dev/docs/trace-viewer). The installed package/type definitions establish version 1.64.1; hosted execution must prove output, not documentation alone.

Keep the HTML reporter and existing playwright-report artifact behavior unchanged. Add one failure-only upload of test-results/ as playwright-test-results, retaining original trace ZIP, screenshot and native error context for 14 days. The upload uses always() plus tests.outcome=failure, after unchanged teardown; missing files warn because early process/browser startup failures may have nothing to capture. The test's nonzero exit still fails the job; no continue-on-error.

## 3. Files Changed

| File | Purpose |
| --- | --- |
| playwright.config.ts | Trace retention and failure-only screenshots |
| .github/workflows/playwright.yml | Failure-only native test-results artifact |
| README.md | Download/inspection instructions and diagnostics limitations |
| docs/release-04-summary.md | Persistent release record |

No delivered tests/Page Objects, dependencies, SUT images/platforms/SHA, lifecycle commands, existing CI steps or selection flags change. All seven run with one worker, zero retries and --forbid-only.

## 4. Local Validation Evidence

Initial inspection confirmed current workflow, config, package, lifecycle contract and Release 3 evidence. git fetch / switch main / pull --ff-only confirmed the base; created the requested branch. Unrelated output/ and tmp/ remain untracked and excluded. `.sut/actionlint/actionlint.exe -shellcheck= .github/workflows/playwright.yml` passed with actionlint 1.7.12 (ShellCheck not installed); `npx.cmd playwright test --project=chromium --workers=1 --retries=0 --forbid-only --list` loaded the configuration and collected all seven tests in two files. `git diff --check` passed. Installed Playwright type definitions confirm both native options. No new dependency or reporter was installed.

Final `node .sut/review-r4.cjs` (ignored review scaffolding) passed: exactly the four intended release files differ from base; tests/Page Objects, dependency files, SUT pins and lifecycle script are unchanged; the config differs only by the two native diagnostic options/comment; all pre-existing workflow content is preserved and only the failure artifact step is appended; generated credential-value scan of delivered files is clean. `git diff --exit-code origin/main -- tests pages scripts/toolshop.cjs environment/toolshop.lock.json package.json package-lock.json` is empty. Actionlint/diff checks were repeated after restoration. The final runtime config/workflow/tests match the green hosted commit; only this evidence record changes afterward.

## 5. Controlled-Failure Evidence

Verified [hosted run 39857800120](https://github.com/alvarotarrifaste/playwright-toolshop-automation/actions/runs/39857800120), [job 120100444282](https://github.com/alvarotarrifaste/playwright-toolshop-automation/actions/runs/39857800120/job/120100444282), manual dispatch, attempt 1, commit 1d2e19a6692c0912a34465cd2920790d9efb2d17. Ran 2026-10-22 21:30–21:31 UTC. Expected job conclusion: **failure**, not hidden or converted to success.

Temporary validation code appended `throw new Error('Release 4 diagnostic validation: intentional first-attempt failure (temporary)');` at line 39 of the final existing anonymous Product Discovery scenario, after all its original assertions. All seven scenarios executed: **6 passed, 1 failed (7.9s)**, one worker. Only `visitor opens a product from search results and views its details` failed, solely with that deliberate error. Downloaded report/detail JSON confirms exactly one result per scenario, retry=0 for all seven, no skipped or flaky tests. The failed first attempt emitted screenshot, error context and trace attachments. No original assertion was removed or weakened.

Provisioning/SHA verification, pinned ARM64 gateway/QEMU check, local APP_ENV, scheduler exclusion, bounded readiness and reset/seed all passed. The test step failed with nonzero exit; **teardown, HTML upload and raw diagnostics upload all succeeded afterward**. Logs at 21:31:53 confirm controlled containers/network/volumes removed and all empty-list cleanup checks passed. This also exercises the Release 3 failure-path teardown condition on an actual test failure.

The original test was restored byte-for-byte against main in commit 797dd52be50da8d45e7b1862d30629e1561f90fa before the green run. Manual dispatch uses the workflow already on main; no temporary trigger/input was added. Temporary validation commit/push was necessary to execute this hosted path. The validation commit remains in history for reproducibility, but the throw is absent from final branch content/diff and is not part of the delivered tests.

## 6. Green-Path and Final 7/7 Evidence

Verified [hosted run 39859732873](https://github.com/alvarotarrifaste/playwright-toolshop-automation/actions/runs/39859732873), [job 120107033628](https://github.com/alvarotarrifaste/playwright-toolshop-automation/actions/runs/39859732873/job/120107033628), manual dispatch, attempt 1, commit 797dd52be50da8d45e7b1862d30629e1561f90fa. Ran 2026-10-22 21:45–21:46 UTC; run/job conclusion **success**. **7 passed (7.4s)**, one worker, zero retries, no skipped/flaky tests. Downloaded report confirms exactly one passed result per scenario, every retry index=0 and actualWorkers=1. No functional tests or expectations differ from main.

All provisioning, pinned gateway emulation/scheduler verification, bounded API/UI readiness and database reset/seed steps succeeded. At 21:46:43, teardown reported controlled containers/network/volumes removed and all three empty-list assertions passed. HTML upload succeeded; the failure-only raw upload was skipped. Green report contains no retained trace/screenshot/error attachments, proving the baseline stays green without failure artifacts. The config/workflow are identical to the failure run; only the intentional throw was removed. Green runner image was 20261018.339.1 (failure run used 20261012.334.1), demonstrating why the runner-image drift limitation remains explicit.

## 7. Exact Artifacts and CI Evidence

Both failure artifacts were downloaded and inspected under ignored .sut/; checksums match GitHub's artifact digests. Created on 2026-10-22, retained 14 days until 2026-11-05; unexpired when verified.

| Failure artifact | ID / ZIP bytes | SHA256 |
| --- | --- | --- |
| [playwright-report](https://github.com/alvarotarrifaste/playwright-toolshop-automation/actions/runs/39857800120/artifacts/12461220614) | 12461220614 / 4,063,524 | af3dea81c5bb94465cefdaa82f22c5c70a550491bb27213e6b30855727261683 |
| [playwright-test-results](https://github.com/alvarotarrifaste/playwright-toolshop-automation/actions/runs/39857800120/artifacts/12461031179) | 12461031179 / 3,438,271 | cb38225061286d65d39eaa98c69d47ba47a3b5a13fa74b0b91b56d4132fe5ab9 |

Raw diagnostics contain exactly these three files under `product-discovery-visitor--1d207-sults-and-views-its-details-chromium/`:

- `trace.zip`
- `test-failed-1.png`
- `error-context.md`

HTML artifact contains index.html, the native trace-viewer static assets and these linked attachments:

- `data/4241d9dd9fe418fc5feb8390e73e73d95228a821.zip` (trace)
- `data/109d0fb89afa2e73ab5e1fa075347e8441332051.png` (screenshot)
- `data/2711b08d4767c0b9207c3c3719d46bcbc26a422f.md` (error context)

Parsed the embedded native report payload: total=7, expected=6, unexpected=1, flaky=0, skipped=0, actualWorkers=1; every result has retry=0. Attachment paths exist in the downloaded report. Trace and screenshot bytes are identical between report attachments and raw diagnostics. The PNG is valid 1280×720 and was visually inspected: Combination Pliers product detail page is visible at failure. The trace ZIP parses successfully and contains test/source/stack data, DOM snapshots, network resources and trace screencast frames: 38 before/38 after action events, 19 frame-snapshot events, 83 resource-snapshot events and one error. These are trace-native frame captures, not a separate video recording. No .webm or .mp4 was emitted.

Verification commands: repository API GET run/jobs/artifacts and job logs; GET each artifact ZIP; `python .sut/inspect-r4.py failure .sut/release04-failure-report.zip .sut/release04-failure-results.zip` validated hashes, native report/trace JSON, result counts/retry indices, attachment links and exact bytes. The first inspection expected the older script payload container; adapting the ignored verifier to also accept Playwright's template container resolved that tooling mismatch without changing application/test configuration. No raw account values were printed.

Green [playwright-report artifact 12461975189](https://github.com/alvarotarrifaste/playwright-toolshop-automation/actions/runs/39859732873/artifacts/12461975189): 198,663 ZIP bytes, SHA256 `08923d6e056612b619750005d236ca2dc25c1488e58cc10427342e2ed41047e6`. Created 2026-10-22T21:46:44Z; expires 2026-11-05T21:46:43Z; unexpired at verification. Downloaded ZIP hash matches GitHub. `python .sut/inspect-r4.py green .sut/release04-green-report.zip` passed: index.html only, embedded report total=7/expected=7/unexpected=0/flaky=0/skipped=0, one worker, all retry=0, no attachments. Actions artifact listing contains only this HTML report; no playwright-test-results artifact was generated for the green run.

Observed hosted platform: Ubuntu 24.04.5 LTS AMD64, runner image 20261012.334.1, Node 22.23.3, Docker 28.0.4. The exact Release 2 SHA/digests and Release 3 QEMU mechanism remain unchanged; gateway execution and controlled reset were successful before the deliberate test failure.

## 8. How to Inspect Evidence

Download/extract playwright-report from the chosen workflow run and use `npx playwright show-report <directory>`. Open the failed test for error details and screenshot/trace attachments. Preserve the entire extracted folder so data links resolve.

Download/extract playwright-test-results from a failed run. Use `npx playwright show-trace <failed-scenario-directory>/trace.zip` for actions, snapshots, network and timing; open test-failed-1.png directly. Read error-context.md if Playwright emitted it. No hosted trace viewer upload is required. Artifacts expire after 14 days; this record retains identifiers, hashes and observed results.

## 9. Known Limitations / Risks

- Traces temporarily record passing attempts before deletion, adding runtime/I/O overhead. No performance guarantee from two small suite runs.
- Native traces/screenshots need a sufficiently initialized test/browser/page; setup failure, hard process kill or runner termination may yield no evidence. Always() cannot guarantee execution after VM loss.
- Artifacts can contain DOM/network/test-account data. Never upload .env.controlled or generated Compose; review diagnostics before sharing. No automatic redaction is promised.
- Failure-only raw upload is conditional on test-step failure; HTML report behavior remains unchanged. Green runs should have HTML reports but no failure artifact.
- The existing ARM64 gateway still depends on pinned QEMU emulation; hosted VM image/network/registry drift remain Release 3 risks.
- Legacy direct-CI config retries remain as before; the controlled helper's explicit CLI flags are authoritative and must remain zero. This release never enables retries to produce evidence.

## 10. Git / PR Information

Base main: fe6ebcb31997c66b4fae73dcb6f7fb67e58814b7. Branch: release/04-failure-diagnostics. Failure validation commit: 1d2e19a6692c0912a34465cd2920790d9efb2d17. Restored green commit: 797dd52be50da8d45e7b1862d30629e1561f90fa. Final evidence-only delivery commit is identified by Git history. Both hosted paths and final scope review passed; commit/push this package and create an OPEN PR against main. No merge or Release 5. The eventual PR is the authoritative URL/status record. Stop immediately after PR creation, so no post-creation documentation commit is planned.

## 11. Reviewer Guide

Inspect the two native configuration changes → failure-only artifact upload/unchanged HTML behavior → temporary failure run and retry=0 → actual ZIP/PNG/HTML attachments → teardown success after failure → restored test diff and final 7/7 → credential/pin/lifecycle exclusions → risks. Álvaro + Automation workspace own approval/changes-requested and merge.

## 12. Interview Defense

- Why was the old trace setting ineffective? on-first-retry needs a retry; the controlled suite intentionally has none.
- Why retain-on-failure? It captures the first attempt and keeps detailed evidence only for failures.
- Why a screenshot too? It gives immediate visual context without opening a trace.
- Why no video? Trace snapshots/actions/network plus the failure screenshot satisfy this baseline at lower storage/capture cost.
- Why retain test-results separately? It preserves original native files for direct inspection, alongside HTML attachments and report navigation.
- How is failure behavior proven? A temporary throw after existing anonymous-test assertions forces a known failure on attempt zero; downloaded hosted artifacts and cleanup prove the path. The throw is removed before final 7/7.
- What remains unchanged? Functional expectations/coverage, seven-test selection, zero retries, one worker, forbid-only, pinned SUT and lifecycle.

## 13. Release Status

VALIDATED — RELEASE 4 DEFINITION OF DONE SATISFIED; FINAL DELIVERY VIA OPEN PR. Actual first-attempt failure generated native trace/screenshot/error context and uploaded both diagnostic/report artifacts; the failed job stayed failed and cleanup succeeded. The throw is removed, final hosted baseline is 7/7 with one worker/zero retries, HTML remains available and no green failure artifacts remain. Functional expectations/coverage and controlled SUT execution contract are unchanged. Ready for human review once final evidence commit/push and open PR creation succeed. No remaining blocker; native capture limits, sensitive trace data, temporary trace overhead and finite retention remain documented risks. Human merge/release closure are outside this execution. No Release 5 work started.
