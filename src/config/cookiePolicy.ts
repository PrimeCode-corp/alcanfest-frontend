import { event } from './event';

// --- Política de cookies (como lollapalooza.com/cookie-policy) ---
// Página propia en `cookiePolicy.path`, enlazada desde la fila legal del footer. Misma estructura que la de Lolla:
// título + fecha, introducción, "Tecnologías en línea", "Categorías", "Cómo gestionarlas" y la grilla de colaboradores
// al final. Si el sitio suma analítica, publicidad o botones de redes incrustados, actualizar `status`/`active` de la
// categoría, la fecha `updated` y (si hace falta consentimiento) agregar un banner.

export type CookieLink = { label: string; href: string };

export type CookieCategory = {
  name: string;
  text: string;
  status: string; // etiqueta junto al nombre
  active: boolean; // true = etiqueta lima (en uso); false = etiqueta con borde (no se usa hoy)
};

export const cookiePolicy = {
  path: '/politica-de-cookies',
  label: 'Política de cookies', // texto del enlace del footer
  pageTitle: `Política de cookies | ${event.name}`,
  title: 'Política de cookies',
  updated: 'Última actualización: noviembre de 2026',
  heading: `Política de cookies de ${event.name}`,
  intro: [
    `Esta política explica qué tecnologías en línea (cookies, píxeles, scripts y similares) se pueden usar en alcanfest.com, para qué sirven y qué opciones tienes para controlarlas.`,
    `Hoy el sitio no instala cookies propias de rendimiento, publicidad ni redes sociales, y no te pide iniciar sesión ni datos personales. Si eso cambia, actualizaremos esta página antes de hacerlo.`
  ],

  technologies: {
    title: 'Tecnologías en línea',
    text: 'Son pequeñas piezas de información o de código que un sitio web usa para funcionar y para ofrecer una experiencia más cómoda. Las principales son:',
    items: [
      {
        name: 'Cookies',
        text: 'Archivos de texto que el navegador guarda en tu dispositivo. Las propias las instala el sitio que visitas; las de terceros, otro servicio. Las de sesión se borran al cerrar el navegador y las persistentes duran hasta que vencen o las eliminas.'
      },
      {
        name: 'Píxeles o etiquetas',
        text: 'Imágenes diminutas o fragmentos de código que avisan cuando se abre una página o un correo.'
      },
      {
        name: 'Scripts',
        text: 'Código que se ejecuta en el navegador para que la página funcione, por ejemplo las animaciones o el reproductor de video.'
      },
      {
        name: 'SDK',
        text: 'Bloques de código de terceros dentro de aplicaciones móviles. Alcanfest no tiene app, así que hoy no aplica.'
      }
    ]
  },

  categories: {
    title: 'Categorías de tecnologías en línea',
    text: 'Agrupamos las tecnologías según su finalidad. Esta es cada categoría y cómo la usamos hoy:',
    items: [
      {
        name: 'Estrictamente necesarias',
        text: 'Hacen que el sitio cargue y sea seguro, por ejemplo para protegerlo de tráfico malicioso. No se pueden desactivar y no requieren consentimiento. El sitio no instala cookies propias de este tipo; solo nuestro proveedor de alojamiento podría usar alguna por seguridad.',
        status: 'Siempre activas',
        active: true
      },
      {
        name: 'De rendimiento',
        text: 'Cuentan visitas y fuentes de tráfico, de forma agregada, para medir y mejorar el sitio.',
        status: 'No se usan',
        active: false
      },
      {
        name: 'Funcionales',
        text: 'Recuerdan tus preferencias para personalizar la experiencia, como el idioma o la región.',
        status: 'No se usan',
        active: false
      },
      {
        name: 'De publicidad',
        text: 'Aprenden tus intereses a través de distintos sitios para mostrarte anuncios personalizados.',
        status: 'No se usan',
        active: false
      },
      {
        name: 'De redes sociales',
        text: 'Permiten compartir contenido con tus amigos y redes. En el sitio solo hay enlaces a Facebook, Instagram, TikTok, YouTube, WhatsApp y Google Maps, sin botones incrustados: esos servicios aplican sus propias políticas recién cuando entras a ellos.',
        status: 'No se usan',
        active: false
      }
    ] satisfies CookieCategory[]
  },

  manage: {
    title: 'Cómo gestionar las tecnologías en línea',
    sections: [
      {
        name: 'Centro de preferencias',
        text: 'Como hoy solo usamos lo estrictamente necesario, no mostramos un aviso de cookies al entrar. Si sumamos alguna cookie opcional, te pediremos permiso antes de instalarla y podrás cambiar tu elección cuando quieras desde el enlace del footer.',
        links: [] as CookieLink[]
      },
      {
        name: 'Configuración del navegador',
        text: 'Tu navegador puede avisarte cada vez que un sitio quiera guardar una cookie, bloquearlas o borrar las que ya tienes. Si las bloqueas todas, algunos sitios pueden dejar de funcionar bien. Estas son las guías de los navegadores más usados:',
        links: [
          { label: 'Google Chrome', href: 'https://support.google.com/chrome/answer/95647?hl=es' },
          { label: 'Safari (iPhone)', href: 'https://support.apple.com/es-es/105082' },
          { label: 'Safari (Mac)', href: 'https://support.apple.com/es-es/guide/safari/sfri11471/mac' },
          {
            label: 'Mozilla Firefox',
            href: 'https://support.mozilla.org/es/kb/borrar-cookies-datos-sitio-firefox'
          },
          {
            label: 'Microsoft Edge',
            href: 'https://support.microsoft.com/es-es/microsoft-edge/eliminar-las-cookies-en-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09'
          }
        ]
      },
      {
        name: 'Publicidad personalizada',
        text: 'Alcanfest no muestra anuncios. Si quieres limitar la publicidad basada en tu comportamiento en otros sitios y apps, puedes hacerlo desde estas herramientas de la industria:',
        links: [
          { label: 'Your Online Choices', href: 'https://www.youronlinechoices.eu/' },
          { label: 'AppChoices (DAA)', href: 'https://youradchoices.com/appchoices' }
        ]
      }
    ]
  },

  contact: {
    title: 'Contacto',
    text: 'Si tienes dudas sobre esta política o quieres ejercer tus derechos sobre tus datos personales (Ley N.° 29733, Ley de Protección de Datos Personales del Perú), escríbenos.',
    cta: 'Escríbenos por WhatsApp',
    href: event.contactUrl
  }
};
