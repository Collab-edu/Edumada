export type Diploma = 'Certificat' | 'BTS' | 'Licence' | 'Master' | 'Doctorat' | 'Autre'
export type Modality = 'Présentiel' | 'Distanciel' | 'Hybride'
export type RegistrationStatus = 'Ouvertes' | 'À venir' | 'Fermées'
export type AdmissionLevel = 'Aucun' | 'BAC' | 'BAC+2' | 'BAC+3'
export type AdmissionSelection = 'Inscription directe' | 'Sur dossier' | 'Dossier et entretien' | 'Concours'

export type FormationType = {
  id: string
  title: string
  school: string
  /** Identifiant de l'établissement (SchoolType.id). */
  schoolId: string
  schoolType: 'Public' | 'Privé'
  city: string
  /** Domaine, avec les mêmes libellés que le filtre « Domaine d'études ». */
  domain: string
  diploma: Diploma
  /** Durée en années (0.5 = six mois) ; null si non renseignée. */
  durationYears: number | null
  /** Frais de scolarité annuels en ariary ; null si non renseignés. */
  fees: number | null
  /** Frais d'inscription en ariary ; null si non renseignés. */
  registrationFee: number | null
  /** Période d'inscription (dates ISO AAAA-MM-JJ). */
  registrationPeriod: { start: string; end: string } | null
  /** Date de rentrée (ISO AAAA-MM-JJ). */
  startDate: string | null
  modality: Modality
  registration: RegistrationStatus
  languages: string[]
  admission: {
    level: AdmissionLevel
    /** Séries du BAC acceptées ; vide = toutes les séries ou non applicable. */
    bacSeries: string[]
    selection: AdmissionSelection
  }
  housing: 'Disponible' | 'Non disponible' | 'Non renseigné'
  scholarship: 'Bourses disponibles' | 'Non renseigné'
  imageSrc: string
}
