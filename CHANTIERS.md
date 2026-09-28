# CHANTIERS — sms-mail-multi

État au **27/09/2026**, commit de référence `8621084` (`main`).

Carnet de reprise : ce qu'une session sans historique doit savoir pour
continuer. Mis à jour à chaque avancée, pas en fin de session. Une tâche
terminée **sort** de ce fichier (son récit est dans `git log`) ; seul ce qui
ne doit pas être défait remonte dans la dernière section.

## Décisions à trancher

Aucune pour l'instant. Toute entrée ajoutée ici dit si elle ouvre un bloc
`AGORA.md` ou non, et pourquoi.

## Chantiers restants (par priorité)

1. **Calendrier « à la volée » — en cours de validation en conditions
   réelles (mis à jour le 28/09/2026).** Porté depuis SMS-mail avec le
   correctif AG-001 déjà intégré (`ensureDayOpen` ouvre toujours
   09:00-16:30, jamais sur l'heure du RDV déclencheur). Premier signal réel
   positif le 28/09 : l'utilisateur a retrouvé et modifié un RDV du 14/10
   sur le profil « michel » depuis l'Agenda (la migration a donc bien
   préservé l'historique de ce profil) — mais ça a révélé un **second bug,
   pré-existant, pas lié à la refonte** : changer le statut d'un RDV en
   « Pas de retour » depuis le popup Agenda ne libérait pas le créneau
   dans Générer, parce que changer d'onglet ne re-rendait pas Générer
   (corrigé dans `0389cb5`). **Toujours pas de confirmation explicite « ça
   marche »** de l'utilisateur — ne pas présumer que ce point est clos
   avant qu'il le dise. Spécifique au multi-profil, testé seulement par
   script Node : le sélecteur d'agenda « mon agenda / collègue / tous »
   (`permanencesOuvertesDe`), qui rejoue la migration en mémoire pour un
   autre profil sans jamais l'écrire dans son localStorage.
2. **RGPD point 4 — à charge de l'utilisateur** : vérifier avec le Conseil
   Départemental si ce traitement figure au registre RGPD / si le DPO est
   informé. Seul point du plan de remédiation encore ouvert (`CLAUDE.md`).
3. **Dérive SMS-mail ↔ sms-mail-multi — audit du 26/09/2026, oublis de
   portage corrigés le 27/09/2026.** `check-drift.js` donne 3 faux positifs
   (`normCommune`, `exportHistoryCSV`, `exportOrientationsCSV` en partie : son
   analyseur prend l'apostrophe de la regex `/[-\s']+/` pour une chaîne). Le
   reste des écarts est voulu (multi-profil) ou cosmétique. **Résolu par le
   portage ci-dessus** : la question de la fenêtre Agenda (8 sem./12 contre
   4/8) ne se pose plus, il n'y a plus de fenêtre. **Non jugé** :
   `handleGenerate` compare la commune strictement dans SMS-mail, avec
   tolérance « commune vide » dans multi.
4. **Script de ménage de ce fichier** (`scripts/check-chantiers.sh`, hook
   `SessionStart`) : à copier depuis `ATELIERS_NEWGEN` — reporté le
   26/09/2026 par l'utilisateur, utile quand ce fichier aura grossi.

## Points à ne pas défaire

- **Aucune donnée d'usager dans un repo public**, même temporairement :
  pas de `backups/`, pas d'export JSON. Les sauvegardes partent vers le repo
  privé `GH_REPO='maswaddpt47-cmyk/sms-mail-multi-backups'` (`index.html`).
- **Rétention RGPD** (`archiveYear`) : supprime le détail nominatif d'une
  année révolue après agrégation anonymisée — irréversible, confirmation
  obligatoire à conserver.
- **Cloisonnement par profil** : toute donnée d'usager passe par les clés `ess-<profil>-…` (`pk`/`pkFor`). Une migration ou un archivage sur un profil ne doit toucher aucune clé d'un autre profil.
- **Une journée s'ouvre toujours sur 09:00-16:30, jamais sur l'heure du RDV
  qui la déclenche** (`ensureDayOpen`/`migratePermanences`, correctif
  AGORA AG-001 porté depuis SMS-mail le 27/09/2026) : figer `debut`/`fin`
  sur cette heure rétrécit silencieusement la grille du sélecteur.
  `getSlots()` a en plus un filet de sécurité (`start=Math.min(start,09:00)`),
  mais ne pas en dépendre pour réintroduire cette écriture ailleurs.
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
