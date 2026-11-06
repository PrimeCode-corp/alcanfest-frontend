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
export type Flyer = {
  title: string; // nombre del modal para lectores de pantalla
  image: string;
  width: number; // tamaño real de la imagen, reserva el espacio mientras carga
  height: number;
  alt: string; // repite la información del flyer: esos datos solo están en la imagen
  href: string; // enlace del botón del modal
  cta: string;
  character?: string; // pantalla horizontal: figura que asoma detrás del flyer, apuntándolo (PNG/WebP con transparencia)
  characterMobile?: string; // pantalla vertical: figura de frente, centrada arriba del flyer
};

export type FlyerCarousel = {
  title: string; // nombre del modal para lectores de pantalla
  character: { image: string; width: number; height: number }; // asoma por arriba, al centro del carrusel
  slides: Flyer[]; // flyers cuadrados; en cada uno, `title` es el nombre que acompaña al botón
};

export type MerchItem = {
  label: string;
  tagline: string;
  href: string;
  cta?: string; // texto del botón (por defecto "Comprar merch")
  image?: string;
  tone: 'lime' | 'magenta' | 'ink';
  flyer?: Flyer; // si existe, el clic en la card abre este flyer en un modal en lugar de ir a `href`
  carousel?: FlyerCarousel; // igual que `flyer`, pero con varios flyers en un carrusel
  roster?: Roster; // igual que `flyer`, pero con una lista de participantes
};

export type RosterEntry = {
  name: string;
  place?: string; // ciudad o procedencia
  kind: 'classified' | 'slot' | 'surprise'; // cada tipo se ve distinto: clasificado, cupo o sorpresa
};

export type Roster = {
  title: string;
  subtitle: string;
  character?: { image: string; width: number; height: number }; // solo computadora: asoma por detrás del modal, a la derecha
  entries: RosterEntry[];
};

export const merch: MerchItem[] = [
  {
    label: 'Talleres',
    tagline: 'Graffiti, carrera artística & RAP',
    cta: 'Info',
    image: '/img/talleres-700.webp', // original: /img/talleres.png (recortado a la figura)
    href: '#merch',
    tone: 'magenta',
    flyer: {
      title: 'Cronograma de talleres',
      image: '/img/cronograma-talleres-1000.webp', // original: /img/cronograma-talleres.png
      width: 1000,
      height: 1136,
      alt: 'Talleres gratuitos. 7 de noviembre: técnicas de graffiti. 14 de noviembre: financia tu carrera deportiva o artística. 21 de noviembre: el rap, arma y escudo. Hora: 4:00 PM. Lugar: auditorio "El Cultural", Tarapoto, Jr. Sofía Delgado 119.',
      href: 'https://bit.ly/47zLQOo',
      cta: 'Inscribirme',
      character: '/img/personaje-1-797.webp', // original: /img/personaje-1.png (recortado a la figura)
      characterMobile: '/img/personaje-1.2-940.webp' // original: /img/personaje-1.2.png (recortado a la figura)
    }
  },
  {
    label: 'Convocatorias',
    cta: 'Inscribirse',
    tagline: '¡Inscríbete y participa!',
    image: '/img/convocatorias-700.webp', // original: /img/convocatorias.png (recortado a la figura)
    href: '#merch',
    tone: 'lime',
    carousel: {
      title: 'Convocatorias',
      character: {
        image: '/img/personaje-2-1000.webp',
        width: 1000,
        height: 979
      }, // original: /img/personaje-2.png (recortado a la figura)
      slides: [
        {
          title: 'Feria de arte',
          image: '/img/convocatoria-feria-arte-1000.webp', // original: /img/convocatoria-feria-arte.png
          width: 1000,
          height: 1000,
          alt: 'Convocatoria para feriantes. Feria de arte, 29 de noviembre, parque Suchiche. Inscripción gratuita, cupos limitados.',
          href: 'https://bit.ly/4zQe1EW',
          cta: 'Inscribirme'
        },
        {
          title: 'Graffiti',
          image: '/img/convocatoria-graffiti-1000.webp', // original: /img/convocatoria-graffiti.png
          width: 1000,
          height: 1000,
          alt: 'Convocatoria: batallas de graffiti. 13 de diciembre, parque Suchiche. Inscripción gratuita, cupos limitados.',
          href: 'https://bit.ly/4ikF8AL',
          cta: 'Inscribirme'
        },
        {
          title: 'Rock',
          image: '/img/convocatoria-rock-1000.webp', // original: /img/convocatoria-rock.png
          width: 1000,
          height: 1000,
          alt: 'Convocatoria: concurso a la mejor banda de rock. 13 de diciembre, parque Suchiche. Inscripción gratuita, cupos limitados.',
          href: 'https://forms.gle/ytMAWPTjmvuR5oVZ6',
          cta: 'Inscribirme'
        },
        {
          title: 'Breakdance',
          image: '/img/convocatoria-breaking-1000.webp', // original: /img/convocatoria-breaking.png
          width: 1000,
          height: 1000,
          alt: 'Convocatoria: batallas de breaking 1 vs 1. 13 de diciembre, parque Suchiche. Inscripción gratuita, cupos limitados.',
          href: 'https://forms.gle/wSD9k7JckDqkGdWA8',
          cta: 'Inscribirme'
        },
        {
          title: 'Artistas urbanos',
          image: '/img/convocatoria-artistas-urbanos-1000.webp', // original: /img/convocatoria-artistas-urbanos.png
          width: 1000,
          height: 1000,
          alt: 'Convocatoria: artistas urbanos, presenta tus temas. 13 de diciembre, parque Suchiche.',
          href: 'https://forms.gle/8i9Qu7TQqpc5txcs7',
          cta: 'Inscribirme'
        },
        {
          title: 'BMX, skate, roller',
          image: '/img/convocatoria-bmx-roller-skate-1000.webp', // original: /img/convocatoria-bmx-roller-skate.png
          width: 1000,
          height: 1000,
          alt: 'Convocatoria de deportes alternativos: BMX, skate y roller. 13 de diciembre, parque Suchiche. Inscripción gratuita.',
          href: 'https://forms.gle/bN5m2MbofLKHsN9bA',
          cta: 'Inscribirme'
        }
      ]
    }
  },
  {
    label: 'Clasificados',
    tagline: 'Batallas de RAP',
    image: '/img/clasificados-700.webp', // original: /img/clasificados.png (recortado a la figura)
    cta: 'Ver',
    href: '#merch',
    tone: 'ink',
    roster: {
      title: 'Clasificados',
      subtitle: 'Batallas de RAP',
      character: { image: '/img/personaje-3-742.webp', width: 742, height: 1402 }, // original: /img/personaje-3.png (recortado a la figura)
      entries: [
        { name: 'Tai', place: 'Tarapoto', kind: 'classified' },
        { name: 'P-Chón', place: 'Tarapoto', kind: 'classified' },
        { name: 'Mako', place: 'Tarapoto', kind: 'classified' },
        { name: 'Hidra', place: 'Nueva Cajamarca', kind: 'classified' },
        { name: 'José', place: 'Rioja', kind: 'classified' },
        { name: 'Dhário', place: 'Tarapoto', kind: 'classified' },
        { name: 'Jeixder', place: 'Yurimaguas', kind: 'classified' },
        { name: 'Bill Dlade', place: 'Yurimaguas', kind: 'classified' },
        { name: 'Vene', place: 'Rioja', kind: 'classified' },
        { name: 'Totix', place: 'Tarapoto', kind: 'classified' },
        {
          name: 'Cupo Sur',
          place: 'Tocache, Tingo María, Pucallpa y Huánuco',
          kind: 'slot'
        },
        {
          name: 'Cupo Sur',
          place: 'Tocache, Tingo María, Pucallpa y Huánuco',
          kind: 'slot'
        },
        { name: 'Cupo Lamas', place: 'En Impakto Líriko', kind: 'slot' },
        { name: 'Cupo Juanjui', kind: 'slot' },
        { name: 'Cupo Juanjui', kind: 'slot' },
        { name: '¿?', place: 'Sorpresa', kind: 'surprise' }
      ]
    }
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
      title:
        'Batallas de rap, break dance, graffiti, beatbox, barberos, bikers, rollers y skateboarders',
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
  description: 'Mira el spot oficial del festival'
};

// --- Experiencias (slider tipo "pilares" de Lolla) ---
// Cada slide: foto de fondo a pantalla completa + collage central + titular sobre un recuadro de color.
// TODO: textos definitivos (por ahora la frase de referencia).
export type ExperienceSlide = {
  title: string;
  color: string; // color del recuadro del titular (variable CSS de la paleta)
  background: string;
  backgroundMobile?: string;
  image: string; // collage central (PNG/WebP con transparencia)
  imageRatio?: number; // ancho / alto del collage (por defecto 1.4)
  imageScale?: number; // achica o agranda el collage (por defecto 1)
  imageOverlap?: number; // parte del collage que queda detrás del recuadro (por defecto 0.3 = 30%)
};

export const experiences: ExperienceSlide[] = [
  {
    title: '+1000 Espectadores. Los freestylers se medirán en batallas',
    color: 'var(--color-magenta)',
    background: '/img/panorama_2-1920.webp', // original: /img/panorama_2.jpeg
    backgroundMobile: '/img/panorama_2-1000.webp',
    image: '/img/prota_2-1200.webp', // original: /img/prota_2.png
    imageRatio: 1.01,
    imageScale: 0.8, // es casi cuadrado: más chico para que el puño no se corte arriba
    imageOverlap: 0.2 // menos tapado por el recuadro: la foto queda un poco más arriba
  },
  {
    title: '+10 Disciplinas. Bikers llenos de talento y adrenalina',
    color: 'var(--color-lime)',
    background: '/img/panorama_1-1920.webp', // original: /img/panorama_1.png
    backgroundMobile: '/img/panorama_1-1000.webp',
    image: '/img/prota_1-1200.webp', // original: /img/prota_1.png
    imageRatio: 1.5
  }
];
