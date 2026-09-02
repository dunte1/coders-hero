cd /home/duncoweb/coderhero.duncowebsolutions.co.ke/public
echo "=== latest js in public root ==="
ls -t *.js 2>/dev/null | head -5
echo "=== index.html references ==="
ls -t index.html
grep -o 'assets/index-[A-Za-z0-9_-]*\.js' index.html | head -3
echo "=== check register strings in main index chunk ==="
MAIN=$(grep -o 'assets/index-[A-Za-z0-9_-]*\.js' index.html | head -1)
echo "main: $MAIN"
if [ -n "$MAIN" ]; then
  grep -l 'Create your account' "$MAIN" && echo "REGISTER TEXT FOUND in main" || echo "not in main"
  grep -l 'Developed by Duncoweb' "$MAIN" && echo "FOOTER TEXT FOUND in main" || echo "footer not in main"
fi
echo "=== search all latest asset js for footer text ==="
cd assets
grep -l 'Developed by Duncoweb' *.js 2>/dev/null | head -5