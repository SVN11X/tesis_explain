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
  vite: { server: { allowedHosts: ['terminal.local'] } },
  server: { host: '0.0.0.0', port: Number(process.env.PORT || 4321) },
});
