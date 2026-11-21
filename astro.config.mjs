import { defineConfig } from 'astro/config';
import svelte from '@astrojs/svelte';
import { rmSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

// public/README.md documenta la carpeta para el estándar, pero no debe publicarse.
const sinReadme = {
  name: 'sin-readme-publico',
  hooks: {
    'astro:build:done': ({ dir }) => rmSync(fileURLToPath(new URL('README.md', dir)), { force: true }),
  },
};

// Astro usa sus carpetas por defecto: src/ (páginas y componentes), public/ (se copia tal cual a dist/) y dist/.
export default defineConfig({
  site: 'https://svn11x.github.io',
  base: '/tesis_explain',
  output: 'static',
  build: { format: 'file', assets: '_astro' },
  integrations: [svelte(), sinReadme],
  devToolbar: { enabled: false },
  // three.js pesa unos 700 kB minificado. Va en su propio fragmento y solo lo piden los visores 3D, así que el
  // aviso de Vite para fragmentos de más de 500 kB no aplica.
  vite: { server: { allowedHosts: ['terminal.local'] }, build: { chunkSizeWarningLimit: 760 } },
  server: { host: '0.0.0.0', port: Number(process.env.PORT || 4321) },
});
