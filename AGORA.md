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
l'utilisateur la phrase à coller ailleurs (« pull maswaddpt47-cmyk/sms-mail-multi,
lis son AGORA.md, réponds à AG-00N, tu es la session B »), l'autre session répond, l'utilisateur tranche.
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

**Phrase de relais pour Codex** (décision de l'utilisateur du 29/10/2026 pour GDINV2, reprise ici le 31/10/2026 :
recopier ses réponses à la main ne se justifie plus). Elle remplace « ne modifie rien » :

> pull **maswaddpt47-cmyk/sms-mail-multi**, lis son `AGORA.md` et [réponds à AG-00N | vérifie l'étape N d'AG-013 : commits …].
> Autorisation exceptionnelle de l'utilisateur : tu peux modifier **un seul fichier, `AGORA.md`**, en y **ajoutant**
> ta réponse (`### Réponse — Codex — JJ/MM/AAAA` sous le bloc, ou `### Vérification de l'étape N — Codex — JJ/MM/AAAA`
> dans « Vérification des étapes d'AG-013 »), selon le gabarit du fichier, avec fichier:ligne. N'édite aucun autre bloc
> ni aucun autre fichier. Commite et pousse directement sur `main`.

**Variante clôture d'une étape** (décision de l'utilisateur du 31/10/2026, après 9 « amendé » de suite sur l'étape 2 : chaque tour
explorait le voisinage du dernier correctif). Remplacer « vérifie l'étape N d'AG-013 : commits … » par :

> fais la vérification de clôture de l'étape N d'AG-013 (commits …) : inventorie en une seule passe **tous** les cas restants sur
> l'ensemble du périmètre de l'étape, pas seulement les commits cités, et classe chacun « probable en usage réel » ou « théorique »
> (panne ponctuelle du stockage, donnée déjà corrompue…), avec fichier:ligne et scénario reproduit.

S'il ne reste que des cas « théoriques », l'utilisateur peut clore l'étape et les inscrire comme risque accepté dans `CHANTIERS.md`.

Codex doit alors pouvoir écrire (lever « Lecture seule » pour cette passe). L'utilisateur écrit ensuite « pull » à la
session Claude, qui contrôle `git show --stat <sha>` : seul `AGORA.md` est touché, et `git diff` n'ajoute que des lignes
(aucun bloc existant modifié). Sinon, annuler le commit et inscrire la réponse à la main. Le code reste interdit à Codex.

## Gabarit

```markdown
## AG-00N — Titre court — ouvert le JJ/MM/AAAA
**Auteur** : session <8 car. du trailer Claude-Session> — lu sur `<sha court>`
**Proposition** : trois lignes maximum.
**Critère déclencheur** : n° et lequel (`CLAUDE.md`, section AGORA).
**Contradicteur** : Codex | session B (Codex répond seul au « pull » de l'utilisateur, `AGENTS.md`)
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

Un bloc tranché sort du fichier : sa conclusion remonte dans `INVARIANTS.md`
(points à ne pas défaire) ou dans `CLAUDE.md` si elle devient une règle ; le
récit reste dans `git log`.

---

# Blocs ouverts

## AG-040 — Calendrier : une inscription dont la description ne change que d'ordre ou d'espaces est la même inscription — ouvert le 27/11/2026
**Auteur** : session 01Sptc2f — lu sur `b70dec9`
**Proposition** : `normKey` (identité normalisée d'une inscription GDIN, `calendar.js`) écarte déjà les lignes de contact (AG-035). Elle ignorera aussi, pour la description, **l'ordre des lignes, les espaces de début/fin de ligne et les espaces répétés**. Deux inscriptions qui ne diffèrent que par cela (même numéro de demande, même action, mêmes début, fin, titre et lieu) deviennent des doublons : le volet « Doublons d'import » existant les propose au retrait (confirmation obligatoire, version aux contacts les plus complets gardée), et un futur import ne les recrée pas (`byNorm`). **Aucune clé stockée n'est réécrite, aucune migration, aucun retrait automatique.**
**Critère déclencheur** : 1 (identité d'une inscription = contrat entre le stockage et l'import), 7 (nombre d'inscriptions affiché : un atelier de 50 pourrait passer à 25), 5 (étend la définition de doublon d'AG-035).
**Contradicteur** : Codex (auteur Claude → Codex, `agora.md` §12)
**Constat de l'utilisateur (27/11)** : sur un atelier GDIN de 50 inscriptions, la ligne de diagnostic dit « diffèrent par : titre ; description (ordre ou espaces seulement) », aucun UID n'y figure (même numéro de demande pour tous), et il voit les mêmes noms **deux fois** dans la liste. Les deux autres ateliers du même jour sont dans le même cas (48 inscriptions). Rejeu fictif : un inscrit en deux lignes dont l'ordre diffère = 2 inscriptions stockées, 0 groupe détecté par le panel actuel, un réimport ne change rien.
**Définitions métier (à contredire)** : *même inscription* = même clé d'identité après (a) retrait des lignes de contact, (b) `trim` et espaces répétés réduits par ligne, (c) lignes triées. Le **titre** reste dans l'identité (deux personnes ne fusionnent jamais). Une ligne qui diffère par le texte (pas par l'ordre) reste une différence.
**Ce que ça engage** : un nombre affiché qui baisse **si l'utilisateur confirme** le retrait ; aucune suppression automatique ; un retrait ne se défait pas depuis l'écran (il se rejoue par réimport du fichier, qui, avec cette règle, ne recrée pas le doublon).
**Non vérifié par l'auteur** : que les 50 contiennent bien 25 noms en double (hypothèse confirmée par la ligne de diagnostic et par la simple lecture de l'utilisateur, pas par un comptage) ; le cas de deux vraies inscriptions du même nom au même créneau (homonymes) : elles fusionneraient ; le poids des gros fichiers (tri de lignes pour 5 000 événements).
**Si personne ne répond, je fais quoi ?** — je livre avec ces définitions et je le dis dans CHANTIERS ; l'utilisateur tranche après essai.
**Où regarder** : calendar.js (`normKey`, `duplicates`, `merge`/`byNorm`, texte du volet « Doublons d'import »).

### Suite — Claude — 27/11/2026 — livré (commit « feat: Calendrier — une inscription dont la description ne change que d'ordre ou d'espaces… », jeton `gdin-20261127-14`)
**Livré tel que défini** : `normDescription` (contacts écartés, espaces par ligne réduits, lignes triées) utilisé par `normKey` ; `merge` retrouve une inscription par son identité normalisée **et complète l'index au fil de l'import** (deux lignes d'un même fichier qui ne diffèrent que par l'ordre ou les espaces ne créent plus qu'une inscription) ; texte du volet « Doublons d'import » complété. Aucune clé stockée réécrite, aucun retrait automatique : un doublon déjà stocké est proposé au retrait, confirmé par l'utilisateur. **Vérifié** : 13 scripts ✅ ; 6 mutants sur 6 rejetés ; Chromium à 390 px sur données fictives (3 inscriptions stockées dont un doublon d'ordre → volet visible → 2 après retrait confirmé ; réimport du même fichier : « 0 ajoutés · 1 mis à jour · 2 déjà présents », 2 stockées). **Écart à connaître** : un réimport après nettoyage annonce « 1 mis à jour » (la description de l'inscription gardée prend l'ordre de la dernière ligne lue), sans création. **Non vérifié** : le comptage réel sur les ateliers de l'utilisateur (hypothèse « les inscrits sont deux fois dans les fichiers ») ; deux vraies inscriptions homonymes au même créneau (elles fusionneraient) ; gros fichiers (tri de lignes). **Attendu** : relecture de Codex (critères 1, 5 et 7), essai de l'utilisateur (ateliers du 30/11, 50 et 48 inscriptions : un nombre voisin de la moitié est attendu après retrait), sa décision.


# Blocs tranchés
- **AG-039** — Calendrier : une journée d'Agenda masque les séances GDIN individuelles du même lieu, ateliers conservés — ouvert le 27/11 (`b438ff7`), livré (`dca4dcd`) — **amendé** par Codex (`96abceb` : R1 protection des ateliers dépendante de l'option « Regrouper », R2 bloc masqué sans date ni lieu, R3 lieu inconnu), R1 et R2 corrigés (`2fde1e6`) ; **tranché le 27/11/2026 par l'utilisateur** (« 1 tranché ») : **R3 : un lieu inconnu reste compatible** (comportement conservé). Définitions actées : journée d'Agenda = jour Paris + lieu avec au moins un RDV projeté ; exceptions = étapes Atelier, Intervention, Sondage, Réservation (étapes canoniques, indépendantes de l'affichage) ; journées entières jamais masquées ; masqué = compté et consultable, jamais supprimé. Textes intégraux : `git log -p AGORA.md`.
- **AG-038** — Calendrier : RDV de l'Agenda affichés en lecture seule, l'Agenda primant sur les doublons GDIN — ouvert le 27/11 (livré `93a193c`, SHA réécrit après la purge de l'historique) — **amendé** par Codex trois fois (contrat `eee5bc5` R1-R4 ; livraison R1 fiche RDV réelle, R2 heure invalide, R3 portée des nombres ; modification de définition `1f19f6b` : inscriptions d'un RDV replié consultables), toutes corrigées ; **tranché le 27/11/2026 à 22:19 par l'utilisateur** (« Tranché », après « Propre » sur ses vraies données). Définitions actées : rapprochement par inscription (même début, identité complète NOM Prénom, lieux non incompatibles, une seule fiche Agenda candidate), plusieurs inscriptions GDIN de la même personne toutes masquées, rang dans un créneau (réalisé ou confirmé > en attente > libérés), clic = vraie fiche RDV. Risque accepté : deux homonymes au même horaire masqués ensemble (consultables dans le détail). Textes intégraux : `git log -p AGORA.md`.
- **AG-037** — Confirmation d'import : nombre d'événements du calendrier remplacés — ouvert et livré le 27/11 (`70f12ab`) — **confirmé** par Codex (`5b3f7e9`) sans amendement ; **tranché le 27/11/2026 par l'utilisateur** (« oui » à la définition : événements regroupés comme l'écran, annulés compris, hors filtre et hors période ; inscriptions à part ; illisible = « nombre indisponible »). Textes intégraux : `git log -p AGORA.md`.
- **AG-036** — Calendrier : étape (couleur) choisie par l'utilisateur, par objet — ouvert le 27/11 (`d71440f`), livré (`84014f5`) — **amendé** par Codex (`592c2f5` contrat : R1 absent/vide/invalide à la restauration, R2 objet vide ; `5b3f7e9` livraison : R1 conflit entre onglets, R2 `__proto__` perdu, R3 validation sans module), corrigé (`a22c99b`) ; **tranché le 27/11/2026 par l'utilisateur** (« tranché », après « le changement de couleur fonctionne » sur son téléphone). Textes intégraux : `git log -p AGORA.md`.
- **AG-035** — Calendrier : réimport sans doublon et retrait des doublons — ouvert le 24/11 (`3fe270f`), livré (`6b29de0`) — **amendé** par Codex (`b13b21a` : R1 doublon recréé après nettoyage, R2 contact perdu, R3 retrait plus large que confirmé), corrigé (`d909efd`) ; la première hypothèse (seuls les contacts diffèrent) était fausse : le diagnostic de l'utilisateur (lignes sans libellé) a conduit à reconnaître numéro et adresse seuls sur leur ligne (`d3889fb`) ; coordonnées affichées dans le détail (`007aada`) ; **tranché le 24/11/2026 à 23:20 par l'utilisateur** (« ça fonctionne »). Textes intégraux : `git log -p AGORA.md`.

- **AG-033** — Lien orientation → dossier, orientation marquée traitée à l'enregistrement — ouvert et livré le 16/11 (`52e4b8d`) — **amendé** par Codex (`5ccd9f1` : R1 écritures séparées, R2 lien remplacé à la fusion, R3 copie sans lien), corrigé (`6556ae3`, tests `b6ee664`) ; **tranché le 19/11/2026 à 21:01 par l'utilisateur** (« c'est bon, clôture ») : « Traitée » = message préparé et enregistré ; lien visible seulement sur l'appareil des orientations ; suppression de la fiche sans réactivation. Correctifs non relus par Codex (règle 58).
- **AG-034** — En-tête des journées de l'Agenda aligné sur « Prochaines permanences » — ouvert et livré le 18/11 (`c166ea9`), **tranché le 19/11/2026 à 19:37** — **confirmé** par Codex (`45ec39b`) sans amendement, validé par l'utilisateur (« ça fonctionne ») : mêmes chiffres que `statsRdvModel`, journées passées sans compte de places.
- **AG-032** — Calendrier inclus dans la sauvegarde et la restauration — ouvert le 09/11 (`9953d5e`), Q1 « remplacement » validée par l'utilisateur — **amendé** par Codex (`9fdfe61` : R1 vide explicite, R2 sauvegarde automatique, R3 restauration GitHub > 1 Mo), corrigé (`321507a`) ; **tranché le 09/11/2026 à 08:23 par l'utilisateur** (« ça marche », après essai). Ancienne sauvegarde sans `calendarIcs` : calendrier conservé ; champ invalide : import refusé. Non mesuré : envoi réel de plusieurs Mo vers GitHub.
- **AG-031** — Calendrier : semaine et mois sans samedi ni dimanche — ouvert le 06/11 (`e69a0c8`), livré (`1f2e3f1`) — **confirmé** par Codex (`e2439b2`) sans amendement ; **tranché le 07/11/2026 à 09:36 par l'utilisateur** (« oui »). Jours fériés conservés ; événement visible seulement le week-end compté avec « Voir en vue Jour ».
- **AG-029** — Calendrier GDIN : inscriptions, séances et réimport — ouvert et livré le 06/11 par Codex (`e14fef5`) — **amendé** par la session B (`5120a57` : D1, inscriptions au même titre fusionnées ; D2, activité absente = groupe distinct), corrigé par Codex (`25de67d`), complément d'affichage de l'objet et filtre « Objet » (`249a271`) ; **tranché le 06/11/2026 à 21:03 par l'utilisateur** (« clos »). Identité composite, aucune suppression sur absence, aucune migration.
- **AG-028** — Calendrier visuel et import ICS local — ouvert et livré le 06/11 par Codex (`9493963`) — **aucune réponse de contradicteur** ; **tranché le 06/11/2026 à 21:03 par l'utilisateur** (« clos ») sans relecture externe. Clé `ess-<profil>-calendar-ics-v1`, imports hors sauvegardes de l'application (conserver les ICS d'origine), heure de Paris.
- **AG-030** — Calendrier : deux versions d'une inscription dans un même fichier ICS — ouvert le 06/11 (`2b64ced`), livré (`7e83ca2`) — **amendé** par Codex (`96bae47` : compteurs A/B/A et copies identiques), corrigé (`c986c2f`) ; **tranché le 06/11/2026 à 20:56 par l'utilisateur** (« je valide ») : la dernière ligne du fichier est gardée, annoncée dans l'aperçu comme ne prouvant pas la chronologie ; refus conservé entre fichiers différents. Textes intégraux : `git log -p AGORA.md`.
- **AG-027** — Tous les chiffres des Statistiques dans le bilan mensuel — ouvert et livré le 01/11 par Codex (`9e70fcb`), réduit à la demande de l'utilisateur : bilan arrêté après « Réactivité », sans tableau des exclusions (`d634a1a`, `bd47210`), libellés « Dossiers » / « Réactivité » (`b1e7cf3`) ; taux réintroduits (remplace AG-011 sur ce point) — **confirmé** par Claude (`0f705cc`) sous réserve de D1, levée ; **tranché le 01/11/2026 à 22:57 par l'utilisateur** (« clos »).
- **AG-026** — Dossiers datés au dernier message enregistré — ouvert et livré le 01/11 par Codex (`1f12de9`) — amendé par Claude (`0f705cc` : D1, RDV importé sans message compté comme dossier), corrigé par Claude (`e421b58`, tests `9c551a8`), **confirmé** par Codex (`419310f`) ; **tranché le 01/11/2026 à 22:57 par l'utilisateur** (« clos »). Fiche sans message (`body:''` explicite) : hors dossiers, comptée à part.
- **AG-025** — Réactivité : réception → dernier message enregistré, toutes fiches, exclusions avec motif (bloc unique, avec la vérification des correctifs A23/A24) — ouvert et livré le 01/11 (`6d94b83`, tests `4261512`), **confirmé** par Codex (`94b00b4`) sans amendement, A23/A24 confirmés ; **tranché le 01/11/2026 par l'utilisateur** : **moyenne** en jours ouvrés affichée en grand (`4eb56bc`, tests `ea21a6d`), messages de suivi exclus. Limite écrite : `ts` est le dernier message, jamais le premier envoi (non enregistré). **Présentation ajustée le même jour par l'utilisateur** : part traitée le même jour civil en chiffre principal, moyenne en note (`d84ae5c`, tests `21b5bb7`) ; calcul inchangé.
- **AG-024** — Réactivité : jours fériés nationaux exclus ; première préparation, pas l'envoi — ouvert et livré le 01/11 (`c4fc1ec`, tests `9cc11f9`), demande de l'utilisateur — amendé par Codex (`0693a0b` : A24, libellé « le jour même » sur 0 jour ouvré), corrigé (`6ad6696`) ; **vérification du correctif reportée dans AG-025** (bloc unique, consigne de l'utilisateur du 01/11). Archives `ag017-v1` : lun.–ven. inchangé.
- **AG-023** — Délai d'attente : réceptions saisies avant le 22/10/2026 comptées — ouvert et livré le 01/11 (`c6edc4e`, tests `3ee88f7`), **décision de l'utilisateur « Les compter »** — amendé par Codex (`0693a0b` : A23, effacement ignoré à la copie), corrigé (`6ad6696`) ; **vérification du correctif reportée dans AG-025**. Borne `dateDemande` ≤ 2026-10-22 incluse ; limite : une date préremplie laissée telle quelle compte comme réception du jour.
- **AG-022** — Origine de la date de réception (reprise à confirmer, confirmation explicite) — ouvert et livré le 01/11 (`4954773`, `808841e`), **tranché le 01/11/2026 à 18:20** par l'utilisateur (« clos ») — amendé par Codex (`e994324` : R1/R2, écritures implicites ; `9d42a21` : NR1), corrigé (`973a0b8`, `b69bf8b`) puis **confirmé** (`cf282f8`). Choix retenus tels que livrés : confirmation identique sans effet sur la préparation, autre date = correction voulue, réception postérieure au RDV acceptée et classée à part, export CSV inchangé (le distinguer = nouveau bloc). Limite : une reprise déjà recopiée par une ancienne modification reste « enregistrée ».
- **AG-021** — Délai d'attente Marmande : médiane masquée, listes des fiches — ouvert le 01/11, confirmé par Codex (`1e6c74a`), **tranché le 01/11/2026 à 18:20** par l'utilisateur : **médiane réaffichée** (globale, par CMS, premiers RDV ; `31de680`, tests `23cecc6`), sur les seules fiches mesurables avec leur nombre ; listes cliquables et catégories d'AG-022 conservées ; tri délai croissant, puis date du RDV, puis nom. Calcul inchangé (AG-019, confirmé `e7bac43`). Couverture : 15 mesurables pour 160 à confirmer sur l'appareil de l'utilisateur au 01/11 (capture).
- **AG-020** — RDV sans suite (lapins, pas de retour, à pointer) — ouvert et livré le 01/11 (`5659644`), **tranché le 01/11/2026 à 16:13** — **confirmé** par Codex (`ab7bccd`) sans amendement ; limite écrite : un statut ne prouve pas qu'une personne est restée sans accompagnement.
- **AG-019** — Délai d'attente par CMS (priorité 1) — ouvert et livré le 01/11 (`047d82f`), **tranché le 01/11/2026 à 15:31** — **confirmé** par Codex (`e7bac43`) sans amendement : jours calendaires, tous RDV fixés, médiane, exclusions comptées.
- **AG-018** — Activité par CMS sur 12 mois (priorité 2, premier lot) — ouvert le 01/11, **tranché le 01/11/2026 à 15:31** — définition confirmée (`3015f72`), livraison `9cefe8c` **confirmée** (`e7bac43`) sans amendement. Hypothèses métier (date = réception, Structure = CMS) non établies sur fichiers réels ; couverture non certifiée. Reportés : doublons possibles, dates improbables, démarches.
- **AG-017** — Étape 6 d'AG-013 : archives annuelles recomptables — ouvert le 01/11, **tranché le 01/11/2026 (01/11/2026 à 14:37)** — contrat `ag017-v1` (trois révisions, Q1–Q4 et deux choix de l'utilisateur) confirmé par Codex (`5b78987`) ; livraison `ff87d10` vérifiée par Codex (`8e3f369`, amendé : L1–L3) ; corrections `ca88d81` **confirmées sans écart** (`5c046f7`). Textes intégraux : `git log -p AGORA.md`.
- **AG-016** — Étape 3 d'AG-013 : date du jour à Paris, lecteur unique de `ts`, `ts` ISO avec décalage de Paris, identifiants, anti-doublon par `cmsKey` — ouvert le 01/11, **tranché le 01/11/2026** — verdicts Codex **amendé** (`25d0302`) puis **amendé** (`22364ae`) : (A), écriture française de (B), (D), D3 **confirmés**, format de (C) confirmé ; seule condition restante (rechargement des sessions antérieures à (B)) **remplie selon l'utilisateur (01/11/2026 à 13:15) : postes fermés puis rouverts** — déclaration de l'utilisateur, non vérifiée par Claude. Mise en ligne de tout le lot décidée par l'utilisateur à 11:53. Livraisons : `5c39d77`…`9b443fe`, `f7c7639`, `6092246`, `f4a087f`. Textes intégraux : `git log -p AGORA.md`.
- **AG-015** — Étape 5 d'AG-013 : calculs partagés, un calendrier par indicateur — ouvert et **tranché le 01/11/2026** — verdict **confirmé** (Codex, critère 7 ; (A) `0d4277d`, (B)/(C) `546e421`, sans amendement). Fonctions communes (`personnesDistinctes`, `compterCanaux`, `aRelanceRenseignee`, `fichesPrepareesModel`) ; « Fiches préparées » au jour de première préparation, non-mesurables à part sans mois inventé ; canal inconnu à part ; liste des usagers = tuile ; relances au mois du RDV ; « Délai moy. RDV » retiré ; limite nom + prénom écrite. Arbitrages de l'utilisateur M1–M3 (01/11). Archives inchangées (étape 6). Textes intégraux : `git log -p AGORA.md` (`c6d4e2c`…`546e421`). Conclusion dans `CHANTIERS.md`.
- **AG-014** — Étape 4 d'AG-013 : une seule table des statuts, « Statut à vérifier », RDV sans heure affichés — ouvert et **tranché le 01/11/2026** — verdict **amendé** (Codex, critère 7 : garde de type, (B) et (C) nécessaires), puis confirmé sans amendement (`326f838`). 🙏 pour Excusé, Annulé hors de la tendance (décisions de l'utilisateur). Textes intégraux : `git log -p AGORA.md` (`24df6a5`…`326f838`).
- **AG-013** — Plan de fiabilisation des statistiques — ouvert le 31/10, **tranché le 31/10/2026**, **chantier clos le 01/11/2026 à 15:52** (étapes 0–6 confirmées par Codex, contrôle visuel de l'utilisateur validé) — verdict **amendé** (Codex, critères 7, 1 et 6) : écritures cohérentes jusqu'au stockage avec retour à l'état antérieur (archivage purgé malgré un échec, import partiel, restauration GitHub annoncée réussie sans contrôle), CMS normalisé dans la dédup provisoire du planning, tests de valeur affichée dans Statistiques **et** bilan (tuile du bilan non couverte), équivalence des dates ISO/françaises autour de minuit Paris et après réimport, table des statuts dépendante du jour et du titulaire actif. Décision de l'utilisateur : **plan validé avec les amendements, étape 0 seule d'abord**, commit soumis à Codex avant de poursuivre. Plan et suivi dans `CHANTIERS.md` (« Fiabilisation des statistiques »).
- **AG-012** — Suivi des relances dans le bilan et priorité à l’accompagnement — ouvert et **tranché le 31/10/2026** — verdict **confirmé** (Claude 0199YP2J, réponse intégrale dans `07046f0`) : même population mois du RDV/CMS que les autres chiffres, une seule fois par RDV avec date ou type de relance ; tests UTC/Europe/Paris et trois mutations rejetées par le contradicteur. **Aucun correctif demandé.** Maintien du périmètre déjà décidé par l’utilisateur (« Fait le »), puis du fonctionnement validé (« C’est bon ça fonctionne »). Limites conservées : anciennes dates automatiques sans provenance, absence de confirmation technique d’envoi ; rendu stylé et impression réelle non mesurés par le contradicteur (ses mesures portaient sur la structure sans CSS). Hypothèse hors bloc sur `addHistory`/`cmsKey` : aucun cas constaté, aucun changement de code. Conclusion dans `CHANTIERS.md` (« Suivi des relances »).
- **AG-011** — Bilan mensuel simplifié : une seule base, les rendez-vous enregistrés — ouvert le 30/10, **tranché le 30/10/2026** — verdict **confirmé** (Codex, critère 7) :
  éléments demandés présents, taux par créneau, remplissages et phrase de lecture retirés, pourcentages des statuts sur le seul total des rendez-vous, 29 sélections mois/CMS
  recomptées sans écart, données et archives inchangées, aucun correctif trouvé. Décision de l'utilisateur : une seule façon de compter dans le bilan ; les taux par créneau
  restent dans Statistiques. Conclusion dans `CHANTIERS.md` (« Bilan mensuel simplifié »).
- **AG-010** — Répartition par statut sur la base des rendez-vous — ouvert le 30/10, **tranché le 30/10/2026 par l'utilisateur, sans contradicteur** (aucune réponse
  inscrite) : option B (part de chaque statut sur les rendez-vous, issue exclusive par créneau retirée), puis **absorbée par AG-011** (bilan à base unique). Hors total ci-dessous.
- **AG-009** — Bilan mensuel : phrase de lecture 65 → 53 → 54, infobulles — ouvert le 30/10, **tranché le 30/10/2026** — verdict **amendé** (Codex, critère 7) : soustractions
  justes (29 sélections sans écart) mais libellés « ont repris un créneau déjà libéré » et « places jamais attribuées » non démontrés (contre-exemples exécutés), et assertions de
  test absorbées par un commentaire ; **corrigé** (libellés neutres, assertions rétablies). La phrase de lecture et ses indicateurs sont **retirés par AG-011** (décision de l'utilisateur,
  base unique) ; les infobulles ⓘ subsistent sur les chiffres restants.
- **AG-008** — Issue exclusive des créneaux, somme des statuts à 100 % — ouvert le 30/10, **tranché le 30/10/2026** — verdict **amendé** (Codex, critère 7) : classement
  exclusif confirmé sur 29 sélections mois/CMS sans écart, mais promesse « total = 100 % » inexacte pour les pourcentages arrondis (33 + 33 + 33 = 99 %, 2 cas réels) ;
  **corrigé dans l'affichage** (titre et notes : « les pourcentages arrondis peuvent ne pas totaliser exactement 100 % », arrondis non redistribués). Décision de
  l'utilisateur : **ordre de priorité conservé** (Réalisé > Confirmé > En attente > Lapin > Pas de retour > Excusé > Annulé). Remplace les taux par statut cumulés d'AG-007.
  Conclusion dans `CHANTIERS.md` (« Issue des créneaux »).
- **AG-007** — Taux par statut (tous les statuts), Statistiques et Bilan mensuel — ouvert le 30/10, **tranché le 30/10/2026** — verdict **confirmé**
  (Codex, critère 7) : recomptage indépendant sur 29 sélections mois/CMS sans écart, aucun correctif trouvé (Réalisé et Lapin égalent les taux existants,
  fiches sans heure, blocages et RDV futurs exclus). Décision de l'utilisateur : l'unité est le **créneau** (plutôt que la fiche) ; un créneau peut porter
  plusieurs statuts, la somme dépasse donc 100 % et c'est annoncé. Conclusion dans `CHANTIERS.md` (« Taux par statut »).
- **AG-006** — Calculs Statistiques/Bilan : corrections de l'audit Codex du 30/10 et remplissage net — ouvert le 30/10, **tranché le 30/10/2026** —
  verdict **amendé** (Codex, critère 7) : points 1 à 5 et 7 de l'audit confirmés, remplissage net conforme à la définition tranchée par l'utilisateur
  (base fixe 6/3), recomptage indépendant sur 29 sélections sans écart ; **deux corrections incomplètes relevées et corrigées dans le code** (regroupement
  CMS des messages et des nouvelles archives par `cmsKey` ; dictionnaire des démarches des archives sans prototype, et types de message en clés propres,
  même défaut). Les anciennes archives ne sont pas recalculées ; le point 6 de l'audit (capacité réelle de la grille) est écarté par la décision de la
  base fixe. Conclusion dans `CHANTIERS.md` (« Taux de remplissage », « Audit Codex du 30/10 »).
- **AG-001** — Statut Annulé et motif facultatif — ouvert le 22/10, **tranché le 30/10/2026 par l'utilisateur, sans
  contradicteur** (aucune réponse inscrite ; rien d'autre n'a été vérifié ici) : `annule` + `annulationMotif` livrés, additifs, sans
  migration ; créneau libéré, ni rappel ni relance, ICS CANCELLED avec le même UID ; taux : Annulé au dénominateur comme Excusé ;
  aucune archive recalculée. Conclusion dans `CHANTIERS.md` (« Statut Annulé »). Hors total ci-dessous (aucun verdict).
- **AG-002** — Réception et première préparation, délai lundi–vendredi — ouvert le 22/10, **tranché le 30/10/2026 par
  l'utilisateur, sans contradicteur** : contrat additif `dateReception` / `premierePreparationAt` / `preparationMetrics` livré
  (go du 22/10, précision utilisateur : `dateDemande` repris seulement si `dateReception` est absente, jamais déduit de `ts`).
  Conclusion dans `CHANTIERS.md` (« Préparation moyenne »). Hors total ci-dessous (aucun verdict).
- **AG-005** — Stats : « Relance » comptée d'après `dateRelance` — ouvert le 26/10, **tranché le 26/10/2026** — verdict **amendé**
  (Codex, 7 défauts vérifiés dans le code ; mes chiffres du bloc, 27 et 190, étaient faux : 28 et 191). Décision de l'utilisateur
  (« tout ») : la ligne devient « Fiches avec relance renseignée » (28/164), **hors** du volume de messages ; plus de `dateRelance`
  posée d'office au passage à « Pas de retour » (fausse alerte « Libérer ? » après retour à « En attente ») ; définition de la période
  écrite sous la carte (elle choisit les fiches, pas la date de relance) ; l'archive annuelle garde `relances`/`relancesSur`
  (additif). Non traité : les 11 fiches déjà passées à « Pas de retour » gardent leur date (indiscernable des vraies relances).
- **AG-003** — Début de l'après-midi réglable par CMS (Fumel 14h) — ouvert le 25/10, **clos le 26/10/2026 par
  l'utilisateur, sans contradicteur** : décision à lui (demande du 14:00 pour Fumel, 16:30 retiré pour tous), livrée dans
  Configuration CMS (champ `debutApresMidi`, facultatif ; le vider rétablit la grille par défaut). Bloc ouvert à tort :
  la décision était déjà tranchée, il n'y avait rien à contredire. Hors total ci-dessous (aucun verdict).
- **AG-004** — Bilan mensuel, audit Codex des chiffres avant diffusion — ouvert le 25/10, **tranché le 26/10/2026** —
  verdict **amendé** (Codex) : écart 0 sur 20 sélections, mais 6 défauts de données incomplètes (CMS, heure, statut,
  démarche, fuseau, variantes de CMS) **corrigés dans le code** (donc un amendement qui a changé le code) et une
  promesse de confidentialité trop forte reformulée. Décision de l'utilisateur : démarches saisies librement
  **laissées telles quelles, avec la mention « à relire avant toute diffusion »** (mention retirée le 30/10/2026 sur
  demande de l'utilisateur, après relecture de sa part). Conclusion dans `CHANTIERS.md`.

**Total au 01/11/2026 : 7 amendés, 4 confirmés, 0 contredit** (AG-001, AG-002, AG-003 et AG-010 sans verdict, hors total).
