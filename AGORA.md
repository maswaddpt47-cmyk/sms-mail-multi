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
**Amendé le 25/10 par l'utilisateur** : le créneau de 16:30 est aussi retiré pour **tous** les CMS (après-midi = 3
créneaux d'1 h, défaut 13:30/14:30/15:30). Un RDV existant à 16:30 reste affiché « hors grille » ; seuls les créneaux
libres de 16:30 disparaissent.
**Si personne ne répond, je fais quoi ?** — livrer (demande explicite, « oui pour les 3 points » puis « sors le
créneau de 16h30 ») ; ne rien déduire pour les autres CMS que Fumel.
**Où regarder** : `index.html` : `getSlots`, `cmsAfternoonStart`/`afternoonGridHours`, `statsRdvModel.assignedHalf`,
formulaire CMS de Configuration, `loadProfileData` (pose unique de Fumel 14:00).

## AG-004 — Bilan mensuel : audit Codex des chiffres avant diffusion — ouvert le 25/10/2026
**Auteur** : session `01Dtnmsd` — lu sur `9a75ffa`.
**Proposition** : ne diffuser le bilan mensuel (Statistiques → Bilan mensuel) à la hiérarchie qu'après un audit Codex des
chiffres sur un export **pseudonymisé** (noms, téléphones et textes libres retirés ; mêmes chiffres que l'original,
vérifié sur 07 à 10/2026). Codex reçoit une consigne écrite hors dépôt, sans nos conclusions ; son rapport est inscrit
ici tel quel.
**Critère déclencheur** : hors des six critères du `CLAUDE.md` — règle 33 de MD-LIB (`chiffres-diffuses.md` §1 : audit
Codex avant toute diffusion de chiffres) et données personnelles (`agora.md` §12, règle 2 : Codex au lieu d'une session B).
**Ce que ça engage** : un chiffre faux ou mal étiqueté montré à la hiérarchie (fiches ≠ créneaux ≠ personnes) ; la
promesse « aucun nom, téléphone, note ni message » du bilan.
**Non vérifié par l'auteur** : l'export complet non pseudonymisé et l'autre profil ; l'impression réelle sur le
navigateur de l'utilisateur ; les définitions (concrétisation, lapin, créneau échu) sont celles voulues par l'utilisateur,
non confrontées à un tiers. L'auteur a fait un recomptage lui-même : il ne vaut pas audit et n'est pas joint ici.
**Si personne ne répond, je fais quoi ?** — le bilan **ne part pas** à la hiérarchie ; il reste utilisable par
l'utilisateur seul. Aucune autre fonction n'attend ce bloc.
**Où regarder** : `index.html` : `monthlyReportData`, `monthlyReportHtml`, `printMonthlyReport`, bloc `S.modal==='bilan'`,
`statsRdvModel`, `slotRates`, `getSlots`/`isLunchBreak`/`cmsAfternoonStart`, `computeYearArchive`.
**Définitions voulues (à comparer au code, pas à valider)** : « rendez-vous enregistrés » = fiches du mois, tous statuts,
hors `indispo` ; « usagers accompagnés » = personnes distinctes (nom+prénom) parmi les fiches `realise` ; « créneaux
horaires » = (date, CMS, heure) distincts hors `indispo`, échus à la fin du mois (mois échu) ou au jour courant ;
taux de concrétisation / de lapin = créneaux portant ≥1 fiche `realise` / `lapin`, sur les créneaux échus.
**À examiner** : 1) recomptage indépendant (07 à 10/2026, avec et sans filtre CMS) depuis le fichier fourni
`export-pseudonymise-2026-10-25.json`, tableau « Affiché / Recompté / Écart / Explication » ; 2) même population que
l'écran Statistiques, somme des CMS = total ; 3) unités et dénominateurs nommés, aucun « top N » qui tronque ; 4) bords
(fin de mois, mois en cours, fuseau Paris, fiches sans heure/commune, doublons, CMS écrit de deux façons, créneaux hors
grille, 12:30 qui n'est pas une pause) ; 5) données personnelles ou HTML non échappé dans `monthlyReportHtml` et l'aperçu
(`innerHTML`) ; 6) les fonctions modifient-elles leurs entrées ; 7) la pause déjeuner automatique, la grille par CMS et
l'archivage automatique peuvent-ils changer un nombre ?
**Réponse attendue** : selon le gabarit ci-dessous, un défaut par ligne avec `fichier:ligne` et scénario chiffré, puis
« Ce que je n'ai pas pu vérifier ». Lecture seule : ne rien modifier.

### Réponse — Codex — 26/10/2026
*(inscrite telle quelle par la session qui a ouvert le bloc, sans reformulation ni jugement ; les tableaux gardent leurs séparateurs d'origine)*

```text
Réponse — Codex — 26/10/2026

Auteur : Codex, session distincte de l’auteur du bloc (Claude-Session: 01Dtnmsd…) — lu sur 66b9b62, branche main, récupérée via le connecteur GitHub après échec du clonage.

Verdict : amendé.

Constat : aucun écart de calcul sur l’export fourni, pour les 20 sélections mois/CMS examinées. Des défauts reproduits sur données fictives empêchent toutefois de garantir les chiffres et la confidentialité dans tous les cas admis par l’application.

Recomptage indépendant en Python, comparé aux fonctions JavaScript sources et au HTML généré. Référence : 25/10/2026, fuseau Paris.

Dans le tableau : F/R/U = fiches enregistrées/réalisées/personnes accompagnées ; C/R/L = créneaux échus/avec réalisé/avec lapin ; % = concrétisation/lapin.

Mois — CMS	Affiché : F/R/U ; C/R/L ; %	Recompté	Écart	Explication

07 — Tous	23/19/19 ; 23/19/3 ; 83/13	23/19/19 ; 23/19/3 ; 83/13	0	Conforme
07 — Fumel	10/8/8 ; 10/8/2 ; 80/20	10/8/8 ; 10/8/2 ; 80/20	0	Conforme
07 — Marmande	10/9/9 ; 10/9/0 ; 90/0	10/9/9 ; 10/9/0 ; 90/0	0	Conforme
07 — Villeneuve	3/2/2 ; 3/2/1 ; 67/33	3/2/2 ; 3/2/1 ; 67/33	0	Conforme
08 — Tous	42/25/24 ; 39/25/4 ; 64/10	42/25/24 ; 39/25/4 ; 64/10	0	Conforme
08 — Fumel	24/13/12 ; 21/13/3 ; 62/14	24/13/12 ; 21/13/3 ; 62/14	0	Conforme
08 — Marmande	11/7/7 ; 11/7/0 ; 64/0	11/7/7 ; 11/7/0 ; 64/0	0	Conforme
08 — Saint-Pardoux	2/2/2 ; 2/2/0 ; 100/0	2/2/2 ; 2/2/0 ; 100/0	0	Conforme
08 — Villeneuve	5/3/3 ; 5/3/1 ; 60/20	5/3/3 ; 5/3/1 ; 60/20	0	Conforme
09 — Tous	23/17/17 ; 22/17/1 ; 77/5	23/17/17 ; 22/17/1 ; 77/5	0	Conforme
09 — Fumel	7/6/6 ; 7/6/0 ; 86/0	7/6/6 ; 7/6/0 ; 86/0	0	Conforme
09 — Marmande	14/9/9 ; 13/9/1 ; 69/8	14/9/9 ; 13/9/1 ; 69/8	0	Conforme
09 — Saint-Pardoux	2/2/2 ; 2/2/0 ; 100/0	2/2/2 ; 2/2/0 ; 100/0	0	Conforme
10 — Tous	62/31/29 ; 42/31/5 ; 74/12	62/31/29 ; 42/31/5 ; 74/12	0	Conforme
10 — Fumel	31/16/14 ; 23/16/3 ; 70/13	31/16/14 ; 23/16/3 ; 70/13	0	Conforme
10 — Marmande	31/15/15 ; 19/15/2 ; 79/11	31/15/15 ; 19/15/2 ; 79/11	0	Conforme
07 et 10 — Saint-Pardoux ; 09 et 10 — Villeneuve	État vide	0 rendez-vous	0	Quatre sélections vides

Les répartitions par statut et les comptes par démarche concordent également. La somme des CMS retrouve les totaux ; les pourcentages ne s’additionnent pas. En octobre, 11 fiches futures entrent dans les 62 fiches, mais pas dans les 42 créneaux échus.

Défauts reproduits — un défaut par ligne :

Référence	Constat et scénario chiffré	Amendement

index.html:2495, index.html:3158, index.html:3171	Confidentialité : une seule fiche réalisée dont la démarche libre contient un nom ou un téléphone suffit à reproduire ce texte dans le bilan. L’échappement HTML protège des balises, pas de cette divulgation. La promesse « Aucun nom, téléphone… » est donc trop forte.	Réserver les libellés diffusés à une nomenclature contrôlée ; regrouper les textes libres sous un libellé neutre.
index.html:3113	CMS absent : une fiche sans commune donne 1 rendez-vous au total, 0 dans la somme des CMS.	Ajouter une ligne « CMS non renseigné » et rendre ces fiches repérables.
index.html:3094	Heure absente : deux fiches du même jour/CMS, sans heure, l’une réalisée et l’autre lapin, deviennent 1 créneau, avec 100 % réalisé et 100 % lapin, alors que leur identité horaire est inconnue.	Signaler les fiches non mesurables et leur exclusion des taux ; ne pas présenter une heure inconnue comme un créneau certain.
index.html:3006, index.html:3013	Statut absent : une fiche sans statut donne 1 rendez-vous, 0 dans la répartition des statuts, tandis que le graphe mensuel la classe « En attente ». Le statut peut être vidé dans la fiche (index.html:6290).	Employer une catégorie explicite « Non renseigné » commune aux vues.
index.html:3008, index.html:3155	Démarche absente : une fiche réalisée sans démarche affiche simultanément 1 réalisé et « Aucun accompagnement réalisé ce mois-ci ». L’import ICS crée des démarches vides (index.html:3965).	Afficher « Démarche non renseignée » et conserver son nombre de réalisations.
index.html:1706, index.html:2992	Paris non imposé : au même instant, le 01/10 à 00 h 30 Paris, un rendez-vous réalisé du 01/10 donne 0 créneau en environnement UTC, contre 1 créneau et 100 % en Europe/Paris. Le calcul suit le fuseau de l’appareil.	Fixer explicitement le jour et les bornes mensuelles en Europe/Paris.
index.html:3000, index.html:3094	Deux écritures d’un même CMS : « Fumel » et « FUMEL », même date/heure, avec réalisé puis lapin, donnent 2 créneaux et 50 %/50 %, au lieu de 1 créneau et 100 %/100 % si ces libellés désignent bien le même CMS.	Résoudre les variantes vers un identifiant de CMS, ou signaler l’ambiguïté avant diffusion.

Ces défauts de données manquantes ou variantes ne produisent aucun écart sur l’export examiné.

Autres contrôles :

- Top 10 : les totaux restent complets grâce à « Autres » : août 22 + 3 = 25, octobre 27 + 4 = 31. En revanche, trois et quatre intitulés respectivement disparaissent de la liste (index.html:3116, index.html:3159).
- HTML : les charges fictives contenant des balises sont échappées dans les libellés testés. Les champs individuels nom, prénom, téléphone, notes et corps du message ne sont pas repris directement. Le défaut de confidentialité ci-dessus concerne les textes libres diffusés.
- Lecture seule : les calculs répétés et la génération du HTML ne modifient pas leurs entrées.
- Cycle import/rechargement/réimport : trois cycles avec stockage simulé conservent les 190 entrées originales et leurs champs. Le premier rechargement ajoute 4 pauses indispo, puis le nombre se stabilise à 194. Les bilans restent identiques. L’archivage automatique masque des journées sans supprimer l’historique (index.html:1743, index.html:1947).
- Grille et horaires : changer la grille du CMS ne change pas les bilans historiques ; un vrai rendez-vous à 12:30 ou hors grille reste compté. L’archivage annuel manuel purge, lui, le détail (index.html:2878) ; le bilan mensuel ne reprend pas les archives et le signale.

Amendement : conserver le principe d’audit préalable, mais ne pas considérer AG-004 comme une autorisation générale de diffusion. Les chiffres de cet export concordent ; la garantie de confidentialité et les défauts ci-dessus restent à traiter.

Ce que je n’ai pas pu vérifier : l’export original non pseudonymisé, la conservation des identités lors de la pseudonymisation, l’autre profil, le rendu et l’impression dans le navigateur de l’utilisateur, ainsi que les sauvegardes réseau réelles. « Affiché » désigne ici les valeurs produites par le code et son HTML, sans observation du navigateur.

Aucun fichier du dépôt modifié, aucune réponse publiée dans AGORA.
```

### Suites — session `01Dtnmsd` — 26/10/2026
Points de Codex vérifiés dans `index.html` puis sur la sauvegarde réelle (162 RDV) : tous les défauts sont **réels dans le
code** ; aucun ne touche les chiffres actuels sauf le texte libre des démarches (29 fiches hors nomenclature, libellés
sans nom visible). **Corrigés** : CMS absent, heure absente, statut absent, démarche absente, fuseau Europe/Paris, variantes
de CMS, promesse de confidentialité reformulée (« reproduites telles quelles : à relire »). Tests ajoutés dans
`scripts/check-stats-rdv.js` ; chiffres des 4 mois inchangés (identiques au tableau de Codex). **Non traité, à trancher par
l'utilisateur** : regrouper ou non les démarches saisies librement. AG-004 reste ouvert jusqu'à cette décision.
