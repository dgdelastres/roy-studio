import React, { useState, useMemo } from 'react';
import { Task, Department, ProjectCalendar } from '../../core/roy-engine/types';
import { PILPIS_DEPARTMENTS, getDepartmentById } from '../../theme/departments';
import {
  DEFAULT_PROJECT_CALENDAR,
  getTimeHeaderPrefix,
  getTimeUnitShort,
  getTimeUnitLabel,
  calculateTaskDates,
} from '../../core/roy-engine/calendar';
import { Calendar, Filter, GitFork } from 'lucide-react';

interface GanttViewProps {
  tasks: Task[];
  totalDuration: number;
  departments?: Department[];
  calendar?: ProjectCalendar;
  onEditTask: (task: Task) => void;
}

interface DependencyLink {
  id: string;
  sourceId: string;
  targetId: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  isCritical: boolean;
  lag: number;
}

export const GanttView: React.FC<GanttViewProps> = ({
  tasks,
  totalDuration,
  departments = PILPIS_DEPARTMENTS,
  calendar = DEFAULT_PROJECT_CALENDAR,
  onEditTask,
}) => {
  const [selectedDept, setSelectedDept] = useState<string>('ALL');
  const [showCriticalOnly, setShowCriticalOnly] = useState(false);
  const [showDependencies, setShowDependencies] = useState(true);

  const maxTime = Math.max(24, Math.ceil(totalDuration) + 1);

  const filteredTasks = useMemo(() => {
    return tasks
      .filter(t => (selectedDept === 'ALL' ? true : t.departmentId === selectedDept))
      .filter(t => (showCriticalOnly ? t.isCritical : true))
      .sort((a, b) => (a.earlyStart ?? 0) - (b.earlyStart ?? 0) || a.id.localeCompare(b.id));
  }, [tasks, selectedDept, showCriticalOnly]);

  const timeHeaders = useMemo(() => {
    return Array.from({ length: maxTime }, (_, i) => i + 1);
  }, [maxTime]);

  const pixelsPerUnit = 44;
  const chartWidth = maxTime * pixelsPerUnit;
  const rowHeight = 44; // Altura fija de cada fila de tarea (h-11)

  // Enlaces de dependencias trazados entre etapas en el Gantt
  const dependencyLinks = useMemo(() => {
    if (!showDependencies) return [];
    const links: DependencyLink[] = [];
    const taskIndexMap = new Map<string, number>();
    filteredTasks.forEach((t, idx) => taskIndexMap.set(t.id, idx));

    filteredTasks.forEach(task => {
      const targetIdx = taskIndexMap.get(task.id);
      if (targetIdx === undefined) return;

      task.dependencies.forEach(dep => {
        const predIdx = taskIndexMap.get(dep.predecessorId);
        if (predIdx === undefined) return;

        const predTask = filteredTasks[predIdx];
        const predES = predTask.earlyStart ?? 0;
        const predDur = predTask.duration;
        const targetES = task.earlyStart ?? 0;
        const targetDur = task.duration;

        let x1 = 0;
        let x2 = 0;

        if (dep.type === 'FC') {
          x1 = (predES + predDur) * pixelsPerUnit;
          x2 = targetES * pixelsPerUnit;
        } else if (dep.type === 'CC') {
          x1 = predES * pixelsPerUnit;
          x2 = targetES * pixelsPerUnit;
        } else if (dep.type === 'FF') {
          x1 = (predES + predDur) * pixelsPerUnit;
          x2 = (targetES + targetDur) * pixelsPerUnit;
        } else if (dep.type === 'CF') {
          x1 = predES * pixelsPerUnit;
          x2 = (targetES + targetDur) * pixelsPerUnit;
        }

        const y1 = predIdx * rowHeight + rowHeight / 2;
        const y2 = targetIdx * rowHeight + rowHeight / 2;

        const isCriticalEdge =
          !!predTask.isCritical &&
          !!task.isCritical &&
          (dep.type === 'FC' ? (predTask.earlyFinish ?? 0) + dep.lag === (task.earlyStart ?? 0) : true);

        links.push({
          id: `link-${dep.predecessorId}-${task.id}`,
          sourceId: dep.predecessorId,
          targetId: task.id,
          x1,
          y1,
          x2,
          y2,
          isCritical: isCriticalEdge,
          lag: dep.lag,
        });
      });
    });

    return links;
  }, [filteredTasks, showDependencies, pixelsPerUnit, rowHeight]);

  const generateArrowPath = (x1: number, y1: number, x2: number, y2: number) => {
    const arrowGap = 5;
    const destX = Math.max(0, x2 - arrowGap);
    if (x1 + 10 < destX) {
      const midX = Math.round(x1 + Math.max(8, (destX - x1) / 2));
      const dirY = y2 >= y1 ? 1 : -1;
      const r = Math.min(4, Math.abs(y2 - y1) / 2, Math.abs(destX - x1) / 4);
      return `M ${x1} ${y1} L ${midX - r} ${y1} Q ${midX} ${y1} ${midX} ${y1 + dirY * r} L ${midX} ${y2 - dirY * r} Q ${midX} ${y2} ${midX + r} ${y2} L ${destX} ${y2}`;
    } else {
      const dirY = y2 >= y1 ? 1 : -1;
      const loopX1 = x1 + 10;
      const loopX2 = Math.max(4, destX - 10);
      const midY = Math.round(y1 + dirY * 20);
      return `M ${x1} ${y1} L ${loopX1} ${y1} L ${loopX1} ${midY} L ${loopX2} ${midY} L ${loopX2} ${y2} L ${destX} ${y2}`;
    }
  };

  const unitShort = getTimeUnitShort(calendar.timeUnit);
  const headerPrefix = getTimeHeaderPrefix(calendar.timeUnit);
  const horizonLabel = getTimeUnitLabel(calendar.timeUnit, totalDuration);

  return (
    <div className="w-full h-full flex flex-col bg-white dark:bg-slate-950 overflow-hidden">
      {/* Barra de Filtros y Configuración del Gantt */}
      <div className="px-6 py-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <span className="font-bold text-slate-800 dark:text-slate-100">
            Cronograma GANTT (Horizonte: {totalDuration} {horizonLabel})
          </span>
          <span className="px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-800 dark:text-blue-300 font-mono font-semibold">
            {filteredTasks.length} tareas
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* Selector de Departamento */}
          <div className="flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedDept}
              onChange={e => setSelectedDept(e.target.value)}
              className="px-2.5 py-1 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-medium focus:ring-1 focus:ring-blue-500 focus:outline-hidden"
            >
              <option value="ALL">Todos los Departamentos (Oficina Técnica)</option>
              {departments.map(d => (
                <option key={d.id} value={d.id}>
                  {d.code} — {d.name}
                </option>
              ))}
            </select>
          </div>

          {/* Toggle Mostrar Flechas de Dependencia */}
          <label className="flex items-center gap-1.5 cursor-pointer text-slate-700 dark:text-slate-300 font-medium select-none bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700">
            <GitFork className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <input
              type="checkbox"
              checked={showDependencies}
              onChange={e => setShowDependencies(e.target.checked)}
              className="rounded border-slate-300 dark:border-slate-700 text-indigo-600 focus:ring-indigo-500 w-3.5 h-3.5"
            />
            <span>Enlaces de Etapas</span>
          </label>

          {/* Toggle Solo Camino Crítico */}
          <label className="flex items-center gap-1.5 cursor-pointer text-slate-700 dark:text-slate-300 font-medium select-none">
            <input
              type="checkbox"
              checked={showCriticalOnly}
              onChange={e => setShowCriticalOnly(e.target.checked)}
              className="rounded border-slate-300 dark:border-slate-700 text-red-600 focus:ring-red-500 w-3.5 h-3.5"
            />
            <span>Solo Camino Crítico</span>
          </label>
        </div>
      </div>

      <div className="flex-1 overflow-auto flex">
        {/* Tabla lateral izquierda fija con nombres de actividad */}
        <div className="w-[370px] shrink-0 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 z-10 shadow-xs">
          <div className="h-10 border-b border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800/80 px-4 flex items-center justify-between text-[11px] font-bold text-slate-600 dark:text-slate-300 sticky top-0">
            <span>Actividad</span>
            <div className="flex items-center gap-3 text-[10px]">
              <span className="w-8 text-right">Dur ({unitShort})</span>
              <span className="w-16 text-center">ES - EF</span>
              <span className="w-6 text-right">HT</span>
            </div>
          </div>

          {filteredTasks.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs">
              No hay tareas para mostrar en este filtro
            </div>
          ) : (
            filteredTasks.map(task => {
              const dept = getDepartmentById(task.departmentId, departments);
              const isCrit = task.isCritical;
              const dates = calculateTaskDates(task.earlyStart ?? 0, task.earlyFinish ?? 0, calendar);

              return (
                <div
                  key={task.id}
                  onClick={() => onEditTask(task)}
                  className={`h-11 border-b border-slate-100 dark:border-slate-800/60 px-4 flex items-center justify-between cursor-pointer transition-colors ${
                    isCrit
                      ? 'bg-red-50/40 dark:bg-red-950/20 hover:bg-red-50 dark:hover:bg-red-950/40'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
                  }`}
                  title={`${task.name} · Fechas calendario: ${dates.startStr} a ${dates.endStr}`}
                >
                  <div className="flex items-center gap-2 min-w-0 pr-2">
                    <span
                      className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded text-white shrink-0 shadow-xs"
                      style={{ backgroundColor: isCrit ? '#DC2626' : dept.color }}
                    >
                      {task.id}
                    </span>
                    <span className="text-xs font-medium text-slate-800 dark:text-slate-200 truncate">
                      {task.name}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 font-mono text-[11px] shrink-0 text-slate-600 dark:text-slate-300">
                    <span className="w-8 text-right font-semibold">
                      {task.duration}
                      {unitShort}
                    </span>
                    <span className="w-16 text-center text-slate-500 dark:text-slate-400 text-[10px]">
                      {task.earlyStart} - {task.earlyFinish}
                    </span>
                    <span
                      className={`w-6 text-right font-bold ${
                        isCrit ? 'text-red-600 dark:text-red-400' : 'text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      {task.totalFloat}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Zona gráfica de barras temporales y flechas */}
        <div className="flex-1 overflow-x-auto relative">
          <div style={{ width: `${chartWidth}px` }}>
            {/* Cabecera temporal de meses / semanas / días */}
            <div className="h-10 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex sticky top-0 z-10 font-mono text-[10px] font-bold text-slate-500 dark:text-slate-400">
              {timeHeaders.map(m => (
                <div
                  key={m}
                  style={{ width: `${pixelsPerUnit}px` }}
                  className="shrink-0 border-r border-slate-200 dark:border-slate-800 flex items-center justify-center"
                >
                  {headerPrefix}
                  {m}
                </div>
              ))}
            </div>

            {/* Contenedor relativo para las barras y la capa SVG de flechas */}
            <div className="relative" style={{ height: `${filteredTasks.length * rowHeight}px` }}>
              {/* Cuadrícula de columnas de fondo */}
              <div className="absolute inset-0 flex pointer-events-none">
                {timeHeaders.map(m => (
                  <div
                    key={m}
                    style={{ width: `${pixelsPerUnit}px` }}
                    className="shrink-0 border-r border-slate-100 dark:border-slate-800/40 h-full"
                  />
                ))}
              </div>

              {/* Capa SVG superpuesta para las flechas de enlace de etapas */}
              {showDependencies && dependencyLinks.length > 0 && (
                <svg
                  className="absolute inset-0 pointer-events-none z-10"
                  style={{ width: `${chartWidth}px`, height: `${filteredTasks.length * rowHeight}px` }}
                >
                  <defs>
                    <marker
                      id="gantt-arrow-crit"
                      viewBox="0 0 10 10"
                      refX="7"
                      refY="5"
                      markerWidth="6"
                      markerHeight="6"
                      orient="auto-start-reverse"
                    >
                      <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#DC2626" />
                    </marker>
                    <marker
                      id="gantt-arrow-normal"
                      viewBox="0 0 10 10"
                      refX="7"
                      refY="5"
                      markerWidth="6"
                      markerHeight="6"
                      orient="auto-start-reverse"
                    >
                      <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#64748B" />
                    </marker>
                  </defs>
                  {dependencyLinks.map(link => (
                    <path
                      key={link.id}
                      d={generateArrowPath(link.x1, link.y1, link.x2, link.y2)}
                      fill="none"
                      stroke={link.isCritical ? '#DC2626' : '#94A3B8'}
                      strokeWidth={link.isCritical ? 2 : 1.25}
                      strokeDasharray={link.lag !== 0 ? '4 2' : undefined}
                      markerEnd={link.isCritical ? 'url(#gantt-arrow-crit)' : 'url(#gantt-arrow-normal)'}
                      opacity={link.isCritical ? 0.95 : 0.65}
                    />
                  ))}
                </svg>
              )}

              {/* Barras de Tareas y Holguras */}
              {filteredTasks.map(task => {
                const dept = getDepartmentById(task.departmentId, departments);
                const es = task.earlyStart ?? 0;
                const dur = task.duration;
                const ht = task.totalFloat ?? 0;
                const isCrit = task.isCritical;

                const leftPx = es * pixelsPerUnit;
                const widthPx = dur * pixelsPerUnit;
                const floatWidthPx = ht * pixelsPerUnit;
                const dates = calculateTaskDates(es, task.earlyFinish ?? es + dur, calendar);

                return (
                  <div
                    key={task.id}
                    className="h-11 border-b border-slate-100 dark:border-slate-800/60 relative flex items-center"
                  >
                    {/* Barra de Holgura Total discontinua */}
                    {ht > 0 && (
                      <div
                        style={{
                          left: `${leftPx + widthPx}px`,
                          width: `${floatWidthPx}px`,
                        }}
                        className="absolute h-4 rounded-r-md border-y border-r border-dashed border-slate-400 dark:border-slate-600 bg-slate-200/50 dark:bg-slate-700/30 flex items-center justify-center text-[9px] font-mono text-slate-500 dark:text-slate-400 z-0"
                        title={`Holgura Total: ${ht} ${unitShort}`}
                      >
                        {floatWidthPx > 20 && `+${ht}${unitShort}`}
                      </div>
                    )}

                    {/* Barra sólida de Actividad */}
                    <div
                      onClick={() => onEditTask(task)}
                      style={{
                        left: `${leftPx}px`,
                        width: `${widthPx}px`,
                        backgroundColor: isCrit ? '#DC2626' : dept.color,
                      }}
                      className={`absolute h-6 rounded-md shadow-xs flex items-center px-2 text-white font-mono text-[10px] font-bold cursor-pointer hover:opacity-90 hover:scale-[1.01] transition-all truncate z-20 ${
                        isCrit ? 'ring-2 ring-red-400/80 shadow-red-500/20' : ''
                      }`}
                      title={`${task.name} (${task.id}) · Dur: ${dur} ${unitShort} · Fechas: ${dates.startStr} a ${dates.endStr} (ES=${es}, EF=${task.earlyFinish}) · HT=${ht}`}
                    >
                      <span className="truncate">{task.id}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
