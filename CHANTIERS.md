# CHANTIERS — sms-mail-multi

État au **30/10/2026**, base `main` (`d96063b`). Ménage du fichier fait les 23, 25, 29 et 30/10 ; le récit des tâches terminées est dans `git log` (ancienne version : `git show 9cf8cfb:CHANTIERS.md`).

Carnet de reprise : ce qu'une session sans historique doit savoir pour
continuer. Mis à jour à chaque avancée, pas en fin de session. Une tâche
terminée **sort** de ce fichier ; seul ce qui ne doit pas être défait remonte
dans « Points à ne pas défaire ».

## En cours / à confirmer

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
- **Infobulle de la tuile « Préparation moy. (lun.–ven.) »** (30/10, demande utilisateur, à valider sur iPad) : définition en mots simples (jours ouvrés, réception exclue, préparation incluse, seules les fiches horodatées).
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
  disponibles, d'après la permanence enregistrée ; sans permanence : 6, `sansPerm`). **Remplissage net** (30/10, à valider) : créneaux non libérés (≥1 fiche ni Lapin/Excusé/Annulé/Pas de retour) / même base ; tuile de Statistiques seulement (retiré du bilan par AG-011). Limites : journée sans RDV non comptée, tous statuts
  comptés pour le remplissage brut, peut dépasser 100 %. Pas d'AGORA : calcul d'affichage, rien de stocké.
- **Animation des graphes de Statistiques** (30/10, demande utilisateur : « à la façon des bilans de NEWGEN », **à valider à l'œil**) : barres, graphique mensuel et heatmap se dessinent
  en 800 ms (décélération `cubic-bezier(.215,.61,.355,1)`) quand la carte apparaît (≥ 20 % visible) et rejouent à chaque retour (`animerGraphesStats`, classe `ui-anim-pre`) ; tuiles en glissement
  décalé et **compteurs de tous les chiffres** (tuiles, statuts, valeurs des barres, y compris décimaux et « n / total (x %) ») qui montent de 0 à leur valeur en 800 ms à l'arrivée à l'écran et au retour (`compterNombre`) ; rien en mouvement réduit ; à l'impression valeurs finales (`beforeprint`). **Sans ECharts** (dépendance de ~1 Mo refusée dans un fichier unique : critère 1 d'AGORA si l'on y revient).
- **Bilan mensuel simplifié : une seule base, les rendez-vous enregistrés** (30/10, consigne de l'utilisateur ; **à valider**, **AG-011 tranché le 30/10, Codex « confirmé »** ; AG-009 et AG-010 rangés) : le bilan ne donne plus que
  rendez-vous du mois et réalisés, personnes accompagnées, répartition par statut (n / total · %, ligne Total, note sur les arrondis, Confirmé/En attente masqués à 0), démarches, rendez-vous par CMS.
  **Retirés du bilan** : taux de concrétisation, lapin, remplissage brut/net, phrase de lecture, créneaux par CMS. 4 infobulles ⓘ à l'aperçu (jamais imprimées) ; **au toucher, une infobulle reste 6 à 15 s** (selon la longueur), au-dessus du doigt, masquée par un toucher ailleurs (`attachPermanenceTip`, aussi pour la heatmap et les permanences ; à valider sur iPad). Concrétisation, lapin et remplissage
  **restent dans Statistiques** (créneaux, décision du 23/10) ; données et archives inchangées. Test : les statuts totalisent les rendez-vous du mois.
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

- **Audit Codex du 30/10 des calculs Statistiques/Bilan** (rapport `sms-mail-multi-backups/audits/2026-10-30-statistiques-bilan-mensuel.md`) : 29 sélections
  recomptées, aucun chiffre du bilan faux. **Points 1 à 5 corrigés le 30/10** (délai RDV `delaiRdvJours` en jours civils, `cmsKey` partout, début de période
  Paris, `usagerKey`, « jour même » = même date civile) ; **AG-006 : Codex a répondu « amendé » (30/10)**, amendement corrigé le 30/10 : regroupements CMS (`comptageParCms`), démarches et types
  (`comptageDemarches`, `comptageTypes`) identiques à l'écran et dans les nouvelles archives ; **AG-006 tranché le 30/10**. Point 6 **tranché : base fixe 6/3**, libellé corrigé. **Point 7 corrigé le 30/10** (`statutAffiche` : statut vide/inconnu/`toString` = « en attente » partout, ligne « Démarche non renseignée » à l'écran,
  démarche `constructor` lue comme telle). Archives déjà calculées non recalculées ; en archive un statut inconnu compte désormais « en attente ». Tests : `TZ=UTC` **et** `TZ=Europe/Paris`.

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

**En attente** : aucune.

**Écartées** (date — piste — raison)
- 10/10/2026 — file « à reporter » (CR / Coop), fiche Coop et résumé CR prêts à copier — l'utilisateur les fait dans la foulée
  de chaque accompagnement ; à ne reproposer que si un import (CSV/API) supprimait une saisie.
