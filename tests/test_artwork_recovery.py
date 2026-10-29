"""Release tooling regressions; no production state or network required."""
from pathlib import Path
from types import SimpleNamespace
from tempfile import TemporaryDirectory
import hashlib
import importlib.util
import json
import re
import unittest
from zipfile import ZipFile

WEB = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location('artwork_recovery', WEB/'tools'/'artwork_recovery.py')
art = importlib.util.module_from_spec(spec)
spec.loader.exec_module(art)


class ArtworkRecoveryTests(unittest.TestCase):
    def sample(self, name='card-hall/cards/QB001.webp', content=b'webp-for-testing'):
        return {name: {'size': len(content), 'sha256': hashlib.sha256(content).hexdigest()}}

    def test_detects_missing_asset(self):
        with TemporaryDirectory() as tmp:
            result = art.check(Path(tmp), self.sample(), ['dist'], fast=False)
            self.assertEqual(result['dist']['missing'], 1)

    def test_restores_only_verified_files_using_original_archive_layout(self):
        with TemporaryDirectory() as tmp:
            base = Path(tmp)
            (base/'frontend').mkdir()
            image = b'webp-for-testing'
            rel = 'card-hall/cards/QB001.webp'
            with ZipFile(base/'p1.zip', 'w') as z:
                z.writestr('Web/frontend/dist/'+rel, image)
            with ZipFile(base/'p2.zip', 'w') as z:
                z.writestr('Web 2of2/frontend/public/'+rel, image)
            opts = SimpleNamespace(web1=str(base/'p1.zip'), web2=str(base/'p2.zip'))
            art.restore(base, self.sample(rel,image), ['dist','public'], opts)
            self.assertEqual((base/'frontend/dist'/rel).read_bytes(), image)
            self.assertEqual((base/'frontend/public'/rel).read_bytes(), image)
            result=art.check(base, self.sample(rel,image), ['dist','public'])
            self.assertEqual(result['dist']['missing'] + result['dist']['mismatched'],0)
            self.assertEqual(result['public']['missing'] + result['public']['mismatched'],0)

    def test_does_not_install_wrong_hash(self):
        with TemporaryDirectory() as tmp:
            base = Path(tmp)
            (base/'frontend').mkdir()
            rel='card-hall/cards/QB001.webp'
            with ZipFile(base/'p1.zip','w') as z:
                z.writestr('Web/frontend/dist/'+rel,b'altered-contents')
            opts=SimpleNamespace(web1=str(base/'p1.zip'),web2=None)
            with self.assertRaisesRegex(ValueError,'Checksum mismatch|Size mismatch'):
                art.restore(base,self.sample(),['dist'],opts)
            self.assertFalse((base/'frontend/dist'/rel).exists())

    def test_source_and_dist_image_inventory_is_complete(self):
        inventory=art.load_manifest(WEB)
        self.assertEqual(len(inventory),1077)
        data=art.check(WEB,inventory,['dist','public'],fast=True)
        for result in data.values():
            self.assertEqual(result['missing'],0)
            self.assertEqual(result['mismatched'],0)

    def test_quoted_image_urls_resolve_to_prebuilt_dist(self):
        frontend=WEB/'frontend'
        pattern=re.compile(r"""['"`(=: \t](/[a-zA-Z0-9_./%+\-]+\.(?:webp|png|svg|jpe?g|gif)(?:\?[-\w.=&]+)?)""",re.I)
        refs=set()
        for directory in (frontend/'src',frontend/'dist'):
            for p in directory.rglob('*'):
                if p.is_file() and p.suffix.lower() in ('.jsx','.js','.mjs','.json','.css','.html') and p.stat().st_size < 10000000:
                    refs.update(ref.split('?')[0] for ref in pattern.findall(p.read_text('utf8',errors='replace')))
        self.assertGreaterEqual(len(refs),200)
        unresolved=[url for url in sorted(refs) if not (frontend/'dist'/url.lstrip('/')).is_file()]
        self.assertEqual(unresolved,[],f'Missing compiled image URLs: {unresolved[:20]}')

    def test_prebuilt_docker_ignore_keeps_dist(self):
        ignore=(WEB/'Dockerfile.prebuilt.dockerignore').read_text('utf-8').splitlines()
        self.assertNotIn('frontend/dist',ignore)
        self.assertNotIn('frontend/dist/',ignore)
        normal=(WEB/'.dockerignore').read_text('utf-8').splitlines()
        self.assertIn('frontend/dist',normal)
        docker=(WEB/'Dockerfile.prebuilt').read_text('utf-8')
        self.assertIn('python /app/tools/artwork_recovery.py check',docker)


if __name__=='__main__':
    unittest.main()
