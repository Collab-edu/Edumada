import { Metadata } from 'next'
import Link from 'next/link'
import { LegalPage } from '@/components/ui/legal-page'

export const metadata: Metadata = { title: "Conditions d'utilisation" }

export default function ConditionsPage() {
  return (
    <LegalPage title="Conditions d'utilisation" updated='octobre 2026'>
      <h2>Pour les étudiants et les familles</h2>
      <ul>
        <li>La recherche, la consultation des fiches, l&apos;envoi de demandes et le suivi des candidatures sont gratuits.</li>
        <li>Les avis doivent refléter une expérience réelle ; ils sont publiés après vérification.</li>
      </ul>
      <h2>Pour les établissements</h2>
      <ul>
        <li>Seule une personne autorisée à représenter l&apos;établissement peut créer ou gérer sa fiche ; Edumada peut le vérifier.</li>
        <li>Les informations publiées (frais, dates, conditions) doivent être exactes et tenues à jour.</li>
        <li>Le badge « établissement vérifié » est attribué après contrôle et ne peut pas être acheté.</li>
        <li>Les formules payantes (<Link href='/tarifs/' className='text-primary underline'>voir les formules</Link>) sont activées après confirmation du paiement. À leur expiration, les fonctions payantes sont suspendues ; la fiche de base reste en ligne.</li>
        <li>Les emplacements promus sont toujours signalés comme « Sponsorisé ». Aucun nombre de candidatures n&apos;est garanti.</li>
      </ul>
      <h2>Exactitude des informations</h2>
      <p>Edumada vérifie les fiches autant que possible et affiche la date de dernière vérification. Chacun peut signaler une information erronée depuis une fiche.</p>
    </LegalPage>
  )
}
