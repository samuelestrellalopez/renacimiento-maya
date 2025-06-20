# Proyecto RenacimientoMaya

## Introducción

RenacimientoMaya es una SPA (Single Page Application) desarrollada para ofrecer a los usuarios la posibilidad de explorar zonas turísticas en Yucatán, con funcionalidades tanto para usuarios comunes como para administradores. La aplicación maneja autenticación, filtros dinámicos, paginación, gestión de favoritos y administración de contenido mediante formularios y modales.

---

## Tecnologías y Herramientas Utilizadas

- **Vue 3** con Composition API: para crear componentes altamente reactivos y modulares.
- **Vite**: entorno de desarrollo rápido con hot reload y build optimizado.
- **SCSS**: uso de preprocesador CSS para organizar estilos con variables y anidamientos.
- **Axios**: cliente HTTP configurado para comunicación segura con backend.
- **Prettier**: herramienta automática para mantener código limpio y consistente.
- **Vue Router**: navegación declarativa y controlada de rutas, con soporte para rutas protegidas.
- **LocalStorage**: para persistir tokens JWT y datos de sesión.

---

```bash


## Estructura del Proyecto

src/
├── assets/ # Imágenes, iconos y fuentes
├── components/ # Componentes reutilizables de UI
│ ├── Drawer.vue # Menú lateral
│ ├── Header.vue # Barra superior con navegación
│ └── Footer.vue # Pie de página con derechos reservados
├── router/ # Rutas y configuración de navegación
│ └── index.js
├── services/ # Comunicación HTTP centralizada
│ └── api.js
├── styles/ # SCSS global y variables
│ ├── _variables.scss
│ ├── _typography.scss
│ └── main.scss
├── views/ # Vistas principales según ruta
│ ├── AdminCreateZone.vue
│ ├── DetailEvents.vue
│ ├── Events.vue
│ ├── Home.vue
│ ├── Login.vue
│ ├── Register.vue
│ ├── ResetPassword.vue
│ └── SavedAreas.vue
├── App.vue # Componente raíz que integra todo
└── main.js # Punto de entrada

```
---

## Explicación Detallada del Código y Arquitectura

### 1. Componente raíz - `App.vue`

- Contiene la estructura principal: `Header`, `router-view` (donde se cargan las vistas según ruta) y `Footer`.
- No contiene lógica compleja para mantenerlo simple y enfocado en layout.
- Facilita que el pie siempre esté visible y el contenido se ajuste dinámicamente.

---

### 2. Enrutamiento (`router/index.js`)

- Define rutas estáticas y dinámicas.
- Usa guardias de navegación para validar acceso (por ejemplo, restringir rutas solo para administradores o usuarios autenticados).
- Permite URLs amigables y navegación sin recarga completa.

---

### 3. Servicios HTTP - `services/api.js`

- Crea una instancia Axios con configuración base, apuntando a la API backend.
- Intercepta todas las peticiones para agregar el token JWT desde `localStorage`.
- Esto asegura que las peticiones protegidas sean autorizadas sin necesidad de repetir lógica en cada componente.
- Centraliza la configuración HTTP, facilitando modificaciones futuras (como cambio de URL base, headers, etc.).

---

### 4. Manejo del Estado Reactivo

- Se usa `ref` y `computed` para controlar datos reactivos como:
  - Listas de zonas turísticas.
  - Filtros de búsqueda y municipio.
  - Paginación (página actual, total de páginas).
  - Estado de modales (edición, eliminación).
  - Estados de autenticación (`isAuthenticated`, `userRole`, `userId`).
  - Lista de favoritos, sincronizada con el backend.

- El uso de `watch` permite recargar datos automáticamente al cambiar filtros o páginas, asegurando sincronización UI/API sin recargar toda la app.

---

### 5. Gestión de Zonas Turísticas

- Las zonas se cargan con paginación desde la API usando parámetros `page` y `limit`.
- Los filtros de búsqueda y municipio son enviados como parámetros opcionales.
- El listado se actualiza dinámicamente cuando el usuario cambia filtros o páginas.
- La paginación está basada en el total de páginas proporcionado por la API, evitando cargar datos innecesarios.

---

### 6. Funcionalidad de Favoritos

- Los usuarios autenticados pueden marcar zonas como favoritas.
- Al abrir la vista, si el usuario está autenticado, se cargan sus favoritos desde el backend.
- El botón favorito cambia de estado y envía la acción correspondiente (añadir o eliminar favorito) mediante peticiones POST o DELETE.
- El estado de favoritos se mantiene reactivo para actualizar el icono y accesibilidad.

---

### 7. Modales para Edición y Eliminación

- La edición se maneja con un modal que permite cambiar nombre, municipio, descripción e imagen.
- Se usa un formulario con validaciones básicas (campos requeridos).
- La imagen se puede cambiar mediante input file y se envía con `FormData` para soportar multipart.
- El modal de eliminación pide confirmación antes de borrar una zona.
- Se implementan manejadores para evitar propagación de eventos y controlar el foco, mejorando accesibilidad.

---

### 8. Manejo de Autenticación

- El estado de sesión se mantiene con tokens JWT en `localStorage`.
- Se actualiza dinámicamente la UI y el acceso a funcionalidades (favoritos, edición) según rol y autenticación.
- Eventos personalizados (`login-update`) permiten sincronizar cambios de sesión entre componentes sin recargar.

---

### 9. Accesibilidad y Usabilidad

- Se usan roles ARIA, `tabindex` y manejo de eventos `keyup.enter` para permitir navegación por teclado.
- Las imágenes tienen atributos `alt` descriptivos.
- Botones y enlaces tienen labels accesibles para lectores de pantalla.
- Los modales son accesibles con roles y focos gestionados.

---

### 10. Estilos con SCSS

- Variables globales para colores, tipografía, espaciados, sombras.
- Tipografía definida para mantener consistencia en títulos, párrafos y botones.
- Uso de estilos `scoped` para evitar conflictos CSS.
- Diseño responsivo, pensado para escritorio y móvil.
- Clases organizadas para facilitar reutilización y mantenimiento.

---

## Comandos y Configuración

```bash
# Instalar dependencias
npm install

# Levantar servidor en modo desarrollo con hot reload
npm run dev

# Generar build optimizado para producción
npm run build

# Formatear código usando Prettier
npm run format

```
---

### 11.Detalles Técnicos y Buenas Prácticas en el Código

El proyecto RenacimientoMaya está pensado para ser robusto, modular y escalable. Aprovecha las mejores prácticas de Vue 3 y herramientas modernas para ofrecer una experiencia ágil, segura y accesible tanto para usuarios finales como para administradores.

Su arquitectura clara y mantenible facilita la incorporación de nuevas funcionalidades, y el enfoque en la experiencia de usuario (UX) garantiza que la aplicación sea fácil de usar y accesible para un público amplio.

---


### Manejo de Estado Reactivo con Vue Composition API

- Uso extensivo de `ref` para datos mutables (ejemplo: listas, estados de modales, inputs).
- Uso de `computed` para valores derivados que dependen reactivos, como listas filtradas o paginadas.
- `watch` para reaccionar a cambios en filtros y actualizar datos automáticamente.
- Esto mejora la performance evitando recargas innecesarias y mantiene la UI sincronizada con los datos.

---

### Comunicación con Backend y Seguridad

- Axios configurado con interceptor para incluir token JWT automáticamente en headers.
- Validación de roles (admin, user) en la UI para mostrar u ocultar funcionalidades sensibles.
- En el backend (aunque no documentado aquí), se espera que las rutas verifiquen token y permisos.
- Manejo de errores con `try/catch` para evitar que la app se bloquee y permitir mostrar mensajes (puede mejorarse con manejo de notificaciones).

---

### Arquitectura de Componentes

- Componentes pequeños, reutilizables y con responsabilidades claras (por ejemplo, Drawer solo se ocupa de menú lateral).
- El componente principal `App.vue` es limpio, solo contiene layout.
- Las vistas controlan la lógica de negocio y orquestan componentes e interacciones con la API.
- Uso de `@click.stop` y eventos específicos para evitar propagación indebida y mejorar UX.

---

### Accesibilidad y Usabilidad

- Consideraciones para navegación por teclado con `tabindex`, roles ARIA y eventos `keyup.enter`.
- Uso de etiquetas semánticas y descripciones `alt` en imágenes para lectores de pantalla.
- Botones con `aria-label` dinámicos para indicar estado (ejemplo: favorito activado/desactivado).
- Modal con `aria-modal` y roles `dialog` o `alertdialog` para mejorar soporte en tecnologías asistivas.

---

### Optimización y Rendimiento

- Paginación en backend para reducir carga de datos y mejorar tiempos de respuesta.
- Filtros y búsqueda implementados con debounce (se puede agregar) para evitar peticiones excesivas.
- Uso de imágenes optimizadas y lazy loading en componentes (puede implementarse para mejorar).
- Estilos `scoped` para evitar carga global innecesaria y minimizar repaint en el DOM.

---

### Organización de Carpetas y Archivos

- `assets/` para recursos estáticos, separados de lógica y vistas.
- `components/` para UI reusable que no depende de ruta.
- `views/` para componentes ligados a rutas concretas.
- `services/` para lógica de conexión con APIs externas, centralizando cambios.
- `styles/` para mantener variables, tipografías y estilos base en un solo lugar, facilitando temas o cambios globales.
- Separar lógica (JavaScript) y presentación (SCSS + template) mejora mantenibilidad y escalabilidad.

---

### Configuración Adicional y Herramientas

- Prettier integrado para formateo automático, manteniendo código uniforme y legible.
- Vite permite desarrollo rápido con hot module replacement (HMR) y construcción optimizada.
- Se recomienda configurar ESLint para mantener calidad de código y detectar errores comunes.
- Se usan variables de entorno (en `.env`) para URLs, tokens u otros datos sensibles, evitando hardcodear en el código.

---

### Recomendaciones para Futuras Mejoras

- Implementar manejo global de errores y feedback visual para usuarios (toasts, mensajes de error).
- Agregar estados de carga para mejorar UX durante peticiones asíncronas.
- Implementar lazy loading de componentes y rutas para optimizar carga inicial.
- Mejorar seguridad con refresco de token y manejo avanzado de sesiones.
- Añadir pruebas unitarias y de integración para garantizar estabilidad.

---





