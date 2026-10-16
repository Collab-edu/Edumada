'use client'
import { useState } from 'react'

type Point = { date: string; value: number }

const dayFormatter = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short', timeZone: 'UTC' })
const formatDay = (iso: string) => dayFormatter.format(new Date(`${iso}T00:00:00Z`))

/**
 * Histogramme d'une seule série par jour (une couleur, un axe) : barres fines arrondies,
 * écart de 2 px, info-bulle au survol ou au toucher, total et valeur maximale en clair.
 */
export function BarChart({ title, points, unit }: { title: string; points: Point[]; unit: string }) {
    const [active, setActive] = useState<number | null>(null)
    const max = Math.max(1, ...points.map((p) => p.value))
    const total = points.reduce((sum, p) => sum + p.value, 0)
    const current = active !== null ? points[active] : null

    return (
        <figure className='flex flex-col gap-3'>
            <figcaption className='flex flex-wrap items-baseline justify-between gap-2'>
                <span className='font-semibold text-secondary'>{title}</span>
                <span className='text-sm text-ink/60' aria-live='polite'>
                    {current ? `${formatDay(current.date)} : ${current.value} ${unit}` : `${total} ${unit} sur la période`}
                </span>
            </figcaption>
            <div className='relative'>
                <span className='absolute -top-1 left-0 text-xs text-ink/50'>{max}</span>
                <div className='flex h-40 items-end gap-[2px] border-b border-gray-200 pt-4' role='img' aria-label={`${title} : ${total} ${unit} au total, maximum ${max} par jour`} onMouseLeave={() => setActive(null)}>
                    {points.map((p, i) => (
                        <button
                            key={p.date}
                            type='button'
                            onMouseEnter={() => setActive(i)}
                            onFocus={() => setActive(i)}
                            onClick={() => setActive(i)}
                            aria-label={`${formatDay(p.date)} : ${p.value} ${unit}`}
                            className='group flex h-full min-w-0 flex-1 items-end hover:cursor-pointer focus:outline-none'>
                            <span
                                className={`w-full rounded-t-[4px] transition-colors ${active === i ? 'bg-primary' : 'bg-secondary group-hover:bg-primary'}`}
                                style={{ height: p.value === 0 ? '2px' : `${Math.max(4, (p.value / max) * 100)}%`, opacity: p.value === 0 ? 0.2 : 1 }}
                            />
                        </button>
                    ))}
                </div>
            </div>
            {points.length > 0 && (
                <div className='flex justify-between text-xs text-ink/50'>
                    <span>{formatDay(points[0].date)}</span>
                    <span>{formatDay(points[points.length - 1].date)}</span>
                </div>
            )}
        </figure>
    )
}

export default BarChart
