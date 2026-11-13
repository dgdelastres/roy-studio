# Línea Base de Pruebas y Certificación de Calidad (QA Baseline)

Este documento certifica el estado de verificación funcional de **ROY Studio** para evitar pruebas redundantes o re-inspecciones innecesarias en futuras conversaciones.

> **Regla de Re-verificación**: Los agentes y desarrolladores **NO deben volver a inspeccionar ni re-probar** los módulos aquí certificados como `APROBADO`, salvo que un cambio en el código fuente toque directamente los archivos de dicho módulo (política de impacto por *diff*) o que el usuario lo solicite expresamente.

---

## 1. Estado de Certificación (Versión Base: v1.0.0)

| Módulo / Componente | Alcance Verificado | Estado | Archivos Asociados |
| :--- | :--- | :---: | :--- |
| **Motor Matemático (ROY Engine)** | Algoritmo MPM, cálculo de $ES, EF, LS, LF, HT, HL$, detección preventiva de ciclos (`wouldCreateCycle`) y aristas críticas. | ✅ **APROBADO** (16/16 tests unitarios en `vitest`) | `src/core/roy-engine/*` |
| **Tipado y Compilación** | Verificación estricta de tipos TypeScript (`tsc --noEmit`) y bundling de Vite. | ✅ **APROBADO** (0 errores de tipos) | `tsconfig.json`, `src/**/*` |
| **Empaquetado Desktop (Windows)** | Generación de ejecutable portable `.exe` y distribución mediante Electron Builder. | ✅ **APROBADO** (Binario generado ~85 MB) | `electron/*`, `package.json` |
| **Lienzo Gráfico (Red ROY)** | Renderizado con React Flow, arrastre (pan), zoom, minimapa, modos de nodo (8 campos vs compacto), colores por departamento y aristas ortogonales. | ✅ **APROBADO** (Probado en navegador) | `src/components/roy-canvas/*` |
| **Algoritmo de Auto-Organización** | Distribución jerárquica con Dagre en orientaciones Horizontal y Vertical sin solapamientos. | ✅ **APROBADO** (Probado en navegador) | `src/components/roy-canvas/layout.ts` |
| **Gestión y Creación de Tareas** | Modal de alta (`+ Nueva Tarea`), validación de duraciones, departamentos y recálculo reactivo en tiempo real del camino crítico. | ✅ **APROBADO** (Probado con T27) | `src/components/task-table/*`, `src/App.tsx` |
| **Diagrama de GANTT** | Visualización temporal mensual (1 a 24 meses) y filtro dinámico "Solo Camino Crítico" (reducción exacta de 27 a 11 tareas críticas). | ✅ **APROBADO** (Probado en navegador) | `src/components/gantt/*` |
| **Sistema de Temas** | Conmutación fluida entre Modo Claro y Modo Oscuro con contraste accesible WCAG AA. | ✅ **APROBADO** (Probado en navegador) | `src/index.css`, `tailwind.config.js` |
| **Estabilidad en Ejecución** | Consola de JavaScript limpia sin excepciones no controladas ni advertencias críticas de React. | ✅ **APROBADO** (0 errores) | `src/**/*` |

---

## 2. Matriz de Decisión para Futuras Pruebas (Impacto de Diff)

Antes de levantar el navegador o ejecutar baterías de pruebas, consulta esta matriz:

```
¿Qué archivos has modificado en esta sesión?
│
├── Solo 'src/core/roy-engine/'
│   └── Acción: Ejecutar únicamente 'npm run test'. NO lanzar navegador ni pruebas de UI.
│
├── Solo 'src/components/gantt/'
│   └── Acción: Probar visualmente solo el cronograma GANTT. NO re-verificar el modal de tareas ni el motor puro.
│
├── Solo 'src/components/roy-canvas/'
│   └── Acción: Probar visualmente solo el lienzo ROY y las aristas ortogonales.
│
├── 'package.json' o dependencias
│   └── Acción: Ejecutar 'npm run typecheck' y 'npm run test'.
│
└── Ningún cambio o solo documentación (ROADMAP, README)
    └── Acción: NO ejecutar ninguna prueba. Dar por buena la línea base.
```

---

## 3. Backlog de Mejoras Menores de UI Identificadas (No Bloqueantes)

1. **Ajuste inicial de vista (*Fit View*)**:
   * *Diagnóstico*: En la primera carga del lienzo, la cámara arranca demasiado próxima a un nodo individual (`T26`).
   * *Acción futura*: Invocar `fitView()` automáticamente tras el montaje inicial del grafo.
2. **Acceso directo de creación de tareas**:
   * *Diagnóstico*: El botón `+ Nueva Tarea` se ubica principalmente en la pestaña de Tabla.
   * *Acción futura*: Añadir botón rápido en la barra superior o creación por doble clic en el lienzo vacío.
