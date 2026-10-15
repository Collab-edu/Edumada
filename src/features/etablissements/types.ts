export type SchoolType = {
  /** Identifiant utilisé dans l'URL : /etablissements/[id] */
  id: string
  name: string
  initials: string
  type: 'Public' | 'Privé'
  city: string
  address: string
  phone: string
  email: string
  website: string
  description: string
  /** Domaines enseignés. */
  tags: string[]
  /** Reconnaissance / accréditation, null si non applicable ou non renseignée. */
  accreditation: string | null
  coordinates: { lat: number; lng: number }
  /** Pièces à fournir pour le dossier de candidature. */
  admissionDocuments: string[]
  /** Photo de couverture. */
  imageSrc: string
  photos: string[]
}

export type TestimonialType = {
  id: string
  schoolId: string
  formationId: string
  /** Prénom et initiale du nom. */
  name: string
  /** « Promotion 2025 », « Étudiant·e en 2e année »… */
  status: string
  /** Note sur 5. */
  rating: number
  quote: string
}
