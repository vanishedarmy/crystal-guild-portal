from pathlib import Path
import shutil
root = Path(__file__).resolve().parent
src = root / 'frontend'
dst = Path.cwd() / 'frontend'
if not dst.exists():
    raise SystemExit('Run this from the Web project root so ./frontend exists.')
for path in src.rglob('*'):
    if path.is_dir():
        continue
    rel = path.relative_to(src)
    out = dst / rel
    out.parent.mkdir(parents=True, exist_ok=True)
    shutil.copy2(path, out)
print('Patch applied.')
