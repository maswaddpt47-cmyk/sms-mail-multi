# Définitions des indicateurs — sms-mail-multi

Étape 1 d'AG-013 (31/10/2026). Ce fichier décrit **ce que le code calcule aujourd'hui** (`main`
`ecdaf0f`), indicateur par indicateur ; il ne change aucun calcul. Les numéros renvoient à
`index.html`. Les points marqués **À trancher** sont des choix métier : l'utilisateur décide,
la définition retenue remplace alors la description.

Vocabulaire commun :

- **Fiche** : une ligne de l'historique du profil (`S.history`), hors blocages (`msgType` `indispo`,
  pause déjeuner comprise). Une fiche porte à la fois un rendez-vous et le dernier message généré.
- **Créneau** : date + CMS (comparé par `cmsKey`, casse et accents ignorés, 3171) + heure. Un
  créneau peut porter plusieurs fiches (place libérée puis réattribuée).
- **Usager** : nom + prénom (`usagerKey`, 3174). Ce n'est pas un identifiant de personne.
- **Statut affiché** : le statut enregistré s'il est connu, sinon « en attente » (`statutAffiche`, 3204).
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
| Rendez-vous par mois | fiches par statut affiché | mois du RDV | statut inconnu compté « en attente » | 3072, 3838 |
| Lapins par permanence | créneaux avec Lapin / créneaux de la journée | RDV passés | 10 journées les plus récentes affichées | `lapinDays` |
| Activité annuelle (heatmap) | créneaux de RDV par jour, **depuis le 1er juillet** de l'année scolaire en cours | RDV | **ne suit pas le filtre de période** (toutes les fiches du CMS choisi) ; blocages exclus ; Excusé et Annulé comptés | 4022-4040 |

## Statistiques — « Messages et usagers »

Population (`hist`, 3653) : fiches hors blocages du CMS choisi dont **la date de génération du
message** (`ts`, texte « JJ/MM/AAAA », sinon les 10 premiers caractères, sinon la date du RDV ;
3575-3579) est dans la période.

| Indicateur | Ce qu'il compte | Date de référence | Exclusions / inconnus | Code |
|---|---|---|---|---|
| Total / SMS / Mails | fiches ; par canal `sms` / `mail` | génération du dernier message | canal inconnu : dans Total, ni SMS ni Mails | 3869-3871 |
| Usagers | usagers distincts parmi ces fiches | génération | nom et prénom vides : non comptés | 3872 |
| Messages par mois | fiches par canal | mois de génération | canal inconnu compté SMS | 3940-3947 |
| Répartition par type | fiches par type de message | génération | — | 3995 |
| Relances | fiches avec date de relance ou type relance | génération (pas la date de relance) | anciennes dates automatiques non distinguées | 3996 |
| Messages par CMS / commune | fiches par CMS | génération | **fiches sans CMS exclues** (non regroupées) | `comptageParCms`, 3193 |
| Préparation moy. (lun.–ven.) | jours ouvrés réception → première préparation | **population propre** (`preparationCohort`, 2856 ; 3873) : fiches hors blocages du CMS choisi dont le jour de première préparation — à défaut la date du message — est dans la période ; ce n'est pas la population « Messages » ci-dessus | fiches sans horodatage exclues de la moyenne (compteur affiché) | `preparationStats`, 2827 |
| Traitées le jour même (estimation) | part des anciennes fiches préparées le jour de la réception | même population que la préparation moyenne (3875) | estimation : `ts` est réécrit à chaque régénération | 2840 |
| Délai moy. RDV (par CMS) | jours civils génération → RDV | génération | RDV antérieur au message ou date invalide : exclu | `delaiRdvJours`, 3177 |

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

## À trancher par l'utilisateur

Aucun de ces points n'est un défaut démontré : ce sont des définitions métier, à choisir avant les
étapes 4 et 5. Proposition de Claude entre parenthèses.

1. **Usager = nom + prénom.** Deux homonymes comptent pour une personne ; une faute de frappe
   compte pour deux. (Garder, en l'écrivant sous le chiffre ; le téléphone n'est pas fiable non plus.)
2. **Statut vide ou inconnu = « en attente ».** (Garder dans les totaux, mais l'audit les liste
   pour correction à la main.)
3. **Fiches sans heure** : comptées dans les nombres, exclues des taux par créneau. (Garder,
   l'écran le dit déjà.)
4. **« Messages » = fiches, au jour du dernier message généré.** Une régénération déplace la
   fiche dans le mois de la régénération. (Garder et le dire ; un vrai compte de messages
   demanderait de les conserver séparément, écarté par la décision « une relance par RDV ».)
5. **Délai moyen RDV** mesuré depuis le **dernier** message, pas le premier. (Garder la mesure
   mais renommer « depuis le dernier message », ou la retirer au profit de la préparation
   horodatée.)
6. **Mois de l'archive annuelle** : le graphique « messages par mois » de l'archive suit la date
   de génération, l'année suit la date du RDV. (Faire suivre l'année de génération pour ce seul
   graphique, à l'étape 6, sans toucher aux archives existantes.)
