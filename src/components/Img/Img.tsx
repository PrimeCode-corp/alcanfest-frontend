import { useEffect, useRef, useState, type ComponentProps } from 'react';
import { cn } from '../../lib/cn';

/**
 * `<img>` que aparece al terminar de descargarse, en vez de dibujarse a medias.
 * Pensado para conexiones lentas: mientras la imagen baja queda transparente
 * (utilidad `img-in`) y, si su hueco lleva `img-slot`, ahí se ve el esqueleto.
 *
 * `data-loaded` es lo que revela la imagen y apaga el esqueleto. Se marca:
 * - al disparar `load`;
 * - al montar, si la imagen ya estaba en caché (`complete`): ahí `load` no vuelve a disparar;
 * - al fallar la descarga, para no dejar el hueco animándose para siempre.
 *
 * La transición la pone cada componente en su `className` (`transition-opacity`,
 * o `opacity` dentro de un `transition-[…]`), porque varias imágenes animan
 * además otras propiedades y una transición propia aquí las pisaría.
 */
type ImgProps = Omit<ComponentProps<'img'>, 'ref' | 'onLoad' | 'onError'>;

export function Img({ className, ...rest }: ImgProps) {
  const ref = useRef<HTMLImageElement>(null);
  const [loaded, setLoaded] = useState(false);
  const markLoaded = () => setLoaded(true);

  useEffect(() => {
    if (ref.current?.complete) setLoaded(true);
  }, []);

  return (
    <img
      decoding='async'
      {...rest}
      ref={ref}
      onLoad={markLoaded}
      onError={markLoaded}
      data-loaded={loaded ? '' : undefined}
      className={cn('img-in', className)}
    />
  );
}
