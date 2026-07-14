# TODO - Refactor a Blog/Revista minimalista (Astro)

## Paso 1: Limpieza de tema
- [x] Revisar layouts actuales y páginas conectadas al feed (/blog)
- [x] Editar `src/layouts/PageLayout.astro` para eliminar fondos oscuros/gradientes y usar tema claro
- [x] Editar `src/components/Header.astro` para eliminar botones y estilos futuristas


## Paso 2: Nuevo diseño
- [x] Reemplazar `src/pages/index.astro` por una home tipo revista (blanca/limpia)

- [x] Reemplazar `src/pages/blog/index.astro` con grid 2 columnas (feed 70% + sidebar 30%)

  - [x] Tarjetas de noticia: imagen grande, título, fecha, extracto, “Leer más”
  - [x] Sidebar: buscador simple (UI) + últimas vistos + archivo/categorías

## Paso 3: Verificación
- [x] Ejecutar `npm run build` (o comando equivalente) y corregir errores
- [x] Revisar que no se rompe el render de Markdown/MDX del content collection


