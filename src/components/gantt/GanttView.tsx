import React, { useState, useMemo } from 'react';
import { Task } from '../../core/roy-engine/types';
import { PILPIS_DEPARTMENTS, getDepartmentById } from '../../theme/departments';
import { Calendar, Filter } from 'lucide-react';

interface GanttViewProps {
  tasks: Task[];
  totalDuration: number;
  onEditTask: (task: Task) => void;
}

export const GanttView: React.FC<GanttViewProps> = ({
  tasks,
  totalDuration,
  onEditTask,
}) => {
  const [selectedDept, setSelectedDept] = useState<string>('ALL');
  const [showCriticalOnly, setShowCriticalOnly] = useState(false);

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

  const pixelsPerMonth = 42;
  const chartWidth = maxTime * pixelsPerMonth;

  return (
    <div className="w-full h-full flex flex-col bg-white dark:bg-slate-950 overflow-hidden">
      <div className="px-6 py-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <span className="font-bold text-slate-800 dark:text-slate-100">
            Cronograma GANTT (Horizonte: {totalDuration} meses)
          </span>
          <span className="px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-800 dark:text-blue-300 font-mono font-semibold">
            {filteredTasks.length} tareas
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedDept}
              onChange={e => setSelectedDept(e.target.value)}
              className="px-2.5 py-1 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-medium focus:ring-1 focus:ring-blue-500 focus:outline-hidden"
            >
              <option value="ALL">Todos los Departamentos (Oficina Técnica)</option>
              {PILPIS_DEPARTMENTS.map(d => (
                <option key={d.id} value={d.id}>
                  {d.code} — {d.name}
                </option>
              ))}
            </select>
          </div>

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
        <div className="w-[360px] shrink-0 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 z-10 shadow-xs">
          <div className="h-10 border-b border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800/80 px-4 flex items-center justify-between text-[11px] font-bold text-slate-600 dark:text-slate-300 sticky top-0">
            <span>ACTIVIDAD / DPTO</span>
            <div className="flex items-center gap-3 font-mono">
              <span title="Duración">DUR</span>
              <span title="Comienzo Temprano - Fin Temprano">ES → EF</span>
              <span title="Holgura Total">HT</span>
            </div>
          </div>

          {filteredTasks.map(task => {
            const dept = getDepartmentById(task.departmentId);
            const isCrit = task.isCritical;
            return (
              <div
                key={task.id}
                onClick={() => onEditTask(task)}
                className={`h-11 px-4 border-b border-slate-100 dark:border-slate-800/60 flex items-center justify-between hover:bg-blue-50/50 dark:hover:bg-blue-950/20 cursor-pointer transition-colors ${
                  isCrit ? 'bg-red-50/30 dark:bg-red-950/10' : ''
                }`}
              >
                <div className="flex items-center gap-2 min-w-0 pr-2">
                  <span
                    className={`font-mono text-[10px] font-bold px-1.5 py-0.5 rounded text-white shrink-0 ${
                      isCrit ? 'bg-red-600' : ''
                    }`}
                    style={{ backgroundColor: isCrit ? '#DC2626' : dept.color }}
                  >
                    {task.id}
                  </span>
                  <span className="text-xs font-medium text-slate-800 dark:text-slate-200 truncate" title={task.name}>
                    {task.name}
                  </span>
                </div>

                <div className="flex items-center gap-3 font-mono text-[11px] shrink-0 text-slate-600 dark:text-slate-300">
                  <span className="w-6 text-right font-semibold">{task.duration}m</span>
                  <span className="w-14 text-center text-slate-500 dark:text-slate-400">
                    {task.earlyStart} - {task.earlyFinish}
                  </span>
                  <span
                    className={`w-7 text-right font-bold ${
                      isCrit ? 'text-red-600 dark:text-red-400' : 'text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {task.totalFloat}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex-1 overflow-x-auto relative">
          <div style={{ width: `${chartWidth}px` }} className="relative min-h-full">
            <div className="h-10 border-b border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800/80 flex items-center sticky top-0 z-10">
              {timeHeaders.map(m => (
                <div
                  key={m}
                  style={{ width: `${pixelsPerMonth}px` }}
                  className="h-full border-r border-slate-200 dark:border-slate-700/60 flex items-center justify-center text-[10px] font-mono font-bold text-slate-600 dark:text-slate-400"
                >
                  M{m}
                </div>
              ))}
            </div>

            <div className="absolute inset-0 top-10 pointer-events-none flex">
              {timeHeaders.map(m => (
                <div
                  key={m}
                  style={{ width: `${pixelsPerMonth}px` }}
                  className="h-full border-r border-slate-100 dark:border-slate-800/40"
                />
              ))}
            </div>

            <div className="relative">
              {filteredTasks.map(task => {
                const dept = getDepartmentById(task.departmentId);
                const isCrit = task.isCritical;
                const es = task.earlyStart ?? 0;
                const dur = task.duration;
                const ht = task.totalFloat ?? 0;

                const leftPx = es * pixelsPerMonth;
                const widthPx = Math.max(12, dur * pixelsPerMonth);
                const floatWidthPx = ht * pixelsPerMonth;

                return (
                  <div
                    key={task.id}
                    className="h-11 border-b border-slate-100 dark:border-slate-800/60 relative flex items-center"
                  >
                    <div
                      onClick={() => onEditTask(task)}
                      style={{
                        left: `${leftPx}px`,
                        width: `${widthPx}px`,
                        backgroundColor: isCrit ? '#DC2626' : dept.color,
                      }}
                      className="absolute h-6 rounded-md shadow-xs flex items-center px-2 text-[10px] text-white font-mono font-semibold truncate cursor-pointer hover:brightness-110 transition-all z-1"
                      title={`[${task.id}] ${task.name} | ES: ${task.earlyStart}m, EF: ${task.earlyFinish}m | Holgura: ${task.totalFloat}m`}
                    >
                      <span className="truncate">{task.id}</span>
                    </div>

                    {ht > 0 && (
                      <div
                        style={{
                          left: `${leftPx + widthPx}px`,
                          width: `${floatWidthPx}px`,
                        }}
                        className="absolute h-4 rounded-r-md border border-dashed border-slate-400 dark:border-slate-600 bg-slate-200/50 dark:bg-slate-800/50 flex items-center justify-center text-[9px] font-mono text-slate-600 dark:text-slate-400 select-none"
                        title={`Holgura Total HT = ${ht} meses`}
                      >
                        +{ht}m
                      </div>
                    )}
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
