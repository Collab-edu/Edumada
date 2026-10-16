/**
 * Pages du back-office.
 * - `roles` : types de compte autorisés (par défaut : établissement et administrateur) ;
 * - `establishment` : la page porte sur l'établissement géré (il faut en avoir choisi un).
 */
import React from 'react'

const Dashboard = React.lazy(() => import('./views/dashboard/Dashboard'))
const Profile = React.lazy(() => import('./views/establishment/Profile'))
const Offers = React.lazy(() => import('./views/establishment/Offers'))
const OfferEdit = React.lazy(() => import('./views/establishment/OfferEdit'))
const Inquiries = React.lazy(() => import('./views/establishment/Inquiries'))
const Stats = React.lazy(() => import('./views/establishment/Stats'))
const Campaigns = React.lazy(() => import('./views/establishment/Campaigns'))
const Billing = React.lazy(() => import('./views/establishment/Billing'))
const Invoice = React.lazy(() => import('./views/establishment/Invoice'))
const NewEstablishment = React.lazy(() => import('./views/establishment/NewEstablishment'))
const Claim = React.lazy(() => import('./views/establishment/Claim'))
const AdminEstablishments = React.lazy(() => import('./views/admin/Establishments'))
const Moderation = React.lazy(() => import('./views/admin/Moderation'))
const Users = React.lazy(() => import('./views/admin/Users'))
const Catalog = React.lazy(() => import('./views/admin/Catalog'))
const AdminBilling = React.lazy(() => import('./views/admin/Billing'))
const AuditLog = React.lazy(() => import('./views/admin/AuditLog'))
const Account = React.lazy(() => import('./views/account/Account'))

const ADMIN = ['admin']

export const routes = [
  { path: '/dashboard', name: 'Tableau de bord', element: Dashboard },
  { path: '/fiche', name: 'Fiche établissement', element: Profile, establishment: true },
  { path: '/offres', name: 'Offres', element: Offers, establishment: true },
  { path: '/offres/nouvelle', name: 'Nouvelle offre', element: OfferEdit, establishment: true },
  { path: '/offres/:id', name: "Modifier l'offre", element: OfferEdit, establishment: true },
  { path: '/demandes', name: 'Demandes', element: Inquiries, establishment: true },
  { path: '/statistiques', name: 'Statistiques', element: Stats, establishment: true },
  { path: '/campagnes', name: 'Campagnes', element: Campaigns, establishment: true },
  { path: '/formule', name: 'Formule et factures', element: Billing, establishment: true },
  { path: '/factures/:id', name: 'Facture', element: Invoice },
  { path: '/nouvel-etablissement', name: 'Nouvel établissement', element: NewEstablishment },
  {
    path: '/revendiquer/:slug',
    name: 'Revendiquer une fiche',
    element: Claim,
    roles: ['establishment'],
  },
  {
    path: '/admin/etablissements',
    name: 'Établissements',
    element: AdminEstablishments,
    roles: ADMIN,
  },
  { path: '/admin/moderation', name: 'Modération', element: Moderation, roles: ADMIN },
  { path: '/admin/utilisateurs', name: 'Utilisateurs', element: Users, roles: ADMIN },
  { path: '/admin/catalogue', name: 'Catalogue', element: Catalog, roles: ADMIN },
  { path: '/admin/facturation', name: 'Facturation', element: AdminBilling, roles: ADMIN },
  { path: '/admin/journal', name: "Journal d'audit", element: AuditLog, roles: ADMIN },
  { path: '/compte', name: 'Mon compte', element: Account },
]

export default routes
