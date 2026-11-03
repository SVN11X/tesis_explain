import { defineConfig } from 'astro/config';
import svelte from '@astrojs/svelte';

export default defineConfig({
  site: 'https://svn11x.github.io',
  base: '/tesis_explain',
  srcDir: './web/src',
  publicDir: './web/public',
  outDir: './build',
  output: 'static',
  build: { format: 'file', assets: '_astro' },
  integrations: [svelte()],
  devToolbar: { enabled: false },
  // three.js pesa unos 700 kB minificado. Va en su propio fragmento y solo lo piden los visores 3D, así que el
  // aviso de Vite para fragmentos de más de 500 kB no aplica.
  vite: { server: { allowedHosts: ['terminal.local'] }, build: { chunkSizeWarningLimit: 760 } },
  server: { host: '0.0.0.0', port: Number(process.env.PORT || 4321) },
});
