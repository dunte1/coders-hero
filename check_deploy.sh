#!/bin/bash
cd /home/duncoweb/codershero.duncowebsolutions.co.ke/coders-hero/backend

echo "=== File check ==="
grep -c 'seed-payment-notifications' routes/api.php

echo "=== md5 of api.php ==="
md5sum routes/api.php

echo "=== Checking production build ==="
ls -la /home/duncoweb/codershero.duncowebsolutions.co.ke/public_html/ 2>/dev/null | grep index
cat /home/duncoweb/codershero.duncowebsolutions.co.ke/public_html/index.php 2>/dev/null | head -5

echo "=== Check if there's a separate production deploy ==="
grep 'seed-payment-notifications' /home/duncoweb/codershero.duncowebsolutions.co.ke/codershero/backend/routes/api.php 2>/dev/null

echo "=== Check public/index.php ==="
cat public/index.php | head -3

echo "=== Check if the server runs from a different path ==="
grep -r 'DocumentRoot\|ServerName.*coderhero' /usr/local/apache/conf/ /etc/httpd/conf/ /etc/nginx/ 2>/dev/null | grep -i coderhero
