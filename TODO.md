# TODO - Refactor “Next-Gen Makers” (Astro + Tailwind)

## Paso 1 — UI base
- [x] Actualizar `src/styles/global.css` para alinearlo con ultra-dark y evitar estilos heredados de Bear Blog que pelean con Tailwind.


## Paso 2 — Shell del producto
- [x] Reemplazar `src/components/Header.astro` por versión premium sticky con blur al scrollear + CTA.

- [x] Reemplazar `src/components/Footer.astro` por footer multi-columna black + border + enlaces legales dummy.



## Paso 3 — Homepage nivel empresa
- [ ] Rehacer completamente `src/pages/index.astro` con estructura tipo SaaS/empresa (Hero + Social proof + Problem/Solution + Category Bento + How it works + FAQ + CTA final).
- [ ] Eliminar keyframes/animaciones pesadas del HTML y usar solo Tailwind transitions/animate utilities.

## Paso 4 — Validación
- [ ] Ejecutar `npm run build` y revisar errores.
- [ ] Revisar en navegador: layout, responsividad y enlaces.

