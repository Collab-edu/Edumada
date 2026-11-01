'use client'
import { useId } from 'react'

const MAP_PATH =
    'M98.6 30.0 L100.9 34.9 L106.2 43.3 L108.8 51.7 L110.8 62.9 L114.5 78.3 L110.8 85.3 L106.2 90.9 L102.9 102.1 L100.3 113.3 L96.3 128.7 L91.1 145.5 L87.1 159.5 L81.9 174.9 L76.6 191.7 L70.0 211.3 L63.4 214.8 L54.2 219.7 L43.7 221.1 L35.8 216.9 L30.5 207.1 L25.3 193.1 L23.9 180.5 L20.0 170.7 L22.6 160.9 L29.2 149.7 L34.5 139.9 L33.2 128.7 L29.2 114.7 L29.2 103.5 L34.5 92.3 L41.1 89.5 L55.5 83.9 L63.4 75.5 L72.6 71.3 L79.2 62.9 L81.9 53.1 L87.1 50.3 L92.4 40.5 Z'

/** Logo animé : Madagascar qui se remplit, avec la toque au-dessus. */
export function EduLoaderMark({ size = 72 }: { size?: number }) {
    const clipId = `edu-clip-${useId().replace(/[^a-zA-Z0-9]/g, '')}`
    return (
        <svg viewBox='0 0 230 270' width={size} height={Math.round((size * 270) / 230)} aria-hidden='true' style={{ display: 'block', overflow: 'visible' }}>
            <defs>
                <clipPath id={clipId}>
                    <path transform='translate(50 30)' d={MAP_PATH} />
                </clipPath>
            </defs>
            <path transform='translate(50 30)' d={MAP_PATH} fill='#EEF3F4' />
            <g clipPath={`url(#${clipId})`}>
                <g className='edu-loader-fill'>
                    <rect x='-40' y='0' width='310' height='182' fill='#FF3B52' />
                    <rect x='-40' y='182' width='310' height='120' fill='#0F4C5C' />
                    <path className='edu-loader-wave' d='M-40 6 Q 0 -8 40 6 T 120 6 T 200 6 T 280 6 V 20 H -40 Z' fill='#FF3B52' />
                </g>
            </g>
            <path className='edu-loader-draw' transform='translate(50 30)' d={MAP_PATH} fill='none' stroke='#0F4C5C' strokeWidth='4' strokeLinejoin='round' pathLength={100} />
            <g className='edu-loader-cap'>
                <g transform='rotate(-8 130 45)'>
                    <path d='M104 52 L104 72 Q130 84 158 72 L158 52 Z' fill='#D92E44' />
                    <polygon points='70,42 132,18 190,42 130,64' fill='#FF3B52' stroke='#f7f8f9' strokeWidth='3' strokeLinejoin='round' />
                    <polyline points='130,41 182,46 182,82' fill='none' stroke='#FF3B52' strokeWidth='2.5' />
                    <path d='M177 82 L187 82 L190 100 L174 100 Z' fill='#FF3B52' />
                </g>
            </g>
        </svg>
    )
}

function Label({ text }: { text: string }) {
    return (
        <span className='bo-loader-label'>
            {text}
            <span aria-hidden='true'>
                <span className='edu-loader-dot'>.</span>
                <span className='edu-loader-dot' style={{ animationDelay: '.15s' }}>.</span>
                <span className='edu-loader-dot' style={{ animationDelay: '.3s' }}>.</span>
            </span>
        </span>
    )
}

/** Ouverture du back-office : plein écran sur fond bleu. */
export function EduFullLoader() {
    return (
        <div className='bo-loader-full' role='status' aria-busy='true'>
            <span className='bo-loader-disc'>
                <EduLoaderMark size={96} />
            </span>
            <Label text='Chargement' />
        </div>
    )
}

/** Chargement d'un bloc ou d'une page dans le back-office. */
export function EduBlockLoader() {
    return (
        <div className='bo-loader-block' role='status' aria-busy='true'>
            <EduLoaderMark size={56} />
            <Label text='Chargement' />
        </div>
    )
}
