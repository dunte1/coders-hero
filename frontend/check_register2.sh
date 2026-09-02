#!/bin/bash
cd /home/duncoweb/coderhero.duncowebsolutions.co.ke/public/assets
echo "=== search for register feature strings ==="
for pat in "Create your account" "password_strength" "Very Weak" "agree_to_terms" "Password strength" "Already have an account" "Get started with your free account"; do
  n=$(grep -l "$pat" *.js 2>/dev/null | head -2)
  echo "[$pat] => $n"
done
echo ""
echo "=== check main index js size and date ==="
ls -la index-lphzFU-H.js
echo "=== look for any file mentioning RegisterForm feature ==="
grep -rl "CodingProgress" *.js 2>/dev/null | head -3