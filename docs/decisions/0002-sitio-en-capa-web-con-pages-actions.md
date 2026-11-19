# 0002. The site moves into the web layout and is published with GitHub Actions

- Status: accepted
- Date: 2026-11-19
- Proposed by: AI tool, from the standard's web layout
- Accepted by: owner, on 2026-11-19, in the conversation that adopted the standard

## Context

Compiled output and source share the repository root, and GitHub Pages publishes from the root of `main`. The standard's web layout keeps source in its own folders.

## Decision

Move the site into the web layout and publish it with a GitHub Actions Pages workflow instead of the root of `main`. Public URLs stay identical.

## Alternatives considered

Keeping the root as is. It works, but mixes build output with source and blocks the standard's folder rules.

## Consequences

The tree gets cleaner and the build is the only thing that produces published files. The change is split into owner-reviewed pull requests described in `docs/improvement-plan.md`. To undo it, switch Pages back to publishing from the root of `main`.
