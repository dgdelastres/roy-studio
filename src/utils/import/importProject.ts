import * as XLSX from 'xlsx';
import { Task, Dependency, DependencyType } from '../../core/roy-engine/types';

export interface ImportResult {
  success: boolean;
  tasks: Task[];
  projectName?: string;
  error?: string;
  warnings?: string[];
}

function cleanStr(val: unknown): string {
  if (val === null || val === undefined) return '';
  return String(val).trim();
}

export function parseDependenciesString(raw: string): Dependency[] {
  if (!raw || typeof raw !== 'string') return [];
  const clean = raw.trim();
  if (!clean || clean === '-' || clean === 'Ninguna' || clean === 'ninguna') return [];

  const parts = clean.split(/[,;\n]+/).map(p => p.trim()).filter(Boolean);
  const deps: Dependency[] = [];

  for (const part of parts) {
    const parenMatch = part.match(/^([a-zA-Z0-9_-]+)\s*(?:\(\s*([a-zA-Z]{2})?\s*([+-]?\d+)?\s*\))?$/);
    if (parenMatch) {
      const predId = parenMatch[1];
      const relType = (parenMatch[2]?.toUpperCase() as DependencyType) || 'FC';
      const lag = parenMatch[3] ? parseInt(parenMatch[3], 10) : 0;
      deps.push({
        predecessorId: predId,
        type: ['FC', 'CC', 'FF', 'CF'].includes(relType) ? relType : 'FC',
        lag: isNaN(lag) ? 0 : lag,
      });
      continue;
    }

    const colonMatch = part.match(/^([a-zA-Z0-9_-]+)(?::([a-zA-Z]{2}))?(?::([+-]?\d+))?$/);
    if (colonMatch) {
      const predId = colonMatch[1];
      const relType = (colonMatch[2]?.toUpperCase() as DependencyType) || 'FC';
      const lag = colonMatch[3] ? parseInt(colonMatch[3], 10) : 0;
      deps.push({
        predecessorId: predId,
        type: ['FC', 'CC', 'FF', 'CF'].includes(relType) ? relType : 'FC',
        lag: isNaN(lag) ? 0 : lag,
      });
      continue;
    }

    const simpleId = part.replace(/[^a-zA-Z0-9_-]/g, '');
    if (simpleId) {
      deps.push({
        predecessorId: simpleId,
        type: 'FC',
        lag: 0,
      });
    }
  }

  return deps;
}

export function parseProjectJson(jsonString: string): ImportResult {
  try {
    const data = JSON.parse(jsonString);
    let rawTasks: unknown[] = [];
    let projectName = 'Proyecto Importado';

    if (Array.isArray(data)) {
      rawTasks = data;
    } else if (data && typeof data === 'object') {
      if (Array.isArray(data.tasks)) {
        rawTasks = data.tasks;
      }
      if (data.projectName) {
        projectName = String(data.projectName);
      }
    }

    if (!rawTasks.length) {
      return {
        success: false,
        tasks: [],
        error: 'El archivo JSON no contiene una lista de tareas válida ("tasks": [...]).',
      };
    }

    const tasks: Task[] = [];
    const warnings: string[] = [];

    rawTasks.forEach((item, index) => {
      if (!item || typeof item !== 'object') return;
      const t = item as Record<string, unknown>;
      const id = cleanStr(t.id) || `T${String(index + 1).padStart(2, '0')}`;
      const name = cleanStr(t.name) || `Tarea ${id}`;
      const duration = typeof t.duration === 'number' ? t.duration : Math.max(1, parseInt(String(t.duration || 1), 10) || 1);
      const departmentId = cleanStr(t.departmentId) || 'D1';

      let dependencies: Dependency[] = [];
      if (Array.isArray(t.dependencies)) {
        dependencies = (t.dependencies as Array<Record<string, unknown>>)
          .filter(d => d && typeof d === 'object' && d.predecessorId)
          .map(d => ({
            predecessorId: String(d.predecessorId),
            type: (['FC', 'CC', 'FF', 'CF'].includes(String(d.type).toUpperCase()) ? String(d.type).toUpperCase() : 'FC') as DependencyType,
            lag: typeof d.lag === 'number' ? d.lag : parseInt(String(d.lag || 0), 10) || 0,
          }));
      }

      tasks.push({
        id,
        name,
        duration,
        departmentId,
        dependencies,
      });
    });

    return {
      success: true,
      tasks,
      projectName,
      warnings,
    };
  } catch (err) {
    return {
      success: false,
      tasks: [],
      error: `Error al analizar el archivo JSON: ${(err as Error).message}`,
    };
  }
}

export function parseProjectExcel(data: ArrayBuffer): ImportResult {
  try {
    const workbook = XLSX.read(data, { type: 'array' });
    if (!workbook.SheetNames.length) {
      return { success: false, tasks: [], error: 'El archivo Excel no contiene hojas de cálculo.' };
    }

    const sheetName = workbook.SheetNames.find(s => s.toLowerCase().includes('roy') || s.toLowerCase().includes('tareas')) || workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: '' });

    if (!rows.length) {
      return { success: false, tasks: [], error: `La hoja "${sheetName}" está vacía.` };
    }

    const tasks: Task[] = [];
    const warnings: string[] = [];

    rows.forEach((row, idx) => {
      const idKey = Object.keys(row).find(k => {
        const norm = k.toLowerCase().trim();
        return norm === 'id' || norm === 'código' || norm === 'codigo' || norm === 'clave' || norm === 'actividad';
      });
      const nameKey = Object.keys(row).find(k => {
        const norm = k.toLowerCase().trim();
        return norm === 'nombre' || norm === 'descripción' || norm === 'descripcion' || norm === 'concepto' || norm === 'nombre de tarea';
      });
      const durKey = Object.keys(row).find(k => {
        const norm = k.toLowerCase().trim();
        return norm.includes('duraci') || norm === 'dur' || norm === 'meses' || norm === 'dias' || norm === 'tiempo';
      });
      const deptKey = Object.keys(row).find(k => {
        const norm = k.toLowerCase().trim();
        return norm.includes('dpto') || norm.includes('departamento') || norm === 'area' || norm === 'área';
      });
      const predKey = Object.keys(row).find(k => {
        const norm = k.toLowerCase().trim();
        return norm.includes('predec') || norm.includes('preceden') || norm.includes('dependenc');
      });

      const rawId = idKey ? cleanStr(row[idKey]) : '';
      const rawName = nameKey ? cleanStr(row[nameKey]) : '';
      const rawDur = durKey ? row[durKey] : 1;
      const rawDept = deptKey ? cleanStr(row[deptKey]) : 'D1';
      const rawPred = predKey ? cleanStr(row[predKey]) : '';

      if (!rawId && !rawName) return;

      const id = rawId || `T${String(idx + 1).padStart(2, '0')}`;
      const name = rawName || `Actividad ${id}`;
      const parsedDur = typeof rawDur === 'number' ? rawDur : parseFloat(String(rawDur).replace(',', '.')) || 1;
      const duration = Math.max(1, Math.round(parsedDur));

      let departmentId = 'D1';
      const deptUpper = rawDept.toUpperCase();
      if (/^D[1-6]$/.test(deptUpper)) {
        departmentId = deptUpper;
      } else if (deptUpper.includes('PROCES') || deptUpper.includes('COORD')) {
        departmentId = 'D1';
      } else if (deptUpper.includes('RECIP') || deptUpper.includes('PROGRAM')) {
        departmentId = 'D2';
      } else if (deptUpper.includes('BOMBA') || deptUpper.includes('CONTROL')) {
        departmentId = 'D3';
      } else if (deptUpper.includes('CAMBIAD') || deptUpper.includes('SEGUR')) {
        departmentId = 'D4';
      } else if (deptUpper.includes('PLANO') || deptUpper.includes('ECONOM')) {
        departmentId = 'D5';
      } else if (deptUpper.includes('MONTA') || deptUpper.includes('CONST')) {
        departmentId = 'D6';
      }

      const dependencies = parseDependenciesString(rawPred);

      tasks.push({
        id,
        name,
        duration,
        departmentId,
        dependencies,
      });
    });

    if (!tasks.length) {
      return { success: false, tasks: [], error: 'No se pudieron extraer tareas válidas del archivo Excel.' };
    }

    return {
      success: true,
      tasks,
      projectName: sheetName,
      warnings,
    };
  } catch (err) {
    return {
      success: false,
      tasks: [],
      error: `Error al procesar el archivo Excel: ${(err as Error).message}`,
    };
  }
}

export function downloadExcelTemplate(): void {
  const wb = XLSX.utils.book_new();

  const data = [
    {
      'ID': 'T01',
      'Nombre de la Actividad': 'Definición de Bases de Diseño y Diagramas de Flujo',
      'Duración (Meses)': 2,
      'Departamento': 'D1',
      'Predecesoras': '',
      'Notas': 'Actividad inicial de procesos. Departamentos: D1 a D6',
    },
    {
      'ID': 'T02',
      'Nombre de la Actividad': 'Especificación y Cálculo de Columnas y Recipientes',
      'Duración (Meses)': 4,
      'Departamento': 'D2',
      'Predecesoras': 'T01(FC+0)',
      'Notas': 'Depende de T01 fin a comienzo',
    },
    {
      'ID': 'T03',
      'Nombre de la Actividad': 'Dimensionado de Bombas y Compresores',
      'Duración (Meses)': 3,
      'Departamento': 'D3',
      'Predecesoras': 'T01(CC+1)',
      'Notas': 'Comienza 1 mes después de empezar T01 (CC+1)',
    },
    {
      'ID': 'T04',
      'Nombre de la Actividad': 'Diseño Térmico de Cambiadores de Calor',
      'Duración (Meses)': 3,
      'Departamento': 'D4',
      'Predecesoras': 'T02(FC+0)',
      'Notas': 'Depende de T02',
    },
    {
      'ID': 'T05',
      'Nombre de la Actividad': 'Maquetación de Trazados y Planos Generales',
      'Duración (Meses)': 5,
      'Departamento': 'D5',
      'Predecesoras': 'T02(FC+0), T03(FC+0)',
      'Notas': 'Múltiples predecesoras separadas por comas',
    },
    {
      'ID': 'T06',
      'Nombre de la Actividad': 'Montaje de Equipos Principales en Planta',
      'Duración (Meses)': 4,
      'Departamento': 'D6',
      'Predecesoras': 'T04(FC+0), T05(FC+0)',
      'Notas': 'Montaje final',
    },
  ];

  const ws = XLSX.utils.json_to_sheet(data);
  ws['!cols'] = [
    { wch: 10 },
    { wch: 45 },
    { wch: 18 },
    { wch: 15 },
    { wch: 25 },
    { wch: 40 },
  ];

  XLSX.utils.book_append_sheet(wb, ws, 'Datos ROY');
  XLSX.writeFile(wb, 'Plantilla_Tareas_ROY.xlsx');
}
