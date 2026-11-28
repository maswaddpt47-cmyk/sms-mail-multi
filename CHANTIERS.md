# CHANTIERS — sms-mail-multi

État au **27/11/2026 à 23:50** (Paris), base `main` = commit de ces notes (code `bd11506` : AG-040). **Un bloc AGORA ouvert : AG-040** (une inscription dont la description ne change que d'ordre ou d'espaces est la même ; livré, essai de l'utilisateur validé le 27/11 à 23:26 : 50→25 et 48→24 inscriptions ; relecture Codex reçue : verdict amendé, 3 écarts à trancher). AG-036 à AG-039 tranchés le 27/11. **Un point grave hors code à suivre** : d'anciennes sauvegardes d'usagers restent publiques via les références de PR ; ticket GitHub Support envoyé, réponse à attendre. Invariants dans `INVARIANTS.md`.

## Chantiers ouverts

- **AG-040, ateliers dont les inscrits apparaissent deux fois** (27/11) : l'utilisateur voit 50 et 48 inscriptions le lundi 30/11 (Ateliers Cité Sco 6C et 6D), les mêmes noms deux fois ; la ligne de diagnostic dit « diffèrent par : titre ; description (ordre ou espaces seulement) », sans UID. **Livré** (`bd11506`) ; **essai de l'utilisateur validé le 27/11 à 23:26** (capture) : après « Retirer les anciennes versions », 6C = 25 inscriptions (50 avant), 6D = 24 (48 avant). **Revue Codex reçue (`2e38956`, verdict amendé, données fictives)** : R1 l'équivalence contourne le refus des versions contradictoires entre fichiers (actif/annulé : le dernier fichier décide) ; R2 l'ordre des lignes change l'objet (1re ligne) donc la visibilité AG-039 ; R3 les espaces de « Participant : » ne sont pas couverts ; le diagnostic « ordre ou espaces » ignore la multiplicité des lignes ; le passage 50→25 n'est pas prouvé par le code, seulement constaté par l'utilisateur. **Tranché : option A** (l'objet reste dans l'identité) ; **R1, R2, R3 et le diagnostic corrigés** (jeton `gdin-20261127-15`, 5 mutants rejetés, 13 scripts ok). Conséquence : des doublons dont la 1re ligne diffère ne sont plus proposés au retrait. Pas de nouveau tour Codex (règle 58) ; ton essai sur l'écran reste à faire après rechargement. Reste inexpliqué : « 52 inscription(s) GDIN masquée(s) » dans le texte du Calendrier (non vérifié). **À faire côté Codex** : dire « pull ».
- **Écart non expliqué à l'import** (27/11) : restauration GitHub sur téléphone annoncée 104 événements (265 inscriptions) contre 103 (317) dans la sauvegarde ; cause non établie (téléphone en retard, ou nettoyage de doublons fait d'un seul côté : non vérifié). Réimport ICS vérifié propre le 27/11 (« 0 ajoutés · 58 déjà présents » : AG-035 validé).
- **Contrôle utilisateur du lot du 22/11** (jamais validé par lui, vérifié sur données fictives seulement) : Données (dernière sauvegarde, envoi, échec, reprise), puce RDV des Orientations, aperçu ICS « Voir les événements à importer ».
- **Phase de tests de l'utilisateur** (depuis le 01/11) : pas de développement sans sa demande ; les orientations n'existent que sur l'appareil où elles sont importées ; le bandeau « Backup GitHub plus récent » restaure tout l'appareil ; hypothèses métier non confirmées : « Date de la demande » = réception, « Structure » = CMS.
- **Contrôles visuels restant à l'utilisateur** : menu latéral replié (ordinateur), contraste des tuiles en mode nuit, tuiles cliquables des Statistiques jour/nuit.
- **Rappel programmé** (règle 70) : tâche « Audit Codex trimestriel des chiffres — sms-mail-multi », 28/01, 28/04, 28/07, 28/10 à 10:13 Paris (premier passage le 28/01/2027) ; elle ouvre un bloc critère 7 et dit « pull à Codex », sans rien auditer elle-même ; diagnostic sur données réelles dans le navigateur de l'utilisateur, nombres seuls (règle 59). Dernier audit des calculs : 30/10/2026. Audit sécurité : autre tâche, prochain passage 01/01/2027.

## Décisions à trancher

Toute entrée dit si elle ouvre un bloc `AGORA.md` ou non, et pourquoi.

- **Anciennes sauvegardes encore publiques via les références de PR** (27/11, **grave, en cours**) : `backups/{michel,cynthia}/backup-*.json` de juillet 2026 (noms, téléphones, démarches d'usagers réels ; 21 fichiers) lisibles sans compte via **82 références de PR (`refs/pull/*/head`, dont 36 à 50)** ; la purge du 02/09 (vérifiée par `--depth 1`) ne les voyait pas ; personne ne peut les supprimer sauf GitHub ; confirmé en navigation privée. **Ticket GitHub Support envoyé le 27/11 à 21:56** (numéro chez l'utilisateur, jamais dans le dépôt). **À faire** : lire la réponse, re-tester en navigation privée `https://github.com/maswaddpt47-cmyk/sms-mail-multi/tree/3fa7d23ccdeceb743a47f41ded7852e2174bb220/backups` (doit être introuvable), compteur « Forks » (0 attendu), même vérification sur `SMS-mail` (gelé). Autres options : dépôt privé (Pages gratuit perdu) ou recréation. RGPD art. 33 (72 h) : à apprécier par l'utilisateur. Pas de bloc AGORA.
- **Nom d'usager issu d'une capture : traité le 27/11** (réécriture ciblée de 5 commits, vérifiée par clone miroir ; SHAs `c64706d`→`93a193c`, `800a922`→`ec6a081`, `ac0167d`→`61e8f71`, `7a5c002`→`0c10dcb`, `a04fc62`→`e49387d` ; autres sessions à resynchroniser). **Jamais `git filter-repo` sur un clone de session** (clone partiel : historique tronqué). Ne jamais reprendre un nom vu sur une capture, même pour un test.


## Passation — reprise de session (27/11/2026 à 23:19)

- **Première action** : s'il a une réponse de GitHub Support, la lire d'abord et refaire le test en navigation privée de l'adresse d'arborescence (voir « Décisions à trancher »).
- **État vérifié** : `main` et la branche de session sont alignées ; la suite des 13 scripts passe en local ; le déploiement est à vérifier pour le dernier commit avant d'écrire « en ligne ». Codex doit **se resynchroniser** (SHAs de 5 commits réécrits le 27/11, voir plus bas).
- **Acquis de la session** : AG-036 (couleur par objet), AG-037 (compteur d'import), AG-038 (RDV de l'Agenda dans le Calendrier), AG-039 (journée d'Agenda masque les séances GDIN hors ateliers) tranchés ; AG-040 livré. Textes intégraux : `git log -p AGORA.md`.
- **Pièges rencontrés, à ne pas répéter** : `git filter-repo` sur un clone de session (clone partiel) ; reprendre un nom vu sur une capture dans un test ; coche « Suppressions » du formulaire GitHub (= suppression du dépôt) ; annoncer une heure de tête (lire `TZ=Europe/Paris date`) ; compter des mutants « rejetés » sur une base de tests déjà en échec.
- **Pistes en attente** : voir « Pistes d'amélioration » ; aucune décision utilisateur en attente hors AG-040 et le ticket GitHub.

## Chantiers bloqués ou arrêtés

- **Liaison SMS sans copier-coller** (21/10) : aucun lien fiable de préremplissage Google Messages Web (ne pas inventer `phone`/`body`) ; SMSGate sans CORS, relais serveur nécessaire, rien mis en place (dépendance à soumettre à l'AGORA) ; WhatsApp : compte requis.
- **Espacements SMS** : arrêté après `45d182c` ; acquis : une ligne vide max entre paragraphes, CRLF normalisés, e-mails inchangés ; rendu Google Messages réel à confirmer, ne pas annoncer résolu.

## Points à ne pas défaire

Sortis de ce fichier le 27/11/2026 à la demande de l'utilisateur : voir **`INVARIANTS.md`** (données et RGPD, statistiques et bilan, Agenda, Calendrier GDIN, rendu, outils). Lire la section du sujet avant de modifier le code concerné ; y ajouter l'invariant d'une tâche terminée.

## Pistes d'amélioration

Règle 22 de MD-LIB ; ne pas reproposer une piste écartée sans fait nouveau.

**En attente**
- **Comptage demandes → RDV par CMS** (16/11, suite d'AG-033) : orientations devenues RDV dans « Activité par CMS » ; critère 7, bloc avant le code ; fiches antérieures au 16/11 sans lien ; réimport Excel = nouvelles orientations (Codex), aucun taux certifiable sur ce seul champ.
- **Badge « ⚠️ 2 RDV »** sur une tuile à deux RDV actifs (01/11) : seulement si une double réservation réelle réapparaît ; différé.
- **Second lot Activité par CMS** (démarches, doublons d'orientations signalés sans fusion) ; **créneaux libérés puis réattribués** (vérifier d'abord que les événements sont conservés) ; **rappels, relances et lapins** (exploratoire, associations seulement) ; **parcours individuels** reportés, sans identifiant de personne.

**Écartées** (date — piste — raison)
- 27/11/2026 — tolérer une faute de frappe dans le prénom GDIN pour rapprocher de l'Agenda — « très rare », règle stricte conservée (la raison s'affiche) ; à ne pas reproposer sans fautes fréquentes.
- 24/11/2026 — retirer une période du Calendrier avant réimport ; reporter téléphone et adresse du Calendrier ou d'un import ICS de l'Agenda dans les fiches — « laisse tomber » : réimport propre depuis AG-035. Limite de l'import ICS de l'Agenda (Données → Importer ICS) : reconnaissance par date + heure + lieu, un inscrit par créneau.
- 31/10 — domaine dédié pour le `localStorage` du jeton GitHub — « oublie ».

## Retest du 28/11/2026 — continuité et reprise de sms-mail-multi

Version testée : `8b9cfa1d96231e3b2892f9a5832956007e0b4349`

Données : fictives

Verdict : partiel

Preuves : comparaison avec `9887d04b3b38c029a32d09e177c4cade114e1b6b`, essais dans un worktree détaché au SHA testé, resté sans modification. `check-ecritures.js`, `check-calendar.js` et `check-erreurs-github.js` passent chacun en UTC et Europe/Paris ; huit scénarios GitHub simulés (fichier/dernier × annulation/confirmation/profil changé/panne de stockage) passent dans chaque fuseau. [CI du SHA testé : réussite](https://github.com/maswaddpt47-cmyk/sms-mail-multi/actions/runs/46077245430).

- **Diff et périmètre** : depuis la version comparée, restauration GitHub soumise à confirmation, export/restauration des étapes du Calendrier (`calendarStages`), décompte ICS annoncé avant remplacement, projection Agenda et normalisation des imports. Aucun changement d'API ou de base partagée avec un autre projet identifié ; les vérifications communes couvrent les deux entrées GitHub avec la même simulation, sans appel au dépôt privé. La réserve ancienne « Restaurer depuis GitHub n'a pas de confirmation » est levée pour cette version, sur essais fictifs.
- **Reprise dans Chromium vierge, à 390 px** : fichiers JSON fictifs réellement exportés/téléchargés puis importés pour les quatre profils applicatifs ; confirmation nommant la destination, absence d'écriture avant confirmation et annulation neutre vérifiées. Export préalable vérifié sur un profil ; remplacement des champs du profil et des réglages communs annoncés, conservation des données des autres profils, ICS bruts (trois inscriptions dont un doublon déjà stocké, clés/contenus conservés) et choix de couleur vérifiés pour les quatre. Aucun dédoublonnage automatique pendant restauration/rendu. JSON invalide et choix de couleur invalide refusés sans écriture. Restauration GitHub par l'interface, réseau simulé : confirmation nommant profil et fichier, annulation, remplacement et JSON invalide vérifiés ; préférences locales déjà réglées conservées. Messages, Agenda, Calendrier, Historique et Statistiques ouverts sans erreur JavaScript. Le scénario navigateur fictif complet a duré 14 secondes : ce n'est pas une mesure du délai de reprise réel.
- **Accès de secours** : l'URL publique `https://maswaddpt47-cmyk.github.io/sms-mail-multi/` a répondu HTTP 200 avec `APP_VERSION.sha='8b9cfa1'` lors du contrôle. Une récupération JSON locale sans jeton a réussi sur navigateur vierge une fois l'application chargée. Pour la voie GitHub, un accès au dépôt privé et un jeton valide doivent être disponibles séparément du navigateur perdu ; le jeton n'est pas dans l'export. Aucun jeton réel ni accès privé n'a été éprouvé par l'IA.
- **Fraîcheur réelle déclarée, distincte des essais** : l'utilisateur indique une copie du **27/11/2026 à 23h26 (Paris)** pour **son seul profil actif** et confirme son accès au dépôt depuis un appareil de secours ; les autres profils sont déclarés inactifs. Au contrôle du 28/11/2026 à 20h37 (Paris), cette date avait environ 21 h 11 d'ancienneté. Aucun contenu de cette copie n'a été ouvert ; sa complétude et la couverture des modifications postérieures ne sont pas établies. Le voyant local `gh-last-backup` représente le dernier envoi réussi de ce navigateur, pas une preuve globale de couverture de chaque appareil/profil.
- **Préférences sur un appareil vierge** : rétablir le jeton GitHub, le thème, le lien Google/Outlook, les délais de relance et de réponse, les favoris, les modèles masqués, le repli du menu et les dernières sélections/vues selon le besoin. Sur données fictives, thème/lien calendrier/deux délais ont été remis par les commandes réelles de Configuration ; les nouvelles couleurs par objet, elles, sont bien restaurées par la sauvegarde. Les modèles personnalisés distincts (`customTemplates`) sont également restaurés.
- **Réserve héritée — modèles intégrés modifiés** : `templates` est exporté mais ignoré par `doImport` (`index.html:2556`, `2645`). Ce champ est actif : les modèles par défaut peuvent être modifiés et servent aux messages. Rejeu fictif : le marqueur du modèle source est présent dans le JSON, mais n'est pas rétabli sur le secours ; une destination déjà configurée garde son propre texte. Limite déjà présente dans `9887d04`, pas une régression introduite par le diff.
- **Réserve héritée — numéro des mandats** : `ess-mandat-counter` est hors export et `generateMandatNum` ne tient pas compte des mandats restaurés (`index.html:7255-7260`). Rejeu fictif sur navigateur vierge : mandat restauré `MAN-2026-0001`, prochain numéro généré `MAN-2026-0001` également. Reprendre/sécuriser ce compteur avant de produire un nouveau mandat sur le secours. Limite déjà présente dans la version comparée.

Limites : essais uniquement sur données fictives ; ni lecture de sauvegarde réelle, ni restauration en production, ni vérification indépendante du jeton/de la copie privée. L'accès et la date réels ci-dessus sont déclarés par l'utilisateur. Panne complète de GitHub/Pages, premier chargement hors réseau, téléphone physique, volumes réels et reprise complète sous un jour non démontrés. Aucune modification du code applicatif ; les deux réserves préexistantes empêchent de conclure à une reprise complète sans remise en état.

Prochaine étape : décider puis traiter la reprise des modèles intégrés personnalisés et du compteur des mandats, noter les valeurs des réglages locaux du poste actuel, puis rejouer ces deux points avant une bascule réelle. Toute correction applicative reste soumise à l'accord explicite de l'utilisateur ; ce retest ne la réalise pas.

**Suivi du retest (28/11)** : réserve « numéro des mandats » **corrigée** (option C) : `compteurMandat()` prend le plus grand entre `ess-mandat-counter` et les numéros des mandats conservés/restaurés ; aucun changement de format d'export ; 4 cas fictifs + mutant rejeté + 13 scripts ok. Reste ouverte : modèles intégrés modifiés (`templates`) exportés mais ignorés à l'import — touche un format de stockage, bloc AGORA avant le code, en attente de ta décision.
