'use client'
import { useState } from 'react'
import { CFormInput, CPagination, CPaginationItem } from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilChevronBottom, cilChevronTop, cilEnvelopeClosed } from '@coreui/icons'
import { useApi } from '@/lib/useApi'
import { formatDate } from '@/lib/format'
import type { AdminUser, Paginated } from '@/lib/types'
import { EmptyState, Loading, PageCard } from '@/components/ui'
import PageBanner from '@/components/PageBanner'

/** Couleurs d'avatar, choisies d'après l'identifiant pour rester stables. */
const AVATARS = [
    { background: '#ffe5e8', color: '#ff3b52' },
    { background: '#dbe7ea', color: '#0f4c5c' },
    { background: '#e3eeeb', color: '#2f6b5f' },
    { background: '#fdf0d5', color: '#9a6700' },
]

const initials = (name: string) =>
    name
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((word) => word[0].toUpperCase())
        .join('')

/** Statut d'un étudiant d'après son activité sur Edumada. */
function status(user: AdminUser) {
    return user.inquiriesCount > 0
        ? { label: 'Actif', color: '#16a34a', text: `${user.inquiriesCount} demande${user.inquiriesCount > 1 ? 's' : ''}` }
        : { label: 'Inscrit', color: '#94a3b8', text: 'Aucune demande' }
}

/** Pages affichées autour de la page courante : 1 … 4 5 6 … 12 */
function pageNumbers(page: number, last: number): (number | '…')[] {
    const pages = new Set([1, last, page - 1, page, page + 1].filter((p) => p >= 1 && p <= last))
    const sorted = [...pages].sort((a, b) => a - b)
    return sorted.flatMap((p, i) => (i > 0 && p - sorted[i - 1] > 1 ? ['…' as const, p] : [p]))
}

function Footer({ meta, onChange }: { meta: Paginated<AdminUser>['meta']; onChange: (page: number) => void }) {
    const { current_page: page, last_page: last, total, per_page: perPage } = meta
    const from = total === 0 ? 0 : (page - 1) * perPage + 1
    const to = Math.min(page * perPage, total)
    return (
        <div className='d-flex flex-wrap align-items-center justify-content-between gap-3 mt-4'>
            <span className='small text-body-secondary'>
                Affichage {from}–{to} sur {total}
            </span>
            {last > 1 && (
                <CPagination className='mb-0' aria-label='Pagination'>
                    <CPaginationItem disabled={page <= 1} onClick={() => onChange(page - 1)} style={{ cursor: 'pointer' }} aria-label='Page précédente'>
                        ‹
                    </CPaginationItem>
                    {pageNumbers(page, last).map((p, i) =>
                        p === '…' ? (
                            <CPaginationItem key={`gap-${i}`} disabled>
                                …
                            </CPaginationItem>
                        ) : (
                            <CPaginationItem key={p} active={p === page} onClick={() => onChange(p)} style={{ cursor: 'pointer' }}>
                                {p}
                            </CPaginationItem>
                        )
                    )}
                    <CPaginationItem disabled={page >= last} onClick={() => onChange(page + 1)} style={{ cursor: 'pointer' }} aria-label='Page suivante'>
                        ›
                    </CPaginationItem>
                </CPagination>
            )}
        </div>
    )
}

/** Liste des étudiants inscrits, en lignes-cartes dépliables. */
export default function Users() {
    const [filters, setFilters] = useState({ q: '', page: 1 })
    const [openId, setOpenId] = useState<number | null>(null)
    const { data } = useApi<Paginated<AdminUser>>('/admin/users', { role: 'student', ...filters })

    return (
        <>
            <PageBanner title='Étudiants' description={data ? `${data.meta.total} étudiant${data.meta.total > 1 ? 's' : ''} inscrit${data.meta.total > 1 ? 's' : ''}` : undefined} />
            <PageCard>
                <CFormInput
                    className='mb-4'
                    placeholder='Rechercher un nom, un e-mail, une ville ou un téléphone'
                    value={filters.q}
                    onChange={(e) => setFilters({ q: e.target.value, page: 1 })}
                />
                {!data ? (
                    <Loading />
                ) : data.data.length === 0 ? (
                    <EmptyState title='Aucun étudiant' />
                ) : (
                    <>
                        <div className='bo-rows' role='list'>
                            <div className='bo-rows-head' aria-hidden='true'>
                                <span>N°</span>
                                <span>Étudiant</span>
                                <span>Ville</span>
                                <span>Téléphone</span>
                                <span>Inscrit le</span>
                                <span>Demandes</span>
                                <span>Statut</span>
                                <span className='text-end'>Action</span>
                            </div>
                            {data.data.map((u) => {
                                const open = openId === u.id
                                const st = status(u)
                                const avatar = AVATARS[u.id % AVATARS.length]
                                return (
                                    <div key={u.id} className={`bo-row${open ? ' is-open' : ''}`} role='listitem'>
                                        <div className='bo-row-main'>
                                            <span className='small fw-semibold bo-col-optional'>#{u.id}</span>
                                            <div className='d-flex align-items-center gap-2' style={{ minWidth: 0 }}>
                                                <span className='bo-row-avatar' style={avatar}>
                                                    {initials(u.name)}
                                                </span>
                                                <div style={{ minWidth: 0 }}>
                                                    <div className='fw-semibold text-truncate'>{u.name}</div>
                                                    <div className='small text-body-secondary text-truncate'>{u.email}</div>
                                                </div>
                                            </div>
                                            <span className='small bo-col-optional'>{u.city || '—'}</span>
                                            <span className='small text-nowrap bo-col-optional'>
                                                {u.phone ? (
                                                    <a href={`tel:${u.phone.replace(/\s/g, '')}`} className='text-decoration-none'>
                                                        {u.phone}
                                                    </a>
                                                ) : (
                                                    '—'
                                                )}
                                            </span>
                                            <span className='small text-nowrap bo-col-optional'>{formatDate(u.createdAt)}</span>
                                            <span className='small fw-semibold bo-col-optional'>{u.inquiriesCount}</span>
                                            <span className='small text-nowrap bo-col-optional'>
                                                <span className='bo-status-dot' style={{ background: open ? '#fff' : st.color }} />
                                                <span style={{ color: open ? '#fff' : st.color }}>{st.label}</span>
                                            </span>
                                            <div className='d-flex justify-content-end gap-2'>
                                                <a href={`mailto:${u.email}`} className='bo-row-action' aria-label={`Écrire à ${u.name}`} title='Écrire un e-mail'>
                                                    <CIcon icon={cilEnvelopeClosed} size='sm' />
                                                </a>
                                                <button
                                                    type='button'
                                                    className='bo-row-action'
                                                    aria-expanded={open}
                                                    aria-label={open ? 'Masquer les détails' : 'Voir les détails'}
                                                    onClick={() => setOpenId(open ? null : u.id)}
                                                >
                                                    <CIcon icon={open ? cilChevronTop : cilChevronBottom} size='sm' />
                                                </button>
                                            </div>
                                        </div>
                                        {open && (
                                            <div className='bo-row-details small'>
                                                <div>
                                                    <div className='text-body-secondary'>E-mail</div>
                                                    <a href={`mailto:${u.email}`}>{u.email}</a>
                                                </div>
                                                <div>
                                                    <div className='text-body-secondary'>Téléphone</div>
                                                    {u.phone || '—'}
                                                </div>
                                                <div>
                                                    <div className='text-body-secondary'>Ville</div>
                                                    {u.city || '—'}
                                                </div>
                                                <div>
                                                    <div className='text-body-secondary'>Niveau d&apos;études</div>
                                                    {u.studyLevel || '—'}
                                                </div>
                                                <div>
                                                    <div className='text-body-secondary'>Inscrit le</div>
                                                    {formatDate(u.createdAt)}
                                                </div>
                                                <div>
                                                    <div className='text-body-secondary'>Activité</div>
                                                    {st.text}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )
                            })}
                        </div>
                        <Footer meta={data.meta} onChange={(page) => setFilters({ ...filters, page })} />
                    </>
                )}
            </PageCard>
        </>
    )
}
