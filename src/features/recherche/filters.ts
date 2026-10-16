import type { AdmissionLevel, FormationType } from '@/features/formations/types'

/* ------------------------------------------------------------------ */
/* Options des filtres avancés                                         */
/* ------------------------------------------------------------------ */

export const BUDGET_RANGES = [
    { label: 'Moins de 1 000 000 Ar', min: 0, max: 1_000_000 },
    { label: '1 000 000 – 2 500 000 Ar', min: 1_000_000, max: 2_500_000 },
    { label: '2 500 000 – 5 000 000 Ar', min: 2_500_000, max: 5_000_000 },
    { label: 'Plus de 5 000 000 Ar', min: 5_000_000, max: Infinity },
] as const

export const DURATIONS = ["Moins d'un an", '1 an', '2 ans', '3 ans', '5 ans ou plus'] as const
export const MODALITIES = ['Présentiel', 'Distanciel', 'Hybride'] as const
export const DIPLOMAS = ['Certificat', 'BTS', 'Licence', 'Master', 'Doctorat', 'Autre'] as const
export const REGISTRATION_OPTIONS = ['Toutes', 'Inscriptions ouvertes', 'À venir'] as const
export const LANGUAGES = ['Français', 'Malgache', 'Anglais', 'Autre'] as const
/** Niveau actuel de l'étudiant : on affiche les formations qui lui sont accessibles. */
export const ADMISSION_LEVELS = ['Tous les niveaux', 'Sans BAC', 'BAC', 'BAC+2', 'BAC+3'] as const
export const BAC_SERIES = ['A', 'C', 'D', 'Technique'] as const
export const HOUSING_OPTIONS = ['Disponible', 'Non disponible', 'Non renseigné'] as const
export const SCHOLARSHIP_OPTIONS = ['Bourses disponibles', 'Non renseigné'] as const
/** Âge de l'enfant (crèches, écoles) : valeur vide = tous âges. */
export const CHILD_AGES = [
    { value: '', label: 'Tous les âges' },
    { value: '0.5', label: "Moins d'un an" },
    ...Array.from({ length: 17 }, (_, i) => ({ value: String(i + 1), label: i === 0 ? '1 an' : `${i + 1} ans` })),
]

export const SORT_OPTIONS = [
    { value: 'pertinence', label: 'Pertinence' },
    { value: 'frais-asc', label: 'Frais croissants' },
    { value: 'frais-desc', label: 'Frais décroissants' },
    { value: 'duree-asc', label: 'Durée la plus courte' },
] as const
export type SortValue = (typeof SORT_OPTIONS)[number]['value']

/* ------------------------------------------------------------------ */
/* État des filtres                                                    */
/* ------------------------------------------------------------------ */

export type SearchFilters = {
    /** Recherche libre sur l'intitulé de la formation. */
    q: string
    /** Filtres principaux (barre du haut, identiques au Hero). Chaîne vide = tous. */
    categorie: string
    domaine: string
    ville: string
    type: string
    /** Filtres avancés : à l'intérieur d'un groupe, les choix se combinent en « OU ». */
    budgets: string[]
    durations: string[]
    modalities: string[]
    diplomas: string[]
    registration: string
    school: string
    languages: string[]
    admissionLevel: string
    bacSeries: string[]
    housing: string[]
    scholarships: string[]
    /** Âge de l'enfant en années, chaîne vide = tous âges. */
    childAge: string
}

export const EMPTY_FILTERS: SearchFilters = {
    q: '',
    categorie: '',
    domaine: '',
    ville: '',
    type: '',
    budgets: [],
    durations: [],
    modalities: [],
    diplomas: [],
    registration: 'Toutes',
    school: '',
    languages: [],
    admissionLevel: 'Tous les niveaux',
    bacSeries: [],
    housing: [],
    scholarships: [],
    childAge: '',
}

/** Le filtre « Niveau d'études » du Hero correspond au diplôme préparé. */
const HERO_LEVEL_TO_DIPLOMA: Record<string, string> = {
    'BTS / DTS': 'BTS',
    'Formation professionnelle': 'Certificat',
}

/** Construit l'état initial à partir des paramètres envoyés par la barre de recherche du Hero. */
export function filtersFromParams(params: URLSearchParams): SearchFilters {
    const niveau = params.get('niveau')
    return {
        ...EMPTY_FILTERS,
        q: params.get('q') ?? '',
        categorie: params.get('categorie') ?? '',
        domaine: params.get('domaine') ?? '',
        ville: params.get('ville') ?? '',
        type: params.get('type') ?? '',
        diplomas: niveau ? [HERO_LEVEL_TO_DIPLOMA[niveau] ?? niveau] : [],
    }
}

/* ------------------------------------------------------------------ */
/* Filtrage et tri                                                     */
/* ------------------------------------------------------------------ */

export function durationCategory(years: number | null): string | null {
    if (years === null) return null
    if (years < 1) return "Moins d'un an"
    if (years >= 5) return '5 ans ou plus'
    return years === 1 ? '1 an' : `${years} ans`
}

const ADMISSION_RANK: Record<AdmissionLevel, number> = { Aucun: 0, BAC: 1, 'BAC+2': 2, 'BAC+3': 3 }
const STUDENT_RANK: Record<string, number> = { 'Sans BAC': 0, BAC: 1, 'BAC+2': 2, 'BAC+3': 3 }

const normalize = (s: string) =>
    s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim()

const REGISTRATION_VALUE: Record<string, string> = {
    'Inscriptions ouvertes': 'Ouvertes',
    'À venir': 'À venir',
}

/** Une liste vide signifie « pas de filtre » ; sinon la valeur doit en faire partie. */
const matchesAny = (selected: string[], value: string | null) =>
    selected.length === 0 || (value !== null && selected.includes(value))

/** `categoryLabel` traduit l'identifiant de catégorie d'une offre en libellé (« Petite enfance »…). */
export function matchesFilters(f: FormationType, filters: SearchFilters, categoryLabel: (id: string) => string | undefined = () => undefined): boolean {
    if (filters.categorie && categoryLabel(f.category) !== filters.categorie) return false
    if (filters.q && !normalize(`${f.title} ${f.domain}`).includes(normalize(filters.q))) return false
    if (filters.domaine && f.domain !== filters.domaine) return false
    if (filters.ville && f.city !== filters.ville) return false
    if (filters.type && f.schoolType !== filters.type) return false

    if (filters.budgets.length > 0) {
        const inBudget = BUDGET_RANGES.some(
            (r) => filters.budgets.includes(r.label) && f.fees !== null && f.fees >= r.min && f.fees < r.max
        )
        if (!inBudget) return false
    }
    if (!matchesAny(filters.durations, durationCategory(f.durationYears))) return false
    if (!matchesAny(filters.modalities, f.modality)) return false
    if (!matchesAny(filters.diplomas, f.diploma)) return false
    if (filters.registration !== 'Toutes' && f.registration !== REGISTRATION_VALUE[filters.registration]) return false

    if (filters.school && !normalize(f.school).includes(normalize(filters.school))) return false
    if (filters.languages.length > 0) {
        const known = f.languages.map((l) => (LANGUAGES.includes(l as never) ? l : 'Autre'))
        if (!filters.languages.some((l) => known.includes(l))) return false
    }
    if (filters.admissionLevel in STUDENT_RANK) {
        if (ADMISSION_RANK[f.admission.level] > STUDENT_RANK[filters.admissionLevel]) return false
    }
    if (filters.bacSeries.length > 0 && f.admission.bacSeries.length > 0) {
        if (!filters.bacSeries.some((s) => f.admission.bacSeries.includes(s))) return false
    }
    if (!matchesAny(filters.housing, f.housing)) return false
    if (!matchesAny(filters.scholarships, f.scholarship)) return false
    if (filters.childAge) {
        const age = Number(filters.childAge)
        if (!f.ageRange || age < f.ageRange.min || age > f.ageRange.max) return false
    }
    return true
}

/** Les formations sans frais ou sans durée renseignés passent toujours en dernier. */
export function sortFormations(list: FormationType[], sort: SortValue): FormationType[] {
    const byNullable = (get: (f: FormationType) => number | null, dir: 1 | -1) => (a: FormationType, b: FormationType) => {
        const va = get(a)
        const vb = get(b)
        if (va === null) return vb === null ? 0 : 1
        if (vb === null) return -1
        return (va - vb) * dir
    }
    switch (sort) {
        case 'frais-asc':
            return [...list].sort(byNullable((f) => f.fees, 1))
        case 'frais-desc':
            return [...list].sort(byNullable((f) => f.fees, -1))
        case 'duree-asc':
            return [...list].sort(byNullable((f) => f.durationYears, 1))
        default:
            return list
    }
}

/* ------------------------------------------------------------------ */
/* Pastilles des filtres actifs                                        */
/* ------------------------------------------------------------------ */

export type ActiveFilter = { id: string; label: string; remove: (f: SearchFilters) => SearchFilters }

export function activeFilters(filters: SearchFilters): ActiveFilter[] {
    const chips: ActiveFilter[] = []
    const text = (key: 'q' | 'categorie' | 'domaine' | 'ville' | 'type' | 'school', prefix = '') => {
        if (filters[key]) chips.push({ id: key, label: prefix + filters[key], remove: (f) => ({ ...f, [key]: '' }) })
    }
    const list = (
        key: 'budgets' | 'durations' | 'modalities' | 'diplomas' | 'languages' | 'bacSeries' | 'housing' | 'scholarships',
        prefix = ''
    ) => {
        for (const value of filters[key]) {
            chips.push({
                id: `${key}-${value}`,
                label: prefix + value,
                remove: (f) => ({ ...f, [key]: f[key].filter((v) => v !== value) }),
            })
        }
    }

    text('q', '« ')
    if (filters.q) chips[chips.length - 1].label += ' »'
    text('categorie')
    text('domaine')
    text('ville')
    text('type')
    list('budgets')
    list('durations')
    list('modalities')
    list('diplomas')
    if (filters.registration !== EMPTY_FILTERS.registration) {
        chips.push({ id: 'registration', label: filters.registration, remove: (f) => ({ ...f, registration: EMPTY_FILTERS.registration }) })
    }
    text('school', 'Établissement : ')
    list('languages')
    if (filters.admissionLevel !== EMPTY_FILTERS.admissionLevel) {
        chips.push({
            id: 'admissionLevel',
            label: `Mon niveau : ${filters.admissionLevel}`,
            remove: (f) => ({ ...f, admissionLevel: EMPTY_FILTERS.admissionLevel }),
        })
    }
    list('bacSeries', 'BAC série ')
    list('housing', 'Hébergement : ')
    list('scholarships')
    if (filters.childAge) {
        const label = CHILD_AGES.find((a) => a.value === filters.childAge)?.label ?? `${filters.childAge} ans`
        chips.push({ id: 'childAge', label: `Âge de l'enfant : ${label}`, remove: (f) => ({ ...f, childAge: '' }) })
    }
    return chips
}
