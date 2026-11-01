# Bilan mensuel — inventaire et extension du 01/11/2026

Base inspectée : `1f12de9`. Demande : reprendre tous les chiffres des Statistiques, à l’écran et dans Imprimer / PDF. Les captures illustrent des totaux « Tout », pas nécessairement un mois : leurs valeurs ne sont pas recopiées en dur.

| Existant du bilan | Source / unité |
|---|---|
| Personnes accompagnées, RDV réalisés, total | `monthlyReportData`, fiches au mois du RDV ; personnes parmi les réalisés |
| Relances | date ou type renseigné, une fois par fiche au mois du RDV |
| Démarches, autres et non renseignées | réalisés, top 10 sans perte du reste |
| Statuts, nombres et parts | même population de rendez-vous |
| CMS, total et réalisés | même population de rendez-vous |
| Sources, inconnus, mois courant partiel | pas de données nominatives ; archives séparées |

## Ajouts demandés (AG-027)

- Taux de concrétisation, lapin, remplissage et remplissage net : vrais modèles existants, unités et dénominateurs écrits ; capacité des permanences réelles, RDV sans heure exclus et comptés.
- Fiches par dernier message enregistré : total, SMS, mails, canal inconnu, personnes, types et CMS ; mois du message indépendant du mois du RDV. Absences de dates comptées sans mois inventé. Aucune exigence de première préparation.
- Réactivité : même jour civil, moyenne ouvrée, calculables et exclusions par motif, avec les limites d’AG-025.
- Séries mensuelles rendez-vous/statuts et fiches/canaux sous forme de tableaux imprimables ; lapins par permanence ; RDV sans suite ; délai d’attente global et par CMS, couverture, réceptions anciennes et diagnostic premiers RDV.
- Contexte daté, hors mois sélectionné : places disponibles et permanences à venir au jour d’édition ; activité annuelle depuis juillet et activité par CMS sur les 12 derniers mois, avec anomalies et couverture des archives. Les filtres gardent la portée de l’écran Statistiques.

Les calculs existants sont réutilisés. Aucun nom, téléphone, message ou note n’est ajouté au rapport ; aucune donnée ni archive réécrite. Mois sans RDV mais avec messages : les messages restent présentés. Mois courant : arrêté au jour de Paris. Les vues de contexte ne prétendent pas reconstituer une disponibilité passée.
