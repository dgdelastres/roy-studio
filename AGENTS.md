# AGENTS.md — ROY Studio (Generador de Diagramas ROY y GANTT)

Guía operativa y estándares de arquitectura para el desarrollo y mantenimiento de **ROY Studio**.

---

## 1. Visión General del Proyecto y Stack Tecnológico

**ROY Studio** es una aplicación de ingeniería para Windows dedicada a la formulación, cálculo riguroso y representación gráfica de **Diagramas de Red ROY (Método de los Potenciales de Roy / MPM)** y **Diagramas de GANTT sincronizados**, con especialización en proyectos de plantas industriales (como el caso PILPIS / QUIMISUR para fraccionamiento de C4 en 24 meses).

### Stack Tecnológico:
- **Frontend Core**: React 18/19 + TypeScript 5.x + Vite
- **Estilizado & Diseño**: Tailwind CSS v3 / Modern CSS con diseño técnico de ingeniería (alto contraste, temas Claro y Oscuro)
- **Motor de Grafos**: `@xyflow/react` (React Flow v12) + `@dagrejs/dagre` para auto-layout jerárquico
- **Iconografía**: `lucide-react`
- **Exportación de Datos**: `xlsx` (Excel), `jspdf` + `html2canvas` (PDF de memoria de proyecto), SVG vectorial y PNG HD nativos
- **Testing**: `vitest` para pruebas unitarias del motor de cálculo matemático
- **Desktop Shell**: Electron para empaquetado nativo `.exe` en Windows

---

## 2. Mapa Rápido de Archivos y Responsabilidades

- `src/core/roy-engine/`: Biblioteca matemática pura (algoritmos MPM, holguras, ciclos, `wouldCreateCycle`, tests). **Agnóstica de UI**.
- `src/components/roy-canvas/`: Lienzo interactivo React Flow:
  - `RoyNode.tsx`: Nodos con tooltips académicos y handles estrictos: salida a la derecha (`right-source`), entrada a la izquierda (`left-target`).
  - `RoyEdge.tsx`: Aristas ortogonales limpias (`getSmoothStepPath`) con tirador arrastrable de quiebre (`customCenterX`) y doble clic para editar.
  - `layout.ts`: Motor de distribución Dagre con separación generosa anti-solapes.
  - `RoyCanvas.tsx`: Orquestación del grafo, validación preventiva (`isValidConnection`) y sincronización reactiva inmediata.
- `src/components/gantt/`: Cronograma Gantt temporal mensual (1 a 24 meses).
- `src/components/task-table/`: Tabla editable de tareas tipo hoja de cálculo.
- `src/components/edge-dialog/`: Modal de configuración de ligaduras ($FC, CC, FF, CF$, $lag$).
- `src/components/department-dialog/`: Gestión de equipos técnicos, códigos y paletas de color.
- `src/components/import-dialog/`: Importador tolerante de Excel y JSON con previsualización.
- `src/utils/export/`: Generación de informes PDF formales, hojas Excel y descargas PNG/SVG.
- `docs/ROADMAP.md`: Especificaciones y expectativas futuras (recursos, curva S, PERT, EVM).
- `docs/QA_BASELINE.md`: Certificación formal de pruebas y matriz de re-verificación por impacto de diff.

---

## 3. Protocolo de Eficiencia de Tokens y Contexto para Agentes

1. **Ediciones Quirúrgicas**: Prohibido reescribir archivos completos (`write_file`) cuando solo se modifican unas pocas líneas; utilizar siempre `edit_file` con diffs mínimos.
2. **Consultas Puntuales**: No leer ficheros completos innecesariamente. Leer solo los rangos de líneas relevantes usando `StartLine` y `EndLine`.
3. **Divulgación Progresiva**: Consultar documentación especializada solo bajo demanda (`docs/ROADMAP.md` para futuros módulos).
4. **Higiene de Sesión**: Sugerir proactivamente el comando `/compact` al usuario cuando el historial acumule múltiples iteraciones de trabajo.
5. **Protocolo Básico Obligatorio (`grill-me` + `context7-mcp`)**: Aplicar de forma sistemática la directiva de la skill `protocolo-basico`. Ante decisiones de UX/UI, esquemas de datos o dicotomías técnicas, consultar preventivamente `context7-mcp` e interrogar al usuario con `ask_question` (con opciones estructuradas y `(Recommended)`) antes de escribir código para evitar el consumo innecesario de tokens.
6. **Línea Base de Pruebas (QA Baseline)**: Consultar obligatoriamente `docs/QA_BASELINE.md`. Prohibido volver a inspeccionar o ejecutar pruebas de interfaz/navegador sobre módulos ya certificados (motor de cálculo, GANTT, lienzo, modales, temas) salvo que el diff del código toque directamente sus archivos o el usuario lo ordene expresamente.

---

## 4. Invariantes Arquitectónicos Inviolables

1. **Pureza Matemática**: `src/core/roy-engine` no debe importar React, DOM ni bibliotecas gráficas. Toda lógica de programación temporal debe testearse con `vitest`.
2. **Flujo Unidireccional de Ligaduras**:
   - Salidas (`source`) **únicamente** en el extremo derecho (`right-source`).
   - Entradas (`target`) **únicamente** en el extremo izquierdo (`left-target`).
   - Nunca añadir handles en la parte superior, inferior o permitir flujo inverso.
3. **Inmunidad a Ciclos y Bucles**:
   - Toda creación de ligadura debe validarse preventivamente con `wouldCreateCycle(tasks, source, target)`.
   - Se prohíbe taxativamente la autoconexión de un nodo consigo mismo ($source === target$).
4. **Sincronización Reactiva en Tiempo Real**:
   - El estado de `nodes` y `edges` en `RoyCanvas` debe actualizarse automáticamente ante cualquier mutación de `tasks` mediante `useEffect`, preservando las posiciones espaciales de los nodos sin obligar al usuario a pulsar "Auto-organizar".
5. **Enrutamiento de Aristas Limpio**:
   - Emplear trazado ortogonal de esquinas redondeadas (`getSmoothStepPath`).
   - Soportar el tirador interactivo de desplazamiento de quiebre (`customCenterX`) con reset a centrado automático con doble clic.

---

## 5. Comandos de Desarrollo y Verificación

- **Servidor Web**: `npm run dev`
- **Tests Unitarios**: `npm run test`
- **Verificación TypeScript**: `npm run typecheck` (`tsc --noEmit`)
- **Compilación Web**: `npm run build`
- **Empaquetado Windows Portable (.exe)**: `npx electron-builder --win portable`
