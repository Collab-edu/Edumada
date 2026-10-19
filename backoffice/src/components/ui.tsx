'use client'
import { useState, type ReactNode } from 'react'
import {
    CAlert,
    CBadge,
    CButton,
    CCard,
    CCardBody,
    CCardHeader,
    CFormFeedback,
    CFormInput,
    CFormLabel,
    CInputGroup,
    CPagination,
    CPaginationItem,
    CSpinner,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilImagePlus, cilPlus, cilTrash, cilX } from '@coreui/icons'
import { api, assetUrl, errorMessage } from '@/lib/api'
import type { Paginated } from '@/lib/types'

/** Carte de page : titre, sous-titre, actions à droite. */
export function PageCard({
    title,
    subtitle,
    actions,
    children,
    className = 'mb-4',
    bodyClassName,
}: {
    title?: ReactNode
    subtitle?: ReactNode
    actions?: ReactNode
    children?: ReactNode
    className?: string
    bodyClassName?: string
}) {
    return (
        <CCard className={className}>
            {(title || actions) && (
                <CCardHeader className='d-flex flex-wrap align-items-center gap-2 py-3'>
                    <div className='me-auto'>
                        <h5 className='mb-0'>{title}</h5>
                        {subtitle && <div className='small text-body-secondary'>{subtitle}</div>}
                    </div>
                    {actions}
                </CCardHeader>
            )}
            <CCardBody className={bodyClassName}>{children}</CCardBody>
        </CCard>
    )
}

export function Loading() {
    return (
        <div className='py-5 text-center'>
            <CSpinner color='primary' />
        </div>
    )
}

export function EmptyState({ title, children, action }: { title: ReactNode; children?: ReactNode; action?: ReactNode }) {
    return (
        <div className='text-center py-5'>
            <h5>{title}</h5>
            {children && <p className='text-body-secondary mb-3'>{children}</p>}
            {action}
        </div>
    )
}

export function ErrorAlert({ error }: { error: unknown }) {
    if (!error) return null
    return <CAlert color='danger'>{errorMessage(error)}</CAlert>
}

const STATUS_COLORS: Record<string, string> = {
    draft: 'secondary',
    pending_review: 'warning',
    published: 'success',
    suspended: 'danger',
    archived: 'dark',
    pending: 'warning',
    paid: 'success',
    cancelled: 'secondary',
    active: 'success',
    paused: 'warning',
    ended: 'secondary',
    grace: 'warning',
    expired: 'danger',
    new: 'danger',
    in_review: 'info',
    information_requested: 'warning',
    interview: 'primary',
    accepted: 'success',
    refused: 'secondary',
    open: 'danger',
    resolved: 'success',
    dismissed: 'secondary',
    approved: 'success',
    rejected: 'secondary',
}

export function StatusBadge({ status, children }: { status: string; children: ReactNode }) {
    return <CBadge color={STATUS_COLORS[status] ?? 'secondary'}>{children}</CBadge>
}

/** Liste de textes éditable (objectifs, pièces à fournir…). */
export function ListInput({
    label,
    value,
    onChange,
    placeholder,
    error,
    max,
    hint,
}: {
    label: string
    value: string[]
    onChange: (value: string[]) => void
    placeholder?: string
    error?: string
    /** Nombre maximum d'éléments (limite de la formule) ; au-delà, l'ajout est bloqué. */
    max?: number | null
    hint?: string
}) {
    const [draft, setDraft] = useState('')
    const full = max != null && value.length >= max
    const add = () => {
        const text = draft.trim()
        if (text && !full && !value.includes(text)) onChange([...value, text])
        setDraft('')
    }
    return (
        <div className='mb-3'>
            <CFormLabel>{label}</CFormLabel>
            {value.length > 0 && (
                <div className='d-flex flex-wrap gap-2 mb-2'>
                    {value.map((item, i) => (
                        <CBadge key={`${item}-${i}`} color='light' textColor='dark' className='d-inline-flex align-items-center gap-1 border fw-normal fs-6 py-2'>
                            {item}
                            <CButton
                                size='sm'
                                color='link'
                                className='p-0 ms-1 text-danger'
                                aria-label={`Retirer ${item}`}
                                onClick={() => onChange(value.filter((_, j) => j !== i))}
                            >
                                <CIcon icon={cilX} size='sm' />
                            </CButton>
                        </CBadge>
                    ))}
                </div>
            )}
            <CInputGroup>
                <CFormInput
                    value={draft}
                    disabled={full}
                    placeholder={full ? 'Limite atteinte' : (placeholder ?? 'Ajouter puis Entrée')}
                    onChange={(e) => setDraft(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            e.preventDefault()
                            add()
                        }
                    }}
                    invalid={!!error}
                />
                <CButton color='secondary' variant='outline' onClick={add} disabled={full} aria-label={`Ajouter à ${label}`}>
                    <CIcon icon={cilPlus} />
                </CButton>
            </CInputGroup>
            {hint && <div className='form-text'>{hint}</div>}
            {error && (
                <CFormFeedback invalid className='d-block'>
                    {error}
                </CFormFeedback>
            )}
        </div>
    )
}

type ImageUploadProps = { label: string; max?: number } & (
    | { value: string[]; onChange: (value: string[]) => void }
    | { value: string; onChange: (value: string) => void }
)

/** Envoi d'images vers l'API : une seule (texte) ou une galerie (liste). */
export function ImageUpload(props: ImageUploadProps) {
    const { label, max = 8 } = props
    const multiple = Array.isArray(props.value)
    const images = Array.isArray(props.value) ? props.value : props.value ? [props.value] : []
    const [busy, setBusy] = useState(false)
    const [error, setError] = useState('')

    const emit = (next: string[]) => {
        if (Array.isArray(props.value)) (props.onChange as (v: string[]) => void)(next)
        else (props.onChange as (v: string) => void)(next[0] ?? '')
    }

    const upload = async (files: FileList | null) => {
        if (!files?.length) return
        setBusy(true)
        setError('')
        try {
            const urls: string[] = []
            for (const file of Array.from(files).slice(0, multiple ? max - images.length : 1)) {
                const body = new FormData()
                body.append('image', file)
                urls.push((await api<{ url: string }>('/uploads', { method: 'POST', body })).url)
            }
            emit(multiple ? [...images, ...urls] : urls)
        } catch (err) {
            setError(errorMessage(err))
        } finally {
            setBusy(false)
        }
    }

    return (
        <div className='mb-3'>
            <CFormLabel>{label}</CFormLabel>
            <div className='d-flex flex-wrap gap-2'>
                {images.map((url) => (
                    <div key={url} className='position-relative'>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={assetUrl(url)} alt='' className='bo-thumb' style={{ width: 140, height: 94 }} />
                        <CButton
                            size='sm'
                            color='danger'
                            className='position-absolute top-0 end-0 m-1'
                            aria-label="Retirer l'image"
                            onClick={() => emit(images.filter((u) => u !== url))}
                        >
                            <CIcon icon={cilTrash} size='sm' />
                        </CButton>
                    </div>
                ))}
                {(multiple ? images.length < max : images.length === 0) && (
                    <label
                        className='d-flex flex-column align-items-center justify-content-center border border-2 rounded text-body-secondary'
                        style={{ width: 140, height: 94, borderStyle: 'dashed', cursor: 'pointer' }}
                    >
                        {busy ? <CSpinner size='sm' /> : <CIcon icon={cilImagePlus} size='xl' />}
                        <span className='small'>Ajouter</span>
                        <input type='file' accept='image/jpeg,image/png,image/webp' multiple={multiple} hidden disabled={busy} onChange={(e) => upload(e.target.files)} />
                    </label>
                )}
            </div>
            {error && <div className='small text-danger mt-1'>{error}</div>}
        </div>
    )
}

/** Pagination Laravel (meta.current_page / meta.last_page). */
export function Pager({ meta, onChange }: { meta?: Paginated<unknown>['meta']; onChange: (page: number) => void }) {
    if (!meta || meta.last_page <= 1) return null
    const { current_page: page, last_page: last } = meta
    return (
        <CPagination className='justify-content-center mt-3 mb-0' aria-label='Pagination'>
            <CPaginationItem disabled={page <= 1} onClick={() => onChange(page - 1)} style={{ cursor: 'pointer' }}>
                Précédent
            </CPaginationItem>
            <CPaginationItem active>
                {page} / {last}
            </CPaginationItem>
            <CPaginationItem disabled={page >= last} onClick={() => onChange(page + 1)} style={{ cursor: 'pointer' }}>
                Suivant
            </CPaginationItem>
        </CPagination>
    )
}

const PLAN_BADGES: Record<string, { color: string; label: string }> = {
    free: { color: 'secondary', label: 'Gratuit' },
    pro: { color: 'primary', label: 'Pro' },
    premium: { color: 'danger', label: 'Premium' },
}

/** Formule d'un établissement : Gratuit (gris), Pro (sarcelle), Premium (rouge). */
/** Formule choisie à l'inscription, pas encore payée. */
export function RequestedPlanBadge({ plan, className }: { plan: { name: string; billingCycle: string }; className?: string }) {
    return (
        <CBadge color='warning' textColor='dark' className={className} title="Formule choisie à l'inscription, pas encore activée">
            Souhaite {plan.name} · {plan.billingCycle === 'yearly' ? 'annuel' : 'mensuel'}
        </CBadge>
    )
}

export function PlanBadge({ code, className }: { code: string; className?: string }) {
    const plan = PLAN_BADGES[code] ?? PLAN_BADGES.free
    return (
        <CBadge color={plan.color} className={className}>
            {plan.label}
        </CBadge>
    )
}
