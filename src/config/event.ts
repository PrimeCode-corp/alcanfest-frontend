// Datos del evento. Reemplazar los valores de ejemplo por los reales.
export const event = {
  name: 'Alcanfest',
  edition: '2026',
  tagline: 'Festival de arte y cultura',
  city: 'Tarapoto',
  venue: 'Parque Suchiche',
  dates: '13 de diciembre',
  hashtag: '#TalentoEsLoQueSobra',
  editionNumber: '15',
  heroHeadline: 'Arte, deporte y cultura', //   (espacio no separable) evita que la "y" quede sola al final de línea
  heroSubtitle: 'El festival urbano más grande de San Martín',
  logo: '/img/logo-header.webp',
  ticketsUrl: '#entradas'
};

export type NavLink = { label: string; href: string; external?: boolean };

export const primaryNav: NavLink[] = [
  { label: 'Inicio', href: '#inicio' },
  { label: 'Line-up', href: '#lineup' },
  { label: 'Horarios', href: '#horarios' },
  { label: 'Entradas', href: '#entradas' },
  { label: 'Comida y bebida', href: '#comida' },
  { label: 'Experiencias', href: '#experiencias' },
  { label: 'Merch', href: '#merch' }
];

export const helpNav: NavLink[] = [
  { label: 'Preguntas frecuentes', href: '#faq' },
  { label: 'Cómo llegar', href: '#como-llegar' },
  { label: 'Accesibilidad', href: '#accesibilidad' },
  { label: 'Seguridad', href: '#seguridad' },
  { label: 'Contacto', href: '#contacto' }
];

// TODO: URLs reales de redes
export const socialNav: NavLink[] = [
  { label: 'Instagram', href: 'https://instagram.com', external: true },
  { label: 'TikTok', href: 'https://tiktok.com', external: true },
  { label: 'YouTube', href: 'https://youtube.com', external: true },
  { label: 'X', href: 'https://x.com', external: true }
];

// --- Merch ---
// TODO: reemplazar `image` por fotos reales del merch y `href` por la tienda real.
// Sin `image`, la card muestra un panel de color como placeholder.
export type MerchItem = {
  label: string;
  tagline: string;
  href: string;
  image?: string;
  tone: 'lime' | 'magenta' | 'ink';
};

export const merch: MerchItem[] = [
  {
    label: 'Ropa',
    tagline: 'Polos, poleras y casacas',
    href: '#merch',
    tone: 'magenta'
  },
  {
    label: 'Gorras',
    tagline: 'Lleva el festival en la cabeza',
    href: '#merch',
    tone: 'lime'
  },
  {
    label: 'Accesorios',
    tagline: 'Tote bags, stickers y más',
    href: '#merch',
    tone: 'ink'
  }
];

// --- ¿Qué es Alcanfest? ---
// TODO: confirmar fechas, cifras y textos con la organización.
/**
 * Ubicación del nombre sobre la foto, para que no tape a las personas.
 * Posiciones en % del cuadro; `size` en % del ancho del cuadro (escala con la imagen).
 */
export type TagPlacement = {
  top?: string;
  bottom?: string;
  left?: string;
  right?: string;
  centerX?: boolean; // centra horizontalmente (usar con top/bottom)
  rotate?: number; // grados
  vertical?: boolean; // texto vertical, se lee de abajo hacia arriba
  size?: number;
};

export type AboutFeature = {
  title: string;
  tag: string;
  image?: string;
  tagPlacement?: TagPlacement;
};

export const about: { subtitle: string; features: AboutFeature[] } = {
  subtitle:
    'Festival para celebrar y promover el arte, música y cultura urbana en el corazón de San Martín',
  features: [
    {
      tag: 'Música',
      title: 'Música y arte urbano con artistas invitados',
      image: '/img/musica-1000.webp', // original: /img/musica.png
      // Vertical en la franja izquierda (pantalla de fondo), junto al brazo de la cantante
      tagPlacement: { left: '4%', bottom: '40%', vertical: true, size: 12 }
    },
    {
      tag: 'Calle',
      title: 'Batallas de rap, break dance, graffiti, beatbox y barberos',
      image: '/img/calle-1000.webp', // original: /img/calle.png
      // Sobre el piso, abajo a la derecha, inclinado siguiendo la diagonal del bailarín
      tagPlacement: { right: '6%', bottom: '6%', rotate: -7, size: 12 }
    },
    {
      tag: 'Feria',
      title: 'Feria de arte y emprendimientos, talleres y conversatorios',
      image: '/img/feria-1000.webp', // original: /img/feria.png
      // Abajo a la izquierda, sobre el piso: bajo el zapato del barbero, inclinado como la línea amarilla
      tagPlacement: { left: '39%', bottom: '64%', rotate: 5, size: 9 }
    },
    {
      tag: 'Rock',
      title: 'Concurso a la mejor banda de rock de la región',
      image: '/img/rock-1000.webp', // original: /img/rock.png
      // Arriba, sobre la cortina y encima de la cabeza del baterista
      tagPlacement: { top: '7%', left: '60%', rotate: 4, size: 12 }
    }
  ]
};

// --- Video spot ---
// TODO: el archivo actual es 640×360; exportar en 1080p para que se vea nítido en pantallas grandes.
export const spot = {
  src: '/img/spot.mp4',
  title: 'Spot oficial',
  description: 'Mira el spot oficial del festival',
}
