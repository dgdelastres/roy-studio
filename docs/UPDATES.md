# Registro de Novedades y Actualizaciones (Updates Log)

Documento vivo de registro técnico de cambios, nuevas características y mejoras aplicadas en **ROY Studio**. Este log sirve como referencia de consulta para cuando el usuario solicite inspecciones o auditorías formales de calidad.

---

## [Mejoras de Usabilidad, Calendario y Gantt] — 2026-11-13

### 🚀 Novedades y Cosas Añadidas
1. **Inicio de Proyecto Limpio y Selector de Ejemplo PILPIS en Menú Exportar**:
   - **Componentes**: `src/App.tsx`, `src/components/roy-canvas/RoyCanvas.tsx`, `src/components/navigation/TopBar.tsx`.
   - **Descripción**: La aplicación ya no se abre por defecto con el caso de ejemplo precargado. En su lugar, arranca con un proyecto en blanco y muestra en el lienzo de Red ROY un panel central de bienvenida con accesos rápidos: `+ Crear Tarea`, `Caso PILPIS` e `Importar`.
   - **Reubicación de Caso PILPIS**: Se retiró el botón estático de la barra superior y se ubicó como opción dentro del menú desplegable `Exportar / Proyecto` ("Cargar Caso PILPIS (24 meses)").

2. **Flechas de Conexión de Etapas en el Diagrama de Gantt**:
   - **Componentes**: `src/components/gantt/GanttView.tsx`.
   - **Descripción**: Capa SVG ortogonal que traza líneas y flechas direccionales entre los extremos de las barras de tareas según el tipo de ligadura ($FC, CC, FF, CF$).
   - **Resaltado Crítico**: Las dependencias pertenecientes al camino crítico se colorean en rojo `#DC2626` con flechas sólidas rojas. Las ligaduras ordinarias se muestran en tono neutro `#94A3B8`.
   - **Control de Visibilidad**: Toggle `[✓] Enlaces de Etapas` en la barra del Gantt para activar/ocultar los conectores visuales.

3. **Selector Global de Unidades Temporales (Días, Semanas, Meses)**:
   - **Componentes**: `src/core/roy-engine/types.ts`, `src/core/roy-engine/calendar.ts`, `src/components/roy-canvas/RoyNode.tsx`, `src/components/gantt/GanttView.tsx`, `src/components/task-table/TaskTable.tsx`, `src/components/task-dialog/TaskModal.tsx`.
   - **Descripción**: Soporte para unidades de duración en `days` (días `d`), `weeks` (semanas `sem`) y `months` (meses `m`).
   - **Consistencia Visual**: Las cabeceras del Gantt se adaptan dinámicamente (`M1, M2...`, `S1, S2...`, `D1, D2...`), al igual que las etiquetas en las tarjetas de nodos ROY, la columna de duración de la tabla y los modales.

4. **Calendario de Proyecto y Gestión de Días Festivos**:
   - **Componentes**: `src/core/roy-engine/calendar.ts`, `src/core/roy-engine/calendar.test.ts`, `src/components/calendar-dialog/CalendarModal.tsx`.
   - **Descripción**: 
     - Configuración de la fecha de inicio del proyecto (punto cero para el cálculo de fechas de calendario).
     - Configuración de la jornada semanal (días hábiles vs descansos).
     - Lista editable de días festivos e inhábiles (se omiten automáticamente en la proyección temporal cuando se trabaja en días).
     - Proyección y visualización de fechas naturales reales (DD/MM/AAAA) en las tareas y en el Gantt.
     - Modal `CalendarModal` accesible mediante el nuevo botón "Calendario" de la barra superior.

5. **Contraste de Controles de Zoom y Bloqueo en Red ROY**:
   - **Componentes**: `src/index.css`, `src/components/roy-canvas/RoyCanvas.tsx`.
   - **Descripción**: Los botones de control flotantes de la esquina inferior izquierda (`Controls`: zoom in, zoom out, fit view, bloqueo) se fijan de forma permanente con fondo blanco puro y símbolos de trazo negro de alto contraste, tanto en modo oscuro como en modo claro, garantizando una legibilidad visual impecable sin desvanecimiento de iconos.

---

## [v1.0.1] — 2026-11-13 (Commit: `291a8f2`)

### 🚀 Novedades y Cosas Añadidas
1. **Acceso Rápido a '+ Tarea' en Cabecera**:
   - **Componente**: `src/components/navigation/TopBar.tsx` y `src/App.tsx`.
   - **Descripción**: Botón primario prominente `+ Tarea` en color azul situado en la barra superior principal, disponible en todo momento sin importar la pestaña activa (*Red ROY*, *Gantt*, *Tabla*).
   - **Comportamiento**: Abre inmediatamente el formulario `TaskModal` precargado en modo de creación limpia.
   - **Punto de inspección futura**: Clic en `+ Tarea` en TopBar → apertura de modal → guardado de tarea → recálculo automático.

2. **Fit View y Centrado Panorámico Automático en Red ROY**:
   - **Componentes**: `src/components/roy-canvas/RoyCanvas.tsx`.
   - **Descripción**:
     - **Layout Inicial con Dagre**: Si los nodos cargados carecen de coordenadas personalizadas (como en la plantilla oficial PILPIS), se les asigna distribución jerárquica con Dagre antes de renderizar, evitando que nazcan solapados en `(0,0)`.
     - **Centrado Suave (300 ms, 20% padding)**: Activación automática de `fitView` al montar el lienzo, al regresar de otra pestaña o al cargar/reiniciar proyectos (Caso PILPIS).
   - **Punto de inspección futura**: Al abrir el lienzo o cargar plantilla, la vista se encuadra automáticamente con animación suave sin requerir pulsar "Auto-Organizar".

---

## [v1.0.0] — 2026-11-13 (Commit Base)

### 🚀 Características Fundacionales Certificadas
- **Motor Matemático ROY (MPM)**:
  - Algoritmo de potenciales de Roy para grafos de precedencias.
  - Fechas tempranas ($ES, EF$), fechas tardías ($LS, LF$), holgura total ($HT$) y holgura libre ($HL$).
  - Identificación del camino crítico ($HT = 0$) y aristas críticas.
  - Detector preventivo de ciclos circulares (`wouldCreateCycle`).
- **Lienzo Interactivo (React Flow v12 + Dagre)**:
  - Nodos académicos tipo caja con 8 campos o modo compacto.
  - Aristas ortogonales (`smoothstep`) con handles estrictos (salida derecha `right-source`, entrada izquierda `left-target`).
  - Tirador interactivo de desplazamiento de quiebre en ligaduras (`customCenterX`).
  - Doble clic en ligaduras para editar tipo ($FC, CC, FF, CF$) y desfase ($lag$).
- **Diagrama GANTT**:
  - Cronograma temporal mensual a 24 meses (Caso PILPIS S.A.).
  - Filtro interactivo de solo camino crítico.
- **Tabla Editable de Tareas**:
  - Vista tipo hoja de cálculo con edición rápida, duplicación y borrado.
- **Gestión de Equipos y Departamentos**:
  - Modal de configuración de departamentos técnicos con paleta de colores.
- **Exportación e Importación**:
  - Excel (`.xlsx`), PDF formal de memoria de proyecto, PNG HD (2x), SVG vectorial y JSON.
- **Tema Claro / Oscuro**:
  - Paleta técnica de ingeniería con contraste WCAG AA.
