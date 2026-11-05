import withBasePath from './base-path'

/** Image affichée quand un établissement ou une offre n'a pas encore de photo. */
export const PLACEHOLDER_IMAGE = withBasePath('/images/placeholder.svg')

/**
 * Source d'image sûre : `next/image` refuse une source vide.
 * `width` : largeur à demander à Unsplash, pour ne pas télécharger plus grand que l'affichage.
 */
export function imageOr(src: string | null | undefined, width?: number): string {
    if (!src || src.trim() === '') return PLACEHOLDER_IMAGE
    return width && src.startsWith('https://images.unsplash.com/') ? src.replace(/([?&]w=)\d+/, `$1${width}`) : src
}

/** Lien d'ouverture de la carte OpenStreetMap ; null sans coordonnées. */
export function mapUrls(coordinates: { lat: number; lng: number } | null) {
    if (!coordinates) return null
    const { lat, lng } = coordinates
    return {
        link: `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=16/${lat}/${lng}`,
    }
}
