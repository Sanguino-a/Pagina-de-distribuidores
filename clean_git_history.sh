#!/bin/bash
# Script para eliminar .env.local del historial completo de Git

echo "=== ELIMINANDO .env.local DEL HISTORIAL DE GIT ==="

# 1. Verificar estado actual
echo "1. Verificando estado actual..."
git status --porcelain

# 2. Verificar si .env.local existe en el historial
echo "2. Buscando .env.local en el historial..."
git log --all --source --full-history -- "*.env*"

# 3. Eliminar del historial usando git filter-branch
echo "3. Eliminando .env.local del historial..."
git filter-branch --force --index-filter \
  'git rm --cached --ignore-unmatch .env.local' \
  --prune-empty --tag-name-filter cat -- --all

# 4. Limpiar referencias huérfanas
echo "4. Limpiando referencias..."
git reflog expire --expire=now --all
git gc --prune=now --aggressive

# 5. Verificar que se eliminó
echo "5. Verificando eliminación..."
git log --all --source --full-history -- "*.env*"

# 6. Eliminar archivo físico
echo "6. Eliminando archivo físico..."
rm -f .env.local

echo "7. Estado final:"
git status --porcelain

echo "=== COMPLETADO ==="
echo "Para subir los cambios:"
echo "git push origin --force --all"