# ADR-002: Use a controlled Dockerized Toolshop test environment

Status: Proposed for Release 2; implementation and controlled validation must be reviewed by Álvaro and the Automation workspace before human merge.

## Context

The public deployment presents Cloudflare security verification to GitHub-hosted execution. Its customer accounts, backend lock counters and catalog are outside this repository's control. Local passing tests cannot establish reproducible CI behavior against that shared environment. The portfolio needs an execution lifecycle that can restore known state.

## Decision

Retain Toolshop and provision the official external repository at release tag `2.5`, exact commit `9e7736c3841ec2bbb9a6822c9e6602353b7b9a65`. Use its production Compose/prebuilt-image approach, normalized into an ignored local Compose file containing only UI, API, web gateway and MariaDB. The automation lock fixes UI/API release `2.5` images and the official web/database images by digest; runtime never resolves moving tags. The official web image has no release-specific tag, so its exact digest is the smallest justified pin.

Use cross-platform Node lifecycle commands, bounded readiness, explicit `migrate:fresh --seed --force` reset and cache clearing. Give positive and negative authentication different seeded customers and reset before every controlled suite. Inject credentials through environment variables from an ignored generated file. Make Playwright `BASE_URL` configurable with controlled localhost as the default. Keep the existing Page Objects and all seven functional assertions.

The public deployment is retained only for exploratory/manual comparison. GitHub Actions moves to Release 3; no CI workflow is introduced by this branch. Do not merge the earlier CI proposal as a prerequisite.

## Alternatives considered

- Continue public-host execution: lowest setup cost, but account/catalog drift and antibot behavior remain uncontrolled.
- Work around Cloudflare: does not establish an authorized, deterministic data lifecycle and is outside scope.
- Migrate applications: discards established scenario/requirement work while introducing another application's unknowns; unnecessary because Toolshop officially supports local deployment.
- Rebuild the application: upstream provides release images, so a source build is unnecessary unless concrete runtime incompatibility is demonstrated.

## Consequences

Docker adds a local prerequisite, image-download/startup cost and ports/resource management. Digest pins require explicit maintenance and registry availability. API/UI/database use `linux/amd64`; the selected official gateway digest is `linux/arm64`, explicitly overridden per service and run under Docker Desktop QEMU emulation on this AMD64 host. Other Docker hosts need equivalent emulation support. The upstream checkout remains external and ignored; this repository redistributes no application source.

Benefits are controlled data lifecycle, isolated authentication customers, stronger UI/API reproducibility and a defensible portfolio architecture. Seeded IDs/timestamps can vary; tests depend on known names/roles and state rather than fixed IDs. Browser contexts alone do not reset backend counters. Concurrent manual/direct executions still require coordination with database resets. Controlled runtime validation is required before claiming this decision solves the observed failures.
