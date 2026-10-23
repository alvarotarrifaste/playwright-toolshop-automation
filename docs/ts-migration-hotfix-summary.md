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

Hosted validation: [run 40003584031](https://github.com/alvarotarrifaste/playwright-toolshop-automation/actions/runs/40003584031), [job 120585708333](https://github.com/alvarotarrifaste/playwright-toolshop-automation/actions/runs/40003584031/job/120585708333), workflow_dispatch attempt 1, implementation SHA 85b7375ae3c43c8ed3bba28b5902192fddfc6842, 2026-10-23 18:28–18:30 UTC. Run/job **success**. Ubuntu 24.04 AMD64, runner image 20261012.334.1, Node 22.23.3. No temporary workflow trigger or test failure was needed.

Every setup/lifecycle step succeeded, including the new strict TypeScript check. Logs explicitly execute `tsx scripts/toolshop.ts provision`, `up`, `ready`, `test` and `down`. Toolshop tag/SHA verification and pinned ARM64 gateway execution/scheduler exclusion passed. API ready at 18:29:57, frontend at 18:30:07; separate ready check passed. At 18:30:13, database reset/seed/cache clear completed and seeded catalog readiness passed. Test output: `Running 7 tests using 1 worker`, **7 passed (9.3s)**, zero retries. Controlled localhost target/account injection was preserved; no public deployment/secrets used.

At 18:30:25–26, TypeScript teardown removed containers/network/volumes and all three project-label empty-list assertions passed. HTML upload succeeded; failure-only diagnostic upload was skipped as expected. The workflow's existing failure evidence behavior remains unchanged from Release 4.

Verified [playwright-report artifact 12523676067](https://github.com/alvarotarrifaste/playwright-toolshop-automation/actions/runs/40003584031/artifacts/12523676067): 198,655 ZIP bytes, SHA256 2369e116c6d97e9911bf9b3583d960da8067508146e7b1608764ed5ba2cb8a0b, created 2026-10-23T18:30:26Z, expires 2026-11-06T18:30:26Z. Downloaded hash matches GitHub. Reused ignored artifact inspector: `python .sut/inspect-r4.py hotfix .sut/hotfix-report.zip`; embedded report confirms total=7/expected=7/unexpected=0/flaky=0/skipped=0, actualWorkers=1, exactly one result and retry=0 for every test, no failure attachments. ZIP contains only index.html.

Final checks: `node .sut/hotfix-review.cjs` passed, confirming original dependency versions/resolved URLs/integrities are unchanged, tests/Page Objects/diagnostics/SUT pins have no diff, the workflow only adds typecheck, credential-value scan is clean and no tracked .js/.cjs/.mjs project files remain. `node .sut/hotfix-parity.cjs`, actionlint and git diff --check passed again. Final review identifies the helper rename plus six related configuration/documentation/lock files; historical release evidence is untouched. The final evidence commit changes only this document after the tested implementation.

## Risks and Review

Adds two development tools and their transitive dependencies; npm ci uses the committed lock. Runtime transpilation must not replace type checking. The pre-existing Docker/QEMU, registry, artifact retention and sensitive trace-data limitations remain. Review the rename/type diff, unchanged functional tests and SUT lock, strict typecheck, actual hosted 7/7, cleanup and HTML artifact. Unrelated output/ and tmp/ stay untracked.

## Status / Delivery

VALIDATED — READY FOR HOTFIX PR DELIVERY. Local reproducible installation/typecheck/provisioning/runtime parity and actual hosted lifecycle/7/7/cleanup/HTML artifact are verified. Implementation commit: 85b7375ae3c43c8ed3bba28b5902192fddfc6842; final evidence commit is recorded in Git history. Ready for human review once this evidence is committed/pushed and the PR against main is opened. PR is the authoritative URL/status record; stop after creation. No remaining blocker on the validated Windows/Linux paths. GitHub's default-branch language summary changes only after the hotfix is merged and GitHub refreshes it; no Linguist override is introduced. Do not merge or start Release 5.
