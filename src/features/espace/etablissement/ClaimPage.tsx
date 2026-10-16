'use client'
import { useState, type FormEvent } from 'react'
import { useSearchParams } from 'next/navigation'
import { Button, ButtonLink, EmptyState, FormAlert, TextArea } from '@/components/ui/form'
import { api, ApiError } from '@/lib/api'
import type { SchoolType } from '@/features/etablissements/types'
import { useApi } from '../useApi'
import { Panel, SpaceShell } from '../components/SpaceShell'

function Claim() {
    const slug = useSearchParams().get('e')
    const { data, error: loadError } = useApi<{ data: SchoolType }>(slug ? `/establishments/${slug}` : null)
    const [message, setMessage] = useState('')
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState<ApiError | null>(null)
    const [done, setDone] = useState('')

    if (!slug || loadError) return <EmptyState icon='tabler:building-off' title='Fiche introuvable' />
    if (!data) return <div className='h-48 rounded-2xl bg-white animate-pulse' />

    const submit = async (e: FormEvent) => {
        e.preventDefault()
        setSaving(true)
        setError(null)
        try {
            const res = await api<{ message: string }>(`/establishments/${slug}/claims`, { method: 'POST', body: { message } })
            setDone(res.message)
        } catch (err) {
            setError(err as ApiError)
        } finally {
            setSaving(false)
        }
    }

    return (
        <Panel title={data.data.name} description={`${data.data.subCategory} · ${data.data.city}`}>
            {done ? (
                <div className='flex flex-col gap-3'>
                    <FormAlert tone='success'>{done}</FormAlert>
                    <ButtonLink href='/espace/etablissement/' variant='secondary' className='w-fit'>Retour à mon espace</ButtonLink>
                </div>
            ) : (
                <form onSubmit={submit} className='flex flex-col gap-4'>
                    <p className='text-ink/80'>
                        Pour protéger les établissements, Edumada vérifie que vous êtes autorisé à gérer cette fiche (appel au numéro officiel, e-mail du domaine, document…).
                    </p>
                    {error && Object.keys(error.errors).length === 0 && <FormAlert>{error.message}</FormAlert>}
                    <TextArea
                        label='Votre fonction et comment vous joindre'
                        required
                        rows={5}
                        minLength={20}
                        placeholder="Ex. : Je suis la directrice des études. Joignable au 034 00 000 00, ou à direction@etablissement.mg."
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        error={error?.field('message')}
                    />
                    <Button type='submit' loading={saving} className='w-fit'>Demander la gestion de la fiche</Button>
                </form>
            )}
        </Panel>
    )
}

export default function ClaimPage() {
    return (
        <SpaceShell roles={['establishment']} title='Gérer une fiche existante' nav={[{ href: '/espace/etablissement/', label: 'Mon espace', icon: 'tabler:arrow-left' }]}>
            <Claim />
        </SpaceShell>
    )
}
