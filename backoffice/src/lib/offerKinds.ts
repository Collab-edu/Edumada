/** Champs d'une offre selon son type : une crèche n'a ni diplôme, ni domaine, ni débouchés. */
export type OfferKindRules = {
    label: string
    titlePlaceholder: string
    domain: boolean
    diplomas: string[]
    duration: boolean
    childAge: boolean
    level: boolean
    /** Matières et méthodes d'enseignement. */
    subjects: boolean
    /** Programme détaillé par période, spécialisations, évaluation. */
    fullProgramme: boolean
    careers: boolean
    modality: boolean
    selection: boolean
    minAge: boolean
    housing: boolean
    /** Domaine rattaché automatiquement quand le champ n'est pas proposé. */
    autoDomain: string | null
    /** Libellés qui changent selon le type. */
    skillsLabel: string
    languagesLabel: string
    feesLabel: string
    startLabel: string
    scheduleLabel: string
    placeLabel: string
    brochureLabel: string
    onlineLabel: string
    defaultFeesPeriod: 'an' | 'mois'
    defaultSelection: string
}

export const OFFER_KINDS: Record<string, OfferKindRules> = {
    formation: {
        label: 'Formation',
        titlePlaceholder: 'Ex. : Licence en informatique',
        domain: true,
        diplomas: ['Certificat', 'BTS', 'Licence', 'Master', 'Doctorat', 'Autre'],
        duration: true,
        childAge: false,
        level: true,
        subjects: true,
        fullProgramme: true,
        careers: true,
        modality: true,
        selection: true,
        minAge: true,
        housing: true,
        autoDomain: null,
        skillsLabel: 'Compétences acquises',
        languagesLabel: "Langues d'enseignement",
        feesLabel: 'Frais de scolarité (Ar)',
        startLabel: 'Date de rentrée',
        scheduleLabel: 'Horaires',
        placeLabel: 'Lieu des cours',
        brochureLabel: 'Brochure de la formation',
        onlineLabel: 'Recevoir les candidatures en ligne (les étudiants postulent avec leurs documents ; suivi dans « Demandes »)',
        defaultFeesPeriod: 'an',
        defaultSelection: 'Sur dossier',
    },
    niveau: {
        label: 'Niveau scolaire',
        titlePlaceholder: 'Ex. : Collège (6e à 3e)',
        domain: false,
        diplomas: ['CEPE', 'BEPC', 'BAC', 'Autre'],
        duration: false,
        childAge: true,
        level: false,
        subjects: true,
        fullProgramme: false,
        careers: false,
        modality: false,
        selection: true,
        minAge: false,
        housing: true,
        autoDomain: 'Enseignement général',
        skillsLabel: "Ce que l'élève développe",
        languagesLabel: "Langues d'enseignement",
        feesLabel: 'Frais de scolarité (Ar)',
        startLabel: 'Date de rentrée',
        scheduleLabel: 'Horaires',
        placeLabel: 'Lieu des cours',
        brochureLabel: 'Brochure',
        onlineLabel: 'Recevoir les demandes d’inscription en ligne (avec les documents ; suivi dans « Demandes »)',
        defaultFeesPeriod: 'mois',
        defaultSelection: 'Sur dossier',
    },
    accueil: {
        label: 'Accueil (crèche, garderie…)',
        titlePlaceholder: 'Ex. : Accueil en crèche (3 mois – 3 ans)',
        domain: false,
        diplomas: [],
        duration: false,
        childAge: true,
        level: false,
        subjects: false,
        fullProgramme: false,
        careers: false,
        modality: false,
        selection: false,
        minAge: false,
        housing: false,
        autoDomain: 'Petite enfance',
        skillsLabel: "Ce que l'enfant développe",
        languagesLabel: 'Langues parlées',
        feesLabel: "Frais d'accueil (Ar)",
        startLabel: "Date de début d'accueil",
        scheduleLabel: "Horaires d'accueil",
        placeLabel: "Lieu d'accueil",
        brochureLabel: 'Brochure',
        onlineLabel: 'Recevoir les demandes d’inscription en ligne (avec les documents ; suivi dans « Demandes »)',
        defaultFeesPeriod: 'mois',
        defaultSelection: 'Inscription directe',
    },
}

/** Types d'offres proposés selon la catégorie de l'établissement. */
const KINDS_BY_CATEGORY: Record<string, string[]> = {
    superieur: ['formation'],
    'formation-pro': ['formation'],
    scolaire: ['niveau'],
    'petite-enfance': ['accueil', 'niveau'],
}

export const kindsForCategory = (category: string, current?: string) => {
    const kinds = KINDS_BY_CATEGORY[category] ?? Object.keys(OFFER_KINDS)
    return current && !kinds.includes(current) ? [...kinds, current] : kinds
}

/**
 * Structure d'une formation selon la catégorie de l'établissement :
 * - `levels` (supérieur) : Domaine → Filière → Niveaux (Licence, Master…), chacun avec durée, frais et niveau requis ;
 * - `vocational` (formation professionnelle) : Domaine → Formation → Durée (avec unité) et diplôme obtenu ;
 * - `simple` : un diplôme et une durée en années (autres cas).
 */
export type FormationStructure = 'levels' | 'vocational' | 'simple'

export const formationStructure = (category: string, kind: string): FormationStructure =>
    kind !== 'formation' ? 'simple' : category === 'superieur' ? 'levels' : category === 'formation-pro' ? 'vocational' : 'simple'

/** Diplômes d'un niveau d'une filière du supérieur. */
export const HIGHER_DIPLOMAS = ['BTS', 'Licence', 'Master 1', 'Master 2', 'Doctorat', 'Certificat', 'Autre']

/** Diplômes délivrés par une formation professionnelle. */
export const VOCATIONAL_DIPLOMAS = ['Attestation', 'Certificat', 'CAP', 'BT', 'BTS', 'Autre']

export const DURATION_UNITS = ['heures', 'jours', 'semaines', 'mois', 'ans']
