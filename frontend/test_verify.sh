#!/bin/bash
# Test the exact format Flutter sends (form-urlencoded via Map + Options)
curl -s -X POST "https://coderhero.duncowebsolutions.co.ke/api/login" \
  -H "Accept: application/json" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "email=alex@example.com&password=password" | python3 -c "
import sys,json
r=json.load(sys.stdin)
print('success:', r.get('success'))
d=r.get('data',{})
print('has token:', 'token' in d)
print('has user:', 'user' in d)
u=d.get('user',{})
print('has roles:', 'roles' in u)
print('student_id:', u.get('student_id'))
"

echo ""
echo "=== Test multipart form-data (Flutter FormData format) ==="
curl -s -X POST "https://coderhero.duncowebsolutions.co.ke/api/login" \
  -H "Accept: application/json" \
  -F "email=alex@example.com" \
  -F "password=password" | python3 -c "
import sys,json
r=json.load(sys.stdin)
print('success:', r.get('success'))
d=r.get('data',{})
print('has token:', 'token' in d)
print('has user:', 'user' in d)
"

echo ""
echo "=== Test JSON format ==="
curl -s -X POST "https://coderhero.duncowebsolutions.co.ke/api/login" \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  -d '{"email":"alex@example.com","password":"password"}' | python3 -c "
import sys,json
r=json.load(sys.stdin)
print('success:', r.get('success'))
d=r.get('data',{})
print('has token:', 'token' in d)
"
