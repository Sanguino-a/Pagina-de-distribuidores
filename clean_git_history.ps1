# Script PowerShell para eliminar .env.local del historial completo de Git

Write-Host "=== ELIMINANDO .env.local DEL HISTORIAL DE GIT ===" -ForegroundColor Yellow

# 1. Verificar estado actual
Write-Host "1. Verificando estado actual..." -ForegroundColor Green
git status --porcelain

# 2. Verificar si .env.local existe en el historial
Write-Host "2. Buscando .env.local en el historial..." -ForegroundColor Green
git log --all --source --full-history -- "*.env*"

# 3. Eliminar del historial usando git filter-branch
Write-Host "3. Eliminando .env.local del historial..." -ForegroundColor Green
git filter-branch --force --index-filter `
  'git rm --cached --ignore-unmatch .env.local' `
  --prune-empty --tag-name-filter cat -- --all

# 4. Limpiar referencias huérfanas
Write-Host "4. Limpiando referencias..." -ForegroundColor Green
git reflog expire --expire=now --all
git gc --prune=now --aggressive

# 5. Verificar que se eliminó
Write-Host "5. Verificando eliminación..." -ForegroundColor Green
git log --all --source --full-history -- "*.env*"

# 6. Eliminar archivo físico
Write-Host "6. Eliminando archivo físico..." -ForegroundColor Green
Remove-Item .env.local -ErrorAction SilentlyContinue

Write-Host "7. Estado final:" -ForegroundColor Green
git status --porcelain

Write-Host "=== COMPLETADO ===" -ForegroundColor Yellow
Write-Host "Para subir los cambios:" -ForegroundColor White
Write-Host "git push origin --force --all" -ForegroundColor Cyan