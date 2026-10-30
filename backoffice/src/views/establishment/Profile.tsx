'use client'
import { useState } from 'react'
import Link from 'next/link'
import { CAlert, CBadge, CButton, CCol, CListGroup, CListGroupItem, CRow } from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilBell, cilCalendar, cilChartLine, cilCheckCircle, cilClock, cilEducation, cilExternalLink, cilImage, cilInbox, cilPencil, cilPeople, cilShieldAlt, cilWarning } from '@coreui/icons'
import { useCurrentEstablishment } from '@/context/EstablishmentContext'
import { useToast } from '@/context/ToastContext'
import { api, assetUrl, errorMessage, SITE_URL } from '@/lib/api'
import { useApi } from '@/lib/useApi'
import { formatDate, formatDateTime } from '@/lib/format'
import type { Report } from '@/lib/types'
import { PageCard, StatusBadge } from '@/components/ui'
import EstablishmentForm from './EstablishmentForm'

/** Encadré d'état de la fiche, en tête de la colonne de droite. */
const STATE: Record<string, { tone: string; icon: string[]; title: string; text: string }> = {
    published: { tone: 'success', icon: cilCheckCircle, title: 'Établissement publié', text: 'Votre fiche est visible sur le site Edumada.' },
    pending_review: { tone: 'warning', icon: cilClock, title: 'En attente de validation', text: 'Edumada vérifie votre fiche avant de la publier.' },
    draft: { tone: 'secondary', icon: cilPencil, title: 'Brouillon', text: 'Complétez la fiche pour demander sa publication.' },
    suspended: { tone: 'danger', icon: cilWarning, title: 'Fiche suspendue', text: 'Elle n’apparaît plus sur le site. Contactez Edumada.' },
}

const initials = (name: string) =>
    name
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((word) => word[0].toUpperCase())
        .join('')

export default function Profile() {
    const { current: e, reload } = useCurrentEstablishment()
    const toast = useToast()
    const { data: reports } = useApi<{ data: Report[] }>(`/establishments/${e.id}/reports`)
    const [requesting, setRequesting] = useState(false)
    const open = (reports?.data ?? []).filter((r) => r.status === 'open')
    const state = STATE[e.status] ?? STATE.draft
    const siteUrl = `${SITE_URL}/etablissements/${e.id}/`

    const tabs = [
        { label: 'Informations', icon: cilEducation, href: '/fiche/', active: true },
        { label: 'Offres', icon: cilEducation, href: '/offres/' },
        { label: 'Galerie', icon: cilImage, href: '#bo-photos' },
        { label: 'Demandes', icon: cilInbox, href: '/demandes/' },
        { label: 'Statistiques', icon: cilChartLine, href: '/statistiques/' },
    ]

    const requestVerification = async () => {
        setRequesting(true)
        try {
            await api(`/establishments/${e.id}/verification-request`, { method: 'POST' })
            toast.success('Demande envoyée : Edumada vous contactera pour la vérification.')
            reload()
        } catch (err) {
            toast.error(errorMessage(err))
        } finally {
            setRequesting(false)
        }
    }

    const edit = () => {
        const first = document.querySelector<HTMLInputElement>('form input')
        first?.scrollIntoView({ behavior: 'smooth', block: 'center' })
        first?.focus({ preventScroll: true })
    }

    return (
        <div className='bo-fiche'>
            {/* Couverture */}
            <div className='bo-cover'>
                {e.imageSrc && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={assetUrl(e.imageSrc)} alt='' className='bo-cover-img' />
                )}
                <div className='bo-cover-inner'>
                    <div className='bo-cover-logo'>
                        {e.logo ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={assetUrl(e.logo)} alt={`Logo de ${e.name}`} />
                        ) : (
                            <span>{initials(e.name)}</span>
                        )}
                    </div>
                    <div className='bo-cover-text'>
                        <h1>{e.name}</h1>
                        <p>{[e.subCategory || e.category, e.city].filter(Boolean).join(' · ')}</p>
                        <StatusBadge status={e.status}>{e.statusLabel}</StatusBadge>
                    </div>
                    <div className='bo-cover-actions'>
                        {e.status === 'published' && (
                            <CButton color='light' href={siteUrl} target='_blank' rel='noopener noreferrer'>
                                <CIcon icon={cilExternalLink} className='me-2' />
                                Voir sur le site
                            </CButton>
                        )}
                        <CButton color='danger' className='text-white' onClick={edit}>
                            <CIcon icon={cilPencil} className='me-2' />
                            Modifier
                        </CButton>
                    </div>
                </div>
            </div>

            {/* Onglets */}
            <nav className='bo-page-tabs mb-4' aria-label='Sections de la fiche'>
                {tabs.map((tab) => (
                    <Link key={tab.label} href={tab.href} className={tab.active ? 'active' : undefined} aria-current={tab.active ? 'page' : undefined}>
                        <CIcon icon={tab.icon} />
                        {tab.label}
                    </Link>
                ))}
            </nav>

            <CRow>
                <CCol xl={8}>
                    {e.status === 'suspended' && <CAlert color='danger'>Fiche suspendue : elle n&apos;apparaît plus sur le site.</CAlert>}
                    <EstablishmentForm key={e.updatedAt} establishment={e} onSaved={() => reload()} />
                </CCol>
                <CCol xl={4}>
                    {e.status === 'published' ? (
                        <a href={siteUrl} target='_blank' rel='noopener noreferrer' className={`bo-state-card is-${state.tone} mb-4`}>
                            <span className='bo-state-icon'>
                                <CIcon icon={state.icon} size='lg' />
                            </span>
                            <span className='me-auto'>
                                <strong>{state.title}</strong>
                                <small>{state.text}</small>
                            </span>
                            <CIcon icon={cilExternalLink} />
                        </a>
                    ) : (
                        <div className={`bo-state-card is-${state.tone} mb-4`}>
                            <span className='bo-state-icon'>
                                <CIcon icon={state.icon} size='lg' />
                            </span>
                            <span>
                                <strong>{state.title}</strong>
                                <small>{state.text}</small>
                            </span>
                        </div>
                    )}

                    <PageCard icon={cilShieldAlt} title='Statut'>
                        <CListGroup flush>
                            <CListGroupItem className='d-flex justify-content-between align-items-center px-0 bg-transparent'>
                                Publication <StatusBadge status={e.status}>{e.statusLabel}</StatusBadge>
                            </CListGroupItem>
                            <CListGroupItem className='d-flex justify-content-between align-items-center px-0 bg-transparent'>
                                Formule <CBadge color={e.plan.code === 'premium' ? 'danger' : e.plan.code === 'pro' ? 'primary' : 'secondary'}>{e.plan.name}</CBadge>
                            </CListGroupItem>
                            <CListGroupItem className='d-flex justify-content-between align-items-center px-0 bg-transparent'>
                                Vérification{' '}
                                <StatusBadge status={e.verification.status === 'Vérifié' ? 'approved' : e.verification.status === 'En cours' ? 'pending' : 'draft'}>
                                    {e.verification.status}
                                </StatusBadge>
                            </CListGroupItem>
                            <CListGroupItem className='d-flex flex-wrap justify-content-between align-items-center gap-1 px-0 bg-transparent'>
                                Dernière mise à jour
                                <span className='text-body-secondary text-nowrap'>
                                    <CIcon icon={cilCalendar} size='sm' className='me-1' />
                                    {formatDate(e.updatedAt)}
                                </span>
                            </CListGroupItem>
                        </CListGroup>
                        {e.verification.status === 'Non vérifié' && (
                            <CButton color='primary' variant='outline' className='mt-3 w-100' disabled={requesting} onClick={requestVerification}>
                                Demander le badge « vérifié »
                            </CButton>
                        )}
                        <p className='bo-fiche-note mt-3 mb-0'>Le badge est attribué après un contrôle réel par Edumada ; il ne s&apos;achète pas.</p>
                    </PageCard>

                    <PageCard icon={cilBell} title='Signalements' subtitle='Informations jugées inexactes par des visiteurs'>
                        {open.length === 0 ? (
                            <p className='bo-empty-note mb-0'>Aucun signalement ouvert.</p>
                        ) : (
                            <CListGroup flush>
                                {open.map((r) => (
                                    <CListGroupItem key={r.id} className='px-0 bg-transparent'>
                                        <div className='d-flex justify-content-between'>
                                            <CBadge color='danger'>{r.reasonLabel}</CBadge>
                                            <span className='small text-body-secondary'>{formatDateTime(r.createdAt)}</span>
                                        </div>
                                        {r.offer && <div className='small fw-semibold mt-1'>{r.offer.title}</div>}
                                        <div className='mt-1'>{r.message}</div>
                                    </CListGroupItem>
                                ))}
                            </CListGroup>
                        )}
                    </PageCard>

                    {e.members && (
                        <PageCard icon={cilPeople} title='Équipe' subtitle='Pour ajouter un collègue, écrivez à Edumada'>
                            <CListGroup flush>
                                {e.members.map((m) => (
                                    <CListGroupItem key={m.id} className='d-flex align-items-center gap-3 px-0 bg-transparent'>
                                        <span className='bo-member-avatar'>{initials(m.name)}</span>
                                        <div className='me-auto' style={{ minWidth: 0 }}>
                                            <div className='fw-semibold text-truncate'>{m.name}</div>
                                            <div className='small text-body-secondary text-truncate'>{m.email}</div>
                                        </div>
                                        <CBadge color='light' textColor='dark' className='border'>
                                            {m.role === 'owner' ? 'Propriétaire' : 'Éditeur'}
                                        </CBadge>
                                    </CListGroupItem>
                                ))}
                            </CListGroup>
                        </PageCard>
                    )}
                </CCol>
            </CRow>
        </div>
    )
}
