# Registro de Novedades y Actualizaciones (Updates Log)

Documento vivo de registro técnico de cambios, nuevas características y mejoras aplicadas en **ROY Studio**. Este log sirve como referencia de consulta para cuando el usuario solicite inspecciones o auditorías formales de calidad.

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
