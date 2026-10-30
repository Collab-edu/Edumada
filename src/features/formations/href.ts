/** Adresse de la fiche d'une offre : /etablissements/{établissement}/{offre}/ */
export const offerHref = (offer: { schoolId: string; urlSlug: string }) => `/etablissements/${offer.schoolId}/${offer.urlSlug}/`
