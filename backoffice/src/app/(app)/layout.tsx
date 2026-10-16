'use client'
import { Suspense, useEffect, type ReactNode } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { CButton, CCard, CCardBody, CContainer } from '@coreui/react'
import AppSidebar from '@/components/AppSidebar'
import AppHeader from '@/components/AppHeader'
import AppFooter from '@/components/AppFooter'
import { Loading } from '@/components/ui'
import { useAuth } from '@/context/AuthContext'
import { EstablishmentProvider, useEstablishment } from '@/context/EstablishmentContext'
import { LayoutProvider } from '@/context/LayoutContext'
import { findRoute } from '@/routes'

/** Page qui porte sur un établissement alors qu'aucun n'est choisi. */
function NoEstablishment({ admin }: { admin: boolean }) {
    return (
        <CCard className='mb-4'>
            <CCardBody className='text-center py-5'>
                <h4>Aucun établissement sélectionné</h4>
                <p className='text-body-secondary'>
                    {admin
                        ? 'Choisissez une fiche dans la liste des établissements, puis « Gérer ».'
                        : 'Créez la fiche de votre établissement, ou revendiquez-la si elle existe déjà sur Edumada.'}
                </p>
                <CButton color='primary' as={Link} href={admin ? '/admin/etablissements/' : '/nouvel-etablissement/'}>
                    {admin ? 'Voir les établissements' : 'Créer ma fiche'}
                </CButton>
            </CCardBody>
        </CCard>
    )
}

function Forbidden() {
    return (
        <CCard className='mb-4'>
            <CCardBody className='text-center py-5'>
                <h4>Accès réservé</h4>
                <p className='text-body-secondary mb-0'>Cette page est réservée à l&apos;équipe Edumada.</p>
            </CCardBody>
        </CCard>
    )
}

/** Vérifie le type de compte et l'établissement géré exigés par la page. */
function Guard({ children }: { children: ReactNode }) {
    const { user } = useAuth()
    const { current, loading } = useEstablishment()
    const route = findRoute(usePathname())
    if (!user) return null
    if (route && !(route.roles ?? ['establishment', 'admin']).includes(user.role)) return <Forbidden />
    if (route?.establishment && !current) return loading ? <Loading /> : <NoEstablishment admin={user.role === 'admin'} />
    return <>{children}</>
}

function Shell({ children }: { children: ReactNode }) {
    return (
        <EstablishmentProvider>
            <LayoutProvider>
                <AppSidebar />
                <div className='wrapper d-flex flex-column min-vh-100'>
                    <AppHeader />
                    <div className='body flex-grow-1'>
                        <CContainer className='px-3 px-md-4' lg>
                            <Guard>{children}</Guard>
                        </CContainer>
                    </div>
                    <AppFooter />
                </div>
            </LayoutProvider>
        </EstablishmentProvider>
    )
}

/** Les pages du back-office exigent une session établissement ou administrateur. */
export default function AppLayout({ children }: { children: ReactNode }) {
    const { user, loading } = useAuth()
    const router = useRouter()

    useEffect(() => {
        if (!loading && !user) router.replace('/connexion/')
    }, [loading, user, router])

    if (loading || !user) return <Loading />
    return (
        <Suspense fallback={<Loading />}>
            <Shell>{children}</Shell>
        </Suspense>
    )
}
