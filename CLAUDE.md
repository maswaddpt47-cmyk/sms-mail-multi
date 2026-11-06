# Règles de travail — SMS-mail

## Publication sur main — consigne utilisateur du 20/10/2026

**« Main toujours » (01/11/2026)** : même quand la plateforme impose une branche de session, publier sur `main` (avance rapide : `git merge-base --is-ancestor origin/main HEAD`, puis `git push origin HEAD:main`) et garder la branche de session alignée. Ne pas redemander.

**Pousser systématiquement sur `main` après les vérifications, sans
redemander de feu vert.** L’utilisateur a demandé : « push systématiquement
sur main dorénavant !!! », puis « note le dans AGENTS ». Cette consigne,
inscrite dans `AGENTS.md`, remplace la restriction du 19/10 sur `sandbox/ui`.
Actualiser depuis GitHub, préserver les changements concurrents et vérifier
le déploiement Pages avant d’annoncer la mise en ligne. L’état du chantier
reste dans `CHANTIERS.md`.

## ⚠️ Point critique RGPD — exposition de données personnelles (remédiation en grande partie faite)

Constat vérifié le 20/08/2026 : le repo `maswaddpt47-cmyk/sms-mail-multi` était **public**, et
le dossier `backups/` (sous-dossiers par profil : michel, cynthia...) — contenant les exports
JSON complets de l'historique (nom, prénom, téléphone, démarche, date/heure de RDV, statut de
vrais usagers) — était commité en clair sur les branches `main` **et** `backups`. Ces données
personnelles étaient donc consultables par n'importe qui sur github.com, sans authentification.
Même constat fait en parallèle sur `SMS-mail` (repo miroir).

**Plan de remédiation validé par l'utilisateur (tous les points) :**
1. ✅ **Fait (02/09/2026)** — Repo **privé** dédié créé (`sms-mail-multi-backups`),
   `githubPush()` / `GH_REPO` redirigés vers celui-ci dans `index.html`. Les sauvegardes
   existantes (25 fichiers, sous-dossiers `michel/` et `cynthia/`) ont été migrées dans ce
   repo privé avant la purge du point 2, pour ne pas casser "Restaurer depuis GitHub". Le
   repo public actuel garde uniquement le code (nécessaire pour GitHub Pages gratuit),
   plus aucune donnée personnelle n'y est poussée.
2. ✅ **Fait (02/09/2026)** — Historique git purgé (`git filter-repo --path backups
   --invert-paths --force`) sur les branches `main` et `backups`, puis `push --force` sur
   les deux. Vérifié via clones frais indépendants (`--depth 1`) : `backups/` absent de
   l'arbre et de l'historique complet des deux branches. Ne garantit pas l'effacement de
   copies déjà potentiellement récupérées pendant que le repo était exposé (20/08 → 02/09).
3. ✅ **Fait (02/09/2026)** — Politique de rétention, approche validée : "année en cours +
   backup année pour les stats". Nouveau bouton "Gestion des données → RGPD — Rétention" :
   pour chaque année révolue encore présente dans l'historique du **profil actif**,
   archivage manuel (confirmation obligatoire) qui calcule des statistiques agrégées et
   **anonymisées** (aucun nom/téléphone — `entryYear`/`computeYearArchive`/`archiveYear`
   dans `index.html`) puis supprime définitivement le détail nominatif de cette année de
   l'historique du profil (irréversible). Archive cloisonnée par profil
   (`ess-<profil>-yearly-stats`, comme `history`/`permanences`), consultable via un
   sélecteur d'année dans l'onglet Stats, incluse dans `exportDataForProfile()`/
   `doImport()`. Testé en navigateur réel (Playwright) sur le profil "michel" : archivage,
   purge, agrégats, sélecteur d'année et **isolation entre profils** tous vérifiés
   fonctionnels (l'archivage sur un profil ne touche aucune clé localStorage d'un autre).
4. Point hors code, à charge de l'utilisateur : vérifier avec son employeur (Conseil
   Départemental) si ce traitement est couvert par un registre RGPD / DPO informé.
5. ✅ **Fait (02/09/2026)** — Avertissement discret ajouté sur les 3 champs de saisie libre
   concernés (Notes du formulaire Générer, Motif de l'excuse et Notes du popup Agenda) :
   "Selon le RGPD, évitez d'y saisir des informations de santé ou autres données sensibles."

**Pour toute session reprenant ce travail** : relire l'état réel avant d'agir (quel repo
privé existe déjà, quels points sont faits) — ne pas présumer que la migration a eu lieu.
Ne jamais committer `backups/` (ou tout fichier contenant des données d'usagers) vers un
repo public, même temporairement pour tester.

**Captures et fichiers envoyés à Claude** (charte IA du CD47 §4, 06/10/2026) : jamais de
capture montrant des contacts, numéros ou messages réels, ni de fichier de contacts réel ;
données fictives ou capture recadrée. Une capture avec des données réelles se signale en
une ligne : rappel d'habitude, pas alerte RGPD.

## Reprise de session — CHANTIERS.md

Lire **`CHANTIERS.md`** (racine) au démarrage : état du travail, décisions à
trancher, points à ne pas défaire. Le mettre à jour à chaque avancée
significative, pas en fin de session. Une tâche terminée en sort ; ce qui ne
doit pas être défait remonte dans sa dernière section.

**Modifications faites hors session** (consigne de l'utilisateur, 30/10/2026) : quand
il dit « pull » après avoir modifié le dépôt lui-même ou avec un autre outil,
`git fetch origin main` puis `git merge --ff-only origin/main` (jamais `git pull`, MD-LIB règle 63), lire `git log` et le diff de ce qui est arrivé depuis la dernière
base connue, puis mettre à jour `CHANTIERS.md` (en-tête compris) avant toute
autre tâche. Ne pas supposer qu'une entrée datée est encore vraie.
**Ne jamais demander l'autorisation de mettre `CHANTIERS.md` à jour** (consigne du
30/10/2026 : « mets à jour automatiquement, arrête de me le demander ») : le faire à
chaque livraison, en-tête et base de commit compris, et retirer ce qui est devenu faux.

## AGORA — faire contredire une décision par une autre session

Fichier : **`AGORA.md`** (racine) — gabarit et règles de réponse.

**Soumettre d'office** (sans demander) dès qu'un de ces faits est constaté :
1. La décision **ferme une porte** : format de stockage localStorage, format
   d'export/sauvegarde, nouvelle dépendance, contrat entre modules.
2. **Deux options envisagées, une seule écrite**, sans arbitrage extérieur.
3. **Trois itérations sans résolution** sur le même problème.
4. **Défaire un existant dont la raison d'être n'est pas retrouvée.**
5. La proposition **contredit une note datée** du dépôt (`CLAUDE.md`,
   `CHANTIERS.md`, commentaire de décision).
6. **Coût irréversible côté usager** : suppression de données, migration,
   rupture de la PWA déjà installée.
7. **Le changement touche un calcul ou un chiffre affiché** (indicateur, total,
   taux, moyenne, filtre, définition, bilan imprimé), **quelle que soit sa
   taille** (critère 7 d'`agora.md`, posé ici le 30/10/2026 à la demande de
   l'utilisateur : « si des calculs sont impliqués, fais un bloc AGORA »).
   Contradicteur : **Codex**. Le bloc est ouvert **avant** la correction ; les
   définitions métier y sont séparées des défauts démontrés et tranchées par
   l'utilisateur ; la réponse de Codex est inscrite telle quelle.

Toute entrée « décision à trancher » de `CHANTIERS.md` est candidate : dire en
l'écrivant pourquoi on ouvre un bloc ou non.

**Ne va PAS à l'AGORA** : changement de rendu pur (couleur, libellé, CSS) ;
correctif localisé appuyé sur une preuve ; tout ce qui se défait en un commit —
**sauf s'il touche un calcul ou un chiffre affiché** (critère 7, toujours).

**Fonctionnement** : écrire le bloc au moment du choix, pas après
l'implémentation ; le commiter et le **pousser directement sur `main`**
(`git fetch origin main` puis `git merge --ff-only origin/main` avant — exception au workflow de branche :
c'est du texte, ça ne casse aucun déploiement) ; annoncer en une ligne
« ⚖️ AGORA : critère N — … » avec la phrase à coller dans l'autre session, **qui nomme le dépôt** : « pull maswaddpt47-cmyk/sms-mail-multi, lis son `AGORA.md`, réponds à AG-00N, tu es la session B ».
**Bloc pour Codex : dire « pull » à Codex suffit** (son `AGENTS.md` le fait répondre, MD-LIB `agora.md` §12, 03/11/2026) ; la session qui ouvre le bloc l'annonce quand même à l'utilisateur dès qu'il est en ligne, **sur une ligne à part en tête du message, 🔴 et en gras** : `🔴 **⚖️ AGORA : critère N — <sujet>. Bloc AG-00N commité. → Dis « pull » à Codex.**` (MD-LIB `agora.md` §4, 04/11/2026 : un « pull » noyé dans un compte rendu n'a pas été vu).
**Ne jamais bloquer** : continuer le travail, aucune réponse n'est garantie.
L'utilisateur tranche.

**Sécurité, mots de passe, données personnelles : contradicteur Codex**
(OpenAI) au lieu d'une session Claude (06/10/2026, mode d'emploi : `AGORA.md`).
**Audit Codex** chaque trimestre et après tout changement structurant de
sécurité, avec le modèle MD-LIB `consigne-audit-externe.md` ; chaque point
vérifié dans le code avant d'être retenu, rapport hors dépôt public.

## Règles de collaboration avec Claude

Règles communes de collaboration : MD-LIB/collaboration.md, chargé automatiquement par MD-LIB/CLAUDE.md (04/11/2026). Ici, seulement ce qui est propre au projet.

## Workflow obligatoire avant toute intervention

### 1. Mise à jour depuis main
Toujours exécuter avant de toucher le moindre fichier — jamais `git pull`, qui peut fusionner une autre branche dans `main` (MD-LIB règle 63, 04/11/2026) :
```bash
git fetch origin main
git merge --ff-only origin/main
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

**Commit découvert après coup mélangeant deux changements** (27-28/09/2026,
porté depuis SMS-mail `055d8c0` : dropdown commune + contexte du taux
d'occupation dans un seul commit) : s'il n'est pas encore poussé, le
splitter avant de pousser ; s'il est déjà poussé, ne jamais corriger
silencieusement le message pour le faire paraître conforme — l'assumer en
une phrase dans le commit suivant ou dans `CHANTIERS.md`.

### 3. Push vers main
Après chaque commit, pousser dans le repo :
```bash
git push -u origin main
```

Avant d'écrire « en ligne », « déployé » ou « à recharger » : `MD-LIB/outils/attendre-deploiement.sh` doit avoir dit ✅ pour le commit poussé (règle MD-LIB `deploiement.md`, 13/10/2026 ; à la main si le hook n'a rien dit : `bash /home/user/MD-LIB/outils/attendre-deploiement.sh .`).

## Résumé du flux

```
git fetch origin main + git merge --ff-only origin/main
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
- **Harnais Node pour un changement de logique pure** (`getSlots`, `hasConflict`, migrations) : extraire la fonction depuis `index.html`, l'`eval` avec des globals stubbés (`S`, `lsSet`…), rejouer quelques scénarios dont une non-régression de l'ancien comportement. Moins coûteux qu'un Playwright ciblé, plus fiable qu'une vérification de syntaxe seule — porté depuis SMS-mail (AG-001 `8517269`, 7 scénarios ; priorité titulaire actif/libéré `1b910af`).
- **Test Playwright ciblé uniquement** : si l'utilisateur le demande explicitement pour ce changement, ou en début de session pour valider l'état général de l'app après une reprise/un déploiement. Ne pas en faire un réflexe systématique.
- **Retrait d'une variable ou d'une fonction** (règle 1, 01/11/2026) : un harnais Node ne charge pas toute l'application. Après un tel changement, ouvrir l'appli dans Chromium (aperçu démo, onglets Agenda, Historique, Statistiques, Générer) et vérifier qu'aucune erreur JS n'apparaît. Constat : l'Agenda plantait alors que les tests Node passaient (AG-016 A).
- **Chiffres animés** (règle 2, 01/11/2026) : un compteur se lit après la fin de son animation (déclencher `beforeprint` ou attendre), sinon on lit 0 ou une valeur intermédiaire. Constat répété : AG-014 et AG-015.
- **Tous les tests du déploiement avant de pousser** (règle 3, 01/11/2026) : lancer chaque `scripts/check-*.js` listé dans `.github/workflows/deploy.yml`, en UTC et Europe/Paris, pas seulement ceux du calcul touché. Constat : `bb92cbc` a échoué au déploiement, `check-activite.js` attendait l'ancien appel de la carte (corrigé `6dfb857`).

## Portage entre SMS-mail et sms-mail-multi — arrêté le 20/10/2026

**SMS-mail (solo) est gelé** : décision de l'utilisateur, plus de
développement là-bas. `sms-mail-multi` est désormais le seul repo actif.
Ne plus porter de correctif vers SMS-mail, ne plus lancer
`scripts/check-drift.js` (comparaison devenue sans objet — la refonte UI du
19/10/2026 n'existe que sur multi) ; le script reste dans `scripts/` comme
trace, pas comme outil à utiliser.
