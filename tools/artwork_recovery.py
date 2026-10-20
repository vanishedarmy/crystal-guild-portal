#!/usr/bin/env python3
"""Verify/recover v1.9.7 Crystal Guild artwork without touching live data.

Usage:
  python Web/tools/artwork_recovery.py check --root Web --target both
  python Web/tools/artwork_recovery.py restore --root Web --target both \
      --web1 'Web 1of2.zip' --web2 'Web 2of2.zip'
  python Web/tools/artwork_recovery.py live --url https://YOUR-STAGING-PORTAL
"""
import argparse
import hashlib
import json
import os
from pathlib import Path
import sys
import tempfile
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen
from urllib.parse import quote
from zipfile import ZipFile

IMAGE_DIRS = {'dist': 'frontend/dist', 'public': 'frontend/public'}
ZIP_ENTRIES = {'dist': 'Web/frontend/dist/', 'public': 'Web 2of2/frontend/public/'}
ZIP_OPTIONS = {'dist': 'web1', 'public': 'web2'}


def load_manifest(root):
    p = root / 'ARTWORK_V197_CHECKSUMS.json'
    if not p.is_file():
        raise ValueError(f'Missing artwork inventory: {p}')
    data = json.loads(p.read_text('utf-8'))
    if data.get('release') != '1.9.7-queens-blood' or len(data.get('files', {})) != 1077:
        raise ValueError('Inventory is not the complete v1.9.7 artwork inventory')
    return data['files']


def secure_path(base, rel):
    path = (base / rel).resolve()
    if not path.is_relative_to(base.resolve()):
        raise ValueError(f'Invalid artwork path: {rel}')
    return path


def valid_file(path, meta, fast=False):
    try:
        if not path.is_file() or path.stat().st_size != meta['size']:
            return False
        if fast:
            return True
        with path.open('rb') as f:
            return hashlib.file_digest(f, 'sha256').hexdigest() == meta['sha256']
    except OSError:
        return False


def check(root, files, targets, fast=False, sample_limit=12):
    result = {}
    for kind in targets:
        base = root / IMAGE_DIRS[kind]
        missing, mismatched = [], []
        for rel, meta in files.items():
            p = secure_path(base, rel)
            if not p.is_file():
                missing.append(rel)
            elif not valid_file(p, meta, fast=fast):
                mismatched.append(rel)
        result[kind] = {'checked': len(files), 'missing': len(missing), 'mismatched': len(mismatched),
                        'missing_examples': missing[:sample_limit], 'mismatch_examples': mismatched[:sample_limit]}
        print(f'{kind}: {len(files) - len(missing) - len(mismatched)}/{len(files)} images verified; '
              f'{len(missing)} missing; {len(mismatched)} incorrect', flush=True)
        for name in missing[:sample_limit]:
            print(f'  missing: {name}')
        for name in mismatched[:sample_limit]:
            print(f'  mismatch: {name}')
    return result


def restore(root, files, targets, paths, fast=False, dry_run=False):
    for kind in targets:
        zippath = Path(getattr(paths, ZIP_OPTIONS[kind]) or '')
        if not zippath.is_file():
            raise ValueError(f'Restoring {kind} requires --{ZIP_OPTIONS[kind]} PATH to original uploaded archive')
        base = root / IMAGE_DIRS[kind]
        if not base.parent.is_dir():
            raise ValueError(f'Web install does not contain expected directory: {base.parent}')
        restored = 0
        with ZipFile(zippath) as archive:
            for rel, meta in files.items():
                p = secure_path(base, rel)
                if valid_file(p, meta, fast=fast):
                    continue
                archive_name = ZIP_ENTRIES[kind] + rel
                try:
                    info = archive.getinfo(archive_name)
                except KeyError:
                    raise ValueError(f'Original archive is missing expected file: {archive_name}') from None
                if info.file_size != meta['size']:
                    raise ValueError(f'Size mismatch in uploaded archive: {archive_name}')
                if dry_run:
                    restored += 1
                    continue
                p.parent.mkdir(parents=True, exist_ok=True)
                temporary = None
                try:
                    with tempfile.NamedTemporaryFile(dir=p.parent, delete=False) as tmp:
                        temporary = Path(tmp.name)
                        h = hashlib.sha256()
                        with archive.open(info) as src:
                            while True:
                                chunk = src.read(128 * 1024)
                                if not chunk:
                                    break
                                h.update(chunk)
                                tmp.write(chunk)
                    if h.hexdigest() != meta['sha256']:
                        raise ValueError(f'Checksum mismatch inside original archive: {archive_name}')
                    os.replace(temporary, p)
                    restored += 1
                finally:
                    if temporary and temporary.exists():
                        temporary.unlink()
        print(f'{kind}: {restored} {"would be restored" if dry_run else "restored"} from {zippath.name}')


def live_check(base_url, files, max_urls=40):
    # Distribute samples over directories, plus key Card Hall images.
    groups = {}
    for name in files:
        segments = name.split('/')
        groups.setdefault('/'.join(segments[:2]) if len(segments) > 2 else segments[0], []).append(name)
    # Distribute requests across top-level artwork families before visiting a second nested gallery.
    families = {}
    for group_name, names in sorted(groups.items()):
        families.setdefault(group_name.split('/')[0], []).append(names[0])
    samples = []
    while any(families.values()):
        for top in sorted(families):
            if families[top]:
                samples.append(families[top].pop(0))
    priority = ['card-hall/cards/QB001.webp', 'card-hall/thumbs/QB048.webp',
                'gold-saucer/rc2h1/triple-triad/cards/card-back.webp',
                'retro-phase-ii/job-portraits-v2/warrior.webp']
    ordered = [x for x in priority + samples if x in files]
    ordered = list(dict.fromkeys(ordered))[:max_urls]
    failures = []
    for name in ordered:
        url = base_url.rstrip('/') + '/' + quote(name, safe='/')
        try:
            req = Request(url, headers={'User-Agent': 'CrystalGuildArtworkHealth/1.9.7'})
            with urlopen(req, timeout=20) as response:
                mime = response.headers.get('Content-Type', '')
                length = int(response.headers.get('Content-Length', '-1'))
                if response.status != 200 or not mime.startswith('image/') or length != files[name]['size']:
                    raise ValueError(f'HTTP {response.status}; Content-Type={mime}; size={length}, expected={files[name]["size"]}')
                h = hashlib.sha256()
                total = 0
                while True:
                    chunk = response.read(128 * 1024)
                    if not chunk:
                        break
                    total += len(chunk)
                    h.update(chunk)
                if total != files[name]['size'] or h.hexdigest() != files[name]['sha256']:
                    raise ValueError(f'Image content mismatch or truncated transfer: {total} bytes')
        except (HTTPError, URLError, TimeoutError, ValueError, OSError) as e:
            failures.append([url, str(e)])
    print(f'Live image URLs: {len(ordered) - len(failures)}/{len(ordered)} sampled image responses OK')
    for url, err in failures:
        print(f'  FAIL {url} : {err}')
    return failures


def main():
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument('command', choices=['check','restore','live'])
    parser.add_argument('--root', type=Path, default=Path(__file__).resolve().parents[1])
    parser.add_argument('--target', choices=['dist','public','both'], default='both')
    parser.add_argument('--web1', help='Path to the ORIGINAL Web 1of2.zip')
    parser.add_argument('--web2', help='Path to the ORIGINAL Web 2of2.zip')
    parser.add_argument('--fast', action='store_true', help='Size checks only (SHA256 is default)')
    parser.add_argument('--dry-run', action='store_true', help='Show repair count without writing')
    parser.add_argument('--url', help='Base URL of a permitted/staging portal for live checks')
    parser.add_argument('--max-urls', type=int, default=40)
    parser.add_argument('--json', type=Path, help='Write machine-readable check report')
    args = parser.parse_args()
    try:
        files = load_manifest(args.root.resolve())
        targets = ['dist','public'] if args.target == 'both' else [args.target]
        if args.command == 'live':
            if not args.url or not args.url.startswith(('https://','http://')):
                parser.error('live requires --url https://YOUR-STAGING-PORTAL')
            results = {'failures': live_check(args.url, files, args.max_urls)}
            ok = not results['failures']
        else:
            if args.command == 'restore':
                restore(args.root.resolve(), files, targets, args, args.fast, args.dry_run)
            results = check(args.root.resolve(), files, targets, args.fast)
            ok = all(not val['missing'] and not val['mismatched'] for val in results.values())
        if args.json:
            args.json.write_text(json.dumps(results, indent=2)+'\n', encoding='utf-8')
        return 0 if ok else 1
    except (OSError, ValueError, KeyError) as e:
        print(f'Artwork verification error: {e}', file=sys.stderr)
        return 2


if __name__ == '__main__':
    sys.exit(main())
