# Edumada — Frontend

Site web d'Edumada : trouvez votre formation à Madagascar, comparez les établissements et construisez votre avenir.

## Stack

- [Next.js 15](https://nextjs.org/) (App Router, export statique)
- React 19, TypeScript
- Tailwind CSS v4

## Démarrer

```bash
npm install
npm run dev
```

Le site est disponible sur http://localhost:3000.

| Commande          | Rôle                                         |
| ----------------- | -------------------------------------------- |
| `npm run dev`     | Serveur de développement                     |
| `npm run build`   | Build de production (export statique `out/`) |
| `npm run lint`    | Vérification ESLint                          |
| `npm run deploy`  | Publication de `out/` sur GitHub Pages       |

## Structure

```
src/
  app/          Routes : accueil, /recherche, connexion, inscription, 404
  features/     Un dossier par fonctionnalité (recherche, domaines, formations,
                etablissements, auth, marketing)
  components/   Composants génériques (ui/) et mise en page (layout/)
  data/         Accès aux données du site (aujourd'hui public/data/data.json)
  lib/          Utilitaires
public/
  data/data.json   Contenu du site (menus, domaines, formations, établissements)
  images/          Logos et illustrations
```

Les couleurs de la marque sont définies dans `src/app/globals.css` (`primary`, `secondary`, `success`, `cream`, `offwhite`, `ink`).

## Crédits

Projet construit à partir d'un template Next.js sous licence MIT,
© GetNextJs Templates.com.
