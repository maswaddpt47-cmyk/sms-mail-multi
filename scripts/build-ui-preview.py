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
        'Pour explorer : ouvrir demo-agenda-compact.html dans votre navigateur, choisir Michel, puis Agenda.\n'
        'L’agenda commence directement par les dates, sans en-tête Votre agenda ni sous-titre.\n'
        'La timeline ne contient que les journées avec RDV, en deux colonnes Matin / Après-midi.\n'
        'Les disponibilités et les créneaux bloqués sont accessibles depuis + Réserver.\n'
        'Une nouvelle tuile apparaît après enregistrement du rendez-vous dans Messages.\n'
        'La démo présente exclusivement des données fictives, en mémoire ; recharger réinitialise tout.\n'
        'Pour essayer sans données de démonstration : ouvrir index.html.\n'
        'Branche de travail : sandbox/ui. Aucun changement sur main sans feu vert utilisateur.\n'
        'Les parcours sont vérifiés avec un DOM simulé ; le rendu navigateur reste à contrôler.\n'
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
