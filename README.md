# InvestCore - Dashboard Financiero

Este proyecto es un dashboard financiero interactivo desarrollado con Angular 17, diseñado para simular la gestión de un portafolio de inversión. Utiliza tecnologías modernas para ofrecer una experiencia de usuario fluida y visualmente atractiva, incluyendo la integración de gráficos y la gestión de datos de mercado.

## Tecnologías Clave:
*   **Angular 17:** Framework frontend para la construcción de Single Page Applications.
*   **Tailwind CSS:** Framework CSS utilitario para un diseño rápido y responsivo.
*   **ApexCharts:** Librería de gráficos interactivos para la visualización de datos financieros.
*   **Financial Modeling Prep API:** Fuente de datos de mercado en tiempo real (requiere API Key).

## Seguridad y Arquitectura

### Carga de Datos y Autenticación:
La aplicación implementa una arquitectura que prioriza la seguridad y la resiliencia:
1.  **Acceso a la API Key:** La API Key de `financialmodelingprep.com` (o cualquier otra API externa) **solo se utiliza después de que el usuario ha iniciado sesión correctamente**.
2.  **Manejo de Errores con "Fallback":** Si la API externa para obtener datos de mercado falla o excede los límites del plan gratuito, el sistema **degrada suavemente a un modo de simulación de datos**. Esto asegura que la aplicación siga siendo funcional y no bloquee al usuario, proporcionando una experiencia continua incluso sin conexión a la API en tiempo real.
3.  **Protección de Rutas:** El acceso a las rutas principales de la aplicación (Dashboard, Listado, Configuración) está protegido mediante un `AuthGuard`, asegurando que solo los usuarios autenticados puedan acceder a ellas.

## Estructura de Carpetas

La aplicación sigue una estructura modular para facilitar la escalabilidad y el mantenimiento:

*   `core/`: Contiene servicios singleton (ej. `AuthService`, `DataService`, `MarketDataService`), guards para proteger rutas (`auth.guard.ts`), y interceptores HTTP (`http-error.interceptor.ts`). Estos módulos son esenciales para la lógica central de la aplicación.
*   `features/`: Aloja los componentes principales que representan las diferentes vistas o "páginas" de la aplicación (ej. `dashboard`, `listado`, `login`, `settings`).
*   `shared/`: Incluye componentes reutilizables (ej. `KpiCardComponent`, `TransactionModalComponent`, `SkeletonComponent`), pipes personalizados (`CurrencyFormatPipe`) y otros elementos que pueden ser compartidos entre múltiples módulos de `features`.

## Guía de Instalación

Sigue estos pasos para levantar el proyecto localmente:

1.  **Clonar el repositorio:**
    ```bash
    git clone https://github.com/EinarCR/InvestCore.git
    cd /invest-core
    ```
2.  **Instalar dependencias:**
    ```bash
    npm install
    ```
3.  **Configurar la API Key:**
    *   Regístrate en [financialmodelingprep.com](https://financialmodelingprep.com/) para obtener tu API Key.
    *   Edita el archivo `src/app/core/services/market-data.service.ts` y reemplaza `'Fusw8WYYOB2oUVNdVeaPe9H0LS2MwCKz'` con tu clave real.

4.  **Iniciar el servidor de desarrollo:**
    ```bash
    ng serve
    ```
    La aplicación estará disponible en `http://localhost:4200/`.

## Comandos Útiles

*   **Ejecutar Tests Unitarios con Cobertura:**
    ```bash
    ng test --code-coverage
    ```
*   **Compilar la aplicación para producción:**
    ```bash
    ng build
    ```
