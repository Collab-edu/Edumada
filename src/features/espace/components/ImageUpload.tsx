'use client'
import { useState } from 'react'
import Image from 'next/image'
import { Icon } from '@iconify/react/dist/iconify.js'
import { api, ApiError } from '@/lib/api'
import { cn } from '@/lib/utils'

async function upload(file: File): Promise<string> {
    const body = new FormData()
    body.append('image', file)
    const res = await api<{ url: string }>('/uploads', { method: 'POST', body })
    return res.url
}

interface ImageUploadProps {
    label: string
    hint?: string
    /** Une seule image (valeur texte) ou plusieurs (liste). */
    value: string | string[]
    onChange: (value: string | string[]) => void
    max?: number
}

/**
 * Envoi d'images (JPG, PNG, WebP, 4 Mo max) vers l'API ; enregistre les URL renvoyées.
 * Mode simple (`value` texte) ou galerie (`value` liste).
 */
export function ImageUpload({ label, hint, value, onChange, max = 8 }: ImageUploadProps) {
    const multiple = Array.isArray(value)
    const images = multiple ? value : value ? [value] : []
    const [uploading, setUploading] = useState(false)
    const [error, setError] = useState('')

    const onFiles = async (files: FileList | null) => {
        if (!files?.length) return
        setUploading(true)
        setError('')
        try {
            const selected = Array.from(files).slice(0, multiple ? max - images.length : 1)
            const urls: string[] = []
            for (const file of selected) urls.push(await upload(file))
            onChange(multiple ? [...images, ...urls] : urls[0])
        } catch (err) {
            setError((err as ApiError).field?.('image') ?? (err as Error).message)
        } finally {
            setUploading(false)
        }
    }

    const remove = (url: string) => onChange(multiple ? images.filter((u) => u !== url) : '')

    return (
        <div className='flex flex-col gap-1.5'>
            <span className='text-sm font-semibold text-secondary'>{label}</span>
            <div className={cn('grid gap-3', multiple ? 'grid-cols-2 sm:grid-cols-4' : 'grid-cols-1 sm:grid-cols-2')}>
                {images.map((url) => (
                    <div key={url} className='relative h-32 overflow-hidden rounded-xl bg-cream'>
                        <Image src={url} alt='' fill className='object-cover' />
                        <button
                            type='button'
                            onClick={() => remove(url)}
                            aria-label="Retirer l'image"
                            className='absolute top-2 right-2 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-primary shadow hover:cursor-pointer'>
                            <Icon icon='tabler:trash' />
                        </button>
                    </div>
                ))}
                {(multiple ? images.length < max : images.length === 0) && (
                    <label className='flex h-32 flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-secondary/20 bg-white text-center hover:border-primary hover:cursor-pointer'>
                        {uploading ? (
                            <span className='h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent' aria-label='Envoi en cours' />
                        ) : (
                            <>
                                <Icon icon='tabler:photo-plus' className='text-2xl text-primary' />
                                <span className='text-sm font-semibold text-secondary'>Ajouter</span>
                            </>
                        )}
                        <input type='file' accept='image/jpeg,image/png,image/webp' multiple={multiple} className='sr-only' disabled={uploading} onChange={(e) => onFiles(e.target.files)} />
                    </label>
                )}
            </div>
            {error ? <p className='text-sm text-primary'>{error}</p> : hint && <p className='text-sm text-ink/60'>{hint}</p>}
        </div>
    )
}

export default ImageUpload
