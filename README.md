 Loncheras+ React - README
Based on my analysis of the project structure, I'll create a comprehensive README file for your nutritious lunch box distributor platform.

#  Loncheras+ | Plataforma B2B React

[![React](https://img.shields.io/badge/React-18.2.0-blue.svg)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-5.4.0-yellow.svg)](https://vitejs.dev/)
[![Firebase](https://img.shields.io/badge/Firebase-12.4.0-orange.svg)](https://firebase.google.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-green.svg)](https://www.typescriptlang.org/)

Una plataforma B2B moderna para distribuidores de loncheras nutritivas que conecta proveedores con colegios y empresas, facilitando la creación y gestión profesional de cotizaciones con entrega a domicilio.

##  Tabla de Contenidos

- [ Características Principales](#-características-principales)
- [ Arquitectura del Proyecto](#️-arquitectura-del-proyecto)
- [ Instalación y Configuración](#-instalación-y-configuración)
- [ Guía de Usuario](#-guía-de-usuario)
- [ Desarrollo](#-desarrollo)
- [ Configuración](#-configuración)
- [ Características Técnicas](#-características-técnicas)
- [ Solución de Problemas](#-solución-de-problemas)
- [ Contribución](#-contribución)
- [ Licencia](#-licencia)

##  Características Principales

###  Sistema de Autenticación
- **Firebase Auth** con autenticación segura
- **Roles diferenciados**: Proveedores y Analistas
- **Rutas protegidas** según permisos de usuario
- **Perfiles de usuario** personalizados

###  Gestión de Catálogo
- **Integración con TheMealDB** para productos de demostración
- **Catálogo dinámico** con imágenes y descripciones
- **Precios configurables** por producto
- **Cache local** para mejor rendimiento

###  Sistema de Cotizaciones
- **Creación de cotizaciones** con validación completa
- **Cálculo automático** de totales y subtotales
- **Gestión de estados**: borrador, enviada, aprobada, rechazada
- **Historial completo** de cotizaciones por usuario

###  Panel de Analista Avanzado
- **Filtros avanzados** por fecha, monto, proveedor, producto
- **Ordenamiento dinámico** por múltiples campos
- **Estadísticas en tiempo real** (total, promedio, máximo, mínimo)
- **Exportación a CSV** para análisis externo
- **Aprobación/Rechazo** de cotizaciones con workflow

###  Interfaz de Usuario
- **Diseño responsivo** para todos los dispositivos
- **Modo claro/oscuro** con ThemeProvider
- **Componentes reutilizables** con diseño consistente
- **Feedback visual** con toast notifications
- **Loading states** y skeleton loaders

### Servicios Adicionales
- **Generación de PDF** con jsPDF
- **Servicios de email** integrados
- **Persistencia local** para datos temporales
- **Error boundaries** para manejo de errores

##  Arquitectura del Proyecto

loncheras-react/
├── public/                     # Archivos estáticos
├── src/
│   ├── components/            # Componentes reutilizables
│   │   ├── ErrorBoundary.jsx  # Manejo de errores
│   │   ├── Header.jsx         # Cabecera de navegación
│   │   ├── Footer.jsx         # Pie de página
│   │   ├── Layout.jsx         # Layout principal
│   │   ├── ProtectedRoute.jsx # Rutas protegidas
│   │   ├── QuoteTable.jsx     # Tabla de cotizaciones
│   │   ├── SnackCard.jsx      # Card de producto
│   │   ├── StatCards.jsx      # Tarjetas de estadísticas
│   │   ├── ThemeToggle.jsx    # Selector de tema
│   │   ├── Toast.jsx          # Notificaciones
│   │   ├── SkeletonLoader.jsx # Cargadores
│   │   ├── FilterableCatalog.jsx # Catálogo filtrable
│   │   └── AnalystQuoteActions.jsx # Acciones de analista
│   ├── context/               # Context providers
│   │   ├── AuthContext.jsx    # Autenticación
│   │   ├── ThemeContext.jsx   # Gestión de temas
│   │   └── ToastContext.jsx   # Notificaciones
│   ├── hooks/                 # Custom hooks
│   │   ├── useForm.js         # Manejo de formularios
│   │   └── useLocalStorage.js # Persistencia local
│   ├── pages/                 # Páginas principales
│   │   ├── Home.jsx           # Página de inicio
│   │   ├── Distributors.jsx   # Panel de distribuidores
│   │   ├── Analyst.jsx        # Panel de analista
│   │   ├── Login.jsx          # Inicio de sesión
│   │   └── Register.jsx       # Registro
│   ├── services/              # Servicios externos
│   │   ├── firebase.js        # Configuración Firebase
│   │   ├── quotes.js          # Gestión de cotizaciones
│   │   ├── emailService.jsx   # Servicios de email
│   │   ├── pdfService.jsx     # Generación PDF
│   │   └── themealdb.js       # API TheMealDB
│   ├── utils/                 # Utilidades
│   │   └── format.js          # Formateadores
│   ├── styles.css             # Estilos globales
│   ├── App.jsx                # Componente raíz
│   └── main.jsx               # Entry point
├── docs/                      # Documentación
│   └── ANALYST_GUIDE.md       # Guía para analistas
├── .gitignore                 # Git ignore rules
├── index.html                 # HTML principal
├── package.json               # Dependencias
└── vite.config.js             # Configuración Vite


##  Instalación y Configuración

### Prerrequisitos

- **Node.js** (versión 18 o superior)
- **npm** o **yarn**
- **Cuenta de Firebase** para backend

### 1. Clonar el Repositorio

```bash
git clone https://github.com/tu-usuario/loncheras-react.git
cd loncheras-react
2. Instalar Dependencias
npm install
# o
yarn install
3. Configuración de Firebase
Crear un proyecto en Firebase Console
Habilitar Authentication y Firestore Database
Obtener las credenciales del proyecto
Crear archivo .env en la raíz del proyecto:
VITE_FIREBASE_API_KEY=tu_api_key
VITE_FIREBASE_AUTH_DOMAIN=tu_proyecto.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=tu_proyecto_id
VITE_FIREBASE_STORAGE_BUCKET=tu_proyecto.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef123456
4. Configuración de Firestore
En Firebase Console, crear las siguientes reglas de seguridad:

rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /quotes/{document} {
      allow read, write: if request.auth != null && 
        (request.auth.uid == resource.data.userId || 
         request.auth.token.role == 'analista');
    }
  }
}
5. Ejecutar en Desarrollo
npm run dev
# o
yarn dev
La aplicación estará disponible en http://localhost:5173

6. Build para Producción
npm run build
# o
yarn build
💼 Guía de Usuario
👥 Para Distribuidores
Registro/Inicio de Sesión

Crear cuenta nueva o iniciar sesión
Seleccionar rol "proveedor"
Navegación al Panel

Acceder a "Panel de Distribuidores"
Ver productos disponibles en el catálogo
Crear Cotización

Agregar productos desde el catálogo
Completar folio, validez y tiempo de entrega
Validar cantidades y precios
Enviar cotización
Gestionar Cotizaciones

Ver historial de cotizaciones anteriores
Revisar estado de cada cotización
Recibir notificaciones de aprobación/rechazo
📊 Para Analistas
Acceso al Panel

Iniciar sesión con rol "analista"
Acceder a "Panel del Analista"
Análisis de Cotizaciones

Ver todas las cotizaciones en tabla
Aplicar filtros avanzados:
Por rango de fechas
Por monto total
Por proveedor
Por estado
Por producto
Toma de Decisiones

Aprobar: Cotizaciones que cumplan criterios
Rechazar: Con razón obligatoria
Eliminar: Cotizaciones rechazadas
Exportación de Datos

Generar reportes CSV
Analizar estadísticas en tiempo real
Tomar decisiones basadas en datos
🎨 Navegación General
Inicio: Landing page con información de la plataforma
Distribuidores: Panel principal para proveedores
Analista: Panel avanzado para analistas
Login/Registro: Autenticación de usuarios
👨‍💻 Desarrollo
Estructura de Componentes
Los componentes siguen una arquitectura modular y reutilizable:

// Ejemplo de componente con buenas prácticas
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
Custom Hooks
useForm.js: Manejo completo de formularios

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
useLocalStorage.js: Persistencia local

const [data, setData] = useLocalStorage('mi_clave', valor_inicial);
Context Providers
AuthContext: Gestión de autenticación y perfil de usuario
ThemeContext: Cambio de tema claro/oscuro
ToastContext: Sistema de notificaciones global
Servicios
firebase.js: Configuración principal
quotes.js: CRUD completo de cotizaciones
emailService.jsx: Envío de emails
pdfService.jsx: Generación de PDFs
themealdb.js: Integración con API externa

🔧 Configuración
Variables de Entorno
Crear archivo .env con:

# Firebase Configuration
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id

# Optional: API Keys for additional services
VITE_EMAIL_SERVICE_API_KEY=your_email_api_key
Configuración de Vite
vite.config.js está preconfigurado con:

Plugin de React
Servidor de desarrollo
Build optimization
Dependencias Principales
{
  "react": "^18.2.0",
  "react-dom": "^18.2.0",
  "react-router-dom": "^6.30.1",
  "firebase": "^12.4.0",
  "jspdf": "^3.0.3",
  "jspdf-autotable": "^5.0.2"
}
📱 Características Técnicas
Estado de la Aplicación
Context API para estado global
LocalStorage para persistencia temporal
Firestore para datos en tiempo real
Custom hooks para lógica reutilizable
Performance
Lazy loading de componentes
Memoización con useMemo y useCallback
Skeleton loaders durante carga de datos
Cache local para catálogos
Responsive Design
Mobile-first approach
Flexbox y CSS Grid para layouts
Breakpoints configurados
Touch-friendly interfaces
Accesibilidad
ARIA labels en componentes interactivos
Navegación por teclado completa
Contraste de colores optimizado
Screen reader friendly
Testing
Para ejecutar tests (cuando estén implementados):

npm test
# o
yarn test
🐛 Solución de Problemas
Errores Comunes
1. Error de Firebase Connection

Solución: Verificar credenciales en .env y reglas de Firestore
2. Problemas de Autenticación

Solución: Verificar configuración de Firebase Auth
3. Catálogo no carga

Solución: Verificar conexión con TheMealDB API
4. Error en build de producción

Solución: Limpiar cache: npm run build -- --force
Logs de Debug
Para activar logs de desarrollo:

// En services/quotes.js
const DEBUG = true;

if (DEBUG) {
  console.log('Debug info:', data);
}
Performance Issues
Verificar network tab en DevTools
Comprobar Firebase quotas
Revisar Firestore usage
🤝 Contribución
Guidelines
Fork el repositorio
Crear branch feature: git checkout -b feature/nueva-caracteristica
Commit cambios: git commit -m 'Agregar nueva característica'
Push al branch: git push origin feature/nueva-caracteristica
Crear Pull Request
Estándares de Código
Usar ESLint para linting
Seguir convención de nombres del proyecto
Documentar funciones complejas
Componentes funcionales con hooks
PropTypes o TypeScript para props
Commits
Usar Conventional Commits:

feat: agregar nuevo componente
fix: corregir bug en formulario
docs: actualizar documentación
style: cambios de formato
refactor: refactorizar código
test: agregar tests
chore: tareas de mantenimiento
📄 Licencia
Este proyecto está bajo la Licencia MIT. Ver LICENSE para más detalles.

👥 Equipo
Desarrollador Principal: Tu Nombre
UI/UX Designer: Nombre del Diseñador
Project Manager: Nombre del PM
📞 Contacto
Email: tu-email@ejemplo.com
LinkedIn: Tu Perfil
Portfolio: Tu Portfolio
🏆 Características Destacadas
✅ Arquitectura escalable con React 18

✅ Autenticación segura con Firebase

✅ Base de datos en tiempo real con Firestore

✅ Interfaz moderna y responsive

✅ Sistema de roles robusto

✅ Filtros avanzados para análisis

✅ Exportación de datos en múltiples formatos

✅ Generación automática de PDFs

✅ Integración con APIs externas

✅ Gestión de errores completa

Desarrollado con ❤️ usando React, Firebase y Vite
