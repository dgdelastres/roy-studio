import { describe, it, expect } from 'vitest';
import { calculateRoy, getCanonicalLag, wouldCreateCycle } from './calculator';
import { Task } from './types';

describe('Roy Engine - Canonical Lag Calculations', () => {
  it('calculates FC (Finish-to-Start) canonical lag correctly', () => {
    // d_i = 5, lag = 2 => l_ij = 7
    expect(getCanonicalLag('FC', 2, 5, 3)).toBe(7);
    // d_i = 5, lag = -1 (lead) => l_ij = 4
    expect(getCanonicalLag('FC', -1, 5, 3)).toBe(4);
  });

  it('calculates CC (Start-to-Start) canonical lag correctly', () => {
    // lag = 3 => l_ij = 3
    expect(getCanonicalLag('CC', 3, 5, 4)).toBe(3);
  });

  it('calculates FF (Finish-to-Finish) canonical lag correctly', () => {
    // d_i = 6, d_j = 4, lag = 1 => 6 - 4 + 1 = 3
    expect(getCanonicalLag('FF', 1, 6, 4)).toBe(3);
  });

  it('calculates CF (Start-to-Finish) canonical lag correctly', () => {
    // d_j = 4, lag = 8 => 8 - 4 = 4
    expect(getCanonicalLag('CF', 8, 5, 4)).toBe(4);
  });
});

describe('Roy Engine - Network Calculations & Critical Path', () => {
  it('correctly calculates a simple sequential network', () => {
    const tasks: Task[] = [
      { id: 'A', name: 'Actividad A', duration: 4, departmentId: 'D1', dependencies: [] },
      { id: 'B', name: 'Actividad B', duration: 6, departmentId: 'D1', dependencies: [{ predecessorId: 'A', type: 'FC', lag: 0 }] },
      { id: 'C', name: 'Actividad C', duration: 5, departmentId: 'D1', dependencies: [{ predecessorId: 'B', type: 'FC', lag: 0 }] },
    ];

    const result = calculateRoy(tasks);

    expect(result.hasCycle).toBe(false);
    expect(result.totalProjectDuration).toBe(15);
    expect(result.criticalTasks).toEqual(['A', 'B', 'C']);

    const taskA = result.taskMap.get('A')!;
    expect(taskA.earlyStart).toBe(0);
    expect(taskA.earlyFinish).toBe(4);
    expect(taskA.lateStart).toBe(0);
    expect(taskA.lateFinish).toBe(4);
    expect(taskA.totalFloat).toBe(0);

    const taskB = result.taskMap.get('B')!;
    expect(taskB.earlyStart).toBe(4);
    expect(taskB.earlyFinish).toBe(10);
    expect(taskB.totalFloat).toBe(0);

    const taskC = result.taskMap.get('C')!;
    expect(taskC.earlyStart).toBe(10);
    expect(taskC.earlyFinish).toBe(15);
    expect(taskC.totalFloat).toBe(0);
  });

  it('correctly calculates parallel paths with float/holguras', () => {
    const tasks: Task[] = [
      { id: 'A', name: 'Diseño Conceptual', duration: 3, departmentId: 'D1', dependencies: [] },
      { id: 'B', name: 'Ruta Larga', duration: 8, departmentId: 'D2', dependencies: [{ predecessorId: 'A', type: 'FC', lag: 0 }] },
      { id: 'C', name: 'Ruta Corta', duration: 2, departmentId: 'D3', dependencies: [{ predecessorId: 'A', type: 'FC', lag: 0 }] },
      { id: 'D', name: 'Integración Final', duration: 4, departmentId: 'D1', dependencies: [
        { predecessorId: 'B', type: 'FC', lag: 0 },
        { predecessorId: 'C', type: 'FC', lag: 0 },
      ]},
    ];

    const result = calculateRoy(tasks);

    expect(result.hasCycle).toBe(false);
    // Ruta A(3) -> B(8) -> D(4) = 15
    // Ruta A(3) -> C(2) -> D(4) = 9
    expect(result.totalProjectDuration).toBe(15);
    expect(result.criticalTasks).toEqual(['A', 'B', 'D']);

    const taskC = result.taskMap.get('C')!;
    expect(taskC.earlyStart).toBe(3);
    expect(taskC.earlyFinish).toBe(5);
    expect(taskC.lateStart).toBe(9); // 15 - 4 - 2 = 9
    expect(taskC.lateFinish).toBe(11);
    expect(taskC.totalFloat).toBe(6); // 9 - 3 = 6
    expect(taskC.freeFloat).toBe(6);  // 11 - (3 + 2) = 6
  });

  it('correctly calculates networks with CC and FF relationships with lags', () => {
    const tasks: Task[] = [
      { id: 'T1', name: 'Ingeniería Básica', duration: 10, departmentId: 'D1', dependencies: [] },
      // T2 puede empezar a las 3 semanas de empezar T1 (CC +3)
      { id: 'T2', name: 'Aprovisionamiento', duration: 8, departmentId: 'D2', dependencies: [
        { predecessorId: 'T1', type: 'CC', lag: 3 }
      ]},
      // T3 debe terminar 2 semanas después de que termine T2 (FF +2)
      { id: 'T3', name: 'Montaje', duration: 6, departmentId: 'D3', dependencies: [
        { predecessorId: 'T2', type: 'FF', lag: 2 }
      ]},
    ];

    const result = calculateRoy(tasks);

    expect(result.hasCycle).toBe(false);
    const t1 = result.taskMap.get('T1')!;
    const t2 = result.taskMap.get('T2')!;
    const t3 = result.taskMap.get('T3')!;

    expect(t1.earlyStart).toBe(0);
    expect(t1.earlyFinish).toBe(10);

    expect(t2.earlyStart).toBe(3);
    expect(t2.earlyFinish).toBe(11); // 3 + 8

    // T3: FF +2 respecto a T2 => EF(T3) >= EF(T2) + 2 = 13 => ES(T3) = 13 - 6 = 7
    expect(t3.earlyStart).toBe(7);
    expect(t3.earlyFinish).toBe(13);

    expect(result.totalProjectDuration).toBe(13);
  });

  it('detects cycles and returns an informative error', () => {
    const tasks: Task[] = [
      { id: 'A', name: 'Tarea A', duration: 2, departmentId: 'D1', dependencies: [{ predecessorId: 'C', type: 'FC', lag: 0 }] },
      { id: 'B', name: 'Tarea B', duration: 3, departmentId: 'D1', dependencies: [{ predecessorId: 'A', type: 'FC', lag: 0 }] },
      { id: 'C', name: 'Tarea C', duration: 4, departmentId: 'D1', dependencies: [{ predecessorId: 'B', type: 'FC', lag: 0 }] },
    ];

    const result = calculateRoy(tasks);
    expect(result.hasCycle).toBe(true);
    expect(result.errors.length).toBeGreaterThan(0);
    expect(result.errors[0]).toContain('Se ha detectado una dependencia circular');
  });

  it('correctly calculates the PILPIS project template within 24 months horizon', async () => {
    const { PILPIS_PROJECT_TASKS } = await import('../../templates/pilpisProject');
    const result = calculateRoy(PILPIS_PROJECT_TASKS);

    expect(result.hasCycle).toBe(false);
    expect(result.errors).toHaveLength(0);
    expect(result.totalProjectDuration).toBeGreaterThan(15);
    expect(result.totalProjectDuration).toBeLessThanOrEqual(24);
    expect(result.criticalTasks.length).toBeGreaterThan(0);
    expect(result.criticalTasks).toContain('T01');
    expect(result.criticalTasks).toContain('T26');
  });

  it('prevents cycle creation with wouldCreateCycle', () => {
    const tasks: Task[] = [
      { id: 'T01', name: 'Tarea 1', duration: 2, departmentId: 'D1', dependencies: [] },
      { id: 'T02', name: 'Tarea 2', duration: 3, departmentId: 'D1', dependencies: [{ predecessorId: 'T01', type: 'FC', lag: 0 }] },
      { id: 'T03', name: 'Tarea 3', duration: 4, departmentId: 'D1', dependencies: [{ predecessorId: 'T02', type: 'FC', lag: 0 }] },
    ];

    // Self loop: T01 -> T01
    expect(wouldCreateCycle(tasks, 'T01', 'T01')).toBe(true);
    // Reverse connection creating cycle: T03 -> T01 (since T01 -> T02 -> T03)
    expect(wouldCreateCycle(tasks, 'T03', 'T01')).toBe(true);
    // Reverse connection creating cycle: T02 -> T01 (since T01 -> T02)
    expect(wouldCreateCycle(tasks, 'T02', 'T01')).toBe(true);
    // Valid new forward connection: T01 -> T03
    expect(wouldCreateCycle(tasks, 'T01', 'T03')).toBe(false);
  });
});
