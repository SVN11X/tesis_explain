# 0004. AI correction of the oral-defense practice through a Cloudflare Worker, with Workers AI and D1

- Status: accepted
- Date: 2026-11-19
- Proposed by: AI tool, recording a decision already in the code
- Accepted by: recorded as accepted at the coordinator's request on 2026-11-19 because the choice is already implemented on main. Owner confirmation pending in pull request #27

## Context

The older decision "Sin inferencia en esta versión" in `docs/decisiones.md` ruled out AI. The oral-defense practice now gives feedback on free-text answers, while the Pages site runs nothing on the server side (`docs/defensa/README.md`, section 1).

## Decision

A Cloudflare Worker in `servicio/` receives each answer the student confirmed, with no audio, and asks Workers AI for three readings of it. A D1 database admits or rejects each request against daily quotas (`docs/defensa/README.md`, section 1).

- Free plan: the daily Workers AI allowance is 10,000 Neurons, the internal cap is 7,000 Neurons and 100 answers per UTC day, and there is a single production account (`docs/defensa/README.md`, section 4).
- Three-reading consensus: a comment is shown only if the three readings are valid and agree on the verdict and on each criterion. Otherwise the system abstains with `no_evaluable` and `disagreement`, and a technical failure never becomes `incorrecta` (`docs/defensa/README.md`, section 1).
- Human-approved rubric: the AI stays off for a question until a person approves its rubric in `datos/defensa/rubricas.json` (`docs/defensa/README.md`, sections 1 and 6).
- No student text stored: the Worker keeps codes, not answers, plus an HMAC to detect duplicates. Results are purged after 30 minutes and reservation records after 48 hours (`docs/defensa/README.md`, section 3). The API never returns the student's answer (`docs/defensa/especificacion.md`, section 6.3).

## Alternatives considered

No inference, the previous decision. It could not give feedback on free text. A second free account for more capacity: it adds none for the same application, and the Cloudflare agreement forbids it without written permission (`docs/defensa/README.md`, section 4).

## Consequences

Students can practice with feedback at no cost, within about 85 answers per day (`docs/defensa/README.md`, section 4). The owner must create the D1 database and the Worker and load the secrets, which the repository never holds (`docs/defensa/especificacion.md`, section 10). The approval of `p-oe3-parcial` was delegated and not reviewed by a human criterion by criterion (`docs/defensa/README.md`, section 6). To undo it, set `ADMISION` to `cerrada` so the panel offers only the guide (`docs/defensa/especificacion.md`, section 6.2).
