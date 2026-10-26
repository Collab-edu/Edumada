import { Metadata } from 'next'
import ContactPage from '@/features/contact/components/ContactPage'
import TestimonialsSection from '@/features/marketing/components/TestimonialsSection'

export const metadata: Metadata = {
  title: 'Contact',
  description: 'Une question, une remarque ou besoin d’aide pour choisir votre formation ? Écrivez à l’équipe Edumada.',
}

export default function ContactRoute() {
  return (
    <main>
      <ContactPage />
      <TestimonialsSection />
    </main>
  )
}
