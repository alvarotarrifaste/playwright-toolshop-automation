# Existing automation and traceability

Seven implemented UI tests are mapped below. IDs are documentation identifiers; test names and assertions are preserved. Release 2 adds explicit CI selection as described below. Requirement status comes from [the requirements catalogue](requirements.md), independently of execution outcome in [validation evidence](release-01-validation.md).

Priority and smoke/regression assignments in Phase 1 were proposals. **Not yet agreed**: Release 1 assigns no operational suite tags or approved priority labels. All seven remain executable through the existing local Chromium command. Release 2 CI runs six tests, excluding T-AUTH-002 through its native `@shared-state-risk` tag.

## Authentication

Source for all four: [tests/login.spec.ts](../tests/login.spec.ts). Functional area: Authentication / account access. Layer: UI. Current status: **Implemented, preserved**. Evidence: existing automation behavior and repository evidence; D5 where specified below; current application observation only as supported by the validation record.

| Test ID | Requirement and status | Exact existing scenario | Current assertions | Known gap / data prerequisite |
| --- | --- | --- | --- | --- |
| T-AUTH-001 | REQ-AUTH-001: Approved | `registered user can login successfully` | `/account` URL and visible `My account` heading | Enabled customer; `TEST_USER_EMAIL` and `TEST_USER_PASSWORD`. D5 User Login AC2. Does not cover admin, disabled accounts or TOTP. |
| T-AUTH-002 | REQ-AUTH-002: Approved; minor documentation condition | `customer cannot sign in with an incorrect password` | Visible error with exact `Invalid email or password` text | Configured customer email and deliberate incorrect password. D5 User Login AC3. Does not assert absence of session; repeated failures can lock shared account. Still implemented and part of local regression; temporarily excluded from Release 2 automated CI because of shared backend account lock risk. CI inclusion requires safe account/test-data isolation and a known reset/unlock lifecycle. |
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

REQ-AUTH-005 is approved but has **no implemented automated test**. A future locking scenario needs explicit account isolation, verified counter semantics and reset/unlock lifecycle before implementation. It is not an eighth Release 1 test. API checks, additional discovery scenarios and new functional domains remain outside this release.
