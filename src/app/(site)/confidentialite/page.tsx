import { Metadata } from 'next'
import { LegalPage } from '@/components/ui/legal-page'
import { T } from '@/i18n/T'

export const metadata: Metadata = { title: 'Politique de confidentialité' }

export default function ConfidentialitePage() {
  return (
    <LegalPage title='Politique de confidentialité' updated='octobre 2026'>
      <p><T>Edumada collecte uniquement les données nécessaires pour vous aider à trouver une formation et à contacter un établissement.</T></p>
      <h2><T>Données collectées</T></h2>
      <ul>
        <li><T>Compte : nom, e-mail, mot de passe (chiffré), et si vous les indiquez : téléphone, ville, niveau d’études.</T></li>
        <li><T>Demande d’information : votre nom, votre e-mail, votre téléphone s’il est indiqué, l’offre concernée et votre message.</T></li>
        <li><T>Candidature : les mêmes informations, et les documents que vous choisissez de joindre.</T></li>
        <li><T>Mesures d’audience : nombre de vues et de clics par fiche, sans donnée personnelle.</T></li>
      </ul>
      <h2><T>Qui y a accès ?</T></h2>
      <ul>
        <li><T>Vous seul voyez vos favoris, vos demandes et vos documents depuis votre espace.</T></li>
        <li><T>Un établissement ne voit que les demandes et candidatures qui lui sont adressées.</T></li>
        <li><T>Les documents de candidature sont stockés sur un espace privé, jamais publics.</T></li>
        <li><T>L’équipe Edumada peut y accéder pour le support et la modération ; les actions importantes sont journalisées.</T></li>
      </ul>
      <h2><T>Durée de conservation</T></h2>
      <p><T>Vos données sont conservées tant que votre compte existe. Vous pouvez supprimer votre compte à tout moment depuis « Mon profil » : vos informations, favoris, demandes et documents sont alors effacés.</T></p>
      <h2><T>Vos droits</T></h2>
      <p><T>Vous pouvez consulter, corriger ou supprimer vos données depuis votre espace, ou en écrivant à Edumada.</T></p>
    </LegalPage>
  )
}
