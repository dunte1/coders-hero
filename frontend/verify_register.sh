#!/bin/bash
cd /home/duncoweb/coderhero.duncowebsolutions.co.ke/public
python3 - check.py <<'PY'
import re, glob
html = open('index.html', encoding='utf-8', errors='ignore').read()
m = re.search(r'assets/index-[A-Za-z0-9_-]+\.js', html)
main = m.group(0) if m else None
print('main:', main)
if main:
    data = open(main, encoding='utf-8', errors='ignore').read()
    print('footer "Developed by Duncoweb" in main:', 'Developed by Duncoweb' in data)
for f in glob.glob('assets/*.js'):
    try:
        d = open(f, encoding='utf-8', errors='ignore').read()
        if 'Create your account' in d or 'Start your coding journey' in d:
            print('register chunk:', f)
    except Exception:
        pass
PY