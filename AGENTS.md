# AGENTS.md — ROY Studio (Generador de Diagramas ROY y GANTT)

Guía operativa y estándares de arquitectura para el desarrollo y mantenimiento de **ROY Studio**.

---

## 1. Visión General del Proyecto y Stack Tecnológico

**ROY Studio** es una aplicación de ingeniería para Windows dedicada a la formulación, cálculo riguroso y representación gráfica de **Diagramas de Red ROY (Método de los Potenciales de Roy / MPM)** y **Diagramas de GANTT sincronizados**, con especialización en proyectos de plantas industriales (como el caso PILPIS / QUIMISUR para fraccionamiento de C4 en 24 meses).

### Stack Tecnológico:
- **Frontend Core**: React 19 + TypeScript 5.x + Vite
- **Estilizado & Diseño**: Tailwind CSS v3 / Modern CSS con diseño técnico de ingeniería (alto contraste, temas Claro y Oscuro)
- **Motor de Grafos**: `@xyflow/react` (React Flow v12) + `@dagrejs/dagre` para auto-layout jerárquico
- **Iconografía**: `lucide-react`
- **Exportación de Datos**: `xlsx` (Excel), `jspdf` + `html2canvas` (PDF de memoria de proyecto), SVG vectorial y PNG HD nativos
- **Testing**: `vitest` para pruebas unitarias del motor de cálculo matemático
- **Desktop Shell**: Electron para empaquetado nativo `.exe` en Windows

---

## 2. Estructura de Directorios

```text
/
├── AGENTS.md                  # Especificación del proyecto y directrices de agentes
├── Enunciados Proyecto/       # Documentación de partida (PILPIS / QUIMISUR)
├── electron/                  # Proceso principal y preload de Electron para Windows
│   ├── main.ts
│   └── preload.ts
├── src/
│   ├── core/                  # Motor matemático independiente de ROY
│   │   └── roy-engine/        # Tipos, algoritmo de potenciales, validaciones y tests
│   │       ├── types.ts
│   │       ├── calculator.ts
│   │       └── calculator.test.ts
│   ├── components/            # Componentes de interfaz de usuario
│   │   ├── roy-canvas/        # Canvas interactivo React Flow, RoyNode y RoyEdge
│   │   ├── gantt/             # Gráfico de Gantt temporal sincronizado
│   │   ├── task-table/        # Tabla editable de tareas tipo hoja de cálculo
│   │   ├── task-dialog/       # Modal de edición y detalle de tarea
│   │   └── navigation/        # Barra superior, controles de vista, layout y temas
│   ├── templates/             # Plantillas predefinidas (PILPIS Caso B 24 meses)
│   │   └── pilpisProject.ts
│   ├── utils/                 # Utilidades de exportación (Excel, PDF, SVG, PNG)
│   │   └── export/
│   ├── theme/                 # Paletas semánticas y departamentos técnicos
│   ├── App.tsx                # Componente raíz y orquestación de estado
│   └── main.tsx               # Punto de entrada de Vite
├── package.json
├── tsconfig.json
├── vite.config.ts
└── tailwind.config.js
```

---

## 3. Comandos de Desarrollo y Verificación

- **Desarrollo Web en Vivo**: `npm run dev` (Inicia el servidor Vite con HMR ultra-rápido).
- **Ejecutar Tests Unitarios del Motor**: `npm run test` o `npx vitest run`.
- **Verificación de Tipos TypeScript**: `npm run typecheck` (`tsc --noEmit`).
- **Compilación de Producción Web**: `npm run build`.
- **Ejecución en Ventana Desktop Electron**: `npm run electron:dev`.
- **Empaquetado para Windows (.exe)**: `npm run dist:win`.

---

## 4. Convenciones de Código y Calidad

- **TypeScript Estricto**: Tipado exhaustivo de todas las interfaces (`Task`, `Dependency`, `Department`, `RoyCalculationResult`). Prohibido el uso de `any`.
- **Pureza del Motor ROY**: El directorio `src/core/roy-engine` no debe importar React ni ninguna biblioteca de UI; debe ser una biblioteca pura de algoritmos de grafos testeable en consola.
- **Matemática de Potenciales de Roy**:
  - $ES_j = \max_{(i, j)} (ES_i + l_{ij})$
  - $EF_j = ES_j + d_j$
  - $LS_i = \min_{(i, j)} (LS_j - l_{ij})$
  - $LF_i = LS_i + d_i$
  - $HT_i = LS_i - ES_i = LF_i - EF_i$
  - $HL_i = \min_{(i, j)} (ES_j - (ES_i + l_{ij}))$
- **Diseño Visual**: Seguir la guía de `frontend-design`. Mantener una interfaz nítida y técnica, con códigos de color claros para los 5 departamentos de PILPIS, diferenciando siempre el Camino Crítico en rojo carmesí.
- **Commits Semánticos**: `feat:`, `fix:`, `refactor:`, `test:`, `docs:`, `chore:`.
