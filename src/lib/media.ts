import withBasePath from './base-path'

/** Image affichée quand un établissement ou une offre n'a pas encore de photo. */
export const PLACEHOLDER_IMAGE = withBasePath('/images/placeholder.svg')

/** Source d'image sûre : `next/image` refuse une source vide. */
export function imageOr(src: string | null | undefined): string {
    return src && src.trim() !== '' ? src : PLACEHOLDER_IMAGE
}

/** Lien d'ouverture de la carte OpenStreetMap ; null sans coordonnées. */
export function mapUrls(coordinates: { lat: number; lng: number } | null) {
    if (!coordinates) return null
    const { lat, lng } = coordinates
    return {
        link: `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=16/${lat}/${lng}`,
    }
}
