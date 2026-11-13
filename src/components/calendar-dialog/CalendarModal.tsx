import React, { useState } from 'react';
import { ProjectCalendar, TimeUnit, Holiday } from '../../core/roy-engine/types';
import { DEFAULT_PROJECT_CALENDAR, formatDate } from '../../core/roy-engine/calendar';
import { Calendar as CalendarIcon, Plus, Trash2, X, Check } from 'lucide-react';

interface CalendarModalProps {
  isOpen: boolean;
  onClose: () => void;
  calendar: ProjectCalendar;
  onSaveCalendar: (calendar: ProjectCalendar) => void;
}

const WEEK_DAYS = [
  { id: 1, name: 'Lunes', short: 'L' },
  { id: 2, name: 'Martes', short: 'M' },
  { id: 3, name: 'Miércoles', short: 'X' },
  { id: 4, name: 'Jueves', short: 'J' },
  { id: 5, name: 'Viernes', short: 'V' },
  { id: 6, name: 'Sábado', short: 'S' },
  { id: 0, name: 'Domingo', short: 'D' },
];

export const CalendarModal: React.FC<CalendarModalProps> = ({
  isOpen,
  onClose,
  calendar,
  onSaveCalendar,
}) => {
  const [startDate, setStartDate] = useState<string>(calendar.startDate);
  const [timeUnit, setTimeUnit] = useState<TimeUnit>(calendar.timeUnit);
  const [workDays, setWorkDays] = useState<number[]>([...calendar.workDays]);
  const [holidays, setHolidays] = useState<Holiday[]>([...calendar.holidays]);

  // Formulario nuevo festivo
  const [newHolidayDate, setNewHolidayDate] = useState<string>('');
  const [newHolidayName, setNewHolidayName] = useState<string>('');

  if (!isOpen) return null;

  const handleToggleWorkDay = (dayId: number) => {
    setWorkDays(prev => {
      if (prev.includes(dayId)) {
        if (prev.length <= 1) return prev; // Al menos 1 día laboral
        return prev.filter(d => d !== dayId);
      } else {
        return [...prev, dayId].sort((a, b) => a - b);
      }
    });
  };

  const handleAddHoliday = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHolidayDate || !newHolidayName.trim()) return;

    const newH: Holiday = {
      id: `h_${Date.now()}`,
      date: newHolidayDate,
      name: newHolidayName.trim(),
    };

    setHolidays(prev => [...prev, newH].sort((a, b) => a.date.localeCompare(b.date)));
    setNewHolidayDate('');
    setNewHolidayName('');
  };

  const handleDeleteHoliday = (id: string) => {
    setHolidays(prev => prev.filter(h => h.id !== id));
  };

  const handleResetDefaults = () => {
    if (confirm('¿Restablecer el calendario y jornada a los valores por defecto?')) {
      setStartDate(DEFAULT_PROJECT_CALENDAR.startDate);
      setTimeUnit(DEFAULT_PROJECT_CALENDAR.timeUnit);
      setWorkDays([...DEFAULT_PROJECT_CALENDAR.workDays]);
      setHolidays([...DEFAULT_PROJECT_CALENDAR.holidays]);
    }
  };

  const handleSave = () => {
    onSaveCalendar({
      startDate,
      timeUnit,
      workDays,
      holidays,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Encabezado */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/80 dark:bg-slate-800/40">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-100 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400">
              <CalendarIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                Calendario del Proyecto y Escala Temporal
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Configura la fecha de inicio, la unidad de duración, días laborables y festivos
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Contenido scrolleable */}
        <div className="p-6 space-y-6 overflow-y-auto text-xs text-slate-700 dark:text-slate-300">
          {/* Fila 1: Fecha de Inicio y Unidad Temporal */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Fecha de Inicio del Proyecto
              </label>
              <input
                type="date"
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 font-mono text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              />
              <p className="mt-1 text-[10px] text-slate-400">
                Punto cero (ES = 0) para el cálculo de fechas de calendario
              </p>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Unidad Temporal de Duración
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {(['months', 'weeks', 'days'] as const).map(unit => (
                  <button
                    key={unit}
                    type="button"
                    onClick={() => setTimeUnit(unit)}
                    className={`py-2 px-2 rounded-lg border text-xs font-semibold flex items-center justify-center transition-all ${
                      timeUnit === unit
                        ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 shadow-xs'
                        : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/80'
                    }`}
                  >
                    {unit === 'months' ? 'Meses (m)' : unit === 'weeks' ? 'Semanas (sem)' : 'Días (d)'}
                  </button>
                ))}
              </div>
              <p className="mt-1 text-[10px] text-slate-400">
                Escala aplicada a duraciones, ligaduras y diagramas
              </p>
            </div>
          </div>

          {/* Fila 2: Jornada Laboral Semanal */}
          <div>
            <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Jornada Laboral (Días Hábiles)
            </label>
            <div className="flex flex-wrap gap-2">
              {WEEK_DAYS.map(day => {
                const isSelected = workDays.includes(day.id);
                return (
                  <button
                    key={day.id}
                    type="button"
                    onClick={() => handleToggleWorkDay(day.id)}
                    className={`px-3 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition-all ${
                      isSelected
                        ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300'
                        : 'border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 line-through opacity-70'
                    }`}
                  >
                    {isSelected && <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />}
                    <span>{day.name}</span>
                  </button>
                );
              })}
            </div>
            <p className="mt-1.5 text-[10px] text-slate-400">
              Los días tachados se consideran fines de semana/descanso y se omiten en la proyección de días hábiles.
            </p>
          </div>

          {/* Fila 3: Días Festivos / Paradas Técnicas */}
          <div className="border-t border-slate-200 dark:border-slate-800 pt-4">
            <div className="flex items-center justify-between mb-2">
              <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                Días Festivos e Inhábiles ({holidays.length})
              </label>
              <span className="text-[10px] text-slate-400">
                Se saltarán automáticamente en el cómputo de fechas
              </span>
            </div>

            {/* Añadir nuevo festivo */}
            <form onSubmit={handleAddHoliday} className="flex gap-2 mb-3">
              <input
                type="date"
                value={newHolidayDate}
                onChange={e => setNewHolidayDate(e.target.value)}
                className="px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-100 focus:ring-1 focus:ring-blue-500 focus:outline-hidden"
              />
              <input
                type="text"
                placeholder="Nombre del festivo (ej: Año Nuevo, Parada de planta...)"
                value={newHolidayName}
                onChange={e => setNewHolidayName(e.target.value)}
                className="flex-1 px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-100 focus:ring-1 focus:ring-blue-500 focus:outline-hidden"
              />
              <button
                type="submit"
                disabled={!newHolidayDate || !newHolidayName.trim()}
                className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Añadir</span>
              </button>
            </form>

            {/* Lista de festivos */}
            <div className="max-h-40 overflow-y-auto rounded-xl border border-slate-200 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800">
              {holidays.length === 0 ? (
                <div className="p-3 text-center text-slate-400 text-xs">
                  No hay días festivos configurados
                </div>
              ) : (
                holidays.map(h => (
                  <div
                    key={h.id}
                    className="px-3 py-2 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[11px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-1.5 py-0.5 rounded">
                        {formatDate(h.date)}
                      </span>
                      <span className="font-medium text-slate-700 dark:text-slate-200">{h.name}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDeleteHoliday(h.id)}
                      className="p-1 text-slate-400 hover:text-red-500 dark:hover:text-red-400 rounded transition-colors"
                      title="Eliminar festivo"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Pie de modal */}
        <div className="px-6 py-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/80 flex items-center justify-between">
          <button
            type="button"
            onClick={handleResetDefaults}
            className="text-[11px] text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 font-medium underline"
          >
            Restablecer por defecto
          </button>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-colors"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-colors shadow-sm cursor-pointer"
            >
              Guardar Configuración
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
