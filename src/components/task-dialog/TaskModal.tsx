import React, { useState, useEffect, useRef } from 'react';
import { Task, Dependency, DependencyType, Department } from '../../core/roy-engine/types';
import { PILPIS_DEPARTMENTS } from '../../theme/departments';
import { X, Plus, Trash2, Save, Layers, Clock, Building2, Link2 } from 'lucide-react';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (task: Task) => void;
  onDelete?: (taskId: string) => void;
  taskToEdit?: Task | null;
  allTasks: Task[];
  departments?: Department[];
}

export const TaskModal: React.FC<TaskModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onDelete,
  taskToEdit,
  allTasks,
  departments = PILPIS_DEPARTMENTS,
}) => {
  const [id, setId] = useState('');
  const [name, setName] = useState('');
  const [duration, setDuration] = useState<number>(1);
  const [departmentId, setDepartmentId] = useState('D1');
  const [dependencies, setDependencies] = useState<Dependency[]>([]);
  const [validationError, setValidationError] = useState<string | null>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (taskToEdit) {
      setId(taskToEdit.id);
      setName(taskToEdit.name);
      setDuration(taskToEdit.duration);
      setDepartmentId(taskToEdit.departmentId);
      setDependencies(taskToEdit.dependencies.map(d => ({ ...d })));
    } else {
      const nextNum = allTasks.length + 1;
      const suggestedId = `T${nextNum < 10 ? '0' : ''}${nextNum}`;
      setId(suggestedId);
      setName('');
      setDuration(2);
      setDepartmentId('D1');
      setDependencies([]);
    }
    setValidationError(null);

    // Auto-foco directo e inmediato en el campo de Nombre al abrir (Decisión grill-me)
    if (isOpen) {
      window.focus();
      const timer = setTimeout(() => {
        if (nameInputRef.current) {
          nameInputRef.current.focus({ preventScroll: true });
          nameInputRef.current.select();
        }
      }, 70);
      return () => clearTimeout(timer);
    }
  }, [taskToEdit, allTasks, isOpen]);

  if (!isOpen) return null;

  const handleAddDependency = () => {
    const availableTasks = allTasks.filter(
      t => t.id !== id && !dependencies.some(d => d.predecessorId === t.id)
    );
    if (availableTasks.length === 0) return;

    setDependencies(prev => [
      ...prev,
      {
        predecessorId: availableTasks[0].id,
        type: 'FC',
        lag: 0,
      },
    ]);
  };

  const handleRemoveDependency = (index: number) => {
    setDependencies(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpdateDependency = (
    index: number,
    field: keyof Dependency,
    value: string | number
  ) => {
    setDependencies(prev =>
      prev.map((d, i) => {
        if (i === index) {
          return { ...d, [field]: value };
        }
        return d;
      })
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!id.trim()) {
      setValidationError('El código ID de la tarea es obligatorio.');
      return;
    }

    if (!name.trim()) {
      setValidationError('El nombre de la actividad es obligatorio.');
      return;
    }

    if (duration <= 0) {
      setValidationError('La duración de la tarea debe ser un número entero positivo.');
      return;
    }

    if (!taskToEdit && allTasks.some(t => t.id.toLowerCase() === id.trim().toLowerCase())) {
      setValidationError(`Ya existe una tarea con el ID "${id}". Elige un código diferente.`);
      return;
    }

    const savedTask: Task = {
      id: id.trim(),
      name: name.trim(),
      duration: Math.round(duration),
      departmentId,
      dependencies,
    };

    onSave(savedTask);
    onClose();
  };

  const availablePredecessors = allTasks.filter(t => t.id !== id);

  return (
    <div
      className="fixed inset-0 z-[9990] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh] z-[9999] pointer-events-auto select-text"
        onClick={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
        onPointerDown={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/40">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-100 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {taskToEdit ? `Editar Tarea: ${taskToEdit.id}` : 'Crear Nueva Actividad ROY'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Parámetros temporales y ligaduras del método de los potenciales
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4 text-xs">
          {validationError && (
            <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-300 font-semibold">
              {validationError}
            </div>
          )}

          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-1">
              <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                ID / Código *
              </label>
              <input
                type="text"
                value={id}
                onChange={e => setId(e.target.value)}
                onMouseDown={(e) => e.stopPropagation()}
                onPointerDown={(e) => e.stopPropagation()}
                disabled={!!taskToEdit}
                placeholder="ej: T01"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono font-bold focus:ring-2 focus:ring-blue-500 focus:outline-hidden disabled:opacity-60 disabled:cursor-not-allowed select-text cursor-text"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                Nombre de la Actividad *
              </label>
              <input
                ref={nameInputRef}
                autoFocus
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                onMouseDown={(e) => {
                  e.stopPropagation();
                  e.currentTarget.focus();
                }}
                onPointerDown={(e) => {
                  e.stopPropagation();
                  e.currentTarget.focus();
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  e.currentTarget.focus();
                }}
                placeholder="ej: Simulación de Columnas de Fraccionamiento C4"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-blue-500 focus:outline-hidden select-text cursor-text"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                Duración (meses) *
              </label>
              <input
                type="number"
                min="1"
                step="1"
                value={duration}
                onChange={e => setDuration(Math.max(1, parseInt(e.target.value) || 1))}
                onMouseDown={(e) => e.stopPropagation()}
                onPointerDown={(e) => e.stopPropagation()}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono font-bold focus:ring-2 focus:ring-blue-500 focus:outline-hidden select-text cursor-text"
              />
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-slate-400" />
                Equipo / Departamento
              </label>
              <select
                value={departmentId}
                onChange={e => setDepartmentId(e.target.value)}
                onMouseDown={(e) => e.stopPropagation()}
                onPointerDown={(e) => e.stopPropagation()}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-blue-500 focus:outline-hidden select-text"
              >
                {departments.map(d => (
                  <option key={d.id} value={d.id}>
                    {d.code} — {d.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <label className="text-slate-700 dark:text-slate-300 font-bold flex items-center gap-1.5">
                <Link2 className="w-3.5 h-3.5 text-slate-400" />
                Predecesoras y Ligaduras de Potencial ({dependencies.length})
              </label>
              <button
                type="button"
                onClick={handleAddDependency}
                disabled={availablePredecessors.length === dependencies.length}
                className="px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900/60 text-blue-700 dark:text-blue-300 font-semibold flex items-center gap-1 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Añadir Ligadura</span>
              </button>
            </div>

            {dependencies.length === 0 ? (
              <div className="p-4 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 text-center text-slate-500 dark:text-slate-400 italic">
                Esta actividad es inicial (no tiene predecesoras y comenzará en el mes 0).
              </div>
            ) : (
              <div className="space-y-2">
                {dependencies.map((dep, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800/40 flex items-center gap-2"
                  >
                    <select
                      value={dep.predecessorId}
                      onChange={e => handleUpdateDependency(idx, 'predecessorId', e.target.value)}
                      className="flex-1 px-2 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-mono font-semibold"
                    >
                      {availablePredecessors.map(t => (
                        <option key={t.id} value={t.id}>
                          {t.id} — {t.name}
                        </option>
                      ))}
                    </select>

                    <select
                      value={dep.type}
                      onChange={e =>
                        handleUpdateDependency(idx, 'type', e.target.value as DependencyType)
                      }
                      className="w-20 px-2 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-mono font-bold text-center"
                      title="Tipo de ligadura: FC (Fin-Comienzo), CC (Comienzo-Comienzo), FF (Fin-Fin), CF (Comienzo-Fin)"
                    >
                      <option value="FC">FC</option>
                      <option value="CC">CC</option>
                      <option value="FF">FF</option>
                      <option value="CF">CF</option>
                    </select>

                    <div className="flex items-center gap-1">
                      <span className="text-[10px] text-slate-400 font-mono">lag:</span>
                      <input
                        type="number"
                        value={dep.lag}
                        onChange={e =>
                          handleUpdateDependency(idx, 'lag', parseInt(e.target.value) || 0)
                        }
                        className="w-14 px-1.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono text-center font-bold"
                        title="Retardo o desfase en meses (+ positivo para espera, - negativo para adelanto)"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveDependency(idx)}
                      className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg transition-colors"
                      title="Quitar ligadura"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
            {taskToEdit && onDelete ? (
              <button
                type="button"
                onClick={() => {
                  if (confirm(`¿Estás seguro de eliminar la tarea ${taskToEdit.id}?`)) {
                    onDelete(taskToEdit.id);
                    onClose();
                  }
                }}
                className="px-3 py-1.5 rounded-xl text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 font-semibold transition-colors flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Eliminar Tarea</span>
              </button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold flex items-center gap-1.5 shadow-md shadow-blue-500/20 transition-all"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Guardar Actividad</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
