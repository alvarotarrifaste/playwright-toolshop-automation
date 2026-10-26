# Release 11 — Purchase Completion

## 1. Objective

Validate one successful purchase with UI confirmation, purchased-cart clearing and independent backend persistence. Base main after R10: **676a04a49ad0255728c57b43e5c4b2d7ff6bf966**; branch **release/11-purchase-completion**. Preserve sixteen existing scenarios, pins, controlled lifecycle and public evidence security.

Step 0 was committed first as **380894689e02bd5721d79f5fb11a04c5013d2a64**, `docs: close Release 10 billing validation`. Explicit human L10 approval updates REQ-CHECKOUT-001 and both test mappings. The separate [R10 human closure](release-10-summary.md#16-post-merge-human-closure) records merged PR #14, supplied merge/run 40393903039, typecheck/security checks, 16/16, lifecycle, sanitized publishing and CLOSED status. Original sections 1–15 preserve Proposed history; passing tests did not confer approval.

## 2. Discovery

Inspected clean pinned source **9e7736c3841ec2bbb9a6822c9e6602353b7b9a65** (2.5), unchanged images; Sprint 5 stories; billing/postcode/payment UI and validation; invoice/cart/payment controllers, services, models/migrations; inventory/email jobs and scheduler/queue; existing five Page Objects, sixteen tests, helper/config/workflow/security boundary and R9/R10 ownership decisions.

**P11 — Official pinned documentation:** Billing Address AC1–AC3 covers required fields and progression; Payment Advanced AC1 includes Cash on Delivery, AC9 covers validation/order placement, reference confirmation, cart clearing and email. R11 covers a focused subset; email delivery is excluded. [Pinned stories](https://github.com/testsmith-io/practice-software-testing/blob/9e7736c3841ec2bbb9a6822c9e6602353b7b9a65/docs/user-stories/v5.md).

**I11 — Pinned source:** address form also requires house_number. Country/postcode/house trigger a deterministic local Faker lookup; server AddressMatchesCountry validates locality against the same service. COD requires payment_method and empty payment_details, with no payment secret. PaymentController returns 200/Payment was successful. In this UI, first Confirm starts asynchronous validation and returns the old state; a second Confirm after success creates the invoice. No arbitrary click/retry loop is appropriate.

Customer invoice creation/read is authenticated; guest uses a separate creation branch. InvoiceService creates invoice/line/payment/method-detail records and dispatches inventory/email jobs. Creation returns 201. Initial migration status is AWAITING_FULFILLMENT; an OpenAPI COMPLETED example is not the initial-state oracle. Success calls cart deletion and clears client cart keys. Account invoice detail reads an exact ID through the app's auth interceptor; no automation token extraction is needed.

**O11 — Controlled observation before implementation:** own positive-customer login/cart, US/00000/1 synthetic billing and local Faker autofill; lookup 200; first Confirm validation 200 with success message and no order; second Confirm invoice 201 and owned-cart DELETE 204. UI confirmed the returned invoice number. Exact-ID authenticated invoice GET returned 200 with matching reference, one Combination Pliers quantity 1, total 14.15, COD payment and AWAITING_FULFILLMENT.

Exploration corrected two assumptions before implementation: billing entry does not guarantee another profile request, so synchronize with visible/prefilled fields and the actual lookup; translated confirmation's inner invoice-number span ID is absent in rendered HTML, so assert stable outer confirmation text against the returned number. Payment IDs are intentionally hidden by the model; assert exposed payment method rather than hidden fields. No baseline assertion/application source changed.

Runtime configuration: **APP_ENV=local, queue=database, mail=smtp, postcode=faker**. Only angular-ui, laravel-api, mariadb and web run; no API-container queue/scheduler worker or cron daemon was present. Kernel registers queue/invoice/order schedules but no controlled cron service executes them automatically. Destructive production reset scheduling is excluded in local. Shipped tests start no workers/schedulers.

Key pinned sources: [payment component](https://github.com/testsmith-io/practice-software-testing/blob/9e7736c3841ec2bbb9a6822c9e6602353b7b9a65/sprint5/UI/src/app/checkout/payment/payment.component.ts), [address component](https://github.com/testsmith-io/practice-software-testing/blob/9e7736c3841ec2bbb9a6822c9e6602353b7b9a65/sprint5/UI/src/app/checkout/address/address.component.ts), [Faker lookup](https://github.com/testsmith-io/practice-software-testing/blob/9e7736c3841ec2bbb9a6822c9e6602353b7b9a65/sprint5/API/app/Services/Postcode/FakerPostcodeDriver.php), [invoice service](https://github.com/testsmith-io/practice-software-testing/blob/9e7736c3841ec2bbb9a6822c9e6602353b7b9a65/sprint5/API/app/Services/InvoiceService.php), [inventory job](https://github.com/testsmith-io/practice-software-testing/blob/9e7736c3841ec2bbb9a6822c9e6602353b7b9a65/sprint5/API/app/Jobs/UpdateProductInventory.php), [scheduler](https://github.com/testsmith-io/practice-software-testing/blob/9e7736c3841ec2bbb9a6822c9e6602353b7b9a65/sprint5/API/app/Console/Kernel.php). Source and runtime evidence are distinct.

## 3. Purchase path selected

**One authenticated cash-on-delivery purchase**, selected after successful discovery. Existing seeded login plus owner-filtered invoice detail gives deterministic readback without auth/API plumbing. Guest adds identity data and a distinct readback branch; a second happy path is not justified by materially different risk in this increment. COD avoids account/card/expiry/CVV secrets. No external gateway/settlement or SMTP delivery is exercised.

One regular seeded Combination Pliers, quantity 1, 14.15, initially stock 25, no rental/location/eco discount. Count chosen after discovery: **17 scenarios — 16 UI + 1 API**.

## 4. Requirement proposal

**REQ-PURCHASE-001 — Proposed, human approval pending**, defined in requirements.md before implementation. Authenticated seeded customer with valid synthetic billing and COD can place one order: UI confirms its generated invoice reference, the purchased cart is removed/client state cleared, and independent authenticated readback returns that invoice with the correct line/quantity, total, payment method and initial AWAITING_FULFILLMENT status.

Evidence P11/I11/O11 plus existing ownership/lifecycle evidence. Layer: UI with backend readback through the authenticated application route. User: injected positive customer, own context/login/cart. Billing and method below. Queue/table deltas are operational evidence, not an internal-schema assertion matrix. Existing approved checkout/cart/API requirements remain unchanged; passing tests do not approve this proposal.

Excludes guest/other methods, negative billing/payment matrix, financial settlement, email/PDF/history matrix, shipment/status transitions, worker completion, refunds/cancellation and generalized cleanup.

## 5. Test traceability

**T-PURCHASE-001 → REQ-PURCHASE-001 (Proposed) → tests/purchase-completion.spec.ts → existing LoginPage/CatalogPage/ProductDetailsPage/CartPage + additive CheckoutPage → evidence below.**

Exact title: `authenticated customer completes a cash-on-delivery purchase with a persisted invoice and cleared cart`.

Test owns setup/assertions: own UI login; own generated cart identity; exact product/quantity/total; signed-in checkout; synthetic lookup/autofill and enabled billing progression; COD; explicit validate-then-place sequence; zero invoice submissions at validation, exactly one overall; confirmation reference matches creation; owned-cart DELETE 204 and cart_id/cart_quantity absent; independent exact-ID invoice GET 200, matching ID/reference, one selected line, 14.15, COD and AWAITING_FULFILLMENT, with rendered reference and user menu.

Success text alone cannot pass. No fixed generated ID/number/date, list ordering or hidden payment schema. App navigation supplies auth internally; automation never reads auth-token or builds an Authorization header. Invoice detail is a readback mechanism, not broad history/PDF coverage; its existing PDF-status GET polling is not a PDF download or creation assertion.

## 6. Payment/billing data decision

**US / 00000 / house 1** is deliberate synthetic input to the pinned local Faker lookup. Deterministic fictional street/city/state are received and checked in the form, satisfying required fields/server consistency. No real personal address is hard-coded, no customer profile update is submitted, and no lookup override/mock/external service is added. This is not an address-deliverability test.

COD needs no additional payment data. Acceptance means order placed awaiting fulfillment, not cash collected. Only existing injected TEST_USER_EMAIL/TEST_USER_PASSWORD; no credentials, cookies, tokens, raw responses or personal billing data committed/attached/printed. Private native UI diagnostics can retain auth data under the established local decision; the unchanged CI wrapper captures raw console privately and scans all public candidates.

## 7. Persistent side effects

Independent controlled snapshots before/after one successful placement:

| Resource | Before | After purchase |
| --- | --- | --- |
| invoices | 200 | 201 |
| invoice_items | 657 | 658 |
| payments | 200 | 201 |
| payment_cash_on_delivery_details | 40 | 41 |
| carts / cart_items | 0 / 0 | 0 / 0 (purchase cart deleted) |
| jobs | 0 | 2 (one inventory, one checkout email) |
| failed_jobs / jobs_information | 0 / 0 | 0 / 0 |
| Combination Pliers stock | 25 | 25 (inventory job pending) |

A guarded discovery-only command verified the oldest queued job was UpdateProductInventory, then processed exactly one job. Stock became **24**; jobs became **1**, only SendCheckoutEmail remaining. No SMTP email job ran. Existing reset then restored seed counts, jobs=0, stock=25 and carts=0. Recovery was demonstrated after queued and processed-inventory states.

Temporary TypeScript/Artisan inspection scaffolding stays ignored under .sut/; no database-access helper is shipped. Main automation asserts exposed invoice/payment data, while independent snapshots validate table/job effects. Full-suite residual carts from other tests are permitted until environment teardown; global carts=0 is not a pre-teardown full-suite assertion.

## 8. Cleanup/resource ownership decision

R9 revisited before implementation: **no custom resource-lifecycle fixture justified**. Data creation alone does not imply a missing owner. Test owns correlation/assertions; existing helper reset/seed before each invocation restores rows, queues, counters and stock. Disposable teardown owns containers/network/volumes, always in CI even on failure; local validation verifies teardown too.

Deleting an invoice/cart would not reliably reverse method details/payment, queued email or inventory. Pinned invoice routes expose no complete reversible cleanup. Restoring stock before canceling queued work can race later mutation. A generic SQL/transaction fixture would duplicate established ownership and widen scope. Recovery through reset was demonstrated rather than assumed.

Envelope: one controlled SUT, one worker, one purchase case, no independent worker/scheduler/SMTP process, no overlapping direct/manual runs. No shared purchase state or identifier handoff. Reassess for multiple consuming purchases, concurrent workers, long-lived external environments or verified reversible cleanup APIs. Shipped tests do not start workers to satisfy assertions.

## 9. Architecture impact

Only additive CheckoutPage controls/actions for billing country/postcode/house/city/state, payment success/Confirm/order confirmation, billing-location entry, payment progression, COD selection and atomic Confirm click. Existing methods/locators and other Page Objects unchanged. Assertions/expected values and both confirmation phases remain visible in the test.

One new TypeScript UI spec observes app requests/responses for synchronization/correlation and navigates the existing authenticated readback route. No new API client/context/auth helper, fixture, generic payment engine, container, data framework or dependency. Strict config, pins, helper, one worker/zero retries/forbid-only, scanner/workflow and API pilot preserved. Existing dynamic CI summary needs no count/pipeline change.

## 10. Files changed

Separate Step 0: docs/requirements.md, docs/test-catalogue.md, docs/release-10-summary.md (L10 approval and append-only closure).

R11: pages/CheckoutPage.ts, tests/purchase-completion.spec.ts, docs/requirements.md, docs/test-catalogue.md, README.md and docs/release-11-summary.md. **Seven files total** across branch. No sixteen baseline spec/assertion, other Page Object, config/helper/pin/dependency/workflow/scanner changes. Unrelated output/ and tmp/ remain untouched/uncommitted; temporary observations/review/downloads stay ignored.

## 11. Isolated validation

Strict typecheck **PASS**. New purchase case independently **1/1 PASS**, using unchanged reset/seed/security wrapper. Compact summary clean; HTML withheld. Independent post-run snapshot matches the one-purchase effects in section 7: invoice/line/payment/COD detail +1, purchased cart/items removed, two expected jobs pending, stock 25, failed jobs=0. Fixture-specific validation not applicable; async/reset recovery is independently demonstrated.

## 12. Impacted/full regression

**Impacted:** `npx.cmd tsx scripts/ci-evidence.ts run tests/cart.spec.ts tests/cart-maintenance.spec.ts tests/checkout-billing.spec.ts tests/purchase-completion.spec.ts`, then scan: **7/7 PASS**.

**Full:** `npx.cmd tsx scripts/ci-evidence.ts run`, then scan: **17/17 PASS (16 UI + 1 API)**, 45.3s. Isolated 1/1, impacted 7/7 and full results each confirm expected totals, no unexpected/flaky/skipped/global errors; configured/actual worker=1; configuredRetries=[0]; exactly one passed retry=0 result each; forbidOnly=true and resetSeedConfirmed=true. Full titles exactly match all repository specs.

Independent post-isolated/impacted/full database audits each confirm invoice/line/payment/COD-detail +1 and exactly two expected pending jobs, failed_jobs=0, stock=25. Isolated purchased carts/items=0; impacted/full residual carts/items=6/6 belong to baseline cart/checkout cases. After full regression, existing sut:reset reproduced the complete before-discovery snapshot: seed counts, carts/items=0, jobs=0, stock=25. This also matches recovery after inventory-only processing.

`npm.cmd run sut:down` PASS; label-filtered Docker guards verified no controlled containers, networks or volumes. Strict typecheck PASS; existing security checks **3/3 PASS**; unchanged workflow actionlint PASS; git diff --check PASS. Review verifies separate three-doc closure, original R10 history preserved as prefix, **34 protected baseline files unchanged**, every prior scenario/assertion preserved and original CheckoutPage behavior exactly preserved after removing additive members. Seven delivery files scan clear for injected credentials/JWTs.

Compact evidence independently scanned clean; raw HTML withheld as sensitive-or-uninspectable; green diagnostic metadata clean and not uploaded under the failure-only rule. results.json SHA256 **c0c9f35744bd410f522933d3d7a8870665876ad3cec7d82a1e3a764823f931ab**. Count was selected after discovery, not a preset target.

## 13. CI/security evidence

Pending hosted execution and independent compact artifact/public log audit. Existing fail-closed candidate scan/withholding and sanitized controlled-results policy unchanged. No new stdout/raw attachment, auth extraction, payment secrets or worker startup. API pilot trace-off and private UI diagnostics preserved.

## 14. Risks/limitations

Two-stage Confirm is pinned observed behavior, not a retry/double-click loop or a universal one-click promise. AWAITING_FULFILLMENT is not settlement/fulfillment. Inventory/email are queued; no automatic completion/delivery claimed. Discovery processed inventory only, never SMTP mail. No fixed reference/date/hidden payment IDs or broad internal schema asserted.

Faker billing is fictional, not real-address validation. Empty-cart text is not asserted: the reloaded component rendered no text in discovery; cart DELETE and cleared client keys provide the strong oracle. Confirmation uses stable outer text because inner span ID is stripped. Both are scoped observations, not changes to previous tests.

Invoice/payment/jobs remain until reset/down. Concurrent workers/external reuse require a new ownership contract. Partial failure can leave state; no retry is used, and reset/disposable teardown owns recovery. Source/image provenance and conservative scanner limits remain; local diagnostics may be sensitive, public retention 14 days. Requirement approval remains human; guest/method matrix, email/PDF/history/shipping/returns remain unproven.

## 15. Reviewer guide

Review separate L10 closure and original Proposed history; source/runtime path selection; scoped Proposed purchase requirement/data; explicit two-phase flow and three-part oracle; persistence/queue/inventory-only/reset evidence; no-fixture decision; additive CheckoutPage and sixteen preserved specs; isolated/impacted/full/hosted/security/teardown. Confirm no real payment/billing secret, token extraction, SMTP worker or cleanup framework. Keep PR open for human review.

## 16. Interview defense

- Why authenticated/COD? Existing owner-filtered readback and seeded login provide deterministic evidence without auth plumbing; COD requires no payment secret/expiry. Guest has a distinct readback branch, not a free duplicate.
- Why two Confirms? Source/runtime separates async validation and placement; the test waits for validation, asserts no invoice yet, then submits exactly one order. No click-until-success loop or retry.
- Why not a success-message-only test? Generated-reference confirmation, owned-cart deletion/client clearing and independent invoice/line/payment/status readback must all agree.
- Why no fixture? Reset/down already owns all rows/queues/stock. Piecemeal cleanup can orphan jobs or race stock mutation; recovery was actually demonstrated.
- Is stock decremented at UI success? Not with the controlled database queue. Inventory-only processing proved 25→24; reset proved 24→25 without sending mail.
- Why direct invoice route? Exact-ID readback avoids seed pagination/date ordering and a history framework; no PDF/history matrix is claimed.
- What remains open? Human requirement approval, other sessions/methods, settlement, delivery/PDF/worker completion and broader lifecycle.

## 17. Release status

Discovery, Proposed requirement, explicit environment-owned cleanup decision and one UI implementation complete. R10 closure separately committed. REQ-PURCHASE-001 remains Proposed. Typecheck PASS; isolated 1/1; impacted 7/7; full 17/17; three security checks PASS. Resource deltas, inventory-only mutation, exact reset recovery, one worker/zero retries/forbid-only and clean teardown verified. Hosted CI/security evidence and open-PR delivery pending. Commit, push, create OPEN PR against main, then stop. Do not merge automatically.
