import { Metadata } from 'next'
import { LegalPage } from '@/components/ui/legal-page'

export const metadata: Metadata = { title: 'Politique de confidentialité' }

export default function ConfidentialitePage() {
  return (
    <LegalPage title='Politique de confidentialité' updated='octobre 2026'>
      <p>Edumada collecte uniquement les données nécessaires pour vous aider à trouver une formation et à contacter un établissement.</p>
      <h2>Données collectées</h2>
      <ul>
        <li>Compte : nom, e-mail, mot de passe (chiffré), et si vous les indiquez : téléphone, ville, niveau d&apos;études.</li>
        <li>Demande d&apos;information : votre nom, votre e-mail, votre téléphone s&apos;il est indiqué, l&apos;offre concernée et votre message.</li>
        <li>Candidature : les mêmes informations, et les documents que vous choisissez de joindre.</li>
        <li>Mesures d&apos;audience : nombre de vues et de clics par fiche, sans donnée personnelle.</li>
      </ul>
      <h2>Qui y a accès ?</h2>
      <ul>
        <li>Vous seul voyez vos favoris, vos demandes et vos documents depuis votre espace.</li>
        <li>Un établissement ne voit que les demandes et candidatures qui lui sont adressées.</li>
        <li>Les documents de candidature sont stockés sur un espace privé, jamais publics.</li>
        <li>L&apos;équipe Edumada peut y accéder pour le support et la modération ; les actions importantes sont journalisées.</li>
      </ul>
      <h2>Durée de conservation</h2>
      <p>Vos données sont conservées tant que votre compte existe. Vous pouvez supprimer votre compte à tout moment depuis « Mon profil » : vos informations, favoris, demandes et documents sont alors effacés.</p>
      <h2>Vos droits</h2>
      <p>Vous pouvez consulter, corriger ou supprimer vos données depuis votre espace, ou en écrivant à Edumada.</p>
    </LegalPage>
  )
}
