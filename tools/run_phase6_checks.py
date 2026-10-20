"""Local, non-destructive Phase 6 validation runner (no production credentials).

Run from any directory: python Web/tools/run_phase6_checks.py [--full-web]
The browser check is explicitly skipped if Playwright, Chromium, or local
navigation permission is unavailable; read results before approving deployment.
"""
from __future__ import annotations
import argparse
from concurrent.futures import ThreadPoolExecutor, as_completed
import os
from pathlib import Path
import re
import subprocess
import sys

WEB = Path(__file__).resolve().parents[1]
BOT = WEB.parent / "Bot"


def run(label, command, cwd, timeout=150):
    try:
        p = subprocess.run(command, cwd=cwd, text=True, capture_output=True,
                           env={**os.environ, "PYTHONPATH": "."}, timeout=timeout)
    except (OSError, subprocess.TimeoutExpired) as exc:
        print(f"FAIL {label}: {exc}", flush=True)
        return False
    output = (p.stdout or "") + "\n" + (p.stderr or "")
    matches = re.findall(r"Ran (\d+) tests? in|# tests (\d+)", output)
    count = matches[-1][0] or matches[-1][1] if matches else "?"
    skipped_matches = re.findall(r"skipped=(\d+)", output)
    skips = int(skipped_matches[-1]) if skipped_matches else 0
    note = f" ({skips} skipped)" if skips else ""
    print(f"{'PASS' if p.returncode == 0 else 'FAIL'} {label}: {count} tests{note}", flush=True)
    if p.returncode or "skipped" in output.lower() and label.startswith("Phase 6"):
        print(output[-3000:], flush=True)
    return p.returncode == 0


def full_web_modules():
    names = sorted(p.name for p in (WEB / "tests").glob("test_*.py"))
    def one(name):
        try:
            p = subprocess.run([sys.executable,"-m","unittest","discover","-s","tests","-p",name,"-q"],
                               cwd=WEB,env={**os.environ,"PYTHONPATH":"."}, capture_output=True, text=True,timeout=120)
            output = (p.stdout or "")+"\n"+(p.stderr or "")
            found = re.findall(r"Ran (\d+) tests? in",output)
            return name,p.returncode,int(found[-1]) if found else 0,output
        except (subprocess.TimeoutExpired,OSError) as exc:
            return name,1,0,str(exc)
    total=0
    okay=True
    with ThreadPoolExecutor(max_workers=5) as pool:
        for future in as_completed([pool.submit(one,n) for n in names]):
            name,exit_code,count,output=future.result()
            total+=count
            okay=okay and exit_code==0
            print(f"{'PASS' if exit_code==0 else 'FAIL'} {name}: {count} tests",flush=True)
            if exit_code:print(output[-3000:],flush=True)
    print(f"Web module total: {total} cases; {'PASS' if okay else 'FAIL'}",flush=True)
    return okay


def main():
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--full-web',action='store_true',help='Run every Web backend test module separately to avoid long monolithic suite hangs')
    parser.add_argument('--skip-frontend',action='store_true',help='Skip the existing Node frontend test suite')
    parser.add_argument('--skip-bot',action='store_true',help='Skip real Bot/Web Triple Triad ladder tests')
    args=parser.parse_args()
    success = run('Phase 6 staging HTTP/browser',
        [sys.executable,'-m','unittest','discover','-s','tests','-p','test_phase6_staging_integration.py','-v'], WEB)
    if args.full_web:success=full_web_modules() and success
    if not args.skip_bot:
        if (BOT/'tests/test_triple_triad_hosted_ladder.py').exists():
            success=run('Real Bot -> Web Triple Triad ladder',
                [sys.executable,'-m','unittest','discover','-s','tests','-p','test_triple_triad_hosted_ladder.py','-q'],BOT) and success
        else:
            print('WARNING Bot build missing: real Bot relay not verified')
    if not args.skip_frontend:
        files=sorted(str(p.relative_to(WEB/'frontend')) for p in (WEB/'frontend/tests').glob('*.test.mjs'))
        if files:
            success=run('Frontend source regressions',
                ['node','--test','--test-concurrency=6',*files],WEB/'frontend') and success
        else:
            print('WARNING frontend tests missing: frontend regression not verified')
    print(('PASS' if success else 'FAIL')+' Phase 6 local validation (check skips separately)')
    return 0 if success else 1


if __name__=='__main__':raise SystemExit(main())
