# DEV JOURNAL - InvestCore

## Resumen de Decisiones Técnicas

- **Angular 18 & Standalone Architecture:** Se migró el proyecto a Angular 18 para aprovechar el nuevo sistema de compilación (**Esbuild**) y la detección de cambios optimizada (`eventCoalescing`). La arquitectura es 100% *Standalone Components*, eliminando la necesidad de `NgModules` y reduciendo el *boilerplate*.
- **TailwindCSS:** Se eligió para el estilizado utilitario, permitiendo un diseño responsivo y oscuro (Dark Mode) nativo sin hojas de estilo complejas.
- **State Management Reactivo:** Se implementaron **Angular Signals** en componentes clave (`Dashboard`, `Listado`) para gestionar el estado de carga (`isLoading`) y datos de UI de manera granular, mejorando el rendimiento frente a `ChangeDetectorRef` manual.
- **RxJS Avanzado:** Se implementó `forkJoin` y manejo de errores con `catchError` en `MarketDataService` para orquestar peticiones HTTP paralelas y evadir limitaciones de la API gratuita.
- **Calidad y Testing:** Se alcanzó una cobertura de código del **100%** en componentes críticos (`TransactionModal`, `DataTable`) utilizando mocks robustos y estrategias de inyección de dependencias modernas (`provideHttpClientTesting`).

## Estructura del Proyecto

El proyecto sigue una arquitectura fractal y modular:

- **`src/app/core/`**: Lógica de negocio pura y singletons.
  - `services/`: `MarketDataService` (fachada de API), `DataService` (estado global).
  - `interceptors/`: `ErrorInterceptor` global para manejo de fallos HTTP.
- **`src/app/shared/`**: UI Kit reutilizable.
  - `components/`: `TransactionModal` (con validación reactiva), `KpiCard`, `SkeletonLoader`.
  - `pipes/`: `CurrencyFormatPipe` (wrapper robusto sobre `CurrencyPipe`).
- **`src/app/features/`**: Vistas principales (Lazy Loaded).
  - `dashboard/`: Orquestador de widgets y gráficos.
  - `listado/`: Tabla inteligente con filtros, paginación y búsqueda.

## Prompts Más Efectivos (Cell CLI)

1.  **Prompt de Arquitectura "Future-Proof":**
    > *"Actualiza el proyecto a los estándares de Angular 18+. Configura 'app.config.ts' para usar 'provideZoneChangeDetection({ eventCoalescing: true })' y cambia el builder a '@angular-devkit/build-angular:application' (Esbuild). Asegura que todos los componentes sean Standalone."*
    - *Impacto:* Redujo el tiempo de compilación (build) de 15s a <2s y modernizó el core del framework.

2.  **Prompt de "Blindaje" de Tests (Nuclear):**
    > *"Repara TODOS los tests unitarios. Regla estricta: Si un componente usa un Pipe custom, inyecta el Pipe base en los providers. Si usa HttpClient, usa 'provideHttpClientTesting()'. Elimina cualquier variable en los specs que no exista en el componente real. Objetivo: 100% cobertura en ramas lógicas."*
    - *Impacto:* Pasamos de tests rotos por `NullInjectorError` a una suite verde con 100% de cobertura en lógica de negocio crítica.

3.  **Prompt de CI/CD Automation:**
    > *"Crea un workflow de GitHub Actions para Angular 18. Usa Node 20.x, instala dependencias con '--legacy-peer-deps' (para compatibilidad con ApexCharts) y ejecuta tests en ChromeHeadless. Si pasa, compila para producción."*
    - *Impacto:* Automatizó la validación de calidad. Ahora ningún código roto llega a la rama `main`.

## Desafíos y Soluciones

* **Dependency Hell (ApexCharts vs Angular 18):** La librería gráfica tenía conflictos de `peerDependencies`.
    * *Solución:* Se configuró el CI/CD y Vercel para usar `npm ci --legacy-peer-deps`, permitiendo la instalación segura sin degradar Angular.
* **Testing de Temporizadores:** Los componentes con `setTimeout` (para UX de carga) fallaban en los tests.
    * *Solución:* Se implementó `fakeAsync`, `tick()` y `discardPeriodicTasks()` en Jasmine para controlar el tiempo virtualmente.

## Comparación de Tiempo (Estimada)

* **Desarrollo Tradicional:** Configurar RxJS complejo, CI/CD, Esbuild y tests al 100% habría tomado **~25-30 horas**.
* **Desarrollo Asistido (Cell CLI):** Se logró en **~4-6 horas** de iteración intensiva.
* **Aceleración:** ~5x.