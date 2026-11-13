/**
 * ROY Engine - Type Definitions
 * Método de los Potenciales de Roy (MPM / Activity-on-Node)
 */

export type DependencyType = 'FC' | 'CC' | 'FF' | 'CF';

export interface Dependency {
  predecessorId: string;
  type: DependencyType;
  lag: number; // Desfase / retardo (semanas, meses, días). Puede ser positivo, 0 o negativo
  sourceHandle?: string; // Conector de salida elegido (ej: right-source-top, -mid, -bot)
  targetHandle?: string; // Conector de entrada elegido (ej: left-target-top, -mid, -bot)
}

export interface Task {
  id: string;
  name: string;
  duration: number; // d_i
  departmentId: string;
  dependencies: Dependency[];
  
  // Posición visual en el canvas
  position?: { x: number; y: number };
  
  // Campos calculados por el motor de Roy
  earlyStart?: number;  // ES / t_i^temprano (Inicio más temprano)
  earlyFinish?: number; // EF / f_i^temprano = ES + d_i (Fin más temprano)
  lateStart?: number;   // LS / t_i^tardío (Inicio más tardío)
  lateFinish?: number;  // LF / f_i^tardío = LS + d_i (Fin más tardío)
  totalFloat?: number;  // HT / Holgura Total = LS - ES = LF - EF
  freeFloat?: number;   // HL / Holgura Libre = min_sucesores(ES_siguiente - (ES_i + lag_canonica))
  isCritical?: boolean; // Pertenece al camino crítico (HT == 0)
  level?: number;       // Nivel topológico / columna en el grafo
}

export interface Department {
  id: string;
  name: string;
  code: string;
  color: string;         // Hexadecimal principal
  lightBg: string;       // Fondo claro para tema técnico
  border: string;        // Borde
  textColor: string;     // Color de texto de la etiqueta
  description?: string;
  personnel?: string[];  // Miembros de la plantilla
}

export interface CriticalEdge {
  source: string;
  target: string;
}

export interface RoyCalculationResult {
  tasks: Task[];
  taskMap: Map<string, Task>;
  criticalTasks: string[];       // IDs de tareas críticas
  criticalEdges: CriticalEdge[]; // Aristas críticas
  totalProjectDuration: number;
  hasCycle: boolean;
  cyclePath?: string[];
  errors: string[];
}

export type TimeUnit = 'days' | 'weeks' | 'months';

export interface Holiday {
  id: string;
  date: string; // Formato YYYY-MM-DD
  name: string;
}

export interface ProjectCalendar {
  startDate: string; // Formato YYYY-MM-DD
  workDays: number[]; // 1 = Lunes, 2 = Martes, ..., 5 = Viernes, 6 = Sábado, 0 = Domingo
  holidays: Holiday[];
  timeUnit: TimeUnit;
}

