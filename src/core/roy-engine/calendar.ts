import { ProjectCalendar, TimeUnit } from './types';

export const DEFAULT_PROJECT_CALENDAR: ProjectCalendar = {
  startDate: new Date().toISOString().split('T')[0], // Hoy en formato YYYY-MM-DD
  workDays: [1, 2, 3, 4, 5], // Lunes a Viernes
  holidays: [
    { id: 'h1', date: '2026-01-01', name: 'Año Nuevo' },
    { id: 'h2', date: '2026-05-01', name: 'Día del Trabajo' },
    { id: 'h3', date: '2026-10-12', name: 'Fiesta Nacional' },
    { id: 'h4', date: '2026-12-25', name: 'Navidad' },
  ],
  timeUnit: 'months',
};

export function toLocalDateStr(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Comprueba si una fecha dada (YYYY-MM-DD) es día laborable según el calendario.
 */
export function isWorkDay(date: Date, calendar: ProjectCalendar): boolean {
  const dayOfWeek = date.getDay(); // 0 = Domingo, 1 = Lunes, ..., 6 = Sábado
  if (!calendar.workDays.includes(dayOfWeek)) {
    return false;
  }
  const dateStr = toLocalDateStr(date);
  const isHoliday = calendar.holidays.some(h => h.date === dateStr);
  return !isHoliday;
}

/**
 * Obtiene la siguiente fecha laborable a partir de una fecha dada (inclusive).
 */
export function getNextWorkDay(startDate: Date, calendar: ProjectCalendar): Date {
  const current = new Date(startDate);
  while (!isWorkDay(current, calendar)) {
    current.setDate(current.getDate() + 1);
  }
  return current;
}

/**
 * Añade un número determinado de días laborables a una fecha inicial.
 */
export function addWorkDays(startDate: Date, days: number, calendar: ProjectCalendar): Date {
  if (days <= 0) return new Date(startDate);
  const current = new Date(startDate);
  let added = 0;
  while (added < days) {
    current.setDate(current.getDate() + 1);
    if (isWorkDay(current, calendar)) {
      added++;
    }
  }
  return current;
}

/**
 * Formatea una fecha a DD/MM/YYYY
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d.getTime())) return '';
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

/**
 * Calcula las fechas de inicio y fin de calendario real para un periodo relativo (startPeriod a endPeriod)
 */
export function calculateTaskDates(
  startPeriod: number, // ES o relativo
  endPeriod: number,   // EF o relativo
  calendar: ProjectCalendar
): { startDate: Date; endDate: Date; startStr: string; endStr: string } {
  const base = new Date(calendar.startDate);
  if (isNaN(base.getTime())) {
    base.setTime(Date.now());
  }

  let start = new Date(base);
  let end = new Date(base);

  if (calendar.timeUnit === 'days') {
    // Si la unidad son días laborables
    start = addWorkDays(getNextWorkDay(base, calendar), Math.max(0, Math.floor(startPeriod)), calendar);
    const durationDays = Math.max(0, Math.ceil(endPeriod - startPeriod));
    // El fin es trascurridos los días laborables de duración
    end = durationDays === 0 ? new Date(start) : addWorkDays(start, durationDays, calendar);
  } else if (calendar.timeUnit === 'weeks') {
    // Semanas naturales (7 días por unidad)
    start.setDate(start.getDate() + Math.round(startPeriod * 7));
    end.setDate(end.getDate() + Math.round(endPeriod * 7));
  } else {
    // Meses de calendario (30.4375 días promedio o avance mensual)
    const startMonths = Math.floor(startPeriod);
    const startMonthFrac = startPeriod - startMonths;
    start.setMonth(start.getMonth() + startMonths);
    start.setDate(start.getDate() + Math.round(startMonthFrac * 30));

    const endMonths = Math.floor(endPeriod);
    const endMonthFrac = endPeriod - endMonths;
    end.setMonth(end.getMonth() + endMonths);
    end.setDate(end.getDate() + Math.round(endMonthFrac * 30));
  }

  return {
    startDate: start,
    endDate: end,
    startStr: formatDate(start),
    endStr: formatDate(end),
  };
}

/**
 * Devuelve el sufijo abreviado según la unidad temporal
 */
export function getTimeUnitShort(unit: TimeUnit): string {
  switch (unit) {
    case 'days':
      return 'd';
    case 'weeks':
      return 'sem';
    case 'months':
      return 'm';
    default:
      return 'm';
  }
}

/**
 * Devuelve la etiqueta legible en singular o plural
 */
export function getTimeUnitLabel(unit: TimeUnit, count = 1): string {
  if (count === 1) {
    switch (unit) {
      case 'days':
        return 'día';
      case 'weeks':
        return 'semana';
      case 'months':
        return 'mes';
    }
  } else {
    switch (unit) {
      case 'days':
        return 'días';
      case 'weeks':
        return 'semanas';
      case 'months':
        return 'meses';
    }
  }
  return 'meses';
}

/**
 * Devuelve el prefijo para la cabecera de las columnas temporales (ej: M1, S1, D1)
 */
export function getTimeHeaderPrefix(unit: TimeUnit): string {
  switch (unit) {
    case 'days':
      return 'D';
    case 'weeks':
      return 'S';
    case 'months':
      return 'M';
    default:
      return 'M';
  }
}
