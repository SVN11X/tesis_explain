import { cp, mkdir, readdir, rm } from 'node:fs/promises';
import { resolve } from 'node:path';
const root = resolve(import.meta.dirname, '..');
const target = resolve(root, 'web/public');
// Evita publicar chunks obsoletos de compilaciones anteriores.
await rm(resolve(root, 'build'), { recursive: true, force: true });
await rm(target, { recursive: true, force: true });
await mkdir(target, { recursive: true });
for (const directory of ['img', 'fuentes', 'css', 'js', 'datos', 'modelos']) {
  await cp(resolve(root, directory), resolve(target, directory), { recursive: true });
}
for (const file of await readdir(root)) {
  if (file.endsWith('.html') && !['index.html', 'laboratorios.html'].includes(file)) {
    await cp(resolve(root, file), resolve(target, file));
  }
}
console.log('Recursos y capítulos preparados para la nueva experiencia.');
