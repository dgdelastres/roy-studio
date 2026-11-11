import { describe, it, expect } from 'vitest';
import { parseDependenciesString, parseProjectJson } from './importProject';

describe('Import Project Utilities', () => {
  describe('parseDependenciesString', () => {
    it('debería retornar array vacío para strings nulos o vacíos', () => {
      expect(parseDependenciesString('')).toEqual([]);
      expect(parseDependenciesString('-')).toEqual([]);
      expect(parseDependenciesString('Ninguna')).toEqual([]);
    });

    it('debería parsear un ID simple con tipo FC por defecto y lag 0', () => {
      const res = parseDependenciesString('T01');
      expect(res).toEqual([{ predecessorId: 'T01', type: 'FC', lag: 0 }]);
    });

    it('debería parsear múltiples IDs separados por comas o punto y coma', () => {
      const res = parseDependenciesString('T01, T02; T03');
      expect(res).toEqual([
        { predecessorId: 'T01', type: 'FC', lag: 0 },
        { predecessorId: 'T02', type: 'FC', lag: 0 },
        { predecessorId: 'T03', type: 'FC', lag: 0 },
      ]);
    });

    it('debería parsear tipos canónicos con retardos positivos y negativos', () => {
      const res = parseDependenciesString('T01(FC+2), T02(CC+1), T03(FF-1), T04(CF+0)');
      expect(res).toEqual([
        { predecessorId: 'T01', type: 'FC', lag: 2 },
        { predecessorId: 'T02', type: 'CC', lag: 1 },
        { predecessorId: 'T03', type: 'FF', lag: -1 },
        { predecessorId: 'T04', type: 'CF', lag: 0 },
      ]);
    });
  });

  describe('parseProjectJson', () => {
    it('debería parsear correctamente un JSON con estructura de ROY Studio', () => {
      const sample = JSON.stringify({
        version: '1.0',
        projectName: 'Prueba Compañeros',
        tasks: [
          {
            id: 'A',
            name: 'Diseño Conceptual',
            duration: 3,
            departmentId: 'D1',
            dependencies: [],
          },
          {
            id: 'B',
            name: 'Cálculo de Equipos',
            duration: 5,
            departmentId: 'D2',
            dependencies: [{ predecessorId: 'A', type: 'FC', lag: 1 }],
          },
        ],
      });

      const result = parseProjectJson(sample);
      expect(result.success).toBe(true);
      expect(result.tasks).toHaveLength(2);
      expect(result.tasks[0].id).toBe('A');
      expect(result.tasks[1].dependencies[0]).toEqual({
        predecessorId: 'A',
        type: 'FC',
        lag: 1,
      });
    });

    it('debería rechazar un JSON inválido o sin tareas', () => {
      const result = parseProjectJson('{"otro": 123}');
      expect(result.success).toBe(false);
      expect(result.tasks).toHaveLength(0);
    });
  });
});
