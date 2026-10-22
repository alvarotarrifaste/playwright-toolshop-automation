# Release 2 — GitHub Actions Baseline

## 1. Release Objective

Introduce the first executable CI contract for the existing Playwright suite on GitHub. Preserve local regression behavior and persist the release delivery record in Git. No new functional automation coverage is introduced.

## 2. Scope

Included: one GitHub Actions workflow, one reproducible npm CI command, native risk classification for T-AUTH-002, HTML report upload, focused traceability updates and this Release Package.

Excluded: new tests, requirement approval decisions, Jenkins, matrices, other browsers, sharding, Docker, caching strategies, deployments, and richer screenshot/trace/video diagnostics (Release 3). No merge is authorized. Every future release must also commit a complete Release Package; terminal-only delivery is insufficient.

## 3. Requirements / Test Impact

| Tests | Release 2 CI | Normal local full regression |
| --- | --- | --- |
| T-AUTH-001: successful login | Executed | Preserved |
| T-AUTH-002: incorrect password | Temporarily excluded by `@shared-state-risk` | Implemented and executable; assertions preserved |
| T-AUTH-003: logout | Executed | Preserved |
| T-AUTH-004: unauthenticated account access | Executed | Preserved |
| T-CATALOG-001, T-CATALOG-002, T-CATALOG-003 | Executed | Preserved |

T-AUTH-002 can mutate shared backend failure counters and lock the account. Browser contexts do not isolate backend state. CI inclusion requires safe account/test-data isolation and a known reset/unlock lifecycle. The tag is selection metadata, not a global skip. The existing `npx playwright test --project=chromium` still runs all seven tests. Product Discovery and other pending requirement statuses remain unchanged; executing tests does not approve requirements. See [catalogue](test-catalogue.md) and [requirements](requirements.md).

## 4. Architecture Decision

GitHub Actions supplies the first CI feedback loop alongside the repository and PR review, without a separate service to provision and operate. The baseline deliberately proves one execution contract before adding orchestration complexity. Jenkins remains deferred because no current requirement justifies a second CI platform or its operational overhead.

Use Playwright's native details-object tag and CLI filtering rather than matching an exact scenario title. The installed and locked Playwright version is 1.64.1. A single npm script overrides the legacy `CI ? 2 : 0` retry setting with zero retries, without changing normal local configuration. One worker and `--forbid-only` also make local troubleshooting match CI selection and scheduling safeguards.

References checked during implementation: [Playwright tags and filtering](https://playwright.dev/docs/test-annotations#tag-tests), [official GitHub Actions example](https://playwright.dev/docs/ci-intro), and installed `playwright test --help`. The workflow follows the official example's checkout/setup-node v6 and upload-artifact v4 actions, with a fixed Node 22 major compatible with the dependency's Node >=20 engine.

## 5. CI Execution Contract

| Item | Contract |
| --- | --- |
| Workflow | `.github/workflows/playwright.yml`, `Playwright Tests`, job `test` |
| Triggers | PR targeting `main`; push to `main` (including merge); manual `workflow_dispatch` |
| Runner / permissions | `ubuntu-latest`; `contents: read` |
| Runtime | Node 22 via setup-node; npm |
| Dependencies | `npm ci` using committed `package-lock.json` |
| Browser / OS dependencies | `npx playwright install --with-deps chromium` |
| Test command | `npm run test:ci` |
| Expanded command | `playwright test --project=chromium --grep-invert @shared-state-risk --retries=0 --workers=1 --forbid-only` |
| Target | Existing `https://practicesoftwaretesting.com` base URL |
| Credentials | Test-step environment from `secrets.TEST_USER_EMAIL` and `secrets.TEST_USER_PASSWORD` only |
| Report | Existing HTML reporter, `playwright-report/`; browser auto-open disabled in workflow |
| Artifact | `playwright-report`, retained 14 days; upload with `!cancelled()` even after test failure |
| Failure signal | Nonzero Playwright exit fails the step/job; no continue-on-error or automatic retry wrapper |

**Manual prerequisite:** Álvaro must configure or confirm repository **Settings > Secrets and variables > Actions > New repository secret** entries named exactly `TEST_USER_EMAIL` and `TEST_USER_PASSWORD`. Use an enabled, unlocked test customer. The available GitHub MCP exposes no secret configuration/inspection capability; secret presence is unverified. No alternate credential upload is attempted. Do not expect credential-dependent success before this prerequisite is met. Never paste values into Git, logs, documentation or the PR.

Fork PRs do not receive repository secrets; credential-dependent tests fail explicitly. Manual execution becomes available through the Actions UI once this workflow is on the default branch. Push-to-main and manual behavior require post-merge validation by the human reviewer.

The report upload tolerates failed tests, but cancellation or setup failure before report generation can leave no artifact (`if-no-files-found: warn`). Download and extract the artifact, then run `npx playwright show-report <extracted-directory>`. Raw reports and test results remain ignored and uncommitted. Review report contents before sharing; artifacts can contain test data. This release adds no richer diagnostic collection.

## 6. Files Changed

| File | Purpose |
| --- | --- |
| `.github/workflows/playwright.yml` | PR/main/manual CI execution, secrets and report artifact |
| `package.json` | Focused `test:ci` script |
| `tests/login.spec.ts` | Native risk tag on T-AUTH-002; no assertion changes |
| `docs/test-catalogue.md` | Explicit local versus CI coverage and inclusion prerequisite |
| `docs/requirements.md` | Record the Release 2 risk mitigation without altering approval status |
| `README.md` | CI command, secret setup, reports and permanent release-record rule |
| `docs/release-02-summary.md` | Complete persistent Release Package and review handoff |

The lockfile, Playwright configuration, Page Objects and Product Discovery test implementation remain unchanged. Existing unrelated untracked `output/` and `tmp/` directories are outside this release and are not staged.

## 7. Validation Evidence

Local validation on 2026-10-22, Windows PowerShell, Node v22.21.0 / npm 10.9.4 / Playwright 1.64.1:

| Command / inspection | Result |
| --- | --- |
| `git status --short --branch`; `git pull --ff-only origin main` | Started on main; tracked files clean; main current at `4f8dbb1`; unrelated untracked directories preserved |
| `npm ci` (`npm.cmd` on Windows) | Passed; 6 packages added; 0 audit vulnerabilities; lockfile unchanged |
| `playwright test --help` | Confirmed project, grep-invert, retries, workers and forbid-only CLI support |
| `npm run test:ci -- --list` | Exactly six tests, excluding T-AUTH-002 |
| `npx playwright test --project=chromium --list` | All seven collected, including T-AUTH-002; native tag accepted |
| First `CI=true npm run test:ci` | Six browser-launch failures: Chromium executable unavailable; no application or login attempts; HTML report generated |
| `npx playwright install chromium` | Completed after granting browser-cache access |
| `CI=true PLAYWRIGHT_HTML_OPEN=never npm run test:ci` | **6 passed (27.0s)**, one worker, zero retries; T-AUTH-002 not executed |
| Diff review and `git diff --check` | Reviewed release-only scope; final check recorded before commit |

Shell environment variables were set using PowerShell syntax; command names used `.cmd` as needed. Values from local ignored `.env` were never printed. No full seven-test execution was performed because intentionally repeating T-AUTH-002 would reintroduce the known account-state risk. Collection proves local executability, not a fresh pass of that scenario. Local Windows evidence does not prove Ubuntu system-dependency installation or GitHub artifact availability.

PR CI observation on 2026-10-22: [Playwright Tests run 1](https://github.com/alvarotarrifaste/playwright-toolshop-automation/actions/runs/39806960316) on implementation commit `7e8978277f27e29eec06832fa0f076fb199a809a` was **in progress** at evidence capture. Checkout, Node setup and `npm ci` succeeded; Chromium/system-dependency installation was in progress. Test execution and artifact upload were pending, so neither CI test success nor artifact availability is claimed. This documentation-only handoff update can trigger a subsequent PR run; inspect the latest check in PR #3 before approval. Successful credential-dependent CI remains conditional on manually configured secrets and healthy shared account state. A green run does not establish requirement approval.

## 8. Known Risks / Gaps

- Shared credentials and backend state remain a dependency. Even positive logins can fail or affect counters if secrets are stale or the account is unhealthy. Zero retries and exclusion reduce risk; they do not provide account isolation.
- Independent workflow runs and local executions can overlap. One worker serializes tests within a run only. Diagnose credentials/account state before manually rerunning failed authentication checks.
- The public target, accounts and catalog data can change or disappear independently of this repository.
- T-AUTH-002 is outside automated CI until isolation and reset/unlock prerequisites are satisfied. Its local use still carries risk.
- Secret configuration cannot be verified through the available GitHub connector. Fork secret restrictions apply.
- HTML artifacts depend on report generation and successful upload; cancellation/setup failures can prevent availability. Existing first-retry trace policy produces no traces with zero retries. Richer diagnostics remain deferred to Release 3.
- Post-merge push and manual trigger validation, branch-protection policy and final release closure remain human responsibilities.

## 9. Git / PR Information

- Repository: `alvarotarrifaste/playwright-toolshop-automation`.
- Base: `main`, synchronized at `4f8dbb1`.
- Branch: `release/02-github-actions-baseline`.
- Implementation commit: [`7e8978277f27e29eec06832fa0f076fb199a809a`](https://github.com/alvarotarrifaste/playwright-toolshop-automation/commit/7e8978277f27e29eec06832fa0f076fb199a809a), `ci: add GitHub Actions baseline`. A follow-up documentation commit records PR/check evidence; its identity is available in this file's Git history.
- PR: [#3 — ci: add Release 2 GitHub Actions baseline](https://github.com/alvarotarrifaste/playwright-toolshop-automation/pull/3), targeting `main`; confirmed open, non-draft and unmerged through GitHub MCP.
- Creation transport: GitHub MCP returned `403 Resource not accessible by integration`. Browser automation could not initialize and GitHub CLI was unavailable. The authorized PR was created through GitHub REST using existing Git credential-manager authentication; no credential values were printed or persisted. No repository secret configuration was attempted.
- CI/check observation: first PR run in progress, with checkout/Node/npm installation successful and Chromium installation underway; test and artifact results pending at evidence capture. Follow the run link in Validation Evidence and the latest PR check before approval.
- PR must remain **OPEN**. No merge or auto-merge is authorized.

## 10. Reviewer Guide

1. Compare requirements/test impact with the catalogue: all seven implemented; only T-AUTH-002 excluded from CI; no new approval decision.
2. Inspect workflow triggers, Node/runtime installation, Chromium-only dependencies, secret expressions and read-only repository permission.
3. Expand `test:ci`: native tag exclusion, zero retries, one worker, focused-test guard. Confirm full local collection still includes T-AUTH-002 and its assertions are intact.
4. Configure/confirm both repository secrets and an enabled, unlocked account before expecting green authentication checks. Do not rerun unhealthy credentials repeatedly.
5. Inspect the PR Actions run and test failures; download the HTML artifact and compare its six-test scope. Confirm failed tests remain visible as a failed job.
6. Review the complete diff, this persistent package, architecture rationale and remaining risks.
7. Álvaro plus the Automation workspace decide approval and merge. After a human merge, validate the push-to-main run and manual dispatch, then record closure separately. Do not treat this handoff as release closure.

## 11. Interview Defense

- **Why GitHub Actions now, Jenkins later?** Establish the first repository-native execution feedback loop with minimal operational overhead; a second platform has no justified requirement yet.
- **Why exclude an implemented negative test?** Invalid-password attempts mutate shared backend counters. CI repetition can lock the customer and contaminate login/logout evidence.
- **Why a tag instead of title matching or skip?** Native metadata expresses risk independently of scenario wording and preserves normal local regression execution.
- **Why zero retries?** Retrying authentication against bad credentials or unhealthy account state can amplify the defect in test data rather than diagnose it. Fix data/state before rerunning.
- **Why one npm script?** It makes selection and retry policy reproducible locally without changing the existing Playwright configuration or adding tooling layers.
- **What does a green CI run prove?** The six implemented scenarios' assertions passed against that deployment and data at that time. It does not approve Product Discovery requirements or cover the excluded test.
- **How are failures and secrets handled?** Native nonzero exits fail the job; HTML upload runs after test failure where possible; credentials enter only as secret-backed environment variables and are never committed.
- **What is needed to restore T-AUTH-002 to CI?** Safe account/test-data isolation with known backend counter behavior and a verified reset/unlock lifecycle.

## 12. Release Status

`READY FOR HUMAN REVIEW`

Implementation handoff only. The PR remains open for Álvaro and the Automation workspace. Release 2 is not closed until human merge and post-merge validation.
