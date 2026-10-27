# Release 13 — Authentication & Account Security

## 1. Objective

Expand meaningful authentication/security coverage after the R12 architecture increment. Base: merged main **46551731c1172af944286778cab3a165a968cd4c**. Branch: `release/13-authentication-security`. Discovery selected **two new API scenarios** and strengthened the existing UI logout scenario, for **19 total: 16 UI + 3 API**. All seventeen baseline scenarios remain; no target count dictated scope.

## 2. R12 closure

Separate commit **aa4de36**, `docs: close Release 12 portfolio architecture`, appends [post-merge human closure](release-12-summary.md#17-post-merge-human-closure) without changing original sections. Supplied evidence: PR #16 merged, merge 46551731c1172af944286778cab3a165a968cd4c, post-merge run 40412377999, 17/17 (16 UI + 1 API), strict TypeScript PASS, 3/3 CI evidence checks PASS, one worker/zero retries, reset/seed and teardown PASS, sanitized controlled-results artifact 12692074847, raw HTML withheld. **Release 12 CLOSED.**

## 3. Authentication discovery

Inspected exact pinned Toolshop 2.5 source **9e7736c3841ec2bbb9a6822c9e6602353b7b9a65**, User Login AC2–AC6, UserService/UserController, protected routes and exception handler, user seeder/default migration, JWT blacklist config, browser token storage, customer-account service, header logout, auth interceptor and UserAuthGuard. Existing pins/images are unchanged.

**P13 — Official pinned documentation:** [User Login AC4](https://github.com/testsmith-io/practice-software-testing/blob/9e7736c3841ec2bbb9a6822c9e6602353b7b9a65/docs/user-stories/v5.md) says three consecutive incorrect attempts, then another login produces the documented lock message/HTTP 423. AC5 exempts admins; AC6 describes disabled accounts. Those distinct variants are not automatically included in this release.

**I13 — Official pinned source:** [UserService](https://github.com/testsmith-io/practice-software-testing/blob/9e7736c3841ec2bbb9a6822c9e6602353b7b9a65/sprint5/API/app/Services/UserService.php), [UserController](https://github.com/testsmith-io/practice-software-testing/blob/9e7736c3841ec2bbb9a6822c9e6602353b7b9a65/sprint5/API/app/Http/Controllers/UserController.php), [JWT config](https://github.com/testsmith-io/practice-software-testing/blob/9e7736c3841ec2bbb9a6822c9e6602353b7b9a65/sprint5/API/config/jwt.php), [customer-account service](https://github.com/testsmith-io/practice-software-testing/blob/9e7736c3841ec2bbb9a6822c9e6602353b7b9a65/sprint5/UI/src/app/shared/customer-account.service.ts), [token storage](https://github.com/testsmith-io/practice-software-testing/blob/9e7736c3841ec2bbb9a6822c9e6602353b7b9a65/sprint5/UI/src/app/_services/token-storage.service.ts), [route guard](https://github.com/testsmith-io/practice-software-testing/blob/9e7736c3841ec2bbb9a6822c9e6602353b7b9a65/sprint5/UI/src/app/UserAuthGuard.ts). Source and runtime evidence are separate.

**O13 — Controlled runtime:** third seeded enabled customer initially 200; three invalid login responses 401; subsequent wrong and correct credentials both 423; independent positive customer still 200. Explicit backend logout: protected /users/me 200 → /users/logout 200 → same-token /users/me 401. UI sign-out removed auth-token, issued zero backend logout requests, blocked a subsequent direct /account navigation, while its captured old token still received API 200. These observations prevent treating UI sign-out as backend revocation.

Temporary observation initially used the workstation browser locale and could not find English controls. Repeating observation with the suite's English locale resolved that scaffolding issue; no application or existing test changed to accommodate it. Temporary observers, tokens and raw errors remain private under ignored .sut/. No source inspection alone is presented as a passing runtime check.

## 4. Account-locking behavior

POST /users/login selects a customer by supplied email. For a non-admin customer already at the three-failure threshold, it returns the lock error before password verification. Otherwise failed authentication increments that customer's attempt state and returns 401/error Unauthorized. Thus attempts **1, 2 and 3 return 401**; **attempt 4 and later return 423**, including a correct password. The third rejection creates the state, but is not itself HTTP 423.

Successful login before locking resets the consecutive-failure state. No timed-unlock condition was found in this path or controlled scheduler; no wait/sleep is needed to unlock. Reset/seed restores default zero state and enabled seeded accounts. Admin exemption, nonexistent users and disabled-account ordering are source observations, not automated matrices here. UI login can render the backend lock message, but a duplicate UI threshold test would repeat the backend risk without a separate approved UI experience requirement.

## 5. Requirement decisions

| Requirement | Status | Decision / mapping |
| --- | --- | --- |
| REQ-AUTH-005 | **Approved**, implementation deferral lifted | **T-AUTH-005**, API. Exact threshold and subsequent-login semantics agree with approved wording and P13/I13/O13. No new requirement ID substitutes for it. |
| REQ-AUTH-003 | **Requires confirmation**, unchanged | **T-AUTH-003**, existing UI test extended to revisit /account and verify login URL/button. Client sign-out behavior only. |
| REQ-AUTH-004 | **Requires confirmation**, unchanged | Existing fresh-visitor protected-route test preserved; not conflated with the post-login/logout path. |
| REQ-API-AUTH-002 | **Proposed, human review pending** | **T-API-AUTH-002**, explicit API logout invalidates the same JWT for /users/me. Endpoint OpenAPI/source and runtime support this separate backend behavior. |

New API logout requirement is recorded in requirements before scenario implementation. Passing automation does not approve it. No remaining requirement is promoted by inference. REQ-AUTH-005's historical Release 1 deferral remains explicitly documented.

## 6. Test design/layer decision

**T-AUTH-005:** own dedicated seeded customer valid login (200) establishes usable starting state and consecutive sequence; exactly three deliberate wrong-password POSTs assert 401/error-only Unauthorized; subsequent wrong/correct POSTs assert 423/exact lock error; positive customer correct login still returns 200. Risk: threshold/off-by-one errors, correct-password bypass of a locked account and unintended cross-customer lock contamination. API is the direct oracle for HTTP and persistent state transitions.

**T-API-AUTH-002:** own fresh UI-independent API login; nonempty token; protected read 200; explicit authenticated GET /users/logout 200/exact confirmation; replay identical token to /users/me gets 401/exact Unauthorized error. Risk: a nominally successful revocation endpoint leaving the credential usable. No token substitution between before/after; no saved auth state.

**T-AUTH-003:** retain original successful-account URL and visible Sign in assertions. Then navigate directly to /account and assert /auth/login plus Login button. Risk: browser sign-out leaving protected-route access usable. This extends the same logout responsibility instead of creating a duplicate scenario. It extracts no token and makes no backend-revocation claim.

Malformed/expired-token, disabled-account, admin and TOTP variants were considered but deferred: no need for a broad security matrix or additional account mutation in this focused release. No new smoke case; account locking intentionally persists state. Existing five smoke selections remain unchanged.

## 7. Data/account isolation

Pinned seeder has one admin and three enabled customers. Existing positive login/logout/purchase uses the first; existing single-invalid-password UI test uses the second. **Locking uses the third**, injected as TEST_LOCK_USER_EMAIL / TEST_LOCK_USER_PASSWORD. Its email must differ from both other injected customer emails; the test fails before mutation on collision. No positive customer ever receives a threshold sequence.

Reusing the existing second negative customer would contaminate its baseline invalid-password test after locking. Depending on file order, serial grouping, an in-test global reset, admin unlock or a custom cleanup fixture would obscure ownership. Instead a separate seeded identity isolates the persistent mutation. Locked state intentionally persists until the next existing reset/seed or disposable teardown. All scenarios establish their own browser/request context, and subsequent suite tests do not consume the locked identity.

Provisioning derives defaults from the pinned external seeder; no credential values are committed. Fresh controlled files include the pair. Older files receive only missing locking keys; existing values remain intact, with external environment variables retaining precedence. No account factory, registration dependency, database credential, generated-ID constant or per-test SQL reset.

## 8. Implementation

New focused `tests/api/authentication/account-security.spec.ts` groups two state-changing authentication security behaviors. Existing `authorization.spec.ts` remains focused on anonymous/authenticated current-customer access. Both use injected API_BASE_URL and disable request tracing. Existing UI authentication spec adds three post-logout assertions/navigation lines; no new Page Object locator/action is needed.

The controlled helper injects API_BASE_URL from its existing API endpoint constant, replacing the old API spec's fixed loopback URL. Direct/manual API runs require the variable (template updated); beforeAll guards fail explicitly if absent instead of silently targeting the UI endpoint. Lifecycle readiness/reset/seed/locking/teardown, Chromium, one worker, zero retries and forbid-only remain unchanged.

## 9. Architecture impact

Preserves R12 domain/layer folders, direct imports, five unchanged Page Objects and all npm subset aliases. New tests use native @api/@auth/@regression; no @smoke, @security, @negative or priority tags added. No AuthService, client, token manager, fixture hierarchy, factory, credential provider, retry helper or generic assertion library. Tests show every HTTP transition and assertion top-to-bottom.

| Delivery file | Responsibility |
| --- | --- |
| docs/release-12-summary.md | Separate append-only R12 closure commit |
| tests/api/authentication/account-security.spec.ts | Two focused API security scenarios |
| tests/api/authentication/authorization.spec.ts | Injected endpoint and explicit missing-config guard; body/assertions preserved |
| tests/ui/authentication/authentication.spec.ts | Additive post-logout protected-route checks |
| scripts/toolshop.ts | Dedicated seeded locking credentials, backward-compatible local provisioning, API endpoint injection |
| .env.example | API endpoint and locking credential placeholders |
| docs/requirements.md | Existing approved locking implementation and separate proposed revocation requirement |
| docs/test-catalogue.md | Current counts, IDs, mappings, risk/limitations |
| README.md | Concise current coverage, subset counts and necessary endpoint configuration |
| docs/release-13-summary.md | Discovery, decisions, validation and review evidence |

Architecture gate: meaningful security coverage **yes** (locking and explicit token invalidation); correct layers **yes** (API transitions, UI browser route); deterministic cleanup **reset/seed**, independently proven below; independent tests **yes**, given the controlled invocation contract; R12 structure **preserved**; unjustified abstraction **none**; readable without helper navigation **yes**; hardcoded environment/runtime identity **none added**; full-suite determinism **validated below**. Explicit statuses, messages, three-attempt threshold and deliberate wrong password are test oracles/negative input, not deployment configuration.

## 10. Security handling

New request-only spec uses trace off, no raw response attachments or stdout, and generic caught transport/parser errors. Error bodies and token properties use boolean assertions so unexpected secrets do not appear in assertion diffs. Tokens remain only in request-local variables; headers are per request. UI tests retain existing private failure diagnostics and do not extract browser tokens.

Existing evidence scanner already scans every controlled-file value and matching externally injected credential variable; new locking credentials therefore enter its input without scanner changes. Scanner rules, compact allowlist, staged-byte re-scan, workflow publication, private diagnostics and teardown verification are unchanged. Full local reports/observer data are ignored and not published. No sensitive values in titles/tags, source, README or data files.

The initial revocation test correctly observed the 200→200→401 transition but expected the exception handler's Token is not valid body. Controlled observation showed error-only Unauthorized. Pinned Authenticate middleware catches JWTException before that handler and returns this generic 401; the oracle was corrected to that route-specific response. No product behavior or baseline assertion was weakened.

## 11. Isolated execution

Strict TypeScript **PASS**; discovery **19 tests in 9 files**. Existing security checks **3/3 PASS**. **T-AUTH-005 1/1 PASS**, **T-API-AUTH-002 1/1 PASS**, strengthened **T-AUTH-003 1/1 PASS**, and **positive UI recovery 1/1 PASS**, each independently through the controlled evidence wrapper. Each invocation confirmed reset/seed, one worker, zero retries, forbid-only and exactly one passed result at retry 0. Compact results were scanned clean; raw HTML withheld. The initial revoked-token body mismatch and its evidence-backed correction are documented above; final isolated execution passed with zero retries.

## 12. Auth regression

`npm.cmd run test:auth`: **7/7 PASS — 4 UI + 3 API**, with private reporter capture and independently verified compact metadata. Original `authorization.spec.ts`: **1/1 PASS** through the controlled wrapper. Both executions confirmed reset/seed, one worker, zero retries and forbid-only; no unexpected/flaky/skipped/global errors. Existing UI/API assertions are preserved, with only the explicit additive logout-route checks and API endpoint injection change.

## 13. Reset/recovery proof

Required sequence: controlled reset/seed → isolated locking scenario → independent correct-credential lock probe 423 / positive-customer success / separate baseline negative customer unaffected → controlled reset/seed → locking customer usable and positive customer successful → positive UI login. No timers or unlock manipulation. **Observed after isolated locking:** locking customer correct login **423**, positive correct login **200**, baseline negative correct login **200**. **After explicit sut:reset:** all three correct logins **200**, followed by independent positive UI login **1/1 PASS**. These probes use only private injected/seeder-derived credentials and record status codes, never tokens/identity values. The reset clears the persistent lock without a timed wait, and neither baseline customer was contaminated.

## 14. Full regression

`npx.cmd tsx scripts/ci-evidence.ts run`, followed by scan: **19/19 PASS (16 UI + 3 API)**, 45.6s. Includes all seventeen baseline cases and two additions. Exact-title/metadata checks confirm expected=19, unexpected/flaky/skipped/global errors=0, configured/actual worker=1, retries=[0], each result passed at retry 0, forbidOnly=true and resetSeedConfirmed=true. Auth runs before the other domains in this controlled execution; later original negative/positive UI logins still pass, so the lock does not contaminate regression.

Baseline comparison verifies all seventeen original test bodies/assertions are identical after removing only the three additive UI logout lines; existing API test body is byte-equivalent below its configuration preamble. Five Page Objects, Playwright/TypeScript configuration, npm aliases/dependencies/lockfile, scanner/security checks, workflow and SUT lock match main. Tag audit confirms all 19 have one layer/primary domain/regression and smoke stays five. Current documentation file links resolve; changed source/docs contain no injected credentials. actionlint and git diff --check PASS.

Public compact evidence scanned clean; raw HTML withheld as sensitive-or-uninspectable. Result SHA256 **579c5fc60a8d80357ef0c0e40cf40df96ade2ef97ef2c48572ec76adae3abaa4**. `npm.cmd run sut:down` passed; independent Docker label queries confirmed no controlled containers, networks or volumes. Unrelated untracked output/ and tmp/ remain untouched.

## 15. CI/security evidence

Local CI evidence security checks **3/3 PASS**. Hosted [run 40516438507](https://github.com/alvarotarrifaste/playwright-toolshop-automation/actions/runs/40516438507), job **122231442208**, at **146584ad4a1816f39f66bd77b8f66e57aefbcfda**: **SUCCESS**. Later delivery edits only record this evidence in documentation.

| Hosted evidence | Result |
| --- | --- |
| Strict TypeScript | **PASS** |
| CI evidence security checks | **3/3 PASS** |
| Fresh controlled provisioning | **PASS**, new ignored env file generated from pinned seeder with dedicated locking credentials |
| Full controlled suite | **19/19 PASS — 16 UI + 3 API** |
| Result integrity | All 19 exact repository titles; expected=19; unexpected/flaky/skipped/global errors=0 |
| Execution | Configured/actual worker=1; retries=[0]; every result passed at retry 0; forbidOnly=true |
| Reset/seed | **PASS**, confirmed by compact evidence |
| Teardown | **PASS**, logs confirm controlled containers/networks/volumes absent |
| Publication | Only sanitized **controlled-results**, artifact **12740176567**, **1305 bytes**, 14-day retention |
| Scan decisions | Summary clean; raw HTML withheld as sensitive-or-uninspectable; diagnostic metadata clean, no failure upload on green run |
| Public log audit | **23 log files scanned clean**, including both new locking credential values |

Downloaded artifact contains exactly results.json and scan.json. ZIP SHA256 **31f724f5239ce7f6475e0c15cc96709aced2689e96760909fd7895387834b9ee** matches GitHub metadata. Result SHA256 **579c5fc60a8d80357ef0c0e40cf40df96ade2ef97ef2c48572ec76adae3abaa4** matches the scan manifest. Independent inspection verifies outcomes/titles, same execution flags, resource absence, raw-HTML withholding, public log security and artifact hashes. Fresh CI provisioning complements the local existing-file upgrade validation. No workflow, scanner, security-test or SUT image/source pin changes.

## 16. Risks/limitations

Locking intentionally leaves one dedicated customer locked until reset/teardown; direct reruns without reset are not supported. No overlapping manual use, other workers or resets; unchanged one-SUT/one-worker contract. Custom injected identities must exist, be enabled and remain distinct. No timed unlock or administrator remediation claim. Locking assertions concern subsequent login, not revocation of pre-existing tokens. UI logout does not revoke the captured JWT in the pinned implementation; explicit API logout is separately verified. Revocation coverage is immediate same-token readback on one controlled node, not a full token/session family or distributed-cache security audit. New API logout requirement remains Proposed pending human review.

## 17. Reviewer guide

Review separate R12 closure first. Compare P13/I13/O13 and exact 401/423 sequence to approved REQ-AUTH-005. Inspect the three distinct customer roles and provision upgrade/default behavior. Read the new API spec without jumping through helpers; confirm replay uses the same token and all requests suppress raw failures/traces. Review the three additive UI lines and unchanged original assertions. Check exact isolated/auth/full counts, lock/recovery probes, positive UI recovery, scanner results, hosted artifacts/logs and Docker resource absence. Human owns requirement approval and merge.

## 18. Interview defense

- Why API locking? Threshold/status/state are backend security behavior; a duplicate UI sequence adds cost without another requirement.
- Why a third customer? Browser isolation cannot undo persistent login counters; separate identity avoids contaminating the existing negative test regardless of order.
- Why no cleanup fixture? Existing reset/seed and disposable teardown own mutable account state; independent recovery proof shows that ownership works.
- Why strengthen one UI test? Post-logout route access belongs to its existing responsibility and avoids count-driven duplication.
- Why separate explicit logout? UI only clears local storage; backend endpoint intentionally invalidates a JWT. Conflating them would invent a product requirement.
- Why direct request calls? Two focused cases benefit from visible transitions more than an auth framework.
- Why keep 401/423/messages literal? They express pinned behavioral oracles; environment endpoints, credentials and generated tokens are injected/runtime values.

## 19. Release status

**Release 13 implementation and validation complete; ready for human review through an OPEN PR against main.** Two focused API scenarios added and existing UI logout strengthened; all seventeen baseline scenarios remain green. Final suite **19: 16 UI + 3 API**. Strict types, isolated cases, auth 7/7, original API regression, account isolation/reset recovery, local/hosted 19/19, security 3/3, scanned public evidence, teardown and diff checks PASS. Approved REQ-AUTH-005 is implemented; REQ-API-AUTH-002 remains Proposed for human review, and existing Requires confirmation requirements are unchanged. Release 12 is CLOSED. Delivery stops before automatic merge; Release 14 is not started.

## 20. Post-merge human closure

Original sections 1–19 preserve the discovery, Proposed revocation requirement and pre-merge evidence unchanged. Explicit human leadership closure supplied for Release 14 Step 0 records [PR #17](https://github.com/alvarotarrifaste/playwright-toolshop-automation/pull/17) merged at **09884c2cb6b7b900679df00be6cc2e17c0f3ce2c**. Post-merge [run 40523760365](https://github.com/alvarotarrifaste/playwright-toolshop-automation/actions/runs/40523760365) is the supplied closure evidence.

| Post-merge evidence | Result |
| --- | --- |
| Controlled suite | **19/19 PASS — 16 UI + 3 API** |
| Strict TypeScript | **PASS** |
| CI-evidence security checks | **3/3 PASS** |
| Execution | **One worker, zero retries** |
| Reset/seed | **PASS** |
| Teardown | **PASS** |
| Sanitized artifact | **controlled-results**, artifact **12742912935** |
| Raw HTML | **Withheld** |

**REQ-AUTH-005 approved implementation confirmed. REQ-API-AUTH-002 human-approved (L13)**; T-API-AUTH-002 maps to the approved requirement without scope/assertion changes. Explicit backend logout remains distinct from UI token clearing. Other Requires confirmation statuses remain unchanged. **Release 13 CLOSED.**
