import React from 'react'
import CIcon from '@coreui/icons-react'
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
} from '@coreui/icons'
import { CNavItem, CNavTitle } from '@coreui/react'

const icon = (i) => <CIcon icon={i} customClassName="nav-icon" />
const badge = (count, color = 'danger') => (count ? { color, text: String(count) } : undefined)

/**
 * Menu latéral selon le type de compte :
 * - établissement : son tableau de bord, sa fiche, ses offres, ses demandes, sa formule ;
 * - administrateur : pilotage de la plateforme, et l'établissement qu'il a choisi de gérer.
 */
export function buildNav({ user, current, counts = {} }) {
  const establishmentItems = current
    ? [
        { component: CNavItem, name: 'Fiche établissement', to: '/fiche', icon: icon(cilBank) },
        { component: CNavItem, name: 'Offres', to: '/offres', icon: icon(cilEducation) },
        {
          component: CNavItem,
          name: 'Demandes',
          to: '/demandes',
          icon: icon(cilInbox),
          badge: badge(counts.newInquiries),
        },
        {
          component: CNavItem,
          name: 'Statistiques',
          to: '/statistiques',
          icon: icon(cilChartLine),
        },
        {
          component: CNavItem,
          name: 'Campagnes',
          to: '/campagnes',
          icon: icon(cilBullhorn),
          badge:
            current.plan.code === 'premium' ? undefined : { color: 'secondary', text: 'PREMIUM' },
        },
        {
          component: CNavItem,
          name: 'Formule et factures',
          to: '/formule',
          icon: icon(cilCreditCard),
        },
      ]
    : []

  if (user?.role === 'admin') {
    return [
      {
        component: CNavItem,
        name: 'Tableau de bord',
        to: '/dashboard',
        icon: icon(cilSpeedometer),
      },
      { component: CNavTitle, name: 'Plateforme' },
      {
        component: CNavItem,
        name: 'Établissements',
        to: '/admin/etablissements',
        icon: icon(cilBank),
        badge: badge(counts.establishments, 'warning'),
      },
      {
        component: CNavItem,
        name: 'Modération',
        to: '/admin/moderation',
        icon: icon(cilShieldAlt),
        badge: badge(counts.moderation),
      },
      {
        component: CNavItem,
        name: 'Utilisateurs',
        to: '/admin/utilisateurs',
        icon: icon(cilPeople),
      },
      { component: CNavItem, name: 'Catalogue', to: '/admin/catalogue', icon: icon(cilList) },
      { component: CNavTitle, name: 'Finances' },
      {
        component: CNavItem,
        name: 'Facturation',
        to: '/admin/facturation',
        icon: icon(cilWallet),
        badge: badge(counts.invoices, 'info'),
      },
      {
        component: CNavItem,
        name: "Journal d'audit",
        to: '/admin/journal',
        icon: icon(cilHistory),
      },
      ...(current
        ? [{ component: CNavTitle, name: `Géré : ${current.name}` }, ...establishmentItems]
        : []),
      { component: CNavTitle, name: 'Compte' },
      { component: CNavItem, name: 'Mon compte', to: '/compte', icon: icon(cilUser) },
    ]
  }

  return [
    { component: CNavItem, name: 'Tableau de bord', to: '/dashboard', icon: icon(cilSpeedometer) },
    ...(current
      ? [{ component: CNavTitle, name: 'Mon établissement' }, ...establishmentItems]
      : []),
    { component: CNavTitle, name: 'Compte' },
    {
      component: CNavItem,
      name: 'Ajouter un établissement',
      to: '/nouvel-etablissement',
      icon: icon(cilPlus),
    },
    { component: CNavItem, name: 'Mon compte', to: '/compte', icon: icon(cilUser) },
  ]
}
