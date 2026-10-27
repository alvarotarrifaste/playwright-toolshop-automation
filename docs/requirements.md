# Requirements and Evidence

Current Portfolio v1.0 baseline: **26 scenarios — 23 UI + 3 API**. This catalogue states current requirement scope and approval; the [test catalogue](test-catalogue.md) maps exact scenarios. Historical proposals, discoveries and pre/post-merge execution remain in release packages. [Architecture and defense](solution-architecture-and-defense.md) explains the durable design.

## Status and evidence

**Approved** means an explicit human decision, not a passing test. **Requires confirmation** remains a candidate whose intent/scope needs human review, even if some behavior is automated. All R15 proposals below are now Approved by L15. R16 adds no requirements or functional coverage and does not promote the five remaining candidates.

Evidence is distinguished as official pinned stories/source, controlled runtime observation, repository automation and human approval. Toolshop source is pinned to [2.5 / 9e7736c3841ec2bbb9a6822c9e6602353b7b9a65](https://github.com/testsmith-io/practice-software-testing/tree/9e7736c3841ec2bbb9a6822c9e6602353b7b9a65); [Sprint 5 stories](https://github.com/testsmith-io/practice-software-testing/blob/9e7736c3841ec2bbb9a6822c9e6602353b7b9a65/docs/user-stories/v5.md) provide product evidence. Source corroborates implementation; runtime verifies exercised behavior; neither substitutes for human approval. Initial R1 review also used then-current official documentation; later pinned evidence does not retroactively change that history.

## Authentication

| ID | Requirement / current status | Coverage and exact limits |
| --- | --- | --- |
| REQ-AUTH-001 | A customer with valid credentials reaches their account. **Approved — L1** | T-AUTH-001: seeded enabled customer, /account and My account heading. User Login AC2. No admin/TOTP/disabled/social-login matrix. |
| REQ-AUTH-002 | Invalid credentials display an invalid-credentials error. **Approved — L1** | T-AUTH-002: separate seeded negative customer and deliberately wrong password; exact Invalid email or password. AC3. One failure, not the lock threshold. |
| REQ-AUTH-003 | Candidate: signing out returns the customer to a signed-out experience. **Requires confirmation** | T-AUTH-003 retains Sign in after logout and R13 direct /account navigation → login URL/button. Browser sign-out/route behavior only; not backend revocation. |
| REQ-AUTH-004 | Candidate: an unauthenticated visitor opening /account is redirected to login. **Requires confirmation** | T-AUTH-004: fresh anonymous context, login URL/button. No backend authorization proof or bypass matrix. |
| REQ-AUTH-005 | Repeated invalid customer credentials trigger account locking and HTTP 423 on subsequent login. **Approved — L1; implementation confirmed L13** | T-AUTH-005, API: dedicated third seeded customer, valid starting login, three wrong passwords return 401/error Unauthorized, then wrong/correct login return 423/exact lock error. Positive customer remains usable; reset restores state. User Login AC4 + pinned UserService/controller + O13. No timed-unlock/admin/disabled/unknown-user matrix. Original R1 implementation deferral is resolved, not erased. |

## Catalog

Legacy numbering intentionally starts at 002; no ID is repurposed.

| ID | Requirement / current status | Coverage and exact limits |
| --- | --- | --- |
| REQ-CATALOG-002 | A valid 3–40-character query returns matching products and resets active filters. **Requires confirmation** | T-CATALOG-001 matching-query slice; T-CATALOG-005 category-reset slice. Overview AC4. Query boundaries, complete matching semantics and reset of every filter remain unproven. |
| REQ-CATALOG-003 | A no-match search displays zero results and no product cards. **Requires confirmation** | T-CATALOG-002: xxx query, exact zero-result caption/count. Runtime/repository evidence; no full empty-query/search-boundary claim. |
| REQ-CATALOG-004 | Selecting a product opens details showing its product information. **Requires confirmation** | T-CATALOG-003: original URL/name/button plus R14 14.15/Pliers/ForgeFlex Tools, meaningful description excerpt and loaded correct image. Overview AC2/Detail AC1 + P14/I14/O14. One regular product; no discount/rental/stock/related-metadata matrix. Stronger evidence does not approve the candidate. |
| REQ-CATALOG-005 | Selecting a category constrains displayed products to that category; clearing the sole selection restores the category-unrestricted grid under remaining default criteria. **Approved — L12-CATALOG** | T-CATALOG-004: exact five Pliers identities and initial nine-card page restoration. AC5 plus pinned clearing implementation/runtime. No hierarchy/multi-category/all-page/order/persistence claim. |
| REQ-CATALOG-006 | Selecting one brand restricts the grid to that brand; clearing its sole selection restores the default grid under remaining criteria. **Approved — L14** | T-CATALOG-006: complete nine-product MightyCraft default-range set, checked state, exact initial-grid restoration. AC7 supports membership; I14/O14 corroborate clearing. No multi-brand/search/filtered-pagination matrix. |
| REQ-CATALOG-007 | Pagination displays the requested page, supports next/previous and allows returning to the initial page. **Approved — L14** | T-CATALOG-007: 45 default products, nine/page, five pages; exact controlled first/second/last sets and return paths. AC3 + I14/O14. Pinned partitions, not universal sort or all-page traversal. |
| REQ-CATALOG-008 | Combining category and brand restricts results to their intersection while retaining both selections. **Approved — L14** | T-CATALOG-008: Pliers five → MightyCraft/Pliers exactly Bolt Cutters, Long Nose Pliers, Slip Joint Pliers. AC8 + I14/O14. One anonymous leaf-category/single-brand case, not pairwise coverage. |

## Cart

| ID | Requirement / current status | Coverage and exact limits |
| --- | --- | --- |
| REQ-CART-001 | A supported session can add an available product and review the correct product and selected quantity in Cart Review. **Approved — L5 refinement** | T-CART-001 anonymous and T-CART-002 independently authenticated, Combination Pliers/default 1, exact one-line cart. Detail AC3/AC8 and Cart AC1. Toast alone is insufficient. No ownership/merging-across-login/multi-device claim. |
| REQ-CART-002 | A valid quantity change is saved and recalculates line/cart totals with confirmation. **Approved — L6** | T-CART-003: anonymous Combination Pliers 1→2, unit 14.15, line/cart 28.30, exact confirmation and reload. AC2. No invalid/limit/rental/discount/auth-maintenance matrix. |
| REQ-CART-003 | Removing a selected item preserves remaining product/quantity and recalculates totals. **Approved — L6** | T-CART-004: Combination Pliers + Pliers, remove former, exactly Pliers 1/12.01 remains after reload. AC3. Final-item state is separate below. |
| REQ-CART-004 | Removing the final item yields an empty cart, removes purchasable lines/total/checkout controls and remains empty after reload. **Approved — L15** | T-CART-005: no lines/inputs/total/proceed/badge; client quantity 0; retained cart ID and exact-cart GET 200 with empty items. P15 Cart AC3–AC5 + I15/O15. Runtime copy The cart is empty. Nothing to display. differs from story copy Your shopping cart is empty. R16 retains this pinned copy oracle alongside stronger state checks; no claim that wording was reconciled or cart deleted. No route-bypass-security claim. |
| REQ-CART-005 | Repeated addition of the same regular product merges quantity into one line and recalculates saved totals. **Approved — L15** | T-CART-006: two default-1 additions → one Combination Pliers quantity-2 line, unit 14.15/line and total 28.30, badge 2, reload. Detail AC8 + exact merge I15/O15. No Thor Hammer special rule/max/overstock/decimal/rental/discount matrix. |

## Checkout and purchase

| ID | Requirement / current status | Coverage and exact limits |
| --- | --- | --- |
| REQ-CHECKOUT-001 | With a nonempty cart, normal progression presents a session-dependent identity step before Billing Address: anonymous login form plus guest alternative; authenticated acknowledgement and billing continuation without another login. **Approved — L10** | T-CHECKOUT-001/002: own anonymous versus independently logged-in cart. P10 Sign In AC1/AC2/AC5/Billing AC1 + I10/O10. Guest alternative means this is not a universal mandatory-login or backend-security claim. Stops before purchase. |
| REQ-CHECKOUT-002 | Clearing required billing city from an otherwise valid form blocks payment progression; correcting it restores progression. **Approved — L15** | T-CHECKOUT-003: one guest/local-Faker valid address → blank city/disabled proceed/payment hidden/no order → same city restored/payment reached/no order. Billing AC2/AC3 + I15/O15. No field/postcode/country/backend-validation matrix. |
| REQ-PURCHASE-001 | An authenticated seeded customer with Combination Pliers x1 and valid synthetic billing can place one COD order, see its generated reference, clear the purchased cart and independently read that persisted invoice. **Approved — L11** | T-PURCHASE-001: validation 200 then one creation 201; matching UI reference; owned-cart DELETE 204/client clear; authenticated exact-ID GET 200 with matching ID/reference, one selected line/quantity, total 14.15, COD and initial AWAITING_FULFILLMENT. P11 payment/billing + I11/O11. No settlement/fulfillment/shipping/email/PDF/worker-completion claim. |
| REQ-PURCHASE-002 | An anonymous guest with valid synthetic identity/billing and COD can create one order, see its generated reference and clear the purchased cart without login. **Approved — L15** | T-PURCHASE-002: exactly one guest creation 201, no authenticated-order POST/login, correct payload, server subtotal/total 14.15/null customer ownership, matching UI, DELETE 204, independent cart GET 404, cart keys cleared/auth absent. Guest source/OpenAPI + P15 billing/payment + O15. No anonymous invoice-read endpoint exists: operational audit of persisted guest lines/payment/status stays outside the automated assertion path. No anonymous invoice readback is claimed; authenticated oracle above is unchanged. |

Synthetic US/00000/house 1 billing is resolved by the pinned local Faker service; it is not a real or deliverable address assertion. Guest names/addresses are fictional/reserved-domain input. Reset/down owns invoice/payment/queue/stock resources; no SMTP/inventory worker is processed. Guest session identity retention is observed, not silently turned into a clearing requirement.

## API authentication

| ID | Requirement / current status | Coverage and exact limits |
| --- | --- | --- |
| REQ-API-AUTH-001 | Current-customer resource rejects missing authentication with 401/error-only JSON; fresh valid login permits the intended seeded customer's profile. **Approved — L8** | T-API-AUTH-001: GET /users/me 401; POST /users/login 200/nonempty bearer; same resource 200/correct injected email/seeded identity/runtime ID. No IDOR/roles/token lifecycle/profile mutation/schema-security matrix. Trace off and boolean sensitive comparisons. |
| REQ-API-AUTH-002 | Explicit authenticated GET /users/logout invalidates that same access token for protected customer access. **Approved — L13** | T-API-AUTH-002: own fresh login; /users/me 200 → /users/logout 200/exact confirmation → same-token /users/me 401/error-only Unauthorized. Pinned controller OpenAPI/service/middleware + O13. Distinct from browser sign-out; no refresh-family/expiry/cross-token/distributed-cache claim. |

## Human approval and historical proposal sources

| Decision | Current effect | Preserved record |
| --- | --- | --- |
| L1 | AUTH-001/002 approved; AUTH-005 approved with implementation originally deferred | [R1 evidence](release-01-validation.md), [R13 implementation/closure](release-13-summary.md) |
| L5 | CART-001 session-neutral anonymous/authenticated refinement | [R5 package](release-05-summary.md) |
| L6 | CART-002/003 approved | [R6 closure](release-06-summary.md) |
| L8 | API-AUTH-001 approved | [R8 closure](release-08-summary.md#16-post-merge-human-closure) |
| L10 | CHECKOUT-001 approved, guest exception retained | [R10 closure](release-10-summary.md#16-post-merge-human-closure) |
| L11 | PURCHASE-001 approved | [R11 closure](release-11-summary.md#16-post-merge-human-closure) |
| L12-CATALOG | CATALOG-005 approved explicitly during R12 | [R7 subsequent approval](release-07-summary.md#16-subsequent-human-requirement-approval) |
| L13 | API-AUTH-002 approved; AUTH-005 implementation confirmed | [R13 closure](release-13-summary.md#20-post-merge-human-closure) |
| L14 | CATALOG-006/007/008 approved; 004 remains Requires confirmation | [R14 closure](release-14-summary.md#21-post-merge-human-closure) |
| L15 | CART-004/005, PURCHASE-002, CHECKOUT-002 approved with exact scoped meanings | [R15 closure](release-15-summary.md#22-post-merge-human-closure) |

Original Proposed sections remain unchanged in those historical packages; later closure does not retroactively attribute approval to earlier execution. Current approval is separate from evidence and coverage completeness. Future gaps are not new Approved requirements: price/quantity/payment/security matrices, parallel/cross-browser execution and additional endpoints are outside v1.0.
