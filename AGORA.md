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

## AG-006 — Calculs Statistiques/Bilan : corrections de l'audit du 30/10 et remplissage net — ouvert le 30/10/2026
**Auteur** : session `0199YP2K` — lu sur `eeed45b`.
**Proposition** : corriger les points 1 à 5 de l'audit Codex du 30/10 (délai RDV, filtres CMS, début de période, clé « usagers »,
« traitées le jour même ») et ajouter un taux de remplissage **net** (créneaux ayant au moins une fiche non libérée).
**Critère déclencheur** : n° 7 de `MD-LIB/agora.md` (tout calcul ou chiffre affiché ; contradicteur Codex), demandé aussi par l'utilisateur.
**Définitions métier — tranchées par l'utilisateur le 30/10** : (a) remplissage = base **fixe** 6 places par journée, 3 par demi-journée,
sans tenir compte des créneaux masqués ; (b) remplissage net = créneaux dont au moins une fiche n'est ni Lapin, ni Excusé, ni Annulé, ni
Pas de retour, sur la même base ; le remplissage actuel (tous statuts) est conservé à côté.
**Défauts démontrés (audit, à corriger)** : (1) délai RDV : deux dates civiles comparées par une même fonction, zéro jour inclus, négatifs exclus ;
(2) clé `cmsKey` pour tout filtre, regroupement et dédoublonnage CMS (messages, préparation, heatmap, délais par CMS) ;
(3) début de période dérivé de la date civile Europe/Paris ; (4) une seule clé « usager » (nom|prénom, espaces retirés, minuscules) pour
messages, archive et usagers accompagnés ; (5) « traitées le jour même » = même date civile, plus zéro jour ouvré.
**Ce que ça engage** : des chiffres affichés peuvent bouger (délai moyen hors France métropolitaine, nombre d'usagers des messages, filtres CMS) ;
aucun stockage nouveau. Les archives annuelles déjà calculées ne sont pas recalculées : leurs `usagersN` et `avgRdv` ne seront pas strictement
comparables aux nouvelles.
**Non vérifié par l'auteur** : l'effet sur les vraies sauvegardes (tests sur données fictives seulement, en UTC et Europe/Paris) ; les points 6 et 7
de l'audit, non traités ; l'homonymie (deux personnes de mêmes nom et prénom restent une).
**Si personne ne répond, je fais quoi ?** — livrer ces corrections (comportement défini ci-dessus, testé), ne rien recalculer dans les archives,
noter les points 6 et 7 comme non traités ; tout amendement de Codex se traite dans un commit suivant.
**Où regarder** : `index.html` : `statsRdvModel` (début de période), `slotRates`, `placesJournee`, `preparationCohort`,
`legacyPreparationEstimate`, `computeYearArchive`, `renderStats` (délais, usagers, heatmap), `monthlyReportData`.
Tests : `scripts/check-stats-rdv.js`, `scripts/check-reactivity.js`, en `TZ=UTC` et `TZ=Europe/Paris`.

### Complément de l'auteur — 30/10/2026 (demande de l'utilisateur : traiter aussi le point 7 de l'audit)
**Définitions** : un statut vide ou inconnu vaut « En attente » **partout** (barre, liste ouverte au clic, archive annuelle, bilan), par une liste fermée
(`statutAffiche`) qui n'accepte plus une propriété héritée comme `toString` ; une fiche Réalisé sans démarche apparaît à l'écran sur une ligne
« Démarche non renseignée » (comme au bilan) ; un nom de démarche tel que `constructor` n'est plus lu comme une propriété héritée.
**Ce que ça engage** : dans l'archive annuelle, un statut inconnu est compté « en attente » au lieu d'une clé à son nom (comportement que le commentaire
du code annonçait déjà). **Non vérifié** : aucune fiche à statut inconnu dans les sauvegardes lues par l'audit ; tests sur données fictives seulement.

### Réponse — Codex — 30/10/2026

**Auteur** : Codex (OpenAI), distinct de la session auteure `0199YP2K` — lu sur `fcfdb7d`, qui contient `64d6517`.

**Verdict** : **amendé**.

**Constat** :

Les corrections des délais, du début de période Paris, de la clé usager et du « jour même » sont confirmées : `index.html:3166`, `index.html:3049`, `index.html:3163`, `index.html:2833`.

Le remplissage net respecte la définition tranchée : un créneau compte dès qu’une fiche n’est pas libérée, sur la base fixe 6/3 (`index.html:3209`, `index.html:3199`). Écran et bilan utilisent ce même calcul (`index.html:3243`). Recomptage indépendant sur **29 sélections mois/CMS : aucun écart**. Pour octobre dans la sauvegarde principale : **38 créneaux nets / 54 places = 70 %**, contre **53/54 = 98 %** tous statuts.

Le statut inconnu est désormais classé « En attente » dans le modèle, le détail au clic et les nouvelles archives (`index.html:3070`, `index.html:3902`, `index.html:2877`). Les démarches absentes sont affichées à l’écran (`index.html:3874`).

**Deux corrections restent incomplètes :**

1. **Regroupement CMS encore brut.** « Messages par CMS » utilise toujours `h.commune` sans `cmsKey` (`index.html:3922`), comme les nouvelles archives (`index.html:2914`). Contre-exemple exécuté : `Fumel` et `FUMEL ` donnent **deux lignes de 1**, alors que les autres calculs les regroupent. Cela contredit le regroupement uniforme annoncé dans AG-006.

2. **Démarches réservées encore mal comptées dans les nouvelles archives.** Le modèle courant utilise bien `Object.create(null)` (`index.html:3058`), mais `computeYearArchive` garde `{}` (`index.html:2907`). Contre-exemple exécuté : deux démarches `constructor` et `__proto__` produisent une valeur textuelle incorrecte pour la première et aucune entrée propre pour la seconde. L’archivage supprime ensuite le détail source (`index.html:2933`).

**Amendement** :

Normaliser aussi les regroupements CMS des messages et des nouvelles archives ; protéger également le dictionnaire des démarches dans `computeYearArchive`. Ajouter les contre-exemples correspondants aux tests, sans recalculer les anciennes archives.

**Vérifications et limites** : les deux scripts de contrôle passent en UTC et Europe/Paris. Aucun fichier modifié. Aucun archivage déclenché ; rendu navigateur et déploiement non vérifiés.

# Blocs tranchés

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

**Total au 26/10/2026 : 2 amendés, 0 confirmé, 0 contredit.**
