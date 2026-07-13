// @ts-check

import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import { defineConfig } from 'astro/config';


// NOTE: Tu versión de Astro no expone fontProviders en astro/config.
// Para evitar que falle la config SSR, desactivamos el bloque fonts aquí.

import tailwind from '@astrojs/tailwind';

// https://astro.build/config
export default defineConfig({
  site: 'https://www.nextgenmakers.com',
  output: 'static',
integrations: [tailwind(), mdx()],
	// Temporariamente desactivamos sitemap durante el refactor para evitar errores por metadata/paths.
	// Se reactivará cuando el sitio esté estable.




});
