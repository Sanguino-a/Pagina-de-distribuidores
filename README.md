#  Loncheras+ | Plataforma B2B React

[![React](https://img.shields.io/badge/React-18.2.0-blue.svg)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-5.4.0-yellow.svg)](https://vitejs.dev/)
[![Firebase](https://img.shields.io/badge/Firebase-12.4.0-orange.svg)](https://firebase.google.com/)
[![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-yellow.svg)](https://developer.mozilla.org/es/docs/Web/JavaScript)

Una plataforma B2B moderna para distribuidores de loncheras nutritivas que conecta proveedores con analistas, facilitando la creación y gestión profesional de cotizaciones con flujo de aprobación completo.

##  Tabla de Contenidos

- [Características Principales](#-características-principales)
- [Instalación y Configuración](#-instalación-y-configuración)
- [Scripts Disponibles](#-scripts-disponibles)
- [Dependencias](#-dependencias)
- [Guía de Usuario](#-guía-de-usuario)
- [Desarrollo](#-desarrollo)
- [Configuración](#-configuración)
- [Arquitectura](#-arquitectura)
- [Contribución](#-contribución)

##  Características Principales

###  Sistema de Autenticación
- **Firebase Auth** con autenticación segura
- **Roles diferenciados**: Proveedores y Analistas
- **Rutas protegidas** según permisos de usuario
- **Perfiles de usuario** personalizados con datos completos

###  Gestión de Catálogo
- **Integración con TheMealDB** para productos de demostración
- **Catálogo dinámico** con imágenes y descripciones
- **Agregado rápido** de productos a cotizaciones
- **Cache local** para mejor rendimiento

### Sistema de Cotizaciones
- **Creación de cotizaciones** con validación completa
- **Cálculo automático** de totales y subtotales
- **Gestión de estados**: borrador, enviada, vista, aprobada, rechazada, expirada
- **Historial completo** de cotizaciones por usuario
- **Workflow de aprobación** para analistas

###  Panel de Analista Avanzado
- **Vista completa** de todas las cotizaciones
- **Filtros avanzados** por fecha, monto, proveedor, producto, estado
- **Ordenamiento dinámico** por múltiples campos
- **Estadísticas en tiempo real** (total, promedio, conversión)
- **Aprobación/Rechazo** de cotizaciones con razones obligatorias
- **Análisis de rendimiento** por distribuidor

### Interfaz de Usuario
- **Diseño responsivo** para todos los dispositivos
- **Modo claro/oscuro** con ThemeProvider
- **Componentes reutilizables** con diseño consistente
- **Feedback visual** con toast notifications
- **Loading states** y skeleton loaders
- **Navegación intuitiva** con rutas protegidas

### Servicios Adicionales
- **Generación de PDF** con jsPDF
- **Servicios de email** integrados (EmailJS + fallback mailto)
- **Persistencia local** para datos temporales
- **Error boundaries** para manejo de errores

## Instalación y Configuración

### Prerrequisitos

- **Node.js** (versión 18 o superior)
- **npm** o **yarn**
- **Cuenta de Firebase** para backend

### 1. Clonar el Repositorio

```bash
git clone https://github.com/tu-usuario/loncheras-react.git
cd loncheras-react
```

### 2. Instalar Dependencias

```bash
npm install
# o
yarn install
```

### 3. Configuración de Firebase

1. Crear un proyecto en [Firebase Console](https://console.firebase.google.com/)
2. Habilitar **Authentication** y **Firestore Database**
3. Obtener las credenciales del proyecto
4. Crear archivo `.env` en la raíz del proyecto:

```env
VITE_FIREBASE_API_KEY=tu_api_key
VITE_FIREBASE_AUTH_DOMAIN=tu_proyecto.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=tu_proyecto_id
VITE_FIREBASE_STORAGE_BUCKET=tu_proyecto.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef123456

# Opcional: EmailJS para envío de emails
VITE_EMAILJS_SERVICE_ID=your_service_id
VITE_EMAILJS_TEMPLATE_ID=your_template_id
VITE_EMAILJS_PUBLIC_KEY=your_public_key
```

### 4. Configuración de Firestore

En Firebase Console, crear las siguientes colecciones:
- `users` - Perfiles de usuario
- `quotes` - Cotizaciones

Reglas de seguridad recomendadas:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /quotes/{document} {
      allow read, write: if request.auth != null;
    }
    match /users/{document} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.uid;
    }
  }
}
```

### 5. Ejecutar en Desarrollo

```bash
npm run dev
# o
yarn dev
```

La aplicación estará disponible en `http://localhost:5173`

### 6. Build para Producción

```bash
npm run build
# o
yarn build
```

### 7. Deploy

```bash
npm run deploy
# o
yarn deploy
```

## 📦 Scripts Disponibles

| Script | Descripción |
|--------|-------------|
| `npm run dev` | Inicia el servidor de desarrollo |
| `npm run build` | Construye la aplicación para producción |
| `npm run preview` | Previsualiza el build de producción localmente |
| `npm run deploy` | Construye y despliega a Firebase Hosting |

## 📚 Dependencias

### Dependencias Principales
```json
{
  "firebase": "^12.4.0",
  "jspdf": "^3.0.3",
  "jspdf-autotable": "^5.0.2",
  "react": "^18.2.0",
  "react-dom": "^18.2.0",
  "react-router-dom": "^6.30.1"
}
```

### Dependencias de Desarrollo
```json
{
  "@vitejs/plugin-react": "^4.3.0",
  "vite": "^5.4.0"
}
```

##  Guía de Usuario

###  Para Distribuidores

#### Registro e Inicio de Sesión
1. Crear cuenta nueva seleccionando rol "proveedor"
2. Completar datos de perfil (nombre, teléfono, ciudad)
3. Iniciar sesión con email y contraseña

#### Navegación al Panel
1. Acceder a "Panel de Distribuidores"
2. Ver productos disponibles en el catálogo
3. Navegar por secciones: Catálogo, Nueva Cotización, Historial

#### Crear Cotización
1. **Agregar productos** desde el catálogo con botón " Agregar"
2. **Completar detalles**: folio, validez (días), tiempo de entrega
3. **Revisar tabla**: cantidades y precios automáticos
4. **Validar formulario**: totales y campos requeridos
5. **Enviar cotización**: se guarda como "borrador"

#### Gestionar Cotizaciones
1. **Ver historial** de cotizaciones anteriores
2. **Revisar estado** de cada cotización:
   - 📝 Borrador
   - 📤 Enviada
   - 👁️ Vista
   - ✅ Aprobada
   - ❌ Rechazada
   - ⏰ Expirada

###  Para Analistas

#### Acceso al Panel
1. Iniciar sesión con rol "analista"
2. Acceder a "Panel del Analista"
3. Vista completa de todas las cotizaciones

#### Análisis de Cotizaciones
1. **Ver tabla completa** de cotizaciones
2. **Aplicar filtros avanzados**:
   - Por rango de fechas
   - Por monto total
   - Por proveedor específico
   - Por estado actual
   - Por productos incluidos
3. **Ordenar por** cualquier columna
4. **Ver estadísticas** en tiempo real

#### Toma de Decisiones
1. **Aprobar cotizaciones**: Marcar como aprobadas
2. **Rechazar con razón**: Proporcionar feedback obligatorio
3. **Eliminar cotizaciones**: Solo las rechazadas
4. **Workflow restrictions**: No pueden modificar sus propias cotizaciones

#### Exportación de Datos
1. **Generar reportes** en formato CSV
2. **Analizar estadísticas** por período
3. **Tomar decisiones** basadas en datos

###  Navegación General

| Ruta | Descripción | Acceso |
|------|-------------|--------|
| `/` | Landing page | Público |
| `/login` | Inicio de sesión | Público |
| `/registro` | Registro de usuarios | Público |
| `/distribuidores` | Panel de proveedores | Solo proveedores |
| `/analista` | Panel de analistas | Solo analistas |

## Desarrollo

### Estructura de Componentes

Los componentes siguen una arquitectura modular y reutilizable:

```jsx
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function MiComponente() {
  const { user } = useAuth();
  const toast = useToast();
  
  // Lógica del componente
  
  return (
    <div className="component">
      {/* JSX del componente */}
    </div>
  );
}
```

### Custom Hooks

#### `useForm.js` - Manejo completo de formularios
```jsx
const {
  values, setValues, errors, touched,
  isSubmitting, submitError,
  handleChange, handleBlur, handleSubmit, reset
} = useForm({
  initialValues: { campo1: '', campo2: '' },
  validate: (values) => {
    // Validación personalizada
  },
  onSubmit: async (values) => {
    // Envío del formulario
  }
});
```

#### `useLocalStorage.js` - Persistencia local
```jsx
const [data, setData] = useLocalStorage('mi_clave', valor_inicial);
```

### Context Providers

- **AuthContext**: Gestión de autenticación y perfil de usuario
- **ThemeContext**: Cambio de tema claro/oscuro
- **ToastContext**: Sistema de notificaciones global

### Servicios

- **firebase.js**: Configuración principal y conexión
- **quotes.js**: CRUD completo de cotizaciones
- **emailService.jsx**: Envío de emails con EmailJS
- **pdfService.jsx**: Generación de PDFs
- **themealdb.js**: Integración con API externa

##  Configuración

### Variables de Entorno

Crear archivo `.env` con:

```env
# Firebase Configuration (REQUERIDO)
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id

# EmailJS Configuration (OPCIONAL)
VITE_EMAILJS_SERVICE_ID=your_service_id
VITE_EMAILJS_TEMPLATE_ID=your_template_id
VITE_EMAILJS_PUBLIC_KEY=your_public_key
```

### Configuración de Vite

`vite.config.js` está preconfigurado con:
- Plugin de React
- Servidor de desarrollo con hot reload
- Build optimization para producción

##  Arquitectura

```
src/
├── components/            # Componentes reutilizables
│   ├── ErrorBoundary.jsx  # Manejo de errores
│   ├── Header.jsx         # Cabecera de navegación
│   ├── Footer.jsx         # Pie de página
│   ├── Layout.jsx         # Layout principal
│   ├── ProtectedRoute.jsx # Rutas protegidas
│   ├── QuoteTable.jsx     # Tabla de productos
│   ├── SnackCard.jsx      # Card de producto
│   ├── StatCards.jsx      # Tarjetas de estadísticas
│   ├── ThemeToggle.jsx    # Selector de tema
│   ├── Toast.jsx          # Notificaciones
│   ├── SkeletonLoader.jsx # Cargadores
│   ├── FilterableCatalog.jsx # Catálogo filtrable
│   └── AnalystQuoteActions.jsx # Acciones de analista
├── context/               # Context providers
│   ├── AuthContext.jsx    # Autenticación
│   ├── ThemeContext.jsx   # Gestión de temas
│   └── ToastContext.jsx   # Notificaciones
├── hooks/                 # Custom hooks
│   ├── useForm.js         # Manejo de formularios
│   └── useLocalStorage.js # Persistencia local
├── pages/                 # Páginas principales
│   ├── Home.jsx           # Página de inicio
│   ├── Distributors.jsx   # Panel de distribuidores
│   ├── Analyst.jsx        # Panel de analista
│   ├── Login.jsx          # Inicio de sesión
│   └── Register.jsx       # Registro
├── services/              # Servicios externos
│   ├── firebase.js        # Configuración Firebase
│   ├── quotes.js          # Gestión de cotizaciones
│   ├── emailService.jsx   # Servicios de email
│   ├── pdfService.jsx     # Generación PDF
│   └── themealdb.js       # API TheMealDB
├── utils/                 # Utilidades
│   └── format.js          # Formateadores
├── styles.css             # Estilos globales
├── App.jsx                # Componente raíz
└── main.jsx               # Entry point
```

##  Características Técnicas

## Arquitectura Frontend-Backend Unificada

### Por que un solo repositorio para Frontend y Backend

Este proyecto utiliza un enfoque de **Frontend-Backend unificado** con **Firebase como Backend-as-a-Service (BaaS)**, lo que permite tener tanto la interfaz de usuario como la lógica del backend en el mismo repositorio.

### Ventajas de esta arquitectura:

**Simplicidad de desarrollo:**
- Un solo proyecto, un solo repositorio
- Configuración unificada de herramientas (Vite, React, Firebase)
- Deploy automático con un solo comando
- Menos complejidad operacional

**Firebase como Backend:**
- **Autenticación**: Firebase Auth maneja usuarios, tokens y roles
- **Base de datos**: Firestore Database reemplaza servidor de base de datos
- **API**: Firebase SDK reemplaza endpoints Express.js personalizados
- **Hosting**: Firebase Hosting sirve la aplicación React compilada
- **Funciones**: Cloud Functions para lógica de backend cuando sea necesaria

**Flujo de trabajo simplificado:**
```
Desarrollo: npm run dev
Build: npm run build  
Deploy: npm run deploy
```

**Separación de responsabilidades interna:**
- **Frontend**: Directorio `src/components/`, `src/pages/`, `src/hooks/`
- **Backend Logic**: Directorio `src/services/`, `src/context/`
- **Configuración**: Archivos de configuración en la raíz

### Comparación con arquitectura tradicional:

| Aspecto | Arquitectura Tradicional | Firebase BaaS |
|---------|-------------------------|---------------|
| Repositorios | 2 (frontend + backend) | 1 (unificado) |
| Servidor | Node.js + Express | No requerido |
| Base de datos | MongoDB/PostgreSQL | Firestore |
| Autenticación | JWT personalizado | Firebase Auth |
| Deploy | Separate pipelines | Un solo pipeline |
| Escalabilidad | Manual | Automática |

### Cuando usar esta arquitectura:

**Ideal para:**
- Aplicaciones de tamaño pequeño a mediano
- Equipos de desarrollo pequeños
- Proyectos con presupuesto limitado para infraestructura
- Prototipos y MVPs rápidos
- Aplicaciones con requerimientos de autenticación estándar

**No ideal para:**
- Aplicaciones con lógica de backend muy compleja
- Requerimientos específicos de base de datos
- Necesidades de procesamiento intensivo del lado del servidor
- Integraciones complejas con sistemas legacy

### Despliegue: Un solo link, no dos

**Diferencia con arquitectura tradicional:**

**Arquitectura tradicional requiere dos despliegues:**
```
Frontend (React) → Backend API (Express.js) → Base de datos (MongoDB)

Deploy separado:
- Frontend: Vercel/Netlify → Link 1
- Backend: Render/Railway → Link 2
- Base de datos: MongoDB Atlas → Link 3
```

**arquitectura Firebase requiere un solo despliegue:**
```
Frontend (React) → Firebase SDK → Firebase Services

Deploy unificado:
- Frontend: Firebase Hosting → Link único
- "Backend": Google Firebase infraestructura → Sin link separado
- Base de datos: Firestore → Sin link separado
```

**Por qué no necesitas links separados:**

1. **Backend como Servicio (BaaS):** Firebase Auth, Firestore, Cloud Functions son servicios de Google que no se "despliegan" como código separado. Están disponibles automáticamente con tu proyecto Firebase.

2. **Link único:** Tu aplicación tiene solo este link:
   **https://distribuidor-de-loncheras.firebaseapp.com**

3. **Funcionamiento interno:** El frontend llama a Firebase SDK, que se conecta automáticamente a tus servicios. No hay endpoints HTTP separados que desplegar.

**Ventajas de este enfoque:**
- Un solo link para mantener y compartir
- Infraestructura escalable automática
- No gestión de servidor backend
- Seguridad manejada por Google
- Menos costos operacionales

**En resumen:** Con Firebase no tienes "backend desplegado" porque el backend es el servicio de Google que ya está ejecutándose. Solo despliegas el frontend y se conecta automáticamente a Firebase.

Esta arquitectura permite enfocarse en la lógica de negocio y la experiencia del usuario, delegando la infraestructura compleja a Firebase.

### Estado de la Aplicación
- **Context API** para estado global
- **LocalStorage** para persistencia temporal
- **Firestore** para datos en tiempo real
- **Custom hooks** para lógica reutilizable

### Performance
- **Lazy loading** de componentes
- **Memoización** con useMemo y useCallback
- **Skeleton loaders** durante carga de datos
- **Cache local** para catálogos

### Responsive Design
- **Mobile-first** approach
- **Flexbox** y **CSS Grid** para layouts
- **Breakpoints** configurados
- **Touch-friendly** interfaces

### Accesibilidad
- **ARIA labels** en componentes interactivos
- **Navegación por teclado** completa
- **Contraste de colores** optimizado
- **Screen reader** friendly

##  Solución de Problemas

### Errores Comunes

#### 1. Error de Firebase Connection
**Problema**: No se conecta a Firebase
**Solución**: 
- Verificar credenciales en `.env`
- Revisar reglas de Firestore
- Comprobar configuración del proyecto Firebase

#### 2. Problemas de Autenticación
**Problema**: No se puede hacer login
**Solución**:
- Verificar configuración de Firebase Auth
- Revisar email/contraseña
- Comprobar que el usuario esté registrado

#### 3. Catálogo no carga
**Problema**: Los productos no aparecen
**Solución**:
- Verificar conexión con TheMealDB API
- Revisar consola del navegador para errores
- Comprobar configuración de red

#### 4. Error en build de producción
**Problema**: Falla al construir para producción
**Solución**:
```bash
npm run build -- --force
# o
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Logs de Debug

Para activar logs de desarrollo, verificar la consola del navegador donde aparecen mensajes detallados de:

- Conexión con Firebase
- Estados de autenticación
- Operaciones de base de datos
- Errores de validación

### Performance Issues

- Verificar **Network tab** en DevTools
- Comprobar **Firebase quotas**
- Revisar **Firestore usage**
- Monitorear **memory usage**

##  Contribución

### Guidelines

1. Fork el repositorio
2. Crear branch feature: `git checkout -b feature/nueva-caracteristica`
3. Commit cambios: `git commit -m 'Agregar nueva característica'`
4. Push al branch: `git push origin feature/nueva-caracteristica`
5. Crear Pull Request

### Estándares de Código

- Usar **ESLint** para linting
- Seguir **convención de nombres** del proyecto
- **Documentar** funciones complejas
- Componentes funcionales con **hooks**
- **PropTypes** para props

### Commits

Usar **Conventional Commits**:

- `feat:` agregar nuevo componente
- `fix:` corregir bug en formulario
- `docs:` actualizar documentación
- `style:` cambios de formato
- `refactor:` refactorizar código
- `test:` agregar tests
- `chore:` tareas de mantenimiento

## 🏆 Características Destacadas

✅ **Arquitectura escalable** con React 18  
✅ **Autenticación segura** con Firebase  
✅ **Base de datos en tiempo real** con Firestore  
✅ **Interfaz moderna y responsive**  
✅ **Sistema de roles robusto**  
✅ **Filtros avanzados** para análisis  
✅ **Workflow de aprobación** completo  
✅ **Generación automática** de PDFs  
✅ **Integración con APIs externas**  
✅ **Gestión de errores** completa  

## 📄 Licencia

Este proyecto está bajo la **Licencia MIT**. Ver `LICENSE` para más detalles.

---

Desarrollado con  usando **React**, **Firebase** y **Vite**
