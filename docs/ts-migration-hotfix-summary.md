# Hotfix — TypeScript lifecycle migration

## Objective

Migrate scripts/toolshop.cjs to typed TypeScript while preserving the existing controlled Toolshop commands and seven-test contract. Branch: ts-migration-hotfix, based on main b2525c5ddad5882ce87751ce27a31e2086c8460c (merged Release 4 PR #6). This is a hotfix, not Release 5. No merge is performed by the agent.

## Implementation

- Rename the lifecycle helper to scripts/toolshop.ts, use typed Node/dotenv/JSON imports and declare process, Compose, pin and API response types. Preserve control flow, readiness deadlines, Docker commands, project/resources, reset/seed and credential injection.
- Execute unchanged npm lifecycle command names with tsx; add TypeScript/tsx as exact development dependencies with package-lock.json. tsx executes TS but does not check types, so add strict tsconfig.json and npm run typecheck (tsc --noEmit) for scripts/tests/Page Objects/config. CI runs typecheck after npm ci.
- Remove the unused package main=index.js entry: this automation repository is not a published JS library and has no index.js entry point.
- No emitted JS, Linguist overrides or cosmetic language reclassification. Historical release records retain their original .cjs references as execution evidence.

Reference: [tsx official TypeScript guide](https://github.com/privatenumber/tsx/blob/4473971f4b3261de253209b148d8fdc43269fcc4/docs/typescript.md). Its indexed official passage confirms tsx requires separate type checking. Live tsx.is retrieval was unavailable; installed package execution, strict tsc and hosted CI must establish compatibility.

## Invariants

No changes to tests/assertions/Page Objects, Playwright failure diagnostics, SUT 2.5 tag/SHA/image digests/platforms, positive/negative accounts, one worker, zero retries or forbid-only. Preserve API/UI bounded readiness, scheduler exclusion, explicit reset/seed, teardown and artifact behavior. Existing workflow event filters/action/QEMU pins remain unchanged.

## Validation

Local validation on Windows/Node 22.21.0:

- `npm.cmd install --save-dev --save-exact typescript tsx`: TypeScript 7.0.2 and tsx 4.23.15 installed; lock updated, 0 audit vulnerabilities. `npm.cmd ci` then passed (11 packages installed, 12 audited, 0 vulnerabilities), proving the lock is installable.
- `npm.cmd run typecheck`: passed for helper, tests, Page Objects and Playwright config. Initial strict checking exposed the Node process error's optional code property; added an ErrnoException type assertion without changing runtime evaluation.
- `npm.cmd run sut:provision`: passed twice with unchanged seeded credential file; verified Toolshop 2.5 / SHA 9e7736c3841ec2bbb9a6822c9e6602353b7b9a65. No credential values printed.
- `npx.cmd playwright test --project=chromium --workers=1 --retries=0 --forbid-only --list`: all seven scenarios collected. actionlint 1.7.12 (`-shellcheck=`; local ShellCheck unavailable) and git diff --check passed.
- `node .sut/hotfix-parity.cjs`: passed. Ignored review scaffolding erased TS types and normalized both old/new helpers through esbuild, excluding only the explicit module-import adapters. Emitted runtime logic is identical; no lifecycle redesign. The first verifier attempted a removed legacy TypeScript compiler API; switching the ignored verifier to the installed esbuild transformer resolved that tooling issue. No shipped code change was needed.
- Functional tests, Page Objects, Playwright diagnostics config and environment/toolshop.lock.json have an empty diff against main.

Actual GitHub-hosted lifecycle/7-scenario validation is pending. Use existing workflow_dispatch against this branch before PR creation. No public deployment or public-host secrets are required.

## Risks and Review

Adds two development tools and their transitive dependencies; npm ci uses the committed lock. Runtime transpilation must not replace type checking. The pre-existing Docker/QEMU, registry, artifact retention and sensitive trace-data limitations remain. Review the rename/type diff, unchanged functional tests and SUT lock, strict typecheck, actual hosted 7/7, cleanup and HTML artifact. Unrelated output/ and tmp/ stay untracked.

## Status / Delivery

IN PROGRESS — VALIDATION REQUIRED. Commit/push the implementation to obtain hosted evidence, persist results, then open a PR against main when validated. Final delivery commit is recorded in Git history; PR is the authoritative URL/status record. Do not merge or start Release 5.
