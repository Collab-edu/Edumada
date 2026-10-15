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
  /** Photo de couverture. */
  imageSrc: string
  photos: string[]
}
