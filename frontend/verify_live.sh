#!/bin/bash
echo "=== /register HTTP status ==="
curl -s -o /dev/null -w "%{http_code} %{content_type}\n" https://coderhero.duncowebsolutions.co.ke/register

echo ""
echo "=== /register page content check ==="
curl -s https://coderhero.duncowebsolutions.co.ke/register | head -c 400

echo ""
echo "=== footer in main chunk (register page loads website layout Footer) ==="
cd /home/duncoweb/coderhero.duncowebsolutions.co.ke/public
MAIN=$(grep -o 'assets/index-[A-Za-z0-9_-]*\.js' index.html | head -1)
echo "main: $MAIN"
grep -o "Developed by Duncoweb Solutions[^\"\\\\]*" "$MAIN" | head -2