import React, { useState, useMemo } from 'react';
import { Task } from '../../core/roy-engine/types';
import { PILPIS_DEPARTMENTS, getDepartmentById } from '../../theme/departments';
import { Search, Plus, Edit2, Trash2, Copy, AlertCircle } from 'lucide-react';

interface TaskTableProps {
  tasks: Task[];
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
  onAddTask: () => void;
  onDuplicateTask: (task: Task) => void;
}

export const TaskTable: React.FC<TaskTableProps> = ({
  tasks,
  onEditTask,
  onDeleteTask,
  onAddTask,
  onDuplicateTask,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [deptFilter, setDeptFilter] = useState('ALL');

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
            className="px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
          >
            <option value="ALL">Todos los Departamentos</option>
            {PILPIS_DEPARTMENTS.map(d => (
              <option key={d.id} value={d.id}>
                {d.code}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={onAddTask}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-xs transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nueva Tarea ROY
        </button>
      </div>

      <div className="flex-1 overflow-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead className="bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-200 sticky top-0 z-10 text-[11px] font-bold border-b border-slate-200 dark:border-slate-700">
            <tr>
              <th className="py-2.5 px-3 w-16 text-center">ID</th>
              <th className="py-2.5 px-3 min-w-[220px]">ACTIVIDAD / ENTREGABLE</th>
              <th className="py-2.5 px-3 w-28">DEPARTAMENTO</th>
              <th className="py-2.5 px-2 w-16 text-center font-mono">DUR (m)</th>
              <th className="py-2.5 px-3 min-w-[160px]">PREDECESORAS (LIGADURAS)</th>
              <th className="py-2.5 px-2 w-14 text-center font-mono text-blue-700 dark:text-blue-400">ES</th>
              <th className="py-2.5 px-2 w-14 text-center font-mono text-blue-700 dark:text-blue-400">EF</th>
              <th className="py-2.5 px-2 w-14 text-center font-mono text-amber-700 dark:text-amber-400">LS</th>
              <th className="py-2.5 px-2 w-14 text-center font-mono text-amber-700 dark:text-amber-400">LF</th>
              <th className="py-2.5 px-2 w-14 text-center font-mono font-bold">HT</th>
              <th className="py-2.5 px-2 w-14 text-center font-mono">HL</th>
              <th className="py-2.5 px-2 w-20 text-center">ESTADO</th>
              <th className="py-2.5 px-3 w-24 text-right">ACCIONES</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
            {filteredTasks.map(task => {
              const dept = getDepartmentById(task.departmentId);
              const isCrit = task.isCritical;

              return (
                <tr
                  key={task.id}
                  className={`hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors ${
                    isCrit ? 'bg-red-50/20 dark:bg-red-950/10' : ''
                  }`}
                >
                  <td className="py-2 px-3 text-center">
                    <span
                      className="font-mono font-bold px-1.5 py-0.5 rounded text-[10px] text-white"
                      style={{ backgroundColor: isCrit ? '#DC2626' : dept.color }}
                    >
                      {task.id}
                    </span>
                  </td>

                  <td className="py-2 px-3 font-medium text-slate-900 dark:text-slate-100">
                    {task.name}
                  </td>

                  <td className="py-2 px-3 text-slate-600 dark:text-slate-300">
                    <span
                      className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium"
                      style={{ backgroundColor: dept.lightBg, color: dept.textColor }}
                    >
                      {dept.code}
                    </span>
                  </td>

                  <td className="py-2 px-2 text-center font-mono font-bold text-slate-800 dark:text-slate-200">
                    {task.duration}
                  </td>

                  <td className="py-2 px-3">
                    {task.dependencies.length === 0 ? (
                      <span className="text-slate-400 italic text-[10px]">—</span>
                    ) : (
                      <div className="flex flex-wrap gap-1">
                        {task.dependencies.map((dep, i) => (
                          <span
                            key={i}
                            className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono text-[10px] text-slate-700 dark:text-slate-300"
                          >
                            <strong>{dep.predecessorId}</strong>
                            <span className="text-blue-600 dark:text-blue-400 text-[9px]">({dep.type}{dep.lag !== 0 ? ` ${dep.lag > 0 ? '+' : ''}${dep.lag}` : ''})</span>
                          </span>
                        ))}
                      </div>
                    )}
                  </td>

                  <td className="py-2 px-2 text-center font-mono font-bold text-blue-900 dark:text-blue-300 bg-blue-50/30 dark:bg-blue-950/10">
                    {task.earlyStart}
                  </td>
                  <td className="py-2 px-2 text-center font-mono font-bold text-blue-900 dark:text-blue-300 bg-blue-50/30 dark:bg-blue-950/10">
                    {task.earlyFinish}
                  </td>

                  <td className="py-2 px-2 text-center font-mono font-bold text-amber-900 dark:text-amber-300 bg-amber-50/30 dark:bg-amber-950/10">
                    {task.lateStart}
                  </td>
                  <td className="py-2 px-2 text-center font-mono font-bold text-amber-900 dark:text-amber-300 bg-amber-50/30 dark:bg-amber-950/10">
                    {task.lateFinish}
                  </td>

                  <td
                    className={`py-2 px-2 text-center font-mono font-bold ${
                      isCrit ? 'text-red-600 dark:text-red-400 bg-red-50/60 dark:bg-red-950/30' : 'text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {task.totalFloat}
                  </td>

                  <td className="py-2 px-2 text-center font-mono text-slate-600 dark:text-slate-400">
                    {task.freeFloat}
                  </td>

                  <td className="py-2 px-2 text-center">
                    {isCrit ? (
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-300 font-bold text-[9px] uppercase tracking-wider">
                        <AlertCircle className="w-2.5 h-2.5" /> Crítica
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 text-[9px]">
                        Normal
                      </span>
                    )}
                  </td>

                  <td className="py-2 px-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => onDuplicateTask(task)}
                        className="p-1 rounded text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                        title="Duplicar tarea"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onEditTask(task)}
                        className="p-1 rounded text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
                        title="Editar tarea"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`¿Eliminar la tarea ${task.id}?`)) {
                            onDeleteTask(task.id);
                          }
                        }}
                        className="p-1 rounded text-slate-400 hover:text-red-600 transition-colors"
                        title="Eliminar tarea"
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
