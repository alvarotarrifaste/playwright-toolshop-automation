# Release 3 — GitHub Actions Baseline

## 1. Release Objective

Run the Release 2 controlled Toolshop execution contract on a Linux GitHub-hosted runner. Require all seven existing Chromium scenarios, one worker, zero retries and focused tests forbidden. Public Toolshop execution is not release evidence.

## 2. Requirements/Test Impact

No new functional coverage or requirement approval changes. T-AUTH-001 through T-AUTH-004 and all three Product Discovery scenarios remain unchanged, including T-AUTH-002. Page Objects and assertions are preserved. The separate seeded positive/negative accounts and reset-before-test contract replace public-host account secrets.

## 3. Architecture Decision

One workflow, one Ubuntu 24.04 AMD64 job, Node 22, npm ci, Playwright Chromium and its system dependencies. Reuse scripts/toolshop.cjs without duplicating lifecycle logic. Preserve Toolshop 2.5, SHA 9e7736c3841ec2bbb9a6822c9e6602353b7b9a65 and every digest in environment/toolshop.lock.json.

The official pinned gateway is ARM64; enable only ARM64 user-mode emulation using Docker's setup-qemu-action. Pin the action and its tonistiigi/binfmt helper image. No Buildx setup, source build, gateway substitution or bypass. The action registers binfmt handlers through a privileged helper on the disposable runner; the workflow token remains contents:read. Checkout does not persist credentials. No repository secrets are injected.

Official references inspected: [QEMU action](https://github.com/docker/setup-qemu-action), [checkout](https://github.com/actions/checkout), [Node setup](https://github.com/actions/setup-node), [artifact upload](https://github.com/actions/upload-artifact), [Playwright CI](https://playwright.dev/docs/ci-intro), and [GitHub workflow events](https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows). Action SHAs and binfmt digest were resolved from official tags/registry on 2026-10-22.

## 4. CI Execution Contract

Final triggers: pull requests targeting main, pushes to main, workflow_dispatch. One ubuntu-24.04 job; 30-minute job bound, 10-minute test-step bound. npm ci and npx playwright install --with-deps chromium precede Docker/Compose verification, QEMU registration, sut:provision, sut:up, sut:ready and test:controlled. The final command performs config clear, migrate:fresh --seed --force, cache clear, catalog readiness, controlled account injection and all seven tests with --workers=1 --retries=0 --forbid-only. Its CLI flags override the legacy CI retry default without changing the Playwright config.

Bounded HTTP/database polling is the Release 2 implementation. The controlled command forces localhost:4200; the pinned development UI targets localhost:8091. No public-host credential secrets or public SUT target. API/UI/database remain AMD64 and the gateway remains ARM64 at the exact Release 2 digest. Runtime checks assert gateway image architecture, execute uname inside it and inspect schedule:list for destructive reset registration.

Teardown uses always() after dependency installation, even following setup/test failures; sut:down removes volumes and orphan containers. Empty project-label container/network/volume queries verify cleanup. Report upload follows cleanup and uses always() if test execution was attempted; missing reports fail upload. No continue-on-error. Setup failure before tests can produce no report. Hard runner termination/job cancellation can prevent cleanup; the disposable hosted VM remains the final isolation boundary.

## 5. Files Changed

| File | Purpose |
| --- | --- |
| .github/workflows/playwright.yml | Hosted controlled SUT lifecycle, emulation, all seven tests, teardown, HTML artifact |
| README.md | CI execution, artifacts and architecture guidance |
| docs/release-03-summary.md | Persistent release evidence and human review package |

No application pins, dependencies, functional tests, Page Objects or lifecycle implementation changes are intended.

## 6. Local Validation Evidence

Inspected package.json, scripts/toolshop.cjs, environment/toolshop.lock.json, playwright.config.ts, docs/release-02-summary.md and .github state before implementation. Main initially had no workflow. git fetch / switch main / pull --ff-only confirmed base 6391cbe76e10db561ad3fd2a6ebf28e37357cc5b; created release/03-github-actions-baseline. Unrelated output/ and tmp/ remain untracked.

Historical PR #3 was inspected read-only: closed/unmerged, public-host secret injection and negative-auth exclusion. It is superseded; no commits or workflow design were copied as a baseline.

Local commands on 2026-10-22: npm.cmd ci passed (6 packages installed, 0 audit vulnerabilities); npx.cmd playwright test --project=chromium --workers=1 --retries=0 --forbid-only --list collected all 7 tests in 2 files. node --check scripts/toolshop.cjs and git diff --check passed. Official actionlint v1.7.12 Windows binary was checksum-verified (SHA256 6e7241b51e6817ea6a047693d8e6fed13b31819c9a0dd6c5a726e1592d22f6e9); .sut/actionlint/actionlint.exe -shellcheck= .github/workflows/playwright.yml passed without findings. ShellCheck is unavailable locally; actionlint shell validation was disabled explicitly. Hosted Bash execution remains required. Diff against base for tests/, pages/, package files, Playwright config, SUT lock and lifecycle script is empty.

Final checks after removing the bootstrap trigger: actionlint and git diff --check passed again. `node .sut/review-release03.cjs` (ignored review scaffolding) compared the complete jobs block to the green hosted commit and found it identical; confirmed the bootstrap branch/public target/secret references/continue-on-error are absent from the workflow; checked the functional/lifecycle/pin diff is empty; scanned all three release files against generated credential values without printing them; parsed downloaded HTML report payloads and asserted 7/7, actualWorkers=1, one result per test, status=passed and retry=0 for every scenario. All passed. Final diff against origin/main contains only the three files in section 5; output/tmp and all local scaffolding/artifacts remain excluded.

## 7. GitHub Actions Evidence

Hosted validation: [run 39852216967](https://github.com/alvarotarrifaste/playwright-toolshop-automation/actions/runs/39852216967), [job 120081107253](https://github.com/alvarotarrifaste/playwright-toolshop-automation/actions/runs/39852216967/job/120081107253), 2026-10-22 20:50–20:51 UTC, conclusion **success**. Event: push; SHA 7046e826b8db95bd55ff694ca63713cb516d6ea3; attempt 1. Every lifecycle, test, teardown and artifact step completed successfully.

The first workflow was absent from main, so a temporary push trigger for this exact release branch bootstrapped pre-PR validation. It is removed from the final workflow. Job definition/steps are identical to the hosted green run; only the push branch filter and release documentation changed afterward. No PR was opened to obtain validation and no main change was made. Interim validation commit/push was necessary to obtain hosted evidence; the final evidence commit follows the run. PR-triggered execution will run on PR creation; push-to-main/manual event validation after merge remains human follow-up.

Observed test output: `Running Chromium against http://localhost:4200, all scenarios, one worker, zero retries.`, `Running 7 tests using 1 worker`, `7 passed (5.6s)`. Artifact report.json independently confirms actualWorkers=1; total=7, expected=7, unexpected=0, flaky=0, skipped=0, errors=[]; every test has exactly one result. All four Authentication tests, including incorrect-password authentication, and all three Product Discovery tests passed on their first attempt. The unchanged helper enforces --forbid-only and --retries=0 despite the legacy Playwright CI default.

## 8. Docker/SUT Lifecycle Evidence

The hosted logs record Node v22.23.3, Docker client/server 28.0.4, Compose v2.38.2, Linux x86_64. `npm ci` and Chromium/system dependency installation passed. `sut:provision` created ignored .env.controlled without values in logs and verified Toolshop tag 2.5 / exact SHA. `sut:up` verified the same SHA, pulled locked images, started the four services and reported API ready at 20:51:04 UTC and Frontend ready at 20:51:14. A separate `sut:ready` passed at 20:51:15.

The runtime service status lists the exact four Release 2 image digests and only loopback UI/gateway publication. `php artisan env` reports local. `schedule:list` shows invoice:generate, queue:work --stop-when-empty and order:update; no migrate:fresh registration. The production cron service is excluded by the unchanged helper.

`test:controlled` reported Database ready at 20:51:17, then API/Frontend/Seeded catalog ready and reset/seed completion at 20:51:19. The unchanged command runs config:clear, migrate:fresh --seed --force and cache:clear before spawning tests. The seeded catalog and all authentication scenarios passed with generated distinct customer injection. Credentials were neither printed nor supplied from repository secrets.

At 20:51:28 `sut:down` reported containers/network/volumes removed; all three project-label empty-list assertions passed, followed by `Controlled containers, networks and volumes absent.` The teardown step concluded success before artifact upload. Failure-path teardown is guaranteed by the reviewed always() condition where the runner remains operational; an intentional failing-test hosted run was not introduced.

## 9. ARM64/AMD64 Compatibility Evidence

**Verified on GitHub-hosted AMD64**, not inferred from Windows. Runner: Ubuntu 24.04.5 LTS, image ubuntu-24.04 version 20261012.334.1, runner 2.338.0, Azure eastus. Host x86_64 assertion passed. QEMU action installed arm64/qemu-aarch64 and advertised linux/arm64 support. Helper index: sha256:400a4873b838d1b89194d982c45e5fb3cda4593fbfd7e08a02e76b03b21166f0.

Helper version output: binfmt/e29e7d7 qemu/v10.2.3 go/1.26.4; installation output `installing: arm64 OK`.

Runtime checks passed: the exact gateway reference inspects as linux/arm64 and `docker compose ... exec -T web uname -m` equals aarch64. Log confirms `Pinned ARM64 gateway executes on the AMD64 runner.` API/UI readiness and all seven browser scenarios exercise that gateway. Gateway digest remains sha256:950bafdc86501002c381e35d9b70e298fe211f4ab1fbfda334b67f03dffa048d. API/UI/MariaDB digests/default AMD64 platform and Toolshop SHA are byte-for-byte unchanged from main. The smallest additional mechanism is one ARM64-only setup-qemu-action step; no application architecture redesign was needed.

## 10. Artifact/Report Evidence

Verified [playwright-report artifact 12458041645](https://github.com/alvarotarrifaste/playwright-toolshop-automation/actions/runs/39852216967/artifacts/12458041645): 198,575 bytes, created 2026-10-22T20:51:28Z, expires 2026-11-05T20:51:28Z (14 days), not expired at verification. SHA256 3de794ab739b22e7d2ab15ab064216a24616db5dd044b439049bf805f28ed9df matches the downloaded ZIP. Upload step concluded success.

Downloaded and extracted under ignored .sut/. ZIP contains index.html (524,500 bytes), with its embedded report ZIP containing report.json and two test-file JSON payloads. Parsed report.json confirms hosted run/SHA metadata and seven first-attempt passes as recorded above. This verifies actual report content, not just an upload step name. No .env.controlled, Compose file, upstream source tree or raw service logs are uploaded.

Download the run artifact, extract and serve with npx playwright show-report <directory>. Existing trace:on-first-retry does not generate traces with zero retries; richer diagnostics are deferred to Release 4. Report evidence expires with Actions retention; run IDs, hashes and observed outcomes remain in this package.

## 11. Known Risks / Limitations

- GitHub runner images, Node 22 patch releases and external registries/network availability can change. SUT, action commits and QEMU helper are pinned; runner VM image is not immutable.
- ARM64 emulation adds privileged setup and execution overhead; exact hosted compatibility was demonstrated on the observed runner image, not every future image.
- HTML reports may contain test data on failure; limit artifact sharing. Generated credential files are never uploaded or printed.
- Per-run VMs isolate controlled accounts; direct concurrent manual use remains outside the lifecycle lock's scope.
- Teardown cannot be guaranteed after hard VM termination. No richer diagnostics, matrices, new scenarios or Release 4 work.
- Branch protection/required-check configuration and post-merge push/manual event validation remain human follow-up; no repository settings changes are included.

## 12. Git / PR Information

Repository: alvarotarrifaste/playwright-toolshop-automation. Base: main at 6391cbe76e10db561ad3fd2a6ebf28e37357cc5b. Branch: release/03-github-actions-baseline. Hosted validation commit: 7046e826b8db95bd55ff694ca63713cb516d6ea3. Final delivery commit contains this evidence and removes only the temporary trigger; Git history supplies its SHA. Open the PR against main only after final diff/commit/push checks; keep unmerged and stop immediately after creation. The eventual PR is the authoritative URL/status record; no post-creation documentation commit is planned.

## 13. Reviewer Guide

Review requirement/test impact → workflow → controlled lifecycle → ARM64 compatibility → actual 7/7 CI run → HTML artifact → teardown → final diff → risks → interview defense. Confirm the temporary bootstrap trigger is absent, all seven tests remain selected and no public-host secrets/target were introduced. Álvaro + Automation workspace own approve/changes-requested and merge decisions.

## 14. Interview Defense

- Why reuse Release 2? Environment ownership and resettable server-side state are part of the execution contract; CI only orchestrates it.
- Why include negative authentication? Separate seeded customers and reset-before-run eliminate the old shared-account contamination rationale for excluding it.
- Why QEMU? The selected official gateway digest is ARM64. Emulating that single service preserves the proven environment rather than replacing upstream components.
- Why zero retries? A first-attempt baseline exposes instability instead of masking it; the helper explicitly overrides legacy CI defaults.
- Why always teardown? Failed test execution must not bypass resource cleanup; cleanup failures also fail the job.
- What proves delivery? Actual GitHub-hosted 7/7, exact pinned gateway execution, artifact availability and clean teardown, with evidence persisted here.
- Why bootstrap pushes? The first workflow has no default-branch registration for manual dispatch and the PR must be created only after CI validation. A temporary exact-branch push filter permits pre-PR execution without changing main.

## 15. Release Status

VALIDATED — RELEASE 3 DEFINITION OF DONE SATISFIED; FINAL DELIVERY VIA OPEN PR. Actual hosted lifecycle, exact gateway ARM64 emulation, 7/7 first-attempt Chromium execution, HTML artifact content and clean teardown are verified. Workflow job steps match the green hosted run; final trigger filter is limited to the requested events. Ready for human review once final commit/push and PR creation succeed. No remaining runtime blocker on the validated runner. Human review/merge, post-merge event validation and release closure remain outstanding. No Release 4 work was started.
