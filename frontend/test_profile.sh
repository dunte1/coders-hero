#!/bin/bash
RESP=$(curl -s -X POST https://coderhero.duncowebsolutions.co.ke/api/login \
  -H 'Content-Type: application/x-www-form-urlencoded' \
  -d 'email=alex@example.com&password=password')
TOKEN=$(echo "$RESP" | python3 -c "import sys,json; print(json.load(sys.stdin)['data']['token'])")
echo "--- Login response user fields ---"
echo "$RESP" | python3 -c "
import sys,json
d=json.load(sys.stdin)['data']['user']
print('student_id:', d.get('student_id', 'MISSING'))
print('employee_id:', d.get('employee_id', 'MISSING'))
print('role:', d.get('role', {}).get('name', 'MISSING'))
"
echo ""
echo "--- /api/profile response ---"
curl -s https://coderhero.duncowebsolutions.co.ke/api/profile \
  -H "Authorization: Bearer $TOKEN" | python3 -c "
import sys,json
d=json.load(sys.stdin)['data']
print('student_id:', d.get('student_id', 'MISSING'))
print('employee_id:', d.get('employee_id', 'MISSING'))
print('employee:', d.get('employee', 'MISSING'))
print('role:', d.get('role', {}).get('name', 'MISSING') if d.get('role') else 'MISSING')
"
