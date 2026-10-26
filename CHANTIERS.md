# CHANTIERS — sms-mail-multi

État au **25/10/2026**, base `main`. Ménage du fichier fait les 23 et 25/10 ; le récit des tâches terminées est dans `git log` (ancienne version : `git show 9cf8cfb:CHANTIERS.md`).

Carnet de reprise : ce qu'une session sans historique doit savoir pour
continuer. Mis à jour à chaque avancée, pas en fin de session. Une tâche
terminée **sort** de ce fichier ; seul ce qui ne doit pas être défait remonte
dans « Points à ne pas défaire ».

## En cours / à confirmer

- **Capacité des demi-journées** (22/10, déployée et validée) : 3 places par demi-journée, 6 par journée
  complète (le 4 novembre est partagé entre deux lieux). `statsRdvModel.assignedHalf` identifie la moitié
  ouverte ; indispo 12:30 de pause exclue d'une matinée, un vrai RDV 12:30 reste compté.
- **« Traitées le jour même »** = estimation sur les anciennes fiches, à ne pas confondre avec la préparation horodatée.
- **À valider par l'utilisateur sur ses données réelles** : bilan mensuel (audit Codex avant diffusion),
  lien date/lieu → Agenda avec deux CMS le même jour.

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
  `avgReact` inchangé, présenté comme estimation. Contrat additif soumis à l'AGORA AG-002.
- **Réactivité estimée** : tuile pour les fiches sans `premierePreparationAt`, réception → `ts` en jours
  ouvrés, **médiane** (`ts` est réécrit à chaque régénération) ; relances exclues ; « N % — Traitées le jour
  même » + médiane en note. Calcul d'affichage, rien de stocké.
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
- **Lapins par permanence** (carte de Statistiques, validée ; ex-sous « Prochaines permanences ») : journées passées de la période/CMS avec
  ≥1 lapin ; « 2/6 » = **créneaux** avec lapin / **créneaux** de la journée (pas les fiches : un créneau réattribué en
  porte plusieurs, cas « 2/8 » pour 6 créneaux). 10 plus récentes ; `lapinDays` testé ; sélecteur CMS répété
  (`buildCmsSelect`). Les vues futures suivent le CMS, pas le filtre de période.
- **Délai moyen RDV par CMS** (22/10) : liste par CMS (ou chiffre seul si un CMS) ; jours calendaires `ts` → RDV ; archives toujours globales.
- **Unités affichées** (25/10) : nombres = fiches ; taux et places = créneaux (phrase sous « Le suivi des rendez-vous »,
  unité en note de chaque tuile, aides « Unité : … »). « Traitées le jour même (estimation) » ≠ « Mesure horodatée ».
  Compteurs animés : `countUp()` partagé, coupé si mouvement réduit.
- **Date/lieu des permanences → Agenda** (25/10) : `ui-permanence-link` → `agendaScope='mine'`, `agendaTimelineDate` +
  `agendaFocusDay`, consultation seule ; non éprouvé avec deux CMS le même jour. **Badges rouge/orange de l'Agenda
  cliquables** : jour du **premier** RDV concerné (`badgeGo`, `stopPropagation`) ; le badge vert reste inerte.
- **Barres de « Prochaines permanences » (onglet Orientations depuis le 26/10) = créneaux dans l'ordre des heures** (26/10) : chaque case est un créneau réel
  (`cells` dans `statsRdvModel`, 12:30 exclu), la libre reste à sa place ; clic sur une libre → Messages (Générer) avec
  `S.date`, `S.commune`, adresse CMS et **l'heure de la case** ; brouillon conservé ; focusable. « Libres » sans 12:30.
  Ligne « N places … sur les 7 prochains jours » (détail par CMS) en tête de carte (26/10).
- **Relancé sans réponse après 3 h → alerte « Libérer ? »** (26/10) : `tsRelance` (horodatage ISO, additif, posé à la copie
  de la relance ; sans lui, fin du jour `dateRelance`, d'où alerte rétroactive dès la veille) ; si `en_attente` ≥ 3 h après
  (`isSansReponse`) : tuile clignotante, « ⏰ Libérer ? » (confirmation → « Pas de retour »), badge, bandeau ; contrôle /60 s. **Délai réglable** (Configuration → Général, 1-72 h, défaut 3).
- **Bouton « Aujourd'hui » de l'Agenda** (25/10) : ouvre une journée **avec RDV** — aujourd'hui s'il en a,
  sinon la prochaine, à défaut la dernière passée ; en vue semaine (PC) la semaine en cours reste affichée si
  elle contient un RDV. Toast sur mobile quand le jour change.
- **Jour sélectionné marqué dans le bandeau de dates** (25/10) : la règle `[aria-pressed="true"]` existait
  mais était écrasée par `#pane-agenda .ui-ag-toolbar :is(button…):not(…)` (`!important`, spécificité 1,3,1) ; le
  sélecteur renforcé (1,4,0) donne fond teinté, bordure 2 px et gras, en clair comme en sombre. Même piège que
  le clignotement des tuiles : tout nouveau style de bouton dans cette barre doit battre cette règle.
- **Pause déjeuner d'office** (25/10, demande utilisateur ; remplace « 12h30 compris » du 07/10) : une entrée
  `indispo` « Pause déjeuner » à 12:30 sur chaque journée ouverte **à venir** (`applyLunchBreaks` au chargement
  du profil et à l'ouverture d'une journée), une seule fois : `pauseAuto` sur la permanence, donc une pause libérée
  ne revient pas. Ni passé, ni archivée, ni demi-journée sans 12:30, ni si 12:30 est déjà pris. `statsRdvModel`
  l'ignore (`isLunchBreak`) : ni place ni blocage. Jours **jamais ouverts** : `getSlots` ne propose pas 12:30 (la pause
  est posée à l'ouverture ; RDV déjà pris et « Autre heure » restent possibles). Pas d'AGORA : décision explicite,
  libérable en un clic, aucune donnée détruite.
- **Bilan mensuel imprimable** (25/10 ; bouton « 📄 Bilan mensuel » en tête de Statistiques) : modale mois + CMS,
  aperçu et « Imprimer / PDF ». `monthlyReportData` réutilise `statsRdvModel`/`slotRates` (« aujourd'hui » = fin du mois
  échu ou jour courant). Vocabulaire : « rendez-vous enregistrés » / « créneaux horaires » (« fiches » reste sur
  l'écran Statistiques). Statuts, démarches (top 10 + « autres »), CMS, sources/limites ; état vide ; archives jamais
  mélangées. Tests : `check-stats-rdv.js`. Bouton restylé (cadre accent, 52 px, pleine largeur sur mobile).
  **Audit Codex du 26/10 (AG-004, réponse inscrite)** : 20 sélections 07–10/2026 recomptées, **écart 0**. Corrigé le
  26/10 : fiches sans CMS (ligne « CMS non renseigné »), sans heure (hors créneaux/taux, signalées), sans statut
  (= en attente partout), sans démarche (ligne dédiée), jour courant imposé Europe/Paris (`parisDayStr`), variantes de
  CMS regroupées (`cmsKey`). **AG-004 tranché le 26/10 (Codex : amendé)** : démarches saisies librement laissées telles
  quelles, mention « à relire avant toute diffusion » dans le bilan (choix utilisateur ; 29 fiches libres sur 162).
  Diffusion à la hiérarchie possible, **relecture des textes libres par l'utilisateur avant envoi**.

### Statut Annulé (22/10)
- `annule` + `annulationMotif` facultatif, séparés d'Excusé ; créneau libéré, ni rappel ni relance ; rouge
  distinct d'Excusé ; ICS : CANCELLED, même UID. Compteur quotidien : créneaux libérés filtrés avant la
  priorité par type de message. Taux : Annulé au dénominateur comme Excusé. AG-001 ouvert (contrat de données).

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
- **Swipe de jour** (23/10, validé par l'utilisateur) sur `#ag-timeline-board`,
  vue compacte seulement : seuil 60 px horizontal / 40 px vertical, via
  `timelineMove()`. **Le geste de suppression par swipe sur une tuile est
  retiré** ; la suppression passe par la fiche RDV.
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
- Fiche RDV : panneau (bas sur mobile), identité/téléphone/démarche, statut
  modifiable, suivi repliable ; Préparer et Modifier en actions principales.
  La modification conserve le propriétaire ; la duplication passe par les
  disponibilités. Import ICS : les RDV de type `rdv` sont retenus par `getSlots`
  après les types prioritaires (seule exception intentionnelle à ses règles).

### Autres écrans
- **Modèles** : recherche (nom/type/contenu, sans accents) par masquage des cartes (`tplApplySearch()`), jamais de `renderTemplates()` à la frappe.
- **Votre message** : bloc replié au départ (`details/summary`), choix ouvert/fermé en mémoire UI.
- **Configuration → Journées** (25/10) : sous-onglets « Ouvertes (N) » / « Archivées (M) » (`S.permView`) ; le
  bouton d'archivage RGPD reste dans « Ouvertes », « Restaurer » dans « Archivées ». **Règle d'archivage (25/10,
  choix utilisateur) : tout ce qui précède le 1er du mois en cours** (avant : > 60 jours), sauf journée avec RDV en
  attente ou à pointer. Aucune donnée supprimée. **Automatique au chargement du profil** (`archiveOldDaysCore(true)`, 25/10)
  + bouton ; une journée restaurée (`gardeOuverte`) n'est plus archivée d'office, le bouton reste manuel.
- **Import des orientations** : dialogue refondu ; le CMS ne filtre que l'affichage, l'import confirme toutes les
  lignes cochées ; Échap/croix/fond gardent le brouillon, Annuler l'abandonne. Parseur, stockage, déduplication et
  `confirmOrientImport()` inchangés.
- **Refonte UI** validée le 19/10 (`7f0205e`). Démo fictive : `python scripts/build-ui-preview.py --output-dir
  <dossier>` puis `demo-agenda-compact.html` (profil Michel) ; `scripts/ui-demo-data.js` n'y est chargé que là.

### Heatmap « Activité annuelle » (23/10)
- Compte des **créneaux de RDV** par jour (date, CMS, heure), **hors indisponibilités** (avant : « 16 RDV le 30/09 »
  pour 5 vrais RDV + 11 bloqués, constaté sur la sauvegarde réelle). Excusé/Annulé comptent encore (comme dans
  l'Agenda). L'archive annuelle (`arc.heatmap`, jour de semaine × heure) n'est pas touchée.
- Mise en page (23/10, « ramassée ») : grille en CSS grid qui remplit la carte, cases
  carrées plafonnées à 22 px, 10 px/semaine minimum (défilement sur écran étroit),
  mois étiquetés sans chevauchement (mois du dimanche de la semaine).
  **Semaine de 5 jours (L–V)** à la demande de l'utilisateur ; samedi/dimanche
  reviennent seulement si l'un porte un RDV (rien de masqué ; aucun RDV de
  week-end dans la sauvegarde du 23/10).
- **Infobulle de la heatmap au toucher** (23/10, signalé sur téléphone) : l'attribut
  `title` ne s'affiche pas au toucher ; les cases utilisent `#stat-tooltip` via
  `attachPermanenceTip` (`data-tip` : « mer. 21 oct. 2026 — N RDV »). Les événements
  souris émulés après un toucher (`mouseleave`) sont ignorés 1 s, sinon l'infobulle
  disparaissait aussitôt (constaté en émulation tactile). Vaut aussi pour les
  cases de « Prochaines permanences ». **Heatmap (5 jours, infobulle, comptage par créneau) validée par
  l'utilisateur le 25/10/2026.**

## Chantiers bloqués ou arrêtés

- **Liaison SMS sans copier-coller** (21/10) : les vrais SMS sont indispensables. Aucun lien fiable de
  préremplissage Google Messages Web (ne pas inventer de paramètres `phone`/`body`). Piste SMSGate (appli
  Android) : son API n'a pas de CORS, il faudrait un relais serveur ; rien mis en place. Si retenu, soumettre
  dépendance/contrat à l'AGORA avant implémentation. WhatsApp : lien officiel, mais compte requis.
- **Espacements SMS** : arrêté à la demande de l'utilisateur après `45d182c`
  (rendu reçu insatisfaisant). Ne pas annoncer le problème résolu. Acquis :
  au plus une ligne vide entre paragraphes, CRLF normalisés, e-mails inchangés ;
  le rendu dans Google Messages réel reste à confirmer.

## Décisions à trancher

Toute entrée ajoutée ici dit si elle ouvre un bloc `AGORA.md` ou non, et pourquoi.

Aucune pour l'instant.

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
  reproposer. Ne pas reproposer le reste sans fait nouveau.

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
- **Grille des créneaux** (07/10, **révisée le 25/10/2026**, AG-003 clos le 26/10, tranché par l'utilisateur) : matin 9h30, 10h30, 11h30, 12h30
  (`DEBUT_GRILLE` dans `getSlots()` ; `debut:'09:00'` = ancien défaut) ; **après-midi = 3 créneaux d'1 h** à partir du
  `debutApresMidi` du CMS (défaut 13h30 ; **Fumel 14h00**, posé une fois au chargement, réglable dans Configuration →
  CMS). **Le 16h30 est retiré pour tous** (demande utilisateur). Les RDV hors grille restent affichés à leur heure.
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

- Aucune.

**Écartées** (date — piste — raison)
- 10/10/2026 — file « à reporter » (CR / Coop), fiche Coop et résumé CR prêts à
  copier — l'utilisateur fait CR et Coop dans la foulée de chaque accompagnement ;
  à ne reproposer que si un import (CSV/API) supprimait une saisie.

## Pistes d'amélioration

Règle 22 de MD-LIB dans `CLAUDE.md` ; ne pas reproposer une piste écartée sans fait nouveau.
26/10 : places libres 7 jours **faite** ; rappel RDV en attente **déjà existant** (badge Agenda, bandeau,
page profil) ; « Prochaines permanences » **déplacée vers Orientations** (26/10, accord utilisateur ; `buildPermanencesCard`, CMS propre `S.orientCMS`).
