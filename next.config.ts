import type { NextConfig } from 'next'

const basePath = '';
// Pour GitHub Pages (https://mahefa-int.github.io/Edumada-frontend/) :
// const basePath = '/Edumada-frontend';

const nextConfig: NextConfig = {
    /* config options here */
    output: 'export',
    trailingSlash: true,
    experimental: {
        // CSS intégré à la page : plus de requête qui bloque le premier affichage.
        // À garder avec prefetch={false} (src/i18n/client.tsx) : le CSS est aussi recopié dans les fichiers préchargés.
        inlineCss: true,
    },
    basePath,
    assetPrefix: basePath,
    // Masque le badge « N » de Next.js affiché en mode développement
    devIndicators: false,
    eslint: {
        ignoreDuringBuilds: true,
    },
    images: {
        unoptimized: true,
    },
    env: {
        NEXT_PUBLIC_BASE_PATH: basePath,
    },
}

export default nextConfig
