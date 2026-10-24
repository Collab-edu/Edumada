import { Metadata } from 'next'
import Link from '@/i18n/client'
import { LegalPage } from '@/components/ui/legal-page'
import { T } from '@/i18n/T'

export const metadata: Metadata = { title: "Conditions d'utilisation" }

export default function ConditionsPage() {
  return (
    <LegalPage title="Conditions d'utilisation" updated='octobre 2026'>
      <h2><T>Pour les étudiants et les familles</T></h2>
      <ul>
        <li><T>La recherche, la consultation des fiches, l’envoi de demandes et le suivi des candidatures sont gratuits.</T></li>
        <li><T>Les avis doivent refléter une expérience réelle ; ils sont publiés après vérification.</T></li>
      </ul>
      <h2><T>Pour les établissements</T></h2>
      <ul>
        <li><T>Seule une personne autorisée à représenter l’établissement peut créer ou gérer sa fiche ; Edumada peut le vérifier.</T></li>
        <li><T>Les informations publiées (frais, dates, conditions) doivent être exactes et tenues à jour.</T></li>
        <li><T>Le badge « établissement vérifié » est attribué après contrôle et ne peut pas être acheté.</T></li>
        <li>
          <T>Les formules payantes</T> (<Link href='/tarifs/' className='text-primary underline'><T>voir les formules</T></Link>){' '}
          <T>sont activées après confirmation du paiement. À leur expiration, les fonctions payantes sont suspendues ; la fiche de base reste en ligne.</T>
        </li>
        <li><T>Les emplacements promus sont toujours signalés comme « Sponsorisé ». Aucun nombre de candidatures n’est garanti.</T></li>
      </ul>
      <h2><T>Exactitude des informations</T></h2>
      <p><T>Edumada vérifie les fiches autant que possible et affiche la date de dernière vérification. Chacun peut signaler une information erronée depuis une fiche.</T></p>
    </LegalPage>
  )
}
