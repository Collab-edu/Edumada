import type { NextConfig } from 'next'

/**
 * Back-office exporté en fichiers statiques (dossier out/) : il fonctionne entièrement
 * dans le navigateur et appelle l'API Laravel. Les identifiants passent en paramètres d'URL
 * (?id=…, ?e=…) plutôt qu'en segments dynamiques, incompatibles avec l'export statique.
 */
const nextConfig: NextConfig = {
    output: 'export',
    trailingSlash: true,
    images: { unoptimized: true },
    devIndicators: false,
    sassOptions: {
        // CoreUI utilise encore d'anciennes fonctions Sass : on masque leurs avertissements.
        quietDeps: true,
        silenceDeprecations: ['import', 'global-builtin', 'color-functions', 'mixed-decls', 'legacy-js-api'],
    },
}

export default nextConfig
