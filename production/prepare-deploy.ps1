# Coder's Hero ERP & LMS - Production Deployment Script
# Run this on your server after cloning the repo

Write-Host "========================================" -ForegroundColor Cyan
Write-Host " Coder's Hero - Production Deployment" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$basePath = "C:\Users\dunth\Desktop\projects\coders-hero"
$deployPath = "$basePath\production\deploy"
$backendPath = "$basePath\backend"
$frontendPath = "$basePath\frontend"

# Clean deploy directory
if (Test-Path $deployPath) {
    Remove-Item $deployPath -Recurse -Force
}
New-Item -ItemType Directory -Path $deployPath -Force | Out-Null

Write-Host "[1/5] Copying backend files..." -ForegroundColor Yellow
# Backend - only production files
robocopy $backendPath "$deployPath\backend" /E /XD "node_modules" ".git" "storage" "bootstrap/cache" "tests" ".idea" ".vscode" /XF ".env" ".env.*" "*.sqlite" /NFL /NDL /NJH /NJS /NC /NS /NP

# Backend - config and public
Write-Host "[2/5] Copying frontend build..." -ForegroundColor Yellow
if (Test-Path "$frontendPath\dist") {
    robocopy "$frontendPath\dist" "$deployPath\backend\public\build" /E /NFL /NDL /NJH /NJS /NC /NS /NP
} else {
    Write-Host "  WARNING: frontend/dist not found. Run 'npm run build' first." -ForegroundColor Red
}

Write-Host "[3/5] Copying production configs..." -ForegroundColor Yellow
# Production configs
Copy-Item "$basePath\production\.env.production" "$deployPath\.env.production"
Copy-Item "$basePath\production\docker-compose.prod.yml" "$deployPath\docker-compose.prod.yml"
Copy-Item "$basePath\production\Dockerfile.prod" "$deployPath\Dockerfile.prod"
Copy-Item "$basePath\production\nginx.conf" "$deployPath\nginx.conf"
Copy-Item "$basePath\production\backup.sh" "$deployPath\backup.sh"
Copy-Item "$basePath\production\DEPLOYMENT.md" "$deployPath\DEPLOYMENT.md"

Write-Host "[4/5] Creating required directories..." -ForegroundColor Yellow
# Required directories
New-Item -ItemType Directory -Path "$deployPath\backend\storage\app\public" -Force | Out-Null
New-Item -ItemType Directory -Path "$deployPath\backend\storage\framework\cache" -Force | Out-Null
New-Item -ItemType Directory -Path "$deployPath\backend\storage\framework\sessions" -Force | Out-Null
New-Item -ItemType Directory -Path "$deployPath\backend\storage\framework\views" -Force | Out-Null
New-Item -ItemType Directory -Path "$deployPath\backend\storage\logs" -Force | Out-Null
New-Item -ItemType Directory -Path "$deployPath\backend\bootstrap\cache" -Force | Out-Null
New-Item -ItemType Directory -Path "$deployPath\ssl" -Force | Out-Null

Write-Host "[5/5] Creating .gitignore for deploy..." -ForegroundColor Yellow
@"
node_modules/
vendor/
.env
*.sqlite
storage/logs/*
storage/framework/cache/*
storage/framework/sessions/*
storage/framework/views/*
bootstrap/cache/*
.DS_Store
"@ | Set-Content "$deployPath\.gitignore"

# Summary
$backendFiles = (Get-ChildItem "$deployPath\backend" -Recurse -File).Count
$deployFiles = (Get-ChildItem $deployPath -Recurse -File).Count
$backendSize = (Get-ChildItem "$deployPath\backend" -Recurse -File | Measure-Object -Property Length -Sum).Sum / 1MB

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host " Deployment package ready!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Location: $deployPath"
Write-Host "Backend files: $backendFiles"
Write-Host "Total files: $deployFiles"
Write-Host "Backend size: $([math]::Round($backendSize, 1)) MB"
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "  1. Upload 'production/deploy' folder to your server"
Write-Host "  2. Copy .env.production to .env and fill in values"
Write-Host "  3. Run: docker compose -f docker-compose.prod.yml up -d"
Write-Host "  4. Run: docker compose -f docker-compose.prod.yml run --rm app php artisan key:generate"
Write-Host "  5. Run: docker compose -f docker-compose.prod.yml run --rm app php artisan migrate --seed"
Write-Host ""
