import { useId } from 'react'
import { schedule, type ScheduleActivity } from '../../config/event'
import { cn } from '../../lib/cn'
import { IconButton } from '../FlyerModal/FlyerModal'
import { useModalDialog } from '../FlyerModal/useModalDialog'

type ScheduleModalProps = {
  open: boolean
  onClose: () => void
}

export function ScheduleModal({ open, onClose }: ScheduleModalProps) {
  const dialogRef = useModalDialog(open)
  const titleId = useId()
  const descriptionId = useId()

  return (
    <dialog
      ref={dialogRef}
      id="schedule-modal"
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
      onClose={onClose}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
      className="top-(--header-h) m-auto max-h-none w-[min(58rem,100vw-2rem)] max-w-none overflow-visible bg-transparent text-ink transition-[opacity,translate] duration-200 ease-snap backdrop:bg-ink/85 starting:open:translate-y-4 starting:open:opacity-0"
    >
      <div className="max-h-[calc(100dvh-var(--header-h)-1.5rem)] overflow-y-auto overscroll-contain border-3 border-ink bg-paper shadow-[6px_6px_0_var(--color-magenta)]">
        <div className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b-3 border-ink bg-paper p-4 sm:px-6 sm:py-5">
          <div>
            <p className="mb-2 inline-block bg-lime px-2 py-0.5 text-xs font-extrabold tracking-wider uppercase sm:text-sm">
              {schedule.month}
            </p>
            <h2 id={titleId} className="font-display text-[clamp(2.25rem,7vw,4rem)] leading-none font-black uppercase">
              {schedule.label}
            </h2>
          </div>
          <IconButton label={schedule.closeLabel} onClick={onClose}>
            <path d="M5 5l14 14M19 5L5 19" />
          </IconButton>
        </div>

        <div className="p-4 sm:p-6">
          <p id={descriptionId} className="mb-5 text-sm font-semibold sm:text-base">
            {schedule.description}
          </p>
          <ol className="grid gap-3 sm:gap-4">
            {schedule.activities.map((activity) => (
              <Activity key={activity.date} activity={activity} />
            ))}
          </ol>
        </div>
      </div>
    </dialog>
  )
}

function Activity({ activity }: { activity: ScheduleActivity }) {
  return (
    <li className={cn('grid grid-cols-[4rem_minmax(0,1fr)] border-2 border-ink sm:grid-cols-[6rem_minmax(0,1fr)]', activity.featured && 'bg-lime shadow-[4px_4px_0_var(--color-ink)]')}>
      <time
        dateTime={activity.date}
        aria-label={`${activity.weekday} ${Number(activity.date.slice(-2))} de diciembre de 2026`}
        className={cn('flex flex-col items-center justify-center border-r-2 border-ink px-1 py-4', activity.featured ? 'bg-ink text-lime' : 'bg-ink text-paper')}
      >
        <span className="text-[0.65rem] font-bold uppercase sm:text-xs">{activity.weekday}</span>
        <span className="font-display text-4xl leading-none font-black sm:text-6xl">{activity.date.slice(-2)}</span>
        <span className="mt-1 text-[0.65rem] font-bold uppercase sm:text-xs">Dic</span>
      </time>
      <div className="min-w-0 p-3 sm:p-4">
        {activity.featured && (
          <p className="mb-2 inline-block bg-ink px-2 py-1 text-xs font-bold text-paper uppercase">
            {schedule.featuredLabel}
          </p>
        )}
        <h3 className={cn('font-display text-xl leading-tight font-extrabold text-pretty sm:text-2xl', activity.featured && 'text-3xl font-black sm:text-4xl')}>
          {activity.title}
        </h3>
        {(activity.time || activity.venue || activity.address || activity.admission) && (
          <dl className="mt-3 grid gap-1 text-sm leading-relaxed">
            {activity.time && <Detail label={schedule.labels.time} value={activity.time} />}
            {activity.venue && <Detail label={schedule.labels.venue} value={activity.venue} />}
            {activity.address && <Detail label={schedule.labels.address} value={activity.address} />}
            {activity.admission && <Detail label={schedule.labels.admission} value={activity.admission} />}
          </dl>
        )}
        {activity.location && <p className="mt-2 text-xs leading-relaxed">{activity.location}</p>}
      </div>
    </li>
  )
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="inline font-bold">{label}: </dt>
      <dd className="inline">{value}</dd>
    </div>
  )
}
