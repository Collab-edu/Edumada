import {
    cilBank,
    cilBullhorn,
    cilChartLine,
    cilCreditCard,
    cilEducation,
    cilHistory,
    cilInbox,
    cilList,
    cilPeople,
    cilPlus,
    cilShieldAlt,
    cilSpeedometer,
    cilUser,
    cilWallet,
    cilFile,
    cilFlagAlt,
    cilNewspaper,
} from '@coreui/icons'
import type { UserRole } from '@/lib/types'

/**
 * Pages du back-office.
 * - `roles` : types de compte autorisés (par défaut : établissement et administrateur) ;
 * - `establishment` : la page porte sur l'établissement du compte (il faut en avoir une fiche) ;
 * - `parent` : page parente dans le fil d'Ariane.
 */
export type RouteMeta = {
    path: string
    name: string
    description: string
    icon: string[]
    roles?: UserRole[]
    establishment?: boolean
    parent?: string
}

const ADMIN: UserRole[] = ['admin']
// Fiche, offres, demandes, formule : seul l'établissement les rédige et les publie.
const ESTABLISHMENT: UserRole[] = ['establishment']

export const routes: RouteMeta[] = [
    { path: '/dashboard', name: 'Tableau de bord', description: "Vue d'ensemble de votre activité sur Edumada.", icon: cilSpeedometer },
    { path: '/fiche', name: 'Fiche établissement', description: 'Les informations affichées sur votre page publique.', icon: cilBank, establishment: true, roles: ESTABLISHMENT },
    { path: '/offres', name: 'Offres', description: 'Formations et programmes publiés sur le site.', icon: cilEducation, establishment: true, roles: ESTABLISHMENT },
    { path: '/offres/nouvelle', name: 'Nouvelle offre', description: 'Décrivez la formation telle que les étudiants la verront.', icon: cilPlus, establishment: true, roles: ESTABLISHMENT, parent: '/offres' },
    { path: '/offres/modifier', name: "Modifier l'offre", description: 'Mettez à jour la formation publiée.', icon: cilEducation, establishment: true, roles: ESTABLISHMENT, parent: '/offres' },
    { path: '/demandes', name: 'Demandes', description: "Demandes d'information et candidatures reçues.", icon: cilInbox, establishment: true, roles: ESTABLISHMENT },
    { path: '/statistiques', name: 'Statistiques', description: 'Vues, clics et demandes sur la période.', icon: cilChartLine, establishment: true, roles: ESTABLISHMENT },
    { path: '/campagnes', name: 'Campagnes', description: 'Mettez une offre en avant avec le badge « Sponsorisé ».', icon: cilBullhorn, establishment: true, roles: ESTABLISHMENT },
    { path: '/formule', name: 'Formule et factures', description: 'Votre abonnement, vos paiements et vos factures.', icon: cilCreditCard, establishment: true, roles: ESTABLISHMENT },
    { path: '/facture', name: 'Facture', description: 'Détail et impression de la facture.', icon: cilFile },
    { path: '/nouvel-etablissement', name: 'Nouvel établissement', description: 'Créez la fiche de votre établissement.', icon: cilPlus, roles: ESTABLISHMENT },
    { path: '/revendiquer', name: 'Revendiquer une fiche', description: 'Demandez la gestion d’une fiche déjà présente sur Edumada.', icon: cilFlagAlt, roles: ESTABLISHMENT },
    { path: '/admin/etablissements', name: 'Établissements', description: 'Toutes les fiches : validation, vérification, formules.', icon: cilBank, roles: ADMIN },
    { path: '/admin/moderation', name: 'Modération', description: 'Revendications, avis et signalements à traiter.', icon: cilShieldAlt, roles: ADMIN },
    { path: '/admin/utilisateurs', name: 'Utilisateurs', description: 'Étudiants inscrits sur Edumada.', icon: cilPeople, roles: ADMIN },
    { path: '/admin/actualites', name: 'Actualités', description: 'Articles et actualités publiés sur le site.', icon: cilNewspaper, roles: ADMIN },
    { path: '/admin/catalogue', name: 'Catalogue', description: 'Catégories, domaines et formules.', icon: cilList, roles: ADMIN },
    { path: '/admin/facturation', name: 'Facturation', description: 'Factures, paiements et abonnements.', icon: cilWallet, roles: ADMIN },
    { path: '/admin/journal', name: "Journal d'audit", description: 'Historique des actions sensibles.', icon: cilHistory, roles: ADMIN },
    { path: '/compte', name: 'Mon compte', description: 'Vos informations et votre mot de passe.', icon: cilUser },
]

const clean = (pathname: string) => pathname.replace(/\/+$/, '') || '/'

export const findRoute = (pathname: string) => routes.find((r) => r.path === clean(pathname))
