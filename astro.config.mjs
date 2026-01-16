import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';
import vercel from '@astrojs/vercel';

// https://astro.build/config
export default defineConfig({
  site: 'https://camisetabox.cl',
  integrations: [
    react(),
    tailwind()
  ],
  output: 'hybrid',
  adapter: vercel()
});
