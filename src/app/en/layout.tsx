// Page générée par scripts/build-locale-routes.mjs : ne pas modifier à la main.
import type { Metadata } from 'next'
import { translate } from '@/i18n/translate'

/** Version anglaise du site (/en/…). */
export const metadata: Metadata = {
    title: { absolute: translate('en', 'Edumada — Trouvez votre formation à Madagascar'), template: '%s | Edumada' },
    description: translate(
        'en',
        'Explorez les formations, comparez les établissements et trouvez le parcours adapté à vos ambitions, à votre budget et à votre projet professionnel à Madagascar.'
    ),
}

export default function LocaleLayout({ children }: { children: React.ReactNode }) {
    return children
}
