Loncheras — Sistema Web de Distribuidores
Aplicación web para administrar distribuidores y cotizaciones de loncheras nutritivas, digitalizando procesos de registro, cálculo de precios y análisis con métricas, usando React, Node.js/Express, Firebase y la integración de la API TheMealDB.

Objetivo del proyecto
Automatizar y digitalizar el proceso de registro y cotización para distribuidores de loncheras saludables, reduciendo errores manuales, mejorando tiempos de respuesta y habilitando analítica para la toma de decisiones.

Objetivos específicos
Implementar formularios de registro y validación eficientes para distribuidores.

Agilizar el cálculo de precios, subtotales y totales en cotizaciones.

Incorporar paneles y métricas clave para decisiones basadas en datos.

Integrar APIs externas (TheMealDB) y base de datos en tiempo real (Firebase).

Diseñar una arquitectura escalable preparada para funcionalidades premium.

Alcance funcional
Registro e inicio de sesión con asignación de rol: distribuidor o analista.

Creación, envío y persistencia de cotizaciones con validaciones y cálculo automático.

Catálogo de productos desde TheMealDB (categoría Dessert) con timeout y fallback.

Panel de distribuidor para gestionar nuevas cotizaciones e historial.

Portal de analista con filtros avanzados, métricas y exportación de datos.

Arquitectura y tecnologías
Frontend
React como SPA con componentes en JSX.

Manejo de estado con useState/useEffect y contexto de autenticación (AuthContext).

Consumo de servicios en src/services (API externa y Firebase).

Servicios/Integración
Utilidades de fetch con AbortController, timeout y reintentos para TheMealDB.

Construcción de payload de cotización y confirmación de operación.

Datos y autenticación
Firebase: Firestore para cotizaciones y Auth para sesión/perfil con rol.

Rutas protegidas y redirección post login según rol.

Principios de desarrollo
Enfoque ágil con historias de usuario, sprints y seguimiento en GitHub hacia un MVP.

Funcionalidades
Registro y autenticación
Registro con selección de rol y almacenamiento de perfil.

Login con validación de credenciales y acceso a rutas protegidas.

Panel de distribuidor
Catálogo desde TheMealDB; selección de productos, cantidades y precio unitario.

Cálculo automático de subtotal y total.

Creación de cotizaciones con folio, validez y entrega; validaciones y envío con confirmación.

Historial de cotizaciones: identificador, productos, cantidades y total.

Portal de analista
Filtros por folio, proveedor, fechas, valores, productos, validez y entrega.

Métricas agregadas: total sumado, promedio, mayor y menor valor.

Exportación de datos (p. ej., CSV).

API externa: TheMealDB
Carga por GET de la categoría Dessert, limitando resultados.

Control de timeout/reintentos y fallback local de ítems para mantener la UX.

Persistencia: Firebase
Inicialización con variables de entorno (Vite).

Firestore para almacenar cotizaciones como documentos únicos.

Persistencia e indexación offline con IndexedDB.

Estructura sugerida del proyecto
src/context/AuthContext.jsx: sesión, perfil y rol con onAuthStateChanged y lecturas a Firestore.

src/services/firebase.js: inicialización de Firebase (Firestore y Auth) con persistencia.

src/services/themealdb.js: utilidades para consumir TheMealDB con timeout/reintentos y fallback.

Vistas: Registro, Login, Panel Distribuidor, Portal Analista, con rutas por rol.

Historias de usuario principales
LON-03: Creación de cotizaciones.

LON-04: Agregación de productos al catálogo.

LON-05: Cálculo de totales.

LON-06: Envío de cotizaciones.

LON-08: Listado y consulta de cotizaciones previas.

Variables de entorno
Crea un archivo .env.local con:

VITE_FIREBASE_API_KEY=...

VITE_FIREBASE_AUTH_DOMAIN=...

VITE_FIREBASE_PROJECT_ID=...

VITE_FIREBASE_STORAGE_BUCKET=...

VITE_FIREBASE_MESSAGING_SENDER_ID=...

VITE_FIREBASE_APP_ID=...

Requisitos
Node.js y npm.

Proyecto de Firebase configurado y credenciales en variables de entorno.

Puesta en marcha
Clona el repositorio y entra en la carpeta del proyecto.

Instala dependencias: npm install.

Crea .env.local con las credenciales de Firebase.

Ejecuta el entorno de desarrollo: npm run dev (Vite) o el script del proyecto.

Accede a la SPA y prueba los flujos de registro, login y creación de cotizaciones.

Uso básico
Regístrate seleccionando rol (distribuidor o analista) y completa datos de perfil.

Inicia sesión para acceder a vistas protegidas.

Distribuidor: selecciona productos, define cantidades y precio unitario; completa folio/validez/entrega y envía la cotización.

Analista: aplica filtros, revisa métricas, exporta datos y consulta detalles.

Decisiones de diseño
SPA para navegación fluida sin recargas.

React + Context para estados globales de autenticación y perfil.

Firebase para base de datos en tiempo real y autenticación gestionada.

TheMealDB para catálogo dinámico con fallback local.

Seguridad y roles
Rutas protegidas por rol; analista accede al portal de análisis y distribuidor al panel de creación.

Cotizaciones aprobadas no son editables; mensajes de permisos en la interfaz.

Métricas y filtros
Métricas agregadas: total, promedio, mayor y menor valor.

Filtros por texto, proveedor, fechas, valores, validez y entrega.

Roadmap sugerido
Reportes avanzados, flujo de aprobación y notificaciones.

Ampliar categorías/productos de TheMealDB y precios dinámicos por proveedor.

Roles adicionales y auditoría de cambios.

Créditos
Desarrollado por: Andrés Felipe Sanguino Cubillos, Juan David López Rodríguez y Santiago Valdiri García.
Asignatura: Ingeniería Web — Universidad Católica de Colombia.