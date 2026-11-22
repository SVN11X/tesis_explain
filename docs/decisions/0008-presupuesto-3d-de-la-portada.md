# 0008. 3D budget of the home robot

- Status: proposed
- Date: 2026-11-22
- Proposed by: AI tool, from the home 3D polish item
- Accepted by: pending

## Context

The web profile with 3D as a core part asks for a written performance budget (frame time and model size). The site had none for the home robot. The home viewer loads three.js and `public/modelos/robot.glb` after the page loads (see 0007, "after load").

## Decision

1. Model size: `robot.glb` stays under 500 KB compressed (meshopt), today 478 KB and 39,219 triangles. This change adds no model and no texture.
2. Frame time: 60 fps target (16.7 ms) on a normal GPU. The viewer renders only when something changed, so a still robot costs no frames.
3. Rendering pauses when the viewer is off screen or the tab is hidden (`IntersectionObserver` and `visibilitychange` in `stage()`), and nothing spins with reduced motion.
4. The polish adds no light beyond the key and the rim light and no new texture. Materials are per part clones of the model's own, so ghosting one part does not change the others.
5. Measured with Playwright and software rendering (SwiftShader, no GPU), `requestAnimationFrame` deltas over 5 s at 1280x800 with the robot spinning: main 235 to 268 ms mean, this change 248 to 375 ms mean over repeated runs. The spread between runs is larger than the difference, so there is no measured regression, but real GPU numbers were not taken. With reduced motion both give 16.6 ms, because nothing renders.

## Alternatives considered

Adding a second rim light: it separated the silhouette a little more but cost about 10% more per frame under software rendering, so the existing rim light was strengthened instead.

## Consequences

A later change that adds lights, textures or a heavier model must update these numbers. To undo, mark this record superseded.
