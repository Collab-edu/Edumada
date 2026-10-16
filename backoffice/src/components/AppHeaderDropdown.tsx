'use client'
import Link from 'next/link'
import { CAvatar, CDropdown, CDropdownDivider, CDropdownHeader, CDropdownItem, CDropdownMenu, CDropdownToggle } from '@coreui/react'
import { cilAccountLogout, cilCreditCard, cilUser } from '@coreui/icons'
import CIcon from '@coreui/icons-react'
import { useAuth } from '@/context/AuthContext'
import { useEstablishment } from '@/context/EstablishmentContext'

const initials = (name = '') =>
    name
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((w) => w[0].toUpperCase())
        .join('')

export default function AppHeaderDropdown() {
    const { user, logout } = useAuth()
    const { current } = useEstablishment()
    if (!user) return null

    return (
        <CDropdown variant='nav-item' placement='bottom-end'>
            <CDropdownToggle className='py-0 pe-0' caret={false} aria-label='Mon compte'>
                <CAvatar textColor='white' size='md' style={{ background: '#ff3b52' }}>
                    {initials(user.name)}
                </CAvatar>
            </CDropdownToggle>
            <CDropdownMenu className='pt-0'>
                <CDropdownHeader className='bg-body-secondary fw-semibold mb-2'>
                    {user.name}
                    <div className='small fw-normal text-body-secondary'>{user.role === 'admin' ? 'Administrateur Edumada' : user.email}</div>
                </CDropdownHeader>
                <CDropdownItem as={Link} href='/compte/'>
                    <CIcon icon={cilUser} className='me-2' />
                    Mon compte
                </CDropdownItem>
                {current && (
                    <CDropdownItem as={Link} href='/formule/'>
                        <CIcon icon={cilCreditCard} className='me-2' />
                        Formule et factures
                    </CDropdownItem>
                )}
                <CDropdownDivider />
                <CDropdownItem as='button' onClick={logout}>
                    <CIcon icon={cilAccountLogout} className='me-2' />
                    Déconnexion
                </CDropdownItem>
            </CDropdownMenu>
        </CDropdown>
    )
}
