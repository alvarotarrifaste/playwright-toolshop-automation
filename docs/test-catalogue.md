# Existing automation and traceability

Eight implemented UI tests are mapped below. The original seven names and functional assertions are preserved; Release 5 adds T-CART-001. IDs are documentation identifiers. Release 2 supplies a controlled target, reset before execution and separate authentication customers. Requirement status comes from [the requirements catalogue](requirements.md), independently of historical release results and [Release 5 execution evidence](release-05-summary.md).

Priority and smoke/regression assignments in Phase 1 were proposals. **Not yet agreed**: no operational suite tags or approved priority labels are inferred. All eight run through the existing controlled Chromium command. T-CART-001 is classified as functional regression for the Add to Cart happy path; this does not introduce a tag-filtered suite.

## Authentication

Source for all four: [tests/login.spec.ts](../tests/login.spec.ts). Functional area: Authentication / account access. Layer: UI. Current status: **Implemented, preserved**. Evidence: existing automation behavior and repository evidence; D5 where specified below; current application observation only as supported by the validation record.

| Test ID | Requirement and status | Exact existing scenario | Current assertions | Known gap / data prerequisite |
| --- | --- | --- | --- | --- |
| T-AUTH-001 | REQ-AUTH-001: Approved | `registered user can login successfully` | `/account` URL and visible `My account` heading | Enabled customer; `TEST_USER_EMAIL` and `TEST_USER_PASSWORD`. D5 User Login AC2. Does not cover admin, disabled accounts or TOTP. |
| T-AUTH-002 | REQ-AUTH-002: Approved; minor documentation condition | `customer cannot sign in with an incorrect password` | Visible error with exact `Invalid email or password` text | Release 2 uses `TEST_NEGATIVE_USER_EMAIL`, a different seeded customer from positive login/logout; controlled-suite execution resets/seeds first. D5 User Login AC3. Does not assert absence of session. Browser isolation alone does not reset failure counters; direct repeated execution can still lock the negative customer. |
| T-AUTH-003 | REQ-AUTH-003: Requires confirmation | `signed-in customer logs out` | Successful account redirect, then visible `Sign in` link after logout | Valid credentials; test performs its own UI login. Official intent pending; no token/session invalidation or post-logout route check. |
| T-AUTH-004 | REQ-AUTH-004: Requires confirmation | `unauthenticated visitor cannot access /account` | `/auth/login` URL and visible login button | Fresh unauthenticated context; no credentials needed. Official intent pending; no backend authorization proof. |

## Product Discovery

Source for all three: [tests/product-discovery.spec.ts](../tests/product-discovery.spec.ts). Functional area: Product Discovery. Layer: UI. Current status: **Implemented, preserved; requirement review pending**. Evidence: existing automation behavior and repository evidence; D5 where specified; current application observation only as supported by validation.

| Test ID | Requirement and status | Exact existing scenario | Current assertions | Known gap / data prerequisite |
| --- | --- | --- | --- | --- |
| T-CATALOG-001 | REQ-CATALOG-002: Requires confirmation | `visitor searches for a product and sees matching results` | Search completion visible, first product name visible, exact `Pliers` match visible | `Pliers` query and expected product must exist. D5 Product Overview AC4. Does not verify every result, filter reset or query boundaries. |
| T-CATALOG-002 | REQ-CATALOG-003: Requires confirmation | `visitor searches for a product with no matches` | Exact `0 products found for 'xxx'` text; zero product-name elements | `xxx` must remain unmatched. Official wording/empty-state confirmation pending; no search-completion assertion in this test. |
| T-CATALOG-003 | REQ-CATALOG-004: Requires confirmation | `visitor opens a product from search results and views its details` | Search completion, product URL, exact `Combination Pliers` name and visible Add to cart | Search `Pliers`; target product must exist. D5 Product Overview AC2 / Product Detail AC1. Other detail information and actual cart addition not covered. |

## Deferred automation

REQ-AUTH-005 is approved but has **no implemented automated test**. A future locking scenario needs explicit account isolation, verified counter semantics and reset/unlock lifecycle before implementation. It is not the new eighth test: Release 5's addition is Add to Cart. API checks, additional discovery scenarios and cart operations beyond the focused addition remain deferred.

## Add to Cart — Release 5

Source: [tests/cart.spec.ts](../tests/cart.spec.ts). Layer: UI; classification: **functional regression — Add to Cart happy path**. Implementation: reused CatalogPage; small additions to ProductDetailsPage; CartPage exposes cart navigation/product/quantity locators. All assertions stay in the test. No fixtures, API helpers, data framework, generic components or order dependencies.

| Test ID | Requirement/status and evidence | Exact scenario / implementation | Preconditions | Expected result / assertions | Business/risk value and execution |
| --- | --- | --- | --- | --- | --- |
| T-CART-001 | REQ-CART-001: Proposed, approval pending. P5 official pinned stories; I5 official source; O5 controlled observation/execution. | `visitor adds a product to cart and sees the selected product and quantity` in tests/cart.spec.ts | Controlled reset/seed/readiness; fresh anonymous context; search Pliers; seeded in-stock Combination Pliers; default quantity 1. | Search complete; exact detail product/default quantity; Add to Cart; navigate through cart link; /checkout; complete cart product-name collection exactly [Combination Pliers]; quantity=1. | Prevent missing/wrong product/quantity and unexpected extra lines in purchase funnel. Requirement → test → POM → local/hosted results in release-05-summary.md. |

Playwright's per-test context isolates sessionStorage cart identity; no scenario provides state to another. Cart-link auto-wait synchronizes navigation after successful add (link is absent for zero items in this SUT); final assertions inspect the persistent cart contents rather than relying on transient confirmation. Existing seven tests remain unchanged. No new test covers checkout progression, payment, pricing/discounts, removal, quantity updates or empty-cart wording.
