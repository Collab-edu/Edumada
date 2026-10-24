import { Metadata } from 'next'
import EstablishmentSignUp from '@/features/auth/components/EstablishmentSignUp'

export const metadata: Metadata = {
  title: 'Référencer mon établissement',
  description: 'Créez gratuitement le compte de votre établissement sur Edumada, puis complétez sa fiche depuis votre espace.',
}

export default function EstablishmentSignUpRoute() {
  return (
    <main>
      <EstablishmentSignUp />
    </main>
  )
}
