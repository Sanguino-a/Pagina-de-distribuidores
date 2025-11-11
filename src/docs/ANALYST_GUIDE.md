# Guía para Analistas - Gestión de Cotizaciones

## 🎯 Funcionalidades Implementadas

### ✅ Aprobar Cotizaciones
Los analistas pueden aprobar directamente cualquier cotización de distribuidor que esté en estado:
- `draft` (borrador)
- `sent` (enviado)  
- `viewed` (visto)
- `pending` (pendiente)

**¿Qué pasa al aprobar?**
- La cotización cambia a estado "aprobado"
- Se registra en el historial quién aprobó y cuándo
- La cotización ya no puede ser eliminada
- Se puede seguir viendo pero no modificando

### 🗑️ Rechazar y Eliminar Cotizaciones
Los analistas pueden rechazar y eliminar permanentemente cotizaciones que estén en cualquier estado excepto "aprobado".

**¿Qué pasa al rechazar?**
- Se solicita una razón obligatoria para el rechazo
- La cotización cambia temporalmente a "rechazada"
- Luego se elimina permanentemente de la base de datos
- El distribuidor no podrá ver esta cotización nunca más

### 🔒 Permisos y Restricciones

**Lo que SÍ pueden hacer los analistas:**
- ✅ Modificar cotizaciones de distribuidores (no las suyas propias)
- ✅ Aprobar cotizaciones en cualquier estado válido
- ✅ Eliminar cotizaciones no aprobadas
- ✅ Ver el historial completo de todas las cotizaciones

**Lo que NO pueden hacer:**
- ❌ Modificar sus propias cotizaciones (tienen que ser de otro usuario)
- ❌ Modificar cotizaciones ya aprobadas
- ❌ Eliminar cotizaciones aprobadas

## 🚀 Cómo Usar la Funcionalidad

### 1. Acceder como Analista
- Iniciar sesión con un usuario que tenga rol `analista`
- Navegar a la página "Panel del analista"

### 2. Revisar Cotizaciones
- Ver todas las cotizaciones en la tabla principal
- Usar filtros para encontrar cotizaciones específicas
- Hacer clic en cualquier cotización para ver los detalles

### 3. Tomar Decisiones
En el modal de detalles de la cotización, encontrarás la sección **"Acciones de Analista"**:

#### Para Aprobar:
1. Hacer clic en el botón verde **"✅ Aprobar Cotización"**
2. La cotización se aprobará inmediatamente
3. Recibirás una confirmación de éxito

#### Para Rechazar y Eliminar:
1. Hacer clic en el botón rojo **"🗑️ Rechazar y Eliminar"**
2. Proporcionar una razón obligatoria para el rechazo
3. Revisar la advertencia sobre la acción irreversible
4. Hacer clic en **"Confirmar Eliminación"**
5. La cotización se eliminará permanentemente

### 4. Confirmaciones y Validaciones

**El sistema siempre:**
- ✅ Valida permisos antes de permitir acciones
- ✅ Muestra el estado actual de la cotización
- ✅ Proporciona recomendaciones basadas en el estado
- ✅ Muestra mensajes de éxito o error
- ✅ Actualiza la interfaz en tiempo real

**Para eliminación:**
- ⚠️ Solicita razón obligatoria
- ⚠️ Muestra advertencia de acción irreversible
- ⚠️ Requiere doble confirmación
- ⚠️ No se puede deshacer

## 🔧 Funciones Técnicas Disponibles

### En el Código (servicios/quotes.js):
```javascript
// Aprobar cotización
await approveQuote(quoteId, userInfo);

// Rechazar y eliminar
await rejectAndDeleteQuote(quoteId, userInfo, reason);

// Verificar permisos
canAnalystModify(quote, userProfile);
canAnalystDelete(quote, userProfile);

// Obtener información del flujo
getAnalystWorkflowInfo(quote);
```

### Componentes Disponibles:
- `AnalystQuoteActions` - Botones y lógica para aprobar/rechazar
- Integrado en `Analyst.jsx` - Página principal del analista
- `QuoteStatusManager` - Gestión tradicional de estados (todavía funcional)

## 🎨 Mejoras en la Interfaz

### Estados Visuales:
- 🟢 Verde para aprobar
- 🔴 Rojo para rechazar/eliminar  
- 📋 Información contextual del estado actual
- 💡 Recomendaciones basadas en el estado

### Confirmaciones:
- Dialogs modales con advertencias claras
- Campos obligatorios marcados
- Botones deshabilitados cuando no es aplicable

### Retroalimentación:
- Toast notifications para todas las acciones
- Actualizaciones en tiempo real de la tabla
- Mensajes de error específicos

## 🔐 Seguridad Implementada

1. **Validación de Roles**: Solo usuarios con rol `analista` pueden acceder
2. **Validación de Propietario**: No pueden modificar sus propias cotizaciones
3. **Validación de Estado**: Solo pueden eliminar cotizaciones no aprobadas
4. **Validación de Transiciones**: Flujo controlado de estados
5. **Auditoría**: Registro completo en historial de acciones

## 🐛 Solución de Problemas

### Si no aparecen los botones:
- Verificar que el usuario tiene rol `analista`
- Verificar que no es propietario de la cotización
- Verificar que la cotización no está en estado "aprobado"

### Si hay errores al aprobar:
- Revisar que la cotización existe
- Verificar conexión con Firestore
- Comprobar permisos en Firebase

### Si hay errores al eliminar:
- La eliminación es permanente e irreversible
- Verificar que la cotización no esté bloqueada
- Comprobar que se proporcionó una razón válida

## 📝 Notas Importantes

- **Reversibilidad**: La aprobación es reversible solo cambiando manualmente en la base de datos
- **Eliminación**: La eliminación es completamente irreversible
- **Historial**: Se mantiene registro de todas las acciones en `statusHistory`
- **Trazabilidad**: Cada acción registra usuario, timestamp y notas
- **Performance**: Las actualizaciones son en tiempo real via Firestore