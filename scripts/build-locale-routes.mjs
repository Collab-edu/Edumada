/**
 * Pages en trois langues. Le contenu de chaque page vit dans src/routes/<chemin>/index.tsx ;
 * la page française (src/app/…/page.tsx) et ses versions anglaise et malgache
 * (src/app/en/…, src/app/mg/…) ne font qu'y renvoyer, avec des métadonnées traduites.
 * Dossiers fixes plutôt qu'un segment dynamique [lang] à la racine, qui gêne Next.js.
 *
 * Nouvelle page : créez-la comme d'habitude dans src/app/(site)/…/page.tsx, puis lancez
 * node scripts/build-locale-routes.mjs : son contenu est déplacé dans src/routes et les
 * trois versions sont créées.
 */
import fs from 'node:fs'
import path from 'node:path'

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1')), '..')
const app = path.join(root, 'src', 'app')
const routes = path.join(root, 'src', 'routes')
// Interrupteur lu dans src/i18n/config.ts (I18N_ENABLED) : désactivé, aucune page /en/ ni /mg/.
const ENABLED = /export const I18N_ENABLED = true/.test(fs.readFileSync(path.join(root, 'src', 'i18n', 'config.ts'), 'utf8'))
const ALL_LOCALES = ['en', 'mg']
const LOCALES = ENABLED ? ALL_LOCALES : []
const MARK = '// Page générée par scripts/build-locale-routes.mjs'

function pages(dir) {
    const found = []
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const full = path.join(dir, entry.name)
        if (entry.isDirectory()) {
            if (!['[lang]', ...ALL_LOCALES].includes(entry.name)) found.push(...pages(full))
        } else if (entry.name === 'page.tsx') {
            found.push(full)
        }
    }
    return found
}

/** Exports d'un module de page (pour les renvoyer tels quels). */
function exportsOf(code) {
    return {
        metadata: /export const metadata\b/.test(code),
        generateMetadata: /export (async )?function generateMetadata\b/.test(code),
        generateStaticParams: /export (async )?function generateStaticParams\b/.test(code),
        dynamicParams: /export const dynamicParams = false/.test(code),
    }
}

for (const dir of ['[lang]', ...ALL_LOCALES]) fs.rmSync(path.join(app, dir), { recursive: true, force: true })
let moved = 0
const written = []
for (const file of pages(app)) {
    const relDir = path.relative(app, path.dirname(file))
    const parts = relDir.split(path.sep).filter(Boolean)
    // Groupes « (site) », « (auth) » : sans effet sur l'adresse.
    const segments = parts.filter((s) => !/^\(.*\)$/.test(s))
    const urlPath = segments.length ? `/${segments.join('/')}/` : '/'
    const contentFile = path.join(routes, ...segments, 'index.tsx')
    const contentImport = ['@/routes', ...segments].join('/')
    let code = fs.readFileSync(file, 'utf8')

    // Première fois : le contenu part dans src/routes, la page devient un renvoi.
    if (!code.startsWith(MARK)) {
        const appImport = ['@/app', ...parts].join('/')
        // Imports relatifs (« ./QueryArticlePage ») : réécrits depuis l'ancien dossier.
        const content = code.replace(/from '\.\/([^']+)'/g, (_, mod) => `from '${appImport}/${mod}'`)
        fs.mkdirSync(path.dirname(contentFile), { recursive: true })
        fs.writeFileSync(contentFile, content)
        moved++
    }
    const contentCode = fs.readFileSync(contentFile, 'utf8')
    const ex = exportsOf(contentCode)
    // Contenu client (« use client ») : la page l'affiche au lieu de le renvoyer tel quel.
    const isClient = /^\s*['"]use client['"]/.test(contentCode)
    const staticParams = ex.generateStaticParams ? ['generateStaticParams'] : []
    const meta = [ex.metadata && 'metadata', ex.generateMetadata && 'generateMetadata'].filter(Boolean)

    // Page française : renvoi vers le contenu.
    fs.writeFileSync(
        file,
        [
            MARK + ' : ne pas modifier à la main.',
            `// Contenu de la page : src/routes/${segments.join('/')}${segments.length ? '/' : ''}index.tsx`,
            ...(isClient
                ? [`import Content from '${contentImport}'`, '', 'export default function Page() {', '    return <Content />', '}']
                : [`export { ${['default', ...meta, ...staticParams].join(', ')} } from '${contentImport}'`]),
            ...(ex.dynamicParams ? ['export const dynamicParams = false'] : []),
            '',
        ].join('\n')
    )

    // Versions anglaise et malgache : même contenu, métadonnées traduites.
    for (const locale of LOCALES) {
        const out = path.join(app, locale, ...segments, 'page.tsx')
        fs.mkdirSync(path.dirname(out), { recursive: true })
        fs.writeFileSync(
            out,
            [
                MARK + ' : ne pas modifier à la main.',
                // Un module client n'expose pas de métadonnées : on n'en lit rien.
                ...(isClient ? [] : [`import * as source from '${contentImport}'`]),
                "import { localizedMetadata } from '@/i18n/metadata'",
                '',
                ...(isClient
                    ? [`import Content from '${contentImport}'`, '', 'export default function Page() {', '    return <Content />', '}']
                    : [`export { default${staticParams.length ? ', generateStaticParams' : ''} } from '${contentImport}'`]),
                ...(ex.dynamicParams ? ['export const dynamicParams = false'] : []),
                '',
                `export const generateMetadata = localizedMetadata(${isClient ? '{}' : 'source'}, '${urlPath}', '${locale}')`,
                '',
            ].join('\n')
        )
    }
    written.push(urlPath)
}

for (const locale of LOCALES) {
    fs.writeFileSync(
        path.join(app, locale, 'layout.tsx'),
        [
            MARK + ' : ne pas modifier à la main.',
            "import type { Metadata } from 'next'",
            "import { translate } from '@/i18n/translate'",
            '',
            `/** Version ${locale === 'en' ? 'anglaise' : 'malgache'} du site (/${locale}/…). */`,
            'export const metadata: Metadata = {',
            `    title: { absolute: translate('${locale}', 'Edumada — Trouvez votre formation à Madagascar'), template: '%s | Edumada' },`,
            '    description: translate(',
            `        '${locale}',`,
            "        'Explorez les formations, comparez les établissements et trouvez le parcours adapté à vos ambitions, à votre budget et à votre projet professionnel à Madagascar.'",
            '    ),',
            '}',
            '',
            'export default function LocaleLayout({ children }: { children: React.ReactNode }) {',
            '    return children',
            '}',
            '',
        ].join('\n')
    )
}
console.log(`[langues] ${written.length} pages (${moved} contenus déplacés dans src/routes) × ${ENABLED ? '3 langues (src/app/en, src/app/mg)' : '1 langue (multilingue désactivé)'}`)
