# Release 10 — Billing Validation

## 1. Objective

Add focused independent UI coverage of normal checkout identity selection and authenticated continuation to Billing Address, after confirming the actual boundary. Base: current main after merged Release 9, **5e4547bb03bf091e0bc54d88bc168e040d1acfe6**. Branch: **release/10-billing-validation**. Preserve all fourteen baseline scenarios, controlled lifecycle and sanitized public evidence policy. No purchase completion.

## 2. Discovery

Inspected clean pinned Toolshop checkout **9e7736c3841ec2bbb9a6822c9e6602353b7b9a65**, tag 2.5, unchanged image digests; pinned Sprint 5 stories; checkout route/wizard, cart/login/address/payment templates/components, UI account/cart/invoice services; API routes, invoice/payment controllers and authorization middleware; existing four Page Objects, authentication/cart/API tests, requirements/catalogue, Release 9 ownership decision, config/helper/workflow/security scanner.

**P10 — Official/project-owned pinned documentation:** Checkout–Cart Review AC5 advances a nonempty cart; Checkout–Sign In AC1/AC2 shows a login form/fields for an unauthenticated user; AC5 acknowledges an already authenticated customer and allows billing continuation. Billing Address AC1–AC4 describe the form, validation, payment progression and prefill, but R10 does not claim full coverage of those criteria. Payment Advanced concerns method-specific validation/finalization, outside this focused slice.

**I10 — Pinned implementation/source:** checkout order is Cart Review → Sign in → Billing Address → Payment. The checkout route has no auth guard. Cart's proceed-1 advances to step 2. Identity component checks the stored login state, retrieves customer details with GET /users/me, renders default login plus guest tab for anonymous users, or an identity acknowledgement/proceed-2 for authenticated users. Billing renders form/required-field controls; proceed-3 advances only when valid. Confirm/finish invokes payment validation, invoice creation and cart clearing; R10 never invokes it.

The source includes a guest alternative, so the initial hypothesis of mandatory login for every payment path is **not supported**. UI InvoiceService selects POST /invoices/guest when guest identity is supplied. API InvoiceController applies auth:users except storeGuest; customer POST /invoices is protected, guest creation is not governed by that authentication middleware. PaymentController's POST /payment/check validates payment data without auth middleware. These are distinct from the UI identity-selection step.

**O10 — Controlled runtime observation before implementation:** existing sut:up/reset verified pins/readiness and restored seed. An ignored TypeScript Playwright observer used fresh en-US contexts, explicit UI cart creation and the injected customer only for the authenticated case. Anonymous normal cart progression stayed at /checkout and showed Login heading, email/password/submit and Continue as Guest tab; authenticated proceed-2, billing and payment were not visible. The signed-in customer saw the Jane Doe acknowledgement, no credential form, and an enabled proceed-2; clicking it displayed Billing Address/fields/proceed-3 with no login prompt and no visible payment form. Both UI paths sent **zero POST payment-check/invoice requests**.

A separate discovery-only guest check supplied synthetic .invalid identity data, reached Billing Address without account login and sent zero UI payment-check/invoice requests. Thus the guest exception is confirmed in runtime, not just inferred from source. Temporary guest exploration initially timed out on the Search locator because its raw browser context lacked the explicit en-US locale used by the successful observer; aligning the exploration context resolved it. No shipped scenario or locale contract was changed to work around a product failure.

Non-purchasing backend discovery probes used deliberately incomplete bodies: anonymous POST /invoices returned **401**; anonymous POST /invoices/guest with empty body returned **422**; POST /payment/check with incomplete bank-transfer details returned **422**. No valid invoice/payment/purchase payload was submitted. These observations corroborate the source distinction; they are not new automated API coverage or proof of guest purchase success.

Pinned sources: [stories](https://github.com/testsmith-io/practice-software-testing/blob/9e7736c3841ec2bbb9a6822c9e6602353b7b9a65/docs/user-stories/v5.md), [wizard](https://github.com/testsmith-io/practice-software-testing/blob/9e7736c3841ec2bbb9a6822c9e6602353b7b9a65/sprint5/UI/src/app/checkout/checkout.component.html), [identity template](https://github.com/testsmith-io/practice-software-testing/blob/9e7736c3841ec2bbb9a6822c9e6602353b7b9a65/sprint5/UI/src/app/checkout/login/login.component.html), [identity component](https://github.com/testsmith-io/practice-software-testing/blob/9e7736c3841ec2bbb9a6822c9e6602353b7b9a65/sprint5/UI/src/app/checkout/login/login.component.ts), [address template](https://github.com/testsmith-io/practice-software-testing/blob/9e7736c3841ec2bbb9a6822c9e6602353b7b9a65/sprint5/UI/src/app/checkout/address/address.component.html), [payment component](https://github.com/testsmith-io/practice-software-testing/blob/9e7736c3841ec2bbb9a6822c9e6602353b7b9a65/sprint5/UI/src/app/checkout/payment/payment.component.ts), [UI InvoiceService](https://github.com/testsmith-io/practice-software-testing/blob/9e7736c3841ec2bbb9a6822c9e6602353b7b9a65/sprint5/UI/src/app/_services/invoice.service.ts), [InvoiceController](https://github.com/testsmith-io/practice-software-testing/blob/9e7736c3841ec2bbb9a6822c9e6602353b7b9a65/sprint5/API/app/Http/Controllers/InvoiceController.php), [PaymentController](https://github.com/testsmith-io/practice-software-testing/blob/9e7736c3841ec2bbb9a6822c9e6602353b7b9a65/sprint5/API/app/Http/Controllers/PaymentController.php).

## 3. Authentication/payment boundary

The observed normal-path prompt occurs at **step 2, before Billing Address**, not at payment submission and not as an /auth/login redirect. URL /checkout is shared by all wizard steps, so URL alone is insufficient.

- Anonymous oracle: visible default credential controls and guest choice; no signed-in acknowledgement/proceed-2, active Billing Address or Payment form.
- Authenticated oracle: exact seeded-customer acknowledgement, no credential prompt, enabled proceed-2; after using it, visible Billing Address heading/street/proceed-3 and retained user menu, still no Payment form.
- Universal mandatory login: disproved by supported guest continuation to billing and the guest backend branch. The automation validates the normal identity-step UI; it does not prove a backend security gate, prevent direct wizard bypass, or prove guest final-purchase behavior.
- Completing billing fields or reaching/completing payment is unnecessary to prove continuation past step 2. The authenticated test stops on Billing Address; the anonymous test stops at the identity choice.

## 4. Requirement proposal

**REQ-CHECKOUT-001 — Proposed, human approval pending**, defined in requirements.md before automation implementation. Normal nonempty-cart checkout presents the session-dependent identity step before billing: an anonymous session sees default login plus guest choice with billing/payment not active; an already signed-in customer is acknowledged and can continue to billing without another login form.

Evidence: P10/I10 official pinned documentation/source, O10 controlled observation, R10 existing architecture/lifecycle evidence. Business value: detect incorrect identity prompts and lost authenticated-session continuity in checkout. Layer: UI; the approved API authorization pilot remains separate and unchanged. Passing execution is not requirement approval. Existing approved cart requirements are untouched.

Scope: one regular seeded Combination Pliers quantity 1, desktop Chromium/default English, fresh independent anonymous session or injected positive customer, normal forward controls. Guest choice is visible/acknowledged as an exception; guest continuation was discovery evidence, not an added automated scenario. Checkout login submission, TOTP, wizard-bypass security, address validation/prefill, payment and purchase effects remain unproven.

## 5. Test traceability

The count was selected **after discovery**: two complementary UI scenarios are sufficient for the observed session-dependent step. Final expected suite is **16 scenarios: 15 UI + 1 API**; fourteen existing scenarios remain unchanged.

| Test ID | Requirement/status | Exact scenario | Preconditions | Primary assertions / stopping point |
| --- | --- | --- | --- | --- |
| T-CHECKOUT-001 | REQ-CHECKOUT-001 — Proposed | anonymous checkout presents the identity choice before billing | Own fresh anonymous page/context; independently search/select/add the seeded product; exact cart product/quantity 1; no guest identity or login | /checkout; default login email/password/submit and guest tab visible; signed-in notice and authenticated continuation absent; billing heading/street and payment form hidden. Stop without identity submission. |
| T-CHECKOUT-002 | REQ-CHECKOUT-001 — Proposed | authenticated checkout continues to billing without another login prompt | Own injected seeded positive customer UI login via existing LoginPage; assert account success; independently create/assert own cart product/quantity | Exact Jane Doe acknowledgement, no credential form; enabled authenticated continuation; then visible Billing Address heading/street/proceed-3 and user menu, no payment form. Stop without address/payment submission. |

Mapping: requirement → IDs → tests/checkout-billing.spec.ts → existing LoginPage/CatalogPage/ProductDetailsPage/CartPage plus CheckoutPage → isolated/impacted/full/hosted evidence below. Assertions and explicit business setup stay in tests; no scenario supplies state to another.

## 6. Architecture impact

CartPage gains only the concrete cart proceed locator/action. A small **CheckoutPage** is justified by a new wizard surface: scoped identity-form/guest/acknowledgement/continuation locators and billing/payment visibility locators, plus the step-2 continuation click. Existing LoginPage performs real account login unchanged. Checkout credential locators are separately scoped to the sign-in tab because the guest email has the same label; changing LoginPage globally would risk existing tests. No assertions or expected customer values live in the Page Object; there is no finish/purchase action.

Release 9 reassessment: **no custom resource-lifecycle fixture justified**. Both cases create only the same session-scoped UI cart already covered by the established disposable reset/down lifecycle; no invoice, payment record, inventory job or persisted customer address is needed. Built-in contexts own client isolation/cleanup. Backend cart rows can persist until reset/volume teardown; no new promise of per-test database rollback. Explicit login, product/cart actions and assertions stay visible.

No generic checkout/payment framework, auth fixture, token manager, shared storage, API client, data layer, dependency, pipeline or project is introduced. Controlled helper, strict TS, pins, one worker/zero retries/forbid-only and API authorization test are unchanged. The existing dynamic compact CI summary discovers the additional UI tests without changing its implementation.

## 7. Scope excluded for Release 11

No successful/final purchase or invoice/order/payment creation, order history, inventory consumption, queued purchase side effects, purchase resource fixture/cleanup or payment credentials. Tests do not select a payment method, click billing proceed or finish, call creation APIs, or alter saved customer data. Billing field validation/prefill correctness and full guest checkout are also outside this focused R10 proposal. Invalid discovery-only API probes cannot satisfy invoice validation and are not product-purchase tests.

## 8. Files changed

- pages/CartPage.ts: additive nonempty-cart proceed locator/action; existing behavior preserved.
- pages/CheckoutPage.ts: concrete wizard identity/billing surface.
- tests/checkout-billing.spec.ts: two independent UI cases.
- docs/requirements.md: Proposed checkout identity requirement and guest exception; approved cart requirements unchanged.
- docs/test-catalogue.md: two mappings and current suite count.
- README.md: current scope, commands and explicit guest/purchase boundary.
- docs/release-10-summary.md: persistent discovery/proposal/architecture/validation package.

All fourteen prior tests/assertions, LoginPage/CatalogPage/ProductDetailsPage, lifecycle helper, SUT pins, dependencies, config, strict TS options, workflow and evidence security scanner remain unchanged. Unrelated pre-existing output/ and tmp/ remain untouched/uncommitted; observations/screenshots/review scaffolding are ignored under .sut/.

## 9. Isolated validation

`npm.cmd run typecheck`: **PASS**, strict tsc --noEmit. Each new scenario independently passed using the unchanged controlled helper via the security wrapper:

- `npx.cmd tsx scripts/ci-evidence.ts run tests/checkout-billing.spec.ts --grep "anonymous checkout presents"`: **1/1 PASS**.
- `npx.cmd tsx scripts/ci-evidence.ts run tests/checkout-billing.spec.ts --grep "authenticated checkout continues"`: **1/1 PASS**.

Each invocation independently reset/seeded and passed bounded readiness, configured/actual workers=1, retries=[0], one passed retry=0 result, forbidOnly=true, resetSeedConfirmed=true. Compact outputs independently scanned clean; raw HTML withheld as sensitive-or-uninspectable. Neither scenario depends on UI/API test order or shared login/cart state. No purchase completion.

## 10. Impacted/full regression

**Impacted regression:** `npx.cmd tsx scripts/ci-evidence.ts run tests/login.spec.ts tests/cart.spec.ts tests/cart-maintenance.spec.ts tests/api-authorization.spec.ts tests/checkout-billing.spec.ts`, then `scan`: **11/11 PASS (10 UI + 1 API)**.

**Full controlled regression:** `npx.cmd tsx scripts/ci-evidence.ts run`, then `scan`: **16/16 PASS (15 UI + 1 API)**, 40.4s. Exact current repository titles checked from compact results; expected=16, unexpected=0, flaky=0, skipped=0, globalErrors=0; one configured/actual worker, configuredRetries=[0], exactly one passed retry=0 result per test, forbidOnly=true and resetSeedConfirmed=true. The unchanged helper performs normal readiness/reset/seed before execution.

**Non-purchase evidence:** read-only database inspection before impacted execution and after full regression reports invoices=200 and payments=200, the seeded counts. Initial UI observation also counted zero POST invoice/payment-check requests on both selected paths. New automated test/Page Object source contains no billing-proceed click, finish action, payment selection, invoice/payment API call or saved-profile edit. This corroborates scoped non-purchase behavior; counts alone are not a full transaction/side-effect audit. The inspector tolerates the known existing FFI warning before its small JSON count response without exposing records.

**Teardown:** npm.cmd run sut:down PASS; label-filtered Docker container/network/volume guards returned empty and printed Controlled containers, networks and volumes absent.

**Preservation/security review:** 32 protected baseline files unchanged, including every original test, existing auth/catalog/product objects, strict/config/helper/pins/dependencies/workflow/scanner. Reversing only the three additive CartPage proceed members reproduces the original file exactly. Existing requirement text is preserved as a prefix before the new Proposed section; no cart status/scope changed. Seven delivery files contain no injected credential or JWT. Existing security checks **3/3 PASS**; unchanged workflow actionlint PASS; git diff --check PASS. No fixture, purchase-capable action/API, framework or data layer added.

**Local scan:** compact summary clean; raw HTML sensitive-or-uninspectable/withheld; green diagnostic metadata clean and not published because diagnostics upload is failure-only. Exact staged summary/manifest independently scanned clean. results.json SHA256 **457fdfbc9c1d8693a5c128c848a42715c47bd7bbbf75b4aebb8345b96506dbb7**.

## 11. CI/security evidence

Actual [run 40391810919](https://github.com/alvarotarrifaste/playwright-toolshop-automation/actions/runs/40391810919), [job 121814442223](https://github.com/alvarotarrifaste/playwright-toolshop-automation/actions/runs/40391810919/job/121814442223): **success**, workflow_dispatch attempt 1 on implementation **13a5a7beeb4915cb4a5cb357cc898eb91a43ae3a**, 2026-10-26 **20:00:42–20:02:33 UTC**. Existing workflow manually dispatched with ref=release/10-billing-validation; no workflow, runner, trigger or security changes.

| Hosted verification | Result |
| --- | --- |
| Dependency/type/security checks | npm ci, strict typecheck, **3/3 existing evidence-security checks**, Chromium/system setup PASS |
| Controlled SUT | Exact pinned source/images; bounded readiness; ARM64 gateway/scheduler checks PASS |
| Tests | **16/16 PASS: 15 UI + 1 API**, exact repository titles including both new cases and fourteen baseline scenarios |
| Execution contract | expected=16; unexpected=0; flaky=0; skipped=0; globalErrors=0; configured/actual workers=1; configuredRetries=[0]; exactly one passed retry=0 result each; forbidOnly=true; resetSeedConfirmed=true |
| Cleanup | Teardown PASS; public log confirms containers, networks and volumes absent |
| Scan/upload | Summary clean; HTML sensitive-or-uninspectable/withheld; green diagnostic metadata clean; only controlled-results uploaded; raw HTML/failure diagnostic upload steps skipped |

Downloaded [controlled-results artifact 12682522563](https://github.com/alvarotarrifaste/playwright-toolshop-automation/actions/runs/40391810919/artifacts/12682522563): **1,169 ZIP bytes**, created 2026-10-26T20:02:30Z, expires 2026-11-09T20:02:29Z (14 days). Archive contains exactly **results.json** and **scan.json**; no raw report, console, credentials or authentication payload. Extracted bytes independently scan clean; exact sixteen test titles/statuses/retries and lifecycle flags were asserted from downloaded evidence, not inferred from a green badge.

ZIP SHA256 **e925dcd6bbf2b0e69eb20ee7bc918627ecde164a1c1fed9e8212687d52d378cb**, independently equal to GitHub digest. results.json SHA256 **457fdfbc9c1d8693a5c128c848a42715c47bd7bbbf75b4aebb8345b96506dbb7** matches the scan manifest and deterministic final local summary. Manifest also hashes clean staged green diagnostic metadata, which was not uploaded under the failure-only condition.

Downloaded/audited **23 public log files** against injected credential values/encodings and JWT/bearer/header/cookie/token patterns: no injected credential or unmasked authentication material found. GitHub checkout's masked-only Basic authentication placeholder was recognized as already masked during independent audit; no upload scanner policy changed. Logs confirm compact counts, withholding and cleanup. Inspection/download scaffolding remains ignored under .sut/; no raw evidence is committed. Local database counts support the non-purchase check; no additional hosted database/transaction audit is claimed.

A final evidence-only commit changes this package, not the tested executable/workflow tree. The PR event can start a subsequent run after creation; it is not represented here as already completed. No new failure-injection experiment was needed: unchanged security checks and Release 8's preserved failure-withholding evidence remain applicable.

Existing public boundary remains: full local HTML/raw output private; only compact allowlisted results or fully inspectable clean candidates may upload; raw packed/sensitive HTML/diagnostics withheld. Credentials injected through existing controlled environment; no tokens/cookies/authentication data attached by new tests. Existing API spec retains trace-off; UI diagnostic capture unchanged.

## 12. Risks/limitations

A visible identity prompt is not a universal login mandate or backend authorization proof. Guest identity can reach billing without account login; direct wizard/route bypass and guest purchase success are not tested. Pinned documentation paraphrases the signed-in message differently from the actual localized source/runtime; the exact stable observed seeded-customer message is the scoped oracle. Billing form rendering is checked, not every field, value, validation rule or prefill correctness. No payment-method or final transaction claim is made.

Seeded identity/product and unchanged source/image provenance limits apply. Built-in context isolation does not remove backend carts/counters; controlled reset and disposable teardown remain required. One worker is preserved; parallel/direct concurrent execution is outside this contract. Local reports may contain credential/session data; the unchanged scanner is bounded, not universal DLP, and conservatively withholds opaque content. Public evidence retention is 14 days. New requirement approval remains a human leadership decision. No R9 closure or other requirement approval is inferred.

## 13. Reviewer guide

First compare the initial mandatory-login hypothesis with guest evidence and the scoped Proposed requirement. Then review pinned wizard/identity/backend source and runtime observations; the two exact test mappings and active-step oracles; additive CartPage and concrete CheckoutPage; unchanged baseline diff; isolated/impacted/full/hosted results and artifact/log scan/teardown. Confirm no purchase-capable action/API or new fixture was introduced. Human approval/merge remains separate.

## 14. Interview defense

- Where is the UI boundary? Step 2 after Cart Review and before Billing Address; all wizard stages share /checkout, so visible controls are the oracle.
- Is login mandatory for all purchases? No: discovery confirmed guest continuation to billing and a separate unauthenticated guest-invoice path. Tests and requirement do not invent a universal login mandate.
- Why two UI cases? They verify the user-facing identity prompt and continuity of an existing session at the same checkout point; backend auth is a distinct layer already piloted in R8.
- Why stop at billing? Billing visibility proves authenticated continuation past the identity step; reaching payment or submitting a purchase adds unrelated state and R11 lifecycle risk.
- Why another Page Object? The wizard has distinct scoped controls; reusing unscoped LoginPage email locators would collide with guest email. Existing LoginPage still owns actual account-login interactions.
- Why no fixture? New cases own no new resource class beyond their cart/context; explicit business setup stays readable and the R9 lifecycle decision still holds.
- Why Proposed? Official source, observation and automation establish evidence, while human leadership grants requirement approval.
- What is not proven? Full guest/login submission flow, bypass resistance, billing validation/prefill, payment/invoices/history/inventory and cleanup.

## 15. Release status

Discovery and proposal complete; two UI scenarios implemented without changing the fourteen baseline scenario bodies/assertions. Guest exception explicitly narrows the original hypothesis. REQ-CHECKOUT-001 remains Proposed. Strict typecheck PASS; isolated scenarios 1/1 each; impacted 11/11; full local and hosted **16/16 (15 UI + 1 API)**; three evidence-security checks PASS; unchanged one worker/zero retries/forbid-only, reset/seed and clean teardown verified. Purchase counts remain seeded 200/200 and no purchase-capable test action was added. Public artifact/log scans, hashes and raw HTML withholding independently verified. No remaining implementation/validation blocker; guest exception and normal-path UI coverage limits remain explicit.

Delivery: base main **5e4547bb03bf091e0bc54d88bc168e040d1acfe6**; branch **release/10-billing-validation**; implementation **13a5a7beeb4915cb4a5cb357cc898eb91a43ae3a**, test: add billing authentication boundary coverage. Final documentation-only evidence commit follows hosted verification. PR title **test: add Release 10 billing validation**, target main, open/not draft. PR creation is the final delivery action after evidence commit/push; returned URL belongs in the handoff. No merge or Release 11 work.

## 16. Post-merge human closure

This separate record preserves original sections 1–15, including the Proposed requirement, pre-merge observations and execution history. It does not retroactively attribute approval to earlier evidence.

**L10 — explicit human leadership approval**, supplied for Release 11 Step 0 after [PR #14](https://github.com/alvarotarrifaste/playwright-toolshop-automation/pull/14) merged. Merge commit: **676a04a49ad0255728c57b43e5c4b2d7ff6bf966**. Post-merge [run 40393903039](https://github.com/alvarotarrifaste/playwright-toolshop-automation/actions/runs/40393903039) is the closure execution evidence supplied by leadership.

| Post-merge closure evidence | Result |
| --- | --- |
| Strict typecheck | **PASS** |
| CI-evidence security checks | **3/3 PASS** |
| Controlled functional suite | **16/16 PASS: 15 UI + 1 API** |
| Execution contract | **One worker, zero retries** |
| Reset/seed and teardown | **PASS** |
| Public evidence | Sanitized **controlled-results uploaded** |
| Raw HTML | **Withheld** by the existing security boundary |

**REQ-CHECKOUT-001 Approved** by human leadership; T-CHECKOUT-001 and T-CHECKOUT-002 map to that approved requirement without scope/assertion changes. Approval preserves the guest exception and the pre-billing identity-step boundary; it does not approve a universal mandatory-login claim or purchase behavior.

**Release 10 CLOSED.** This three-document reconciliation is committed separately as `docs: close Release 10 billing validation` before Release 11 implementation. Release 11 discovery/proposal remains separate from this closure.
