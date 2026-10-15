import Hero from '@/features/recherche/components/Hero'
import DomainsSection from '@/features/domaines/components/DomainsSection'
import FormationsSection from '@/features/formations/components/FormationsSection'
import SchoolsSection from '@/features/etablissements/components/SchoolsSection'
import Companies from '@/features/marketing/components/Companies'
import RegisterCta from '@/features/marketing/components/RegisterCta'
import Steps from '@/features/marketing/components/Steps'
import SchoolCta from '@/features/marketing/components/SchoolCta'
import Newsletter from '@/features/marketing/components/Newsletter'

export default function Home() {
  return (
    <main>
      <Hero />
      <Companies />
      <DomainsSection />
      <RegisterCta />
      <FormationsSection />
      <SchoolsSection />
      <Steps />
      <SchoolCta />
      <Newsletter />
    </main>
  )
}
