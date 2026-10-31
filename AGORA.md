# AGORA — sms-mail-multi

Débats soumis à une **autre session Claude** pour contradiction. Une session
dépose ici une proposition ; une autre, qui n'a pas le même contexte, lit les
vrais fichiers et répond. Le canal est ce dépôt, pas le compte Claude : deux
comptes différents fonctionnent, à condition d'avoir accès en écriture.

Quand soumettre et quand s'en abstenir : section « AGORA » du `CLAUDE.md`.
Règle complète (non requise pour répondre) : `MD-LIB/agora.md`.

## Pour répondre à un bloc

- **Jamais un bloc que l'on a soi-même ouvert.** S'auto-répondre produit un
  tampon de validation, pas une contradiction. **Avant de répondre, comparer
  le trailer `Claude-Session:` du commit qui a déposé le bloc
  (`git log -1 --format=%B <sha du bloc>`) à celui de la session courante** :
  il distingue deux sessions même sous une identité GitHub unique. Le champ
  `Auteur` n'est qu'un libellé de lecture — pas une preuve. Trailer absent
  (commit fait à la main) : demander à l'utilisateur.
- **Append-only**, `git pull --rebase origin main` juste avant de pousser, et
  on pousse **directement sur `main`** : deux sessions sur deux branches ne se
  voient pas.
- **Aucune donnée d'usager** dans un bloc : pas de ligne d'export, pas de log
  brut, pas de nom ni de téléphone (cf. point RGPD du `CLAUDE.md`).

Les trois verdicts et la règle de preuve sont dans le gabarit ci-dessous.

**Le cycle** : une session dépose un bloc et le pousse sur `main`, donne à
l'utilisateur la phrase à coller ailleurs (« pull maswaddpt47-cmyk/sms-mail-multi,
lis son AGORA.md, réponds à AG-00N, tu es la session B »), l'autre session répond, l'utilisateur tranche.
**Aucune notification ne passe d'un compte à l'autre** : le relais par
l'utilisateur est obligatoire, et c'est pour ça que l'AGORA ne bloque jamais.

## Sincérité — trois contraintes contre la politesse

Sur ATELIERS_NEWGEN, 12 blocs tranchés d'affilée ont reçu « amendé », aucun
« confirmé » ni « contredit » (27/09/2026). Un contradicteur qui n'emploie
jamais les deux autres verdicts a cessé de contredire : il rend un service de
politesse qui donne une fausse garantie.

1. **« Amendé » n'est valable que s'il nomme ce qui serait faux, manquant ou
   coûteux si la proposition était appliquée telle quelle.** Un amendement qui
   ne change ni le code, ni une décision, ni un chiffre n'est pas un
   amendement : le verdict est **« confirmé »**.
2. **« Confirmé » est une réponse pleine et utile**, pas un aveu d'inutilité :
   elle libère l'auteur pour agir. Ne jamais chercher un amendement pour
   justifier sa présence.
3. **Aucune appréciation de la proposition ni de son auteur** — ni compliment,
   ni « bien vu ». Une réponse commence par un constat : le compliment est le
   véhicule de la complaisance.

Porter le **verdict** de chaque bloc tranché et le total des trois issues sous
« Blocs tranchés » : le biais se voit au lieu d'être deviné. **Le total est une
alerte, pas un objectif** : ne jamais rendre « confirmé » pour casser une
série — le verdict découle de la contrainte 1 appliquée au bloc. Une série se
juge en relisant ce que chaque « amendé » a changé (code, décision, chiffre) ;
celui qui n'a rien changé était un « confirmé ».

## Contradicteur Codex — blocs de sécurité (06/10/2026)

Un bloc qui touche à la sécurité, aux mots de passe ou aux données personnelles
va à **Codex (OpenAI)**, pas à une session Claude : entre deux Claude, 0
« contredit » sur 23 blocs (ATELIERS_NEWGEN), quand Codex a trouvé en une passe
ce que Claude avait manqué. L'utilisateur colle le bloc dans Codex
(autorisations « Lecture seule », réflexion au plus haut) avec : « Réponds selon
le gabarit de AGORA.md, avec fichier:ligne ; ne modifie rien. » La session qui a
ouvert le bloc inscrit la réponse **telle quelle** sous
`### Réponse — Codex — JJ/MM/AAAA`, sans la reformuler ni la juger ;
l'utilisateur tranche. Codex ne modifie jamais le code. Règle complète : MD-LIB
`agora.md` §12.

## Gabarit

```markdown
## AG-00N — Titre court — ouvert le JJ/MM/AAAA
**Auteur** : session <8 car. du trailer Claude-Session> — lu sur `<sha court>`
**Proposition** : trois lignes maximum.
**Critère déclencheur** : n° et lequel (`CLAUDE.md`, section AGORA).
**Ce que ça engage** : ce qui serait coûteux à défaire.
**Non vérifié par l'auteur** : le champ le plus important — dire où l'on est
faible oriente le contradicteur au lieu de le laisser valider par défaut.
**Si personne ne répond, je fais quoi ?** — si c'est « je continue pareil », le
bloc n'avait pas lieu d'être.
**Où regarder** : index.html:120-180

### Réponse — JJ/MM/AAAA
**Auteur** : session <autre id> — lu sur `<sha court>` (`git log --oneline -1`)
**Verdict** : confirmé | amendé | contredit
**Constat** : avec fichier:ligne, mesure ou log — sans ça, la réponse ne compte pas.
**Amendement** : ...

### Tranché le JJ/MM/AAAA — décision : ...
```

Un bloc tranché sort du fichier : sa conclusion remonte dans `CHANTIERS.md`
(points à ne pas défaire) ou dans `CLAUDE.md` si elle devient une règle ; le
récit reste dans `git log`.

---

# Blocs ouverts

Aucun.

# Vérification des étapes d'AG-013

Réponses de Codex aux livraisons du plan tranché (AG-013), inscrites telles quelles. Une vérification close sort d'ici ; sa conclusion remonte dans `CHANTIERS.md`.

### Vérification de l'étape 0 — Codex — 31/10/2026
**Auteur** : Codex — commits `4799761` et `fc0b8d2` vérifiés. `main` a ensuite avancé à `09c51d3`, qui ne modifie que la documentation ; le code de l’étape 0 reste identique.
**Verdict** : amendé, uniquement sur la couverture des valeurs finales des compteurs.
**Constat** :

1. Les couples chiffre/libellé sont réellement testés dans les deux vues.
   Les données distinguent total, réalisés et personnes. Les assertions contrôlent les tuiles de Statistiques (`scripts/check-affichage.js:36–55`), puis les tuiles, le total et les relances du bilan (57–68).

   Mutations reproduites en mémoire dans les deux fuseaux :

   | Mutation | UTC | Europe/Paris |
   |---|---|---|
   | Statistiques : réalisés remplacés par le total | Rejetée : 7 ≠ 3 | Rejetée |
   | Bilan : réalisés remplacés par le total | Rejetée : 6 ≠ 3 | Rejetée |

2. La valeur finale des compteurs animés n’est pas réellement contrôlée.
   Le script extrait `nombresEnTexte`, mais s’arrête avant `compterNombre` (`scripts/check-affichage.js:19`). Les assertions 70–74 vérifient le formateur avec un facteur égal à 1 ; elles n’exécutent pas l’animation ni la restauration avant impression.

   Ces mutations passent encore dans les deux fuseaux :

   - Fin de `compterNombre` remplacée par `'999'` — `index.html:3533`.
   - Appel de l’animation remplacé par `compterNombre(n,'999')` — `index.html:3554`.
   - Valeur restaurée avant impression remplacée par `'999'` — `index.html:3541`.

   Cela démontre une lacune du test, pas un défaut actuel du compteur de production.

3. Les suites passent en UTC et Europe/Paris.
   Vérification exécutée pour statistiques, réactivité et affichage. Le workflow lance les trois scripts dans chaque fuseau (`.github/workflows/deploy.yml:40–54`), après le contrôle de syntaxe (30–38).

   Le run `41233435678`, sur le SHA exact `fc0b8d2`, confirme également leur réussite dans GitHub Actions.

4. Le blocage de Pages sur échec est confirmé, y compris par un essai réel.
   Le job de déploiement dépend de `tests` (`.github/workflows/deploy.yml:56–57`), sans contournement par `continue-on-error` ou `always()`.

   Le run `41233467863`, sur une branche de session, contient une assertion volontairement fausse : 4 attendu au lieu de 3, dans `scripts/check-affichage.js:44`. Le job de tests échoue avec le code 1 et le job de déploiement est sauté. Cette mutation n’est pas présente sur `main`.

5. Le périmètre de l’étape 0 est respecté.
   `4799761` ajoute uniquement `scripts/check-affichage.js`. `fc0b8d2` modifie uniquement le workflow. Aucun changement d’`index.html`, de calcul, de donnée ou de migration dans ces commits.

**Amendement** :

Compléter le harnais Node pour exécuter les vraies fonctions `compterNombre` et le chemin de restauration `beforeprint`, avec une horloge et `requestAnimationFrame` contrôlés. Vérifier le raccordement à `dataset.final`, la valeur obtenue en fin d’animation et celle restaurée avant impression.

Les trois mutations de compteur ci-dessus devront alors être rejetées en UTC et Europe/Paris. Aucun navigateur ni changement des calculs n’est nécessaire pour compléter ce contrôle.

Périmètre de vérification : données fictives et mutations en mémoire uniquement ; aucune donnée réelle consultée. Aucun fichier modifié, aucun workflow déclenché pendant cette revue.


### Nouvelle vérification de l'étape 0 — Codex — 31/10/2026
**Auteur** : Codex — lu sur `c86237d`, correctif `75c0607` vérifié.
**Verdict** : confirmé.
**Constat** :

1. Les vraies fonctions d’animation sont désormais exécutées.
   Le harnais extrait `compterNombre` et `animerGraphesStats` depuis `index.html`, puis les exécute avec une horloge et des `requestAnimationFrame` contrôlés (`scripts/check-affichage.js:78–100`). Il vérifie `dataset.final`, le départ à zéro, la fin d’animation et l’absence de rappel restant (103–108).

2. Le véritable chemin `beforeprint` est parcouru.
   Une nouvelle animation est interrompue par le gestionnaire enregistré ; chaque texte restauré est comparé à sa valeur attendue (`scripts/check-affichage.js:111–115`).

3. Les trois mutations précédentes sont rejetées dans les deux fuseaux.
   Vérification reproduite exclusivement en mémoire :

   | Mutation | UTC | Europe/Paris |
   |---|---|---|
   | Fin d’animation remplacée par 999 | Rejetée, ligne 107 | Rejetée |
   | Appel du compteur avec 999 | Rejetée, ligne 107 | Rejetée |
   | Restauration avant impression remplacée par 999 | Rejetée, ligne 114 | Rejetée |

   Le code intact passe dans les deux fuseaux. Les contrôles des couples chiffre/libellé dans Statistiques et le bilan restent présents (`scripts/check-affichage.js:36–68`).

4. `index.html` est strictement inchangé.
   Même blob entre `fc0b8d2` et `c86237d` : `695f0121c9bdeceacb65744348c9b7c07ee8e611`. `75c0607` ajoute uniquement 41 lignes au script de test : aucun calcul, donnée ou migration modifié.

5. L’effet net de `a517ef2` et `60dee72` est nul.
   Le premier remplace l’attente 3 par 4 à `scripts/check-affichage.js:44` ; le second l’annule exactement. Les arbres Git avant et après sont identiques (`de685819…`) et la comparaison ne contient aucun fichier différent. Les commits restent dans l’historique.

   La CI actuelle, run `41235534466`, confirme aussi le succès des trois suites dans les deux fuseaux, puis du déploiement.

**Amendement** : aucun. L’amendement de la vérification précédente de l’étape 0 est traité.

Aucun fichier modifié ni workflow déclenché pendant cette revue.


### Vérification de l'étape 1 — Codex — 31/10/2026
**Auteur** : Codex — commits demandés vérifiés, ainsi que le correctif de sauvegarde vide `b52f362`.
**Verdict** : amendé.
**Constat** :

- Recomptage indépendant confirmé : l’audit ne réutilise pas les fonctions de calcul de l’application. Les tests fictifs passent en UTC et Europe/Paris, avec égalité sur les indicateurs comparés.
- `index.html` inchangé, blob `695f0121…`.
- Aucun envoi du contenu de sauvegarde ni écriture dans les données de l’application identifié. Le navigateur charge le code d’`index.html` ; copie et téléchargement du rapport nécessitent une action utilisateur.

Quatre points restent à corriger :

1. Le rapport n’est pas garanti anonyme.
   Les champs mal renseignés sont recopiés dans les anomalies puis dans le rapport (`scripts/audit-sauvegarde.js:45, 58, 150`). Un téléphone fictif placé dans un statut ressort intégralement.

2. Une fausse réattribution peut être annoncée.
   Le test `LIBERES[statut]` accepte des propriétés héritées (`scripts/audit-sauvegarde.js:93`). Avec `toString` et `confirme` pour deux personnes sur le même créneau, l’audit annonce une réattribution normale au lieu de deux rendez-vous actifs.

3. Certaines définitions ne décrivent pas fidèlement le code.
   Notamment : CMS vides annoncés regroupés mais exclus (`docs/indicateurs.md:51`, `index.html:3193`) ; préparation utilisant une population distincte (`index.html:3873`) ; heatmap ne suivant pas le filtre de période (4024). Les populations différentes des archives doivent aussi être explicitées.

4. La comparaison peut donner une assurance excessive.
   Un résultat absent est ignoré et une valeur manquante peut devenir zéro (`scripts/audit-sauvegarde.js:130–133`). Les démarches ne sont pas comparées : modifier fictivement leur nombre à 999 laisse zéro écart.

**Amendement** : sécuriser les sorties partageables, corriger la reconnaissance des statuts libérés, rectifier les définitions et rendre explicites les comparaisons manquantes ou non couvertes. Ajouter les contre-exemples ci-dessus aux tests.

Ne pas transmettre le rapport comme garanti anonymisé avant correction. Aucun fichier modifié, aucune donnée réelle consultée.


### Nouvelle vérification de l'étape 1 — Codex — 31/10/2026
**Auteur** : Codex — commits `d6cc769` et `72c85cc` vérifiés. Dernier `main` lu : `30b2adc` ; les derniers changements concernent uniquement la documentation.
**Verdict** : amendé. Les corrections sont effectives, mais deux lacunes subsistent.
**Constat** :

1. Les contre-exemples initiaux sont désormais détectés.
   Rejoués en UTC et Europe/Paris : téléphone fictif dans un statut, statut `toString`, bilan absent ou compteur manquant, démarche modifiée à 999. La suite passe ; cinq mutations réintroduisant ces défauts sont rejetées (`scripts/check-audit.js:82, 103, 108`).

2. Les sorties restent imparfaitement anonymisées.
   Le catalogue CMS provient du fichier importé et ses noms sont encore recopiés directement (`scripts/audit-sauvegarde.js:42, 49, 79`).

   Contre-exemples supplémentaires reproduits dans les deux fuseaux :

   - Un téléphone fictif dans `cmsList[0].nom`, utilisé comme commune, ressort dans les anomalies.
   - Le même nom référencé par `selectedCMS` ressort dans la précision « selectedCMS : … ».

   Dans les deux cas, la valeur apparaît à l’écran, dans le presse-papiers et dans le téléchargement (`audit.html:111, 120, 121` ; `scripts/audit-sauvegarde.js:177`). Les tests actuels conservent un catalogue propre et manquent ces chemins (`scripts/check-audit.js:84`).

3. Un compteur de statut absent peut encore devenir zéro.
   Supprimer `byStatut.annule` du résultat de l’application produit encore « affiché 0 / recompté 0 / ok » (`scripts/audit-sauvegarde.js:153`). Pourtant, l’application fournit explicitement les sept compteurs (`index.html:3079`). Cette absence doit être « non comparé ».

4. Les rectifications documentaires demandées sont conformes.
   CMS vides exclus (`docs/indicateurs.md:51` ; `index.html:3193`), population propre de préparation (`docs/indicateurs.md:52` ; `index.html:2856`), heatmap indépendante du filtre de période (`docs/indicateurs.md:36` ; `index.html:4024`), populations des archives explicitées (`docs/indicateurs.md:73` ; `index.html:2881`).

5. `index.html` est strictement inchangé.
   Blob identique : `695f0121c9bdeceacb65744348c9b7c07ee8e611`. Aucun changement de calcul de l’application, de donnée ou de migration dans les commits examinés.

**Amendement** :

- Désigner également les CMS du catalogue par des identifiants neutres dans les sorties partageables, y compris les précisions liées à `selectedCMS`.
- Classer tout compteur de statut absent comme « non comparé ».
- Ajouter ces contre-exemples aux tests.

Vérifications exécutées en mémoire sous Node, avec simulation du chargement du fichier et des actions de copie/téléchargement ; pas de navigateur réel. Aucune donnée réelle consultée, aucun fichier modifié.


# Blocs tranchés

- **AG-013** — Plan de fiabilisation des statistiques — ouvert le 31/10, **tranché le 31/10/2026** — verdict **amendé** (Codex, critères 7, 1 et 6) : écritures cohérentes jusqu'au stockage avec retour à l'état antérieur (archivage purgé malgré un échec, import partiel, restauration GitHub annoncée réussie sans contrôle), CMS normalisé dans la dédup provisoire du planning, tests de valeur affichée dans Statistiques **et** bilan (tuile du bilan non couverte), équivalence des dates ISO/françaises autour de minuit Paris et après réimport, table des statuts dépendante du jour et du titulaire actif. Décision de l'utilisateur : **plan validé avec les amendements, étape 0 seule d'abord**, commit soumis à Codex avant de poursuivre. Plan et suivi dans `CHANTIERS.md` (« Fiabilisation des statistiques »).
- **AG-012** — Suivi des relances dans le bilan et priorité à l’accompagnement — ouvert et **tranché le 31/10/2026** — verdict **confirmé** (Claude 0199YP2J, réponse intégrale dans `07046f0`) : même population mois du RDV/CMS que les autres chiffres, une seule fois par RDV avec date ou type de relance ; tests UTC/Europe/Paris et trois mutations rejetées par le contradicteur. **Aucun correctif demandé.** Maintien du périmètre déjà décidé par l’utilisateur (« Fait le »), puis du fonctionnement validé (« C’est bon ça fonctionne »). Limites conservées : anciennes dates automatiques sans provenance, absence de confirmation technique d’envoi ; rendu stylé et impression réelle non mesurés par le contradicteur (ses mesures portaient sur la structure sans CSS). Hypothèse hors bloc sur `addHistory`/`cmsKey` : aucun cas constaté, aucun changement de code. Conclusion dans `CHANTIERS.md` (« Suivi des relances »).
- **AG-011** — Bilan mensuel simplifié : une seule base, les rendez-vous enregistrés — ouvert le 30/10, **tranché le 30/10/2026** — verdict **confirmé** (Codex, critère 7) :
  éléments demandés présents, taux par créneau, remplissages et phrase de lecture retirés, pourcentages des statuts sur le seul total des rendez-vous, 29 sélections mois/CMS
  recomptées sans écart, données et archives inchangées, aucun correctif trouvé. Décision de l'utilisateur : une seule façon de compter dans le bilan ; les taux par créneau
  restent dans Statistiques. Conclusion dans `CHANTIERS.md` (« Bilan mensuel simplifié »).
- **AG-010** — Répartition par statut sur la base des rendez-vous — ouvert le 30/10, **tranché le 30/10/2026 par l'utilisateur, sans contradicteur** (aucune réponse
  inscrite) : option B (part de chaque statut sur les rendez-vous, issue exclusive par créneau retirée), puis **absorbée par AG-011** (bilan à base unique). Hors total ci-dessous.
- **AG-009** — Bilan mensuel : phrase de lecture 65 → 53 → 54, infobulles — ouvert le 30/10, **tranché le 30/10/2026** — verdict **amendé** (Codex, critère 7) : soustractions
  justes (29 sélections sans écart) mais libellés « ont repris un créneau déjà libéré » et « places jamais attribuées » non démontrés (contre-exemples exécutés), et assertions de
  test absorbées par un commentaire ; **corrigé** (libellés neutres, assertions rétablies). La phrase de lecture et ses indicateurs sont **retirés par AG-011** (décision de l'utilisateur,
  base unique) ; les infobulles ⓘ subsistent sur les chiffres restants.
- **AG-008** — Issue exclusive des créneaux, somme des statuts à 100 % — ouvert le 30/10, **tranché le 30/10/2026** — verdict **amendé** (Codex, critère 7) : classement
  exclusif confirmé sur 29 sélections mois/CMS sans écart, mais promesse « total = 100 % » inexacte pour les pourcentages arrondis (33 + 33 + 33 = 99 %, 2 cas réels) ;
  **corrigé dans l'affichage** (titre et notes : « les pourcentages arrondis peuvent ne pas totaliser exactement 100 % », arrondis non redistribués). Décision de
  l'utilisateur : **ordre de priorité conservé** (Réalisé > Confirmé > En attente > Lapin > Pas de retour > Excusé > Annulé). Remplace les taux par statut cumulés d'AG-007.
  Conclusion dans `CHANTIERS.md` (« Issue des créneaux »).
- **AG-007** — Taux par statut (tous les statuts), Statistiques et Bilan mensuel — ouvert le 30/10, **tranché le 30/10/2026** — verdict **confirmé**
  (Codex, critère 7) : recomptage indépendant sur 29 sélections mois/CMS sans écart, aucun correctif trouvé (Réalisé et Lapin égalent les taux existants,
  fiches sans heure, blocages et RDV futurs exclus). Décision de l'utilisateur : l'unité est le **créneau** (plutôt que la fiche) ; un créneau peut porter
  plusieurs statuts, la somme dépasse donc 100 % et c'est annoncé. Conclusion dans `CHANTIERS.md` (« Taux par statut »).
- **AG-006** — Calculs Statistiques/Bilan : corrections de l'audit Codex du 30/10 et remplissage net — ouvert le 30/10, **tranché le 30/10/2026** —
  verdict **amendé** (Codex, critère 7) : points 1 à 5 et 7 de l'audit confirmés, remplissage net conforme à la définition tranchée par l'utilisateur
  (base fixe 6/3), recomptage indépendant sur 29 sélections sans écart ; **deux corrections incomplètes relevées et corrigées dans le code** (regroupement
  CMS des messages et des nouvelles archives par `cmsKey` ; dictionnaire des démarches des archives sans prototype, et types de message en clés propres,
  même défaut). Les anciennes archives ne sont pas recalculées ; le point 6 de l'audit (capacité réelle de la grille) est écarté par la décision de la
  base fixe. Conclusion dans `CHANTIERS.md` (« Taux de remplissage », « Audit Codex du 30/10 »).
- **AG-001** — Statut Annulé et motif facultatif — ouvert le 22/10, **tranché le 30/10/2026 par l'utilisateur, sans
  contradicteur** (aucune réponse inscrite ; rien d'autre n'a été vérifié ici) : `annule` + `annulationMotif` livrés, additifs, sans
  migration ; créneau libéré, ni rappel ni relance, ICS CANCELLED avec le même UID ; taux : Annulé au dénominateur comme Excusé ;
  aucune archive recalculée. Conclusion dans `CHANTIERS.md` (« Statut Annulé »). Hors total ci-dessous (aucun verdict).
- **AG-002** — Réception et première préparation, délai lundi–vendredi — ouvert le 22/10, **tranché le 30/10/2026 par
  l'utilisateur, sans contradicteur** : contrat additif `dateReception` / `premierePreparationAt` / `preparationMetrics` livré
  (go du 22/10, précision utilisateur : `dateDemande` repris seulement si `dateReception` est absente, jamais déduit de `ts`).
  Conclusion dans `CHANTIERS.md` (« Préparation moyenne »). Hors total ci-dessous (aucun verdict).
- **AG-005** — Stats : « Relance » comptée d'après `dateRelance` — ouvert le 26/10, **tranché le 26/10/2026** — verdict **amendé**
  (Codex, 7 défauts vérifiés dans le code ; mes chiffres du bloc, 27 et 190, étaient faux : 28 et 191). Décision de l'utilisateur
  (« tout ») : la ligne devient « Fiches avec relance renseignée » (28/164), **hors** du volume de messages ; plus de `dateRelance`
  posée d'office au passage à « Pas de retour » (fausse alerte « Libérer ? » après retour à « En attente ») ; définition de la période
  écrite sous la carte (elle choisit les fiches, pas la date de relance) ; l'archive annuelle garde `relances`/`relancesSur`
  (additif). Non traité : les 11 fiches déjà passées à « Pas de retour » gardent leur date (indiscernable des vraies relances).
- **AG-003** — Début de l'après-midi réglable par CMS (Fumel 14h) — ouvert le 25/10, **clos le 26/10/2026 par
  l'utilisateur, sans contradicteur** : décision à lui (demande du 14:00 pour Fumel, 16:30 retiré pour tous), livrée dans
  Configuration CMS (champ `debutApresMidi`, facultatif ; le vider rétablit la grille par défaut). Bloc ouvert à tort :
  la décision était déjà tranchée, il n'y avait rien à contredire. Hors total ci-dessous (aucun verdict).
- **AG-004** — Bilan mensuel, audit Codex des chiffres avant diffusion — ouvert le 25/10, **tranché le 26/10/2026** —
  verdict **amendé** (Codex) : écart 0 sur 20 sélections, mais 6 défauts de données incomplètes (CMS, heure, statut,
  démarche, fuseau, variantes de CMS) **corrigés dans le code** (donc un amendement qui a changé le code) et une
  promesse de confidentialité trop forte reformulée. Décision de l'utilisateur : démarches saisies librement
  **laissées telles quelles, avec la mention « à relire avant toute diffusion »** (mention retirée le 30/10/2026 sur
  demande de l'utilisateur, après relecture de sa part). Conclusion dans `CHANTIERS.md`.

**Total au 31/10/2026 : 6 amendés, 3 confirmés, 0 contredit** (AG-001, AG-002, AG-003 et AG-010 sans verdict, hors total).
