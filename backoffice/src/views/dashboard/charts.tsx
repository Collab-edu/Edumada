'use client'
import { useEffect, useRef } from 'react'
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
