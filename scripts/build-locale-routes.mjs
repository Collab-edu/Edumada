/**
 * Génère src/app/[lang]/… : une page anglaise et malgache pour chaque page française.
 * Chaque fichier réutilise la page française (même composant) avec des métadonnées traduites.
 * À relancer après l'ajout d'une page : node scripts/build-locale-routes.mjs
 */
import fs from 'node:fs'
import path from 'node:path'

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1')), '..')
const app = path.join(root, 'src', 'app')
const target = path.join(app, '[lang]')

function pages(dir) {
    const found = []
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const full = path.join(dir, entry.name)
        if (entry.isDirectory()) {
            if (entry.name !== '[lang]') found.push(...pages(full))
        } else if (entry.name === 'page.tsx') {
            found.push(full)
        }
    }
    return found
}

fs.rmSync(target, { recursive: true, force: true })
const written = []
for (const file of pages(app)) {
    const rel = path.relative(app, path.dirname(file)).split(path.sep)
    // Groupes « (site) », « (auth) » : sans effet sur l'adresse.
    const segments = rel.filter((s) => s && !/^\(.*\)$/.test(s))
    const urlPath = segments.length ? `/${segments.join('/')}/` : '/'
    const source = ['@/app', ...rel.filter(Boolean), 'page'].join('/')
    const code = fs.readFileSync(file, 'utf8')
    const hasStaticParams = /export (async )?function generateStaticParams/.test(code)

    const lines = [
        '// Fichier généré par scripts/build-locale-routes.mjs : ne pas modifier à la main.',
        `import Page from '${source}'`,
        `import * as source from '${source}'`,
        "import { localizedMetadata } from '@/i18n/metadata'",
        '',
        ...(hasStaticParams ? [`export { generateStaticParams } from '${source}'`, 'export const dynamicParams = false', ''] : []),
        `export const generateMetadata = localizedMetadata(source, '${urlPath}')`,
        '',
        'export default Page',
        '',
    ]
    const out = path.join(target, ...segments, 'page.tsx')
    fs.mkdirSync(path.dirname(out), { recursive: true })
    fs.writeFileSync(out, lines.join('\n'))
    written.push(urlPath)
}

fs.writeFileSync(
    path.join(target, 'layout.tsx'),
    [
        '// Fichier généré par scripts/build-locale-routes.mjs : ne pas modifier à la main.',
        "import type { Metadata } from 'next'",
        "import { PREFIXED_LOCALES, type Locale } from '@/i18n/config'",
        "import { translate } from '@/i18n/translate'",
        '',
        '/** Versions anglaise et malgache du site (/en/…, /mg/…). */',
        'export const dynamicParams = false',
        '',
        'export function generateStaticParams() {',
        '    return PREFIXED_LOCALES.map((lang) => ({ lang }))',
        '}',
        '',
        'export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {',
        '    const locale = (await params).lang as Locale',
        '    return {',
        "        title: { default: translate(locale, 'Edumada — Trouvez votre formation à Madagascar'), template: '%s | Edumada' },",
        '        description: translate(',
        '            locale,',
        "            'Explorez les formations, comparez les établissements et trouvez le parcours adapté à vos ambitions, à votre budget et à votre projet professionnel à Madagascar.'",
        '        ),',
        '    }',
        '}',
        '',
        'export default function LocaleLayout({ children }: { children: React.ReactNode }) {',
        '    return children',
        '}',
        '',
    ].join('\n')
)
console.log(`[langues] ${written.length} pages × ${2} langues générées dans src/app/[lang]`)
