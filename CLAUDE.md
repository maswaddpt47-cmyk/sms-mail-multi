# Règles de travail — SMS-mail

## Règles de collaboration avec Claude

### Côté Claude

**Patterns récurrents — priorité haute**
1. Ne jamais présenter une explication technique plausible comme un fait : marquer explicitement "hypothèse non vérifiée" dans le code, les commits et les messages, tant qu'aucune preuve (log, capture, test réel) ne la confirme.
2. Ne jamais déclarer "c'est réparé", "c'est en ligne" ou "testé" sans vérification réelle du chemin critique (déploiement, rendu navigateur, test exécuté) — pas une lecture de code qui "devrait marcher".
3. Sur toute demande d'audit ou de correction d'un bug de calcul/données, livrer un audit systématique (tous les points d'impact) avant la première correction, pas des trouvailles ponctuelles au fil des questions — ex. les filtres de dépassement/relance dupliqués sur 5-6 endroits : les identifier tous en une passe.
4. Signaler explicitement toute déviation d'une spec fournie ou toute décision de design prise seul, au moment où elle est prise — jamais en note après coup.
5. Poser une question de clarification dès qu'une demande est réellement ambiguë ou sous-spécifiée ("adapte" vs "applique", référence visuelle absente) plutôt que de trancher en silence ou produire un placeholder.
6. En contexte multi-repo, utiliser `cd /chemin/complet &&` systématiquement ; vérifier `git status`/`git log` et la cohérence CLAUDE.md vs instructions de session avant d'agir, pas après.
6bis. Toujours faire un `git pull` avant de lire ou modifier le moindre fichier, même si le repo semble à jour. Respecter la politique de push définie plus bas dans ce fichier et signaler tout conflit avec les instructions de session avant d'agir, pas après.

   > ⚠️ Conflit actif signalé : ce fichier documente un flux "push direct sur `main`" (section Workflow ci-dessous). En pratique, dans cet environnement Claude Code, les instructions de session imposent de développer sur une branche dédiée (`claude/sms-mail-multi-profile-u32i0j`) puis PR + merge — ces instructions de session priment. Les deux flux coexistent selon le canal d'exécution ; vérifier lequel s'applique en début de session plutôt que de supposer.

7. Après toute reprise de session ou résumé de contexte, relire l'état réel du fichier concerné avant de le modifier ou de le renvoyer — ne jamais présumer qu'un correctif précédent est encore en place.
8. Avant de pousser un changement visuel (CSS/layout), vérifier mentalement les interactions connues à risque (stacking context, overflow, position sticky/fixed) sur les zones sensibles existantes.

**Bonnes pratiques à maintenir**
9. Continuer à demander l'avis avant toute action à fort impact (déploiement, architecture, migration de données) et exécuter vite dès validation courte reçue.
10. Continuer à privilégier la preuve concrète (logs, captures, tests réels) sur la déduction théorique pour tout diagnostic.

### Côté utilisateur

**Patterns récurrents — priorité haute**
1. Donner le contexte temporel et les tentatives déjà faites dès le premier message ("ça marchait hier", "j'ai déjà testé X", "je pensais avoir réglé ça avec Y") plutôt qu'après coup.
2. Pour un bug visuel ou "bizarre", ajouter une ligne de description du symptôme précis (ou une capture annotée) plutôt qu'une formule vague.
3. Signaler explicitement en début de message tout changement d'état fait hors session (redéploiement, config, branche renommée, settings modifiés).
4. Pour les demandes ouvertes ("plus", "mieux", "améliore"), préciser le critère de succès attendu (différent de l'existant / même chose mais plus visible).
5. Donner un retour de validation réelle après test terrain, même court ("testé, ça marche" / "ça casse en fait") — sans ce signal, Claude ne peut pas recouper ses inférences.

**Bonnes pratiques à maintenir**
6. Continuer à valider court et vite sur le travail bien cadré ("ok", "la totale") — ça marche bien tant que la portée est claire.
7. Continuer à recadrer immédiatement dès qu'une mauvaise direction est repérée — c'est efficace et limite les dégâts.

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
- **Pas de test Playwright par défaut**, même sur les changements de calcul/données (`getSlots`, `hasConflict`, migrations, dédup…) — ça consomme trop de temps/tokens à répétition. La vérification de syntaxe suffit dans l'immense majorité des cas.
- **Test Playwright ciblé uniquement** : si l'utilisateur le demande explicitement pour ce changement, ou en début de session pour valider l'état général de l'app après une reprise/un déploiement. Ne pas en faire un réflexe systématique.
