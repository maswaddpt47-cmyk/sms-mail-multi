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
l'utilisateur la phrase à coller ailleurs (« pull, lis AGORA.md, réponds à
AG-00N, tu es la session B »), l'autre session répond, l'utilisateur tranche.
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

## AG-010 — Répartition par statut sur la base des rendez-vous (remplace l'issue exclusive d'AG-008) — ouvert le 30/10/2026
**Auteur** : session `0199YP2K` — lu sur `f283ddb`.
**Proposition** : dans le bilan, la colonne « Issue du créneau » est remplacée par « Part des rendez-vous » : pour chaque statut, rendez-vous enregistrés du statut ÷ rendez-vous
enregistrés du mois (60 % réalisés, 20 % lapins… pour 100 rendez-vous), ligne Total à 100 %. À l'écran, la carte « Issue des créneaux » est retirée : la carte « Statuts des RDV
de la période » donne déjà cette répartition en fiches. Le commentaire « statut présent sans créneau » et le classement exclusif par créneau disparaissent (plus de sens).
**Critère déclencheur** : n° 7 de `MD-LIB/agora.md` (changement d'un indicateur affiché ; contradicteur Codex) ; n° 5 en partie : AG-008 tranchait l'issue exclusive par créneau.
**Définition métier — tranchée par l'utilisateur le 30/10 (option B)** : exemple de l'utilisateur : 100 rendez-vous → 60 réalisés, 20 lapins, 10 annulés, 5 excusés, 5 pas de retour =
60 %, 20 %, 10 %, 5 %, 5 %, « pour être proche de la réalité ». **Concrétisation, lapin et remplissage restent par créneau** (décision du 23/10 conservée) ; deux bases coexistent donc
et sont annoncées dans les libellés (« rendez-vous enregistrés » / « créneaux attribués »).
**Ce que ça engage** : rien de stocké ; la concrétisation (créneaux) et la part de réalisés (rendez-vous) diffèrent (ex. 72 % et 58 %), à expliquer sous le tableau.
**Non vérifié par l'auteur** : lisibilité de deux bases voisines ; effet sur les vraies sauvegardes (tests sur données fictives). AG-009 (phrase de lecture) reste ouvert : sa mention de
l'issue exclusive devient sans objet.
**Si personne ne répond, je fais quoi ?** — livrer tel quel (calcul d'affichage, se défait en un commit) ; amender selon Codex.
**Où regarder** : `index.html` : `monthlyReportHtml` (colonne, ligne Total, note), `slotRates` (suppression de `issues`), `renderStats` (carte retirée) ; tests `scripts/check-stats-rdv.js`.

## AG-009 — Bilan mensuel : phrase de lecture 65 → 53 → 54 et infobulles — ouvert le 30/10/2026
**Auteur** : session `0199YP2K` — lu sur `b90e9a4`.
**Proposition** : au-dessus du tableau du bilan, une phrase qui relie les trois nombres que l'utilisateur lit comme « le même sujet » (65, 53, 54) : réservations
enregistrées, créneaux attribués, places offertes ; des libellés distincts (« Réservations du mois », « Créneaux attribués », « Places offertes ») et des infobulles ⓘ
qui définissent chaque indicateur (survol et toucher, absentes à l'impression).
**Critère déclencheur** : n° 7 de `MD-LIB/agora.md` (deux nombres dérivés affichés : réservations ayant repris un créneau, places jamais attribuées ; contradicteur Codex).
**Définitions métier — tranchées par l'utilisateur le 30/10 (choix « phrase de lecture et libellés », 1 sur 2)** : réservations reprises = réservations avec heure − créneaux
attribués ; places jamais attribuées = places offertes − créneaux attribués (« dépassement » si négatif) ; les réservations sans heure sont signalées à part, hors créneaux.
**Ce que ça engage** : rien de stocké ; deux nombres dérivés de ceux déjà audités (65 = fiches du mois, 53 = créneaux, 54 = places).
**Non vérifié par l'auteur** : lisibilité de la phrase pour un lecteur extérieur ; rendu des infobulles sur iPad (tests sur données fictives).
**Si personne ne répond, je fais quoi ?** — livrer tel quel (se défait en un commit) ; amender selon Codex.
**Où regarder** : `index.html` : `monthlyReportData` (`repris`, `libres`), `monthlyReportHtml` (phrase, libellés, `data-tip`) ; tests `scripts/check-stats-rdv.js`.

### Complément de l'auteur — 30/10/2026 (remarque de l'utilisateur : « on peut avoir 6 pas de retour et 0 % »)
**Définition** : quand un statut a des rendez-vous enregistrés mais **aucun créneau pour issue la plus avancée** (ex. 6 « Pas de retour », 0 / 53), le bilan l'écrit sous
le tableau : ces rendez-vous sont sur des créneaux dont l'issue la plus avancée est une autre (créneau repris par un autre usager). Aucun nouveau calcul : le constat
« rendez-vous > 0 et créneaux = 0 » reprend les deux colonnes déjà affichées ; rien n'est affiché quand tous les statuts ont un créneau.
**Non vérifié** : le cas où un statut a plus de rendez-vous que de créneaux sans que le second soit nul (ex. 12 Excusé, 7 créneaux) n'est pas commenté (ces écarts peuvent
venir de plusieurs rendez-vous Excusé sur un même créneau).

### Complément de l'auteur — 30/10/2026 (suite à la réponse de Codex)
**Corrections appliquées** : libellés « réservations supplémentaires sur des créneaux partagés » et « écart entre la capacité théorique et les créneaux attribués » (les champs
`repris` et `libres` deviennent `supplementaires` et `ecart`, formules inchangées) ; les deux contre-exemples de Codex sont dans `scripts/check-stats-rdv.js` ; les assertions
absorbées par un commentaire (`scripts/check-stats-rdv.js`, ligne 190, depuis le commit `e12ec46`) sont rétablies, le test ne les exécutait plus malgré le vert.

### Réponse — Codex — 30/10/2026

**Auteur** : Codex (OpenAI), distinct de la session auteure `0199YP2K` — lu sur `782d1b1`, qui contient `7907782`.

**Verdict** : **amendé**.

**Constat** :

Les deux soustractions respectent les définitions choisies (`index.html:3274`). **29 sélections mois/CMS recomptées sans écart.** Pour octobre dans la sauvegarde principale : **65 réservations, 53 créneaux, 54 places**, soit **12 réservations supplémentaires** et **1 place d’écart à la capacité**.

Toutefois, la phrase attribue à ces différences une signification que le calcul ne démontre pas :

1. **« Ont repris un créneau déjà libéré »** (`index.html:3317`). Le calcul ne vérifie aucune libération. Contre-exemple exécuté : deux réservations **Confirmées** au même créneau produisent « 1 réservation a repris un créneau déjà libéré », alors qu’aucune fiche n’est libérée.

2. **« Places jamais attribuées »** (`index.html:3318`). Une différence globale compense les dépassements d’une journée par les places restantes d’une autre. Contre-exemple exécuté : **7 créneaux sur 6 places**, puis **1 sur 6** → affichage **4 places jamais attribuées**, alors que la seconde journée comporte **5 places non attribuées** et la première un dépassement de 1.

Les infobulles sont bien ajoutées à l’aperçu, raccordées au gestionnaire tactile et retirées du document imprimé (`index.html:3311`, `index.html:3383`, `index.html:7005`, `index.html:7007`). Simulation du toucher réussie ; fonctionnement réel sur iPad non vérifié.

Enfin, plusieurs assertions sont accidentellement absorbées par le commentaire de fin de ligne dans `scripts/check-stats-rdv.js:184` : elles ne s’exécutent plus malgré les tests verts.

**Amendement** :

Conserver les formules tranchées, mais employer des libellés strictement démontrés :

- « **12 réservations supplémentaires sur des créneaux partagés** » ;
- « **écart de 1 entre capacité théorique et créneaux attribués** », en précisant que les dépassements peuvent compenser des places non attribuées.

Rétablir également les assertions commentées et ajouter les deux contre-exemples ci-dessus. Un véritable comptage des reprises après libération demanderait une preuve supplémentaire ; ne pas le déduire de la seule soustraction.

**Vérifications et limites** : tests existants réussis en UTC et Europe/Paris. Aucun fichier modifié. Rendu navigateur, impression réelle et déploiement non vérifiés.

# Blocs tranchés

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

**Total au 30/10/2026 : 4 amendés, 1 confirmé, 0 contredit** (AG-001, AG-002 et AG-003 sans verdict, hors total).
