# Règles de travail — SMS-mail

## Workflow obligatoire avant toute intervention

### 1. Git pull depuis main
Toujours exécuter avant de toucher le moindre fichier :
```bash
git pull origin main
```

### 2. Commits séparés par modification
Chaque changement distinct = un commit séparé avec préfixe conventionnel :
- `feat:` pour une nouvelle fonctionnalité
- `fix:` pour une correction de bug
- `refactor:` pour une restructuration sans changement de comportement

```bash
git add <fichier>
git commit -m "feat: description claire du changement"
```

> Les commits git servent de backup — pas besoin de copies horodatées locales.
> Pour revenir en arrière : `git log` pour trouver le commit, `git checkout <sha> -- index.html` pour restaurer.

### 3. Push vers main
Après chaque commit, pousser dans le repo :
```bash
git push -u origin main
```

## Résumé du flux

```
git pull origin main
→ modification
→ commit (feat/fix/refactor)
→ git push origin main
```

## Politique de tests

App = fichier HTML unique en JS vanilla, sans build ni framework. Les tests automatisés (Playwright) coûtent du temps sur chaque intervention et n'apportent rien pour un simple changement d'UI (bouton, libellé, style).

- **Toujours** : vérifier la syntaxe JS avant de committer — coût quasi nul :
  ```bash
  node -e "
  const fs = require('fs');
  const html = fs.readFileSync('index.html','utf8');
  const scripts = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m=>m[1]);
  scripts.forEach((s,i)=>{ try{ new Function(s); console.log(i,'OK'); } catch(e){ console.log(i,'ERROR', e.message); } });
  "
  ```
- **Test Playwright ciblé requis** uniquement quand le changement touche au **calcul ou à la persistance des données** : migrations localStorage, logique de fusion/déduplication, calculs de statuts/créneaux (`getSlots`, `hasConflict`), sauvegarde/restauration GitHub. C'est justement l'absence de ce genre de test qui a causé une perte de CMS lors de la migration du 24/07.
- **Pas de test Playwright** pour : ajout de bouton, changement de libellé/couleur, réorganisation d'UI, ajout de KPI d'affichage simple.
