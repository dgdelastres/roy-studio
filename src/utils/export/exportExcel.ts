import * as XLSX from 'xlsx';
import { Task } from '../../core/roy-engine/types';
import { getDepartmentById } from '../../theme/departments';

export function exportTasksToExcel(tasks: Task[], projectName = 'PILPIS - QUIMISUR'): void {
  const rows = tasks.map(t => {
    const dept = getDepartmentById(t.departmentId);
    const predsString = t.dependencies
      .map(d => `${d.predecessorId} (${d.type}${d.lag !== 0 ? (d.lag > 0 ? ` +${d.lag}` : ` ${d.lag}`) : ''})`)
      .join(', ');

    return {
      'ID Tarea': t.id,
      'Actividad / Entregable': t.name,
      'Departamento': `${dept.code} - ${dept.name}`,
      'Duración (meses)': t.duration,
      'Predecesoras y Ligaduras': predsString || '— (Inicio)',
      'Inicio Temprano (ES)': t.earlyStart ?? 0,
      'Fin Temprano (EF)': t.earlyFinish ?? 0,
      'Inicio Tardío (LS)': t.lateStart ?? 0,
      'Fin Tardío (LF)': t.lateFinish ?? 0,
      'Holgura Total (HT)': t.totalFloat ?? 0,
      'Holgura Libre (HL)': t.freeFloat ?? 0,
      'Camino Crítico': t.isCritical ? 'SÍ (CRÍTICA)' : 'No',
    };
  });

  const worksheet = XLSX.utils.json_to_sheet(rows);

  const colWidths = [
    { wch: 10 },
    { wch: 45 },
    { wch: 35 },
    { wch: 16 },
    { wch: 25 },
    { wch: 20 },
    { wch: 18 },
    { wch: 18 },
    { wch: 18 },
    { wch: 18 },
    { wch: 18 },
    { wch: 16 },
  ];
  worksheet['!cols'] = colWidths;

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Programación ROY');

  const fileName = `Programacion_ROY_${projectName.replace(/[^a-zA-Z0-9]/g, '_')}.xlsx`;
  XLSX.writeFile(workbook, fileName);
}
