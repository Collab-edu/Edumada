// Fichier généré par scripts/build-locale-routes.mjs : ne pas modifier à la main.
import type { Metadata } from 'next'
import { PREFIXED_LOCALES, type Locale } from '@/i18n/config'
import { translate } from '@/i18n/translate'

/** Versions anglaise et malgache du site (/en/…, /mg/…). */
export const dynamicParams = false

export function generateStaticParams() {
    return PREFIXED_LOCALES.map((lang) => ({ lang }))
}

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
    const locale = (await params).lang as Locale
    return {
        title: { default: translate(locale, 'Edumada — Trouvez votre formation à Madagascar'), template: '%s | Edumada' },
        description: translate(
            locale,
            'Explorez les formations, comparez les établissements et trouvez le parcours adapté à vos ambitions, à votre budget et à votre projet professionnel à Madagascar.'
        ),
    }
}

export default function LocaleLayout({ children }: { children: React.ReactNode }) {
    return children
}
