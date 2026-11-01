import { cp, rm, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
const root = resolve(import.meta.dirname, '..');
// Solo se sustituyen salidas propiedad de este generador. El resto del sitio se conserva.
for (const file of ['index.html', 'laboratorios.html']) {
  await cp(resolve(root, 'build', file), resolve(root, file));
}
await rm(resolve(root, '_astro'), { recursive: true, force: true });
await cp(resolve(root, 'build/_astro'), resolve(root, '_astro'), { recursive: true });
await writeFile(resolve(root, '.nojekyll'), '');
console.log('Portada, laboratorios y recursos compilados en la raíz: listos para GitHub Pages.');
