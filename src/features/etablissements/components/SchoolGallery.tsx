'use client'
import { useCallback, useEffect, useState } from 'react'
import Image from 'next/image'
import { Icon } from '@/components/ui/icon'

/** Nombre de vignettes affichées en grille ; les suivantes sont accessibles depuis la visionneuse (« +3 »). */
const VISIBLE = 6

/**
 * Galerie photos de la fiche : carrousel au doigt sur mobile, grille régulière (4:3) sur grand écran.
 * Les photos sont cadrées vers le haut pour ne pas couper les visages ; un clic les ouvre en entier.
 */
export default function SchoolGallery({ photos, name }: { photos: string[]; name: string }) {
    const [open, setOpen] = useState<number | null>(null)
    const hidden = photos.length - VISIBLE
    const alt = (i: number) => `${name} — photo ${i + 1}`

    return (
        <>
            {/* Mobile : défilement horizontal, une photo et demie visible pour inviter à glisser. */}
            <div className='-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2 md:hidden'>
                {photos.map((src, i) => (
                    <button
                        key={src}
                        type='button'
                        onClick={() => setOpen(i)}
                        aria-label={`Agrandir la photo ${i + 1}`}
                        className='relative aspect-[4/3] w-[78%] shrink-0 snap-start overflow-hidden rounded-xl bg-cream'>
                        <Image src={src} alt={alt(i)} fill sizes='80vw' className='object-cover object-[center_20%]' />
                    </button>
                ))}
            </div>

            {/* Grand écran : grille régulière, sans case vide. */}
            <div className='hidden grid-cols-3 gap-3 md:grid'>
                {photos.slice(0, VISIBLE).map((src, i) => {
                    const more = i === VISIBLE - 1 && hidden > 0
                    return (
                        <button
                            key={src}
                            type='button'
                            onClick={() => setOpen(i)}
                            aria-label={more ? `Voir les ${hidden + 1} autres photos` : `Agrandir la photo ${i + 1}`}
                            className='group relative aspect-[4/3] overflow-hidden rounded-xl bg-cream hover:cursor-pointer'>
                            <Image
                                src={src}
                                alt={alt(i)}
                                fill
                                sizes='(min-width: 1280px) 280px, 33vw'
                                className='object-cover object-[center_20%] transition-transform duration-300 group-'
                            />
                            {more && (
                                <span className='absolute inset-0 flex items-center justify-center bg-secondary/60 text-2xl font-bold text-white'>
                                    +{hidden + 1}
                                </span>
                            )}
                        </button>
                    )
                })}
            </div>

            {open !== null && <Viewer photos={photos} index={open} onIndex={setOpen} onClose={() => setOpen(null)} alt={alt} />}
        </>
    )
}

/** Visionneuse plein écran : photo entière, flèches, clavier (← → Échap). */
function Viewer({ photos, index, onIndex, onClose, alt }: { photos: string[]; index: number; onIndex: (i: number) => void; onClose: () => void; alt: (i: number) => string }) {
    const go = useCallback((step: number) => onIndex((index + step + photos.length) % photos.length), [index, onIndex, photos.length])

    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose()
            if (e.key === 'ArrowRight') go(1)
            if (e.key === 'ArrowLeft') go(-1)
        }
        const overflow = document.body.style.overflow
        document.body.style.overflow = 'hidden'
        window.addEventListener('keydown', onKey)
        return () => {
            document.body.style.overflow = overflow
            window.removeEventListener('keydown', onKey)
        }
    }, [go, onClose])

    const arrow = 'absolute top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/15 text-2xl text-white hover:bg-white/30 hover:cursor-pointer'

    return (
        <div role='dialog' aria-modal='true' aria-label='Photos' className='fixed inset-0 z-[100] flex items-center justify-center bg-black/90' onClick={onClose}>
            <div className='relative h-[80vh] w-full max-w-5xl px-4' onClick={(e) => e.stopPropagation()}>
                <Image src={photos[index]} alt={alt(index)} fill sizes='100vw' className='object-contain' />
                {photos.length > 1 && (
                    <>
                        <button type='button' onClick={() => go(-1)} aria-label='Photo précédente' className={`${arrow} left-2`}>
                            <Icon icon='tabler:chevron-left' />
                        </button>
                        <button type='button' onClick={() => go(1)} aria-label='Photo suivante' className={`${arrow} right-2`}>
                            <Icon icon='tabler:chevron-right' />
                        </button>
                    </>
                )}
            </div>
            <button type='button' onClick={onClose} aria-label='Fermer' className='absolute right-4 top-4 flex h-11 w-11 items-center justify-center rounded-full bg-white/15 text-2xl text-white hover:bg-white/30 hover:cursor-pointer'>
                <Icon icon='tabler:x' />
            </button>
            <p className='absolute bottom-5 left-1/2 -translate-x-1/2 text-sm text-white/80'>
                {index + 1} / {photos.length}
            </p>
        </div>
    )
}
