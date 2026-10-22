export type Diploma = 'Certificat' | 'BTS' | 'Licence' | 'Master' | 'Doctorat' | 'CEPE' | 'BEPC' | 'BAC' | 'Autre'
/** Nature de l'offre éducative : formation diplômante, niveau scolaire, ou accueil (crèche, accompagnement). */
export type OfferKind = 'formation' | 'niveau' | 'accueil'
export type Modality = 'Présentiel' | 'Distanciel' | 'Hybride'
export type RegistrationStatus = 'Ouvertes' | 'À venir' | 'Fermées'
export type AdmissionLevel = 'Aucun' | 'BAC' | 'BAC+2' | 'BAC+3'
export type AdmissionSelection = 'Inscription directe' | 'Sur dossier' | 'Dossier et entretien' | 'Concours'

export type FormationType = {
  id: string
  /** Recherche autour d'un lieu : distance à ce lieu, en km (absente sinon). */
  distanceKm?: number
  title: string
  school: string
  /** Identifiant de l'établissement (SchoolType.id). */
  schoolId: string
  /** Public ou privé ; null tant que l'établissement ne l'a pas précisé. */
  schoolType: 'Public' | 'Privé' | null
  city: string
  /** Domaine, avec les mêmes libellés que le filtre « Domaine d'études ». */
  domain: string
  kind: OfferKind
  /** Catégorie de l'établissement (CategoryType.id), recopiée pour filtrer facilement. */
  category: string
  /** Diplôme préparé ; null pour un accueil sans diplôme (crèche, accompagnement…). */
  diploma: Diploma | null
  /** Durée en années (0.5 = six mois) ; null si non renseignée ou sans objet. */
  durationYears: number | null
  /** Âge des enfants accueillis, en années (0.25 = 3 mois) ; null si sans objet. */
  ageRange: { min: number; max: number } | null
  /** Frais de scolarité en ariary ; null si non renseignés. */
  fees: number | null
  /** Période des frais de scolarité : par an ou par mois (crèches, écoles). */
  feesPeriod: 'an' | 'mois'
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
  /** Logo de l'établissement, recopié pour les cartes d'offre. */
  schoolLogo?: string
}

/** Montant d'un frais ; null = « Non communiqué ». */
export type FeeLine = { label: string; amount: number | null }

/** Contenu détaillé d'une formation (public/data/formation-details.json), lu au moment du build. */
export type FormationDetailType = {
  id: string
  description: string
  objectives: string[]
  skills: string[]
  subjects: string[]
  program: { period: string; courses: string[] }[]
  specializations: string[]
  teachingMethods: string[]
  evaluation: string
  admission: {
    prerequisites: string[]
    specialConditions: string | null
    minAge: number | null
  }
  costs: {
    applicationFee: number | null
    otherFees: FeeLine[]
    /** Les montants sont-ils confirmés par l'établissement ou estimés par Edumada ? */
    status: 'Confirmés' | 'Estimés' | 'Non communiqués'
    paymentOptions: string[]
    scholarships: string | null
    discounts: string | null
  }
  organization: {
    schedule: string | null
    campus: string
    rhythm: string[]
  }
  careers: {
    jobs: string[]
    sectors: string[]
    furtherStudies: string[]
    internship: string | null
    /** Uniquement les partenariats confirmés. */
    partnerships: string[]
  }
  /** Candidature en ligne activée pour cette formation. */
  onlineApplication: boolean
  brochureUrl: string | null
  academicCalendar: { label: string; date: string }[]
  /** Date de dernière vérification des informations (ISO). */
  lastVerified: string
}
