import { Task, Dependency, DependencyType, RoyCalculationResult, CriticalEdge } from './types';

/**
 * Calcula la ligadura canónica de potencial de Roy l_ij tal que:
 * t_j - t_i >= l_ij
 *
 * @param type Tipo de ligadura (FC, CC, FF, CF)
 * @param lag Retardo o desfase temporal
 * @param durationI Duración de la tarea origen i
 * @param durationJ Duración de la tarea destino j
 */
export function getCanonicalLag(
  type: DependencyType,
  lag: number,
  durationI: number,
  durationJ: number
): number {
  switch (type) {
    case 'FC': // Fin - Comienzo: t_j >= t_i + d_i + lag
      return durationI + lag;
    case 'CC': // Comienzo - Comienzo: t_j >= t_i + lag
      return lag;
    case 'FF': // Fin - Fin: t_j + d_j >= t_i + d_i + lag => t_j - t_i >= d_i - d_j + lag
      return durationI - durationJ + lag;
    case 'CF': // Comienzo - Fin: t_j + d_j >= t_i + lag => t_j - t_i >= lag - d_j
      return lag - durationJ;
    default:
      return durationI + lag;
  }
}

/**
 * Detecta ciclos en la red de tareas mediante el algoritmo de Kahn / DFS.
 */
export function detectCycles(tasks: Task[]): { hasCycle: boolean; cyclePath?: string[] } {
  const taskMap = new Map<string, Task>(tasks.map(t => [t.id, t]));
  const visited = new Map<string, 'unvisited' | 'visiting' | 'visited'>();
  const parent = new Map<string, string>();
  let cycleNodes: string[] = [];

  for (const task of tasks) {
    visited.set(task.id, 'unvisited');
  }

  function dfs(nodeId: string, stack: string[]): boolean {
    visited.set(nodeId, 'visiting');
    const task = taskMap.get(nodeId);

    if (task && task.dependencies) {
      for (const dep of task.dependencies) {
        const predId = dep.predecessorId;
        // Solo verificamos si el predecesor existe en el grafo
        if (!taskMap.has(predId)) continue;

        const predState = visited.get(predId);
        if (predState === 'visiting') {
          // Ciclo detectado
          const cycleStartIndex = stack.indexOf(predId);
          if (cycleStartIndex !== -1) {
            cycleNodes = [...stack.slice(cycleStartIndex), nodeId, predId];
          } else {
            cycleNodes = [predId, nodeId, predId];
          }
          return true;
        }

        if (predState === 'unvisited') {
          parent.set(predId, nodeId);
          if (dfs(predId, [...stack, nodeId])) {
            return true;
          }
        }
      }
    }

    visited.set(nodeId, 'visited');
    return false;
  }

  for (const task of tasks) {
    if (visited.get(task.id) === 'unvisited') {
      if (dfs(task.id, [task.id])) {
        return { hasCycle: true, cyclePath: cycleNodes };
      }
    }
  }

  return { hasCycle: false };
}

/**
 * Comprueba preventivamente si añadir una ligadura (predecessorId -> targetId) crearía un ciclo en el grafo.
 */
export function wouldCreateCycle(tasks: Task[], predecessorId: string, targetId: string): boolean {
  if (predecessorId === targetId) return true;

  const simulatedTasks = tasks.map(t => {
    if (t.id === targetId) {
      const alreadyHas = t.dependencies.some(d => d.predecessorId === predecessorId);
      if (alreadyHas) return t;
      return {
        ...t,
        dependencies: [...t.dependencies, { predecessorId, type: 'FC' as DependencyType, lag: 0 }],
      };
    }
    return t;
  });

  return detectCycles(simulatedTasks).hasCycle;
}

/**
 * Ordenación topológica de las tareas (de predecesoras a sucesoras).
 */
export function topologicalSort(tasks: Task[]): { sorted: string[]; hasCycle: boolean } {
  const taskMap = new Map<string, Task>(tasks.map(t => [t.id, t]));
  const inDegree = new Map<string, number>();
  const successors = new Map<string, string[]>();

  // Inicializar
  for (const task of tasks) {
    inDegree.set(task.id, 0);
    successors.set(task.id, []);
  }

  // Contabilizar grado de entrada
  for (const task of tasks) {
    for (const dep of task.dependencies) {
      if (taskMap.has(dep.predecessorId)) {
        inDegree.set(task.id, (inDegree.get(task.id) || 0) + 1);
        successors.get(dep.predecessorId)?.push(task.id);
      }
    }
  }

  // Cola con nodos con grado de entrada 0
  const queue: string[] = [];
  for (const [id, deg] of inDegree.entries()) {
    if (deg === 0) queue.push(id);
  }

  const sorted: string[] = [];
  while (queue.length > 0) {
    const u = queue.shift()!;
    sorted.push(u);

    for (const v of successors.get(u) || []) {
      const newDeg = (inDegree.get(v) || 0) - 1;
      inDegree.set(v, newDeg);
      if (newDeg === 0) {
        queue.push(v);
      }
    }
  }

  const hasCycle = sorted.length !== tasks.length;
  return { sorted, hasCycle };
}

/**
 * Motor principal de cálculo del Método de los Potenciales de Roy (MPM)
 */
export function calculateRoy(rawTasks: Task[]): RoyCalculationResult {
  const errors: string[] = [];

  if (rawTasks.length === 0) {
    return {
      tasks: [],
      taskMap: new Map(),
      criticalTasks: [],
      criticalEdges: [],
      totalProjectDuration: 0,
      hasCycle: false,
      errors: [],
    };
  }

  // 1. Clonar tareas para no mutar los originales directamente
  const tasks: Task[] = rawTasks.map(t => ({
    ...t,
    dependencies: (t.dependencies || []).map(d => ({ ...d })),
  }));

  const taskMap = new Map<string, Task>(tasks.map(t => [t.id, t]));

  // Validar dependencias inexistentes
  for (const task of tasks) {
    for (const dep of task.dependencies) {
      if (!taskMap.has(dep.predecessorId)) {
        errors.push(`La tarea ${task.id} tiene un predecesor desconocido: ${dep.predecessorId}`);
      }
    }
  }

  // 2. Detección de ciclos
  const cycleCheck = detectCycles(tasks);
  if (cycleCheck.hasCycle) {
    return {
      tasks,
      taskMap,
      criticalTasks: [],
      criticalEdges: [],
      totalProjectDuration: 0,
      hasCycle: true,
      cyclePath: cycleCheck.cyclePath,
      errors: [
        `Se ha detectado una dependencia circular (bucle): ${cycleCheck.cyclePath?.join(' -> ')}`,
        ...errors,
      ],
    };
  }

  // 3. Ordenación topológica
  const { sorted } = topologicalSort(tasks);

  // Mapear sucesores
  const successorsMap = new Map<string, Array<{ targetId: string; dep: Dependency }>>();
  for (const task of tasks) {
    successorsMap.set(task.id, []);
  }
  for (const task of tasks) {
    for (const dep of task.dependencies) {
      if (taskMap.has(dep.predecessorId)) {
        successorsMap.get(dep.predecessorId)?.push({ targetId: task.id, dep });
      }
    }
  }

  // 4. PASO HACIA ADELANTE (Forward Pass) - Cálculo de ES y EF y Niveles
  const levelMap = new Map<string, number>();
  for (const id of sorted) {
    const task = taskMap.get(id)!;
    let maxES = 0;
    let maxLevel = 0;

    const validDeps = task.dependencies.filter(d => taskMap.has(d.predecessorId));
    if (validDeps.length > 0) {
      for (const dep of validDeps) {
        const pred = taskMap.get(dep.predecessorId)!;
        const l_ij = getCanonicalLag(dep.type, dep.lag, pred.duration, task.duration);
        const candidateES = (pred.earlyStart ?? 0) + l_ij;
        if (candidateES > maxES) {
          maxES = candidateES;
        }
        const predLevel = levelMap.get(pred.id) ?? 0;
        if (predLevel + 1 > maxLevel) {
          maxLevel = predLevel + 1;
        }
      }
    }

    task.earlyStart = Math.max(0, maxES);
    task.earlyFinish = task.earlyStart + task.duration;
    task.level = maxLevel;
    levelMap.set(id, maxLevel);
  }

  // Duración total del proyecto D = max(EF_j)
  let totalProjectDuration = 0;
  for (const task of tasks) {
    if ((task.earlyFinish ?? 0) > totalProjectDuration) {
      totalProjectDuration = task.earlyFinish ?? 0;
    }
  }

  // 5. PASO HACIA ATRÁS (Backward Pass) - Cálculo de LS y LF
  // Recorremos en orden inverso
  const reversed = [...sorted].reverse();

  for (const id of reversed) {
    const task = taskMap.get(id)!;
    const succList = successorsMap.get(id) || [];

    if (succList.length === 0) {
      // Tarea terminal (sin sucesoras): su fin tardío es el fin del proyecto
      task.lateFinish = totalProjectDuration;
      task.lateStart = task.lateFinish - task.duration;
    } else {
      let minLS = Number.POSITIVE_INFINITY;
      for (const succ of succList) {
        const target = taskMap.get(succ.targetId)!;
        const l_ij = getCanonicalLag(succ.dep.type, succ.dep.lag, task.duration, target.duration);
        const candidateLS = (target.lateStart ?? totalProjectDuration) - l_ij;
        if (candidateLS < minLS) {
          minLS = candidateLS;
        }
      }
      task.lateStart = minLS;
      task.lateFinish = task.lateStart + task.duration;
    }
  }

  // 6. CÁLCULO DE HOLGURAS (Total y Libre) Y CAMINO CRÍTICO
  const EPSILON = 1e-4;
  const criticalTasks: string[] = [];
  const criticalEdges: CriticalEdge[] = [];

  for (const task of tasks) {
    const es = task.earlyStart ?? 0;
    const ef = task.earlyFinish ?? 0;
    const ls = task.lateStart ?? 0;

    // Holgura Total: HT = LS - ES = LF - EF
    const totalFloat = ls - es;
    task.totalFloat = Math.abs(totalFloat) < EPSILON ? 0 : Number(totalFloat.toFixed(2));

    // Holgura Libre: HL = min(ES_siguiente - (ES_i + l_ij))
    const succList = successorsMap.get(task.id) || [];
    if (succList.length === 0) {
      task.freeFloat = Math.max(0, Number((totalProjectDuration - ef).toFixed(2)));
    } else {
      let minFree = Number.POSITIVE_INFINITY;
      for (const succ of succList) {
        const target = taskMap.get(succ.targetId)!;
        const l_ij = getCanonicalLag(succ.dep.type, succ.dep.lag, task.duration, target.duration);
        const slack = (target.earlyStart ?? 0) - (es + l_ij);
        if (slack < minFree) {
          minFree = slack;
        }
      }
      task.freeFloat = Math.max(0, Math.abs(minFree) < EPSILON ? 0 : Number(minFree.toFixed(2)));
    }

    // Tarea Crítica: HT == 0
    const isCrit = Math.abs(task.totalFloat) < EPSILON;
    task.isCritical = isCrit;
    if (isCrit) {
      criticalTasks.push(task.id);
    }
  }

  // Identificar Aristas Críticas:
  // Una arista (i -> j) es crítica si i es crítica, j es crítica y la ligadura está tensa:
  // ES_j == ES_i + l_ij
  for (const task of tasks) {
    for (const dep of task.dependencies) {
      const pred = taskMap.get(dep.predecessorId);
      if (pred && pred.isCritical && task.isCritical) {
        const l_ij = getCanonicalLag(dep.type, dep.lag, pred.duration, task.duration);
        const condition = Math.abs((task.earlyStart ?? 0) - ((pred.earlyStart ?? 0) + l_ij)) < EPSILON;
        if (condition) {
          criticalEdges.push({
            source: pred.id,
            target: task.id,
          });
        }
      }
    }
  }

  return {
    tasks,
    taskMap,
    criticalTasks,
    criticalEdges,
    totalProjectDuration,
    hasCycle: false,
    errors,
  };
}
