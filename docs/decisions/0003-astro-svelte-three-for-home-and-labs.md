# 0003. Astro, Svelte and Three.js for the home page and the laboratorios, with the guide pages kept as static HTML

- Status: proposed
- Date: 2026-11-19
- Proposed by: AI tool, recording a decision already in the code
- Accepted by: pending. Write who accepted it and where when the status becomes accepted

## Context

The older decision "Conservar HTML/CSS/JS nativos" in `docs/decisiones.md` kept the site in plain HTML, CSS and JavaScript. The home page and `laboratorios.html` now show a three-dimensional robot with turn and exploded view, and a LiDAR laboratory with synchronized 3D scenes and a 2D map (`README.md`, line 35).

## Decision

The home page and `laboratorios.html` use Astro, Svelte, TypeScript, Three.js and GSAP, with the source in `web/src/` (`README.md`, line 35 and the folder tree, line 139; `docs/experiencia-v1.md`, file table). The guide pages stay static HTML. The generated `index.html`, `laboratorios.html` and `_astro/` are never edited by hand (`README.md`, line 44). Dependencies are pinned with `package-lock.json`, fonts are served locally, and the laboratory hydrates when it nears the screen (`docs/experiencia-v1.md`, line 83).

## Alternatives considered

Keeping native HTML, CSS and JavaScript everywhere. It was enough for the 2D guide, but not for the 3D scenes of the home page. The guide itself did not move: its LiDAR 3D view is drawn by hand on a canvas to avoid loading Three.js there (`docs/decisiones.md`, row "Vista 3D del LiDAR dibujada a mano").

## Consequences

The home page gets interactive 3D at the cost of a framework and a compile step, and the compiled files must match the sources (`README.md`, line 59). Astro and Three.js are MIT, while GSAP has its own no-charge license and must not be presented as MIT (`docs/experiencia-v1.md`, line 139). The guide keeps working without a build for its content. To undo it, rebuild the home page and the laboratorios as static HTML and drop the dependencies.
