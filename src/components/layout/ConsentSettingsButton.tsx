'use client'
import { useT } from '@/i18n/client'
import { openConsentSettings } from '@/lib/consent'

/** Bouton « Gérer les cookies » de la politique de confidentialité : rouvre le bandeau de consentement. */
export default function ConsentSettingsButton() {
    const t = useT()
    return (
        <button
            type='button'
            onClick={openConsentSettings}
            className='self-start rounded-xl bg-secondary px-5 py-3 font-semibold text-white transition-colors duration-200 hover:cursor-pointer hover:bg-secondary/90'>
            {t('Gérer les cookies')}
        </button>
    )
}
