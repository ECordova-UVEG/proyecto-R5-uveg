# DEV JOURNAL - Investment Platform

## Resumen de Decisiones Técnicas

- **Angular 17 & Standalone Components:** Se optó por Angular 17 debido a la compatibilidad con la versión de Node.js del entorno. La arquitectura se basa en componentes standalone para simplificar la estructura de módulos y las importaciones.
- **TailwindCSS:** Se eligió TailwindCSS para el estilizado de la UI, permitiendo un desarrollo rápido y un diseño consistente a través de clases de utilidad.
- **State Management con Signals:** Para el manejo del estado de autenticación, se utilizaron Angular Signals en `AuthService`. Esta es una aproximación moderna y reactiva que simplifica la gestión del estado en comparación con otras técnicas.
- **RxJS para Flujo de Datos:** Se utilizó RxJS en `DataService` para manejar el flujo de datos asíncrono desde el archivo mock, incluyendo un retraso simulado y la transformación de datos.
- **ApexCharts para Visualización:** Se integró `ng-apexcharts` para la creación de gráficos, en este caso, un Pie Chart para visualizar la distribución del portafolio.

## Estructura del Proyecto

El proyecto sigue una estructura organizada por responsabilidades:

- **`src/app/core/`**: Contiene la lógica central y los servicios transversales a toda la aplicación.
  - `guards/`: Guardianes de rutas como `AuthGuard`.
  - `services/`: Servicios singleton como `AuthService` y `DataService`.
- **`src/app/shared/`**: Módulos, componentes y pipes reutilizables en toda la aplicación.
  - `components/`: Componentes como `KpiCardComponent` y `DataTableComponent`.
  - `pipes/`: Pipes como `CurrencyFormatPipe`.
- **`src/app/features/`**: Contiene los componentes principales de la aplicación, agrupados por funcionalidad.
  - `login/`: Componente de inicio de sesión.
  - `dashboard/`: Componente del dashboard principal.
  - `listado/`: Componente para listar los activos.

## Prompts Más Efectivos

1.  **Prompt de Inicialización del Proyecto:** "Inicializa un nuevo proyecto Angular 18 llamado 'invest-core'. 1. Configura TailwindCSS. 2. Genera la estructura de carpetas exacta: core (guards, services), shared (components, pipes), features (login, dashboard, listado). 3. Instala 'ng-apexcharts' para los gráficos. 4. Crea el archivo 'src/assets/data/mock-data.json' con datos simulados de inversiones..."
    - *Efectividad:* Este prompt fue muy efectivo porque estableció las bases completas del proyecto en una sola instrucción, incluyendo la estructura, dependencias y datos de prueba.

2.  **Prompt de Implementación del Dashboard:** "Implementa el componente 'Dashboard' (Standalone): 1. Crea 3 tarjetas de KPIs en la parte superior: 'Valor Total del Portafolio', 'Ganancia/Pérdida Diaria', 'Total Activos'. Usa componentes reutilizables de 'shared/components/kpi-card'. 2. Implementa un gráfico de ApexCharts que muestre la distribución del portafolio (Pie Chart) por 'Tipo de Activo'. 3. Asegúrate de que el diseño sea responsivo usando Tailwind."
    - *Efectividad:* Este prompt fue claro y conciso, dividiendo la tarea en subtareas lógicas y especificando el uso de componentes reutilizables, lo que resultó en un desarrollo más eficiente.

3.  **Prompt de Generación de Tests:** "Genera los archivos .spec.ts para 'AuthService' y 'DashboardComponent'. 1. Para el Servicio: Testea que el login exitoso actualice el Signal de estado y guarde en localStorage. 2. Para el Componente: Testea que los KPIs se rendericen correctamente con los datos del mock y que el gráfico se inicialice. 3. Asegura que la configuración de TestBed incluya los módulos necesarios. Ejecuta los tests y corrígelos si fallan hasta alcanzar cobertura >85%."
    - *Efectividad:* Este prompt fue muy específico en cuanto a los requerimientos de los tests y el objetivo de cobertura, lo que guió el proceso de TDD de manera efectiva.

## Instrucciones del Proyecto

### Levantar el Proyecto

1.  **Navegar a la carpeta del proyecto:**
    ```bash
    cd invest-core
    ```

2.  **Instalar dependencias:**
    ```bash
    npm install
    ```

3.  **Ejecutar la aplicación:**
    ```bash
    ng serve
    ```
    La aplicación estará disponible en `http://localhost:4200/`.

### Ejecutar los Tests

Para ejecutar los tests unitarios y obtener un reporte de cobertura, utiliza el siguiente comando:

```bash
ng test --watch=false --code-coverage
```
