'use client'
import { useEffect, useRef, type ReactNode } from 'react'
import { CChartBar, CChartLine } from '@coreui/react-chartjs'
import { getStyle } from '@coreui/utils'
import type { Chart } from 'chart.js'
import { formatDay } from '@/lib/format'
import type { SeriesPoint } from '@/lib/types'

/** Petite courbe blanche des tuiles colorées (style CoreUI). */
export function Sparkline({ values, type = 'line' }: { values: number[]; type?: 'line' | 'bar' }) {
    const common = {
        plugins: { legend: { display: false }, tooltip: { enabled: true } },
        maintainAspectRatio: false,
        scales: { x: { display: false }, y: { display: false, beginAtZero: true } },
    }
    if (type === 'bar') {
        return (
            <CChartBar
                className='mt-3 mx-3'
                style={{ height: '70px' }}
                data={{
                    labels: values.map((_, i) => i + 1),
                    datasets: [{ backgroundColor: 'rgba(255,255,255,.35)', borderColor: 'rgba(255,255,255,.55)', data: values, barPercentage: 0.6 }],
                }}
                options={common}
            />
        )
    }
    return (
        <CChartLine
            className='mt-3 mx-3'
            style={{ height: '70px' }}
            data={{
                labels: values.map((_, i) => i + 1),
                datasets: [{ backgroundColor: 'transparent', borderColor: 'rgba(255,255,255,.6)', pointBackgroundColor: 'rgba(255,255,255,.9)', data: values }],
            }}
            options={{
                ...common,
                elements: { line: { borderWidth: 2, tension: 0.4 }, point: { radius: 2, hitRadius: 10, hoverRadius: 4 } },
            }}
        />
    )
}

export type ChartDataset = { key: string; label: string; color: string }

const value = (point: SeriesPoint, key: string) => Number(point[key] ?? 0)

/** Graphique principal : une ou plusieurs séries par jour, un seul axe. */
export function TrafficChart({ series, datasets }: { series: SeriesPoint[]; datasets: ChartDataset[] }) {
    const chartRef = useRef<Chart<'line'> | null>(null)

    useEffect(() => {
        const update = () =>
            setTimeout(() => {
                const chart = chartRef.current
                const scales = chart?.options.scales
                if (!chart || !scales?.x || !scales.y) return
                if (scales.x.ticks) scales.x.ticks.color = getStyle('--cui-body-color')
                if (scales.y.ticks) scales.y.ticks.color = getStyle('--cui-body-color')
                if (scales.y.grid) scales.y.grid.color = getStyle('--cui-border-color-translucent')
                chart.update()
            })
        document.documentElement.addEventListener('ColorSchemeChange', update)
        return () => document.documentElement.removeEventListener('ColorSchemeChange', update)
    }, [])

    const max = Math.max(4, ...datasets.flatMap((d) => series.map((point) => value(point, d.key))))

    return (
        <CChartLine
            ref={chartRef}
            style={{ height: '300px', marginTop: '30px' }}
            data={{
                labels: series.map((point) => formatDay(point.date)),
                datasets: datasets.map((d, i) => ({
                    label: d.label,
                    data: series.map((point) => value(point, d.key)),
                    borderColor: getStyle(`--cui-${d.color}`),
                    pointHoverBackgroundColor: getStyle(`--cui-${d.color}`),
                    backgroundColor: i === 0 ? `rgba(${getStyle(`--cui-${d.color}-rgb`)}, .12)` : 'transparent',
                    fill: i === 0,
                    borderWidth: 2,
                })),
            }}
            options={{
                maintainAspectRatio: false,
                interaction: { mode: 'index', intersect: false },
                plugins: { legend: { display: false } },
                scales: {
                    x: { grid: { drawOnChartArea: false }, ticks: { color: getStyle('--cui-body-color'), maxTicksLimit: 10 } },
                    y: {
                        beginAtZero: true,
                        suggestedMax: max,
                        grid: { color: getStyle('--cui-border-color-translucent') },
                        ticks: { color: getStyle('--cui-body-color'), maxTicksLimit: 5, precision: 0 },
                    },
                },
                elements: { line: { tension: 0.4 }, point: { radius: 0, hitRadius: 10, hoverRadius: 4, hoverBorderWidth: 3 } },
            }}
        />
    )
}

/** Légende sous le graphique : chaque série avec son total (identité jamais portée par la seule couleur). */
export function ChartLegend({ series, datasets }: { series: SeriesPoint[]; datasets: ChartDataset[] }) {
    return (
        <div className='d-flex flex-wrap gap-4 mt-3'>
            {datasets.map((d) => (
                <div key={d.key} className='d-flex align-items-center gap-2'>
                    <span className='d-inline-block rounded' style={{ width: 14, height: 4, background: getStyle(`--cui-${d.color}`) }} aria-hidden='true' />
                    <span className='text-body-secondary'>{d.label}</span>
                    <strong>{series.reduce((sum, point) => sum + value(point, d.key), 0)}</strong>
                </div>
            ))}
        </div>
    )
}

/** Indicateur clé : icône dans un carré plein, libellé et chiffre à droite, évolution en pied. */
export function KpiCard({
    icon,
    title,
    value,
    change,
    caption,
}: {
    icon: ReactNode
    title: string
    value: ReactNode
    /** Évolution en % par rapport à la période précédente ; null = pas de comparaison possible. */
    change?: number | null
    caption: string
}) {
    return (
        <div className='bo-kpi card h-100'>
            <div className='bo-kpi-body'>
                <span className='bo-kpi-icon' aria-hidden='true'>
                    {icon}
                </span>
                <div className='text-end'>
                    <div className='bo-kpi-title'>{title}</div>
                    <div className='bo-kpi-value'>{value}</div>
                </div>
            </div>
            <div className='bo-kpi-footer'>
                {change !== undefined && change !== null && (
                    <strong className={change >= 0 ? 'text-success' : 'text-danger'}>
                        {change > 0 ? '+' : ''}
                        {change} %{' '}
                    </strong>
                )}
                <span>{caption}</span>
            </div>
        </div>
    )
}

/** Carte graphique : courbe ou barres d'une seule série, titre, résumé et pied daté. */
export function ChartCard({
    series,
    dataKey,
    type = 'line',
    color,
    title,
    subtitle,
    footer,
}: {
    series: SeriesPoint[]
    dataKey: string
    type?: 'line' | 'bar'
    /** Couleur de marque (hexadécimal). */
    color: string
    title: string
    subtitle: string
    footer: string
}) {
    const values = series.map((point) => Number(point[dataKey] ?? 0))
    const labels = series.map((point) => formatDay(String(point.date)))
    const grid = { color: 'rgba(100, 116, 139, .18)', borderDash: [4, 4] }
    const ticks = { color: '#64748b', maxTicksLimit: 6, precision: 0, maxRotation: 0, autoSkipPadding: 12 }
    const options = {
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
            x: { grid: { ...grid, drawTicks: false }, border: { dash: [4, 4], display: false }, ticks },
            y: { beginAtZero: true, grid: { ...grid, drawTicks: false }, border: { dash: [4, 4], display: false }, ticks: { ...ticks, maxTicksLimit: 6 } },
        },
    }
    return (
        <div className='bo-chart-card card h-100'>
            <div className='bo-chart-area'>
                {type === 'bar' ? (
                    <CChartBar
                        style={{ height: '200px' }}
                        data={{ labels, datasets: [{ data: values, backgroundColor: color, borderRadius: 4, barPercentage: 0.35, label: title }] }}
                        options={options}
                    />
                ) : (
                    <CChartLine
                        style={{ height: '200px' }}
                        data={{
                            labels,
                            datasets: [
                                {
                                    data: values,
                                    label: title,
                                    borderColor: color,
                                    backgroundColor: color,
                                    pointBackgroundColor: color,
                                    borderWidth: 3,
                                    tension: 0,
                                    pointRadius: values.length > 14 ? 2 : 4,
                                },
                            ],
                        }}
                        options={options}
                    />
                )}
            </div>
            <div className='bo-chart-text'>
                <h3 className='h6 fw-bold mb-1'>{title}</h3>
                <p className='small text-body-secondary mb-0'>{subtitle}</p>
            </div>
            <div className='bo-chart-footer'>
                <span className='bo-clock' aria-hidden='true' />
                {footer}
            </div>
        </div>
    )
}
