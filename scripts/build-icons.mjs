/**
 * Embarque dans le site les icônes réellement utilisées, pour qu'elles s'affichent
 * immédiatement, sans appel au service en ligne Iconify.
 *
 * Parcourt src/ et public/data/, relève les noms « tabler:… » et « material-symbols:… »,
 * puis écrit leur dessin dans src/lib/icons-bundle.json (lu par src/lib/icons.ts).
 * Lancé automatiquement avant `npm run dev` et `npm run build`.
 */
import fs from 'node:fs'
import path from 'node:path'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
const root = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1')), '..')
const SETS = { tabler: '@iconify-json/tabler/icons.json', 'material-symbols': '@iconify-json/material-symbols/icons.json' }

// Icônes construites dynamiquement dans le code (réseaux sociaux des fiches établissement).
const DYNAMIC = ['brand-facebook', 'brand-instagram', 'brand-linkedin', 'brand-youtube'].map((n) => `tabler:${n}`)

function walk(dir, files = []) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const full = path.join(dir, entry.name)
        if (entry.isDirectory()) walk(full, files)
        else if (/\.(tsx?|json)$/.test(entry.name) && entry.name !== 'icons-bundle.json') files.push(full)
    }
    return files
}

const used = new Set(DYNAMIC)
// Un nom suivi de « -${…} » est construit dynamiquement : on l'ignore (voir DYNAMIC).
const pattern = new RegExp(`\\b(${Object.keys(SETS).join('|')}):([a-z0-9]+(?:-[a-z0-9]+)*)(?![a-z0-9$-])`, 'g')
for (const file of [...walk(path.join(root, 'src')), ...walk(path.join(root, 'public', 'data'))]) {
    for (const match of fs.readFileSync(file, 'utf8').matchAll(pattern)) used.add(`${match[1]}:${match[2]}`)
}

const bundle = []
const missing = []
for (const [prefix, file] of Object.entries(SETS)) {
    const set = require(file)
    const names = [...used].filter((n) => n.startsWith(`${prefix}:`)).map((n) => n.slice(prefix.length + 1))
    const icons = {}
    const aliases = {}
    for (const name of names) {
        if (set.icons[name]) icons[name] = set.icons[name]
        else if (set.aliases?.[name]) {
            aliases[name] = set.aliases[name]
            const parent = set.aliases[name].parent
            if (set.icons[parent]) icons[parent] = set.icons[parent]
        } else missing.push(`${prefix}:${name}`)
    }
    bundle.push({ prefix, icons, aliases, width: set.width, height: set.height })
}

fs.writeFileSync(path.join(root, 'src', 'lib', 'icons-bundle.json'), JSON.stringify(bundle))
const count = bundle.reduce((n, s) => n + Object.keys(s.icons).length, 0)
console.log(`[icônes] ${count} icônes embarquées` + (missing.length ? ` ; introuvables : ${missing.join(', ')}` : ''))
