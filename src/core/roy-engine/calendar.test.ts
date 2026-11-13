import { describe, it, expect } from 'vitest';
import {
  isWorkDay,
  getNextWorkDay,
  addWorkDays,
  calculateTaskDates,
  getTimeUnitShort,
  getTimeUnitLabel,
  getTimeHeaderPrefix,
  DEFAULT_PROJECT_CALENDAR,
} from './calendar';

describe('Project Calendar Engine', () => {
  it('correctly identifies work days and weekends/holidays', () => {
    const calendar = {
      ...DEFAULT_PROJECT_CALENDAR,
      workDays: [1, 2, 3, 4, 5], // Lunes a Viernes
      holidays: [{ id: 'h1', date: '2026-10-12', name: 'Fiesta Nacional' }],
    };

    // 2026-10-12 es Lunes, pero es festivo
    const holidayDate = new Date(2026, 9, 12, 12, 0, 0);
    expect(isWorkDay(holidayDate, calendar)).toBe(false);

    // 2026-10-11 es Domingo
    const sundayDate = new Date(2026, 9, 11, 12, 0, 0);
    expect(isWorkDay(sundayDate, calendar)).toBe(false);

    // 2026-10-13 es Martes y laborable
    const tuesdayDate = new Date(2026, 9, 13, 12, 0, 0);
    expect(isWorkDay(tuesdayDate, calendar)).toBe(true);
  });

  it('skips non-work days when adding work days', () => {
    const calendar = {
      ...DEFAULT_PROJECT_CALENDAR,
      workDays: [1, 2, 3, 4, 5], // L-V
      holidays: [{ id: 'h1', date: '2026-10-12', name: 'Festivo Lunes' }],
    };

    // Viernes 2026-10-09
    const friday = new Date('2026-10-09T00:00:00');
    // Añadimos 1 día laborable: salta Sábado (10), Domingo (11) y Lunes festivo (12) -> llega a Martes 13
    const nextWorkDay = addWorkDays(friday, 1, calendar);
    expect(nextWorkDay.getDate()).toBe(13);

    const sunday = new Date('2026-10-11T00:00:00');
    const firstWorkDay = getNextWorkDay(sunday, calendar);
    expect(firstWorkDay.getDate()).toBe(13);
  });

  it('calculates task calendar dates according to timeUnit', () => {
    const calendar = {
      ...DEFAULT_PROJECT_CALENDAR,
      startDate: '2026-01-01',
      timeUnit: 'months' as const,
    };

    const dates = calculateTaskDates(0, 3, calendar);
    expect(dates.startStr).toBe('01/01/2026');
    expect(dates.endStr).toBe('01/04/2026');
  });

  it('formats time labels and header prefixes accurately', () => {
    expect(getTimeUnitShort('days')).toBe('d');
    expect(getTimeUnitShort('weeks')).toBe('sem');
    expect(getTimeUnitShort('months')).toBe('m');

    expect(getTimeHeaderPrefix('days')).toBe('D');
    expect(getTimeHeaderPrefix('weeks')).toBe('S');
    expect(getTimeHeaderPrefix('months')).toBe('M');

    expect(getTimeUnitLabel('days', 1)).toBe('día');
    expect(getTimeUnitLabel('days', 5)).toBe('días');
    expect(getTimeUnitLabel('months', 24)).toBe('meses');
  });
});
