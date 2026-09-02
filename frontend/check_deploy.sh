#!/bin/bash
cd /home/duncoweb/coderhero.duncowebsolutions.co.ke/public
echo "=== index.html ==="
ls -la index.html
python3 -c "
import re
html = open('index.html', encoding='utf-8', errors='ignore').read()
m = re.search(r'assets/index-[A-Za-z0-9_-]+\.js', html)
print('main:', m.group(0) if m else None)
"
echo "=== newest asset files ==="
ls -t assets/*.js | head -8
echo "=== find register chunk among all ==="
grep -l "Create your account" assets/*.js 2>/dev/null
grep -l "Start your coding journey" assets/*.js 2>/dev/null