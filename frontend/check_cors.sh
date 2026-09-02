#!/bin/bash
echo "=== OPTIONS preflight from localhost:54321 ==="
curl -s -i -X OPTIONS "https://coderhero.duncowebsolutions.co.ke/api/login" \
  -H "Origin: http://localhost:54321" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: content-type,accept" | grep -i -E "HTTP/|access-control"
echo ""
echo "=== Actual POST with Origin header ==="
curl -s -i -X POST "https://coderhero.duncowebsolutions.co.ke/api/login" \
  -H "Origin: http://localhost:54321" \
  -H "Content-Type: application/json" \
  -d '{"email":"alex@example.com","password":"password"}' | grep -i -E "HTTP/|access-control"