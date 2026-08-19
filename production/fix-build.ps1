# Fix React Build - Run on server via SSH
# This copies build assets to the correct location

cd /home/duncoweb/coderhero.duncowebsolutions.co.ke

# 1. Copy build contents to public root
cp -r public/build/assets public/assets
cp public/build/index.html public/index.html

# 2. Clear caches
php artisan config:clear
php artisan route:clear
php artisan cache:clear

# 3. Verify
ls -la public/assets/ | head -5
ls -la public/index.html
echo "Done! Refresh the page."
