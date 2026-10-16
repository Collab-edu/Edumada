export type SchoolType = {
  /** Identifiant utilisé dans l'URL : /etablissements/[id] */
  id: string
  name: string
  initials: string
  type: 'Public' | 'Privé'
  /** Catégorie principale (CategoryType.id) et sous-catégorie libre. */
  category: string
  subCategory: string
  socialLinks: { facebook?: string; instagram?: string; linkedin?: string; youtube?: string }
  /** Présentation des infrastructures (bibliothèque, cantine, ateliers…). */
  infrastructures: string[]
  /** Statut de vérification de la fiche par Edumada. */
  verification: { status: 'Vérifié' | 'En cours' | 'Non vérifié'; date: string | null }
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
  /** true seulement si Edumada a vérifié la reconnaissance auprès des autorités. */
  accreditationVerified: boolean
  /** Position GPS ; null tant que l'établissement ne l'a pas renseignée. */
  coordinates: { lat: number; lng: number } | null
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
