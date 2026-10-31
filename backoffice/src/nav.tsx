import CIcon from '@coreui/icons-react'
import {
    cilBabyCarriage,
    cilBank,
    cilBook,
    cilBriefcase,
    cilBuilding,
    cilBullhorn,
    cilChartLine,
    cilCreditCard,
    cilEducation,
    cilFolder,
    cilHistory,
    cilInbox,
    cilList,
    cilNewspaper,
    cilPeople,
    cilShieldAlt,
    cilSpeedometer,
    cilUser,
    cilWallet,
} from '@coreui/icons'
import type { ReactNode } from 'react'
import type { ManagedEstablishment, User } from '@/lib/types'

export type NavBadge = { color: string; text: string }
export type NavEntry = { kind: 'title'; name: string } | { kind: 'item'; name: string; to: string; icon: ReactNode; badge?: NavBadge }

export type NavCounts = { newInquiries?: number; establishments?: number; moderation?: number; invoices?: number }

/** Une entrée de menu par catégorie d'établissement (administrateur), avec ses nouvelles demandes d'adhésion. */
export type NavCategory = { id: string; shortLabel: string; new: number }

const CATEGORY_ICONS: Record<string, string[]> = {
    superieur: cilEducation,
    'petite-enfance': cilBabyCarriage,
    'formation-pro': cilBriefcase,
    scolaire: cilBook,
    autres: cilBuilding,
}

const icon = (i: string[]) => <CIcon icon={i} customClassName='nav-icon' />
const badge = (count?: number, color = 'danger'): NavBadge | undefined => (count ? { color, text: String(count) } : undefined)
const title = (name: string): NavEntry => ({ kind: 'title', name })
const item = (name: string, to: string, i: string[], b?: NavBadge): NavEntry => ({ kind: 'item', name, to, icon: icon(i), badge: b })

/**
 * Menu latéral selon le type de compte :
 * - établissement : son tableau de bord, sa fiche, ses offres, ses demandes, sa formule ;
 * - administrateur : pilotage de la plateforme (il valide les fiches, il ne les rédige pas).
 */
export function buildNav({
    user,
    current,
    counts = {},
    categories = [],
}: {
    user: User | null
    current: ManagedEstablishment | null
    counts?: NavCounts
    categories?: NavCategory[]
}): NavEntry[] {
    const establishmentItems = current
        ? [
              item('Fiche établissement', '/fiche', cilBank),
              item('Offres', '/offres', cilEducation),
              item('Demandes', '/demandes', cilInbox, badge(counts.newInquiries)),
              item('Statistiques', '/statistiques', cilChartLine),
              item('Campagnes', '/campagnes', cilBullhorn, current.plan.code === 'premium' ? undefined : { color: 'secondary', text: 'PREMIUM' }),
              item('Formule et factures', '/formule', cilCreditCard),
              item('Équipe', '/equipe', cilPeople),
          ]
        : []

    if (user?.role === 'admin') {
        return [
            item('Tableau de bord', '/dashboard', cilSpeedometer),
            title('Établissements'),
            item('Tous les établissements', '/admin/etablissements', cilBank, badge(counts.establishments, 'warning')),
            ...categories.map((c) => item(c.shortLabel, `/admin/etablissements?categorie=${c.id}`, CATEGORY_ICONS[c.id] ?? cilFolder, badge(c.new, 'warning'))),
            title('Plateforme'),
            item('Modération', '/admin/moderation', cilShieldAlt, badge(counts.moderation)),
            item('Utilisateurs', '/admin/utilisateurs', cilPeople),
            item('Catalogue', '/admin/catalogue', cilList),
            item('Actualités', '/admin/actualites', cilNewspaper),
            title('Finances'),
            item('Facturation', '/admin/facturation', cilWallet, badge(counts.invoices, 'info')),
            item("Journal d'audit", '/admin/journal', cilHistory),
            title('Compte'),
            item('Mon compte', '/compte', cilUser),
        ]
    }

    return [
        item('Tableau de bord', '/dashboard', cilSpeedometer),
        ...(current ? [title('Mon établissement'), ...establishmentItems] : []),
        title('Compte'),
        item('Mon compte', '/compte', cilUser),
    ]
}
