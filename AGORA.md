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

**Phrase de relais pour Codex** (décision de l'utilisateur du 29/10/2026 pour GDINV2, reprise ici le 31/10/2026 :
recopier ses réponses à la main ne se justifie plus). Elle remplace « ne modifie rien » :

> pull **maswaddpt47-cmyk/sms-mail-multi**, lis son `AGORA.md` et [réponds à AG-00N | vérifie l'étape N d'AG-013 : commits …].
> Autorisation exceptionnelle de l'utilisateur : tu peux modifier **un seul fichier, `AGORA.md`**, en y **ajoutant**
> ta réponse (`### Réponse — Codex — JJ/MM/AAAA` sous le bloc, ou `### Vérification de l'étape N — Codex — JJ/MM/AAAA`
> dans « Vérification des étapes d'AG-013 »), selon le gabarit du fichier, avec fichier:ligne. N'édite aucun autre bloc
> ni aucun autre fichier. Commite et pousse directement sur `main`.

**Variante clôture d'une étape** (décision de l'utilisateur du 31/10/2026, après 9 « amendé » de suite sur l'étape 2 : chaque tour
explorait le voisinage du dernier correctif). Remplacer « vérifie l'étape N d'AG-013 : commits … » par :

> fais la vérification de clôture de l'étape N d'AG-013 (commits …) : inventorie en une seule passe **tous** les cas restants sur
> l'ensemble du périmètre de l'étape, pas seulement les commits cités, et classe chacun « probable en usage réel » ou « théorique »
> (panne ponctuelle du stockage, donnée déjà corrompue…), avec fichier:ligne et scénario reproduit.

S'il ne reste que des cas « théoriques », l'utilisateur peut clore l'étape et les inscrire comme risque accepté dans `CHANTIERS.md`.

Codex doit alors pouvoir écrire (lever « Lecture seule » pour cette passe). L'utilisateur écrit ensuite « pull » à la
session Claude, qui contrôle `git show --stat <sha>` : seul `AGORA.md` est touché, et `git diff` n'ajoute que des lignes
(aucun bloc existant modifié). Sinon, annuler le commit et inscrire la réponse à la main. Le code reste interdit à Codex.

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

## AG-017 — Étape 6 d'AG-013 : archives annuelles recomptables — ouvert le 01/11/2026
**Auteur** : session 0199YP2J — lu sur `5ec6123`
**Proposition** : **nouvelles archives seulement** (les anciennes restent lues et affichées telles quelles, sans reconstruction). (A) Chaque archive porte sa **méthode** (`methode:'ag017-v1'`) et sa **date d'arrêt** ; l'écran dit laquelle s'applique. (B) **Chaque indicateur suit sa propre date** (décision 6 du 31/10) : rendez-vous au mois du RDV, fiches préparées au mois de première préparation (non-mesurables comptés à part), mêmes fonctions que Statistiques et le bilan (`personnesDistinctes`, `compterCanaux`, `slotRates`…). (C) Les taux gardent **numérateur, dénominateur et exclus** (RDV sans heure, sans CMS, « Statut à vérifier »). (D) **Export de contrôle anonymisé** de l'archive (JSON sans nom ni téléphone, méthode comprise). Aucun code écrit avant la réponse de Codex et les choix de l'utilisateur.
**Critère déclencheur** : 7 (chiffres archivés et affichés) ; 1 (format de `yearly-stats`, exporté et sauvegardé) ; 6 (l'archivage purge le détail nominatif : irréversible). Contradicteur : **Codex**.
**Ce que ça engage** : une archive est calculée **une fois** puis le détail est supprimé : une erreur de méthode n'est **jamais** rattrapable. Le format `yearly-stats` part dans les sauvegardes et imports ; deux méthodes coexisteront à l'écran.
**Défauts constatés** (mesurés sur le vrai `computeYearArchive(2026)`, six fiches fictives, `TZ=Europe/Paris`) :
- **E1 — mois de génération** : un RDV du 08/01/2026 préparé le 15/12/2025 met **`2025-12`** dans `byMonth` de l'archive **2026** (`index.html:3194-3202`) ; contraire à la décision 6.
- **E2 — « Usagers » ≠ « Personnes accompagnées »** : `usagersN` = **6** (toutes les fiches), alors que Statistiques et le bilan compteraient **3** personnes (RDV réalisés) (`index.html:3178`, affiché « Usagers » `3274`).
- **E3 — taux sans leurs termes** : `concretPct` = **40** (2/5) ; le RDV réalisé **sans heure** est exclu sans être compté, numérateur et dénominateur non conservés (`3184-3187`) ; contraire à la décision 3 (exclus affichés).
- **E4 — délai retiré toujours archivé** : `avgRdv` = **8** calculé et affiché (`3189-3193`, `3251+`) alors que l'indicateur est retiré des écrans (décision 5, AG-015).
- **E5 — sans CMS invisible** : `byCMS` = {Fumel: 5} pour 6 fiches, la fiche sans CMS n'apparaît nulle part (`comptageParCms`).
- **E6 — aucune méthode ni version** sur l'archive (seule `preparationMetrics.basis`) : impossible de savoir comment une archive a été calculée.
- **E7 — non pointés figés** : une année révolue archivée avec des RDV « En attente » / « Statut à vérifier » (ici 1 + 1) les fige ainsi, sans alerte.
- **Lu, non mesuré** : `trendByMonth` et `heatmap` sont stockés mais **jamais affichés** ; `heatmap` compte des fiches, l'écran des créneaux.
**Définitions métier à trancher par l'utilisateur** :
- **Q1 — Personnes** : archiver « Personnes accompagnées » (RDV réalisés, comme Statistiques et le bilan) **à la place** de « Usagers », ou **les deux** ?
- **Q2 — Délai RDV** : ne plus le calculer dans les nouvelles archives (cohérent avec la décision 5), les anciennes gardant leur valeur affichée avec la mention « ancienne méthode » ?
- **Q3 — Non pointés** : avant d'archiver, **avertir** en listant le nombre de RDV « En attente », « à pointer » et « Statut à vérifier » de l'année (archivage toujours possible), ou **bloquer** tant qu'il en reste ?
- **Q4 — Données jamais affichées** (`trendByMonth`, `heatmap`) : les retirer des nouvelles archives (minimisation) ou les garder ?
**Non vérifié par l'auteur** : la page d'archive pour une archive **mixte** (lecture des deux méthodes) n'est pas maquettée ; l'effet d'une archive importée d'un autre profil ou appareil (méthode différente) ; le risque signalé par Codex dans AG-016 (une page antérieure à (B) qui archive) reste hors de portée du nouveau code ; aucune archive réelle n'existe encore (audit du 31/10 : « aucune archive »), donc aucune donnée réelle à préserver aujourd'hui, mais 2026 sera la première.
**Si personne ne répond, je fais quoi ?** : rien sur le calcul (critère 6 : irréversible) ; je peux préparer seulement le test qui recompte une archive à partir de fiches fictives (sans toucher `index.html`).
**Où regarder** : `index.html:3159` (`entryYear`), `3172-3225` (`computeYearArchive`), `3227-3248` (`archiveYear`), `3251+` (`renderArchivedYearStats`), `3970-3984` (sélecteur d'année) ; `docs/indicateurs.md:74-90` et décision 6 (`:105`).
**Phrase pour Codex** : « pull maswaddpt47-cmyk/sms-mail-multi, lis son `AGORA.md`, réponds à AG-017 ; ajoute seulement ta réponse dans `AGORA.md` »

---

# Vérification des étapes d'AG-013

Réponses de Codex aux livraisons du plan tranché (AG-013), inscrites telles quelles. Une vérification close sort d'ici ; sa conclusion remonte dans `CHANTIERS.md`.

Aucune en cours. Étapes 0 et 1 closes le 31/10/2026, **étape 2 close le 01/11/2026**, confirmées par Codex après amendements traités ; textes intégraux : `git log -p AGORA.md` (étapes 0 et 1 : `8f3926f`, `ecdaf0f`, `55baf98`, `01f36ea`, `13b1dd9` ; étape 2 : `43f4d3b`, `2b8099c`, `26e1cc1`, `976bf88`, `b30f337`, `5878d4a`, `e909f1d`, `a41c438`, `0da3fe2`, `ddf283c`, vérification de clôture `cc0149a`, corrections `7558a5f`, vérification finale ciblée `bc1289e` ; R1/R2 : `ff23d33`…`326f838`). **Étape 4 close le 01/11/2026** (AG-014, `326f838`) ; **étape 5 close le 01/11/2026** (AG-015, `546e421`). Conclusions : `CHANTIERS.md`.

# Blocs tranchés

- **AG-016** — Étape 3 d'AG-013 : date du jour à Paris, lecteur unique de `ts`, `ts` ISO avec décalage de Paris, identifiants, anti-doublon par `cmsKey` — ouvert le 01/11, **tranché le 01/11/2026** — verdicts Codex **amendé** (`25d0302`) puis **amendé** (`22364ae`) : (A), écriture française de (B), (D), D3 **confirmés**, format de (C) confirmé ; seule condition restante (rechargement des sessions antérieures à (B)) **remplie selon l'utilisateur (01/11/2026 à 13:15) : postes fermés puis rouverts** — déclaration de l'utilisateur, non vérifiée par Claude. Mise en ligne de tout le lot décidée par l'utilisateur à 11:53. Livraisons : `5c39d77`…`9b443fe`, `f7c7639`, `6092246`, `f4a087f`. Textes intégraux : `git log -p AGORA.md`.
- **AG-015** — Étape 5 d'AG-013 : calculs partagés, un calendrier par indicateur — ouvert et **tranché le 01/11/2026** — verdict **confirmé** (Codex, critère 7 ; (A) `0d4277d`, (B)/(C) `546e421`, sans amendement). Fonctions communes (`personnesDistinctes`, `compterCanaux`, `aRelanceRenseignee`, `fichesPrepareesModel`) ; « Fiches préparées » au jour de première préparation, non-mesurables à part sans mois inventé ; canal inconnu à part ; liste des usagers = tuile ; relances au mois du RDV ; « Délai moy. RDV » retiré ; limite nom + prénom écrite. Arbitrages de l'utilisateur M1–M3 (01/11). Archives inchangées (étape 6). Textes intégraux : `git log -p AGORA.md` (`c6d4e2c`…`546e421`). Conclusion dans `CHANTIERS.md`.
- **AG-014** — Étape 4 d'AG-013 : une seule table des statuts, « Statut à vérifier », RDV sans heure affichés — ouvert et **tranché le 01/11/2026** — verdict **amendé** (Codex, critère 7 : garde de type, (B) et (C) nécessaires), puis confirmé sans amendement (`326f838`). 🙏 pour Excusé, Annulé hors de la tendance (décisions de l'utilisateur). Textes intégraux : `git log -p AGORA.md` (`24df6a5`…`326f838`).
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

**Total au 01/11/2026 : 7 amendés, 4 confirmés, 0 contredit** (AG-001, AG-002, AG-003 et AG-010 sans verdict, hors total).
