# CHANTIERS — sms-mail-multi

État au **01/11/2026**, base `main` (**étape 5 d'AG-013 close le 01/11/2026**, confirmée par Codex `546e421` ; **étape 3 d'AG-013 close le 01/11/2026** (AG-016 tranché : Codex `22364ae`, rechargement des postes confirmé par l'utilisateur 01/11/2026 à 13:16) ; **étape 6 : AG-017 ouvert, aucun code** ; **étape 2 d'AG-013 close le 01/11/2026**, confirmée par Codex : vérification finale ciblée `bc1289e`, code `5ee7bdb` ; consigne levée avec réserve, voir la passation). Livraison demandée par l’utilisateur (« Fait le ») : présentation du bilan et suivi des relances renseignées, sans modification des données ni des archives. Tests ciblés exécutés en UTC et Europe/Paris, syntaxe JS et mutation du compteur vérifiées. **Fonctionnement du bilan validé par l’utilisateur le 31/10/2026** : « C’est bon ça fonctionne ». Retour global, sans précision sur l’impression ni sur les tailles d’écran. Mesures navigateur de Codex toujours non exécutées : Chromium bloqué par le sandbox. Accès Git local au distant indisponible, publication via connecteur GitHub ; déploiement Pages de `4a053b6` vérifié réussi via GitHub Actions (run `41195384650`). Accord durable du 31/10 inscrit dans `AGENTS.md` : ne pas redemander les autorisations déjà accordées ni répéter une demande technique bloquée. Validations utilisateur du 30/10 conservées : réponse globale « testé, ça marche » sur animation/compteurs, bilan simplifié et remplissage net, non détaillée par point. Le récit des tâches terminées reste dans Git.

## ⏩ Passation du 01/11/2026 (étape 2 d'AG-013 close) — À LIRE EN PREMIER

**Chantier en cours : AG-013, fiabilisation des statistiques** (plan validé par l'utilisateur avec les amendements de Codex ; détail dans « En cours » ci-dessous, réponses de Codex dans `AGORA.md`, section « Vérification des étapes d'AG-013 »).
- Étapes 0 (tests des valeurs affichées + déploiement bloqué si un test échoue) et 1 (définitions `docs/indicateurs.md`, outil `audit.html`) : **closes, confirmées par Codex**.
- **Étape 2 (écritures sûres) — CLOSE le 01/11/2026 ; vérification finale ciblée de Codex (`bc1289e`) : confirmé pour P03 et P08**, aucune régression établie par `5ee7bdb` sur ces parcours. Parcours : 10 vérifications « amendé » le 31/10 (chargement) → balayage complet → vérification de clôture de Codex (`cc0149a` : 10 cas probables P01–P10, 17 théoriques T01–T17) → corrections → vérification des corrections (`7558a5f` : P02, P09 corrigés ; P03, P08 partiels ; 3 régressions R1–R3) → P03/P08 terminés → confirmation. Textes intégraux : `git log -p AGORA.md`.
  - **Corrigé et déployé** (chaque cas avec son test, ses mutations rejetées en UTC et Europe/Paris ; rejeu Chromium pour P01, P02, P03) : **P01** deux onglets (`efeda53`), **P02** imports par fichier, **P03** copie figée y compris démarche libre (`5ee7bdb`), **P04** identité de fiche, **P05** garde anti-doublon, **P06** favoris (`8d66f8d`), **P07** numéro de mandat par bénéficiaire (`e714f54`), **P08** compteur de sauvegarde cohérent malgré chevauchements et exports (`5ee7bdb`), **P09** archive existante jamais remplacée (`be9ee7d`), **T01, T02, T03, T11, T12, T14** (`e60b583`…`2ad9dae`), plus le balayage du chargement du 31/10 (`17013bf`…`dd34904`).
  - **Confirmé par Codex** : P02, P09 (`7558a5f`), P03, P08 (`bc1289e`) — le périmètre de clôture voulu par l'utilisateur. **Jugés corrigés par Codex dans le tableau élargi, sans nouvelle confirmation depuis** : P04, P05, P06, T01, T02, T11, T12 (`7558a5f`). **Partiels selon Codex, hors périmètre, documentés** : P01 (= R1), P07 (archiver sans télécharger garde le numéro du précédent), T03 (permanences d'un autre profil lues par `ls` dans `ensureDayOpenFor`), T14 (échec d'un `setItem` dans `activateProfile` avant le drapeau).
  - **R1 et R2 : CORRIGÉS et confirmés par Codex (`326f838`, 01/11/2026)** : une opération ne retient que ses propres écritures ; un réalignement incomplet ou un retour arrière refusé pose la panne ; un conflit réaligné puis une reprise réussie sauvegardent sans rechargement. **La réserve « un seul onglet » est levée.** R3 reste documenté (identifiants dupliqués, théorique, hors périmètre).
- **Décision de l'utilisateur du 01/11/2026 sur la clôture** : l'étape 2 se termine sur **P02, P03, P08, P09**, puis **une seule vérification finale ciblée** de Codex sur ces quatre cas. Les autres constats restent documentés et seront planifiés séparément, **sans devenir des prérequis** de la clôture. La clôture précisera ce qui est corrigé et les limites restantes.
  - **Déjà livrés au-delà de ces quatre** (décision précédente du même jour) : P01, P04, P05, P06, P07, T01, T02, T03, T11, T12, T14 — en production, testés, **non couverts par la vérification finale ciblée** (limite à écrire dans la clôture).
  - **Décision de l'utilisateur du 01/11/2026 sur les constats documentés** (séparée de la clôture : **aucun nouveau prérequis**, on termine d'abord P03 et P08) :
    - **À planifier (corrections séparées)** : **T04** (marqueur `{}` → réglage Fumel / modèles réinitialisés), **T05** (élément abîmé → plantage du chargement ou du rendu), **T09** (libération groupée de créneaux partielle), **T10** (journée ouverte sans sa pause déjeuner), **T16** (copie refusée par le navigateur mais enregistrée avec « Copié ! »), **T17** (dernier formulaire `null` → chargement bloqué). Ordre et date non fixés.
    - **Risques résiduels acceptés et documentés** : **T06** (après un échec d'enregistrement, une variable ou un modèle ajouté reste affiché sans être enregistré), **T07** (idem pour le calendrier et les délais de relance : écran ≠ stockage), **T08** (création refusée : la saisie en cours est effacée, rien d'enregistré n'est perdu), **T13** (sauvegarde GitHub réussie mais écriture locale refusée : deux messages contradictoires), **T15** (écritures auxiliaires sans contrôle : thème, marqueur du rappel quotidien, jeton, **compteur de mandats**). **Risque explicite de T15 : le compteur de numéros de mandat est écrit sans relecture (`generateMandatNum`, `localStorage.setItem('ess-mandat-counter')`) ; si cette écriture est perdue en silence (stockage plein ou refusé), un numéro de mandat peut être réutilisé pour un autre bénéficiaire.** À vérifier à la main sur les mandats émis en cas de doute ; non lié au correctif P07 (qui concerne le changement de bénéficiaire, pas la perte du compteur).
    - **Autres constats documentés, non tranchés** : P10 (formes ICS, étape 3) ; partiels de Codex hors périmètre : P07 (archiver sans télécharger garde le numéro du précédent), T03 (permanences d'un autre profil lues par `ls` dans `ensureDayOpenFor`), T14 (échec d'un `setItem` dans `activateProfile` avant le drapeau) ; R1 à R3 (voir ci-dessous).
- **Consigne « ne lancer ni RGPD — Rétention, ni import JSON, ni Restaurer depuis GitHub » : LEVÉE sans réserve le 01/11/2026** (R1/R2 confirmés par Codex, `326f838`).
- **Étape 4 d'AG-013 : CLOSE le 01/11/2026**, confirmée par Codex (`326f838`, vérification ciblée R1/R2 et AG-014, sans amendement). Livré : table `STATUTS` et `estLibere()` (`7c47a29`), garde de type (`347ce40`), (B) « Statut à vérifier » (`786a010`), (C) RDV sans heure (`daef050`), R1/R2 complétés (`347ce40`), décisions de l'utilisateur (Annulé hors de la tendance, 🙏 pour Excusé). Hors périmètre noté : (C) absent du bilan et des archives (étape 6).
- **Étape 5 d'AG-013 : CLOSE le 01/11/2026**, confirmée par Codex sans amendement ((A) `0d4277d`, (B)/(C) `546e421`). Livré : fonctions communes `personnesDistinctes`, `compterCanaux`, `aRelanceRenseignee` (`ea7d537`) ; « Fiches préparées » au jour de première préparation, non-mesurables comptés à part, canal inconnu à part, relances au mois du RDV (M1), canal/type du dernier message avec limite (M2, M3), « Délai moy. RDV » retiré, limite nom + prénom écrite (`76f13fc`) ; liste des usagers = tuile (`32812ba`). Hors périmètre : archives (étape 6, `avgRdv` et `byMonth` encore calculés à l'ancienne, même pour une archive neuve). **Contrôle visuel reporté à la fin du chantier AG-013** (décision de l'utilisateur du 01/11/2026 ; ne pas le redemander à chaque étape). **À regarder alors** : Statistiques → bloc « Fiches préparées » (baisse sur les longues périodes, nombre de non-mesurables sous le titre), carte « Délai moy. RDV » disparue, liste ouverte depuis « RDV réalisés », ligne sous « Personnes accompagnées » dans le bilan imprimé. **Prochaine étape : 3** (identifiants, `ts`, dates du jour en heure de Paris ; bloc AGORA critère 1 obligatoire), puis 6.
- **Étape 3 d'AG-013 : CLOSE le 01/11/2026** (AG-016 tranché). Livré et en ligne : date du jour à Paris partout (`jourParis`, `anneeParis`, `parisHeureHHMM`), lecteur unique de `ts` (`lireTs`/`afficherTs`), **`ts` des nouvelles fiches en ISO avec le décalage de Paris** (`tsParis`), **`id` des nouvelles fiches** (`nouvelIdFiche`, sans migration), anti-doublon par `cmsKey` (D3). Codex : (A), (B), (D), D3 confirmés, format de (C) confirmé ; condition de transition remplie selon l'utilisateur (01/11/2026 à 13:16 : postes fermés puis rouverts, non vérifié par Claude). Hors AG-016, non traités : T03, P10.
- **Étape 6 d'AG-013 : bloc AG-017 OUVERT le 01/11/2026** (critères 7, 1 et 6, contradicteur Codex), **aucun code écrit**. Proposition : nouvelles archives seulement, méthode et date d'arrêt, chaque indicateur à sa date, taux avec leurs termes et exclus, export de contrôle anonymisé. Défauts mesurés E1–E7. **Attendus** : réponse de Codex ; choix de l'utilisateur sur Q1 (personnes), Q2 (délai RDV), Q3 (non pointés), Q4 (données jamais affichées).
- **Méthode qui a fait ses preuves** : chaque correctif a son test exécutant les vraies fonctions (`scripts/check-*.js`, lancés en UTC et Europe/Paris par `deploy.yml`) et des mutations sur une copie (`INDEX_HTML=<copie> node scripts/check-…`) ; ne jamais faire `git rebase` de la branche de session sur `main` avant un push (deux commits de preuve ont déjà été rejoués sur `main` ainsi) — vérifier `git merge-base --is-ancestor origin/main HEAD` puis `git push origin HEAD:main`.
- **Ordre décidé par l'utilisateur le 31/10/2026 : étapes 4 et 5 avant l'étape 3** (après la clôture de l'étape 2). Description d'origine : étape 3 (identifiants RDV/CMS/profil, lecteurs de `ts` compatibles ISO avant tout changement d'écriture, dates du jour en heure de Paris — bloc AGORA critère 1 obligatoire), puis 4 (table des statuts), 5 (calculs partagés, bloc critère 7), 6 (archives recomptables). Les six décisions métier de l'utilisateur (cible future) sont en fin de `docs/indicateurs.md`.
- **Hors code, côté utilisateur** : script de configuration collé dans l'environnement « Micky » (hook de déploiement vérifié dans une session neuve) ; à coller aussi sur le second compte. Une vraie sauvegarde a été envoyée à Claude par erreur le 31/10 : auditée sans lecture puis supprimée de la session ; rappel : n'envoyer que le rapport anonymisé d'`audit.html`.

Carnet de reprise : ce qu'une session sans historique doit savoir pour
continuer. Mis à jour à chaque avancée, pas en fin de session. Une tâche
terminée **sort** de ce fichier ; seul ce qui ne doit pas être défait remonte
dans « Points à ne pas défaire ».

## En cours / à confirmer

- **Fiabilisation des statistiques (AG-013, validé le 31/10 avec les amendements de Codex)** : une étape par livraison, chaque commit soumis à Codex avant la suivante.
  **Étape 0 — close le 31/10 : confirmée par Codex** (après un premier « amendé » sur les compteurs animés, traité en `75c0607`) : `scripts/check-affichage.js` vérifie les couples chiffre/libellé de Statistiques et du bilan et exécute l'animation réelle des compteurs (fin et restauration avant impression) ; `deploy.yml` bloque Pages si un test échoue (essai réel : run `41233467863`). 9 mutations rejetées en UTC et Europe/Paris ; `index.html` inchangé. **Étape 1 — close le 31/10 : confirmée par Codex** (après deux « amendé » traités : sorties sans aucune valeur du fichier, CMS en « CMS n°k », statuts libérés stricts, manques « non comparé », démarches comparées, définitions rectifiées) ; détail : `docs/indicateurs.md` (chaque indicateur tel que calculé, avec sa ligne de code ; **six choix métier tranchés le 31/10** en fin de fichier, inscrits comme cible future (personnes nom+prénom provisoire avec limite écrite ; « Statut à vérifier » ; RDV sans heure comptés et exclus affichés ; « Fiches préparées » à la première préparation, sans date reconstruite ; délai depuis le dernier message retiré ; archives : chaque indicateur suit sa date, anciennes inchangées) — à appliquer aux étapes 4 à 6 avec blocs AGORA) ; `audit.html` + `scripts/audit-sauvegarde.js` (sauvegarde lue dans le navigateur, rien d'envoyé ni d'enregistré ; 16 types d'anomalies, réattributions distinguées des doublons, recomptage indépendant comparé au bilan de l'application, rapport anonymisé) ; `scripts/check-audit.js` ajouté au job de tests (8 mutations rejetées). Essayé dans Chromium avec un fichier fictif : 22 valeurs comparées, 0 écart, aucun nom affiché, pas de débordement à 390 et 1280 px. **À faire par l'utilisateur** : ~~trancher les six définitions~~ (fait le 31/10) ; ~~lancer l'audit~~ **fait le 31/10** sur l'export du profil Michel (212 fiches dont 37 blocages, 37 permanences, 11 CMS, aucune archive) : **176 valeurs du bilan comparées, 0 écart** avec le recomptage indépendant ; `ts` toujours au format français (175) ; 16 créneaux réattribués (normal) ; **12 anomalies** : 9 relances de provenance incertaine (date antérieure au 26/10 sur « Pas de retour », à garder telles quelles), 2 fiches dont `selectedCMS` désigne un autre CMS que leur nom, 1 `selectedCMS` sans correspondance — confirme qu'il ne peut pas servir seul de référence historique (étape 3). Aucune date impossible, aucun statut vide, aucun doublon, aucun CMS écrit de plusieurs façons. Fichier réel transmis à Claude par erreur, audité sans lecture puis supprimé de la session ; rapport anonymisé hors dépôt. **Écart d'historique (31/10)** : un rebase a rejoué sur `main` les deux commits de preuve du blocage (`a517ef2` assertion cassée, `60dee72` annulation) ; contenu net nul, poussés avec `8f3926f` en un seul push (un seul déploiement, sur `8f3926f`) ; historique non réécrit (pas de force-push) : `scripts/check-affichage.js` (tuiles de Statistiques extraites d'`index.html` et rendues avec un DOM minimal, tuiles et total du bilan, suivi des relances, valeur finale des compteurs ; 7 mutations de raccordement rejetées) ; `deploy.yml` : job `tests` (syntaxe JS + 3 scripts en UTC et Europe/Paris) dont dépend la publication ; premier passage sur `main` vert (`fc0b8d2`, Pages ✅) ; **blocage essayé en réel** : assertion cassée exprès sur la branche de session, run `41233467863` → tests en échec, déploiement sauté, commit annulé ensuite. Aucun calcul ni donnée modifiés.
  **Étape 2 — close le 01/11/2026, confirmée par Codex** : voir la passation en tête de fichier (corrigé, confirmé, limites, risques acceptés). Détail : `git log` (commits `fix:`/`test:` du 31/10 et du 01/11) et `AGORA.md` via `git log -p`.
  Étapes suivantes : (1) définitions des indicateurs + audit en lecture seule sur une copie figée de la sauvegarde ; (2) écritures cohérentes mémoire/stockage avec retour à l'état antérieur, archive relue (l'archive attendue) avant purge, aucune sauvegarde auto ni message de succès après échec, dédup planning date+heure+nom+prénom+CMS normalisé+profil — ne pas attendre la fin de l'audit ; (3) identifiants RDV/CMS/profil, inventaire des lecteurs/écrivains de `ts` (`timeAgo`, 2845, 2860, 2869, 2906, 3576, 3940, `delaiRdvJours`), équivalence ISO/français autour de minuit Paris et des changements de mois/année, stabilité après migration répétée, réimport, restauration, profils isolés, conflits id/nom de CMS signalés sans arbitrage — bloc AGORA (critère 1) ; (4) table des statuts distinguant « réservation libérée » et « place disponible aujourd'hui », titulaire actif, Annulé/Excusé au dénominateur, Réalisé+Lapin possibles sur un créneau ; (5) calculs partagés, calendriers propres à chaque indicateur — bloc AGORA (critère 7) ; (6) archives avec méthode, version, numérateurs, dénominateurs, exclusions, inconnus, date d'arrêt, export de contrôle anonymisé ; anciennes archives sans reconstruction.
- **Bilan mensuel du 31/10 — impression à confirmer** : fonctionnement validé par l’utilisateur (« C’est bon ça fonctionne »), retour global sans détail par appareil ni validation explicite d’Imprimer / PDF. AG-012 confirmé par Claude et clôturé sur le périmètre déjà autorisé ; aucun correctif demandé. Le rendu stylé dans l’application et l’impression réelle n’ont pas été mesurés par le contradicteur (page de mesure sans CSS). Garder l’intitulé « RDV avec relance renseignée » et les limites imprimées sur les anciennes dates automatiques.
- **Capacité des demi-journées** (22/10, déployée et validée) : 3 places par demi-journée, 6 par journée
  complète (le 4 novembre est partagé entre deux lieux). `statsRdvModel.assignedHalf` identifie la moitié
  ouverte ; indispo 12:30 de pause exclue d'une matinée, un vrai RDV 12:30 reste compté.
- **« Traitées le jour même »** = estimation sur les anciennes fiches, à ne pas confondre avec la préparation horodatée.
- **Validé par l'utilisateur le 30/10 (« tout est ok »)** : rappel d'export, signatures par profil et import Orientations
  « Villeneuve/Lot », alerte « Libérer ? », bilan mensuel, lien date/lieu → Agenda, barres « Prochaines permanences »,
  stat des Relances. **Relecture des démarches libres du bilan (AG-004) : déclarée faite par l'utilisateur le 30/10, non vérifiée par
  Claude.**

## Contrats à conserver

### Préparation moyenne (go du 22/10)
- **Préparation moy. (lun.–ven.)** = écart `dateReception` → `premierePreparationAt` (instant ISO avec fuseau,
  converti en jour Paris). Réception exclue, préparation incluse ; même jour = 0, vendredi → lundi = 1 ;
  week-ends exclus, **fériés inclus** ; une décimale ; « Le jour même » si 0 ; zéro mesurable → « — ».
- Seule une vraie première préparation (Générer/copie) initialise l'instant ; `addHistory` le conserve aux
  régénérations. Aucun remplissage rétroactif depuis `ts` ; anciennes fiches déjà préparées : non mesurables
  (compteur explicite).
- `receptionDateFor` reprend l'ancien `dateDemande` si `dateReception` est absente ; une `dateReception`
  présente, même vide, prime. **Constat terrain (22/10) : la majorité des orientations est traitée le jour
  même** : reprise maintenue, ne pas rouvrir sans donnée réelle contraire.
- Moyenne et couverture : même population (CMS et période au jour de première préparation). Champs conservés
  par JSON/sauvegardes, exposés par le CSV ; agrégats annuels dans `preparationMetrics` (unité/version) ;
  `avgReact` inchangé, présenté comme estimation. Contrat additif, AG-002 tranché le 30/10.
- **Réactivité estimée** : tuile pour les fiches sans `premierePreparationAt`, réception → `ts` en jours
  ouvrés, **médiane** (`ts` est réécrit à chaque régénération) ; relances exclues ; « N % — Traitées le jour
  même » + médiane en note. Calcul d'affichage, rien de stocké.
- **Infobulle de la tuile « Préparation moy. (lun.–ven.) »** (30/10, demande utilisateur, **testée et validée par l'utilisateur le 30/10**, ce qui valide aussi la durée des infobulles au toucher) : définition en mots simples (jours ouvrés, réception exclue, préparation incluse, seules les fiches horodatées).
- Tests : `node scripts/check-reactivity.js`, `node scripts/check-stats-rdv.js`.
### Statistiques
- En tête : RDV réalisés, RDV de la période, usagers accompagnés, places à
  venir, concrétisation, lapin. Période/CMS appliqués au **jour du RDV** ; les
  messages restent filtrés au jour de génération. « Tout » garde les RDV à venir.
  Taux : uniquement RDV ≤ jour courant ; Annulé/Excusé au dénominateur, jamais
  au numérateur.
- Graphe mensuel empilé à sept statuts + tableau « Voir les données ».
- Places : base explicite de 6 créneaux/journée, 3/demi-journée ; libre =
  max(0, capacité − réservés − bloqués) ; dépassement garde le vrai nombre
  (`7/6`) sans disponibilité négative ; Annulé/Excusé/Lapin/Pas de retour
  libèrent la place. Couleurs : Réservé vert, En attente rose, Bloqué gris
  foncé, Disponible case vide (mêmes classes CSS que les repères).
- **Places libérées le jour même** (23/10, validé le 23/10) : le jour courant, un créneau
  Lapin/Excusé/Annulé/Pas de retour n'est **pas** une place disponible (non réattribuable) : il reste
  compté, coloré par son statut, et le résumé le dit (« 2 lapins · 1 place disponible »). Critère = la
  date du jour, pas l'heure. Réattribué → titulaire actif → repasse en réservé. Jours futurs : libération
  immédiate. **Cases en ordre chronologique**, tous types mêlés, pauses comprises ; les places
  disponibles (sans heure) finissent la barre (`marks`/`markInfo` dans `statsRdvModel`). **Infobulle par
  case** : heure · statut · nom prénom · démarche, au survol et au toucher (`#stat-tooltip`) ; pas d'accès
  clavier. Texte de dépassement : date et lieu rappelés. **Heures libres** (26/10, choix utilisateur : adapter cet écran plutôt
  qu'ajouter une fonction) : « Libres : 11:30 13:30… » sous chaque journée (`freeHours`, mêmes créneaux que les tuiles libres
  de l'Agenda) ; chaque heure ouvre Messages sur ce créneau (`openMessagesOnSlot`).
  **Cases occupées cliquables** (26/10) : RDV → fenêtre de l'Agenda (`agenda-rdv`, modification), créneau bloqué ou
  pause → « Libérer ? » ; `S._lastModal` rafraîchit les stats (défilement conservé) à la fermeture de la fenêtre.
- **Lapins par permanence** (validée) : journées passées avec ≥1 lapin ; « 2/6 » = **créneaux** avec lapin / créneaux de la journée (pas les fiches) ; 10 plus récentes.
- **Délai moyen RDV par CMS** (22/10) : par CMS (chiffre seul si un CMS), jours civils `ts` → RDV ; archives globales.
- **Taux de remplissage** (30/10, demande utilisateur ; **validé par l'utilisateur le 30/10**, demi-journée Saint-Pardoux comprise) : créneaux attribués échus / places, journée = date + CMS avec
  ≥1 RDV daté d'une heure ; **6 places, 3 pour une demi-journée** (Saint-Pardoux, `placesJournee` → `assignedHalfOf`, même règle que les places
  disponibles, d'après la permanence enregistrée ; sans permanence : 6, `sansPerm`). **Remplissage net** (30/10, **validé le 30/10**) : créneaux non libérés (≥1 fiche ni Lapin/Excusé/Annulé/Pas de retour) / même base ; tuile de Statistiques seulement (retiré du bilan par AG-011). Limites : journée sans RDV non comptée, tous statuts
  comptés pour le remplissage brut, peut dépasser 100 %. Pas d'AGORA : calcul d'affichage, rien de stocké.
- **Animation des graphes de Statistiques** (30/10, demande utilisateur : « à la façon des bilans de NEWGEN », **validée le 30/10**) : barres, graphique mensuel et heatmap se dessinent
  en 800 ms (décélération `cubic-bezier(.215,.61,.355,1)`) quand la carte apparaît (≥ 20 % visible) et rejouent à chaque retour (`animerGraphesStats`, classe `ui-anim-pre`) ; tuiles en glissement
  décalé et **compteurs de tous les chiffres** (tuiles, statuts, valeurs des barres, y compris décimaux et « n / total (x %) ») qui montent de 0 à leur valeur en 800 ms à l'arrivée à l'écran et au retour (`compterNombre`) ; rien en mouvement réduit ; à l'impression valeurs finales (`beforeprint`). **Sans ECharts** (dépendance de ~1 Mo refusée dans un fichier unique : critère 1 d'AGORA si l'on y revient).
- **Bilan mensuel simplifié : une seule base, les rendez-vous enregistrés** (30/10, consigne de l'utilisateur ; **validé le 30/10**, **AG-011 tranché le 30/10, Codex « confirmé »** ; AG-009 et AG-010 rangés) : le bilan ne donne plus que
  rendez-vous du mois et réalisés, personnes accompagnées, répartition par statut (n / total · %, ligne Total, note sur les arrondis, Confirmé/En attente masqués à 0), démarches, rendez-vous par CMS.
  **Retirés du bilan** : taux de concrétisation, lapin, remplissage brut/net, phrase de lecture, créneaux par CMS. 4 infobulles ⓘ à l'aperçu (jamais imprimées) ; **au toucher, une infobulle reste 6 à 15 s** (selon la longueur), au-dessus du doigt, masquée par un toucher ailleurs (`attachPermanenceTip`, aussi pour la heatmap et les permanences ; validé le 30/10 avec l'infobulle de la préparation). Concrétisation, lapin et remplissage
  **restent dans Statistiques** (créneaux, décision du 23/10) ; données et archives inchangées. Test : les statuts totalisent les rendez-vous du mois.
- **Suivi des relances dans le bilan (31/10, demandé puis fonctionnement validé par l’utilisateur, AG-012 confirmé par Claude et clôturé)** : deux chiffres dominants (personnes accompagnées, RDV réalisés), total tous statuts secondaire ; suivi et démarches avant les statuts, puis CMS et sources. **Usage confirmé : une seule relance par RDV avant libération**, donc pas de journal de relances multiples. `monthlyReportData.followup.recorded` compte une fois chaque RDV de `total.entries` ayant `dateRelance` ou le type `relance`, comme le compteur existant de Statistiques mais sur **le mois du RDV** et le CMS du bilan (futurs du mois courant et indisponibilités exclus). Un RDV ensuite réalisé reste compté. Libellé **« RDV avec relance renseignée »** ; sources imprimées : copie ≠ confirmation d’envoi, anciennes dates automatiques sans provenance. Aucune date ni donnée corrigée par déduction. Tests du filtre, unité, recomptage indépendant, idempotence/lecture seule, anonymat et ordre du document ; mutation OU → ET rejetée. Démo : deux relances fictives, même rendu que la production. Données et archives inchangées ; taux par créneau et remplissages toujours hors bilan. Réponse externe Claude `07046f0` : confirmé, trois mutations rejetées, aucun correctif demandé ; rendu stylé et impression réelle non mesurés par cette revue.
- **Unités affichées** (25/10) : dans Statistiques, nombres = fiches ; taux = **créneaux attribués** (≥1 RDV ; libres et bloqués exclus) ; places = créneaux. « Traitées le jour même (estimation) » ≠
  « Mesure horodatée ». Compteurs : `compterNombre` (voir « Animation »). Le **bilan** ne compte que des rendez-vous enregistrés.
- **Date/lieu des permanences → Agenda** (25/10) : `ui-permanence-link` → `agendaScope='mine'`, `agendaTimelineDate` +
  `agendaFocusDay`, consultation seule ; validé le 30/10. **Badges rouge/orange de l'Agenda
  cliquables** : jour du **premier** RDV concerné (`badgeGo`, `stopPropagation`) ; le badge vert reste inerte.
- **Barres de « Prochaines permanences » (onglet Orientations depuis le 26/10) = créneaux dans l'ordre des heures** (26/10) : chaque case est un créneau réel
  (`cells` dans `statsRdvModel`, 12:30 exclu), la libre reste à sa place ; clic sur une libre → Messages (Générer) avec
  `S.date`, `S.commune`, adresse CMS et **l'heure de la case** ; brouillon conservé ; focusable. « Libres » sans 12:30.
  Ligne « N places … sur les 7 prochains jours » (détail par CMS) en tête de carte (26/10).
- **Relancé sans réponse ≥ 3 h → alerte « Libérer ? »** (26/10) : `tsRelance` (ISO, additif, posé à la copie de la relance ; sans lui,
  borne haute = fin du jour `dateRelance` ou mise en ligne du 26/10 11:40). `isSansReponse` : tuile qui clignote, « ⏰ Libérer ? »
  (→ « Pas de retour »), badge, bandeau, contrôle /60 s ; délai réglable (Configuration → Général, 1-72 h, défaut 3). Créneau
  libéré déjà relancé : « Relancé jj/mm » remplace « À nouveau libre ».
- **Signature par profil** (29/10) : « Michel Aswad » en dur dans les modèles est remplacé au remplissage (`fillTemplate`,
  `PROFILES[].signature`/`titre`) : Michel ASWAD, Cynthia PINEAU, Corentin TUAL, Eva CAPELLE ; « Conseillère » pour Cynthia et Eva. **Import Orientations** : CMS
  rapproché par mots (`cmsNomDansTexte`) : « Centre Médico-Social de Villeneuve/Lot » → Villeneuve-Sur-Lot.
- **Stat des relances** (AG-005, 26/10) : barre « Relances » (fiches à date ou type, 28/164 ; précision en infobulle), hors volume de messages ; plus de
  `dateRelance` d'office à « Pas de retour » ; archive annuelle : `relances`/`relancesSur`. Les 11 fiches déjà à « Pas de retour » gardent leur date.
- **Bouton « Aujourd'hui » de l'Agenda** (25/10) : ouvre une journée **avec RDV** (aujourd'hui, sinon la prochaine, sinon la dernière passée) ;
  vue semaine (PC) : la semaine en cours reste affichée si elle contient un RDV. Toast sur mobile quand le jour change.
- **Jour sélectionné marqué dans le bandeau de dates** (25/10) : `[aria-pressed="true"]` écrasée par `#pane-agenda .ui-ag-toolbar :is(button…):not(…)` (`!important`, 1,3,1) ;
  sélecteur renforcé (1,4,0). Même piège que le clignotement des tuiles : tout nouveau style de bouton de cette barre doit battre cette règle.
- **Pause déjeuner d'office** (25/10, demande utilisateur ; remplace « 12h30 compris » du 07/10) : entrée `indispo` « Pause
  déjeuner » à 12:30 sur chaque journée ouverte **à venir** (`applyLunchBreaks`), une seule fois (`pauseAuto` : une pause libérée
  ne revient pas) ; ni passé, ni archivée, ni 12:30 déjà pris. `statsRdvModel` l'ignore (`isLunchBreak`). Jours jamais ouverts :
  `getSlots` ne propose pas 12:30 (RDV déjà pris et « Autre heure » restent possibles). Pas d'AGORA : libérable en un clic.
- **Bilan mensuel imprimable** (25/10 ; « 📄 Bilan mensuel » en tête de Statistiques) : modale mois + CMS, « Imprimer / PDF ». `monthlyReportData` réutilise `statsRdvModel` ; vocabulaire « rendez-vous
  enregistrés » ; archives jamais mélangées. **Mois en cours (30/10, testé OK)** : rien après aujourd'hui, mention « chiffres arrêtés au JJ/MM » (`partiel`). **Audit Codex 26/10 (AG-004, amendé)** :
  20 sélections recomptées, écart 0 ; corrigé : fiches sans CMS/heure/statut/démarche, jour courant Europe/Paris (`parisDayStr`), CMS regroupés (`cmsKey`). Démarches libres reproduites telles
  quelles ; mention « à relire » retirée le 30/10 (l'utilisateur a relu les textes libres). Tests : `check-stats-rdv.js`.

### Statut Annulé (22/10)
- `annule` + `annulationMotif` facultatif, séparés d'Excusé ; créneau libéré, ni rappel ni relance ; rouge
  distinct d'Excusé ; ICS : CANCELLED, même UID. Compteur quotidien : créneaux libérés filtrés avant la
  priorité par type de message. Taux : Annulé au dénominateur comme Excusé. AG-001 tranché le 30/10 (contrat de données).

### Agenda
- Navigation seule (Précédent/Aujourd'hui/Suivant + titre) en barre sticky ;
  dates, recherche, filtres, Réserver défilent. Bandeau PC réduit à 52 px.
  « Rappels et points à traiter » et archives sont dans le menu ☰ (filtres fermés
  au départ). Journées uniquement bloquées absentes de la timeline.
- Timeline : une date à la fois ≤ 900 px, semaine en colonnes sur PC ; Matin
  (<13:00) / Après-midi (≥13:00) côte à côte ; les RDV enregistrés s'affichent, **et depuis le 25/10
  les créneaux libres** (tuiles pointillées « HH:MM Libre ＋ », demande utilisateur qui remplace celle
  du 19/10 de les retirer) ; « + Réserver » ouvre les disponibilités du profil actif.
  Créneau libre cliquable → `openMessagesOnSlot(date, CMS, heure)` (Messages, créneau prérempli) ;
  seulement sur **mon** agenda, jours **non passés**, ni archivée ni orpheline ; masqués quand un
  filtre nom/statut est actif (`data-ag-open-slot`). Chaque créneau libre porte un bouton 🚫 (motif demandé,
  `blockSlot`) ; les créneaux **bloqués** s'affichent en gris ardoise rayé (couleur « Bloqué » des stats) avec leur motif (« Sans motif » sinon), regroupés quand
  contigus de même motif, avec « 🔓 Libérer » (`releaseSlot`). Le bouton « Bilan mensuel » est agrandi (52 px).
- **Swipe de jour** (23/10, validé) sur `#ag-timeline-board`, vue compacte seulement : seuil 60 px horizontal / 40 px vertical, via `timelineMove()`.
  **Le geste de suppression par swipe sur une tuile est retiré** ; la suppression passe par la fiche RDV.
- Tuile entière colorée par statut (fond adouci clair, assombri sombre ;
  repli `color-mix()` sous `@supports`). Mode sombre : bordure `#6e8797`,
  fond `#182a35`, rail de statut 4 px. **« il y a N j » (jours depuis l'envoi, `dateDemande`) sur les tuiles « En attente » seulement, à côté de l'heure**
  (choix utilisateur 26/10) : masqué par la refonte du 19/10 sans décision, rétabli le 26/10 (`.ui-ag-meta`). Cartouche Relancer/Relancé de même hauteur que le statut.
- **Clignotement** : badges du menu (dépassement, à pointer) **et** tuiles
  `.ag-depasse`/`.ag-apointer`. La règle `#pane-agenda .ui-ag-slot{animation:none}`
  avait écrasé le clignotement des tuiles ; la règle de spécificité égale
  `#pane-agenda .ui-ag-slot.ag-depasse,…ag-apointer` le rétablit — **vérifier
  l'élément nommé par l'utilisateur, pas un voisin** (règle 38).
- **Onglet resté ouvert plusieurs jours** : `renderAgenda()` réinitialise
  `agendaTimelineDate`/`agendaFocusDay` quand le jour change
  (`S._agendaLastKnownDay`, en mémoire). Validé 20/10.
- Indice de défilement des onglets mobiles : dégradé 28 px, CSS pur, `max-width:760px`.
- Fiche RDV : panneau (bas sur mobile), identité/téléphone/démarche, statut modifiable, suivi repliable ; Préparer et
  Modifier en actions principales. La modification conserve le propriétaire ; la duplication passe par les disponibilités.
  **CMS modifiable** (30/10, `bddda87`, **validé par l'utilisateur** : « ça fonctionne ») : liste `S.secteurs`, `commune` +
  `selectedCMS` (vide si aucune adresse ne correspond), journée de destination ouverte (`ensureDayOpenFor`), contrôle
  « créneau déjà pris » sur le nouveau CMS. Import ICS : RDV `rdv` retenus par `getSlots` après les types prioritaires.

### Autres écrans
- **Modèles** : recherche (nom/type/contenu, sans accents) par masquage des cartes (`tplApplySearch()`), jamais de `renderTemplates()` à la frappe.
- **« ↺ Effacer » remet tout à zéro** (01/11/2026, demande de l'utilisateur) : y compris le dernier CMS et la dernière démarche mémorisés (`saveLast` dans `onReset`), qui revenaient au rechargement. Attention : l'aperçu démo réécrit ce mémo à chaque chargement (`ui-demo-data.js:107`), tester sur `index.html`.
- **Votre message** : bloc replié au départ (`details/summary`), choix ouvert/fermé en mémoire UI.
- **Configuration → Journées** (25/10) : sous-onglets « Ouvertes (N) » / « Archivées (M) » (`S.permView`) ; le
  bouton d'archivage RGPD reste dans « Ouvertes », « Restaurer » dans « Archivées ». **Règle d'archivage (25/10,
  choix utilisateur) : tout ce qui précède le 1er du mois en cours** (avant : > 60 jours), sauf journée avec RDV en
  attente ou à pointer. Aucune donnée supprimée. **Automatique au chargement du profil** (`archiveOldDaysCore(true)`, 25/10)
  + bouton ; une journée restaurée (`gardeOuverte`) n'est plus archivée d'office, le bouton reste manuel.
- **Import des orientations** : dialogue refondu ; le CMS ne filtre que l'affichage, l'import confirme toutes les lignes cochées ;
  Échap/croix/fond gardent le brouillon, Annuler l'abandonne. Parseur, stockage, déduplication inchangés.
- **Refonte UI** validée le 19/10 (`7f0205e`). Démo fictive : `python scripts/build-ui-preview.py --output-dir
  <dossier>` puis `demo-agenda-compact.html` (profil Michel) ; `scripts/ui-demo-data.js` n'y est chargé que là.

### Heatmap « Activité annuelle » (23/10)
- Compte des **créneaux de RDV** par jour (date, CMS, heure), **hors indisponibilités** (avant : « 16 RDV le 30/09 » pour 5 vrais RDV + 11 bloqués). Excusé/Annulé comptent
  encore (comme l'Agenda). L'archive annuelle (`arc.heatmap`) n'est pas touchée. Le CMS se regroupe par `cmsKey` (30/10).
- Mise en page (23/10, « ramassée ») : CSS grid qui remplit la carte, cases carrées ≤ 22 px, 10 px/semaine minimum (défilement sur écran étroit),
  mois sans chevauchement. **Semaine de 5 jours (L–V)** à la demande de l'utilisateur ; samedi/dimanche reviennent seulement si l'un porte un RDV.
- **Infobulle de la heatmap au toucher** (23/10, validée le 25/10) : cases sur `#stat-tooltip` via `attachPermanenceTip` (`data-tip`), `title` ne s'affichant pas au toucher ;
  les `mouseleave` émulés après un toucher sont ignorés 1 s. Vaut aussi pour « Prochaines permanences ».

## Chantiers bloqués ou arrêtés

- **Liaison SMS sans copier-coller** (21/10) : les vrais SMS sont indispensables. Aucun lien fiable de
  préremplissage Google Messages Web (ne pas inventer de paramètres `phone`/`body`). Piste SMSGate (appli
  Android) : son API n'a pas de CORS, il faudrait un relais serveur ; rien mis en place. Si retenu, soumettre
  dépendance/contrat à l'AGORA avant implémentation. WhatsApp : lien officiel, mais compte requis.
- **Espacements SMS** : arrêté à la demande de l'utilisateur après `45d182c` (rendu reçu insatisfaisant) ; ne pas annoncer le
  problème résolu. Acquis : une ligne vide max entre paragraphes, CRLF normalisés, e-mails inchangés ; rendu Google Messages réel à confirmer.

## Décisions à trancher

Toute entrée ajoutée ici dit si elle ouvre un bloc `AGORA.md` ou non, et pourquoi.

- AG-013 : tranché le 31/10 (plan validé avec les amendements de Codex), suivi dans « En cours » ci-dessus.
- AG-012 : clos, confirmé sans amendement, périmètre déjà demandé et fonctionnement déjà validé par l’utilisateur. Les limites de provenance sont conservées dans le contrat du bilan.

## Chantiers restants

- **Audit trimestriel du 01/10/2026 — jeton GitHub** : `ess-gh-token` est en
  `localStorage` sur l'origine `maswaddpt47-cmyk.github.io`, **partagée** avec
  NEWGEN, NextStep et GDINV2 : une faille d'injection dans l'une peut le lire.
  **Portée vérifiée le 23/10/2026** (page GitHub du jeton « SMS-mail backup »,
  fine-grained, créé le 21/07/2026) : elle couvrait *tous* les dépôts du compte,
  Contents en lecture/écriture, sans expiration. **Restreint le 23/10/2026 par
  l'utilisateur** à `sms-mail-multi-backups` seul ; sauvegarde testée OK après.
  **Reste** : à terme, domaine dédié pour ne plus partager le `localStorage`.
  L'absence d'expiration du jeton est un choix de l'utilisateur : ne pas la
  reproposer. **Écarté par l'utilisateur le 31/10/2026 (« oublie ») : ne plus le
  mentionner ni le lister dans les points ouverts**, sauf fait nouveau.

## Points à ne pas défaire

- **Audit Codex du 30/10/2026 des calculs (rapport `sms-mail-multi-backups/audits/2026-10-30-statistiques-bilan-mensuel.md`)** : corrigé, AG-006 tranché. Délai RDV en jours civils (`delaiRdvJours`),
  `cmsKey` pour tout filtre et regroupement CMS, début de période en date Paris, `usagerKey`, « jour même » = même date civile, `statutAffiche` (statut vide ou inconnu = en attente),
  dictionnaires sans prototype (`comptageDemarches`, `comptageTypes`). Remplissage : base fixe 6/3 (décision). Archives déjà calculées non recalculées. Tests en `TZ=UTC` **et** `TZ=Europe/Paris`.
- **Rappel de ménage de ce fichier** (23/10/2026) : `scripts/check-chantiers.sh`,
  hook `SessionStart` de `.claude/settings.json`. Signale >300 lignes, en-tête
  de plus de 7 jours, tâches ✅/barrées. Rappel seul, n'échoue jamais.
- **SMS-mail (solo) gelé le 20/10/2026** : plus de développement ni de portage,
  `check-drift.js` sans objet. La refonte UI n'existe que sur multi.
- **Publication** : push systématique sur `main` (consigne du 20/10, `AGENTS.md`
  et `CLAUDE.md`).
- **Aucune donnée d'usager dans un repo public**, même temporairement. Les
  sauvegardes partent vers le repo privé `GH_REPO='maswaddpt47-cmyk/sms-mail-multi-backups'`.
- **Rétention RGPD** (`archiveYear`) : supprime le détail nominatif d'une année
  révolue après agrégation anonymisée — irréversible, confirmation obligatoire.
- **Cloisonnement par profil** : toute donnée d'usager passe par `ess-<profil>-…`
  (`pk`/`pkFor`) ; une migration ou un archivage ne touche aucune clé d'un autre
  profil.
- **Alerte « À pointer »** (`isAPointer`/`aPointerList`, 15/10) : RDV `confirme`
  passé → pastille orange, bannière 📌, filtre. `archiveOldDays` n'archive pas
  une journée qui en contient. Pointage en un clic (`pointerStatut`, écrit dans
  l'historique du bon profil). La bannière et le compteur suivent la portée
  (Mon agenda / collègue / Tous) ; rappels, doublons et dépassements restent
  ceux du profil connecté. Sélecteur multi-profil validé le 10/10.
- **Calendrier « à la volée »** validé en conditions réelles le 28/09. **Doublons
  de fiche** (23/09, 05/10) de cause non identifiée : `addHistory` dédoublonne par
  date+heure+commune+nom+prénom. Une 3e occurrence passe le critère AGORA 3.
- **Un champ de saisie ne déclenche jamais un rebuild complet du formulaire
  pendant la frappe** (« Autre heure », `nomIn`) : `onInput` =
  `regen()+updatePreviewOnly()`, reconstruction à `onBlur`.
- **Grille des créneaux** (07/10, **révisée le 25/10/2026**, AG-003 clos le 26/10, tranché par l'utilisateur) : matin 9h30, 10h30, 11h30, 12h30
  (`DEBUT_GRILLE` dans `getSlots()` ; `debut:'09:00'` = ancien défaut) ; **après-midi = 3 créneaux d'1 h** à partir du
  `debutApresMidi` du CMS (défaut 13h30 ; **Fumel 14h00**, posé une fois au chargement, réglable dans Configuration →
  CMS). **Le 16h30 est retiré pour tous**. RDV hors grille affichés ; **un créneau libre qu'il chevauche est masqué** (28/10, Saint-Pardoux
  14:00/15:00/16:00 ; `slots.masquees`, la capacité de la barre Stats suit).
  Vider le champ rétablit 13h30 ; `assignedHalf` suit la grille du CMS (`afternoonGridHours`). **Grille, pause déjeuner d'office, sous-onglet Archivées et archivage automatique : validés par l'utilisateur le 25/10/2026.**
- **Une journée s'ouvre sur la grille standard (09:30-16:30)**, jamais sur
  l'heure du RDV déclencheur (`ensureDayOpen`/`migratePermanences`, AG-001 du
  27/09).
- **Un RDV déplacé depuis l'Agenda ouvre sa journée de destination**
  (`ensureDayOpen`, 08/10) ; tout nouveau chemin qui change date ou commune doit
  faire de même. Journée fermée avec RDV = orpheline, voulu (bouton « Ouvrir cette
  journée »). Le déplacement vérifie le créneau d'arrivée (confirmation, jamais
  bloquante).
- **Rappels de la veille et doublons** (`renderRappelsEtDoublons`, 10/10) :
  RDV actifs du prochain jour ouvré, modèle `sms_rappel_veille`, « ✓ Envoyé »
  via `h.rappelVeille`. Doublons : même personne/jour/commune, 30 derniers jours
  et à venir.
- **Téléphone : jamais de troncature silencieuse** (07/10) : `telProblem()` →
  message rouge permanent sous le champ de Générer + confirmation dans
  `handleGenerate` ; même contrôle à l'import Orientations. Origine du numéro
  tronqué `00 76 …` jamais identifiée : à creuser au prochain cas, fichier
  source sous les yeux.
- **Double réservation : confirmation explicite** (01/11/2026, **testé et validé par l'utilisateur le 01/11** : créneaux pris en rouge, seul 14:30 sélectionnable, « pas de conflit » ; signalé par l'utilisateur : heure choisie AVANT le CMS → aucun contrôle, simple toast à la génération, RDV existant masqué dans l'Agenda). `confirmerCreneau` au choix du CMS, au choix de la date et dans `handleGenerate` ; refus = rien d'enregistré (heure vidée au choix du CMS ou de la date). Averti, pas bloqué (règle du 02/10). **Liste d'heures « à l'aveugle » retirée** (demande de l'utilisateur, 01/11) : avant la date et le CMS, un message remplace la liste 07:00–19:30 ; ensuite la grille, qui grise et bloque les créneaux pris. **Limite acceptée par l'utilisateur (01/11)** : l'Agenda n'affiche qu'une fiche par créneau (`getSlots`) ; les doubles réservations restantes (confirmation acceptée, modification depuis l'Agenda, imports ICS/planning, deux onglets) sont rares. `audit.html` les signale (« Deux RDV actifs sur un créneau » ; aucun sur l'export du 31/10). Badge « ⚠️ 2 RDV » : piste en attente.
- **Dates et `ts` (AG-016, 01/11/2026)** : la date du jour est `jourParis()` (jamais `toISOString().slice(0,10)` ni l'heure de l'appareil) ; tout lecteur de `ts` passe par `lireTs`/`afficherTs` ; les nouvelles fiches écrivent `ts` par `tsParis()` (ISO **avec le décalage de Paris**, pas `Z` : une ancienne page lit la date de Paris en tête de chaîne) ; le `ts` des mandats reste en texte français ; anciens `ts` jamais réécrits. **`id`** : donné aux seules nouvelles fiches, jamais écrasé ; localisateurs : repli vers une unique fiche ancienne sans `id`, jamais une autre fiche identifiée. Tests : `check-stats-rdv.js`, `check-ecritures.js`.
- **Formule de dépassement/relance centralisée dans `isDepasse()`** : ne pas la
  réécrire en ligne ailleurs.
- **Migrations localStorage** : une migration non testée a déjà réduit 11 CMS à
  6. Toute migration délicate mérite un test ciblé avant commit.
- **Commune de « Ouvrir une journée » = liste déroulante**, pas un champ texte
  (une faute de frappe créerait une journée invisible).
- **Rappel d'export « N messages non sauvegardés »** (30/10, `e28931f`) : toutes les 5 fiches, seulement sans jeton GitHub
  ou si `gh-last-backup` > 24 h ; `since-export` retombe à 0 après export JSON **ou** sauvegarde GitHub. Validé le 30/10.
- **Rétention des sauvegardes GitHub : 30 jours** (`GH_BACKUP_RETENTION_JOURS`) ;
  `ghCleanOldBackups()` garde toujours la plus récente.
- **Changer d'onglet re-rend son contenu** (`stats`/`agenda`/`orientations`/
  `generate`) ; tout nouvel onglet a besoin du même branchement explicite.
- **Deux usagers sur le même créneau** (02/10) : « Autre heure » avertit par
  confirmation nommant l'occupant ; `slot.replaced` rendu aussi quand le titulaire
  est libéré ; entre usagers tous libérés, le plus récent l'emporte (`matches`
  garde l'ordre de `S.history`, récent d'abord — s'y appuyer pour tout tri).
- **`fillTemplate` réduit tout saut de ligne triple en `\n\n`** (19/10) : démarche
  sans documents (« Autre »).
- **Taux de concrétisation et de lapin PAR CRÉNEAU — décision utilisateur du
  23/10/2026**, qui remplace le comptage par fiche du 27/09 : un créneau (date,
  CMS, heure) vaut un RDV même s'il porte plusieurs fiches (libéré puis
  réattribué) ; « réalisé » s'il porte ≥1 fiche Réalisé, « lapin » s'il porte ≥1
  fiche Lapin (cumul possible) ; dénominateur = créneaux datés ≤ jour courant,
  hors bloqués. `slotRates()` ; appliqué aux KPI et à `computeYearArchive`
  (nouvelles archives seulement ; **archives déjà calculées non recalculées**,
  elles gardent l'ancien comptage par fiche). Sur la sauvegarde du 23/10 :
  concrétisation 66 % → 73 %, lapin 9 % → 10 %. « RDV réalisés » et « RDV sur la
  période » restent des nombres de fiches. Pas de bloc AGORA : c'est l'utilisateur
  qui tranche explicitement, pas une proposition de Claude contredisant la note.
  Courbe Lapin/Excusé/Pas de retour toujours rattachée au **mois du RDV**.

## Pistes d'amélioration

Règle 22 de MD-LIB dans `CLAUDE.md` ; ne pas reproposer une piste écartée sans fait nouveau.
26/10 : places libres 7 jours **faite** ; rappel RDV en attente **déjà existant** ; « Prochaines permanences » **déplacée vers Orientations** (`buildPermanencesCard`).

**En attente** : 01/11/2026 — badge « ⚠️ 2 RDV » sur une tuile d'Agenda portant deux RDV actifs, les deux fiches listées à l'ouverture. Problème : une double réservation masque l'autre RDV. Choix recommandé : ne le faire que si une double réservation réelle réapparaît (bloc AGORA, critère 7, s'il touche « N rendez-vous »). Différé par l'utilisateur : cas rares depuis le retrait de la liste d'heures.

**Écartées** (date — piste — raison)
- 01/11/2026 — statut « Réalisé » revenu à « Confirmé » sur une fiche (signalé), hypothèse non vérifiée : restauration GitHub d'une sauvegarde plus ancienne d'un autre appareil (la restauration remplace tout l'historique) ; pistes « avertir avant restauration » / « fusion » — laissé de côté par l'utilisateur. À rouvrir si le cas se reproduit, avec l'appareil et la restauration en cause.
- 10/10/2026 — file « à reporter » (CR / Coop), fiche Coop et résumé CR prêts à copier — l'utilisateur les fait dans la foulée
  de chaque accompagnement ; à ne reproposer que si un import (CSV/API) supprimait une saisie.
