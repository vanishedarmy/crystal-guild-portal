from pathlib import Path
import shutil
root=Path(__file__).resolve().parent
target=Path.cwd()
for rel in [x.strip() for x in (root/"DELETIONS.txt").read_text().splitlines() if x.strip()]:
    p=target/rel
    if p.exists() and p.is_file(): p.unlink()
for src in root.rglob("*"):
    if not src.is_file(): continue
    rel=src.relative_to(root)
    if rel.as_posix() in {"apply_patch.py","PATCH_MANIFEST.txt","DELETIONS.txt"}: continue
    dst=target/rel; dst.parent.mkdir(parents=True,exist_ok=True); shutil.copy2(src,dst)
print("Crystal Guild v1.5.0 Trails & Raids Web Hotfix 4 applied.")
