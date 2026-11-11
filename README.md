# ROY Studio 📊

> **Generador y Calculador de Diagramas ROY (Método de los Potenciales de Roy / MPM) y Diagramas de GANTT Sincronizados para Proyectos de Ingeniería.**

Desarrollado para la formulación, optimización y seguimiento temporal de proyectos industriales complejos, tomando como caso de estudio el anteproyecto de la planta de fraccionamiento de fracción C4 de **PILPIS, S.A.** para **QUIMISUR** (24 meses, 5 departamentos técnicos).

---

## 🚀 Características Principales

### 1. Motor de Cálculo Matemático ROY Riguroso
- **Ligaduras de Potencial Generalizadas**:
  - $FC$ (Fin - Comienzo) con retardo $\ge 0$ o adelanto $< 0$.
  - $CC$ (Comienzo - Comienzo) con desfase.
  - $FF$ (Fin - Fin) con desfase.
  - $CF$ (Comienzo - Fin).
- **Algoritmo de Potenciales**:
  - Paso hacia adelante: Tiempos tempranos ($ES, EF$).
  - Paso hacia atrás: Tiempos tardíos ($LS, LF$).
  - Holgura Total ($HT = LS - ES = LF - EF$).
  - Holgura Libre ($HL = \min_j(ES_j - (ES_i + l_{ij}))$).
  - Identificación automática del **Camino Crítico** ($HT = 0$) y aristas críticas tensas.
  - Detector de dependencias circulares (bucles/ciclos) con traza de error interactiva.

### 2. Canvas Interactivo de Red ROY (`@xyflow/react` + Dagre)
- **Modos de Vista Configurables**:
  - **Vista Académica Completa (8 casillas)**: ID, Tarea, Dpto, Duración, $ES, EF, LS, LF, HT, HL$.
  - **Vista Compacta (4 campos)** para diagramas extensos.
- **Auto-Layout Jerárquico**: Disposición automática sin solapamientos (Horizontal de izquierda a derecha o Vertical).
- Conexión interactiva arrastrando cables entre conectores para definir precedencias al vuelo.

### 3. Diagrama de GANTT Sincronizado
- Escala temporal mensual (Meses 1 a 24) adaptada al horizonte del anteproyecto.
- Barras de tiempo temprano coloreadas por departamento de la oficina técnica.
- Barras de holgura total rayadas semitransparentes.
- Filtros por departamento o visualización exclusiva del camino crítico.

### 4. Tabla de Entrada Masiva Tipo Hoja de Cálculo
- Edición rápida de duraciones, departamentos y dependencias.
- Búsqueda en tiempo real por identificador o nombre.
- Acciones de duplicación rápida y eliminación con limpieza de dependencias huérfanas.

### 5. Plantilla Oficial PILPIS - QUIMISUR Incluida
- Pre-cargada con las 26 actividades reales del encargo de destilación C4 (200.000 Tm/año) distribuidas entre los 5 departamentos:
  1. Coordinación y Diseño de Procesos (Torres de separación y simulación)
  2. Gestión de Proyectos y Recipientes (Recipientes, tanques 15d y programación)
  3. Control de Procesos y Diseño de Bombas (Bombas 110%/120% e Impacto Ambiental)
  4. Seguridad y Cambiadores de Calor (Cambiadores, aerorrefrigerantes, antorcha y HAZOP)
  5. Planos y Análisis Económico (P&ID, tuberías, VAN, TIR, Payback y sensibilidad)
  6. Aprovisionamiento, Montaje y Puesta en Marcha

### 6. Exportación para Entrega y Memoria
- 📄 **Informe Técnico en PDF**: Maquetado apaisado con membrete corporativo, resumen ejecutivo y tabla completa para adjuntar al libro de proyecto.
- 📊 **Excel (.xlsx)**: Hoja de cálculo estructurada con todos los parámetros de programación.
- 📐 **SVG Vectorial**: Diagrama vectorial escalable al 100% sin pérdida de calidad para Word / LaTeX.
- 🖼️ **PNG en Alta Resolución (2x)** para presentaciones ejecutivas.
- 💾 **Guardar / Cargar en JSON** para compartir el proyecto entre compañeros de equipo.

---

## 🛠️ Stack Tecnológico

- **Frontend Core**: React 18 + TypeScript 5 + Vite
- **Estilizado**: Tailwind CSS v3 (Tema Claro Técnico de Alto Contraste y Tema Oscuro Moderno)
- **Motor de Grafos**: `@xyflow/react` + `@dagrejs/dagre`
- **Testing**: Vitest (100% cobertura del motor matemático)
- **Iconografía**: `lucide-react`
- **Exportación**: `xlsx`, `jspdf`, `html2canvas`
- **Desktop Shell**: Electron para Windows

---

## 📦 Instalación y Uso

### Prerrequisitos
- Node.js (versión 18 o superior)
- npm

### 1. Clonar el repositorio
```bash
git clone https://github.com/dgdelastres/roy-studio.git
cd roy-studio
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Ejecutar en desarrollo
```bash
npm run dev
```
La aplicación se abrirá en tu navegador en `http://localhost:5173`. En Windows también puedes hacer doble clic en `iniciar_roy_studio.bat`.

### 4. Ejecutar pruebas unitarias
```bash
npm run test
```

### 5. Compilar para producción
```bash
npm run build
```

---

## 📋 Licencia
Distribuido con fines docentes y de ingeniería para la asignatura de Proyectos de Ingeniería.
