import { Metadata } from 'next'
import ProTrainingPage from '@/features/formations/components/ProTrainingPage'

export const metadata: Metadata = {
  title: 'Formation professionnelle',
  description:
    'Formations professionnelles à Madagascar : centres de formation, instituts techniques et écoles de métiers. Comparez les formations courtes et certifiantes.',
}

export default function FormationProfessionnellePage() {
  return (
    <main>
      <ProTrainingPage />
    </main>
  )
}
