// Essai du hero en photo ; l'ancien reste disponible : '@/features/recherche/components/Hero'.
import Hero from '@/features/recherche/components/HeroPhoto'
import CategoriesSection from '@/features/categories/components/CategoriesSection'
import DomainsSection from '@/features/domaines/components/DomainsSection'
import FormationsSection from '@/features/formations/components/FormationsSection'
import SchoolsSection from '@/features/etablissements/components/SchoolsSection'
import Companies from '@/features/marketing/components/Companies'
import RegisterCta from '@/features/marketing/components/RegisterCta'
import HowItWorksPhones from '@/features/marketing/components/HowItWorksPhones'

export default function Home() {
  return (
    <main>
      <Hero />
      <Companies />
      <CategoriesSection />
      <DomainsSection />
      <RegisterCta />
      <FormationsSection />
      <SchoolsSection />
      <HowItWorksPhones />
    </main>
  )
}
