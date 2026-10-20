# CHANTIERS — sms-mail-multi

État au **19/10/2026**, base de la sandbox `51e75b8` (`main`).

Carnet de reprise : ce qu'une session sans historique doit savoir pour
continuer. Mis à jour à chaque avancée, pas en fin de session. Une tâche
terminée **sort** de ce fichier (son récit est dans `git log`) ; seul ce qui
ne doit pas être défait remonte dans la dernière section.

## Refonte UI validée

- Branche de travail : **`sandbox/ui`**, créée depuis `main` au commit
  `51e75b88bb3e05a6413bad217941a57ee86d8f04` le 19/10/2026.
- Consigne utilisateur : **aucun push ni merge vers `main` avant son feu
  vert explicite**, y compris la documentation et les blocs AGORA.
- **Feu vert reçu le 19/10/2026** après essai de la dernière démo et du
  contraste sombre : « Ça fonctionne, tu peux fusionner dans main ».
  La fusion de cette livraison dans `main` et le déploiement Pages
  automatique associé sont autorisés. La version UI validée est `7f0205e`.
- Copie locale : `/workspace/sms-mail-multi-sandbox`, récupérée via le
  connecteur GitHub car le proxy du terminal était inaccessible. Les objets
  Git et les fichiers de cette base ont été vérifiés ; historique superficiel.
  Le push par défaut cible `sandbox/ui` ; un hook local refuse `main`.
- Proposition V2 : le retour utilisateur du 19/10/2026 constate que V1
  changeait surtout le générateur et conservait les autres tuiles.
  La refonte porte désormais aussi sur l'agenda, l'historique et les orientations (registres),
  les statistiques (bandeaux et sections graphiques), les modèles
  (bibliothèque), la configuration (listes et formulaire latéral),
  les mandats et le choix des profils (répertoire en lignes).
  Les neuf écrans et les fonctions métier restent disponibles.
- Retour utilisateur suivant, approuvé : conserver les tuiles de l'agenda
  avec moins de défilement sur téléphone. La timeline affiche une date à
  la fois à 900 px ou moins, et la semaine en colonnes sur ordinateur.
  Ajustement demandé ensuite : chaque journée est divisée en deux colonnes
  côte à côte, Matin (<13:00) et Après-midi (>=13:00), même sur téléphone.
  L'heure est dans la tuile ; noms et démarches peuvent tenir sur deux
  lignes, avec le détail accessible au toucher. Les journées à une seule
  demi-journée gardent l'autre colonne avec « Aucun RDV ».
  Bandeau de dates sticky, Aujourd'hui, précédent/suivant ; les filtres et
  actions de journée sont repliables. Les tuiles compactes ouvrent le RDV
  ou réservent un créneau libre ; les créneaux réouverts restent signalés.
  Recherche et rappels révèlent la date concernée, même après un focus.
  La portée reste accessible lorsque l'agenda est vide. Le curseur et la
  recherche sont en mémoire UI, sans nouveau format de stockage.
- Demande suivante : retirer les créneaux libres et les journées vides.
  Les colonnes affichent uniquement les RDV enregistrés, y compris les
  statuts excusé/lapin/pas de retour pour garder leur suivi. Les journées
  uniquement bloquées ne figurent pas dans la timeline. Le bandeau et les
  flèches ne parcourent que les dates avec RDV (semaines occupées sur PC).
  « + Réserver » ouvre les disponibilités du profil actif, date et lieu au
  choix, même pour une journée vide ; la tuile apparaît après enregistrement.
  Blocage/libération des indisponibilités sont accessibles dans cette fenêtre.
  Les orphelins respectent la portée choisie et les archives masquées.
  Le filtre « Libre » est retiré de la timeline et son ancien état réinitialisé.
- Dernier ajustement demandé : masquer le bloc « Votre agenda » et son
  sous-titre sur l'onglet Agenda, mobile et ordinateur. Le bandeau de dates
  vient directement après la navigation ; l'onglet actif reste le repère.
  Les en-têtes des autres écrans restent présents. Changement de CSS seul,
  sans modification des parcours ni nouveau contrôle fonctionnel.
- Fiche RDV : remplacer l'ancienne modale en lignes et ses boutons colorés.
  Identité, téléphone et démarche en tête ; statut modifiable ; notes
  affichées si présentes ; suivi des échanges repliable. Corps défilant
  entre en-tête et actions ; sur téléphone, panneau depuis le bas.
  Préparer SMS/mail et Modifier sont les actions principales ; Dupliquer
  et Supprimer restent explicites en second rang. Fermeture Échap et
  circulation Tab, libellés du dialogue et des champs ajoutés.
  Les propositions multiples demandent de choisir le RDV avant ses actions.
- Mode sombre : bordure des tuiles agenda éclaircie (`#6e8797`), fond
  distinct (`#182a35`) et rail de statut de 4 px avec une palette plus claire.
  Le survol et le focus renforcent aussi la bordure. Sélecteurs limités à
  l'agenda sombre, aucun changement de données ni du thème clair.
  Contrastes calculés sur les couleurs déclarées : bordure/fond 3,92:1,
  rails/fond au moins 7,71:1. JavaScript strictement identique à la base ;
  relecture de la cascade et de la portée CSS, sans contrôle navigateur.
- Correctifs liés à cette fiche : la modification conserve le propriétaire
  et actualise la date/l'heure du contexte. La duplication passe par les
  disponibilités et reprend les bons IDs CMS/démarche, avec repli « Autre »
  pour une démarche libre. Le passage au générateur retire bien la modale.
  Le ciblage d'une ancienne fiche supprimée ne retombe pas sur un RDV
  nouvellement créé portant les mêmes coordonnées. Format de stockage inchangé.
- Correctif nécessaire au nouveau sélecteur : l'import ICS crée des
  messages de type `rdv`, jusque-là ignorés par `getSlots`. Après les types
  prioritaires existants, le moteur retient désormais le premier autre RDV
  actif : le RDV importé reste visible et son horaire n'est plus proposé libre.
  Aucun changement de format d'historique. Les autres fonctions protégées
  restent inchangées ; `getSlots` est la seule exception intentionnelle.
- Correctifs des actions agenda : les copies taguées pour l'affichage ne
  sont pas les objets persistés. La libération individuelle/par plage
  retrouve l'indisponibilité dans l'historique actif ; la fermeture d'une
  journée compare commune/date. Les RDV et autres profils sont préservés.
- Correctif lié : `updatePreviewOnly()` cible explicitement le corps et
  l'objet du message ; la saisie actualise l'aperçu sans écraser les Notes
  et sans reconstruire le formulaire. L'aide clavier indique les raccourcis
  existants (Ctrl+Entrée : copier ; Ctrl+Maj+G : générer).
- Contrôles V2 : syntaxe JS et `git diff --check` ; parcours Node avec
  DOM, stockage et presse-papiers simulés couvrant les neuf écrans,
  les sous-onglets, les états vides/remplis et les actions principales.
  Le harnais génération continue de vérifier Notes, focus et copie ;
  50 contrôles passent et 34 fonctions métier protégées sont identiques
  à la version d'origine. Le filtre de recherche masque aussi les titres
  des semaines sans journée visible. La démo se charge sans appel réseau.
- Contrôles timeline : 16 scénarios ciblés passent en DOM simulé, dont
  navigation jour/semaine, focus et recherche, agenda vide, profils,
  saut à la date exacte, hauteur du bandeau, changement 390/1280 px,
  blocage/libération unitaire et par plage, fermeture sans perte de RDV.
  Les 50 contrôles globaux passent avec l'attendu de période adapté à la
  semaine sélectionnée ; les 34 fonctions métier restent identiques.
  Après séparation Matin/Après-midi, 21 contrôles ciblés passent (les 16
  précédents et 5 pour la répartition, la frontière 13:00 et les actions
  dans la colonne après-midi). Le rendu CSS demeure non vérifié.
- Contrôles de la timeline RDV : 26 scénarios passent en DOM/stockage
  simulés, dont réservation complète jusqu'à `handleGenerate`, première
  journée, suppression du dernier RDV, navigation sans dates vides,
  profils, archives, orphelins, import ICS réel et priorités des créneaux.
  Les 33 autres fonctions métier protégées sont identiques à la base.
- Contrôles de la fiche : 21 scénarios passent en DOM simulé, couvrant
  statut et relance, excuse, édition et conflits, profils, suppression,
  génération, duplication complète, propositions multiples et clavier.
  Les 26 contrôles agenda ont aussi passé après la refonte principale ;
  les correctifs de fermeture et ciblage final sont vérifiés dans les 21.
- **Rendu validé en navigateur réel le 19/10/2026** (Playwright/Chromium,
  disponible dans cette session, contrairement à celle qui a produit la
  refonte) : Agenda et fiche RDV, 1280 px et 390 px, clair et sombre.
  Aucune erreur JS/console. Pas de débordement, contraste et lisibilité
  corrects, panneau mobile de la fiche glissant bien depuis le bas. Captures
  dans `/tmp/sms-mail-ui-preview/` (session, non committées).
- **Indice de défilement sur la bande d'onglets mobile** (20/10/2026) : sur
  téléphone, `#tabnav` (`overflow-x:auto`, `scrollbar-width:none`) coupait
  « Orientations (2) » au bord de l'écran sans rien signaler. Correctif CSS
  pur, pas de JS : `.workspace-sidebar::after` ajoute un dégradé de 28px au
  bord droit (`transparent` → couleur de fond, `var(--c-card)` en clair,
  `#102735` en sombre comme le reste du thème sombre), scopé à
  `@media(max-width:760px)`, `pointer-events:none`. Vérifié en navigateur
  réel, clair et sombre : le dégradé est visible, aucune régression de mise
  en page. Statique (ne disparaît pas en fin de défilement, pas de JS) —
  suffisant pour l'indice recherché.
- **Agenda figé sur une vieille date dans un onglet resté ouvert plusieurs
  jours** (20/10/2026, cas réel signalé par l'utilisateur : l'onglet affichait
  « Mercredi 21 Octobre » puis une archive du 3 août au lieu du jour réel).
  `S.agendaTimelineDate` n'est jamais réinitialisé après une navigation ‹ ›
  tant que la page n'est pas rechargée — un onglet qui reste ouvert d'un jour
  sur l'autre garde la dernière date consultée au lieu de revenir sur
  « aujourd'hui ». Corrigé dans `renderAgenda()` : un suivi du dernier jour
  connu (`S._agendaLastKnownDay`, en mémoire, pas persisté) détecte le
  changement de jour et réinitialise `agendaTimelineDate`/`agendaFocusDay`
  si le jour a changé depuis le dernier rendu. Vérifié en navigateur réel
  avec horloge simulée (+2 jours, sans recharger) : la date revient bien sur
  aujourd'hui ; non-régression confirmée (même jour → date consultée
  inchangée). **Validé en conditions réelles par l'utilisateur le 20/10/2026.**
- **Badges clignotants sur l'onglet Agenda** (20/10/2026, demande utilisateur
  après avoir confirmé que le pill d'un RDV dépassé clignote déjà et s'arrête
  une fois résolu, `@keyframes blink`/`.ag-depasse,.ag-apointer`). Même
  traitement étendu aux badges du menu (pas seulement les pills dans la
  grille) : le badge rouge « dépassement » (`overdueN`, RDV en attente au-delà
  du délai de relance) et le badge orange « à pointer » (`aPointerN`, RDV
  confirmés passés non marqués Réalisé) clignotent désormais aussi. Le badge
  vert « RDV du jour » (`agTodayN`) n'est pas une alerte, non concerné.
  Vérifié en navigateur réel : `animation-name` du badge dépassement = `blink`.
- **Recherche dans l'onglet Modèles** (20/10/2026, demande utilisateur). Champ
  de recherche au-dessus des sous-onglets « Modèles par défaut »/« Mes
  modèles », filtrant par nom, type et contenu du texte (normalisé,
  insensible aux accents/casse, `tplNorm`). Filtrage par affichage/masquage
  des cartes déjà construites (`data-tpl-search`, `tplApplySearch()`), **pas**
  par un `renderTemplates()` complet à chaque frappe — même pattern que
  `nomIn`/« Autre heure » (points à ne pas défaire), pour ne pas perdre le
  focus en tapant. Message « Aucun modèle trouvé » si rien ne correspond ;
  la recherche est conservée en changeant de sous-onglet. **Correctif
  d'apparence le 20/10/2026** (signalé par l'utilisateur, le champ sortait
  en style brut du navigateur) : `.ui-tpl-search` n'était pas enfant de
  `.ui-tpl-field`, seul sélecteur qui donne au `.gx-in` sa largeur pleine et
  son style de cartouche (`.ui-tpl-field>.gx-in`) — ajouté un cadre
  `.ui-tpl-search` au même format que `.ui-tpl-variables` (bordure, radius
  11px, fond `var(--c-card)`) et une règle dédiée pour l'input, pleine
  largeur. Vérifié en navigateur réel : focus conservé pendant la frappe,
  16→3 résultats sur « lapin », message vide sur requête absurde, persistance
  au changement
  d'onglet.
- Limite précédente, levée ci-dessus : Chromium était bloqué par les
  permissions de l'environnement de la session qui a produit la refonte ;
  aucune validation du rendu n'était acquise à ce moment-là.
  La livraison contraste sombre fournit un nouveau fichier HTML distinct
  des précédents et une démo à données fictives uniquement en mémoire, pour voir
  les tuiles avec des RDV, sans modifier le stockage ni les
  formats de l'application réelle. Régénérer avec
  `python scripts/build-ui-preview.py --output-dir /tmp/sms-mail-ui-preview` ;
  ouvrir `demo-agenda-contraste-sombre.html`, choisir Michel, puis Agenda
  et activer le thème sombre avec la lune.
  `scripts/ui-demo-data.js` n'est chargé que dans cette copie.
- Livraison : PR de `sandbox/ui` vers `main`, puis contrôle du workflow
  Pages pour le commit fusionné avant d'annoncer la mise en ligne. Les
  nouvelles évolutions restent préparées sur `sandbox/ui`. Pas de bloc
  AGORA pour cette refonte réversible, sans changement de stockage ni
  d'architecture. Le workflow Pages se déclenche sur `main`.

## Décisions à trancher

Aucune pour l'instant. Toute entrée ajoutée ici dit si elle ouvre un bloc
`AGORA.md` ou non, et pourquoi.

## Chantiers restants (par priorité)

- **Audit trimestriel du 01/10/2026 — important** : le jeton GitHub
  (`ess-gh-token`) et l'historique des usagers sont en `localStorage` sur
  l'origine `maswaddpt47-cmyk.github.io`, **partagée** avec NEWGEN, NextStep
  et GDINV2 : une faille d'injection dans n'importe laquelle de ces applis
  peut les lire (une est relevée dans NEWGEN, à corriger là-bas). Pistes :
  jeton GitHub à grain fin, limité au seul dépôt de sauvegarde en écriture
  de contenu, avec expiration ; à terme, une adresse propre à cette appli
  (domaine ou sous-domaine dédié). Non vérifié : portée réelle du jeton
  actuel. **Jeton : reporté par l'utilisateur le 10/10/2026** — ne pas le
  reproposer sans fait nouveau. **Mineur RGPD** : polices chargées depuis `fonts.googleapis.com`
  (adresse IP transmise à Google, hors UE) — **fait le 10/10/2026** (`fonts/`).

1. **RGPD point 4 — à charge de l'utilisateur** : vérifier avec le Conseil
   Départemental si ce traitement figure au registre RGPD / si le DPO est
   informé. Seul point du plan de remédiation encore ouvert (`CLAUDE.md`).
2. **Origine du numéro tronqué du 07/10/2026 non identifiée** : un numéro
   de la forme `00 76 15 74 22` (10 chiffres commençant par 00) est arrivé
   dans Générer et a été envoyé sans alerte. L'alerte est en place (voir
   « Points à ne pas défaire »), la cause non : hypothèse non vérifiée,
   cellule mal formée dans le fichier importé (Orientations ne corrige que
   le cas « 9 chiffres → 0 devant »). À creuser au prochain cas, avec le
   fichier source sous les yeux (données fictives ou recadrées).
3. **Script de ménage de ce fichier** (`scripts/check-chantiers.sh`, hook
   `SessionStart`) : à copier depuis `ATELIERS_NEWGEN` — reporté le
   26/09/2026 par l'utilisateur, utile quand ce fichier aura grossi.

## Points à ne pas défaire

- **SMS-mail (solo) gelé le 20/10/2026** — décision de l'utilisateur, plus
  de développement là-bas : `sms-mail-multi` est désormais le seul repo
  actif. Ne plus porter de correctif vers SMS-mail, ne plus lancer
  `scripts/check-drift.js`. La refonte UI du 19/10/2026 (`b6d7b03`) n'existe
  que sur multi et n'y sera jamais portée. L'audit de dérive du 26/09/2026
  (portage corrigé le 27/09, `check-drift.js` fiabilisé le 10/10/2026) est
  clos — plus de dérive à surveiller, le gel la rend sans objet.

- **Alerte « À pointer »** (`isAPointer`/`aPointerList`, 15/10/2026) : RDV
  `confirme` dont la date est passée → pastille orange sur l'onglet Agenda,
  bannière 📌 et filtre « À pointer ». `archiveOldDays` n'archive pas une
  journée qui en contient encore (même logique que les RDV en attente).
  Pointage en un clic depuis la bannière (`pointerStatut`, différent entre
  les jumeaux à dessein : multi écrit dans l'historique du bon profil).
  Multi, 15/10/2026 : la bannière 📌 et le compteur « N RDV » suivent la
  portée (Mon agenda / collègue / Tous) ; rappels, doublons et dépassements
  restent ceux du profil connecté et sont masqués sur l'agenda d'un
  collègue ; le filtre de statut survit au changement de portée
  (`S.agStatutFilter`). Testé en navigateur sur données fictives.
- **Aucune donnée d'usager dans un repo public**, même temporairement :
  pas de `backups/`, pas d'export JSON. Les sauvegardes partent vers le repo
  privé `GH_REPO='maswaddpt47-cmyk/sms-mail-multi-backups'` (`index.html`).
- **Rétention RGPD** (`archiveYear`) : supprime le détail nominatif d'une
  année révolue après agrégation anonymisée — irréversible, confirmation
  obligatoire à conserver.
- **Cloisonnement par profil** : toute donnée d'usager passe par les clés `ess-<profil>-…` (`pk`/`pkFor`). Une migration ou un archivage sur un profil ne doit toucher aucune clé d'un autre profil.
- **Calendrier « à la volée », validé en conditions réelles le 28/09/2026**
  sur le profil « michel » : migration testée (RDV existants retrouvés
  dans l'Agenda), création de RDV, changement de statut. Un bug trouvé au
  passage et corrigé, pas lié à la refonte elle-même : la libération d'un
  créneau n'apparaissait pas sans changer d'onglet (`0389cb5`). Un doublon
  de fiche isolé du 23/09 (avant la refonte, cause non identifiée avec
  certitude) empêchait aussi un créneau de se libérer — supprimé
  manuellement par l'utilisateur.
  **Deuxième occurrence le 05/10/2026** (Mme LAFAGE, Fumel) : deux fiches
  sur le même RDV (02/10 15:00), démarches différentes (« DLS » réalisé,
  « Demande de logement social (SNE/Numéro unique) » restée en_attente) —
  ce n'est pas un faux positif de `isDepasse()` (qui exclut bien les
  statuts non-`en_attente`), la fiche en attente était un vrai doublon.
  Confirmé par l'utilisateur comme doublon, supprimé manuellement. Cause
  toujours non identifiée côté code (`addHistory` dédoublonne par
  date+heure+commune+nom+prénom, qui matchaient tous ici — pas
  d'hypothèse vérifiée sur pourquoi deux fiches ont coexisté). Si une
  troisième occurrence apparaît, ça passe le critère AGORA n°3 (trois
  itérations sans résolution). Le sélecteur d'agenda multi-profil
  (« mon agenda / collègue / tous », `permanencesOuvertesDe`) a été
  **validé en conditions réelles par l'utilisateur le 10/10/2026**.
- **Un champ de saisie ne déclenche jamais un rebuild complet du
  formulaire tant qu'on tape dedans** (30/09/2026, trouvé sur le champ
  « Autre heure ») : `onInput` fait une mise à jour légère
  (`regen()+updatePreviewOnly()`), la reconstruction complète
  (`setFieldSave`/`renderGenerate`) attend `onBlur` — sinon un input
  segmenté (`type="time"`) perd le focus en pleine frappe dès qu'un
  segment devient valide. Pattern déjà utilisé sur `nomIn`, à reprendre
  pour tout nouveau champ de ce genre.
- **Grille des créneaux : 9h30, 10h30… 16h30, toutes les heures, 12h30 et
  13h30 compris** (tranché par l'utilisateur le 07/10/2026 ; avant : 9h00…
  16h00). Constante `DEBUT_GRILLE` dans `getSlots()`. Les journées déjà
  ouvertes stockent `debut:'09:00'` : traité comme l'ancien défaut, elles
  passent aussi à 9h30 ; seul un début personnalisé plus tôt est gardé. Les
  RDV pris hors grille (ex. 9h00, 10h00 de l'ancienne grille) restent
  affichés à leur heure **sans faire repartir la grille** (avant, la grille
  s'étirait jusqu'à eux) — pendant la transition, un 10h00 pris peut
  côtoyer un 10h30 libre. Aucun jour de semaine n'est attaché à un lieu :
  le passage de Marmande au mercredi (07/10/2026) n'a demandé aucun code.
- **Une journée s'ouvre toujours sur la grille standard (09:30-16:30),
  jamais sur l'heure du RDV qui la déclenche** (`ensureDayOpen`/
  `migratePermanences`, AGORA AG-001 du 27/09/2026) : figer `debut`/`fin`
  sur cette heure rétrécit silencieusement la grille du sélecteur.
- **Un RDV déplacé depuis l'Agenda (Modifier → Enregistrer) ouvre sa journée
  de destination** (`ensureDayOpen` après l'écriture, 08/10/2026, validé par
  l'utilisateur) : sans ça, le RDV tombait dans une journée « Orpheline ».
  Tout nouveau chemin qui change la date ou la commune d'un RDV doit faire
  de même. Une journée fermée (🗑) avec des RDV reste orpheline : voulu —
  un bouton « 📂 Ouvrir cette journée » la régularise. Le déplacement vérifie
  aussi le créneau d'arrivée (confirmation nommant l'occupant, jamais
  bloquante), comme Générer et « Autre heure ».
- **Rappels de la veille et doublons de fiche dans l'Agenda** (10/10/2026,
  `renderRappelsEtDoublons`) : encadré des RDV actifs du **prochain jour
  ouvré** (lundi si on est vendredi), lapins/excusés/réalisés exclus, SMS
  prêt à copier (modèle `sms_rappel_veille`, modifiable dans Modèles),
  « ✓ Envoyé » noté sur la fiche (`h.rappelVeille` = date du RDV, champ
  ajouté, inclus d'office dans les sauvegardes). Encadré des doublons :
  même personne, même jour, même commune, plusieurs fiches actives, sur les
  30 derniers jours et à venir. Testé en navigateur sur données fictives.
  Si un 3e doublon réel apparaît, sa cause reste à trouver (critère AGORA 3).
- **Téléphone : jamais de troncature silencieuse** (07/10/2026, cas réel :
  un numéro invalide envoyé sans que rien ne le signale, `formatTel`
  coupait à 10 chiffres). `telProblem()` (incomplet, trop long, ne commence
  pas par 01 à 09) alimente un message rouge **permanent** sous le champ de
  Générer — pas seulement un toast au blur, qu'un numéro importé ne
  déclenche jamais — et une confirmation dans `handleGenerate`. `+33`/
  `0033` ramenés à `0`. Même contrôle dès l'import Orientations (ligne
  rouge sur la fiche, compte dans le toast d'import), 08/10/2026.
- **Formule de dépassement/relance centralisée dans `isDepasse()`** : elle
  était dupliquée sur 5-6 endroits, source d'incohérences. Ne pas la
  réécrire en ligne ailleurs.
- **Migrations localStorage** : une migration non testée a déjà réduit 11 CMS
  à 6 sur sms-mail-multi. Toute migration/fusion de données délicate mérite
  un test ciblé avant commit.
- **La commune de « Ouvrir une journée » (Config → Journées) est une liste
  déroulante, pas un champ texte** (27/09/2026, porté depuis SMS-mail) :
  avec le modèle « à la volée », une faute de frappe y créerait une
  journée invisible depuis Générer. Le champ d'édition d'une journée
  existante reste en texte libre.
- **Rétention des sauvegardes GitHub portée à 30 jours** (`GH_BACKUP_RETENTION_JOURS`,
  27/09/2026, porté depuis SMS-mail) : `ghCleanOldBackups()` garde toujours
  la plus récente quel que soit son âge, supprime le reste au-delà du
  seuil, et affiche un toast (scopé par profil) si une suppression échoue.
- **Changer d'onglet re-rend son contenu** : `stats`/`agenda`/`orientations`
  et maintenant `generate` sont explicitement re-rendus au clic sur
  l'onglet (28/09/2026, bug pré-existant trouvé en testant le calendrier —
  un changement de statut fait depuis l'Agenda n'apparaissait pas dans la
  grille de Générer tant qu'aucune action locale n'y forçait un recalcul).
  `showActivePane()` seul ne fait qu'afficher/masquer le panneau déjà
  rendu, jamais le recalculer — tout nouvel onglet a besoin du même
  branchement explicite.
- **Deux usagers différents sur le même créneau — chaîne de correctifs du
  02/10/2026**, repérée sur un cas réel (Boutin/Pergay, 14h Fumel) :
  1. « Autre heure » ne vérifiait aucun conflit (contrairement aux
     pastilles de la grille, qui bloquent un créneau déjà pris) — averti
     désormais par une confirmation nommant l'occupant, jamais bloquant.
  2. Quand le titulaire choisi pour l'affichage était lui-même libéré
     (Excusé/Lapin/Pas de retour), les **autres** usagers libérés sur ce
     créneau disparaissaient complètement du pill — `slot.replaced` n'était
     rendu que dans la branche « titulaire actif ».
  3. Entre plusieurs usagers **tous libérés**, le titulaire était choisi
     par type de message (confirmation > proposition > …) au lieu du plus
     récent — n'a de sens que pour départager des réservations **actives**
     (toujours vrai, non régressé : testé). `matches` préserve l'ordre de
     `S.history`, du plus récent au plus ancien — s'appuyer dessus pour
     tout nouveau tri de ce genre plutôt que retrier par date/heure.
- **Sauts de ligne en trop dans le message généré, quand une démarche n'a pas
  de documents** (19/10/2026, constaté par l'utilisateur, « surtout quand on
  choisit Autre », porté depuis SMS-mail). Dans `fillTemplate`, quand
  `documents` est vide (démarche « Autre », ou « Utilisation des outils
  numériques »), la phrase « Pensez à apporter : » et son contenu étaient
  remplacés par une chaîne vide, mais les deux `\n\n` qui l'entourent dans le
  modèle restaient — 2 à 3 lignes vides d'affilée au lieu d'une. Corrigé en
  aval plutôt que dans chaque regex : `fillTemplate` réduit désormais tout
  saut de ligne triple ou plus à un seul blanc avant de renvoyer le texte
  (`\n{3,}` → `\n\n`) — couvre aussi les modèles personnalisés utilisant la
  même formulation. Testé en isolation (cas « Autre » : plus de blanc en
  trop ; cas avec documents : liste et espacement inchangés).
- **Portage entre jumeaux** : les derniers portages (PR #44 à #50 de SMS-mail,
  #88 à #94 de sms-mail-multi, branche `sms-mail-to-multi-port`) vont de
  SMS-mail vers sms-mail-multi. Quand un sujet est contesté entre les deux,
  écrire ici lequel fait référence plutôt que de converger au hasard.
- **Taux d'occupation (30j et 90j), tranché par l'utilisateur le
  27/09/2026** (même décision que sur SMS-mail) : ne compte que les
  journées réellement ouvertes (au moins un RDV/blocage), pas toute la
  grille hebdomadaire y compris les jours jamais utilisés — reflète
  l'occupation des jours effectivement travaillés. C'est déjà le
  comportement du calendrier « à la volée », aucun changement de code
  n'était nécessaire.
- **Définitions des stats, tranchées par l'utilisateur le 27/09/2026**,
  identiques dans les deux apps (live et `computeYearArchive`) : taux de
  concrétisation et de lapin = ÷ RDV dont la date est passée, hors créneaux
  bloqués (les RDV à venir ne peuvent pas encore être réalisés ni manqués) ;
  courbe Lapin/Excusé/Pas de retour rattachée au **mois du RDV**, pas au
  mois d'envoi du message. Les archives annuelles calculées avant cette date
  gardent l'ancienne définition (plus recalculables).

## Pistes d'amélioration

Règle 22 de MD-LIB `collaboration.md` : au plus 3 pistes, à la fin d'une
fonctionnalité validée ou sur demande de revue. Une piste écartée ne se
repropose pas sans fait nouveau.

**Proposées, en attente**
_(aucune — les deux pistes du 15/10/2026 ont été faites le jour même)_

**Écartées** (date — piste — raison)
- 10/10/2026 — file « à reporter » (CR / Coop), fiche Coop et résumé CR
  prêts à copier — l'utilisateur fait CR et Coop dans la foulée de chaque
  accompagnement : ces outils ajouteraient des clics sans rien éviter.
  À ne reproposer que si un import (CSV/API) côté Coop ou logiciel interne
  permettait de supprimer une saisie, pas d'en préparer une.
