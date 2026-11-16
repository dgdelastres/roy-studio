import React, { useState, useMemo } from 'react';
import { Task, Department, ProjectCalendar } from '../../core/roy-engine/types';
import { calculateTaskDates, getTimeUnitLabel, toLocalDateStr } from '../../core/roy-engine/calendar';
import { getDepartmentById } from '../../theme/departments';
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Filter,
  Grid,
  List,
  Sparkles,
  Flame,
  Briefcase,
  Users,
} from 'lucide-react';

interface CalendarViewProps {
  tasks: Task[];
  departments: Department[];
  calendar: ProjectCalendar;
  onEditTask: (task: Task) => void;
}

interface ProcessedTask {
  task: Task;
  startDate: Date;
  endDate: Date;
  startStr: string;
  endStr: string;
  department: Department;
  isCritical: boolean;
}

const MONTH_NAMES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

const WEEKDAY_NAMES = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

export const CalendarView: React.FC<CalendarViewProps> = ({
  tasks,
  departments,
  calendar,
  onEditTask,
}) => {
  // Inicializar fecha seleccionada con la fecha de inicio del proyecto
  const initialDate = useMemo(() => {
    const d = new Date(calendar.startDate);
    return isNaN(d.getTime()) ? new Date() : d;
  }, [calendar.startDate]);

  const [currentYear, setCurrentYear] = useState<number>(initialDate.getFullYear());
  const [currentMonth, setCurrentMonth] = useState<number>(initialDate.getMonth()); // 0 - 11
  const [viewFormat, setViewFormat] = useState<'grid' | 'agenda'>('grid');
  const [selectedDeptId, setSelectedDeptId] = useState<string>('ALL');
  const [criticalOnly, setCriticalOnly] = useState<boolean>(false);
  const [selectedDayNumber, setSelectedDayNumber] = useState<number | null>(null);

  // Procesar todas las tareas con sus fechas reales de calendario proyectadas
  const processedTasks: ProcessedTask[] = useMemo(() => {
    return tasks.map(task => {
      const dates = calculateTaskDates(task.earlyStart || 0, task.earlyFinish || 0, calendar);
      const department = getDepartmentById(task.departmentId, departments);
      const isCritical = task.isCritical ?? (task.totalFloat === 0);
      return {
        task,
        startDate: dates.startDate,
        endDate: dates.endDate,
        startStr: dates.startStr,
        endStr: dates.endStr,
        department,
        isCritical,
      };
    });
  }, [tasks, departments, calendar]);

  // Navegación de meses
  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(prev => prev - 1);
    } else {
      setCurrentMonth(prev => prev - 1);
    }
    setSelectedDayNumber(null);
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(prev => prev + 1);
    } else {
      setCurrentMonth(prev => prev + 1);
    }
    setSelectedDayNumber(null);
  };

  const handleGoToProjectStart = () => {
    setCurrentYear(initialDate.getFullYear());
    setCurrentMonth(initialDate.getMonth());
    setSelectedDayNumber(null);
  };

  const handleGoToToday = () => {
    const today = new Date();
    setCurrentYear(today.getFullYear());
    setCurrentMonth(today.getMonth());
    setSelectedDayNumber(today.getDate());
  };

  // Límites del mes actual
  const monthStart = useMemo(() => new Date(currentYear, currentMonth, 1, 0, 0, 0), [currentYear, currentMonth]);
  const monthEnd = useMemo(() => new Date(currentYear, currentMonth + 1, 0, 23, 59, 59), [currentYear, currentMonth]);
  const daysInCurrentMonth = useMemo(() => new Date(currentYear, currentMonth + 1, 0).getDate(), [currentYear, currentMonth]);

  // Tareas activas en el mes actual
  const tasksInMonth = useMemo(() => {
    return processedTasks.filter(pt => {
      const overlapsMonth = pt.endDate >= monthStart && pt.startDate <= monthEnd;
      if (!overlapsMonth) return false;
      if (selectedDeptId !== 'ALL' && pt.task.departmentId !== selectedDeptId) return false;
      if (criticalOnly && !pt.isCritical) return false;
      return true;
    });
  }, [processedTasks, monthStart, monthEnd, selectedDeptId, criticalOnly]);

  // Conteo de tareas por departamento activas en este mes (para las pills de filtro)
  const deptCountsInMonth = useMemo(() => {
    const counts: Record<string, number> = {};
    processedTasks.forEach(pt => {
      if (pt.endDate >= monthStart && pt.startDate <= monthEnd) {
        if (!criticalOnly || pt.isCritical) {
          counts[pt.task.departmentId] = (counts[pt.task.departmentId] || 0) + 1;
        }
      }
    });
    return counts;
  }, [processedTasks, monthStart, monthEnd, criticalOnly]);

  // Departamentos activos en este mes
  const activeDepartments = useMemo(() => {
    return departments.filter(d => (deptCountsInMonth[d.id] || 0) > 0);
  }, [departments, deptCountsInMonth]);

  // Construcción de la cuadrícula de días (Grid 7x5 o 7x6)
  const gridCells = useMemo(() => {
    // 0 = Domingo, 1 = Lunes, ..., 6 = Sábado
    // Ajustar para que Lunes sea 0 y Domingo sea 6
    const firstDayOfWeek = (new Date(currentYear, currentMonth, 1).getDay() + 6) % 7;
    const daysInPrevMonth = new Date(currentYear, currentMonth, 0).getDate();

    const cells: Array<{
      dayNumber: number;
      isCurrentMonth: boolean;
      date: Date;
      dateStr: string;
      isWorkDay: boolean;
      holidayName?: string;
      tasks: ProcessedTask[];
    }> = [];

    // Días del mes anterior (padding inicial)
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      const dNum = daysInPrevMonth - i;
      const d = new Date(currentYear, currentMonth - 1, dNum);
      const dateStr = toLocalDateStr(d);
      cells.push({
        dayNumber: dNum,
        isCurrentMonth: false,
        date: d,
        dateStr,
        isWorkDay: false,
        tasks: [],
      });
    }

    // Días del mes actual
    for (let dNum = 1; dNum <= daysInCurrentMonth; dNum++) {
      const d = new Date(currentYear, currentMonth, dNum);
      const dateStr = toLocalDateStr(d);
      const dayOfWeek = d.getDay();
      const isWork = calendar.workDays.includes(dayOfWeek);
      const holiday = calendar.holidays.find(h => h.date === dateStr);

      // Tareas que caen o están activas en este día específico
      const dayStart = new Date(currentYear, currentMonth, dNum, 0, 0, 0).getTime();
      const dayEnd = new Date(currentYear, currentMonth, dNum, 23, 59, 59).getTime();

      const dayTasks = tasksInMonth.filter(pt => {
        return pt.endDate.getTime() >= dayStart && pt.startDate.getTime() <= dayEnd;
      });

      cells.push({
        dayNumber: dNum,
        isCurrentMonth: true,
        date: d,
        dateStr,
        isWorkDay: isWork && !holiday,
        holidayName: holiday?.name,
        tasks: dayTasks,
      });
    }

    // Días del mes siguiente (padding final hasta múltiplo de 7)
    const remaining = (7 - (cells.length % 7)) % 7;
    for (let i = 1; i <= remaining; i++) {
      const d = new Date(currentYear, currentMonth + 1, i);
      const dateStr = toLocalDateStr(d);
      cells.push({
        dayNumber: i,
        isCurrentMonth: false,
        date: d,
        dateStr,
        isWorkDay: false,
        tasks: [],
      });
    }

    return cells;
  }, [currentYear, currentMonth, daysInCurrentMonth, calendar, tasksInMonth]);

  // Tareas para el día actualmente seleccionado (drawer de detalle)
  const selectedDayCell = useMemo(() => {
    if (selectedDayNumber === null) return null;
    return gridCells.find(c => c.isCurrentMonth && c.dayNumber === selectedDayNumber);
  }, [gridCells, selectedDayNumber]);

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 overflow-hidden select-none">
      {/* Barra Superior del Calendario: Navegación de Meses, Filtros y Conmutador de Vista */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-3.5 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-xs z-10">
        {/* Controles de Navegación Temporal */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-xl p-0.5 border border-slate-200 dark:border-slate-700">
            <button
              onClick={handlePrevMonth}
              className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
              title="Mes Anterior"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="px-3 py-1 font-bold text-sm min-w-[150px] text-center text-slate-900 dark:text-white">
              {MONTH_NAMES[currentMonth]} {currentYear}
            </div>
            <button
              onClick={handleNextMonth}
              className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
              title="Mes Siguiente"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={handleGoToProjectStart}
            className="px-2.5 py-1.5 rounded-xl border border-blue-200 dark:border-blue-900 bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 dark:hover:bg-blue-900/60 text-blue-700 dark:text-blue-300 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Ir al mes de inicio oficial del proyecto"
          >
            <CalendarDays className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span>Inicio Proyecto</span>
          </button>

          <button
            onClick={handleGoToToday}
            className="px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-colors cursor-pointer"
            title="Ir al mes actual del sistema"
          >
            Hoy
          </button>
        </div>

        {/* Resumen KPI del Mes */}
        <div className="hidden xl:flex items-center gap-4 bg-slate-100/70 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700/80 px-3.5 py-1.5 rounded-xl text-xs font-mono">
          <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
            <Briefcase className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span>Activas:</span>
            <span className="font-bold text-slate-900 dark:text-white">{tasksInMonth.length}</span>
          </div>
          <div className="h-3 w-px bg-slate-300 dark:bg-slate-700" />
          <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
            <Users className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span>Dptos:</span>
            <span className="font-bold text-slate-900 dark:text-white">{activeDepartments.length}</span>
          </div>
          <div className="h-3 w-px bg-slate-300 dark:bg-slate-700" />
          <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
            <Flame className="w-3.5 h-3.5 text-red-500" />
            <span>Críticas:</span>
            <span className="font-bold text-red-600 dark:text-red-400">
              {tasksInMonth.filter(t => t.isCritical).length}
            </span>
          </div>
        </div>

        {/* Conmutador de Vista (Cuadrícula vs Agenda) y Filtros Rápidos */}
        <div className="flex items-center gap-2">
          {/* Toggle Camino Crítico */}
          <button
            onClick={() => setCriticalOnly(prev => !prev)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
              criticalOnly
                ? 'bg-red-50 dark:bg-red-950/60 border-red-300 dark:border-red-800 text-red-700 dark:text-red-300 ring-2 ring-red-500/20'
                : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
            title="Mostrar únicamente las tareas que forman parte del camino crítico (HT = 0)"
          >
            <Flame className={`w-3.5 h-3.5 ${criticalOnly ? 'text-red-600' : 'text-slate-400'}`} />
            <span>Solo Críticas</span>
          </button>

          {/* Selector de Modo Cuadrícula vs Agenda */}
          <div className="flex items-center p-0.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs">
            <button
              onClick={() => setViewFormat('grid')}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition-all cursor-pointer font-semibold ${
                viewFormat === 'grid'
                  ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
              title="Vista de Almanaque Mensual con cuadrícula de días"
            >
              <Grid className="w-3.5 h-3.5" />
              <span>Cuadrícula</span>
            </button>
            <button
              onClick={() => setViewFormat('agenda')}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition-all cursor-pointer font-semibold ${
                viewFormat === 'agenda'
                  ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
              title="Vista de Agenda con lista cronológica y desglose por departamento"
            >
              <List className="w-3.5 h-3.5" />
              <span>Agenda</span>
            </button>
          </div>
        </div>
      </div>

      {/* Barra de Filtro de Departamentos (Pills) */}
      <div className="flex items-center gap-2 px-6 py-2 bg-slate-100/60 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800 overflow-x-auto text-xs no-scrollbar">
        <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400 font-semibold shrink-0 mr-1">
          <Filter className="w-3.5 h-3.5" />
          <span>Departamento:</span>
        </div>

        <button
          onClick={() => setSelectedDeptId('ALL')}
          className={`px-3 py-1 rounded-full font-semibold text-xs transition-all shrink-0 cursor-pointer ${
            selectedDeptId === 'ALL'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
          }`}
        >
          Todos ({tasks.length})
        </button>

        {departments.map(dept => {
          const countInMonth = deptCountsInMonth[dept.id] || 0;
          const isSelected = selectedDeptId === dept.id;
          return (
            <button
              key={dept.id}
              onClick={() => setSelectedDeptId(isSelected ? 'ALL' : dept.id)}
              style={{
                backgroundColor: isSelected ? dept.color : undefined,
                borderColor: dept.border,
                color: isSelected ? '#FFFFFF' : undefined,
              }}
              className={`px-3 py-1 rounded-full font-semibold text-xs border transition-all shrink-0 flex items-center gap-1.5 cursor-pointer ${
                isSelected
                  ? 'shadow-xs'
                  : 'bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200'
              }`}
            >
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: isSelected ? '#FFFFFF' : dept.color }}
              />
              <span>{dept.code}</span>
              <span className={`text-[10px] px-1 rounded-full ${isSelected ? 'bg-black/20 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400'}`}>
                {countInMonth}
              </span>
            </button>
          );
        })}
      </div>

      {/* Contenido Principal: Cuadrícula Mensual o Lista de Agenda */}
      <div className="flex-1 flex overflow-hidden">
        {viewFormat === 'grid' ? (
          <div className="flex-1 flex flex-col p-4 overflow-y-auto">
            {/* Cabecera de Días de la Semana */}
            <div className="grid grid-cols-7 gap-1.5 mb-1.5">
              {WEEKDAY_NAMES.map((name, idx) => (
                <div
                  key={name}
                  className={`py-2 text-center text-xs font-bold uppercase tracking-wider rounded-lg ${
                    idx >= 5
                      ? 'text-slate-400 dark:text-slate-500 bg-slate-100/50 dark:bg-slate-900/40'
                      : 'text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800/80'
                  }`}
                >
                  {name}
                </div>
              ))}
            </div>

            {/* Celdas del Calendario */}
            <div className="grid grid-cols-7 gap-1.5 flex-1 auto-rows-fr">
              {gridCells.map((cell, idx) => {
                const isSelected = selectedDayNumber === cell.dayNumber && cell.isCurrentMonth;
                const hasHoliday = !!cell.holidayName;
                const isToday =
                  cell.isCurrentMonth &&
                  new Date().getDate() === cell.dayNumber &&
                  new Date().getMonth() === currentMonth &&
                  new Date().getFullYear() === currentYear;

                return (
                  <div
                    key={idx}
                    onClick={() => {
                      if (cell.isCurrentMonth) {
                        setSelectedDayNumber(prev => (prev === cell.dayNumber ? null : cell.dayNumber));
                      }
                    }}
                    className={`min-h-[110px] p-1.5 rounded-xl border flex flex-col justify-between transition-all cursor-pointer relative group ${
                      !cell.isCurrentMonth
                        ? 'bg-slate-100/40 dark:bg-slate-900/20 border-slate-200/50 dark:border-slate-800/40 opacity-40'
                        : isSelected
                        ? 'bg-blue-50/80 dark:bg-blue-950/30 border-blue-500 ring-2 ring-blue-500/20 shadow-sm'
                        : hasHoliday
                        ? 'bg-amber-50/40 dark:bg-amber-950/15 border-amber-200 dark:border-amber-900/40'
                        : !cell.isWorkDay
                        ? 'bg-slate-100/70 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800/80'
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-700 shadow-2xs'
                    }`}
                  >
                    {/* Encabezado del Día */}
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-1">
                        <span
                          className={`text-xs font-mono font-bold w-6 h-6 flex items-center justify-center rounded-full ${
                            isToday
                              ? 'bg-blue-600 text-white'
                              : isSelected
                              ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                              : 'text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          {cell.dayNumber}
                        </span>
                        {hasHoliday && (
                          <span
                            className="p-0.5 rounded text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/40"
                            title={`Festivo: ${cell.holidayName}`}
                          >
                            <Sparkles className="w-3 h-3" />
                          </span>
                        )}
                      </div>

                      {cell.tasks.length > 0 && cell.isCurrentMonth && (
                        <span className="text-[10px] font-mono font-semibold px-1.5 py-0.2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                          {cell.tasks.length} {cell.tasks.length === 1 ? 'tarea' : 'tareas'}
                        </span>
                      )}
                    </div>

                    {/* Lista de Tareas activas en este día */}
                    <div className="flex-1 flex flex-col gap-1 overflow-hidden">
                      {cell.tasks.slice(0, 3).map(pt => {
                        return (
                          <div
                            key={pt.task.id}
                            onClick={(e) => {
                              e.stopPropagation();
                              onEditTask(pt.task);
                            }}
                            style={{
                              borderLeftColor: pt.department.color,
                            }}
                            className={`p-1 rounded text-[10px] font-medium border-l-3 transition-transform hover:scale-[1.02] cursor-pointer truncate ${
                              pt.isCritical
                                ? 'bg-red-50 dark:bg-red-950/40 text-red-900 dark:text-red-200 border-r border-t border-b border-red-200 dark:border-red-900'
                                : 'bg-slate-100/90 dark:bg-slate-800/90 text-slate-800 dark:text-slate-200 border-r border-t border-b border-slate-200 dark:border-slate-700'
                            }`}
                            title={`[${pt.task.id}] ${pt.task.name}\nDepartamento: ${pt.department.name} (${pt.department.code})\nFechas: ${pt.startStr} a ${pt.endStr}\nDuración: ${pt.task.duration} ${getTimeUnitLabel(calendar.timeUnit, pt.task.duration)}${pt.isCritical ? '\n★ CAMINO CRÍTICO' : ''}\n(Haz clic para editar la tarea)`}
                          >
                            <div className="flex items-center gap-1">
                              <span
                                className="w-1.5 h-1.5 rounded-full shrink-0"
                                style={{ backgroundColor: pt.department.color }}
                              />
                              <span className="font-bold shrink-0">[{pt.task.id}]</span>
                              <span className="truncate">{pt.task.name}</span>
                            </div>
                          </div>
                        );
                      })}

                      {cell.tasks.length > 3 && (
                        <div className="text-[10px] font-semibold text-blue-600 dark:text-blue-400 pl-1">
                          +{cell.tasks.length - 3} más...
                        </div>
                      )}
                    </div>

                    {/* Etiqueta de Festivo si aplica */}
                    {hasHoliday && cell.tasks.length === 0 && (
                      <div className="text-[9px] font-semibold text-amber-700 dark:text-amber-400 truncate px-1 py-0.5 rounded bg-amber-50 dark:bg-amber-950/40 border border-amber-200/60 dark:border-amber-900/60">
                        {cell.holidayName}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          /* Vista de Agenda Cronológica por Departamentos */
          <div className="flex-1 p-6 overflow-y-auto">
            <div className="max-w-5xl mx-auto space-y-4">
              {tasksInMonth.length === 0 ? (
                <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
                  <CalendarDays className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                  <h3 className="font-bold text-base text-slate-800 dark:text-slate-200">
                    No hay tareas programadas en {MONTH_NAMES[currentMonth]} {currentYear}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto">
                    Prueba a navegar a los meses anteriores o siguientes, o pulsa en "Inicio Proyecto" para saltar al comienzo de las actividades.
                  </p>
                  <button
                    onClick={handleGoToProjectStart}
                    className="mt-4 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold inline-flex items-center gap-2 cursor-pointer transition-colors shadow-xs"
                  >
                    <CalendarDays className="w-4 h-4" />
                    <span>Ir al Inicio del Proyecto</span>
                  </button>
                </div>
              ) : (
                tasksInMonth.map(pt => {
                  return (
                    <div
                      key={pt.task.id}
                      onClick={() => onEditTask(pt.task)}
                      className={`p-4 rounded-2xl border bg-white dark:bg-slate-900 hover:shadow-md transition-all cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4 border-l-6 ${
                        pt.isCritical
                          ? 'border-red-500 border-t-slate-200 border-r-slate-200 border-b-slate-200 dark:border-t-slate-800 dark:border-r-slate-800 dark:border-b-slate-800'
                          : 'border-slate-200 dark:border-slate-800'
                      }`}
                      style={{ borderLeftColor: pt.department.color }}
                    >
                      <div className="flex-1 space-y-1.5">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono font-bold text-sm text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded-lg border border-blue-200 dark:border-blue-900">
                            [{pt.task.id}]
                          </span>
                          <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                            {pt.task.name}
                          </h4>
                          {pt.isCritical && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-700 dark:bg-red-950/80 dark:text-red-300 border border-red-300 dark:border-red-800">
                              <Flame className="w-3 h-3 text-red-600" />
                              Camino Crítico
                            </span>
                          )}
                        </div>

                        {/* Ficha del Departamento Responsable */}
                        <div className="flex flex-wrap items-center gap-3 text-xs">
                          <div className="flex items-center gap-1.5">
                            <span
                              className="w-2.5 h-2.5 rounded-full"
                              style={{ backgroundColor: pt.department.color }}
                            />
                            <span className="font-semibold text-slate-700 dark:text-slate-300">
                              {pt.department.name}
                            </span>
                            <span className="font-mono text-[11px] text-slate-400">
                              ({pt.department.code})
                            </span>
                          </div>

                          {pt.department.personnel && pt.department.personnel.length > 0 && (
                            <div className="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:inline">
                              • Resp: {pt.department.personnel.slice(0, 2).join(', ')}
                              {pt.department.personnel.length > 2 && ` (+${pt.department.personnel.length - 2})`}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Datos Temporales y Métricas */}
                      <div className="flex items-center gap-4 shrink-0 font-mono text-xs text-right">
                        <div className="space-y-0.5">
                          <div className="text-[11px] text-slate-400">Período de Ejecución:</div>
                          <div className="font-bold text-slate-800 dark:text-slate-200">
                            {pt.startStr} → {pt.endStr}
                          </div>
                        </div>

                        <div className="h-8 w-px bg-slate-200 dark:bg-slate-800 hidden sm:block" />

                        <div className="space-y-0.5 text-center min-w-[70px]">
                          <div className="text-[11px] text-slate-400">Duración:</div>
                          <div className="font-bold text-blue-600 dark:text-blue-400">
                            {pt.task.duration} {getTimeUnitLabel(calendar.timeUnit, pt.task.duration)}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* Panel Lateral Retráctil: Detalle del Día Seleccionado (en vista cuadrícula) */}
        {viewFormat === 'grid' && selectedDayCell && (
          <div className="w-80 border-l border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 flex flex-col overflow-y-auto shadow-lg animate-in slide-in-from-right duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 mb-3">
              <div>
                <span className="text-xs font-bold text-blue-600 dark:text-blue-400">
                  Detalle de la Jornada
                </span>
                <h3 className="font-bold text-base text-slate-900 dark:text-white">
                  {selectedDayCell.dayNumber} de {MONTH_NAMES[currentMonth]} {currentYear}
                </h3>
              </div>
              <button
                onClick={() => setSelectedDayNumber(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors cursor-pointer text-xs"
              >
                ✕
              </button>
            </div>

            {selectedDayCell.holidayName && (
              <div className="mb-3 p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 text-xs font-medium flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Festivo oficial: {selectedDayCell.holidayName}</span>
              </div>
            )}

            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              Tareas en Ejecución ({selectedDayCell.tasks.length}):
            </div>

            {selectedDayCell.tasks.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                No hay tareas programadas para este día.
              </div>
            ) : (
              <div className="space-y-2.5">
                {selectedDayCell.tasks.map(pt => (
                  <div
                    key={pt.task.id}
                    onClick={() => onEditTask(pt.task)}
                    className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 hover:border-blue-400 dark:hover:border-blue-600 transition-all cursor-pointer space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-xs text-blue-600 dark:text-blue-400">
                        [{pt.task.id}]
                      </span>
                      {pt.isCritical && (
                        <span className="text-[10px] font-bold text-red-600 flex items-center gap-0.5">
                          <Flame className="w-3 h-3" /> Crítica
                        </span>
                      )}
                    </div>
                    <div className="font-bold text-xs text-slate-900 dark:text-white leading-tight">
                      {pt.task.name}
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px] pt-1 border-t border-slate-200/60 dark:border-slate-700/60">
                      <span
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{ backgroundColor: pt.department.color }}
                      />
                      <span className="text-slate-600 dark:text-slate-300 font-medium truncate">
                        {pt.department.name}
                      </span>
                    </div>
                    <div className="text-[10px] font-mono text-slate-400">
                      Plazo: {pt.startStr} a {pt.endStr}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
