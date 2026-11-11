/**
 * Desplazamiento suave para los enlaces internos (#seccion) de toda la página: menú, footer, logo del header…
 *
 * Se hace a mano en vez de `scroll-behavior: smooth` para controlar la curva (arranca y frena suave) y la
 * duración: la página es muy larga por las secciones con scroll fijo, y el scroll nativo tarda demasiado o
 * salta según el navegador. La duración crece con la distancia, con un tope.
 *
 * - Respeta el header fijo (--header-h) y el `scroll-margin-top` de la sección destino.
 * - Si el usuario mueve la rueda, toca la pantalla o usa el teclado, se detiene y le devuelve el control.
 * - Con "reducir movimiento" salta directo.
 * - Actualiza la URL (#seccion) sin el salto nativo.
 */

const MIN_MS = 450;
const MAX_MS = 1400;
const MS_PER_PX = 0.12;

// Arranque y frenado suaves (ease-in-out cúbico)
const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);

let frame = 0;
let stopListening: (() => void) | null = null;

function stop() {
  cancelAnimationFrame(frame);
  stopListening?.();
  stopListening = null;
}

function targetTop(el: HTMLElement) {
  const root = getComputedStyle(document.documentElement);
  const headerH = parseFloat(root.getPropertyValue('--header-h')) || 0;
  const margin = parseFloat(getComputedStyle(el).scrollMarginTop) || 0;
  const max = document.documentElement.scrollHeight - window.innerHeight;
  const y = el.getBoundingClientRect().top + window.scrollY - headerH - margin;
  return Math.min(Math.max(0, Math.round(y)), max);
}

export function scrollToElement(el: HTMLElement) {
  scrollToY(targetTop(el));
}

/** Desplaza suave hasta una posición vertical de la página (en px). */
export function scrollToY(to: number) {
  stop();
  const from = window.scrollY;
  const distance = to - from;
  if (Math.abs(distance) < 2) return;

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    window.scrollTo(0, to);
    return;
  }

  const duration = Math.min(MAX_MS, Math.max(MIN_MS, Math.abs(distance) * MS_PER_PX));
  const start = performance.now();

  // Cualquier gesto del usuario corta la animación
  const cancelEvents = ['wheel', 'touchstart', 'keydown', 'mousedown'] as const;
  const onUserInput = () => stop();
  cancelEvents.forEach((type) => window.addEventListener(type, onUserInput, { passive: true }));
  stopListening = () => cancelEvents.forEach((type) => window.removeEventListener(type, onUserInput));

  const step = (now: number) => {
    const t = Math.min(1, (now - start) / duration);
    window.scrollTo(0, from + distance * ease(t));
    if (t < 1) frame = requestAnimationFrame(step);
    else stopListening?.();
  };
  frame = requestAnimationFrame(step);
}

/** Intercepta los clics en enlaces internos de la página. Devuelve la función para quitar el listener. */
export function initSmoothAnchors() {
  const onClick = (e: MouseEvent) => {
    // Clic normal: sin teclas modificadoras (Ctrl/Cmd+clic abre en otra pestaña) y sin preventDefault previo
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    const link = (e.target as Element | null)?.closest?.('a[href^="#"]');
    if (!(link instanceof HTMLAnchorElement) || link.target === '_blank') return;
    const hash = link.getAttribute('href') ?? '';
    const el = hash.length > 1 ? document.getElementById(decodeURIComponent(hash.slice(1))) : null;
    if (!el) return;

    e.preventDefault();
    if (location.hash !== hash) history.pushState(null, '', hash);
    // Un frame de margen: el menú lateral desbloquea el scroll del body al cerrarse
    requestAnimationFrame(() => scrollToElement(el));
  };

  document.addEventListener('click', onClick);
  return () => {
    document.removeEventListener('click', onClick);
    stop();
  };
}
