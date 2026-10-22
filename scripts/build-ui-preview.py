"""Préparer la proposition HTML autonome et la démo, sans service externe.

Usage : python scripts/build-ui-preview.py --output-dir /chemin/vers/apercus
La démo seule charge des données fictives dans un stockage en mémoire.
"""

import argparse
import base64
import json
from pathlib import Path
import tempfile
import zipfile


def build(output):
    root = Path(__file__).resolve().parents[1]
    output.mkdir(parents=True, exist_ok=True)
    html = (root / 'index.html').read_text(encoding='utf-8')
    for name in ['fonts/plus-jakarta-sans-latin-ext.woff2', 'fonts/plus-jakarta-sans-latin.woff2']:
        data = base64.b64encode((root / name).read_bytes()).decode('ascii')
        html = html.replace('url(' + name + ')', 'url(data:font/woff2;base64,' + data + ')')
    # Une copie locale ne s'installe pas en PWA ; la source conserve son manifeste.
    html = html.replace('<link rel="manifest" href="manifest.json">', '')
    for name in ['icon-192.png', 'apple-touch-icon.png']:
        data = base64.b64encode((root / name).read_bytes()).decode('ascii')
        html = html.replace('href="' + name + '"', 'href="data:image/png;base64,' + data + '"')
    standalone = output / 'proposition-agenda-compact.html'
    standalone.write_text(html, encoding='utf-8')
    seed = (root / 'scripts/ui-demo-data.js').read_text(encoding='utf-8')
    if '</script' in seed.lower():
        raise ValueError('La démonstration contient une fermeture de script non échappée.')
    demo = output / 'demo-agenda-compact.html'
    demo_html = html.replace('<script>', '<script>\n' + seed + '\n</script>\n<script>', 1)
    demo.write_text(demo_html, encoding='utf-8')
    readme = (
        'SMS & MAIL — agenda compact\n\n'
        'Pour explorer : ouvrir demo-agenda-compact.html, choisir Michel, puis ouvrir Agenda.\n'
        'Pendant le défilement, seuls les boutons Précédent, Aujourd’hui et Suivant restent visibles.\n'
        'Les dates, la recherche, les filtres et le bouton Réserver défilent avec la page.\n'
        'Les filtres sont fermés au départ ; leur titre indique les filtres actifs.\n'
        'Le menu « ☰ Mon agenda · filtres et rappels » regroupe recherche, filtres et « Rappels et points à traiter », pour libérer de la place au-dessus des rendez-vous.\n'
        'Les journées archivées se consultent aussi dans ce menu : seules celles avec des rendez-vous sont comptées, et Afficher ouvre directement une ancienne date. Masquer revient à la période précédente.\n'
        'Sur ordinateur, l’en-tête occupe moins de hauteur. Le fond de chaque tuile reprend la couleur de son statut, en clair comme en sombre.\n'
        'Dans Agenda, ouvrir la tuile rouge Annulé : le motif est modifiable dans la fiche. Le créneau est à nouveau disponible et aucun rappel automatique n’est proposé.\n'
        'Dans Statistiques, RDV réalisés remplace RDV aujourd’hui. Les premiers graphes montrent les statuts par mois et les places occupées/disponibles de chaque permanence ; le classement des démarches porte sur les accompagnements réalisés. Les filtres de période et de CMS suivent la date du RDV, ceux des messages sa date de génération. Voir les données ouvre le tableau mensuel.\n'
        'Dans Messages, les SMS gardent au maximum une ligne vide entre les paragraphes, sans ajouter de blanc dans les listes ; les espacements excessifs sont réduits aussi à la copie après modification manuelle. La copie e-mail garde sa mise en forme et ses liens enrichis.\n'
        'Le bouton « Aperçu de l’import » reste accessible dans le bandeau de démonstration pour découvrir le pop-up des orientations.\n'
        'Sans profil choisi, ce bouton ouvre automatiquement Michel et présente quatre orientations entièrement fictives.\n'
        'Les quatre lignes commencent décochées et sans conseiller attribué ; rien n’est importé à l’ouverture.\n'
        'Essayez le filtre par structure, l’attribution groupée et le choix individuel du conseiller avant de confirmer.\n'
        'Pour comparer les thèmes clair et sombre : utiliser le bouton lune/soleil de l’application ; fermer le pop-up avant de changer de thème, puis le rouvrir avec « Aperçu de l’import ».\n'
        'La démo présente exclusivement des données fictives, en mémoire ; recharger réinitialise tout.\n'
        'Pour essayer sans données de démonstration : ouvrir index.html.\n'
        'Publication : chaque modification terminée est poussée sur main, conformément à la demande utilisateur.\n'
        'Les couleurs et débordements des tuiles sont mesurés sur données fictives à 390 px et 1280×720, en clair et sombre ; le contrôle visuel reste nécessaire.\n'
    )
    archive = output / 'sms-mail-agenda-compact.zip'
    with zipfile.ZipFile(archive, 'w', zipfile.ZIP_DEFLATED) as bundle:
        for name in ['index.html', 'manifest.json', 'icon-192.png', 'icon-512.png', 'apple-touch-icon.png',
                     'fonts/OFL.txt', 'fonts/plus-jakarta-sans-latin-ext.woff2', 'fonts/plus-jakarta-sans-latin.woff2']:
            bundle.write(root / name, name)
        bundle.write(demo, demo.name)
        bundle.writestr('LIRE-MOI.txt', readme)
    return {'standalone': str(standalone), 'demo': str(demo), 'archive': str(archive)}


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--output-dir', type=Path,
                        default=Path(tempfile.gettempdir()) / 'sms-mail-ui-preview')
    args = parser.parse_args()
    print(json.dumps(build(args.output_dir.resolve()), ensure_ascii=False))
