'use client'
import { Badge } from '@/components/ui/form'
import { useApi } from '../useApi'
import { Panel, formatDateTime } from '../components/SpaceShell'
import type { Report } from '../types'
import EstablishmentForm from './EstablishmentForm'
import { EstablishmentSpace, useEstablishment } from './EstablishmentSpace'

function Profile() {
    const { establishment, reload } = useEstablishment()
    const { data: reports } = useApi<{ data: Report[] }>(`/establishments/${establishment.id}/reports`)
    const open = reports?.data.filter((r) => r.status === 'open') ?? []

    return (
        <>
            {open.length > 0 && (
                <Panel title='Signalements à vérifier' description='Des visiteurs pensent que ces informations sont inexactes. Corrigez-les si besoin : Edumada clôturera le signalement.'>
                    <ul className='flex flex-col gap-3'>
                        {open.map((report) => (
                            <li key={report.id} className='rounded-xl bg-cream/60 p-4'>
                                <div className='flex flex-wrap items-center gap-2'>
                                    <Badge tone='danger'>{report.reasonLabel}</Badge>
                                    {report.offer && <span className='text-sm font-semibold text-secondary'>{report.offer.title}</span>}
                                    <span className='text-xs text-ink/50'>{formatDateTime(report.createdAt)}</span>
                                </div>
                                <p className='mt-2 text-ink/80'>{report.message}</p>
                            </li>
                        ))}
                    </ul>
                </Panel>
            )}

            <EstablishmentForm key={establishment.updatedAt} establishment={establishment} onSaved={() => reload()} />

            {establishment.members && (
                <Panel title='Équipe' description="Les personnes qui peuvent gérer cette fiche. Pour ajouter un collègue, écrivez à Edumada.">
                    <ul className='flex flex-col divide-y divide-gray-100'>
                        {establishment.members.map((member) => (
                            <li key={member.id} className='flex flex-wrap items-center justify-between gap-2 py-3'>
                                <span className='flex flex-col'>
                                    <span className='font-semibold text-secondary'>{member.name}</span>
                                    <span className='text-sm text-ink/60'>{member.email}</span>
                                </span>
                                <Badge tone='info'>{member.role === 'owner' ? 'Propriétaire' : 'Éditeur'}</Badge>
                            </li>
                        ))}
                    </ul>
                </Panel>
            )}
        </>
    )
}

export default function ProfilePage() {
    return (
        <EstablishmentSpace title='Ma fiche'>
            <Profile />
        </EstablishmentSpace>
    )
}
