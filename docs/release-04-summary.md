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

## 5. Controlled-Failure Evidence

Pending hosted execution. Temporarily append a deliberate throw after the original assertions of the final anonymous Product Discovery test. All seven existing scenarios still execute; expected outcome is six passes and one intentional first-attempt failure. The original product assertions remain intact, and the failure is independent of product behavior. No new test, bypass, retries or public SUT dependency. Restore the test byte-for-byte before final green validation and delivery. Temporary validation commit/push is needed for hosted execution; manual dispatch targets the release branch using the workflow already registered on main. No temporary trigger or validation input is added to the delivered workflow.

## 6. Green-Path and Final 7/7 Evidence

Pending hosted run after restoring the temporary failure. Require 7/7, zero retries, one worker, report availability and clean teardown. Passing trace/screenshot retention must not create failure evidence.

## 7. Exact Artifacts and CI Evidence

Pending actual run IDs, artifact IDs, contents and checksums. Require downloaded failure trace and screenshot, HTML attachment links, first-attempt metadata and successful failure-path teardown/upload. A local run alone is insufficient evidence for GitHub Actions artifact behavior.

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

Final delivery requires hosted failure evidence and restored 7/7, final diff review, commit/push and an OPEN PR against main. No merge or Release 5. Git history identifies validation/final commits; the eventual PR is the authoritative URL/status record. Stop immediately after PR creation, so no post-creation documentation commit is planned.

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

IN PROGRESS — HOSTED FAILURE AND RESTORED GREEN VALIDATION REQUIRED. Do not open the PR until both paths and artifact contents are verified. No Release 5 work authorized.
