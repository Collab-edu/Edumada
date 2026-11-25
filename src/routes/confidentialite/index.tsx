import { Metadata } from 'next'
import { LegalPage } from '@/components/ui/legal-page'
import ConsentSettingsButton from '@/components/layout/ConsentSettingsButton'
import { T } from '@/i18n/T'

export const metadata: Metadata = {
  title: 'Politique de confidentialité',
  description: 'Données collectées par Edumada, finalités, destinataires, durées de conservation, cookies et stockage, et vos droits.',
  alternates: { canonical: '/confidentialite/' },
}

/** Tableau du stockage dans le navigateur : celui d'Edumada, puis les cookies de Google Analytics (seulement avec accord). */
const STORAGE = [
  { name: 'edumada_token', role: 'Vous garder connecté à votre compte.', duration: 'Jusqu’à la déconnexion.', kind: 'Nécessaire' },
  { name: 'edumada.orientation.answers', role: 'Garder vos réponses au test d’orientation en cours.', duration: 'Jusqu’à la fin du test ou l’effacement.', kind: 'Nécessaire' },
  { name: 'edumada.stages.saved', role: 'Garder les stages que vous enregistrez.', duration: 'Jusqu’à ce que vous les retiriez.', kind: 'Nécessaire' },
  { name: 'edumada-consent', role: 'Garder votre choix sur le bandeau de consentement.', duration: '6 mois.', kind: 'Nécessaire' },
  { name: '_ga', role: 'Cookie Google Analytics : distinguer les visiteurs, sans les identifier.', duration: '13 mois au plus.', kind: 'Statistiques, avec votre accord' },
  { name: '_ga_E2629R1KJ9', role: 'Cookie Google Analytics : suivre la visite en cours.', duration: '13 mois au plus.', kind: 'Statistiques, avec votre accord' },
]

export default function ConfidentialitePage() {
  return (
    <LegalPage title='Politique de confidentialité' updated='novembre 2026'>
      <p><T>Edumada collecte uniquement les données nécessaires pour vous aider à trouver une formation et à contacter un établissement. Cette page explique quelles données sont utilisées, pourquoi, par qui, pendant combien de temps, et comment exercer vos droits, conformément à la loi malgache n° 2014-038 sur la protection des données à caractère personnel et, pour les personnes situées dans l’Union européenne, au Règlement général sur la protection des données (RGPD).</T></p>

      <h2><T>Responsable du traitement</T></h2>
      <p><T>Edumada. Contact pour toute question sur vos données : contact@edumada.mg.</T></p>

      <h2><T>Données collectées, finalités et bases légales</T></h2>
      <ul>
        <li><T>Compte : nom, e-mail, mot de passe (chiffré), et si vous les indiquez : téléphone, ville, niveau d’études. Finalité : créer et gérer votre compte. Base légale : l’exécution du service que vous demandez.</T></li>
        <li><T>Connexion avec Google, si vous la choisissez : nom, e-mail et identifiant transmis par Google. Finalité et base légale : les mêmes que pour le compte.</T></li>
        <li><T>Demande d’information : votre nom, votre e-mail, votre téléphone s’il est indiqué, l’offre concernée et votre message. Finalité : transmettre votre demande à l’établissement choisi. Base légale : votre demande.</T></li>
        <li><T>Candidature à un stage ou une formation : les mêmes informations, et les documents que vous choisissez de joindre. Finalité et base légale : les mêmes que pour une demande.</T></li>
        <li><T>Établissements : informations de la fiche et des personnes qui la gèrent. Finalité : présenter l’établissement et gérer son espace. Base légale : le contrat de référencement.</T></li>
        <li><T>Mesure d’audience anonyme, seulement si vous l’acceptez : nombre de vues et de clics par fiche, sans cookie ni donnée personnelle. Finalité : les statistiques des établissements. Base légale : votre consentement.</T></li>
        <li><T>Statistiques de visite avec Google Analytics, seulement si vous les acceptez : pages vues, durée de visite, provenance (moteur de recherche, réseau social, lien direct), type d’appareil et ville approximative. Votre adresse IP n’est pas conservée et ces données ne servent à aucune publicité. Finalité : comprendre la fréquentation du site pour l’améliorer. Base légale : votre consentement.</T></li>
        <li><T>Position approximative, seulement si vous utilisez la recherche « autour de moi » : elle sert au calcul des distances et n’est pas enregistrée.</T></li>
      </ul>

      <h2><T>Qui a accès à vos données ?</T></h2>
      <ul>
        <li><T>Vous seul voyez vos favoris, vos demandes et vos documents depuis votre espace.</T></li>
        <li><T>Un établissement ne voit que les demandes et candidatures qui lui sont adressées.</T></li>
        <li><T>Les documents de candidature sont stockés sur un espace privé, jamais publics.</T></li>
        <li><T>L’équipe Edumada peut y accéder pour le support et la modération ; les actions importantes sont journalisées.</T></li>
        <li><T>Edumada ne vend ni ne loue vos données.</T></li>
      </ul>

      <h2><T>Prestataires et transferts hors de Madagascar</T></h2>
      <ul>
        <li><T>Vercel (États-Unis) : hébergement du site.</T></li>
        <li><T>alwaysdata (France) : hébergement des comptes, des demandes, des documents et de la base de données.</T></li>
        <li><T>Google (États-Unis) : connexion avec Google, uniquement si vous l’utilisez. Google applique alors ses propres règles de confidentialité et peut déposer ses cookies.</T></li>
        <li><T>Google Analytics (Google, États-Unis) : statistiques de visite, seulement si vous les acceptez. Google agit comme sous-traitant d’Edumada ; les transferts vers les États-Unis sont encadrés par le cadre de protection des données UE–États-Unis et les clauses contractuelles types de la Commission européenne.</T></li>
        <li><T>OpenStreetMap : les cartes et les itinéraires des fiches. Votre navigateur charge les fonds de carte depuis ses serveurs, qui reçoivent votre adresse IP, sans cookie.</T></li>
        <li><T>ipwho.is et GeoJS : estimation de la ville d’après votre connexion internet, seulement si vous demandez « autour de moi » et que votre appareil ne donne pas sa position.</T></li>
      </ul>
      <p><T>Ces prestataires traitent les données uniquement pour le service décrit. Les images et vidéos du site sont hébergées par Edumada : leur affichage ne transmet aucune donnée à un tiers.</T></p>

      <h2><T>Durée de conservation</T></h2>
      <ul>
        <li><T>Compte, favoris, demandes et documents : tant que votre compte existe. Vous pouvez supprimer votre compte à tout moment depuis « Mon profil » : vos informations, favoris, demandes et documents sont alors effacés.</T></li>
        <li><T>Mesure d’audience : des nombres de vues et de clics par fiche, sans lien avec une personne.</T></li>
        <li><T>Statistiques de visite (Google Analytics) : 14 mois, puis supprimées automatiquement ; cookies gardés 13 mois au plus.</T></li>
        <li><T>Choix sur le bandeau de consentement : 6 mois, puis il vous est redemandé.</T></li>
      </ul>

      <h2 id='cookies'><T>Cookies et stockage dans votre navigateur</T></h2>
      <p><T>Edumada ne dépose aucun cookie publicitaire. Le site garde dans votre navigateur (stockage local) ce qui est nécessaire à son fonctionnement ; Google Analytics dépose ses deux cookies seulement si vous acceptez les statistiques de visite :</T></p>
      <div className='overflow-x-auto'>
        <table className='w-full min-w-[32rem] border-collapse text-sm'>
          <thead>
            <tr className='border-b border-gray-200 text-left text-secondary'>
              <th className='py-2 pr-4 font-semibold'><T>Nom</T></th>
              <th className='py-2 pr-4 font-semibold'><T>Rôle</T></th>
              <th className='py-2 pr-4 font-semibold'><T>Durée</T></th>
              <th className='py-2 font-semibold'><T>Type</T></th>
            </tr>
          </thead>
          <tbody>
            {STORAGE.map((item) => (
              <tr key={item.name} className='border-b border-gray-100 align-top'>
                <td className='py-2 pr-4 font-mono text-xs'>{item.name}</td>
                <td className='py-2 pr-4'><T>{item.role}</T></td>
                <td className='py-2 pr-4'><T>{item.duration}</T></td>
                <td className='py-2'><T>{item.kind}</T></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p><T>La mesure d’audience anonyme des fiches n’utilise ni cookie ni stockage : elle n’est simplement pas envoyée sans votre accord. Google Analytics n’est pas chargé sans votre accord ; si vous le retirez, il s’arrête et ses cookies sont effacés. Si votre navigateur envoie le signal « Global Privacy Control », les deux restent désactivés. Vous pouvez changer d’avis à tout moment, avec ce bouton ou le lien « Gérer les cookies » en bas de chaque page :</T></p>
      <ConsentSettingsButton />

      <h2><T>Vos droits</T></h2>
      <p><T>Vous pouvez accéder à vos données, les corriger, les faire effacer, en limiter l’usage, vous opposer à leur traitement, les récupérer dans un format lisible (portabilité) et retirer votre consentement à tout moment. La plupart de ces actions se font depuis votre espace ; pour les autres, écrivez à contact@edumada.mg. Nous répondons dans un délai d’un mois.</T></p>
      <p><T>Si vous estimez que vos droits ne sont pas respectés, vous pouvez saisir la Commission Malagasy de l’Informatique et des Libertés (CMIL) ou, si vous résidez dans l’Union européenne, l’autorité de protection des données de votre pays (en France, la CNIL).</T></p>

      <h2><T>Sécurité</T></h2>
      <p><T>Les échanges avec le site sont chiffrés (HTTPS), les mots de passe sont protégés par hachage, et l’accès aux données est limité aux personnes qui en ont besoin.</T></p>

      <h2><T>Modifications</T></h2>
      <p><T>Cette politique peut évoluer avec le service. La date de mise à jour figure en haut de la page ; si les usages soumis à votre accord changent, le bandeau de consentement vous est reposé.</T></p>
    </LegalPage>
  )
}
