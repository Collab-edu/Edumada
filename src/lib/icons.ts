import { addCollection } from '@iconify/react'
import type { IconifyJSON } from '@iconify/types'
import bundle from './icons-bundle.json'

/**
 * Icônes du site embarquées dans le code (générées par scripts/build-icons.mjs) :
 * elles s'affichent immédiatement, sans appel au service en ligne Iconify.
 * Une icône absente du lot (par ex. choisie plus tard pour une nouvelle catégorie) reste chargée en ligne.
 */
for (const collection of bundle as unknown as IconifyJSON[]) addCollection(collection)
