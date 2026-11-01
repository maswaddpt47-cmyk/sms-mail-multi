# Définitions des indicateurs — sms-mail-multi

Étape 1 d'AG-013 (31/10/2026). Ce fichier décrit **ce que le code calcule aujourd'hui** (`main`
`ecdaf0f`), indicateur par indicateur ; il ne change aucun calcul. Les numéros renvoient à
`index.html`. Les choix métier tranchés par l'utilisateur le 31/10/2026 sont en fin de fichier,
comme **cible future** : tant qu'une étape ne les a pas appliqués, la description fait foi.

Vocabulaire commun :

- **Fiche** : une ligne de l'historique du profil (`S.history`), hors blocages (`msgType` `indispo`,
  pause déjeuner comprise). Une fiche porte à la fois un rendez-vous et le dernier message généré.
- **Créneau** : date + CMS (comparé par `cmsKey`, casse et accents ignorés, 3171) + heure. Un
  créneau peut porter plusieurs fiches (place libérée puis réattribuée).
- **Usager** : nom + prénom (`usagerKey`, 3174). Ce n'est pas un identifiant de personne.
- **Statut affiché** : le statut enregistré s'il est connu, sinon **« Statut à vérifier »** (`statutAffiche`, clé `a_verifier`) — appliqué le 01/11/2026 (étape 4, AG-014 B), décision 2 ci-dessous ; il restait « en attente » jusque-là. Catégorie d'affichage, jamais enregistrée sur une fiche.
- **Statuts qui libèrent la place** : Lapin, Excusé, Annulé, Pas de retour (`STATUTS_LIBERES`).
- **Jour courant** : date civile à Paris (`parisDayStr`, 3167).

## Statistiques — « Le suivi des rendez-vous »

Population commune (`statsRdvModel`, 3056) : fiches datées (forme AAAA-MM-JJ), hors blocages,
du CMS choisi, dont **la date du RDV** est dans la période (« Tout » : toutes, RDV à venir compris).

| Indicateur | Ce qu'il compte | Date de référence | Exclusions / inconnus | Code |
|---|---|---|---|---|
| RDV réalisés | fiches au statut Réalisé | RDV ≤ jour courant | statut vide : non réalisé | 3067, 3697 |
| RDV sur la période | fiches, tous statuts | RDV | sans date valide : exclues | 3066, 3698 |
| Usagers accompagnés | usagers distincts parmi les fiches Réalisé | RDV ≤ jour courant | nom et prénom vides : non comptés | 3078 |
| Places disponibles à venir | places libres des permanences ouvertes à venir (base 6, ou 3 pour une demi-journée) | jour courant et après | réservations actives et blocages déduits ; ne suit pas la période | `statsRdvModel` |
| Taux de concrétisation | créneaux avec ≥1 fiche Réalisé / créneaux attribués | RDV ≤ jour courant | fiches sans heure exclues ; créneaux bloqués exclus | `slotRates`, 3228 |
| Taux de lapin | créneaux avec ≥1 fiche Lapin / créneaux attribués | idem | idem | 3228 |
| Taux de remplissage | créneaux attribués / places (6 par journée ayant ≥1 RDV avec heure, 3 pour une demi-journée) | idem | journée sans RDV non comptée ; peut dépasser 100 % | 3228, 3222 |
| Remplissage net | créneaux non libérés / mêmes places | idem | une fiche active suffit à garder le créneau occupé | 3228 |
| Rendez-vous par mois | fiches par statut affiché | mois du RDV | statut inconnu compté « Statut à vérifier » (depuis le 01/11/2026) | 3072, 3838 |
| Lapins par permanence | créneaux avec Lapin / créneaux de la journée | RDV passés | 10 journées les plus récentes affichées | `lapinDays` |
| Activité annuelle (heatmap) | créneaux de RDV par jour, **depuis le 1er juillet** de l'année scolaire en cours | RDV | **ne suit pas le filtre de période** (toutes les fiches du CMS choisi) ; blocages exclus ; Excusé et Annulé comptés | 4022-4040 |

## Statistiques — « Fiches préparées » (ex-« Messages et usagers », depuis le 01/11/2026, AG-015)

Population (`fichesPrepareesModel`) : fiches hors blocages du CMS choisi dont **le jour de première préparation**
(`premierePreparationAt`, jour à Paris) est dans la période (« Tout » : toutes les premières préparations connues).
Une régénération ne déplace plus une fiche. **Fiches sans première préparation connue** (antérieures au 22/10/2026,
imports) : **non mesurables**, leur nombre est affiché à part, sans mois inventé ni repli sur `ts` ou la date du RDV.

| Indicateur | Ce qu'il compte | Date de référence | Exclusions / inconnus | Code |
|---|---|---|---|---|
| Fiches préparées / SMS / Mails | fiches ; par canal **du dernier message** (seul conservé, M2) | première préparation | canal inconnu : tuile « Canal inconnu » affichée s'il y en a, jamais compté SMS ni Mail | `compterCanaux` |
| Usagers | personnes distinctes parmi ces fiches (nom + prénom, limite écrite) | première préparation | nom et prénom vides : non comptés | `personnesDistinctes` |
| Fiches préparées par mois | fiches par canal (SMS, E-mail, Canal inconnu s'il y en a) | mois de première préparation | non mesurables absentes du graphe | `fichesPrepareesModel` |
| Répartition par type | fiches préparées par type **du dernier message** (M3) | première préparation | — | `fichesPrepareesModel` |
| Relances | RDV de la période avec date de relance ou type relance (M1, comme le bilan) | **date du RDV** | anciennes dates automatiques non distinguées | `aRelanceRenseignee` |
| Fiches préparées par CMS / commune | fiches préparées par CMS | première préparation | fiches sans CMS exclues | `comptageParCms` |
| Préparation moy. (lun.–ven.) | jours ouvrés réception → première préparation | **population propre** (`preparationCohort`) : jour de première préparation, à défaut date du message pour situer les exclusions | fiches sans horodatage exclues de la moyenne (compteur affiché) | `preparationStats` |
| Traitées le jour même (estimation) | part des anciennes fiches préparées le jour de la réception | même population que la préparation moyenne | estimation ; relances exclues | `legacyPreparationEstimate` |

« Délai moy. RDV » (dernier message → RDV) : **retiré le 01/11/2026** (décision 5). Il subsiste seulement dans les
anciennes archives (`avgRdv`, étape 6).

## Bilan mensuel imprimable

Population (`monthlyReportData`, 3254) : fiches hors blocages dont la date du RDV est dans le
mois, jusqu'au jour courant pour le mois en cours, du CMS choisi. Une seule base : les
rendez-vous enregistrés (décision AG-011).

| Indicateur | Ce qu'il compte | Code |
|---|---|---|
| Personnes accompagnées | usagers distincts parmi les fiches Réalisé | 3314 |
| RDV réalisés | fiches Réalisé | 3315 |
| Rendez-vous du mois (tous statuts) | fiches | 3316 |
| RDV avec relance renseignée | fiches avec date de relance ou type relance, une fois chacune | 3267, 3317 |
| Répartition par statut | fiches par statut affiché ; part sur le total ; arrondis non redistribués | `byStatut` |
| Démarches / RDV par CMS | fiches Réalisé par démarche (10 premières) ; fiches et réalisées par CMS | 3262-3263 |

## Archives annuelles (`computeYearArchive`, 2880)

Population : fiches de l'**année du RDV** (`entryYear`, 2867 ; à défaut année du message), hors
blocages, **tous CMS et tous statuts, sans filtre de période ni jour courant** (l'année est révolue).
Ce n'est ni la population de Statistiques ni celle du bilan : `usagersN` compte les personnes de
toutes les fiches, pas seulement les réalisées (≠ « Personnes accompagnées »). Calculées une fois,
jamais recalculées ; les archives anciennes gardent leur méthode d'origine (comptage par fiche
avant le 23/10).

| Champ | Ce qu'il compte | Réserve connue |
|---|---|---|
| `total`, `smsN`, `mailN`, `usagersN` | fiches, par canal, usagers distincts | canal inconnu dans aucun des deux |
| `statuts`, `realiseN`, `lapinN` | fiches par statut affiché | — |
| `concretPct`, `lapinPct` | taux par créneau, arrondis | numérateur et dénominateur non conservés (2896-2897) |
| `byMonth` | fiches par canal et **mois de génération** | un RDV de janvier préparé en décembre met « décembre » de l'année précédente dans l'archive (2905-2910) |
| `trendByMonth`, `heatmap`, `byDemarche`, `byCMS`, `relances` | par mois du RDV, jour de semaine et heure, démarche, CMS, relance | `byCMS` exclut les fiches sans CMS ; `heatmap` compte des fiches (pas des créneaux), contrairement à l'écran |

## Décisions de l'utilisateur du 31/10/2026 — cible future, non appliquée

Les sections ci-dessus décrivent **les calculs actuels** (les décisions 2 et 3 sont appliquées depuis le 01/11/2026, les décisions 1, 4 et 5 dans Statistiques et le bilan le même jour, voir ci-dessous). Les décisions ci-dessous sont la
**cible** : les autres ne changent encore aucun calcul ni aucune donnée. Leur mise en œuvre suivra les
étapes d'AG-013 (4 : règles métier ; 5 : calculs partagés ; 6 : archives), avec les blocs AGORA
nécessaires (critère 7, contradicteur Codex) et un test pour chacune.

| # | Sujet | Aujourd'hui | Cible décidée |
|---|---|---|---|
| 1 | Personnes | nom + prénom (`usagerKey`) | **Garder provisoirement** le rapprochement nom + prénom, avec sa limite écrite à côté du chiffre : ce n'est pas une identification certaine des personnes. **Appliqué le 01/11/2026** (AG-015) : Usagers accompagnés, Usagers des fiches préparées, Personnes accompagnées du bilan (imprimé compris). |
| 2 | Statut vide ou inconnu | compté « en attente » (`statutAffiche`) | Le RDV **reste dans les totaux** mais s'affiche **« Statut à vérifier »**, sans être assimilé à « En attente ». | **Appliqué le 01/11/2026** (étape 4, AG-014 B) : répartitions, graphe mensuel (série affichée seulement s'il y en a), bilan (ligne masquée à zéro), nouvelles archives (clé additive `a_verifier`), audit de sauvegarde. Anciennes archives non recalculées. |
| 3 | RDV sans heure | comptés dans les nombres, exclus des taux par créneau, sans compteur | **Comptés dans les volumes, exclus des taux par créneau, et le nombre d'exclus est affiché.**  **Appliqué le 01/11/2026** (étape 4, AG-014 C) dans Statistiques : note « N RDV sans heure exclus du taux » sous les taux de concrétisation et de lapin, même population (période, CMS, au plus tard aujourd'hui) ; le bilan n'a pas de taux par créneau ; les archives ne conservent pas ce nombre (étape 6). |
| 4 | « Messages » | fiches au jour du dernier message généré (`ts`, réécrit à chaque régénération) | **Remplacé par « Fiches préparées »**, comptées à leur **première préparation connue** ; une régénération ne déplace plus l'activité d'un mois passé ; les anciennes fiches sans date fiable restent **non mesurables** pour cet indicateur, **sans date reconstruite**. **Appliqué le 01/11/2026** (AG-015 B) dans Statistiques ; archives : étape 6. |
| 5 | Délai depuis le message | « Délai moy. RDV » mesuré depuis le dernier message (`delaiRdvJours`) | **Retiré.** La préparation moyenne horodatée est conservée : elle mesure une durée différente. **Appliqué le 01/11/2026** (AG-015 B) dans Statistiques ; anciennes archives inchangées. |
| 6 | Archives annuelles | année du RDV, mais « messages par mois » sur la date de génération | **Chaque indicateur suit sa propre date** : mois du RDV pour les rendez-vous, mois de première préparation pour les fiches préparées. **Les anciennes archives gardent leur méthode historique.** |
