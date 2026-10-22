# Release 1 validation evidence

Date: 2026-10-21 (America/Bogota). Baseline: `03ab72b31a68faab3d7b377340b9755fce77b2b6`. Branch: `release/01-traceable-baseline`. Node: `v22.21.0`; npm: `10.9.4`. Target: `https://practicesoftwaretesting.com`. No test, Page Object, dependency or runner configuration was modified.

## Execution

Exact command for all three attempts (the documented PowerShell-compatible mechanism):

```powershell
npx.cmd playwright test --project=chromium
```

| Attempt | Environment | Selected / attempted | Passed | Failed | Duration | Exit |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | Restricted execution environment | 7 | 0 | 7 | Not reported in captured summary | 1 |
| 2 | Authorized execution outside isolation | 7 | 5 | 2 | 19.4 seconds, Playwright summary | 1 |
| 3 | Authorized execution outside isolation, after human-reported account unlock | 7 | 7 | 0 | 13.9 seconds, Playwright summary | 0 |

Attempt 1 failed before application navigation: `browserType.launch: Executable doesn't exist` for the Chromium headless shell in AppData. Attempt 2 successfully launched the existing browser without installation or code changes. Classification: execution-environment/browser-access restriction, not product behavior evidence. The second attempt is a separate invocation, not a configured test retry.

Attempt 2 used the existing local configuration: 6 workers, no local retries, credentials loaded from environment/.env. Credential values are deliberately excluded. The normal runner generated local HTML results and error contexts; raw artifacts remain ignored and are not committed because they can contain credentials or other sensitive data.

## Per-test results from attempt 2

| Test ID | Result | Evidence / limitation |
| --- | --- | --- |
| T-AUTH-001 | Failed | `login.spec.ts:24`: expected `/account`; actual URL remained `/auth/login`; assertion timeout 5000 ms. Error-context page snapshot displayed `Invalid email or password`. Heading assertion was not reached. |
| T-AUTH-002 | Passed | Existing invalid-password error assertions passed. Does not prove account locking is absent or intended credentials are valid. |
| T-AUTH-003 | Failed | `login.spec.ts:66`: expected `/account`; actual URL remained `/auth/login`; assertion timeout 5000 ms. Error-context page snapshot displayed `Invalid email or password`. Logout action and final signed-out assertion were not reached. |
| T-AUTH-004 | Passed | Existing unauthenticated redirect and login-button assertions passed. Official requirement confirmation remains pending. |
| T-CATALOG-001 | Passed | Existing matching-search assertions passed. |
| T-CATALOG-002 | Passed | Existing no-match assertions passed. |
| T-CATALOG-003 | Passed | Existing product navigation/name/button assertions passed. |

## Failure investigation and classification

Both failures share the positive-login prerequisite and show an invalid-credentials message. Working hypothesis: test-data/account or credential precondition failure; account removal or changed credentials are possibilities. Root cause is **not confirmed**: no account lifecycle, credential reset, backend diagnosis or authoritative account verification was performed. A product authentication defect cannot be ruled out from UI evidence alone. No lock message or HTTP 423 was established by this run.

After attempt 2, further login execution was paused to avoid accumulating invalid attempts. Álvaro then reported unlocking the account and explicitly requested another run. Attempt 3 ran the same command with no test, credential, timeout, retry or architecture changes by the SDTE. Do not expose secrets in the PR.

## Successful re-execution after human intervention

Attempt 3: **7 passed, 0 failed, 13.9 seconds**, exit 0. All seven mapped tests passed, including T-AUTH-001 and T-AUTH-003. This supplies current application-observation evidence for the assertions exercised, including the logout link and unauthenticated redirect, without approving their intended requirements.

The earlier 5-pass/2-failure result remains historical evidence, not the latest outcome. Success after the reported unlock is consistent with an account-state issue, but does not independently establish the previous lock state or HTTP 423: earlier UI snapshots showed the generic invalid-credentials message. The exact prior backend cause and reset/unlock lifecycle remain unverified. Shared-account contamination remains a risk despite the green run. Human review still determines release readiness.

Normal Playwright output files from earlier runs are overwritten by later runs; the committed summary preserves the observed history. The latest local HTML report is `playwright-report/index.html` and can be inspected with `npx.cmd playwright show-report`. Raw reports and error contexts are not part of the PR. Passing tests establish only the assertions they exercised, not official requirement approval.

## Diff review and CI

`git diff --check` passed before staging. Final staging is restricted to README and the four Release 1 Markdown documents. Tests, pages, configuration, manifests, lockfile and credential templates have no diff against the baseline. Documentation links and all seven test-name mappings were checked against local sources. IDs are documentation-only; no test tags or priority/suite assignments were introduced.

No CI workflow or Jenkinsfile exists in the tracked baseline or this increment. CI pipeline implementation and remote execution evidence are deferred. Playwright's CI-specific settings do not constitute a pipeline. Local generated `output/` and `tmp/` directories from the earlier PDF task remain outside this release and must not be staged.

The feature PR targets `main` and must remain open and unmerged for human review. No Release 2 work is included.
