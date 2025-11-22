# 🔐 GUÍA DE SEGURIDAD PARA VARIABLES DE ENTORNO

## ✅ MEJORES PRÁCTICAS IMPLEMENTADAS EN ESTE PROYECTO:

### 1. ARCHIVO .GITIGNORE CONFIGURADO CORRECTAMENTE
Tu `.gitignore` ya incluye todas las variantes de archivos de entorno:
- `.env`
- `.env.local`
- `.env.development.local`
- `.env.test.local`
- `.env.production.local`
- `.env.*.local`

### 2. CREDENCIALES EN VARIABLES DE ENTORNO
✅ Las credenciales se cargan desde variables de entorno
✅ No están hardcodeadas en el código fuente
✅ Se usan variables VITE_* para cliente (no sensibles)

## 🚨 PASOS CRÍTICOS A SEGUIR:

### INMEDIATO (1-2 días):
1. **Eliminar las credenciales actuales del historial de Git:**
   - **Windows PowerShell**: Ejecuta `clean_git_history.ps1`
   - **Linux/Mac**: Ejecuta `./clean_git_history.sh`
   - **Manual**: 
     ```bash
     git filter-branch --force --index-filter 'git rm --cached --ignore-unmatch .env.local' --prune-empty --tag-name-filter cat -- --all
     git push origin --force --all
     ```

2. **Regenerar credenciales de Firebase:**
   - Ve a: https://console.firebase.google.com/project/distribuidor-de-loncheras/settings/general
   - Crea una nueva Web API Key
   - Actualiza el archivo `.env.local` con nuevas credenciales

### A FUTURO (prevenir exposición):

#### A. CONFIGURACIÓN DE REPOSITORIO
```bash
# Verificar antes de cada commit
git status --porcelain | Select-String "\.env"

# Si encuentra archivos .env, desagregar:
git reset .env*
```

#### B. GITHUB SECURITY FEATURES
1. **Habilitar Secret Scanning:**
   - Ve a Settings > Code security and analysis
   - Habilitar "Secret scanning"
   - Configurar push protection

2. **Branch Protection Rules:**
   - Proteger rama principal
   - Requerir status checks

#### C. HERRAMIENTAS DE GESTIÓN DE SECRETOS
Para proyectos más grandes, considera:
- **HashiCorp Vault**: Para gestión centralizada
- **AWS Secrets Manager**: Si usas AWS
- **Azure Key Vault**: Si usas Azure
- **GitHub Secrets**: Para Actions CI/CD
- **Vercel/Netlify Environment Variables**: Para despliegue

#### D. VARIABLES DE ENTORNO EN DESARROLLO
```bash
# Crear archivo .env.example (SIN credenciales reales)
cp .env.local .env.example
# Editar .env.example y reemplazar valores reales con placeholders
```

#### E. VALIDACIÓN EN TIEMPO DE EJECUCIÓN
```javascript
// En servicios que usan variables de entorno
const requiredEnvVars = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_PROJECT_ID'
];

requiredEnvVars.forEach(envVar => {
  if (!import.meta.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
});
```

## 🗑️ ELIMINAR ARCHIVOS DEL HISTORIAL DE GIT:

### OPCIÓN 1: Scripts automatizados (RECOMENDADO)
He creado dos scripts para ti:
- **`clean_git_history.ps1`** - Para Windows PowerShell
- **`clean_git_history.sh`** - Para Linux/Mac

**Para ejecutar (Windows):**
```powershell
# Abrir PowerShell en la carpeta del proyecto
.\clean_git_history.ps1
```

**Si no funciona, ejecutar manualmente:**
```powershell
# Ejecutar cada comando uno por uno:
git filter-branch --force --index-filter 'git rm --cached --ignore-unmatch .env.local' --prune-empty --tag-name-filter cat -- --all
git reflog expire --expire=now --all
git gc --prune=now --aggressive
Remove-Item .env.local
git push origin --force --all
```

### OPCIÓN 2: Usar BFG Repo-Cleaner (Alternativa)
Si `git filter-branch` falla:
1. Descarga BFG desde: https://rtyley.github.io/bfg-repo-cleaner/
2. Ejecuta:
```bash
java -jar bfg.jar --delete-files "*.env*"
git reflog expire --expire=now --all && git gc --prune=now --aggressive
git push origin --force --all
```

## 🔍 COMANDOS ÚTILES PARA VERIFICAR:

```powershell
# Ver si hay archivos .env en el historial
git log --all --source --full-history -- "*.env*"

# Ver archivos preparados para commit
git status --porcelain | Select-String "\.env"

# Ver tamaño del repositorio
git count-objects -vH

# Limpiar archivos huérfanos
git reflog expire --expire=now --all && git gc --prune=now --aggressive
```

