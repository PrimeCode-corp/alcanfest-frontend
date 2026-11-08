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

**El contenido vive en `src/config/event.ts`, no en los componentes.** Textos, rutas de imágenes, colores por slide/card, enlaces y redes se editan ahí; los componentes solo renderizan. Varios campos son opcionales con valor por defecto en el componente (p. ej. `cta` de las cards, `imageRatio`/`imageScale`/`imageOverlap` de los slides, `tagPlacement` de las fotos de "¿Qué es?").

**Orden de secciones** (en `src/App.tsx`): `Hero` → `Merch` (`#merch`; cards Talleres/Convocatorias/Clasificados) → `About` (`#que-es`) → `Spot` (`#spot`, video) → `Experiences` (`#experiencias`, slider de pilares) → `Updates` (`#sede`; "Sede" + "Entérate primero", como "2026 tickets"/"Be the first to know" de Lolla) → `Partners` (`#colaboradores`, grilla de logos) y, fuera de `<main>`, `Footer`. `Header` + `SideMenu` comparten el estado del menú desde `App`.

**Navegación:** `primaryNav`, `helpNav` y `socialNav` (config) los usan tanto el menú lateral como el footer (`footerColumns`): solo enlaces a secciones que existen o a URLs reales. Al agregar una sección con `id`, sumarla ahí. Los enlaces internos (`#seccion`) se desplazan suave con `src/lib/smoothScroll.ts` (un listener de `click` en `document`, registrado en `App`): curva ease-in-out con duración según la distancia (tope 1,4 s), descuenta `--header-h` y el `scroll-margin-top` del destino, se corta ante rueda/toque/teclado y salta directo con `prefers-reduced-motion`. `html` tiene `scroll-padding-top: var(--header-h)` como respaldo.

**"Próximamente":** `src/components/CtaButton/CtaButton.tsx` es el botón de llamada a la acción con `available`. Con `available: false` se ve activo, pero al primer clic se apaga y se le pega una etiqueta lima (`animate-sticker-in`); queda así hasta recargar. Lo usan "¿Cómo llegar?" del hero (`venueLocation.available`; el modal `LocationModal` y la ruta siguen listos) y "Ubicación" de `Updates` (`updates[0]`). Para activarlos: poner el destino y `available: true`.

**Pendientes de contenido:** los 45 logos de `partners` son el de El Cultural repetido como relleno (cada logo exige `href`); la sede/ubicación aún no está confirmada.

**Estilos:** Tailwind v4 sin `tailwind.config`; los tokens están en el bloque `@theme` de `src/index.css` (`ink`, `paper`, `lime`, `magenta`, fuentes `font-display` = Big Shoulders Display / `font-body` = Figtree, `ease-snap`, breakpoint `xs`). Variables globales: `--header-h` (64px móvil / 88px desde `sm`) y `--gutter`. Estética "brutalista": bordes gruesos, sombras duras desplazadas (`shadow-[Npx_Npx_0_var(--color-…)]`), recuadros de color detrás del texto. `prefers-reduced-motion` reduce globalmente todas las transiciones/animaciones en `index.css`.

**Animaciones ligadas al scroll** (sin librerías). Header, About y Experiences siguen el mismo patrón:
- Un listener de `scroll` agenda un `requestAnimationFrame` que lee `getBoundingClientRect()` y escribe **variables CSS** en un elemento (`--e`, `--t`, `--dx`…) o el `style` directamente, para no re-renderizar React en cada scroll. Solo el estado discreto (slide activo, titular visible) pasa por `useState`.
- Los estilos usan esas variables con fallback al estado final (`var(--t, 1)`), así en móvil o sin JS quedan en su lugar.
- El efecto "pantalla fija" es un contenedor alto + hijo `sticky top-(--header-h)`; el alto del contenedor define cuánto scroll dura la sección.
- `About`: el título entra centrado y se "arrastra" a su lugar (`useIntroTransition`, solo desktop `lg`), luego las respuestas se resaltan por `IntersectionObserver` con línea central.
- `Spot`: desde `sm` muestra `spot.src` (horizontal) entero, sin recortes: el escenario mide `min(100svh - header, ancho / proporción)` (`100cqw`, la sección es `@container`) y, si sobra ancho, un `<canvas>` de fondo dibuja el mismo cuadro espejado a cada lado (`requestVideoFrameCallback`, un solo `<video>` decodifica). En celular usa `spot.reelSrc` (vertical, `object-cover`). Intenta reproducir **con sonido** al entrar en pantalla; si el navegador lo bloquea (sin interacción previa en la página; la rueda/deslizar no cuentan) sigue en silencio y lo activa con el primer clic/toque/tecla. Silenciar a mano se respeta.
- `Spot` → `Experiences`: `Experiences` se monta sobre el tramo final de `Spot` (margen negativo `--experiences-overlap`; el espaciador dentro de `Spot` mide eso más `--spot-hold`), con ese tramo transparente. El video queda `sticky` y se apaga mientras la foto crece encima; la entrada termina antes de que se fije el escenario (`ENTRY_LEAD`). `SPOT_HOLD` debe coincidir con `--spot-hold`. El progreso `--experiences-entry` se escribe en `<main>` porque lo leen ambas secciones, y sigue al scroll con retardo (`ENTRY_SMOOTHING_MS`).
- `Experiences`: replica los "pillars" de lollapalooza.com. Hay un solo recuadro fijo que cambia de color; los titulares y los collages de todos los slides van apilados en una misma celda de grid, así el recuadro mide lo que el titular más largo y no se mueve entre slides. `SLIDE_STEP` controla cuánto scroll hay entre slides. El escenario usa `100lvh` (no `svh`) para no dejar una franja negra en móvil cuando se oculta la barra del navegador. Las palabras del titular van en máscaras individuales con `pt`/`-mt` extra para no cortar tildes de mayúsculas. Desde `lg` el recuadro mide `min(30rem, 55svh)`: en laptops bajas se angosta, y el tamaño del titular se escala con él (`(55svh-4.5rem)*0.11`) para mantener 3 líneas.

## Imágenes

Todas las `<img>` de la web pasan por `src/components/Img/Img.tsx`, no por `<img>` a pelo: marca `data-loaded` al terminar la descarga (también si venía de caché o si falla) y la utilidad `img-in` de `index.css` las mantiene transparentes hasta entonces. La transición la pone cada componente en su `className`, porque varias imágenes animan además otras propiedades. Donde la imagen es el contenido y no el fondo (cards de Merch, flyers de los modales, flyer del hero, fotos de "¿Qué es?"), el **padre** lleva `img-slot`: dibuja un esqueleto con una barra lima que barre en diagonal y se apaga solo con `:has(img[data-loaded])`. Ojo: `img-slot` sin ningún `<img>` dentro se queda animando para siempre, así que va condicionado a que exista la foto. Las secciones con animaciones de scroll propias (Experiences) escriben `--img-opacity` en vez de `opacity`; `img-in` multiplica las dos.

Los originales (PNG/JPEG) se guardan en `public/img/` y la web usa versiones WebP generadas con Pillow (`python -I`), nombradas `<nombre>-<ancho>.webp`; la config anota el original en un comentario. Collages/figuras con transparencia se recortan antes al bounding box del canal alfa (si no, se ven diminutos); los logos de `public/img/partners/` (fondo blanco) se recortan al contenido. Al reemplazar un PNG con el mismo nombre, regenerar su WebP. Pillow está instalado con `pip install --user`, que `python -I` no ve: en los scripts, `import site, sys; sys.path.append(site.getusersitepackages())` antes de `from PIL import Image`.

**Videos:** GitHub rechaza archivos de más de 100 MB, también si quedaron en un commit anterior sin subir (hay que rehacer esos commits, no basta uno nuevo). Mantener `spot.mp4`/`spot-reel.mp4` comprimidos (hoy ~45/36 MB).

## Verificación visual

El modo `--headless --screenshot` de Edge no es confiable para esta web: no ejecuta `requestAnimationFrame` de forma consistente, congela transiciones de `translate` y no baja de ~500px de ancho. Para capturas reales: `npm run preview` y controlar Edge (`C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe`) por el protocolo DevTools desde Node (WebSocket nativo), con `Emulation.setDeviceMetricsOverride`, scroll vía `Runtime.evaluate` y `Page.captureScreenshot`. Lanzar Edge con un `--user-data-dir` propio y al terminar cerrar **solo ese proceso** (`taskkill /T /F /PID <pid>`), nunca `taskkill /IM msedge.exe`: cierra el navegador del usuario. Para probar autoplay con sonido, no usar `--autoplay-policy=no-user-gesture-required` (oculta el bloqueo real). No dejar archivos de prueba dentro de `dist/`.
