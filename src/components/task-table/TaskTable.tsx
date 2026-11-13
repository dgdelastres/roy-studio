import React, { useState, useMemo } from 'react';
import { Task, Department, TimeUnit, ProjectCalendar } from '../../core/roy-engine/types';
import { PILPIS_DEPARTMENTS, getDepartmentById } from '../../theme/departments';
import { getTimeUnitShort } from '../../core/roy-engine/calendar';
import { Search, Plus, Edit2, Trash2, Copy, AlertCircle } from 'lucide-react';

interface TaskTableProps {
  tasks: Task[];
  departments?: Department[];
  calendar?: ProjectCalendar;
  timeUnit?: TimeUnit;
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
  onAddTask: () => void;
  onDuplicateTask: (task: Task) => void;
}

export const TaskTable: React.FC<TaskTableProps> = ({
  tasks,
  departments = PILPIS_DEPARTMENTS,
  calendar,
  timeUnit = calendar?.timeUnit || 'months',
  onEditTask,
  onDeleteTask,
  onAddTask,
  onDuplicateTask,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [deptFilter, setDeptFilter] = useState('ALL');
  const unitShort = getTimeUnitShort(timeUnit);

  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      const matchesSearch =
        task.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesDept = deptFilter === 'ALL' || task.departmentId === deptFilter;
      return matchesSearch && matchesDept;
    });
  }, [tasks, searchTerm, deptFilter]);

  return (
    <div className="w-full h-full flex flex-col bg-white dark:bg-slate-950 overflow-hidden">
      <div className="px-6 py-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3 flex-1 max-w-lg">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Buscar por ID o nombre de actividad..."
              className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 placeholder-slate-400 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
            />
          </div>

          <select
            value={deptFilter}
            onChange={e => setDeptFilter(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
          >
            <option value="ALL">Todos los Departamentos</option>
            {departments.map(d => (
              <option key={d.id} value={d.id}>
                {d.code} — {d.name}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={onAddTask}
          className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Nueva Tarea</span>
        </button>
      </div>

      <div className="flex-1 overflow-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 sticky top-0 z-10 font-bold border-b border-slate-200 dark:border-slate-700/80 select-none">
            <tr>
              <th className="py-2.5 px-4 w-16">ID</th>
              <th className="py-2.5 px-4">Nombre de la Actividad</th>
              <th className="py-2.5 px-4 w-44">Departamento</th>
              <th className="py-2.5 px-4 w-24 text-right">Duración ({unitShort})</th>
              <th className="py-2.5 px-4 w-24 text-center font-mono">ES / EF</th>
              <th className="py-2.5 px-4 w-24 text-center font-mono">LS / LF</th>
              <th className="py-2.5 px-4 w-16 text-right font-mono">HT</th>
              <th className="py-2.5 px-4 w-16 text-right font-mono">HL</th>
              <th className="py-2.5 px-4 w-52">Predecesoras (Tipo + Lag)</th>
              <th className="py-2.5 px-4 w-28 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
            {filteredTasks.map(task => {
              const dept = getDepartmentById(task.departmentId, departments);
              const isCrit = task.isCritical;

              return (
                <tr
                  key={task.id}
                  className={`hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors ${
                    isCrit ? 'bg-red-50/30 dark:bg-red-950/15' : ''
                  }`}
                >
                  <td className="py-2.5 px-4 font-mono font-bold">
                    <span
                      className="px-1.5 py-0.5 rounded text-white text-[11px] shadow-xs"
                      style={{ backgroundColor: isCrit ? '#DC2626' : dept.color }}
                    >
                      {task.id}
                    </span>
                  </td>

                  <td className="py-2.5 px-4 font-semibold text-slate-900 dark:text-slate-100">
                    <div className="flex items-center gap-1.5">
                      <span>{task.name}</span>
                      {isCrit && (
                        <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300 flex items-center gap-0.5">
                          <AlertCircle className="w-2.5 h-2.5" /> CRÍTICA
                        </span>
                      )}
                    </div>
                  </td>

                  <td className="py-2.5 px-4">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: dept.color }} />
                      <span className="truncate max-w-[140px] text-slate-700 dark:text-slate-300" title={dept.name}>
                        {dept.code}
                      </span>
                    </div>
                  </td>

                  <td className="py-2.5 px-4 text-right font-mono font-bold text-slate-800 dark:text-slate-200">
                    {task.duration} {unitShort}
                  </td>

                  <td className="py-2.5 px-4 text-center font-mono text-[11px] text-blue-700 dark:text-blue-300">
                    {task.earlyStart} — {task.earlyFinish}
                  </td>

                  <td className="py-2.5 px-4 text-center font-mono text-[11px] text-amber-700 dark:text-amber-300">
                    {task.lateStart} — {task.lateFinish}
                  </td>

                  <td className={`py-2.5 px-4 text-right font-mono font-bold ${isCrit ? 'text-red-600 dark:text-red-400' : 'text-slate-700 dark:text-slate-300'}`}>
                    {task.totalFloat}
                  </td>

                  <td className="py-2.5 px-4 text-right font-mono text-slate-600 dark:text-slate-400">
                    {task.freeFloat}
                  </td>

                  <td className="py-2.5 px-4">
                    <div className="flex flex-wrap gap-1">
                      {task.dependencies.length === 0 ? (
                        <span className="text-slate-400 text-[11px] italic">Inicio de red</span>
                      ) : (
                        task.dependencies.map((dep, idx) => (
                          <span
                            key={idx}
                            className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                          >
                            {dep.predecessorId} ({dep.type}
                            {dep.lag !== 0 ? (dep.lag > 0 ? `+${dep.lag}` : dep.lag) : ''})
                          </span>
                        ))
                      )}
                    </div>
                  </td>

                  <td className="py-2.5 px-4">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        onClick={() => onEditTask(task)}
                        className="p-1 rounded text-slate-500 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        title="Editar Tarea"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onDuplicateTask(task)}
                        className="p-1 rounded text-slate-500 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        title="Duplicar Tarea"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`¿Eliminar la tarea ${task.id} (${task.name})?`)) {
                            onDeleteTask(task.id);
                          }
                        }}
                        className="p-1 rounded text-slate-500 hover:text-red-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        title="Eliminar Tarea"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
