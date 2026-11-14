const peruDateFormatter = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'America/Lima',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit'
});

/** Fecha calendario de Perú en YYYY-MM-DD, independiente de la zona horaria del visitante. */
export function getWorkshopDate(now = new Date()): string {
  const parts = peruDateFormatter.formatToParts(now);
  return ['year', 'month', 'day']
    .map((type) => parts.find((part) => part.type === type)!.value)
    .join('-');
}

export function isWorkshopFinished(date: string, now = new Date()): boolean {
  return getWorkshopDate(now) > date;
}
