# Release 9 — Resource Lifecycle Fixture Justification

## 1. Objective

Determine whether the current fourteen-scenario solution needs a custom Playwright resource-lifecycle fixture or another small abstraction. This is a justification sprint, not an instruction to create a fixture. Base: merged Release 8 on main **fbb1a9df6f0718d01af86d0e312c84a4c005a062**; branch **release/09-resource-lifecycle-fixture**.

Step 0 was completed first in separate commit **c37ff97ffcc76f549fed5591591baec180dcbdb2**, `docs: close Release 8 API authorization pilot`. Explicit human leadership approval (L8) changes REQ-API-AUTH-001 to Approved and maps T-API-AUTH-001 accordingly. The separate [Release 8 closure section](release-08-summary.md#16-post-merge-human-closure) records merged PR #12, merge SHA, post-merge run 40375008221, 14/14 results, strict typecheck, three security checks, controlled lifecycle and sanitized publishing. Original Proposed history in sections 1–15 remains unchanged.

Read-only GitHub verification also confirmed PR #12 merged at the supplied SHA, post-merge run 40375008221 succeeded on that SHA (push event), and its artifact list contains only controlled-results (artifact 12674462602). Human approval comes from the supplied leadership decision, not this verification.

## 2. Repetition/lifecycle analysis

Inspected every spec, all four Page Objects, Playwright config, strict TS config, controlled helper, CI evidence wrapper/security checks, workflow, requirements, test catalogue and ADR-001/002. Six spec files contain **14 tests: 13 page-based UI + 1 request-only API**. No suite-owned beforeAll/afterAll or beforeEach/afterEach hooks, custom test.extend, manual browser/request newContext, saved storageState, shared mutable test variable or test-to-test resource handoff was found in the automation tests. Read-only module-level credential strings are configuration, not mutable session state.

| Current area | Repetition/ownership found | Classification and decision |
| --- | --- | --- |
| Authentication UI — 4 tests | Each obtains its own page/context. Successful login and logout perform their own positive login; invalid-login uses the separate negative account; unauthenticated-route test has no login. | Login/denial/logout are business behavior and must remain visible. Shared seeded account state is a real constraint managed by separate positive/negative customers and reset/seed, not by sharing authentication. |
| Product Discovery — 3 UI tests | CatalogPage construction, navigation/search/completion checks repeat. Product-detail construction occurs only where needed. | Harmless/readable actions plus test-owned business preconditions/assertions; no resource requiring new teardown. |
| Category Filtering — 2 UI tests | CatalogPage construction and the same five expected identities occur twice; each creates its own filter state. | Repeated expected data and business flow, not resource lifecycle. A fixture must not hide initial-set/filter/reset assertions. |
| Add to Cart — 2 UI tests | Each constructs CatalogPage/ProductDetailsPage/CartPage and performs its own visible add; authenticated case additionally logs in. | Business flow under test. Pre-populating a cart would bypass the behavior these scenarios prove. |
| Cart Maintenance — 2 UI tests | Own cart creation via UI; one add for quantity update, two adds for selected-row deletion. Starting product/quantity/totals are asserted before the mutation. | Some setup resembles Add to Cart, but it establishes explicit, verified business state. No repeated manual allocation/disposal or unowned client context. Current length/readability does not justify hiding setup in a cart fixture. |
| API Authorization — 1 test | Built-in request fixture; local token; anonymous GET, own login, authenticated GET. No manual APIRequestContext allocation/disposal. | Existing built-in fixture already owns lifecycle. Login and both sides of the authorization boundary are essential visible behavior. An authenticated-request fixture would obscure the anonymous-to-authenticated proof and introduce unnecessary auth scope. |
| Page Objects | CatalogPage instantiated in 9 tests; 5 addToCart action calls across 4 cart scenarios. Four UI login calls overall (3 positive + 1 negative); API login is separate and serves a different layer. | Object construction owns locators/actions only; no independent allocation requiring cleanup. Action repetition is not evidence of a missing lifecycle abstraction. |
| Credential guards | Positive email/password checked in 3 UI scenarios and the API test; negative-account guard is distinct. Controlled helper also validates injected accounts centrally. | Small readable validation with local missing-configuration failures. A fixture would add indirection without improving backend isolation or owning a resource. No credential-helper refactor is necessary for this sprint. |
| Controlled SUT | Helper verifies pins/readiness, resets/seeds once before each controlled invocation, serializes lifecycle commands with operation.lock and enforces one worker/zero retries/forbid-only. Workflow always tears down and verifies containers/network/volumes absent. | Environment ownership is already centralized. Moving destructive reset into a test/worker fixture would duplicate ownership and could wipe state while another test/worker runs or restarts. Keep outside Playwright fixtures. |
| Public evidence | Existing wrapper captures raw test console, projects compact results, scans/stages each candidate and withholds sensitive/opaque diagnostics. | CI execution/publication boundary, already owned outside tests. It must not become an auto fixture or attach tokens/raw data during setup/teardown. |

### Browser isolation versus backend cleanup

Built-in contexts isolate cookies/localStorage/sessionStorage, not database rows. Pinned CartService stores cart_id/cart_quantity in sessionStorage and creates a new cart when no ID exists; API CartService creates separate cart rows and mutates items by the supplied cart ID. Current scenarios do not enumerate all carts, reuse another test's ID, submit purchases or mutate customer profiles. Cart rows may remain until the next controlled reset or environment-volume teardown; closing a page does **not** delete them. That bounded persistence is accepted for this disposable sequential environment, not described as per-test database cleanup. A new delete-after-test fixture would add API access, ID capture and cleanup-failure semantics without a demonstrated consumer requiring them today.

Successful/failed login can mutate backend counters; context disposal does not reset them. The controlled invocation resets counters and uses distinct positive/negative customers. There is only one invalid-login scenario per run. Repeated negative attempts, concurrent/direct runs or future locking coverage require renewed isolation work. Disposing the API request context also does not claim to revoke its JWT; the token is test-local, not exported or reused. Logout/token revocation is outside the approved pilot's scope.

### Source and framework evidence

- Repository evidence: [login](../tests/login.spec.ts), [API authorization](../tests/api-authorization.spec.ts), [Add to Cart](../tests/cart.spec.ts), [Cart Maintenance](../tests/cart-maintenance.spec.ts), [Product Discovery](../tests/product-discovery.spec.ts), [Category Filtering](../tests/category-filtering.spec.ts), [Page Objects](../pages/CartPage.ts), [lifecycle helper](../scripts/toolshop.ts), [config](../playwright.config.ts), [CI evidence boundary](../scripts/ci-evidence.ts), [workflow](../.github/workflows/playwright.yml).
- Official framework documentation: [fixtures](https://playwright.dev/docs/test-fixtures) and [built-in fixtures](https://playwright.dev/docs/api/class-fixtures#fixtures-request) describe isolated page/context/request fixtures, automatic teardown and test/worker scopes. The installed Playwright implementation was also inspected: request creates/disposes APIRequestContext around use; context creates and closes the browser context around use. No new dependency/version assumption was introduced.
- Pinned Toolshop source at **9e7736c3841ec2bbb9a6822c9e6602353b7b9a65**: [UI CartService](https://github.com/testsmith-io/practice-software-testing/blob/9e7736c3841ec2bbb9a6822c9e6602353b7b9a65/sprint5/UI/src/app/_services/cart.service.ts), [API CartService](https://github.com/testsmith-io/practice-software-testing/blob/9e7736c3841ec2bbb9a6822c9e6602353b7b9a65/sprint5/API/app/Services/CartService.php). Source inspection supports lifecycle reasoning; it is not a new runtime proof of cart ownership/security behavior.

## 3. Fixture justification decision

**NOT JUSTIFIED — Option B.** Recommendation was provided before creating this decision package or making any Release 9 engineering change. No custom fixture or equivalent helper is implemented.

| Decision criterion | Current evidence | Result |
| --- | --- | --- |
| Improves resource isolation/cleanup | Built-in per-test page/context/request cleanup already covers client resources; disposable controlled environment owns database reset/volume cleanup. No repeated manual resource lifecycle lacks an owner. | No demonstrated improvement from an added fixture. |
| Removes meaningful repeated lifecycle code | Repetition is mostly constructors, small guards and visible business actions. There is no repeated create/use/dispose block to consolidate. | Line-count reduction alone is insufficient. |
| Prevents demonstrated cross-test leakage | Tests establish their own session/cart; no shared token/cart/storage state. Current backend mutation risks are bounded by separate accounts, one worker and reset/seed. | No current leakage case a fixture would specifically resolve. Green tests alone are not proof of all possible isolation properties. |
| Clear prerequisite for R10/R11 | Future Billing/Purchase scope and cleanup contracts are not yet approved or exercised. Source shows possible persistent effects, but no agreed reusable resource contract exists. | Future possibility does not justify implementing an abstraction now. |

The architectural decision for R9 is complete as a documented no-change outcome, ready for human review. This is not a claim that fixtures are generally undesirable or that R10/R11 cannot justify one.

## 4. Architecture decision

Retain the existing architecture exactly: test-level assertions and explicit business setup, concrete Page Objects, built-in per-test Playwright fixtures, and process/workflow-level controlled environment and publication owners. No fixtures folder, custom base test, service container, dependency injection, generic data abstraction, shared session, API client framework, new tags/projects, functional scenario or dependency is introduced. TypeScript-first remains unchanged.

Do not wrap existing built-in request/page disposal a second time. Do not add an authenticated page/request fixture for the current scope: auth tests must see their login/denial behavior; the Add to Cart authenticated case explicitly checks its customer session; the API pilot must prove anonymous and authenticated behavior in its own context. Do not add a suite-wide cart or worker-shared customer fixture.

## 5. Ownership boundaries

| Owner | Setup responsibility | Teardown responsibility / limits | Test ownership boundary |
| --- | --- | --- | --- |
| Playwright built-in page/context | Fresh isolated browser context and page for each UI test. | Close the context/page; capture/discard diagnostics according to unchanged settings. Does not delete backend rows or undo counters. | Test chooses user/session, navigation, products, quantities and assertions. |
| Playwright built-in request | Fresh isolated APIRequestContext for the API test. | Dispose context/client response storage. No claim of JWT revocation or server rollback. | Test performs anonymous read, login, token use and identity/status assertions; no auth state handoff. |
| Existing Page Objects | Locators and concrete interactions on the supplied page. | No separate teardown: they do not own a new context or server entity. | Assertions and expected values remain in tests. |
| Controlled helper / disposable environment | Verify pinned source/images; readiness; reset/seed/accounts/counters/catalog; serialize supported lifecycle commands. | Environment down removes project containers/network/volumes; operation lock released in finally. Reset is per controlled invocation, not per test. | No test performs a global reset or assumes a previous scenario created its data. |
| Test's session/cart | UI creates/selects products and cart ID within its own fresh context. | Client state discarded at test end; residual database carts cleared by later reset/down. | Business setup/mutation/reload assertions stay visible; no cross-test cart ID. |
| CI workflow/evidence wrapper | Run unchanged controlled helper; capture raw output privately; compact result projection; scan each candidate. | Always environment teardown/verification; upload only clean staged content; withhold sensitive/opaque diagnostics without changing test result. | Tests do not publish secrets or control public upload decisions. |

### R10/R11 reassessment triggers — analysis only

Pinned [Billing story](https://github.com/testsmith-io/practice-software-testing/blob/9e7736c3841ec2bbb9a6822c9e6602353b7b9a65/docs/user-stories/v5.md) and [address component](https://github.com/testsmith-io/practice-software-testing/blob/9e7736c3841ec2bbb9a6822c9e6602353b7b9a65/sprint5/UI/src/app/checkout/address/address.component.ts) show address entry/validation, existing-customer prefill and form state; current tests stop at Cart Review. Future approved billing tests must distinguish form-only data from persisted customer updates and decide whether a unique customer or original-value restoration is needed. Keep billing validation/proceed behavior in those tests. No new billing requirement is approved here.

Pinned [payment component](https://github.com/testsmith-io/practice-software-testing/blob/9e7736c3841ec2bbb9a6822c9e6602353b7b9a65/sprint5/UI/src/app/checkout/payment/payment.component.ts) calls invoice creation and empties the cart after success. [InvoiceService](https://github.com/testsmith-io/practice-software-testing/blob/9e7736c3841ec2bbb9a6822c9e6602353b7b9a65/sprint5/API/app/Services/InvoiceService.php) creates invoice/line/payment data and dispatches UpdateProductInventory jobs. These are source observations, not executed purchase evidence. Deleting a cart would not demonstrate invoice/payment cleanup or inventory restoration; request disposal also would not reverse these effects.

Reopen the fixture decision if approved future scenarios introduce repeated, independent allocation of the same disposable backend prerequisite, shared-resource interference, manual context lifecycle, cleanup after failed setup/assertions, or persistent profile/invoice/payment/inventory effects outside the current reset boundary. Before implementing, name the **owned resource/IDs**, verify creation and deletion/restoration APIs against the pinned runtime, address async jobs and shared inventory, register cleanup immediately after allocation, handle partial setup and already-consumed resources without masking the original failure, and verify subsequent tests start clean. A test-scoped fixture may then own only that prerequisite and its cleanup, while product selection, login under test, billing/proceed/payment/purchase actions and business assertions remain test-owned. No speculative fixture/API cleanup contract or R10/R11 implementation is delivered now.

## 6. Files changed

Separate Step 0 commit (three files):

- docs/requirements.md: current Approved API requirement with explicit L8 approval and original Proposed provenance.
- docs/test-catalogue.md: T-API-AUTH-001 maps to approved requirement; behavior and test ID unchanged.
- docs/release-08-summary.md: append-only post-merge human closure; original sections 1–15 preserved.

Release 9 decision commit:

- docs/release-09-summary.md: lifecycle inventory, decision, owners, future reassessment triggers and validation evidence.

No executable, test, Page Object, dependency, pin, environment, config, workflow, scanner or diagnostic setting changes. Unrelated pre-existing output/ and tmp/ remain untouched/uncommitted. Temporary inspection/download/review files stay ignored under .sut/.

## 7. Validation

No fixture implementation occurred; fixture-specific validation is **not applicable**, not omitted implementation evidence. No additional functional coverage or automation tests are added. Documentation/history checks and a full unchanged-baseline execution are used to verify preservation.

- npm.cmd run typecheck: **PASS** (strict tsc --noEmit).
- npx.cmd tsx --test scripts/ci-evidence.test.ts: **3/3 PASS**, existing CI evidence security checks.
- actionlint on unchanged workflow: **PASS**.
- `npx.cmd tsx .sut/review-release09.ts`: **PASS**. Closure commit contains exactly the three requested docs; original Release 8 package is preserved as a prefix before its appended closure; unrelated requirement/catalogue sections are unchanged; all **32** other tracked baseline files are unchanged. Exact inventory remains 14 tests (13 UI + 1 API); four delivery documents contain no injected credential or JWT. The package has the required twelve sections. Review scaffolding is ignored, not a new supported test/tool.
- `git diff --check`: **PASS**. No fixture-specific/impacted implementation test is needed because no code or assertions change; the full suite below supplies baseline assurance.

## 8. Regression/CI evidence

Current main's supplied post-merge Release 8 baseline: **14/14 PASS**, strict typecheck and three security checks PASS; one worker/zero retries; reset/seed and teardown PASS; controlled-results published, HTML withheld. This historical evidence is separate from any Release 9 execution.

### Release 9 local execution — 2026-10-26

`npx.cmd tsx scripts/ci-evidence.ts run`, then `npx.cmd tsx scripts/ci-evidence.ts scan`: **14/14 PASS (13 UI + 1 API)**, 33.4s. Download-independent local summary inspection verified exact repository titles, expected=14, unexpected=0, flaky=0, skipped=0, globalErrors=0, configured/actual workers=1, configuredRetries=[0], exactly one passed retry=0 result per scenario, forbidOnly=true and resetSeedConfirmed=true. The existing helper performed readiness/reset/seed before execution; no test bodies were modified to obtain this result.

Local candidate scan: compact summary **clean**; raw HTML **sensitive-or-uninspectable, withheld**; green diagnostic metadata **clean**, not published because diagnostics upload remains failure-only. Exact staged summary/manifest bytes independently pass the unchanged scanner; results.json SHA256 **6dcd52a54e788b4a3a373710dd628bafcebc11bf8c6e13a274d6d1c728b8d5e5**. No raw reports or credentials are committed.

`npm.cmd run sut:down`: exit 0; subsequent label-filtered Docker container/network/volume guards all empty, output **Controlled containers, networks and volumes absent.**

### Release 9 hosted execution

Pending decision commit/push and manual dispatch of the unchanged existing workflow. No second pipeline, temporary trigger, fixture or security-policy change is required. This run is additional preservation assurance for a documentation-only decision, not fixture implementation validation.

## 9. Risks/limitations

This decision applies to the present fourteen scenarios and disposable sequential execution, not arbitrary future concurrent/long-lived environments. Residual backend cart rows and login counters are not isolated merely by browser context disposal. Direct/manual runs outside the controlled helper can bypass reset/serialization; forced termination can leave a stale operation lock. No current scenario proves cart ownership security or all backend-state isolation. Existing purchase/locking/profile-mutation gaps remain gaps.

Future purchase data, asynchronous inventory updates or persisted billing/customer edits may justify a new resource owner; scope and cleanup contracts need separate discovery. No R10/R11 requirement, cleanup endpoint response or execution is inferred from source. Source SHA/image provenance limits remain unchanged.

Release 8 security limits remain: full local reports may contain secrets; public rich/opaque diagnostics are conservatively withheld; compact evidence minimizes data and is scanned before upload, but this is not a universal secret detector. Public retention remains 14 days. No new auth fixture or token persistence expands the security surface.

## 10. Reviewer guide

1. Review the separate c37ff97 closure commit: explicit L8 approval and append-only history, no retroactive approval.
2. Compare all fourteen test bodies and executable files against merged main; expect no changes.
3. Review the repetition table and ownership matrix; distinguish client disposal from backend reset and visible business setup from reusable lifecycle.
4. Check the NOT JUSTIFIED recommendation against each decision criterion, especially why future invoice/payment/inventory effects need further discovery rather than a speculative cart fixture.
5. Review strict typecheck, unchanged security checks, full regression, hosted compact artifact/scan/log audit and teardown evidence. Confirm no secret material is published.
6. Keep the PR open for human review. No merge or Release 10 work.

## 11. Interview defense

- Why does R9 add no fixture? The built-in fixtures already own client lifecycle, and the existing helper/workflow own disposable SUT lifecycle. The repeated code is mostly business behavior, not repeated unowned allocation/disposal.
- Does a fresh browser delete carts? No. It discards client identity; backend rows remain until controlled reset/down. That limit is explicit and acceptable for the current tests, which never share IDs or consume stock through purchase.
- Why retain repeated login? Current auth behavior and the authorization boundary must remain visible. Shared authentication would obscure purpose and add session coupling; small guards are not a lifecycle problem.
- Why not pre-create every cart? It would bypass Add to Cart behavior and hide maintenance-test preconditions. Some future tests might legitimately use a prerequisite cart, but its ownership contract needs a real consumer and verified cleanup first.
- Why not reset per test in a fixture? The reset is destructive environment work with an existing owner; hiding it in runner lifecycle increases interference risk and duplicates responsibility.
- What would change the decision? Concrete repeated creation/cleanup of a dedicated resource, demonstrated state leakage, or approved billing/purchase tests that persist state needing failure-safe restoration.
- Would a cart fixture solve purchase cleanup? Not by itself: invoice/payment data and queued stock updates can outlive the cart. Discover all affected resources and reversibility before choosing an abstraction.
- Is passing 14/14 proof of perfect isolation? No. Source/ownership analysis plus unchanged execution supports this bounded decision; limitations and reassessment triggers remain explicit.

## 12. Release status

**R9 decision: NOT JUSTIFIED.** The justification sprint's architectural deliverable is a no-change decision, ready for validation/human review. Step 0 Release 8 closure is separately committed. No fixture or engineering abstraction is implemented; baseline remains 14 scenarios (13 UI + 1 API). Preservation review, strict typecheck, three existing security checks and unchanged full local 14/14 regression pass; reset/seed and teardown verified. Hosted CI/security evidence and open-PR delivery are next. R9 human merge/closure remains a separate leadership decision. No Release 10 work.
