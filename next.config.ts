import type { NextConfig } from 'next'

const basePath = '';
// const basePath = '/si-education';

const nextConfig: NextConfig = {
    /* config options here */
    output: 'export',
    trailingSlash: true,
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
