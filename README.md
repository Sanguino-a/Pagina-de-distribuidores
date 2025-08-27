Loncheras Portal de Cotizaciones 

Este proyecto es una demostración funcional sin backend de un portal para distribuidores y analistas de loncheras nutritivas. Incluye navegación entre diferentes secciones, simulación de cotizaciones y visualización de datos de ejemplo.

Características
Navegación completa: 5 páginas HTML interconectadas (Inicio, Distribuidores, Analista, Login, Registro)

Catálogo de productos: Consume una API pública (TheMealDB) para mostrar productos de ejemplo

Simulador de cotizaciones: Permite crear y calcular cotizaciones localmente

Panel de analista: Visualiza y filtra cotizaciones de ejemplo

Diseño responsive: Adaptable a diferentes dispositivos

Modo claro/oscuro: Compatible con las preferencias del sistema

Tecnologías utilizadas
HTML5 semántico

CSS3 con variables personalizadas y grid/flexbox

JavaScript vanilla (sin frameworks)

API pública TheMealDB para datos de ejemplo

Funcionalidades principales
Para distribuidores:
Visualización de catálogo de productos desde API

Creación de cotizaciones con múltiples productos

Cálculo automático de subtotales y totales

Simulación de envío de cotizaciones

Para analistas:
Visualización de cotizaciones de ejemplo

Filtrado por número de folio

Estadísticas de resumen (cantidad, suma total)

Demo de recarga con datos aleatorios

Instalación y uso
Clona o descarga los archivos del proyecto

Abre cualquiera de los archivos HTML en un navegador web moderno

Navega entre las diferentes secciones usando el menú superior

Nota importante:
Este es un proyecto de demostración sin backend. Los datos se generan y almacenan localmente en el navegador. No se requiere instalación de servidores ni bases de datos.

Navegación entre roles
Inicio de sesión: Selecciona "Proveedor" para ir a Distribuidores o "Analista" para ir al panel de analista

Registro: Similar al login, redirige según el rol seleccionado

Personalización
Puedes modificar los estilos editando el archivo styles.css. Las variables CSS en la sección :root permiten ajustar fácilmente colores, espaciados y otros aspectos visuales.

Licencia
Este proyecto es de demostración y puede utilizarse libremente para fines educativos.

Limitaciones
No persiste datos entre sesiones (localStorage no implementado)

No incluye validación de formularios completa

No tiene autenticación real de usuarios

Las cotizaciones son simulaciones locales

