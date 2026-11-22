'use client'
import { usePathname } from 'next/navigation'
import { stripLocale } from '@/i18n/config'
import { CONTACT } from './social-links'
import withBasePath from '@/lib/base-path'
import { useT } from '@/i18n/client'

/** Message pré-rempli à l'ouverture de la discussion. */
const MESSAGE = "Bonjour Edumada, j'ai une question."

/** Pages ayant une barre d'action fixée en bas sur mobile : le bouton se place au-dessus. */
const PAGES_WITH_MOBILE_BAR = ['/formations/voir']

/**
 * Bouton flottant WhatsApp (bas à droite).
 * Tant que CONTACT.whatsapp est vide, il mène à la page Contact.
 */
export default function WhatsAppButton() {
    const t = useT()
    const path = stripLocale(usePathname() ?? '/')
    const number = CONTACT.whatsapp.replace(/\D/g, '')
    const href = number ? `https://wa.me/${number}?text=${encodeURIComponent(MESSAGE)}` : withBasePath('/contact')
    const raised = PAGES_WITH_MOBILE_BAR.includes(path)

    return (
        <a
            href={href}
            {...(number ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
            aria-label={t('Nous écrire sur WhatsApp')}
            title={t('Nous écrire sur WhatsApp')}
            className={`fixed right-4 z-50 flex h-13 w-13 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition duration-300 hover:bg-[#1ebe5b] sm:bottom-8 sm:right-8 ${raised ? 'bottom-24 lg:bottom-8' : 'bottom-4'}`}>
            <svg viewBox='0 0 24 24' fill='currentColor' aria-hidden='true' className='h-7 w-7'>
                <path d='M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.48-.89-.79-1.49-1.77-1.66-2.07-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.61-.92-2.21-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48s1.07 2.88 1.21 3.07c.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.69.63.71.23 1.36.2 1.87.12.57-.08 1.76-.72 2-1.41.25-.7.25-1.29.17-1.41-.07-.13-.27-.2-.57-.35zM12.04 21.5h-.01a9.45 9.45 0 0 1-4.82-1.32l-.35-.21-3.58.94.96-3.49-.23-.36a9.43 9.43 0 0 1-1.45-5.03c0-5.22 4.25-9.47 9.48-9.47 2.53 0 4.91.99 6.7 2.78a9.41 9.41 0 0 1 2.77 6.7c0 5.22-4.25 9.46-9.47 9.46zm8.06-17.53A11.33 11.33 0 0 0 12.04.63C5.76.63.65 5.74.65 12.02c0 2.01.52 3.97 1.52 5.69L.55 23.6l6.04-1.58a11.38 11.38 0 0 0 5.44 1.39h.01c6.28 0 11.39-5.11 11.39-11.39 0-3.04-1.18-5.9-3.33-8.05z' />
            </svg>
        </a>
    )
}
