/** Les 7 grandes villes, proposées en premier (mêmes que le filtre « Ville » de l'accueil du site). */
export const MAIN_CITIES = ['Antananarivo', 'Antsirabe', 'Fianarantsoa', 'Toamasina', 'Mahajanga', 'Toliara', 'Antsiranana']

/** Autres villes principales de Madagascar, par ordre alphabétique. */
export const OTHER_CITIES = [
    'Ambanja',
    'Ambatondrazaka',
    'Ambositra',
    'Ambovombe',
    'Antalaha',
    'Farafangana',
    'Fenoarivo Atsinanana',
    'Ihosy',
    'Maintirano',
    'Manakara',
    'Mananjary',
    'Maroantsetra',
    'Miarinarivo',
    'Moramanga',
    'Morondava',
    'Nosy Be',
    'Sambava',
    'Tolagnaro',
    'Tsiroanomandidy',
    'Vohémar',
]

export const CITIES = [...MAIN_CITIES, ...OTHER_CITIES]

const normalize = (text: string) =>
    text
        .normalize('NFD')
        .replace(/[̀-ͯ]/g, '')
        .toLowerCase()
        .trim()

/** Anciens noms et noms renvoyés par OpenStreetMap → ville de la liste. */
const ALIASES: Record<string, string> = {
    tana: 'Antananarivo',
    tananarive: 'Antananarivo',
    tamatave: 'Toamasina',
    majunga: 'Mahajanga',
    tulear: 'Toliara',
    toliary: 'Toliara',
    'diego-suarez': 'Antsiranana',
    diego: 'Antsiranana',
    taolagnaro: 'Tolagnaro',
    'fort-dauphin': 'Tolagnaro',
    'hell-ville': 'Nosy Be',
    andoany: 'Nosy Be',
    iharana: 'Vohemar',
    fenerive: 'Fenoarivo Atsinanana',
    'fenerive-est': 'Fenoarivo Atsinanana',
}

/**
 * Ville de la liste correspondant à un nom libre (« Antananarivo Renivohitra », « Toamasina I »,
 * « Taolagnaro »…) ; null si elle n'y figure pas.
 */
export function matchCity(name: string): string | null {
    const raw = normalize(name)
    // Nom connu tel quel (« Hell-Ville ») avant tout nettoyage ; sinon on retire « Renivohitra », « I », « II »…
    let n = ALIASES[raw]
        ? raw
        : raw
              .replace(/(^|\s)(renivohitra|commune urbaine de|cu)(?=\s|$)/g, ' ')
              .replace(/\s+(i{1,3}|iv)$/, '')
              .trim()
    n = normalize(ALIASES[n] ?? n)
    return CITIES.find((city) => normalize(city) === n) ?? CITIES.find((city) => n.startsWith(normalize(city) + ' ')) ?? null
}
