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

## AG-001 — Statut Annulé et motif facultatif — ouvert le 22/10/2026
**Auteur** : session `cx2210an` — lu sur `a6390d7`.
**Proposition** : ajouter `statut: 'annule'` et `annulationMotif` facultatif aux
fiches, sans migration ; afficher Annulé en rouge et libérer le créneau.
Exclure rappels/relances et exporter l'événement ICS annulé avec son UID existant.
**Critère déclencheur** : n° 1 (`CLAUDE.md`, section AGORA), nouvelle valeur
persistée et champ conservés dans les exports/sauvegardes.
**Ce que ça engage** : les versions consommatrices doivent connaître ce nouvel
état ; ne jamais le convertir en Excusé ni supprimer son motif.
**Non vérifié par l'auteur** : relecture d'un export contenant Annulé par une
ancienne version externe de l'application ; aucune donnée réelle utilisée.
**Si personne ne répond, je fais quoi ?** — livrer l'ajout demandé, additif et
sans migration. Différer toute redéfinition des dénominateurs statistiques :
la répartition compte Annulé séparément, les formules de taux restent celles
existantes (RDV passés, comme Excusé). Aucune archive agrégée recalculée.
**Où regarder** : `index.html` : `getSlots`, `hasConflict`, `STATUT_STYLES`,
`renderAgendaRdvDialog`, `computeYearArchive`, `ICS_CANCEL_STATUTS` ;
`writeProfileHistory`/`exportDataForProfile`/`doImport` conservent les champs.

## AG-002 — Réception et première préparation, délai lundi–vendredi — ouvert le 22/10/2026
**Auteur** : session `cx2210rp` — lu sur `6e0c16f`.
**Proposition** : champs additifs `dateReception` (jour ISO) et
`premierePreparationAt` (instant ISO avec fuseau), séparés du legacy `dateDemande`.
Moyenne réception → première préparation en jours lundi–vendredi, couverture affichée.
**Critère déclencheur** : n° 1 (`CLAUDE.md`, section AGORA), contrat persistant
et agrégat annuel additif `preparationMetrics` distinct de l’ancien `avgReact`.
**Ce que ça engage** : conserver la première préparation lors des régénérations,
exports/imports et modifications de fiche ; aucune assimilation à un envoi réel.
`dateDemande` garde son rôle legacy pour les échanges/relances.
**Non vérifié par l'auteur** : les vraies dates de réception/première préparation
des fiches anciennes ; `ts` est écrasable et ne permet pas de les reconstruire.
**Si personne ne répond, je fais quoi ?** — appliquer la demande explicite « Go »
sans migration automatique : seul un nouveau message préparé initialise le premier
instant ; une fiche ancienne déjà préparée reste sans premier instant fiable.
Afficher le nombre de fiches mesurables/exclues, garder les anciennes archives
identifiées en jours calendaires, sans recalculer leurs agrégats.
**Où regarder** : `addHistory`, `handleGenerate`, `copyBody`, `renderGenerate`,
`openHistInGen`, `renderAgendaRdvDialog`, `preparationStats`, `computeYearArchive`.

**Précision utilisateur — 22/10/2026** : la date de réception déjà saisie dans
l’historique est bien le point zéro. Le lecteur compatible reprend `dateDemande`
uniquement si le nouveau champ `dateReception` est absent. Une nouvelle valeur
explicitement vide reste inconnue. Aucune première préparation n’est déduite de `ts`.

# Blocs tranchés

Aucun. **Total au 27/09/2026 : 0 amendé, 0 confirmé, 0 contredit.**

## AG-003 — Début de l'après-midi réglable par CMS (Fumel 14h) — ouvert le 25/10/2026
**Auteur** : session `01Dtnmsd` — lu sur `3f5e2f7`.
**Proposition** : champ additif facultatif `debutApresMidi` (« HH:MM ») sur chaque CMS (`ess-cms`, partagé entre
profils). `getSlots` génère alors l'après-midi par créneaux d'1 h à partir de cette heure (Fumel : 14:00, 15:00,
16:00) ; sans le champ, grille inchangée (13:30…16:30). Réglage dans Configuration ; Fumel posé à 14:00 une fois.
**Critère déclencheur** : n° 1 (nouveau champ persisté, contrat de `getSlots` entre modules) et n° 5 (contredit la
note du 07/10 : grille 9h30–16h30 identique pour tous). Option écartée : règle codée en dur pour Fumel seul.
**Ce que ça engage** : les journées déjà ouvertes d'un CMS réglé changent de grille à l'affichage (créneaux libres
13:30/14:30/15:30/16:30 remplacés) ; les RDV existants gardent leur heure. `assignedHalf` (stats) doit suivre
la grille du CMS. Vider le champ rétablit l'ancienne grille ; aucune donnée supprimée.
**Non vérifié par l'auteur** : si d'autres CMS que Fumel ont des horaires stables (Saint-Pardoux et Villeneuve
montrent 14:00/14:30/14:45, trop peu de données) ; l'effet sur une sauvegarde restaurée depuis une ancienne version.
**Si personne ne répond, je fais quoi ?** — livrer le réglage (demande explicite de l'utilisateur, « oui pour les
3 points ») ; ne rien déduire pour les autres CMS ; garder le 4ᵉ créneau 16:30 des CMS non réglés.
**Où regarder** : `index.html` : `getSlots`, `cmsAfternoonStart`/`afternoonGridHours`, `statsRdvModel.assignedHalf`,
formulaire CMS de Configuration, `loadProfileData` (pose unique de Fumel 14:00).
