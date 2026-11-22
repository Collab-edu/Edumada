import { Metadata } from 'next'
// Essai du hero en photo ; l'ancien reste disponible : '@/features/recherche/components/Hero'.
import Hero from '@/features/recherche/components/HeroPhoto'
import CategoriesSection from '@/features/categories/components/CategoriesSection'
import DomainsSection from '@/features/domaines/components/DomainsSection'
import RegisterCta from '@/features/marketing/components/RegisterCta'
import HowItWorksPhones from '@/features/marketing/components/HowItWorksPhones'
import { HomeGuide, HomeIntro } from '@/features/marketing/components/HomeGuide'
import { LazyFormationsSection, LazySchoolsSection, LazyTestimonialsSection } from '@/features/marketing/components/HomeLazySections'
import { SITE_URL } from '@/lib/site-url'

const TITLE = 'Formation à Madagascar : écoles, universités et formations | Edumada'
const DESCRIPTION =
  'Trouvez une école, une université ou une formation professionnelle à Madagascar. Explorez les établissements, découvrez les filières et contactez les écoles sur Edumada.'

export const metadata: Metadata = {
  title: { absolute: TITLE },
  description: DESCRIPTION,
  alternates: { canonical: '/' },
}

// Données structurées : Edumada est une plateforme de découverte, pas un établissement d'enseignement.
const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': `${SITE_URL}/#organization`,
      name: 'Edumada',
      url: `${SITE_URL}/`,
      description: 'Plateforme de recherche et de découverte des établissements et formations à Madagascar.',
    },
    {
      '@type': 'WebSite',
      '@id': `${SITE_URL}/#website`,
      url: `${SITE_URL}/`,
      name: 'Edumada',
      publisher: { '@id': `${SITE_URL}/#organization` },
      inLanguage: 'fr-MG',
    },
    {
      '@type': 'WebPage',
      '@id': `${SITE_URL}/#webpage`,
      url: `${SITE_URL}/`,
      name: 'Formation à Madagascar : écoles et universités',
      description: 'Trouvez une école, une université ou une formation professionnelle à Madagascar.',
      isPartOf: { '@id': `${SITE_URL}/#website` },
      about: { '@id': `${SITE_URL}/#organization` },
      inLanguage: 'fr-MG',
    },
  ],
}

export default function Home() {
  return (
    <main>
      <script type='application/ld+json' dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      {/* Les logos qui défilent sont dans le hero (ancienne section : Companies). */}
      <Hero />
      <HomeIntro />
      <CategoriesSection />
      <DomainsSection />
      <RegisterCta />
      <LazyFormationsSection />
      <LazySchoolsSection />
      <HowItWorksPhones />
      <LazyTestimonialsSection />
      <HomeGuide />
    </main>
  )
}
