# ADR-001: Preserve the current automation baseline

Status: Accepted for Release 1 by the supplied leadership scope; PR acceptance and merge remain subject to Álvaro's human review.

## Context

Seven Playwright UI tests already use three Page Objects and test-owned assertions. Release 1 establishes traceability without changing functional behavior. There is no demonstrated implementation problem requiring a new abstraction in this increment.

## Decision

- Preserve Playwright + TypeScript and Chromium-only execution.
- Keep page locators and actions/interactions in the current Page Objects.
- Keep business expectations and assertions in tests.
- Preserve independent scenarios using Playwright's built-in isolated page/context; no test-order dependency is introduced.
- Preserve current role/label/placeholder/text and intentional `data-test` locator strategy.
- Preserve environment-variable credentials, ignored `.env`, placeholder `.env.example` and external-variable precedence.
- Preserve runner configuration, retries, worker settings and reporting.

This is a preservation decision, not a claim that architecture is final or that browser isolation guarantees backend data isolation.

## Alternatives and consequences

A base page, custom fixtures, shared authentication state, components, API clients, utilities or factories would add design and review cost without solving a concrete Release 1 problem. They are deferred, as are architecture refactors and CI pipelines. Direct Page Object construction remains sufficient.

Benefits: a small reviewable documentation diff, stable behavior and explicit requirement/coverage gaps. Limitations remain visible: shared account state, repeated credential checks, public catalog data and incomplete assertions. Documentation does not resolve these risks.

Revisit when a later approved slice demonstrates repeated resource setup/cleanup, shared substantial UI behavior, backend validation needs or environment variability. Each new abstraction must identify the problem and be independently reviewable.

## Ownership and review gate

SDTE implements the increment and supplies execution evidence. Álvaro and the Automation workspace own requirement/design review and release readiness. The PR must stay open and unmerged until human authorization; Release 2 is not started here.
