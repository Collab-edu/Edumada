'use client'
import { useState, type FormEvent } from 'react'
import { useSearchParams } from 'next/navigation'
import { CAlert, CButton, CForm, CFormTextarea } from '@coreui/react'
import { api } from '@/lib/api'
import { useApi } from '@/lib/useApi'
import type { Establishment } from '@/lib/types'
import { EmptyState, ErrorAlert, Loading, PageCard } from '@/components/ui'
import PageBanner from '@/components/PageBanner'
import { useEstablishment } from '@/context/EstablishmentContext'
import AlreadyManaged from './AlreadyManaged'

/** Revendiquer une fiche existante (/revendiquer/?fiche=slug) : Edumada vérifie le lien avec l'établissement. */
export default function Claim() {
    const slug = useSearchParams().get('fiche')
    const { data, error: loadError } = useApi<{ data: Establishment }>(slug ? `/establishments/${slug}` : null)
    const [message, setMessage] = useState('')
    const [error, setError] = useState<unknown>(null)
    const [done, setDone] = useState('')
    const { current } = useEstablishment()

    if (current) return <AlreadyManaged name={current.name} />

    if (!slug)
        return (
            <PageCard>
                <EmptyState title='Aucune fiche indiquée'>Ouvrez la fiche de votre établissement sur le site et cliquez sur « Vous représentez cet établissement ? ».</EmptyState>
            </PageCard>
        )
    if (loadError) return <ErrorAlert error={loadError} />
    if (!data) return <Loading />

    const submit = async (e: FormEvent) => {
        e.preventDefault()
        setError(null)
        try {
            setDone((await api<{ message: string }>(`/establishments/${slug}/claims`, { method: 'POST', body: { message } })).message)
        } catch (err) {
            setError(err)
        }
    }

    return (
        <>
            <PageBanner />
            <PageCard title={data.data.name} subtitle={`${data.data.subCategory} · ${data.data.city}`}>
                {done ? (
                    <CAlert color='success'>{done}</CAlert>
                ) : (
                    <CForm onSubmit={submit}>
                        <p>Pour protéger les établissements, Edumada vérifie que vous êtes autorisé à gérer cette fiche (appel au numéro officiel, e-mail du domaine, document…).</p>
                        <ErrorAlert error={error} />
                        <CFormTextarea
                            label='Votre fonction et comment vous joindre'
                            rows={5}
                            placeholder='Ex. : Je suis la directrice des études, joignable au 034 00 000 00.'
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            className='mb-3'
                        />
                        <CButton color='primary' type='submit'>
                            Demander la gestion de la fiche
                        </CButton>
                    </CForm>
                )}
            </PageCard>
        </>
    )
}
