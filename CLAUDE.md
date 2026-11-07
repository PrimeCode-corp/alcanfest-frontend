# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

Landing page de **Alcanfest** (festival de arte y cultura urbana, Tarapoto). React 19 + TypeScript + Vite + Tailwind CSS v4. Sitio en español; los comentarios del código también están en español.

## Comandos

```bash
npm run dev       # servidor de desarrollo (Vite)
npm run build     # tsc -b (chequeo de tipos) + vite build → dist/
npm run lint      # oxlint
npm run preview   # sirve dist/ (útil para capturas)
```

No hay tests. Verificar con `npm run build` (falla ante errores de tipos) y `npm run lint`. El warning `no-irregular-whitespace` en `src/config/event.ts` es intencional: `heroHeadline` usa un espacio no separable para que la "y" no quede sola al final de línea.

## Arquitectura

**El contenido vive en `src/config/event.ts`, no en los componentes.** Textos, rutas de imágenes, colores por slide/card y enlaces de navegación se editan ahí; los componentes solo renderizan. Varios campos son opcionales con valor por defecto en el componente (p. ej. `cta` de las cards, `imageRatio`/`imageScale`/`imageOverlap` de los slides, `tagPlacement` de las fotos de "¿Qué es?").

**Orden de secciones** (en `src/App.tsx`): `Hero` → `Merch` (cards; hoy son Talleres/Convocatorias/Clasificados) → `About` ("¿Qué es Alcanfest?") → `Spot` (video) → `Experiences` (slider de pilares). Al final hay una `<section>` vacía de relleno para las secciones que faltan. `Header` + `SideMenu` comparten el estado del menú desde `App`.

**Estilos:** Tailwind v4 sin `tailwind.config`; los tokens están en el bloque `@theme` de `src/index.css` (`ink`, `paper`, `lime`, `magenta`, fuentes `font-display` = Big Shoulders Display / `font-body` = Figtree, `ease-snap`, breakpoint `xs`). Variables globales: `--header-h` (64px móvil / 88px desde `sm`) y `--gutter`. Estética "brutalista": bordes gruesos, sombras duras desplazadas (`shadow-[Npx_Npx_0_var(--color-…)]`), recuadros de color detrás del texto. `prefers-reduced-motion` reduce globalmente todas las transiciones/animaciones en `index.css`.

**Animaciones ligadas al scroll** (sin librerías). Header, About y Experiences siguen el mismo patrón:
- Un listener de `scroll` agenda un `requestAnimationFrame` que lee `getBoundingClientRect()` y escribe **variables CSS** en un elemento (`--e`, `--t`, `--dx`…) o el `style` directamente, para no re-renderizar React en cada scroll. Solo el estado discreto (slide activo, titular visible) pasa por `useState`.
- Los estilos usan esas variables con fallback al estado final (`var(--t, 1)`), así en móvil o sin JS quedan en su lugar.
- El efecto "pantalla fija" es un contenedor alto + hijo `sticky top-(--header-h)`; el alto del contenedor define cuánto scroll dura la sección.
- `About`: el título entra centrado y se "arrastra" a su lugar (`useIntroTransition`, solo desktop `lg`), luego las respuestas se resaltan por `IntersectionObserver` con línea central.
- `Spot` → `Experiences`: `Experiences` se monta sobre el tramo final de `Spot` (margen negativo `--experiences-overlap`; el espaciador dentro de `Spot` mide eso más `--spot-hold`), con ese tramo transparente. El video queda `sticky` y se apaga mientras la foto crece encima; la entrada termina antes de que se fije el escenario (`ENTRY_LEAD`). `SPOT_HOLD` debe coincidir con `--spot-hold`. El progreso `--experiences-entry` se escribe en `<main>` porque lo leen ambas secciones, y sigue al scroll con retardo (`ENTRY_SMOOTHING_MS`).
- `Experiences`: replica los "pillars" de lollapalooza.com. Hay un solo recuadro fijo que cambia de color; los titulares y los collages de todos los slides van apilados en una misma celda de grid, así el recuadro mide lo que el titular más largo y no se mueve entre slides. `SLIDE_STEP` controla cuánto scroll hay entre slides. El escenario usa `100lvh` (no `svh`) para no dejar una franja negra en móvil cuando se oculta la barra del navegador. Las palabras del titular van en máscaras individuales con `pt`/`-mt` extra para no cortar tildes de mayúsculas.

## Imágenes

Los originales (PNG/JPEG) se guardan en `public/img/` y la web usa versiones WebP generadas con Pillow (`python -I`), nombradas `<nombre>-<ancho>.webp`; la config anota el original en un comentario. Collages/figuras con transparencia se recortan antes al bounding box del canal alfa (si no, se ven diminutos). Al reemplazar un PNG con el mismo nombre, regenerar su WebP.

## Verificación visual

El modo `--headless --screenshot` de Edge no es confiable para esta web: no ejecuta `requestAnimationFrame` de forma consistente, congela transiciones de `translate` y no baja de ~500px de ancho. Para capturas reales: `npm run preview` y controlar Edge (`C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe`) por el protocolo DevTools desde Node (WebSocket nativo), con `Emulation.setDeviceMetricsOverride`, scroll vía `Runtime.evaluate` y `Page.captureScreenshot`. No dejar archivos de prueba dentro de `dist/`.
