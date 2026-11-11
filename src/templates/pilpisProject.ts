import { Task } from '../core/roy-engine/types';

/**
 * Plantilla Oficial: Anteproyecto PILPIS - QUIMISUR
 * Separación mediante destilación de isobutano y n-butano a partir de fracción C4
 * Capacidad: 200.000 Tm/año | Horizonte de Proyecto: 24 meses (2 años)
 */
export const PILPIS_PROJECT_TASKS: Task[] = [
  {\n    id: 'T01',\n    name: 'Bases y Criterios de Diseño (Capacidad 200.000 Tm/a C4)',\n    duration: 1,\n    departmentId: 'D1',\n    dependencies: [],\n  },
  {\n    id: 'T02',\n    name: 'Simulación y Balance Materia/Energía Fraccionamiento C4',\n    duration: 2,\n    departmentId: 'D1',\n    dependencies: [{ predecessorId: 'T01', type: 'FC', lag: 0 }],\n  },
  {\n    id: 'T03',\n    name: 'Estudio Optimización Etapas, Reflujo y Plato Alimentación',\n    duration: 1.5,\n    departmentId: 'D1',\n    dependencies: [{ predecessorId: 'T02', type: 'FC', lag: 0 }],\n  },
  {\n    id: 'T04',\n    name: 'Ingeniería Básica Torre Fraccionamiento (Platos Válvulas)',\n    duration: 2,\n    departmentId: 'D1',\n    dependencies: [{ predecessorId: 'T03', type: 'FC', lag: 0 }],\n  },
  {\n    id: 'T05',\n    name: 'Dimensionamiento Recipientes y Acumuladores Reflujo (L/D)',\n    duration: 1.5,\n    departmentId: 'D2',\n    dependencies: [{ predecessorId: 'T03', type: 'FC', lag: 0 }],\n  },
  {\n    id: 'T06',\n    name: 'Diseño Almacenamiento n-Butano (15d, cota +20m / 400m)',\n    duration: 2,\n    departmentId: 'D2',\n    dependencies: [{ predecessorId: 'T02', type: 'FC', lag: 0.5 }],\n  },
  {\n    id: 'T07',\n    name: 'Cálculo Bombas Carga y Productos (Sobrediseño 110%)',\n    duration: 1.5,\n    departmentId: 'D3',\n    dependencies: [{ predecessorId: 'T05', type: 'FC', lag: 0 }],\n  },
  {\n    id: 'T08',\n    name: 'Cálculo Bombas Reflujo (120%) y Estudio Independientes',\n    duration: 1.5,\n    departmentId: 'D3',\n    dependencies: [{ predecessorId: 'T05', type: 'FC', lag: 0 }],\n  },
  {\n    id: 'T09',\n    name: 'Diseño Cambiadores de Calor, Precalentador y Carcasas',\n    duration: 2,\n    departmentId: 'D4',\n    dependencies: [{ predecessorId: 'T02', type: 'FC', lag: 0 }],\n  },
  {\n    id: 'T10',\n    name: 'Diseño Aerorrefrigerantes y Condensadores de Cabeza',\n    duration: 1.5,\n    departmentId: 'D4',\n    dependencies: [{ predecessorId: 'T04', type: 'CC', lag: 1 }],\n  },
  {\n    id: 'T11',\n    name: 'Diseño Térmico Riguroso Enfriador Fondo Columna',\n    duration: 1.5,\n    departmentId: 'D4',\n    dependencies: [{ predecessorId: 'T04', type: 'FC', lag: 0 }],\n  },
  {\n    id: 'T12',\n    name: 'Diagrama de Tuberías e Instrumentación (P&ID)',\n    duration: 2.5,\n    departmentId: 'D5',\n    dependencies: [\n      { predecessorId: 'T07', type: 'FC', lag: 0 },\n      { predecessorId: 'T08', type: 'FC', lag: 0 },\n      { predecessorId: 'T09', type: 'FC', lag: 0 },\n      { predecessorId: 'T10', type: 'FC', lag: 0 },\n      { predecessorId: 'T11', type: 'FC', lag: 0 },\n    ],\n  },
  {\n    id: 'T13',\n    name: 'Sistemas de Control, Plato Sensible y Lazos',\n    duration: 2,\n    departmentId: 'D3',\n    dependencies: [{ predecessorId: 'T12', type: 'CC', lag: 1 }],\n  },
  {\n    id: 'T14',\n    name: 'Conexión Colector de Antorcha a Red General (0,4 kg/cm²g)',\n    duration: 1,\n    departmentId: 'D4',\n    dependencies: [{ predecessorId: 'T12', type: 'FC', lag: 0 }],\n  },
  {\n    id: 'T15',\n    name: 'Documento Impacto Ambiental (Situación Preoperacional y Leopold)',\n    duration: 3,\n    departmentId: 'D3',\n    dependencies: [{ predecessorId: 'T02', type: 'FC', lag: 0 }],\n  },
  {\n    id: 'T16',\n    name: 'Análisis de Riesgos (HAZOP y Árbol de Fallos de Nodo)',\n    duration: 2,\n    departmentId: 'D4',\n    dependencies: [{ predecessorId: 'T12', type: 'FC', lag: 0 }],\n  },
  {\n    id: 'T17',\n    name: 'Cálculo Tuberías, Diámetro Envío y Plot Plan',\n    duration: 2,\n    departmentId: 'D5',\n    dependencies: [{ predecessorId: 'T12', type: 'FC', lag: 0 }],\n  },
  {\n    id: 'T18',\n    name: 'Evaluación Económica (VAN, TIR, Payback Dinámico)',\n    duration: 1.5,\n    departmentId: 'D5',\n    dependencies: [\n      { predecessorId: 'T16', type: 'FC', lag: 0 },\n      { predecessorId: 'T17', type: 'FC', lag: 0 },\n    ],\n  },
  {\n    id: 'T19',\n    name: 'Estudios Sensibilidad (Inversión, Dólar, Materia Prima)',\n    duration: 1,\n    departmentId: 'D5',\n    dependencies: [{ predecessorId: 'T18', type: 'FC', lag: 0 }],\n  },
  {\n    id: 'T20',\n    name: 'Programación Detallada del Proyecto (ROY + GANTT Final)',\n    duration: 1.5,\n    departmentId: 'D2',\n    dependencies: [\n      { predecessorId: 'T18', type: 'FC', lag: 0 },\n      { predecessorId: 'T15', type: 'FF', lag: 0 },\n    ],\n  },
  {\n    id: 'T21',\n    name: 'Aprovisionamiento y Compra Equipos Críticos (Torre y Bombas)',\n    duration: 3,\n    departmentId: 'D6',\n    dependencies: [{ predecessorId: 'T04', type: 'FC', lag: 0 }],\n  },
  {\n    id: 'T22',\n    name: 'Fabricación y Suministro en Sitio de Intercambiadores y Columnas',\n    duration: 5,\n    departmentId: 'D6',\n    dependencies: [{ predecessorId: 'T21', type: 'FC', lag: 0 }],\n  },
  {\n    id: 'T23',\n    name: 'Obra Civil, Cimentaciones e Interconexión con Refinería',\n    duration: 3.5,\n    departmentId: 'D6',\n    dependencies: [{ predecessorId: 'T17', type: 'FC', lag: 0 }],\n  },
  {\n    id: 'T24',\n    name: 'Montaje Mecánico, Red de Tuberías y Cableado',\n    duration: 4,\n    departmentId: 'D6',\n    dependencies: [\n      { predecessorId: 'T22', type: 'FC', lag: 0 },\n      { predecessorId: 'T23', type: 'FC', lag: 0 },\n    ],\n  },
  {\n    id: 'T25',\n    name: 'Pruebas Hidrostáticas, Calibración de Lazos y Precomisionado',\n    duration: 1.5,\n    departmentId: 'D3',\n    dependencies: [\n      { predecessorId: 'T24', type: 'FC', lag: 0 },\n      { predecessorId: 'T13', type: 'FC', lag: 0 },\n      { predecessorId: 'T14', type: 'FC', lag: 0 },\n    ],\n  },
  {\n    id: 'T26',\n    name: 'Puesta en Marcha y Entrega a QUIMISUR (Cierre Anteproyecto)',\n    duration: 1,\n    departmentId: 'D1',\n    dependencies: [\n      { predecessorId: 'T25', type: 'FC', lag: 0 },\n      { predecessorId: 'T19', type: 'FC', lag: 0 },\n      { predecessorId: 'T20', type: 'FC', lag: 0 },\n    ],\n  },\n];\n