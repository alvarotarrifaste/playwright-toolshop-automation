# Test Catalogue

Current baseline: **26 scenarios = 23 UI + 3 API**, all discovered through the controlled Chromium project. No functional scenario is added or materially changed in R16. [Requirements](requirements.md) are the authority for current scope/status; historical proposal and release evidence remains in packages, not duplicated here. [Architecture and defense](solution-architecture-and-defense.md) explains selection and oracle decisions.

Every test has one native layer, one primary domain and @regression. Exactly five also have @smoke. IDs below are traceability identifiers; titles remain unchanged. Test-owned context/cart/token setup is independent of another test. Reset/seed owns persistent state before each controlled invocation.

## UI authentication — 4

Source: [authentication.spec.ts](../tests/ui/authentication/authentication.spec.ts). Tags @ui/@auth/@regression. Positive and single-invalid-login customers are separate; no shared storage-state login.

| Test ID | Requirement/status | Exact title | Main oracle |
| --- | --- | --- | --- |
| T-AUTH-001 | REQ-AUTH-001 — Approved | `registered user can login successfully` | Account URL/heading; @smoke |
| T-AUTH-002 | REQ-AUTH-002 — Approved | `customer cannot sign in with an incorrect password` | Exact rejection using separate negative customer |
| T-AUTH-003 | REQ-AUTH-003 — Requires confirmation | `signed-in customer logs out` | Sign in, then direct /account redirects to login/button; no revocation claim |
| T-AUTH-004 | REQ-AUTH-004 — Requires confirmation | `unauthenticated visitor cannot access /account` | Fresh-context protected-route redirect/button |

## API authentication — 3

Sources: [authorization.spec.ts](../tests/api/authentication/authorization.spec.ts), [account-security.spec.ts](../tests/api/authentication/account-security.spec.ts). Tags @api/@auth/@regression; trace off. Direct request fixture owns disposal, no raw auth-body attachments or token logging.

| Test ID | Requirement/status | Exact title | Main oracle |
| --- | --- | --- | --- |
| T-API-AUTH-001 | REQ-API-AUTH-001 — Approved | `T-API-AUTH-001: current customer resource rejects anonymous access and returns the authenticated customer` | Missing auth 401/error-only; own login/current profile 200/matching identity; @smoke |
| T-AUTH-005 | REQ-AUTH-005 — Approved | `T-AUTH-005: three invalid passwords lock only the dedicated customer on subsequent login` | Dedicated third customer: initial 200, three 401s, subsequent wrong/correct 423, positive unaffected |
| T-API-AUTH-002 | REQ-API-AUTH-002 — Approved | `T-API-AUTH-002: explicit API logout invalidates the same token for protected customer access` | Same-token protected access 200 → explicit logout 200 → protected access 401 |

## UI catalog — 8

Sources: [search.spec.ts](../tests/ui/catalog/search.spec.ts), [filtering.spec.ts](../tests/ui/catalog/filtering.spec.ts), [browsing.spec.ts](../tests/ui/catalog/browsing.spec.ts). Tags @ui/@catalog/@regression. All anonymous/read-only; source-derived sets and boundary limits are in requirements and [R14](release-14-summary.md).

| Test ID | Requirement/status | Exact title | Main oracle |
| --- | --- | --- | --- |
| T-CATALOG-001 | REQ-CATALOG-002 — Requires confirmation | `visitor searches for a product and sees matching results` | Matching Pliers result; @smoke |
| T-CATALOG-002 | REQ-CATALOG-003 — Requires confirmation | `visitor searches for a product with no matches` | Exact zero caption and no cards |
| T-CATALOG-003 | REQ-CATALOG-004 — Requires confirmation | `visitor opens a product from search results and views its details` | URL/name/button, seeded price/category/brand, meaningful description, loaded correct image |
| T-CATALOG-004 | REQ-CATALOG-005 — Approved | `visitor selects a category and clears it to restore the initial product page` | Exact five Pliers → initial nine-card restoration |
| T-CATALOG-005 | REQ-CATALOG-002 — Requires confirmation | `visitor searches after category filtering and sees matching products with the category cleared` | Category cleared, exact six Hammer search results; partial reset requirement |
| T-CATALOG-006 | REQ-CATALOG-006 — Approved | `visitor selects a brand and clears it to restore the default product grid` | Exact nine MightyCraft products, checked state, clear/restoration |
| T-CATALOG-007 | REQ-CATALOG-007 — Approved | `visitor browses next previous and numbered catalog pages with the expected product sets` | Exact controlled page 1/2/5 sets and return paths |
| T-CATALOG-008 | REQ-CATALOG-008 — Approved | `visitor combines category and brand filters and sees only their product intersection` | Pliers/MightyCraft exact three, both criteria retained |

## UI cart — 6

Sources: [add-to-cart.spec.ts](../tests/ui/cart/add-to-cart.spec.ts), [cart-maintenance.spec.ts](../tests/ui/cart/cart-maintenance.spec.ts). Tags @ui/@cart/@regression. Each creates its own cart through UI; generated identities are runtime-correlated.

| Test ID | Requirement/status | Exact title | Main oracle |
| --- | --- | --- | --- |
| T-CART-001 | REQ-CART-001 — Approved | `visitor adds a product to cart and sees the selected product and quantity` | Exact one product/default quantity; @smoke |
| T-CART-002 | REQ-CART-001 — Approved | `authenticated user adds a product to cart and sees the selected product and quantity` | Own UI login, exact product/quantity, retained user menu |
| T-CART-003 | REQ-CART-002 — Approved | `visitor updates a cart quantity and sees the saved quantity and recalculated totals` | Quantity 1→2/28.30, confirmation and reload |
| T-CART-004 | REQ-CART-003 — Approved | `visitor removes a cart product and sees the remaining product and recalculated total` | Row-specific removal, preserved unrelated Pliers/12.01 after reload |
| T-CART-005 | REQ-CART-004 — Approved | `visitor removes the final cart item and sees a persisted empty cart without checkout controls` | Empty copy, zero items/total/proceed/badge, retained empty exact-cart GET 200 after reload |
| T-CART-006 | REQ-CART-005 — Approved | `visitor adds the same product again and sees one saved cart line with accumulated quantity and totals` | One quantity-2 line/28.30 after repeated add and reload |

The exact empty-cart runtime copy is intentionally retained as a pinned oracle with its story discrepancy recorded. It is supported by stronger business-state/readback checks; R16 does not mechanically replace it. No invalid/overstock/discount/ownership matrix is implied.

## UI checkout and purchase — 5

Sources: [identity-billing.spec.ts](../tests/ui/checkout/identity-billing.spec.ts), [purchase.spec.ts](../tests/ui/checkout/purchase.spec.ts), [guest-purchase.spec.ts](../tests/ui/checkout/guest-purchase.spec.ts). Tags @ui/@checkout/@regression. Synthetic guest/billing data only; COD; no background workers.

| Test ID | Requirement/status | Exact title | Main oracle |
| --- | --- | --- | --- |
| T-CHECKOUT-001 | REQ-CHECKOUT-001 — Approved | `anonymous checkout presents the identity choice before billing` | Login plus guest alternative; billing/payment not active |
| T-CHECKOUT-002 | REQ-CHECKOUT-001 — Approved | `authenticated checkout continues to billing without another login prompt` | Own UI login, acknowledgement and visible billing without credential prompt |
| T-CHECKOUT-003 | REQ-CHECKOUT-002 — Approved | `guest cannot advance with an empty required billing city and can proceed after correcting it` | Valid → blank city blocked/no order → corrected/payment accessible/no order |
| T-PURCHASE-001 | REQ-PURCHASE-001 — Approved | `authenticated customer completes a cash-on-delivery purchase with a persisted invoice and cleared cart` | One order, matching UI reference, cart deletion/client clear, independent authenticated invoice/line/payment/status readback; @smoke |
| T-PURCHASE-002 | REQ-PURCHASE-002 — Approved | `anonymous guest completes one cash-on-delivery order with matching confirmation and a deleted cart` | One guest creation/server amount/reference/null customer, matching UI, cart DELETE and independent GET 404; no anonymous invoice readback claim |

Guest operational persistence audit is outside the automated assertion path. Authenticated exact-invoice readback remains distinct. Purchases queue inventory/email but do not prove worker execution, delivery, settlement or fulfillment. Reset/down owns invoice/payment/queue/stock state.

## Execution selection

| Command | Expected count |
| --- | ---: |
| npm run test:controlled | 26 |
| npm run test:ui | 23 |
| npm run test:api | 3 |
| npm run test:smoke | 5 |
| npm run test:auth | 7 |
| npm run test:catalog | 8 |
| npm run test:cart | 6 |
| npm run test:checkout | 5 |

All normal aliases reuse ready/reset/seed plus Chromium/one worker/zero retries/forbid-only. No test-order dependency or separate category runner. Five smoke cases are marked above; remaining cases are regression without smoke. [R16 evidence](release-16-summary.md) records discovery/tag audits, actual commands, repeat full outcomes and debugging restoration. Current statuses include L15 human approvals; original Proposed history remains in the separate release packages and closure records linked from requirements.
