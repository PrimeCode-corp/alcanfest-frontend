import { useEffect, useState } from 'react';
import type { Workshop } from '../../config/event';
import { getWorkshopDate, isWorkshopFinished } from '../../lib/workshops';

type WorkshopOverlaysProps = {
  workshops: Workshop[];
  width: number;
  height: number;
};

export function WorkshopOverlays({ workshops, width, height }: WorkshopOverlaysProps) {
  const [now, setNow] = useState(() => new Date());

  // Actualiza al cambiar de día, incluso si el modal sigue abierto. Perú usa UTC-5 todo el año.
  useEffect(() => {
    const nextDay = new Date(`${getWorkshopDate(now)}T00:00:00-05:00`);
    nextDay.setUTCDate(nextDay.getUTCDate() + 1);
    const timeout = window.setTimeout(() => setNow(new Date()), nextDay.getTime() - Date.now());
    return () => window.clearTimeout(timeout);
  }, [now]);

  return (
    <div aria-live='polite'>
      {workshops.filter((workshop) => isWorkshopFinished(workshop.date, now)).map((workshop) => (
        <div
          key={workshop.date}
          className='pointer-events-none absolute grid place-items-center rounded-[6%] bg-ink/70 text-paper'
          style={{
            left: `${workshop.bounds.x / width * 100}%`,
            top: `${workshop.bounds.y / height * 100}%`,
            width: `${workshop.bounds.width / width * 100}%`,
            height: `${workshop.bounds.height / height * 100}%`
          }}
        >
          <span className='-rotate-30 font-display text-[clamp(0.5rem,4cqw,1.5rem)] leading-none font-black uppercase'>
            <span className='sr-only'>{workshop.title} ({workshop.date}): </span>
            Finalizado
          </span>
        </div>
      ))}
    </div>
  );
}
