#!/bin/bash
curl -s -X POST "https://coderhero.duncowebsolutions.co.ke/api/login" \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  -d '{"email":"alex@example.com","password":"password"}' > /tmp/login_resp.json
python3 - <<'PY'
import json
r = json.load(open('/tmp/login_resp.json'))
d = r.get('data', {})
u = d.get('user', {})
print("resp keys:", list(r.keys()))
print("data keys:", list(d.keys()))
print("user keys:", list(u.keys()))
print("user.roles:", json.dumps(u.get('roles'), indent=1)[:800])
print("user.student_id:", u.get('student_id'))
PY