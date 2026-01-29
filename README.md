# InvestCore - Dashboard Financiero Enterprise

![CI/CD Status](https://github.com/EinarCR/InvestCore/actions/workflows/ci.yml/badge.svg)
![Angular Version](https://img.shields.io/badge/Angular-18.0.0-red)
![Coverage](https://img.shields.io/badge/Coverage-100%25-brightgreen)

InvestCore es una plataforma de gestión de inversiones de alto rendimiento desarrollada con **Angular 18**. Destaca por su arquitectura *Standalone*, compilación instantánea con **Esbuild**, y un pipeline de CI/CD automatizado.

## 🚀 Tecnologías y Arquitectura

* **Core:** Angular 18 (Signals, Control Flow Syntax `@if`, `@for`).
* **Build:** Esbuild (Vite-based dev server).
* **Estilos:** TailwindCSS v3 (Utility-first, Dark Mode nativo).
* **Gráficos:** Ng-ApexCharts (Renderizado reactivo).
* **Testing:** Jasmine + Karma (ChromeHeadless).
* **CI/CD:** GitHub Actions + Vercel (Despliegue continuo).

## 🛡️ Estrategia de Resiliencia de Datos

La aplicación implementa un patrón de **"Fail-Safe Market Data"**:
1.  **Concurrencia Inteligente:** Usa `forkJoin` para solicitar precios de acciones en paralelo, respetando los límites de velocidad de la API gratuita.
2.  **Fallback Transparente:** Un interceptor HTTP detecta fallos (403/429/500) en la API externa (`financialmodelingprep`) y conmuta automáticamente a datos simulados locales sin interrumpir la experiencia del usuario.
3.  **Simulación de Latencia:** Los entornos de desarrollo simulan retardo de red para probar los esqueletos de carga (`SkeletonComponent`).

## 📂 Estructura del Proyecto

* `src/app/core/`: Servicios Singleton (`Auth`, `MarketData`) y Configuración Global (`app.config.ts`).
* `src/app/features/`: Módulos de negocio Lazy Loaded (`Dashboard`, `Listado`, `Login`).
* `src/app/shared/`: Componentes puros de presentación (`KpiCard`, `DataTable`, `TransactionModal`).
* `.github/workflows/`: Configuración del pipeline de Integración Continua.

## ⚡ Guía de Inicio Rápido

### Requisitos Previos
* Node.js v20.x o superior.

### Instalación

1.  **Clonar el repositorio:**
    ```bash
    git clone [https://github.com/EinarCR/InvestCore.git](https://github.com/EinarCR/InvestCore.git)
    cd InvestCore
    ```

2.  **Instalar dependencias (Modo Legacy Peer Deps):**
    *Nota: Necesario por compatibilidad con ApexCharts.*
    ```bash
    npm install --legacy-peer-deps
    ```

3.  **Iniciar Servidor de Desarrollo:**
    ```bash
    ng serve
    ```
    Visita `http://localhost:4200/`.

## ✅ Testing y Calidad

El proyecto cuenta con una suite de pruebas robusta que cubre casos de éxito, errores y límites.

* **Ejecutar Tests Unitarios:**
    ```bash
    ng test --code-coverage --browsers=ChromeHeadless
    ```
    *Cobertura actual: Statements 98%+, Branches 95%+.*

* **Linting y Build de Producción:**
    ```bash
    ng build --configuration production
    ```

## 🌍 Despliegue

El proyecto está configurado para despliegue automático en Vercel.
* **URL de Producción:** [https://invest-core.vercel.app/](https://invest-core.vercel.app/) (Ejemplo)
* Cada push a la rama `main` dispara el pipeline de CI (Tests) y, si es exitoso, el CD (Deploy).