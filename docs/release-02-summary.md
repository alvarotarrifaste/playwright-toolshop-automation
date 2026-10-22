# Release 2 — Controlled Toolshop Environment

## 1. Release Objective

Insert a stability prerequisite between the merged Release 1 traceability baseline and Release 3 GitHub Actions. Retain Toolshop and make an externally provisioned, pinned local deployment the reference execution target. Preserve all seven functional scenarios and their assertions; introduce no new product coverage.

## 2. Problem Statement

The public deployment has uncontrolled accounts, catalog and backend failure counters. Release 1 demonstrated account-lock contamination. In the earlier CI proposal, valid credential injection still led to failed login/logout checks because the captured page showed Cloudflare security verification instead of the account UI. Public-host success is not evidence for this release.

Earlier proposal: [PR #3](https://github.com/alvarotarrifaste/playwright-toolshop-automation/pull/3), still open and unmerged when this branch began. The new branch starts from merged Release 1 on `main`; it does not inherit that workflow or the six-test CI selection. No antibot bypass is introduced. GitHub Actions moves to Release 3.

## 3. Architecture Decision

[ADR-002](adr-002-controlled-toolshop.md) proposes an official Dockerized Toolshop environment with prebuilt images, immutable dependency references, explicit database reset and injected automation configuration. This preserves existing automation and requirement work while addressing environment ownership. Continuing the public target leaves the problem intact; bypassing Cloudflare is outside scope; changing applications introduces unnecessary migration work.

## 4. SUT Version

- Official external repository: [testsmith-io/practice-software-testing](https://github.com/testsmith-io/practice-software-testing).
- Selected stable release: [tag `2.5`](https://github.com/testsmith-io/practice-software-testing/releases/tag/2.5).
- Exact commit: `9e7736c3841ec2bbb9a6822c9e6602353b7b9a65`, verified in the local detached checkout.
- Source: ignored `.sut/upstream/`, provisioned from the tag and checked against the exact SHA and official origin. A moved tag or dirty checkout fails verification.
- Official deployment inspected: pinned `README.md`, `docker-compose.prod.yml`, Sprint 5 seeders/migrations and frontend environment configuration.
- UI/API: official `2.5` image tags resolved to immutable digests. Gateway: official production image has only a moving tag, resolved once to an immutable digest. Database: official Compose's MariaDB `10.6.11`, also resolved to digest. No moving tag is used by runtime provisioning.
- All four digests, default platform `linux/amd64` and gateway override `linux/arm64` are committed in [environment/toolshop.lock.json](../environment/toolshop.lock.json). UI/API image creation metadata matches the release date. Runtime compatibility was verified below, including gateway emulation.

No upstream application source, seeders, passwords or generated Compose file are redistributed in this repository. The external checkout is not staged. Only orchestration, pins, automation integration and documentation belong here.

## 5. Environment Architecture

| Service | Purpose | Local exposure |
| --- | --- | --- |
| `angular-ui` | Official Sprint 5 Angular UI | `http://localhost:4200`, loopback only |
| `laravel-api` | Official Sprint 5 Laravel application/PHP-FPM | Docker network only |
| `web` | Official gateway to Laravel | `http://localhost:8091`, loopback only |
| `mariadb` | Controlled database | Docker network only |

The Node helper normalizes the pinned official production Compose using Docker Compose v2 or newer, keeps these four services, substitutes digest pins, fixes each service platform, and scopes resources to `toolshop-controlled`. It omits cron, mail, phpMyAdmin and host database exposure. Generated configuration lives in ignored `.sut/compose.json` and contains upstream local defaults; it is not printed.

| Command | Contract |
| --- | --- |
| `npm run sut:provision` | Fetch/verify pinned external SUT and initialize ignored local test environment variables |
| `npm run sut:up` | Provision if needed, generate minimal Compose, pull fixed images, start services, check API/UI readiness |
| `npm run sut:ready` | Check required services running, API `/status` JSON and frontend app shell |
| `npm run sut:reset` | Wait for database, reset/migrate/seed, clear cache and verify API/UI/catalog |
| `npm run test:controlled` | Validate injected accounts, check readiness, reset/seed, run all seven Chromium tests |
| `npm run sut:down` | Remove controlled containers, network and volumes; retain checkout/images/local variables |

Readiness uses polling with request timeouts and bounded deadlines, not a fixed startup sleep. API/UI each have a 180-second readiness window; database availability has 120 seconds. Image pull has a 10-minute command limit. Setup/reset failure exits nonzero before test execution and supplies service status plus a focused logs command. Raw logs/config are not dumped automatically because they may contain test data.

One `.sut/operation.lock` directory serializes lifecycle operations. After forced interruption, remove that empty directory only after confirming no operation is active. This lock cannot coordinate direct browser use or independently launched Playwright commands.

## 6. Data Lifecycle

The supported reset is `php artisan migrate:fresh --seed --force` inside the controlled `laravel-api` service, followed by `cache:clear`. `config:clear` precedes migration. The pinned official seeder restores users, brands, categories, images, products/specifications, favorites, invoices/items and payments. The users migration initializes failed-login counters to zero. IDs/timestamps can change; the automation depends on known names/roles rather than stable IDs.

`test:controlled` always resets before executing tests. `sut:up` does not implicitly claim data has been seeded; explicit `sut:reset` is available for manual use. Positive login/logout use the first seeded customer; T-AUTH-002 uses the second, preventing its deliberate incorrect password from altering the positive customer's counter. The test rejects an absent negative email or equal positive/negative identities. The existing fixed incorrect password and both error assertions remain unchanged.

Provisioning reads public seeded defaults from the pinned external seeder into ignored `.env.controlled`, with restrictive file mode where supported, without printing their values. It preserves an existing file. Credentials remain environment-injected: `TEST_USER_EMAIL`, `TEST_USER_PASSWORD`, `TEST_NEGATIVE_USER_EMAIL`; inherited process environment takes precedence. Do not set stale public-host credentials when executing the controlled command. No working credentials are committed in templates or documentation.

## 7. Playwright Integration

`playwright.config.ts` reads `BASE_URL`, defaulting to `http://localhost:4200`. Relative Page Object navigation remains unchanged; no duplicate configurations or environment-specific Page Objects are added. The controlled command explicitly forces that local UI endpoint and supplies controlled credential variables, so the ignored legacy `.env` cannot replace them. Direct/manual commands still load `.env` without overriding externally injected values.

The controlled contract is all seven Chromium tests, one worker, zero retries and focused tests forbidden. It excludes no risk-tagged scenarios. Authentication-only repeat validation is available as `npm run test:controlled -- tests/login.spec.ts`, and also resets first. Existing HTML reporting/ignored artifacts remain unchanged. No GitHub Actions workflow is introduced here.

## 8. Files Changed

| File | Purpose |
| --- | --- |
| `.gitignore` | Exclude external SUT checkout/generated state and `.env.controlled` |
| `.env.example` | Placeholder target and separate negative-email variable, without credentials |
| `environment/toolshop.lock.json` | Official tag/SHA, platform and four immutable image references |
| `scripts/toolshop.cjs` | Small cross-platform provisioning/start/readiness/reset/test/teardown lifecycle |
| `package.json` | Expose the lifecycle commands through npm |
| `playwright.config.ts` | Environment-configurable controlled default target |
| `tests/login.spec.ts` | Separate negative customer's environment injection/identity guard; functional assertions unchanged |
| `README.md` | Prerequisites, endpoints, commands, variables and release scope |
| `docs/requirements.md` | Record data-isolation mitigation without changing requirement approval status |
| `docs/test-catalogue.md` | Preserve seven-test traceability and record new data lifecycle |
| `docs/adr-002-controlled-toolshop.md` | Focused architecture decision |
| `docs/release-02-summary.md` | Persistent release record and validation evidence |

Dependency lockfile, Page Objects and Product Discovery test implementation are unchanged. Unrelated untracked `output/` and `tmp/` directories remain outside the release.

## 9. Validation Evidence

Evidence recorded on 2026-10-22 on Windows, Node 22.21.0. Use `.cmd` alternatives for npm/npx on PowerShell where necessary.

| Command / inspection | Observed result |
| --- | --- |
| `git status --short --branch`; PR #3 inspection | Earlier CI branch clean in tracked files; PR open/unmerged; unrelated output/tmp preserved |
| `git checkout main`; `git pull --ff-only origin main` | Main current at `4f8dbb1` |
| `git checkout -b release/02-controlled-toolshop-environment` | New branch created from main, independent of old CI proposal |
| Official release/docs and local checkout inspection | Release tag/SHA, production services, local URLs, reset mechanism and separate seeded customers verified |
| Docker registry manifest inspection (initial static work) | Digests obtained; the initial claim that all images support AMD64 was incorrect. Runtime inspection below corrects gateway architecture |
| `node --check scripts/toolshop.cjs` | Passed |
| `npm run sut:provision` | Passed; verified exact commit and generated ignored credential file without logging values |
| Repeated `npm run sut:provision` | Passed; existing checkout verified and local credential file preserved |
| `npx playwright test --project=chromium --list` | All seven existing scenarios collected; collection is not runtime validation |
| `npm run sut:up` | Failed early with clear prerequisite error: Docker Engine/Compose not installed/running |
| `docker version`; standard Docker Desktop paths; `wsl --status` | Docker command absent, standard installation paths absent, WSL reports not installed |
| `git check-ignore` for external checkout, generated Compose and controlled variable file | All ignored |
| Proposed source/documentation scan against generated credential values | Passed; required local variables present, customer identities distinct, no values included in proposed files |
| Controlled-command missing-Docker guard | Verified exit code 1 before any Playwright execution |
| `git diff --check` and functional diff review | Passed; only negative data injection/guard and target configuration changed; assertions preserved |

### Controlled runtime validation — 2026-10-22

The earlier missing-Docker evidence above is historical. Sandbox isolation initially hid the installed Docker executable and denied WSL inspection. The same validation was rerun outside the sandbox; no reinstall was needed.

| Command / inspection | Observed result |
| --- | --- |
| `docker version`; `docker compose version`; context in version output | Desktop 4.96.3 (244472), client/engine 29.9.2, Compose v5.6.1, context desktop-linux, server linux/amd64; Node v22.21.0 |
| `git -C .sut/upstream describe --tags --exact-match`; `rev-parse HEAD` | Tag 2.5, SHA 9e7736c3841ec2bbb9a6822c9e6602353b7b9a65; helper also verified clean checkout and official origin |
| `npm.cmd run sut:up` (first runtime attempt) | All four locked digests pulled; startup failed because pinned web image is ARM64, contrary to initial static platform claim |
| `docker image inspect <each locked reference> --format '{{.Os}}/{{.Architecture}}'`; `docker manifest inspect <locked web reference>`; `docker buildx imagetools inspect testsmith/practice-software-testing-web:latest` | API/UI/MariaDB linux/amd64; web linux/arm64, single manifest; latest resolves to the same selected digest. No selected digest/tag/SHA changed |
| Minimal compatibility correction | Added lock servicePlatforms.web=linux/arm64 and helper lookup with default linux/amd64; preserved architecture and all functional tests. Gateway process runs through /usr/bin/qemu-aarch64 |
| `npm.cmd run sut:up`; `npm.cmd run sut:ready` | Exit 0; API ready and Frontend ready. Four services running; UI 127.0.0.1:4200 and gateway 127.0.0.1:8091; DB/API have no host publication |
| `npm.cmd run sut:reset` | Exit 0: Database ready; config clear, migrate:fresh --seed --force, cache clear completed; API, frontend and seeded catalog ready |
| `docker compose -p toolshop-controlled -f .sut/compose.json top`; `... ps --all` | Exactly angular-ui, laravel-api, mariadb and web. Only Angular/esbuild, PHP-FPM, mysqld and nginx/QEMU processes; no cron, schedule:run or schedule:work runner |
| `... exec -T laravel-api php artisan schedule:list` | Only invoice:generate, queue:work --stop-when-empty and order:update registered. No hourly migrate:fresh, invoice:remove or cache:clear |
| Read-only Laravel bootstrap/DB verification via `node .sut/verify-seed.cjs` (ignored local verifier) | APP_ENV=local. Distinct positive/negative injected accounts both role=user, enabled, failed_login_attempts=0; injected positive password hash verified without printing values |
| Seed table queries | users=4, brands=2, categories=19, products=53, product_images=53, favorites=3, invoices=200, invoice_items=657, payments=200. Required exact product names Pliers and Combination Pliers present. Invoice-item count is observed random seed output, not a fixed contract |
| `npm.cmd run test:controlled` — first full execution | Exit 0; 7 passed (14.9s), zero failures/skips/retries; one Chromium worker, --forbid-only. Controlled helper independently reset/seeded before launch |

Readiness evidence is condition-based: required service names must be running; API GET /status must return successful JSON with string version; UI GET / must contain app-root; DB mysqladmin ping must succeed; GET /products must return nonempty data. Polling uses two-second intervals, three-second HTTP timeouts and bounded deadlines (180 seconds API/UI/catalog, 120 seconds DB), not arbitrary startup sleeps.

Scheduler evidence is layered: the upstream Kernel schedules hourly destructive commands only outside local and for production; runtime APP_ENV is local; schedule:list excludes them; the production cron service is omitted and no scheduler runner exists in the four containers. It is therefore not active in this controlled environment. Manual explicit reset remains automation-owned.

The ignored verifier bootstrapped Laravel's Console Kernel and used DB::table to count the listed tables and locate the required products. It selected the two emails from ignored .env.controlled, checked distinct identities, role, enabled state and zero failure counters, and used Hash::check for the positive password. It printed only labels/counts, never account values. The local verifier is execution scaffolding, not a new supported lifecycle command.

| Repeatability / cleanup command | Observed result |
| --- | --- |
| `npm.cmd run sut:down`; `npm.cmd run sut:up` | Both exit 0. First environment containers/network/volumes removed; pinned checkout/images retained. Fresh-volume startup again reported API ready and Frontend ready |
| `npm.cmd run sut:reset`; `node .sut/verify-seed.cjs` | Both exit 0. Same seeded table counts and required products as above; distinct enabled positive/negative users again had zero failed-login counters, positive password verified, APP_ENV=local |
| `npm.cmd run test:controlled` — second full execution | Exit 0; 7 passed (10.6s), zero failures/skips/retries; all four Authentication and all three Product Discovery scenarios. Helper performed another reset before launch |
| Final `npm.cmd run sut:down` | Exit 0; controlled containers, network and volumes removed |
| `docker ps -a --filter label=com.docker.compose.project=toolshop-controlled --format '{{.Names}}'`; equivalent `docker network ls` / `docker volume ls` label filters | All returned empty output, exit 0; no controlled runtime resources remain. Cached images, external checkout and ignored local configuration retained intentionally |
| `node --check scripts/toolshop.cjs`; `git diff --check`; final functional diff inspection | Passed; seven existing tests and assertions retained, no Page Object changes, no workflow, no upstream application source or generated credentials staged |
| `git diff --cached --check`; `git diff --cached --stat`; `node .sut/review-staged.cjs` | Passed. Exactly 12 intended release files staged; controlled credential-value scan clean; extracted Authentication expectation statements identical to HEAD; Product Discovery and Page Objects unchanged. Unrelated output/tmp remain untracked |

Both complete runs passed without assertion changes or altered functional expectations. The observed seed/runtime behavior satisfies Release 2 validation. Non-fatal upstream PHP FFI duplicate-module and Playwright color-environment warnings appeared; neither affected command exit status or test results.

## 10. Known Risks / Limitations

- Initial image download/startup cost and CPU/memory requirements; dependent on upstream Git/registry availability.
- Ports 4200/8091 must be available. Use Linux containers. The pinned ARM64 gateway requires emulation on AMD64; Docker Desktop QEMU was observed. Other hosts must provide equivalent support; API/UI/database AMD64 may need emulation on ARM.
- Digest pins are immutable but require deliberate upgrades. Compatibility was proven on this Docker Desktop host; gateway emulation adds portability/performance risk.
- Reset deletes the controlled database's state; do not overlap manual/direct execution with lifecycle resets. Different customers prevent positive/negative counter sharing but do not isolate arbitrary concurrent workflows.
- Existing generated credentials can become stale if changed manually. The generated file is ignored; inherited environment variables can override it.
- Application logs/reports may contain test data; review before sharing. No richer failure-diagnostics layer is introduced.
- Aborted lifecycle operations can leave a local operation lock requiring explicit inspection/removal.
- GitHub Actions is deferred to Release 3; this branch intentionally contains no workflow. The older PR remains unmerged pending leadership disposition.

## 11. Git / PR Information

- Repository: `alvarotarrifaste/playwright-toolshop-automation`.
- Base: merged Release 1 on `main`, commit `4f8dbb1`.
- Branch: `release/02-controlled-toolshop-environment`.
- Delivery commit: the commit containing this Release Package on the release branch; see Git history for its immutable SHA.
- Delivery PR: to be opened against `main` after committing/pushing this validated package; the PR is the authoritative URL/status record. Earlier PR #3 is not this release's delivery. Execution stops immediately after PR creation, so no post-creation documentation commit is planned.
- No merge or Release 3 work is authorized.

## 12. Reviewer Guide

1. Verify the branch starts at main and adds no GitHub Actions workflow or vendored application source.
2. Inspect the official tag/SHA and image digests, including the explicit gateway-tag limitation.
3. Review Node lifecycle, resource scope, localhost ports, bounded readiness and failure exit behavior.
4. Confirm reset runs inside the controlled project and restores the pinned seeds/cache before tests.
5. Inspect the separate-customer convention and unchanged authentication assertions; confirm no credential values are committed.
6. Review configurable target, same Page Objects and seven-test selection.
7. Require controlled Docker evidence for first pass, cleanup and repeated reset/execution before approval. Review the observed runtime results and gateway platform correction in section 9.
8. Inspect README commands, this persistent record and ADR consequences. Álvaro plus the Automation workspace own merge approval and post-merge release closure.

## 13. Interview Defense

- **Why stop using the public environment for CI?** It presents Cloudflare verification to hosted runners and exposes shared state/data outside the automation project's control.
- **Why self-host Toolshop instead of migrate?** The application officially supports Docker; retaining it preserves established tests, Page Objects and traceability.
- **Why pin the version?** A known commit plus immutable image digests prevents upstream changes from silently altering the tested system.
- **Why is database seeding part of automation architecture?** Test preconditions include server-side account state and catalog data; reproducible assertions require a known starting state.
- **Why is browser isolation insufficient?** Browser contexts do not reset persisted failed-login counters, shared customers or database records.
- **Why configurable baseURL?** The same Page Objects and assertions can exercise the controlled reference deployment without hardcoded public-host navigation.
- **What tradeoffs do ephemeral containers introduce?** More setup/runtime resources and image maintenance in exchange for deterministic reset, data control and reproducible local/future-CI execution.
- **What proves success?** Seven unchanged scenarios pass against the controlled Docker target, then teardown/start/reset/re-execution demonstrates repeatability. A provision-only or public-host pass is insufficient.

## 14. Release Status

`VALIDATED — RELEASE 2 DEFINITION OF DONE SATISFIED; DELIVERY VIA OPEN PR`

Controlled readiness, scheduler exclusion, explicit reset/seed, distinct authentication accounts, first 7/7, fresh-volume repeat 7/7 and cleanup are verified. Final source/credential review passed. This package is eligible for commit/push/open PR; `READY FOR HUMAN REVIEW` applies once push and PR creation succeed. No remaining runtime blocker on this host. Gateway ARM64 emulation is the principal portability risk. Release 2 is not CLOSED: human merge and post-merge validation remain outside this execution. No Release 3 work was started.
