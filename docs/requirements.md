# Release 1 requirements baseline

This catalogue records leadership decisions for Release 1. Requirement status and evidence are separate: **existing automation proves what the framework currently validates; it does not automatically establish intended product behavior**. No new functional coverage is introduced.

## Status and evidence model

Requirement status: **Approved**, **Approved / implementation deferred**, **Requires confirmation**, **Proposed**, or **Deferred**. Approval is a leadership decision, not an inference from a passing test. Minor review conditions are recorded separately.

Evidence types: **Official/project-owned documentation**, **Application observation**, **Existing automation behavior**, **Existing repository evidence**, or **Proposed / requires confirmation**. Multiple evidence types may support one record. A passing execution confirms the assertions on that run, not the entire requirement or official intent.

## Sources

- **D0:** [Project-owned documentation](https://testsmith-io.github.io/practice-software-testing/) maps the public target to Sprint 5.
- **D5:** [Sprint 5 user stories](https://testsmith-io.github.io/practice-software-testing/user-stories/v5.md), reviewed in Phase 1. Section/AC references below identify the applicable criteria. This is a moving document; a source revision matching the deployment is not pinned.
- **A:** Existing automation behavior in [Authentication](../tests/login.spec.ts) and [Product Discovery](../tests/product-discovery.spec.ts).
- **R:** Existing repository evidence in [README](../README.md) and [configuration](../playwright.config.ts).
- **L:** Explicit Release 1 leadership review decisions supplied by Álvaro and the Automation workspace. These determine approval status; the earlier Phase 1 proposal alone does not approve requirements.
- **V:** [Release 1 validation](release-01-validation.md). Application observation is limited to the assertions reached and passed in that execution. Failed or unexecuted assertions do not provide current behavior confirmation.

## Authentication

| ID | Functional requirement / candidate | Requirement status | Evidence and review decision | Current coverage / unknowns |
| --- | --- | --- | --- | --- |
| REQ-AUTH-001 | A customer with valid credentials reaches their account. | Approved | L; D5 User Login AC2 (customer redirect to `/account`); A. | T-AUTH-001 checks URL and `My account` heading. Other roles and authentication variants are not covered. |
| REQ-AUTH-002 | Invalid credentials display an invalid-credentials error. | Approved | L: approved with minor documentation change; D5 User Login AC3; A. | T-AUTH-002 uses the configured customer email and deliberately incorrect password. Preserve behavior; document locking risk. A separate negative-test account is **not required in Release 1**. |
| REQ-AUTH-003 | Candidate: signing out returns the customer to a signed-out experience. | Requires confirmation | L; A; R. Official requirement confirmation remains pending. V can confirm only the currently exercised behavior. | T-AUTH-003 validates the visible `Sign in` link after logout. It does not verify session/token invalidation or subsequent protected access. |
| REQ-AUTH-004 | Candidate: an unauthenticated visitor opening `/account` is redirected to login. | Requires confirmation | L; A; R. Official requirement confirmation remains pending. V can confirm only the currently exercised behavior. | T-AUTH-004 checks login URL and button. UI route protection does not prove backend authorization. |
| REQ-AUTH-005 | Repeated invalid customer credentials trigger account locking and the documented HTTP 423 response on subsequent login. | Approved / implementation deferred | L; D5 User Login AC4 documents three consecutive incorrect attempts and subsequent lock response. | No implemented locking test. Future automation requires account isolation and confirmed lock-counter/reset/unlock lifecycle. Do not exercise the threshold intentionally in Release 1. |

Repeated invalid-login execution may mutate the shared customer's backend state, lock the account and contaminate successful login/logout tests. Retries or repeated runs can amplify this risk. Browser isolation does not reset backend counters. Release 1 recorded this risk without changing credentials, retries, workers or tests. Release 2's controlled lifecycle resets/seeds before execution and gives T-AUTH-002 a different seeded customer through `TEST_NEGATIVE_USER_EMAIL`; all seven scenarios remain implemented with unchanged functional assertions. Requirement approval statuses are unchanged.

## Product Discovery candidates

All three mappings are **Requires confirmation** pending leadership review. Available documentation supports aspects of the behavior but does not constitute approval. Preserve existing tests and IDs; do not change behavior to fit the catalogue.

| ID | Functional requirement / candidate | Requirement status | Evidence | Current coverage / review needed |
| --- | --- | --- | --- | --- |
| REQ-CATALOG-002 | A valid 3-40 character query returns matching products and resets active filters. | Requires confirmation | D5 Product Overview AC4; A; R. | T-CATALOG-001 covers a matching query. It does not assert all results match, length boundaries or filter reset. Leadership must review this broader documented requirement and partial coverage. |
| REQ-CATALOG-003 | A no-match search displays zero results and no product cards. | Requires confirmation | A; R. Exact no-match wording is not established by the cited D5 search criterion. | T-CATALOG-002 checks the exact `xxx` zero-result message and zero product names. Confirm intended empty-result behavior and wording; query depends on catalog data. |
| REQ-CATALOG-004 | Selecting a product opens details showing its product information. | Requires confirmation | D5 Product Overview AC2 and Product Detail AC1; A; R. | T-CATALOG-003 checks product URL, name and visible Add to cart button. Image, description, price, category and brand are not checked; visible button does not prove cart functionality. Leadership review remains pending. |

IDs retain the Phase 1 proposal's numbering; omitted catalogue IDs are outside this release. Product names and search data depend on the public deployment. No API contract or backend authorization requirement is established by these UI checks.
