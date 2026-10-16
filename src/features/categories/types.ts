/**
 * Catégorie d'établissement (université, crèche, formation pro, primaire/secondaire, autres).
 * `fields` décide quelles informations sont affichées : une crèche n'a ni diplôme ni programme,
 * mais l'âge des enfants accueillis compte. Les catégories sont des données, administrables plus tard.
 */
export type CategoryType = {
  id: string
  label: string
  shortLabel: string
  icon: string
  subCategories: string[]
  /** Titre de la liste d'offres sur la fiche : « Formations proposées », « Niveaux scolaires »… */
  offersLabel: string
  fields: {
    diplomas: boolean
    programme: boolean
    level: boolean
    childAge: boolean
    duration: boolean
    careers: boolean
  }
}

/** Valeurs par défaut si une catégorie est inconnue : on affiche tout. */
export const DEFAULT_FIELDS: CategoryType['fields'] = {
  diplomas: true,
  programme: true,
  level: true,
  childAge: true,
  duration: true,
  careers: true,
}

export function findCategory(categories: CategoryType[], id: string): CategoryType | undefined {
  return categories.find((c) => c.id === id)
}
