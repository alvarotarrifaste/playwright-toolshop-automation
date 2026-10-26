# Release 8 — API Authorization Pilot

## 1. Objective

Add one independent service-level authorization scenario while preserving all thirteen UI scenarios and the controlled execution contract. Base: current main `6aee6ff`; branch `release/08-api-authorization`.

## 2. API discovery

Inspected the clean local upstream checkout at locked SHA `9e7736c3841ec2bbb9a6822c9e6602353b7b9a65` (tag 2.5), not a moving public deployment. Links and evidence classification are in [requirements](requirements.md#api-authorization-pilot--release-8-proposal).

- `sprint5/API/routes/api.php`: `POST /users/login` and `GET /users/me`; RouteServiceProvider loads API routes without an `/api` prefix. Controlled gateway is `http://localhost:8091`, independently of UI port 4200.
- `UserController::__construct`: `auth:users` protects `me`; login/store/forgotPassword/refresh are excluded. Only index/destroy receive the admin-role middleware. Other protected candidates include logout, customer operations, favorites and invoices; this release selects only current-customer read access.
- `config/auth.php`: default api guard and users guard use JWT. Kernel aliases `auth` to Authenticate and `assign.guard` to AssignGuard. Authenticate validates JWT, resolves subject to a cached user, rejects absent/invalid identity with 401 and disabled users with 403; AssignGuard selects users. `me` delegates to `UserService::getAuthenticatedUser`, returning Auth::user() as JSON. UserPolicy controls admin data and mutations; this pilot does not validate those policies.
- Controller OpenAPI documents current-customer 200/401 and bearer JWT; Controller::respondWithToken emits access_token, token_type=bearer, expires_in. Login accepts JSON email/password. No browser session is required.
- `UserSeeder.php`: positive controlled user is the second row (Jane Doe, role user); first row is admin, third row is the separate negative-login customer. IDs are generated ULIDs, so no fixed ID is asserted. Credential values are not reproduced. Existing helper derives ignored `.env.controlled` from this pinned seed, injects credentials and resets failed-login counters before each controlled invocation.
- Supporting UI source: CustomerAccountService calls login/me; AuthInterceptor sends Bearer token in Authorization; TokenStorageService stores auth-token in localStorage. Existing LoginPage only exercises the UI; UI route guard coverage does not establish backend protection.
- Reviewed requirements, test catalogue, four login tests, config, strict tsconfig, workflow and lifecycle helper. Existing controlled helper enforces Chromium project, one worker, zero retries and forbid-only. Existing default config's CI retry value is overridden by that controlled command; this release preserves that contract.

Controlled runtime observation before implementation (2026-10-24): after existing sut:up and sut:reset, a temporary ignored TypeScript observer issued direct requests, suppressing credentials/token/identity values. Anonymous GET returned 401 and exactly {"message":"Unauthorized"}; login returned 200, token_type=bearer and a three-segment token; authenticated GET returned 200. Boolean checks confirmed injected email, pinned positive first/last name and nonempty ID. Observed profile keys: id, provider, first_name, last_name, phone, dob, email, totp_enabled, created_at, address. Saved only sanitized observations under ignored .sut/. This is application observation, separate from official source and requirement approval.

## 3. Authorization boundary selected

Missing authentication versus a fresh seeded-customer bearer JWT on the same `GET /users/me` resource. Risk: customer-profile disclosure or resolution to the wrong customer. This is an API authentication boundary, not a claim of cross-customer object authorization or comprehensive security testing.

## 4. Requirement proposal

**REQ-API-AUTH-001 — Proposed, requires human approval**, defined in requirements.md before implementation. Unauthenticated: 401, authorization-error JSON, no customer identity. Authenticated: 200 and the injected positive customer's profile. Recommended **T-API-AUTH-001**, both sides in one independent scenario. Official pinned documentation/source and existing repository evidence support the proposal; runtime observation/execution remain separate evidence. No approval inferred.

Scope excludes IDOR, role matrices, invalid/expired/revoked tokens, logout/refresh, account locking, TOTP, disabled users, mutations and other resources.

## 5. Test-layer decision

Playwright APIRequestContext directly reaches the backend without creating a browser or relying on UI execution. One scenario establishes its own authentication. Thirteen UI cases retain their own setup and assertions.

## 6. Architecture decision

The API implementation adds only tests/api-authorization.spec.ts with the existing per-test request fixture (APIRequestContext); Playwright disposes it automatically. Direct absolute controlled API baseURL is spec-local; no new API environment variable or lifecycle change. Keep the existing controlled helper and Chromium project selection; API tests can execute in that project without requesting a browser fixture. No new project/pipeline, REST dependency, client hierarchy, auth fixture, token manager or reusable API helper is needed for a single scenario.

A concrete pre-existing artifact exposure required bounded CI reporting hardening under the human decision below. The CI-only wrapper and scan are in one TypeScript script, with three Node security checks. The config adds the built-in JSON reporter only when the wrapper sets TOOLSHOP_CI_EVIDENCE=1; normal local HTML reporting is unchanged. The lifecycle helper is unchanged.

## 7. Security handling

Only existing injected TEST_USER_EMAIL/TEST_USER_PASSWORD. No credentials, cookies, tokens, storage state or raw authentication response attachments committed. API tracing must be disabled for this spec because native traces can retain request/response secrets; UI diagnostics stay unchanged. Assert sanitized booleans for identity/token checks and suppress raw transport exceptions so failure messages cannot echo authorization headers. The built-in request fixture disposes its isolated APIRequestContext automatically.

### Discovered exposure, delivery stop and human reporting decision

The pre-existing UI HTML report includes injected credential values in locator.fill step titles, including the positive password. The first local secret scan detected this in existing UI tests; the API detail was clean. Values are not reproduced. Commit, push, hosted execution and PR creation were stopped before any Release 8 upload.

Human direction on 2026-10-26 explicitly authorized a bounded CI reporting change within Release 8: preserve LoginPage credential entry and all assertions; full diagnostics may remain local; public artifacts/logs must exclude sensitive authentication data; scan every upload candidate; withhold unsafe diagnostics and retain the original test failure. This authorizes reporting hardening only and does not approve REQ-API-AUTH-001.

### Implemented public boundary

- Built-in Playwright JSON plus HTML are retained privately. The wrapper captures all child stdout/stderr in ignored .sut/ci-console.log, so UI failure messages cannot bypass the artifact gate through public CI logs. It delegates to the unchanged controlled TS helper and preserves its exit code.
- A compact JSON summary copies only test titles, layer, result/outcome/retry, counts, configured/actual workers, configured retries, forbidOnly, reset/seed confirmation and global-error count. No failure text, steps, stdout/stderr, request/response data, attachments, full config/environment or absolute paths are copied. JUnit was considered; like other built-in full reporters, it can include failure/output details. The built-in JSON projection is the equivalent compact format chosen for this boundary; no custom reporter or reporting dependency. [Official reporter documentation](https://playwright.dev/docs/test-reporters#json-reporter) confirms multiple reporters and JSON outputFile; installed reporter types were also inspected.
- Every candidate (compact results, HTML directory, test-results directory) is scanned for injected controlled/environment secrets, common encoded forms, JWT/bearer/header/cookie/token material, symlinks, invalid/oversized/opaque data. Only fully inspectable clean candidates are copied to exact scanner-owned .sut/ci-public/ paths. Exact staged bytes and the SHA256 manifest are scanned again.
- No ZIP/image parser, encryption or reporting framework is added. Embedded base64 HTML reports, archives and screenshots fail closed as sensitive-or-uninspectable. This deliberately withholds native rich reports rather than assuming compressed/binary content is safe. Fully inspectable clean raw candidates remain eligible; diagnostics upload is additionally failure-only.
- All three upload actions require scan-step success and the matching clean output. No raw root is uploaded. The scan records clean/absent/withheld decisions in workflow output, job summary and scan.json without filenames or matched values. Test failure is never converted to success by a successful security scan.

Full local HTML, private JSON, console and native diagnostics remain available in ignored locations and can contain credentials/session data. Public evidence is intentionally smaller; diagnosis requiring raw material must be reproduced locally. The three security checks use synthetic canaries only.

## 8. Files changed

- tests/api-authorization.spec.ts: one request-only authorization boundary scenario.
- docs/requirements.md: Proposed REQ-API-AUTH-001, pinned evidence and boundaries.
- docs/test-catalogue.md: T-API-AUTH-001 mapping and 13 UI + 1 API counts.
- README.md: current scope and independent API command.
- docs/release-08-summary.md: persistent discovery/proposal/design/validation package.
- scripts/ci-evidence.ts: CI-only capture, compact JSON projection and fail-closed artifact scan/staging.
- scripts/ci-evidence.test.ts: three security checks for encodings/authentication material, nested/opaque candidates and failure-result preservation.
- playwright.config.ts: opt-in built-in JSON reporter alongside local HTML.
- .github/workflows/playwright.yml: run security checks, capture test output, scan before upload and gate each staged artifact.

Existing thirteen UI scenarios/assertions, Page Objects (including LoginPage), lifecycle helper, reset/seed, pins, dependencies, strict TS options, execution flags and UI diagnostic capture settings have no diff from main. Only the reporter selection and justified CI reporting/upload boundary change. Unrelated pre-existing output/ and tmp/ remain untouched and unstaged.

## 9. Isolated API validation

Post-hardening repeat: `npx.cmd tsx scripts/ci-evidence.ts run tests/api-authorization.spec.ts`, then `scan`: **1/1 PASS**, compact summary clean, HTML withheld as sensitive-or-uninspectable; no failure attachments. JSON evidence confirms configured/actual workers=1, configured/actual retries=0, forbidOnly=true and resetSeedConfirmed=true.

`npm.cmd run test:controlled -- tests/api-authorization.spec.ts`: **1 passed (2.0s)**, exit 0, own authentication and no browser fixture. Existing helper independently reset/seeded the database and verified bounded API/frontend/database/catalog readiness. One worker, zero retries, --forbid-only.

## 10. Full regression

### Final post-hardening validation (2026-10-26)

- `npm.cmd run typecheck`: PASS, strict tsc --noEmit.
- `npx.cmd tsx --test scripts/ci-evidence.test.ts`: **3/3 PASS** (security checks, separate from the 14 Playwright scenarios). Covers credential encodings/authentication material, nested/opaque content and preservation of failed outcomes without copying sensitive channels.
- `npx.cmd tsx scripts/ci-evidence.ts run tests/login.spec.ts`, then `scan`: **4/4 UI PASS**; compact summary clean; raw HTML withheld.
- `npx.cmd tsx scripts/ci-evidence.ts run`, then `scan`: **14/14 PASS (13 UI + 1 API)**; duration 33.0s; expected=14, unexpected=0, flaky=0, skipped=0, globalErrors=0. All exact current titles matched. Configured/actual workers=1, configured retries=[0], every passed result retry=0, forbidOnly=true, resetSeedConfirmed=true. Existing controlled helper performed its normal bounded readiness and reset/seed.
- `npm.cmd run sut:down` and explicit label-filtered container/network/volume guards: PASS, all absent.
- actionlint and git diff --check: PASS. Review verified 26 protected baseline files unchanged, including all thirteen UI tests, Page Objects, strict TS options, lifecycle helper, pins and dependencies. Nine delivery files contain no injected credential or live token; synthetic security test data only.

Final local scan: compact summary **clean**; raw HTML **sensitive-or-uninspectable, withheld**; green test-results metadata **clean** (eligible but not uploaded because diagnostics upload is failure-only). All staged candidates were re-scanned. results.json SHA256: `6dcd52a54e788b4a3a373710dd628bafcebc11bf8c6e13a274d6d1c728b8d5e5`.

### Controlled failure/withholding verification

A temporary local request-only validation spec (removed before final regressions/commit) attached a synthetic Authorization value and failed deliberately. The wrapper retained **exit=1**, unexpected=1 and failed/retry=0 in compact evidence; public wrapper/scan output and staged summary contained no synthetic token. The scanner approved compact summary and withheld both HTML and sensitive diagnostics; no raw stage directories were created. The scan returned success without altering the original failed test exit. No real credentials or live tokens were printed by this experiment. Actual evidence is retained privately under .sut/release08-security-failure.json. Workflow has no continue-on-error and keeps the tests step failure independent of scan/upload success.

### Earlier local evidence before reporting hardening

`npm.cmd run typecheck`: PASS, strict tsc --noEmit. Unchanged workflow syntax: actionlint PASS.

`npm.cmd run test:controlled -- tests/login.spec.ts`: **4 passed (18.0s)**, all existing authentication UI assertions unchanged.

`npm.cmd run test:controlled`: **14 passed (54.4s)**, **13 UI + 1 API**, no failures/skips/flaky results. Every controlled invocation reset/seeded accounts, login counters and catalog before execution; one worker, zero retries and --forbid-only. Native HTML report extracted and checked: total=14, expected=14, unexpected=0, flaky=0, skipped=0, ok=true, actualWorkers=1; exact fourteen current titles, one passed result each, retry=0, no attachments. Local report ZIP SHA256: 0c8c81230e580aca4d49c8b6dfb80c42122df97af674a915d0c6bd34a3e12adb.

`npm.cmd run sut:down`: exit 0. Subsequent label-filtered container/network/volume queries returned empty; explicit guard printed Controlled containers, networks and volumes absent.

## 11. GitHub Actions evidence

Actual [hosted run 40369911905](https://github.com/alvarotarrifaste/playwright-toolshop-automation/actions/runs/40369911905), [job 121737563418](https://github.com/alvarotarrifaste/playwright-toolshop-automation/actions/runs/40369911905/job/121737563418): **success**, workflow_dispatch attempt 1, 2026-10-26 **17:34:43–17:36:33 UTC**, implementation commit **408e832631aa131650524990e3da20946d4f5bc9** on release/08-api-authorization. Only remediated workflow content was pushed/dispatched. No Release 8 public raw report was uploaded before or after remediation.

| Hosted check | Evidence |
| --- | --- |
| Install/typecheck/security checks | npm ci, strict typecheck, three security checks and Chromium/system dependency installation passed |
| Controlled environment | Locked tag/SHA verified; unchanged pinned images; bounded API/UI readiness; ARM64 gateway and scheduler exclusion steps passed |
| Controlled execution | **14/14 PASS: 13 UI + 1 API**; all exact repository titles present; expected=14, unexpected=0, flaky=0, skipped=0, globalErrors=0; one configured/actual worker; configuredRetries=[0], exactly one passed retry=0 result per test; forbidOnly=true; resetSeedConfirmed=true |
| Cleanup | Teardown step passed; public log explicitly confirms containers, networks and volumes absent |
| Candidate scan | Compact summary clean; HTML sensitive-or-uninspectable, withheld; green test-results metadata clean |
| Uploads | Only **controlled-results** uploaded; raw HTML upload skipped by gate; raw diagnostics upload skipped because execution passed |

### Public artifact and log verification

Downloaded [controlled-results artifact 12672676476](https://github.com/alvarotarrifaste/playwright-toolshop-automation/actions/runs/40369911905/artifacts/12672676476): **1,105 ZIP bytes**, created 2026-10-26T17:36:30Z, expires 2026-11-09T17:36:29Z (14 days). Archive contains exactly **results.json** and **scan.json**. No rich report, trace, screenshot, console dump, raw JSON reporter output, credentials file or auth response is included. The artifact list contains exactly one upload.

ZIP SHA256 **31abd2dff0cd9a39b840f123df7dc53ec176ed46677cce4f7aeedc84877048e5** independently computed and equal to GitHub digest. results.json SHA256 **6dcd52a54e788b4a3a373710dd628bafcebc11bf8c6e13a274d6d1c728b8d5e5** matches the scan manifest (and deterministic local final summary). Both downloaded files independently pass the credential/authentication-material scan. All fourteen exact titles/results, worker/retry settings and lifecycle flags were asserted from the downloaded summary, not inferred from a green badge. The manifest also hashes clean staged green diagnostics metadata, which was not uploaded under the failure-only condition.

Downloaded and audited all **23 public log files** (including aggregate/per-step logs) against injected credential values/encodings and JWT/bearer/header/cookie/token patterns. No injected credentials or unmasked authentication material found. GitHub checkout's already masked Basic authentication placeholder was recognized as masked-only during audit; no scanner upload policy was relaxed. Test output contains compact counts only, not raw failure/step data. Logs explicitly confirm HTML withholding and successful cleanup. Independent audit evidence remains ignored under .sut/release08-hosted-verification.json; no raw logs/reports are committed.

This hosted run validates the green public boundary. Sensitive failure withholding was deliberately exercised locally as described in section 10; no hosted failure experiment is claimed. A final evidence-only commit changes this package, not the tested executable/workflow tree. The PR event may start another run after creation; that later run is not represented here as already complete.

## 12. Risks / limitations

One customer and missing-versus-valid authentication only. Assertions are scoped to pinned seed/source and runtime observations, not a general API security certification. Image digests and source SHA retain existing provenance limitations. Existing UI diagnostics may contain synthetic test data; this pilot avoids adding API authentication material to them. Report retention remains 14 days. Requirement approval remains a human decision.

The pre-existing local UI-report exposure remains by explicit decision; public publishing is remediated at the boundary in section 7. The scanner is a conservative bounded guard, not a universal data-loss-prevention product: unknown encodings/secret formats are not exhaustively recognized, so binary/packed content is withheld and public result content is minimized. Native rich reports normally fail this policy even when a particular run contains no secret. No public raw-debugging promise is made. No historical artifacts are deleted or retroactively remediated in Release 8.

## 13. Reviewer guide

Review pinned sources → Proposed requirement → catalogue mapping → API scenario → reporting decision/wrapper/scan and upload gates → isolated/full/failure-path/hosted evidence → downloaded compact artifact and scan manifest → unchanged functional contracts. Confirm raw diagnostics stay local and unsafe content cannot reach any upload action or raw test console output. UI source is supporting evidence only.

## 14. Interview defense

- Why this boundary? It protects customer data directly; UI redirects can pass even if the backend allows anonymous reads.
- Why both sides? Rejection alone could pass against a broken endpoint; successful access tied to the intended customer proves meaningful authorized behavior.
- Why one scenario? Both requests prove one boundary, with its own login and no order dependency.
- Why no framework? Existing Playwright API capabilities solve this single pilot without a reusable architecture.
- Why Proposed? Documentation, source and execution establish evidence; human leadership establishes approval.
- Why no fixed customer ID? Reset/seed generates IDs; injected email plus seeded identity is the stable oracle.
- Why trace off here? Authentication payloads and headers can appear in native traces. Existing UI diagnostics remain intact locally.
- Why public compact JSON? Built-in rich reporters can expose failure/step data. A small allowlist avoids copying these fields, and every upload still passes a separate scan.
- Why withhold opaque files? Without adding an archive/image analysis framework, the scanner cannot prove their contents clean; withholding is explicit and preserves test failure.
- Why capture CI console too? An artifact-only scan cannot stop reporter error text from leaking through the workflow log.

## 15. Release status

Discovery, proposal, focused implementation and local validation complete. Requirement remains Proposed. Human reporting decision implemented and locally verified, including controlled failure withholding. Final local results: API 1/1, authentication 4/4, full 14/14; typecheck and three security checks pass; one worker, zero retries, reset/seed, forbid-only and clean teardown confirmed. Hosted validation **14/14 PASS** and independent artifact/log verification complete: one clean compact artifact, raw HTML withheld, no injected credentials or unmasked authentication material found in public evidence/logs, cleanup verified. No remaining implementation/validation blocker. REQ-API-AUTH-001 remains Proposed; one-customer/missing-versus-valid scope and conservative scan limitations remain explicit.

Git delivery: base main **6aee6ff**; branch **release/08-api-authorization**; implementation **408e832631aa131650524990e3da20946d4f5bc9**, test: add Release 8 API authorization pilot. A final documentation-only evidence commit follows hosted verification. PR title **test: add API authorization coverage**, target main, open/not draft. PR creation is the final delivery action after evidence commit/push; the returned URL belongs in the handoff. No merge or Release 9 work.

## 16. Post-merge human closure

This is a separate closure record. Sections 1–15 above preserve the original Proposed requirement, pre-merge decisions, implementation and validation history; they are not rewritten as if approval existed before human review.

**L8 — explicit human leadership approval:** supplied in the Release 9 Step 0 instruction after [PR #12](https://github.com/alvarotarrifaste/playwright-toolshop-automation/pull/12) merged. Main merge commit: **fbb1a9df6f0718d01af86d0e312c84a4c005a062**. Post-merge [run 40375008221](https://github.com/alvarotarrifaste/playwright-toolshop-automation/actions/runs/40375008221) is the closure execution evidence supplied by leadership.

| Post-merge closure evidence | Result |
| --- | --- |
| Functional suite | **14/14 PASS: 13 UI + 1 API** |
| Strict TypeScript check | **PASS** |
| CI-evidence security checks | **3/3 PASS** |
| Controlled execution | **One worker, zero retries** |
| Reset/seed and teardown | **PASS** |
| Public evidence | Sanitized **controlled-results** artifact published |
| Raw HTML | **Withheld** by the CI evidence security boundary |

**REQ-API-AUTH-001 is Approved** by this explicit human decision; T-API-AUTH-001 maps to that approved requirement. The bounded authorization meaning, thirteen existing UI scenarios, lifecycle controls and reporting/security decision remain unchanged. Approval comes from leadership, separately from source, observation and passing automation.

**Release 8 CLOSED.** Release 9 starts only after this three-document reconciliation is committed separately as `docs: close Release 8 API authorization pilot`. No Release 9 architecture decision is attributed to this closure.
