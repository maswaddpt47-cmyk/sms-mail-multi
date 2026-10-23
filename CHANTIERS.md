# CHANTIERS — sms-mail-multi

État au **23/10/2026**, base `main`. Ménage du fichier fait le 23/10 : 753 → ~250 lignes ; le récit des tâches terminées est dans `git log` (ancienne version : `git show 9cf8cfb:CHANTIERS.md`).

Carnet de reprise : ce qu'une session sans historique doit savoir pour
continuer. Mis à jour à chaque avancée, pas en fin de session. Une tâche
terminée **sort** de ce fichier ; seul ce qui ne doit pas être défait remonte
dans « Points à ne pas défaire ».

## En cours / à confirmer

- **Capacité des demi-journées** (22/10) : le 4 novembre est partagé entre deux
  lieux → **3 places par demi-journée, 6 par journée complète**. Corrigé et
  vérifié (harnais Node + Chromium 390 px/1280×720). Reste : confirmer le
  déploiement Pages du commit dans GitHub Actions. `statsRdvModel.assignedHalf`
  identifie la moitié ouverte ; indispo 12:30 de pause exclue d'une matinée, un
  vrai RDV 12:30 reste compté. Grille Agenda et données stockées inchangées.
- **Prochaines permanences / Places disponibles à venir** : remplacent le
  pourcentage de remplissage (jugé peu compréhensible). Le comptage réel et
  l'appréciation visuelle de l'utilisateur restent à confirmer.
- **« Traitées le jour même »** = estimation sur les anciennes fiches (pas une
  mesure) ; ne pas la confondre avec la métrique horodatée de préparation.

## Contrats à conserver

### Préparation moyenne (go du 22/10)
- **Préparation moy. (lun.–ven.)** = écart entre `dateReception` et
  `premierePreparationAt` (instant ISO avec fuseau, converti en jour Paris).
  Réception exclue, préparation incluse ; même jour = 0, vendredi → lundi = 1 ;
  week-ends exclus, **fériés inclus** ; une décimale ; « Le jour même » si 0.
- Seule une vraie première préparation (Générer/copie) initialise l'instant ;
  `addHistory` le conserve aux régénérations. Aucun remplissage rétroactif
  depuis `ts`. Fiches anciennes déjà préparées : non mesurables (compteur
  explicite) ; zéro mesurable → « — ».
- `receptionDateFor` reprend l'ancien `dateDemande` si `dateReception` est
  absente ; une `dateReception` présente, même vide, prime. **Constat terrain
  (22/10) : la majorité des orientations est traitée le jour même**, donc cette
  reprise est maintenue — ne pas rouvrir sans donnée réelle contraire.
- Population identique pour moyenne et couverture : CMS et période au jour de
  première préparation. JSON/sauvegardes conservent les champs ; CSV les expose ;
  agrégats annuels dans `preparationMetrics` (unité/version) ; ancien `avgReact`
  inchangé, présenté comme estimation. Contrat additif soumis à l'AGORA AG-002.
- **Réactivité estimée** : tuile pour les fiches sans `premierePreparationAt`,
  réception → `ts` en jours ouvrés, **médiane** (choix utilisateur : `ts` est
  réécrit à chaque régénération) ; relances exclues. Affiche « N % — Traitées le
  jour même » + médiane en note. Calcul d'affichage, rien de stocké.
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
- Les vues futures suivent le CMS, indépendamment du filtre historique ;
  journées archivées exclues. Archives annuelles agrégées non reconstruites.
- **Délai moyen RDV par CMS** (22/10) : sur « Tous les CMS », liste par CMS ;
  un seul CMS : chiffre en grand. Jours calendaires `ts` → RDV ; archives
  (`arc.avgRdv`) toujours globales.

### Statut Annulé (22/10)
- `annule` + `annulationMotif` facultatif, séparés d'Excusé ; fiche conservée,
  créneau libéré, ni rappel ni relance ; rouge distinct du jaune Excusé ;
  ICS : CANCELLED, même UID. Le compteur quotidien filtre les créneaux libérés
  avant la priorité par type de message. Taux : Annulé au dénominateur comme
  Excusé. AG-001 reste ouvert pour le contrat de données.

### Agenda
- Navigation seule (Précédent/Aujourd'hui/Suivant + titre) en barre sticky ;
  dates, recherche, filtres, Réserver défilent. Bandeau PC réduit à 52 px.
  « Rappels et points à traiter » et archives sont dans le menu ☰ (filtres fermés
  au départ). Journées uniquement bloquées absentes de la timeline.
- Timeline : une date à la fois ≤ 900 px, semaine en colonnes sur PC ; Matin
  (<13:00) / Après-midi (≥13:00) côte à côte ; seuls les RDV enregistrés
  s'affichent ; « + Réserver » ouvre les disponibilités du profil actif.
- **Swipe de jour** (23/10, validé par l'utilisateur) sur `#ag-timeline-board`,
  vue compacte seulement : seuil 60 px horizontal / 40 px vertical, via
  `timelineMove()`. **Le geste de suppression par swipe sur une tuile est
  retiré** ; la suppression passe par la fiche RDV.
- Tuile entière colorée par statut (fond adouci clair, assombri sombre ;
  repli `color-mix()` sous `@supports`). Mode sombre : bordure `#6e8797`,
  fond `#182a35`, rail de statut 4 px.
- **Clignotement** : badges du menu (dépassement, à pointer) **et** tuiles
  `.ag-depasse`/`.ag-apointer`. La règle `#pane-agenda .ui-ag-slot{animation:none}`
  avait écrasé le clignotement des tuiles ; la règle de spécificité égale
  `#pane-agenda .ui-ag-slot.ag-depasse,…ag-apointer` le rétablit — **vérifier
  l'élément nommé par l'utilisateur, pas un voisin** (règle 38).
- **Onglet resté ouvert plusieurs jours** : `renderAgenda()` réinitialise
  `agendaTimelineDate`/`agendaFocusDay` quand le jour change
  (`S._agendaLastKnownDay`, en mémoire). Validé 20/10.
- Indice de défilement des onglets mobiles : dégradé 28 px, CSS pur,
  `@media(max-width:760px)`.
- Fiche RDV : panneau (bas sur mobile), identité/téléphone/démarche, statut
  modifiable, suivi repliable ; Préparer et Modifier en actions principales.
  La modification conserve le propriétaire ; la duplication passe par les
  disponibilités. Import ICS : les RDV de type `rdv` sont retenus par `getSlots`
  après les types prioritaires (seule exception intentionnelle à ses règles).

### Autres écrans
- **Modèles** : recherche (nom/type/contenu, sans accents), par masquage des
  cartes via `tplApplySearch()` — jamais de `renderTemplates()` à la frappe.
- **Votre message** : bloc replié au départ (`details/summary`), choix
  ouvert/fermé en mémoire UI.
- **Import des orientations** : dialogue refondu ; le CMS ne filtre que
  l'affichage, l'import confirme toutes les lignes cochées ; Échap/croix/fond
  gardent le brouillon, Annuler l'abandonne. Parseur, stockage, déduplication et
  `confirmOrientImport()` inchangés. Rendu à essayer clair/sombre, PC et mobile.
- **Refonte UI** validée le 19/10 (`7f0205e`), rendu confirmé en navigateur
  réel. Démo fictive : `python scripts/build-ui-preview.py --output-dir <dossier>`
  puis `demo-agenda-compact.html` (profil Michel). `scripts/ui-demo-data.js` n'est
  chargé que dans cette copie.

## Chantiers bloqués ou arrêtés

- **Liaison SMS sans copier-coller** (21/10) : les vrais SMS sont indispensables.
  Aucun lien fiable de préremplissage Google Messages Web (ne pas inventer de
  paramètres `phone`/`body`). Piste SMSGate (appli Android) : son API n'a pas
  de CORS, donc il faudrait un relais serveur ; rien mis en place. Si retenu,
  soumettre dépendance/contrat à l'AGORA avant implémentation. WhatsApp : lien
  officiel possible mais compte requis chez le destinataire.
- **Espacements SMS** : arrêté à la demande de l'utilisateur après `45d182c`
  (rendu reçu insatisfaisant). Ne pas annoncer le problème résolu. Acquis :
  au plus une ligne vide entre paragraphes, CRLF normalisés, e-mails inchangés ;
  le rendu dans Google Messages réel reste à confirmer.

## Décisions à trancher

Toute entrée ajoutée ici dit si elle ouvre un bloc `AGORA.md` ou non, et pourquoi.

Aucune pour l'instant.

## Chantiers restants

- **Audit trimestriel du 01/10/2026 — important** : le jeton GitHub
  (`ess-gh-token`) et l'historique des usagers sont en `localStorage` sur
  l'origine `maswaddpt47-cmyk.github.io`, **partagée** avec NEWGEN, NextStep et
  GDINV2 : une faille d'injection dans l'une peut les lire. Pistes : jeton à
  grain fin limité au dépôt de sauvegarde avec expiration ; à terme, domaine
  dédié. Portée réelle du jeton non vérifiée. **Reporté par l'utilisateur le
  10/10/2026** — ne pas reproposer sans fait nouveau.

## Points à ne pas défaire

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
- **Grille des créneaux : 9h30 → 16h30 toutes les heures** (07/10/2026), constante
  `DEBUT_GRILLE` dans `getSlots()` ; `debut:'09:00'` stocké = ancien défaut. Les
  RDV hors grille restent affichés à leur heure sans étirer la grille. Aucun jour
  de semaine n'est attaché à un lieu.
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
- **Formule de dépassement/relance centralisée dans `isDepasse()`** : ne pas la
  réécrire en ligne ailleurs.
- **Migrations localStorage** : une migration non testée a déjà réduit 11 CMS à
  6. Toute migration délicate mérite un test ciblé avant commit.
- **Commune de « Ouvrir une journée » = liste déroulante**, pas un champ texte
  (une faute de frappe créerait une journée invisible).
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
- **Définitions des stats, tranchées le 27/09/2026** : concrétisation et lapin
  = ÷ RDV passés hors bloqués ; courbe Lapin/Excusé/Pas de retour rattachée au
  **mois du RDV**. Archives antérieures non recalculables. Taux d'occupation :
  seules les journées réellement ouvertes comptaient ; remplacé le 22/10 par les
  prochaines permanences (archives inchangées).

## Pistes d'amélioration

Règle 22 de MD-LIB `collaboration.md` : au plus 3 pistes, à la fin d'une
fonctionnalité validée ou sur demande de revue. Une piste écartée ne se
repropose pas sans fait nouveau.

**Proposées, en attente**
- 22/10/2026 — rappeler date/lieu dans le texte de dépassement des six places.
  La capture montre ce texte isolé en haut de la liste ; hypothèse non vérifiée :
  fin de ligne précédente coupée par le défilement interne.

**Écartées** (date — piste — raison)
- 10/10/2026 — file « à reporter » (CR / Coop), fiche Coop et résumé CR prêts à
  copier — l'utilisateur fait CR et Coop dans la foulée de chaque accompagnement ;
  à ne reproposer que si un import (CSV/API) supprimait une saisie.
