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

- **Audit trimestriel du 01/10/2026 — important** : le jeton GitHub
  (`ess-gh-token`) et l'historique des usagers sont en `localStorage` sur
  l'origine `maswaddpt47-cmyk.github.io`, **partagée** avec NEWGEN, NextStep
  et GDINV2 : une faille d'injection dans n'importe laquelle de ces applis
  peut les lire (une est relevée dans NEWGEN, à corriger là-bas). Pistes :
  jeton GitHub à grain fin, limité au seul dépôt de sauvegarde en écriture
  de contenu, avec expiration ; à terme, une adresse propre à cette appli
  (domaine ou sous-domaine dédié). Non vérifié : portée réelle du jeton
  actuel. **Mineur RGPD** : polices chargées depuis `fonts.googleapis.com`
  (adresse IP transmise à Google, hors UE) — les héberger dans le dépôt.

1. **RGPD point 4 — à charge de l'utilisateur** : vérifier avec le Conseil
   Départemental si ce traitement figure au registre RGPD / si le DPO est
   informé. Seul point du plan de remédiation encore ouvert (`CLAUDE.md`).
2. **Dérive SMS-mail ↔ sms-mail-multi — audit du 26/09/2026, oublis de
   portage corrigés le 27/09/2026.** `check-drift.js` donne 3 faux positifs
   (`normCommune`, `exportHistoryCSV`, `exportOrientationsCSV` en partie : son
   analyseur prend l'apostrophe de la regex `/[-\s']+/` pour une chaîne). Le
   reste des écarts est voulu (multi-profil) ou cosmétique. **Résolu par le
   calendrier « à la volée »** : la question de la fenêtre Agenda (8 sem./12
   contre 4/8) ne se pose plus, il n'y a plus de fenêtre. **Non jugé** :
   `handleGenerate` compare la commune strictement dans SMS-mail, avec
   tolérance « commune vide » dans multi.
3. **Script de ménage de ce fichier** (`scripts/check-chantiers.sh`, hook
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
- **Calendrier « à la volée », validé en conditions réelles le 28/09/2026**
  sur le profil « michel » : migration testée (RDV existants retrouvés
  dans l'Agenda), création de RDV, changement de statut. Un bug trouvé au
  passage et corrigé, pas lié à la refonte elle-même : la libération d'un
  créneau n'apparaissait pas sans changer d'onglet (`0389cb5`). Un doublon
  de fiche isolé du 23/09 (avant la refonte, cause non identifiée avec
  certitude) empêchait aussi un créneau de se libérer — supprimé
  manuellement par l'utilisateur. Le sélecteur d'agenda multi-profil
  (« mon agenda / collègue / tous », `permanencesOuvertesDe`) reste testé
  seulement par script Node, pas vérifié en conditions réelles avec un
  second profil.
- **Un champ de saisie ne déclenche jamais un rebuild complet du
  formulaire tant qu'on tape dedans** (30/09/2026, trouvé sur le champ
  « Autre heure ») : `onInput` fait une mise à jour légère
  (`regen()+updatePreviewOnly()`), la reconstruction complète
  (`setFieldSave`/`renderGenerate`) attend `onBlur` — sinon un input
  segmenté (`type="time"`) perd le focus en pleine frappe dès qu'un
  segment devient valide. Pattern déjà utilisé sur `nomIn`, à reprendre
  pour tout nouveau champ de ce genre.
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
