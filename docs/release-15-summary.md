# Release 15 — Cart & Checkout Edge Coverage

## 1. Objective

Final functional-coverage sprint before Portfolio v1.0 stabilization. Base: merged main **0209bff171c07320a627e4a83a04c9ef6982d5e8**. Branch: `release/15-cart-checkout-edge-coverage`. Discovery selected **four UI scenarios** across four distinct risks; final suite **26: 23 UI + 3 API**, cart **6**, checkout **5**, catalog **8**, smoke unchanged at **5**. No exhaustive Toolshop matrix or count-driven product variants.

## 2. R14 closure

Separate commit **dfad1ef**, `docs: close Release 14 catalog expansion`, appends [verified post-merge closure](release-14-summary.md#21-post-merge-human-closure) without changing original R14 sections. Human approval L14 marks REQ-CATALOG-006/007/008 Approved and updates their test mappings; REQ-CATALOG-004 remains Requires confirmation. Original Proposed history remains historical.

PR #18 merged at **0209bff171c07320a627e4a83a04c9ef6982d5e8**. Main push [run 40535132019](https://github.com/alvarotarrifaste/playwright-toolshop-automation/actions/runs/40535132019), job **122298215078**, was independently verified **completed/success** at that exact SHA: **22/22 — 19 UI + 3 API**, strict TypeScript PASS, security **3/3 PASS**, configured/actual worker 1, retries [0], forbidOnly, reset/seed and teardown PASS. Only sanitized controlled-results artifact **12748817506** (1399 bytes) published; raw HTML withheld. All 23 public log files scanned clean; artifact/results hashes match metadata/manifest. **Release 14 CLOSED.** The run was still in progress at task start; closure was committed only after completed evidence was inspected.

## 3. Cart/checkout discovery

Exact pinned Toolshop **2.5**, source **9e7736c3841ec2bbb9a6822c9e6602353b7b9a65**, unchanged images. **P15:** [pinned Sprint 5 stories](https://github.com/testsmith-io/practice-software-testing/blob/9e7736c3841ec2bbb9a6822c9e6602353b7b9a65/docs/user-stories/v5.md), Product Detail AC6–AC8, Cart Review AC1–AC5, Sign In AC1/AC5, Billing Address AC1–AC3, Payment Advanced AC1/AC9. The Sign In stories do not fully specify guest completion; guest form and backend guest OpenAPI/source provide additional evidence rather than inventing a story criterion.

**I15:** [cart backend](https://github.com/testsmith-io/practice-software-testing/blob/9e7736c3841ec2bbb9a6822c9e6602353b7b9a65/sprint5/API/app/Services/CartService.php), [cart component](https://github.com/testsmith-io/practice-software-testing/blob/9e7736c3841ec2bbb9a6822c9e6602353b7b9a65/sprint5/UI/src/app/checkout/cart/cart.component.ts), [cart template](https://github.com/testsmith-io/practice-software-testing/blob/9e7736c3841ec2bbb9a6822c9e6602353b7b9a65/sprint5/UI/src/app/checkout/cart/cart.component.html), [client cart service](https://github.com/testsmith-io/practice-software-testing/blob/9e7736c3841ec2bbb9a6822c9e6602353b7b9a65/sprint5/UI/src/app/_services/cart.service.ts), guest identity/address/payment components, [invoice controller](https://github.com/testsmith-io/practice-software-testing/blob/9e7736c3841ec2bbb9a6822c9e6602353b7b9a65/sprint5/API/app/Http/Controllers/InvoiceController.php), [invoice service](https://github.com/testsmith-io/practice-software-testing/blob/9e7736c3841ec2bbb9a6822c9e6602353b7b9a65/sprint5/API/app/Services/InvoiceService.php), invoice/payment models, mail/inventory jobs and scheduler configuration. Source inspection and actual runtime observation are separate evidence classes.

**O15:** independent anonymous sessions confirmed the following:

| Candidate | Controlled observation |
| --- | --- |
| Repeated regular-product add | Combination Pliers 1 + 1 becomes one quantity-2 line; unit 14.15 and line/cart 28.30; reload preserves it |
| Final-item removal | Exact UI text **The cart is empty. Nothing to display.**; zero item/quantity inputs, total/proceed/badge absent; reload remains empty; backend cart GET 200 with [] items; cart ID retained, client quantity 0 |
| Guest COD | Guest endpoint POST 201; generated reference matches UI; user_id null; subtotal/total 14.15; owned cart DELETE 204 and independent GET 404; no login/auth token; cart keys cleared |
| Required city | Otherwise valid synthetic lookup-derived address can proceed; clearing city disables progression and keeps payment hidden; correcting city restores payment access without creating an order |

Empty-cart story wording is **Your shopping cart is empty**, differing from the pinned English translation/runtime. This is documented as a Proposed observed UI oracle, not retroactively treated as an approved message. A zero-item backend cart is retained by design: deleting the last line is distinct from purchase deleting the entire cart. The cart badge/link is absent when count is zero, rather than showing a visible numeral 0.

## 4. Existing coverage/gaps

Preserve all 22 baseline scenarios: anonymous/authenticated add, saved quantity edits, selected-item removal/totals, identity choice, authenticated billing and full authenticated COD purchase with independent invoice readback. R15 adds final-item lifecycle, additive quantity merging, guest identity/order creation and one invalid billing progression boundary. It does not duplicate successful add/purchase using different product names. Authentication/API/catalog scenarios remain unchanged.

## 5. Requirement decisions

Requirements were recorded after source/runtime discovery and before implementation. Existing approvals retain their scope; new observations are not Approved by passing automation.

| Requirement / test | Status | Focus and evidence |
| --- | --- | --- |
| REQ-CART-004 / T-CART-005 | **Proposed** | Final-item removal, empty UI/persisted-cart lifecycle, total/checkout removal and reload. P15 Cart AC3/AC4/AC5 + I15/O15; explicit wording discrepancy and retained empty cart. |
| REQ-CART-005 / T-CART-006 | **Proposed** | Same regular product added twice accumulates in one saved line, with recalculated totals. P15 Detail AC8 supports adding selected quantity; exact merge semantics are I15/O15 corroboration. |
| REQ-PURCHASE-002 / T-PURCHASE-002 | **Proposed** | Anonymous guest creates one COD order, gets matching reference/server-computed total and clears purchased cart without login. Guest OpenAPI/source, P15 payment/billing and O15; no claim of anonymous invoice GET readback. |
| REQ-CHECKOUT-002 / T-CHECKOUT-003 | **Proposed** | One empty required-city boundary blocks payment; correcting it restores progression without ordering. P15 Billing AC2/AC3 + I15/O15. |

All proposals await human review; REQ-PURCHASE-001 and existing cart/checkout approvals are unchanged. New cases are UI/@cart or @checkout/@regression, with no new tags or smoke additions.

## 6. Selected scenarios and rejected candidates

Four selected risks differ materially: **no purchasable cart**, **incorrect accumulation/duplicate lines**, **guest identity/order branch**, **invalid required billing data advancing**. No additional quantity-value or payment-method variants.

- **Quantity minimum:** official Detail AC6 and source support decrement-at-one prevention, but repeated-add exercises the untested backend merge path with stronger persisted line/total value. A second quantity case was unnecessary.
- **Quantity maximum/overstock/decimal:** story manual-entry maximum is 999,999,999, while current UI clamps to 99; backend repeated regular-product additions do not share that UI aggregate cap. This conflict/matrix is not silently adopted as a requirement. Thor Hammer additionally has a special one-per-cart constraint; no product-specific variant is added.
- **Postal/country validation:** valid local Faker address consistency is reused as a precondition. Only empty city is selected, avoiding a field/message matrix and external address service dependency.
- **Empty direct-route/stale-ID security:** combined only with final-item removal and absent proceed/total. No separate bypass-security test or duplicate empty-protection case.
- **Double final submission:** source has asynchronous validate-then-create phases; a duplicate-order investigation would need in-flight timing or race assumptions beyond a clear deterministic UI transition. No concurrency, repeated-click loop or speculative idempotency requirement.
- **Other payment/guest variants:** COD avoids secrets/external settlement; no broad alternate-payment matrix.

## 7. Test design

**T-CART-005:** own UI-created one-item cart, generated ID from response; remove final product; exact observed empty message, zero rows/inputs, total/proceed/badge absent, session quantity 0 and retained owned ID; reload triggers exact-ID GET 200 with matching cart and empty item list; UI remains empty/unavailable. No false assertion that removing a line deletes the backend cart.

**T-CART-006:** own anonymous regular product quantity 1/cart 14.15; independently navigate to same product and add default 1 again; assert exactly one named line/input, quantity 2, unit 14.15, line/cart 28.30 and badge 2; reload confirms saved line/quantity/totals. This tests POST accumulation, distinct from R6 PUT replacement.

**T-CHECKOUT-003:** own anonymous cart/guest identity; synthetic US/00000/house 1 lookup supplies coherent street/city/state; assert valid baseline/enabled proceed. Clear city and blur: city empty, billing visible, proceed disabled, payment hidden, no invoice submissions. Restore the same lookup city and reach payment; still zero orders. No exact field-message/DOM invalid-class or backend-validation claim.

**T-PURCHASE-002:** own anonymous cart; enter synthetic guest identity; coherent billing and COD. First Confirm validates (200/success) with zero orders; second creates one guest invoice (201), not an authenticated-order POST, and UI reference matches creation. Assert nonempty dynamic ID/reference, user_id null, server subtotal/total 14.15, correct own cart/synthetic guest/COD request payload, no login, cart DELETE 204, cleared cart keys/auth absent, independent anonymous exact-cart GET 404. All assertions are test-owned; no token extraction or login workaround.

## 8. Page Object impact

CartPage adds only emptyCartMessage and cartQuantityBadge locators. Existing remove, quantity, open and proceed methods remain byte-equivalent. CheckoutPage adds five guest-specific scoped locators and two concrete repeated interactions: enterGuestIdentity (tab/form/submit) and continueAsGuest (billing continuation). Both new checkout cases reuse these visible controls. Original methods/locators are unchanged; CatalogPage/ProductDetailsPage/LoginPage are unchanged.

No CartService/CheckoutFlow, factory, generic form/validation helper, fixture hierarchy, base page, retry helper, data framework or generic API client. Existing add-to-cart/cart-maintenance/identity-billing specs evolve in place; a coherent guest-purchase.spec.ts owns the substantial anonymous order path and its distinct oracle limitations. No standalone API scenario is introduced.

## 9. State/resource ownership

R9/R11 ownership decision was reassessed because the full run now consumes **two purchases**. Both belong to the same existing disposable schema/resource set: invoices, line items, payment/method details and queued inventory/email. Two quantity-1 regular products fit seed stock 25; no inventory worker, scheduler or SMTP worker runs. Tests own separate carts/browser contexts and do not consume shared generated IDs or a previous order. Existing reset/seed and disposable teardown can still safely own all state; no per-test DB cleanup/fixture is justified.

Read-only operational snapshots independently verify persistence/side effects. The pinned invoice seeder attaches every seed invoice to a user; a guarded audit requires zero guest invoices after reset, exactly one unowned invoice after the isolated guest/full run, and exact total invoice counts 200/201/202. It reads that guest record's own line/payment relations without dates/list ordering or hardcoded identities. Discovery additionally correlated the exact response ID to a persisted row. These audits stay under .sut/, never imported by shipped tests. Reset must restore complete seed counts, queues/counters and stock after guest-only and two-purchase full runs. Other cart cases may leave owned carts until reset/down; a global zero-cart assertion is appropriate after reset/teardown, not before full-suite teardown.

## 10. Guest checkout oracle design

The guest controller permits anonymous creation, but every invoice read is authenticated and user-scoped; no anonymous guest receipt/read endpoint exists. The response does not retain guest identity fields (source model mass assignment); identity is used in the guest submission/email job, not exposed as an invoice field. The client also retains guestCheckout session data after completion; the new test does not invent a guest-data-clearing requirement.

**Selected guest oracle is explicit order acceptance plus independent cart-state evidence**, not the same readback mechanism as authenticated R11. A lone success message is insufficient: 201, exactly one guest endpoint submission, correct payload, server-computed money values, null customer ownership, matching dynamic reference, deletion response and a separate cart GET 404 must all pass. A read-only exact-ID discovery audit independently confirmed persisted guest invoice, one Combination Pliers quantity 1/unit 14.15, COD payment and initial AWAITING_FULFILLMENT. Guarded isolated/full count/ownership audits corroborate guest persistence again during release validation; the authenticated test retains its own exact-ID readback.

**Limit:** shipped guest test does not independently GET invoice lines/payment/status; operational audits provide that release evidence. It is not labeled persisted-invoice-readback coverage. R11 authenticated test, requirement and independent readback remain fully unchanged. No admin/auth-token workaround or DB-access helper enters the suite. This narrower guest requirement is proposed for human review, rather than weakening existing authenticated acceptance criteria.

## 11. Test data/security

Combination Pliers 14.15/default quantity 1 is a documented pinned seed oracle. Guest identities are explicit fictional names and reserved **example.invalid** addresses; no real PII or working mailbox. US/00000/house 1 uses existing deterministic local Faker lookup; address values come from that response, not real/hardcoded addresses. COD needs no financial secrets. No SMTP/email or inventory job processing is started.

Generated cart/invoice IDs/references are response-correlated at runtime, never committed constants. Independent cart read derives its origin from the actual controlled cart-creation response, with no fixed environment URL. Auth-token is checked only for absence, never extracted. Existing API tracing/scanner/credential injection/exclusions/private diagnostics/staging/publication policies remain unchanged. No raw responses attached/printed; booleans protect identity/payload comparisons. Native UI diagnostics remain private and scanner-approved bytes alone can be public.

## 12. Files changed

Closure: docs/release-14-summary.md, docs/requirements.md, docs/test-catalogue.md. Implementation: pages/cart/CartPage.ts, pages/checkout/CheckoutPage.ts, tests/ui/cart/add-to-cart.spec.ts, tests/ui/cart/cart-maintenance.spec.ts, tests/ui/checkout/identity-billing.spec.ts, new tests/ui/checkout/guest-purchase.spec.ts. Current overview/evidence: README.md and new docs/release-15-summary.md.

All catalog/auth/API code, authenticated purchase test, other Page Objects, runner/config/commands/dependencies, workflow/scanner/security tests, environment template/exclusions and source/image pins remain unchanged. Unrelated output/ and tmp/ are untouched/uncommitted. Temporary observers/audits/raw diagnostics/seed identities are private under ignored .sut/.

## 13. Isolated execution

Strict TypeScript **PASS**; discovery **26 tests in 11 files**; CI evidence security checks **3/3 PASS**. **Guest order 1/1 PASS, final-item removal 1/1 PASS, repeated-add 1/1 PASS, missing-city validation 1/1 PASS**, independently through the controlled wrapper. Each confirms reset/seed, configured/actual worker 1, retries [0], forbidOnly and one passed result at retry 0. Summary scans clean; raw HTML withheld. Isolated guest operational audit verified one unowned invoice with expected line/total/COD/initial status; one invoice/line/payment/COD detail added, two expected pending jobs, stock 25/failed jobs 0. Reset restored the exact selected seed/resource snapshot. Initial validation preparation stopped before any scenario because private audit output needed separating from bootstrap text; the bounded ignored audit script was corrected without changing shipped code, assertions, timeouts or retry settings.

## 14. Cart subset

`npm.cmd run test:cart`: **6/6 UI PASS**. All four original cart paths and both additions pass with reset/seed, one worker, zero retries/forbid-only; no unexpected/flaky/skipped/global errors.

## 15. Checkout subset

`npm.cmd run test:checkout`: **5/5 UI PASS**, including the unchanged authenticated purchase with independent persisted invoice readback. Source/metadata verify configured/actual worker 1, retries [0], forbidOnly, reset/seed and no unexpected/flaky/skipped/global errors. After the subset: two additional invoices/lines/payments/COD details, four pending jobs (two inventory/two email), unchanged stock 25, failed jobs 0. No catalog/product action changed, so an extra standalone catalog invocation is unnecessary; full regression still includes all eight catalog cases.

## 16. Full regression

**Final controlled full regression: 26/26 PASS — 23 UI + 3 API**, 66.9s. All exact repository titles match; each has one passed retry-0 result. Expected=26, unexpected/flaky/skipped/global errors=0, configured/actual worker 1, configuredRetries=[0], forbidOnly=true, resetSeedConfirmed=true.

Initial local full run had **25/26**, with the unchanged anonymous add-to-cart baseline timing out while filling the catalog Search input during navigation, before any cart action. All four new cases passed. Initial compact failure results and scan decisions are retained privately; scan withheld raw HTML/failure diagnostics. The affected baseline passed independently **1/1** and a separate full invocation passed **26/26**. No assertion/action, timeout or retry setting changed. This is a local baseline timing signal, not an established R15 regression or resolved root cause; deliberate investigation remains R16 scope. It is not relabeled as a first-run pass.

Independent comparison verifies every baseline test body/assertion unchanged, including authenticated purchase readback. Removing additive Page Object members restores original files exactly. Catalog/auth/API, runner/config, aliases/dependencies, workflow/scanner/security tests, template/exclusions and pins are unchanged. Tags: 26, 23 UI/3 API, cart6/checkout5/smoke5. Documentation file links resolve; changed source/docs contain no injected credentials; git diff --check PASS.

Guest-only audit and full audit independently confirm the persisted guest row/line/14.15/COD/AWAITING_FULFILLMENT. Full effects: +2 invoices, +2 lines, +2 payments/COD details, four pending jobs (2 inventory/2 email), stock 25 and failed jobs 0. Explicit final reset reproduces the selected seed snapshot, with zero carts/items/jobs and stock 25; independent guest count returns zero. Native queued resources were never processed. Final summary scanned clean; HTML withheld. Result SHA256 **519c3e87a9f8282c02891dab55b336b23979b8c1ce6bb4bae6988420c9920bc6**. npm.cmd run sut:down PASS; independent Docker label queries verified no controlled containers, networks or volumes.

## 17. CI/security evidence

Local security checks **3/3 PASS**. Hosted [run 40550642319](https://github.com/alvarotarrifaste/playwright-toolshop-automation/actions/runs/40550642319), job **122353118033**, at **9e7e8c38d886ddcf60a68f1a5c7e5e75e1d53e9c**: **completed/success**. Subsequent delivery changes only record evidence in documentation.

| Hosted evidence | Result |
| --- | --- |
| Strict TypeScript | **PASS** |
| CI evidence security checks | **3/3 PASS** |
| Full controlled suite | **26/26 PASS — 23 UI + 3 API** |
| Result integrity | All 26 exact repository titles; expected=26; unexpected/flaky/skipped/global errors=0 |
| Execution contract | Configured/actual worker 1; retries [0]; each test passed at retry 0; forbidOnly=true |
| Reset/seed | **PASS** |
| Teardown | **PASS**, logs confirm controlled containers/networks/volumes absent |
| Publication | Only sanitized **controlled-results**, artifact **12754554324**, **1531 bytes**, 14-day retention |
| Scan decisions | Summary clean; HTML withheld as sensitive-or-uninspectable; diagnostic metadata clean, no failure upload on green run |
| Public log audit | **23 files scanned clean** |

Downloaded ZIP contains exactly results.json and scan.json. ZIP SHA256 **1f8bdabe173c770a86e08b91275da1a0920ed2d84090d0e44fce8882ecf9fe13** matches GitHub metadata; results SHA256 **519c3e87a9f8282c02891dab55b336b23979b8c1ce6bb4bae6988420c9920bc6** matches the scan manifest. Independent verification covers exact outcomes/titles, layer counts, flags/reset, resource absence, publication handling and public log security. Workflow, scanner/security tests, compact allowlist, staged-byte re-scan and private diagnostics remain unchanged; no execution issue required a pipeline modification.

## 18. Risks/limitations

Four new requirements remain Proposed. Empty-message wording differs from the story; retained empty carts/session IDs and retained guest identity are observed behavior, not assumed cleanup bugs. Guest invoice readback is unavailable anonymously, so shipped acceptance and operational persistence corroboration are explicitly separated. No email delivery, settlement, fulfillment, shipping, inventory-job completion, quantity matrix, direct-route bypass or double-submit/race claim. Existing single-SUT/one-worker/no-overlap constraints apply; direct test runs bypass reset and cannot substitute for controlled evidence.

## 19. Reviewer guide

Review the independently verified R14 closure first. Compare P15/I15/O15 and new Proposed scopes, especially empty wording/cart retention and the guest oracle boundary. Read each test top-to-bottom and follow only concrete Page Object imports. Compare original method bodies and all 22 baseline cases; verify no auth purchase weakening or new API case. Check isolated/cart/checkout/full results, guest-only/full row/queue deltas, exact reset recovery, unchanged scanner/flags, hosted logs/artifact hashes and teardown. Human approves requirements and merge.

## 20. Interview-defense notes

- Each addition protects a different transition: last item → empty; repeated POST → accumulated line; guest identity → accepted order; valid → missing required city → corrected payment access.
- Guest flow differs from authenticated purchase in identity and backend creation branch; no duplicate login/product-name variant. Its narrower oracle is stated honestly instead of pretending a protected invoice endpoint is anonymously readable.
- A persisted empty cart is valid retention; asserting deletion would contradict source/runtime. No total/proceed plus independent empty readback protects the actual business risk.
- Direct Page Objects expose controls; no flow/service abstraction hides assertions. Guest identity interaction is concretely reused twice.
- Two purchase resource sets remain safely owned by reset/down; read-only audits prove recovery, rather than introducing speculative cleanup fixtures.
- Upper quantity and duplicate-submit behavior need their own requirement/reliability work; this final functional sprint stays bounded.
- Architecture gate: distinct risks **yes**; data-only variants **none**; meaningful guest path **yes, explicit oracle limits**; readable tests/focused Page Objects **yes**; speculative helpers/fixtures **none**; deterministic state cleanup **verified below**; rerun from reset/seed **verified below**; recruiter-friendly README **concise current coverage/evolution**; interview defense **source, behavior and limits explicit**.

## 21. Release status

**Release 15 implementation and validation complete; ready for human review through an OPEN PR against main.** Four distinct UI edges/alternate paths, final suite 26 (23 UI + 3 API), all 22 baseline cases unchanged. Isolated scenarios, cart 6/6, checkout 5/5, final local/hosted 26/26, strict types, security 3/3, resource/reset recovery, scanned public evidence, teardown and diff checks PASS. Four requirements remain Proposed with explicit empty-wording/guest-oracle limits. Initial local baseline timeout remains recorded for later reliability investigation without a timeout/retry change. Release 14 is CLOSED. This is the final functional-coverage increment before Portfolio v1.0 stabilization; delivery stops before merge and Release 16 is not started.
