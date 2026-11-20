# 0006. A drawn robot accompanies the search without results

- Status: accepted
- Date: 2026-11-19
- Proposed by: AI tool, from the improvement plan item on playful states
- Accepted by: owner, through the States section of `DESIGN.md`, 2026-11-19

## Context

`DESIGN.md` (States, Personality) asks every state to say what happened and the next action, and allows a drawn character as the example of a playful state. The search dialog showed only the plain line «Sin resultados para ...». The site already has one robot: the U-shaped body with the curve forward and the LiDAR on the curve, drawn in `js/comun.js` (`U.robot`) and `img/icono.svg`.

## Decision

1. When a search finds nothing, the dialog shows a small inline SVG of that same robot seen from above, with its scan arc, next to the message «No encontré nada con ...», the suggested searches and a link to the guide index.
2. The illustration is decorative: `aria-hidden`, no information that the text does not already give. The message stays in the existing live region (`role="status"`).
3. The arc sweeps three times (3.9 s in total) and stops. The motion has one purpose: it shows that the robot looked and found nothing. With reduced motion it does not move.
4. No second robot is invented. The geometry is copied from `img/icono.svg`. Colors use the frame variables, so both themes keep their contrast.

## Alternatives considered

Text only, as before. Not enough: it said what happened but gave no next action beyond the glossary. A looping animation or a 3D robot. Rejected: it would run longer than 5 s and add weight for a state the user leaves quickly.

## Consequences

The empty state is friendlier and points to the next step. `herramientas/pruebas_robustez_navegador.py` checks the robot, the message, the still state with reduced motion and the focus. The inventory in record 0005 has a new row. To undo it, remove `sinResultados` in `js/marco.js` and the `.robot-busca` rules in `css/marco.css`.
