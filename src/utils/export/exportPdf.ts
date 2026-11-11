import jsPDF from 'jspdf';
import { Task } from '../../core/roy-engine/types';
import { getDepartmentById } from '../../theme/departments';

export function exportProjectReportPdf(
  tasks: Task[],
  totalDuration: number,
  criticalTasks: string[],
  projectName = 'ANTEPROYECTO PILPIS - QUIMISUR'
): void {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  doc.setFillColor(30, 41, 59);
  doc.rect(0, 0, pageWidth, 24, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('PILPIS, S.A. — OFICINA TÉCNICA DE PROYECTOS', 14, 11);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('LIBRO II: PROGRAMACIÓN DEL PROYECTO (MÉTODO ROY / MPM)', 14, 18);

  doc.setFontSize(9);
  doc.text(`Fecha: ${new Date().toLocaleDateString('es-ES')}`, pageWidth - 14, 11, { align: 'right' });
  doc.text('Cliente: QUIMISUR (Cádiz)', pageWidth - 14, 18, { align: 'right' });

  let y = 32;
  doc.setFillColor(241, 245, 249);
  doc.roundedRect(14, y, pageWidth - 28, 16, 2, 2, 'F');
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(14, y, pageWidth - 28, 16, 2, 2, 'D');

  doc.setTextColor(15, 23, 42);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text(`PROYECTO: ${projectName}`, 18, y + 6);

  doc.setFont('helvetica', 'normal');
  doc.text(
    `Duración Total: ${totalDuration} meses  |  Total Actividades: ${tasks.length}  |  Actividades Críticas: ${criticalTasks.length}  |  Horizonte Contractual: 24 meses`,
    18,
    y + 12
  );

  y = 53;
  const colX = [14, 28, 110, 150, 168, 205, 218, 231, 244, 257, 270];
  const headers = ['ID', 'ACTIVIDAD / ENTREGABLE', 'DPTO', 'DUR (m)', 'PREDECESORAS', 'ES', 'EF', 'LS', 'LF', 'HT', 'CRÍT'];

  doc.setFillColor(37, 99, 235);
  doc.rect(14, y, pageWidth - 28, 7, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');

  headers.forEach((h, idx) => {
    doc.text(h, colX[idx], y + 4.8);
  });

  y += 7;
  doc.setFontSize(7.5);

  tasks.forEach((t, i) => {
    if (y > pageHeight - 15) {
      doc.addPage();
      y = 15;
      doc.setFillColor(37, 99, 235);
      doc.rect(14, y, pageWidth - 28, 7, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      headers.forEach((h, idx) => {
        doc.text(h, colX[idx], y + 4.8);
      });
      y += 7;
      doc.setFontSize(7.5);
    }

    const dept = getDepartmentById(t.departmentId);
    const isCrit = t.isCritical;

    if (isCrit) {
      doc.setFillColor(254, 242, 242);
      doc.rect(14, y, pageWidth - 28, 6.2, 'F');
    } else if (i % 2 === 1) {
      doc.setFillColor(248, 250, 252);
      doc.rect(14, y, pageWidth - 28, 6.2, 'F');
    }

    doc.setTextColor(isCrit ? 185 : 30, isCrit ? 28 : 41, isCrit ? 28 : 59);
    doc.setFont('helvetica', isCrit ? 'bold' : 'normal');

    const preds = t.dependencies.map(d => `${d.predecessorId}(${d.type}${d.lag !== 0 ? (d.lag > 0 ? `+${d.lag}` : d.lag) : ''})`).join(', ');

    doc.text(t.id, colX[0], y + 4.2);
    doc.text(t.name.slice(0, 48), colX[1], y + 4.2);
    doc.text(dept.code, colX[2], y + 4.2);
    doc.text(`${t.duration}`, colX[3], y + 4.2);
    doc.text(preds || '—', colX[4], y + 4.2);
    doc.text(`${t.earlyStart ?? 0}`, colX[5], y + 4.2);
    doc.text(`${t.earlyFinish ?? 0}`, colX[6], y + 4.2);
    doc.text(`${t.lateStart ?? 0}`, colX[7], y + 4.2);
    doc.text(`${t.lateFinish ?? 0}`, colX[8], y + 4.2);
    doc.text(`${t.totalFloat ?? 0}`, colX[9], y + 4.2);
    doc.text(isCrit ? 'SÍ' : 'No', colX[10], y + 4.2);

    y += 6.2;
  });

  const pageCount = doc.internal.pages.length - 1;
  for (let p = 1; p <= pageCount; p++) {
    doc.setPage(p);
    doc.setFontSize(7);
    doc.setTextColor(100, 116, 139);
    doc.text(
      `ROY Studio — PILPIS S.A. | Documento Técnico de Entrega | Página ${p} de ${pageCount}`,
      pageWidth / 2,
      pageHeight - 6,
      { align: 'center' }
    );
  }

  doc.save(`Informe_Programacion_${projectName.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`);
}
