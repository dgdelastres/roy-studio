import React, { useState, useEffect } from 'react';
import { Task, Dependency, DependencyType } from '../../core/roy-engine/types';
import { PILPIS_DEPARTMENTS } from '../../theme/departments';
import { X, Plus, Trash2, Save, Layers, Clock, Building2, Link2 } from 'lucide-react';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (task: Task) => void;
  onDelete?: (taskId: string) => void;
  taskToEdit?: Task | null;
  allTasks: Task[];
}

export const TaskModal: React.FC<TaskModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onDelete,
  taskToEdit,
  allTasks,
}) => {
  const [id, setId] = useState('');
  const [name, setName] = useState('');
  const [duration, setDuration] = useState<number>(1);
  const [departmentId, setDepartmentId] = useState('D1');
  const [dependencies, setDependencies] = useState<Dependency[]>([]);
  const [validationError, setValidationError] = useState<string | null>(null);

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
  }, [taskToEdit, allTasks, isOpen]);

  if (!isOpen) return null;

  const handleAddDependency = () => {
    const existingPredIds = new Set(dependencies.map(d => d.predecessorId));
    const available = allTasks.filter(t => t.id !== id && !existingPredIds.has(t.id));

    if (available.length === 0) {
      setValidationError('No hay más tareas disponibles para añadir como predecesora.');
      return;
    }

    setDependencies([
      ...dependencies,
      { predecessorId: available[0].id, type: 'FC', lag: 0 },
    ]);
    setValidationError(null);
  };

  const handleUpdateDependency = (
    index: number,
    field: keyof Dependency,
    value: string | number
  ) => {
    const updated = [...dependencies];
    updated[index] = {
      ...updated[index],
      [field]: value,
    };
    setDependencies(updated);
  };

  const handleRemoveDependency = (index: number) => {
    setDependencies(dependencies.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!id.trim()) {
      setValidationError('El identificador (ID) de la tarea es obligatorio.');
      return;
    }
    if (!name.trim()) {
      setValidationError('El nombre descriptivo de la tarea es obligatorio.');
      return;
    }
    if (duration <= 0) {
      setValidationError('La duración debe ser un valor positivo mayor que cero.');
      return;
    }

    if (!taskToEdit && allTasks.some(t => t.id.toLowerCase() === id.trim().toLowerCase())) {
      setValidationError(`Ya existe una tarea con el identificador "${id}".`);
      return;
    }

    onSave({
      id: id.trim(),
      name: name.trim(),
      duration: Number(duration),
      departmentId,
      dependencies,
      position: taskToEdit?.position,
    });
    onClose();
  };

  const availablePredecessors = allTasks.filter(t => t.id !== id);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/60">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h2 className="font-bold text-slate-800 dark:text-slate-100 text-base">
              {taskToEdit ? `Editar Tarea: ${taskToEdit.id}` : 'Crear Nueva Tarea ROY'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-md transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4 flex-1">
          {validationError && (
            <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 text-xs text-red-700 dark:text-red-300 font-medium">
              {validationError}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Identificador (ID):
              </label>
              <input
                type="text"
                value={id}
                onChange={e => setId(e.target.value)}
                placeholder="Ej. T01, A, PROC-01"
                disabled={!!taskToEdit}
                className="w-full px-3 py-1.5 text-xs font-mono font-bold rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:outline-hidden disabled:opacity-60"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" /> Duración (meses / u.):
              </label>
              <input
                type="number"
                step="0.5"
                min="0.5"
                value={duration}
                onChange={e => setDuration(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-1.5 text-xs font-mono font-bold rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Nombre de la Actividad / Entregable:
            </label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Ej. Especificaciones de Proceso y Balance de Materia"
              className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
              <Building2 className="w-3.5 h-3.5 text-slate-400" /> Departamento Responsable (Oficina Técnica):
            </label>
            <select
              value={departmentId}
              onChange={e => setDepartmentId(e.target.value)}
              className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
            >
              {PILPIS_DEPARTMENTS.map(d => (
                <option key={d.id} value={d.id}>
                  {d.code} — {d.name}
                </option>
              ))}
            </select>
          </div>

          <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                <Link2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" /> Predecesoras y Ligaduras de Roy:
              </label>
              <button
                type="button"
                onClick={handleAddDependency}
                className="text-xs flex items-center gap-1 px-2 py-1 rounded bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900/60 text-blue-700 dark:text-blue-300 font-medium transition-colors"
              >
                <Plus className="w-3.5 h-3.5" /> Añadir Ligadura
              </button>
            </div>

            {dependencies.length === 0 ? (
              <p className="text-xs text-slate-400 italic py-2 text-center bg-slate-50 dark:bg-slate-800/40 rounded-lg">
                Esta tarea no tiene predecesoras (iniciará en t = 0 o enlazada al nodo Inicio).
              </p>
            ) : (
              <div className="space-y-2">
                {dependencies.map((dep, index) => (
                  <div
                    key={index}
                    className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/50 flex items-center gap-2 text-xs"
                  >
                    <div className="flex-1">
                      <select
                        value={dep.predecessorId}
                        onChange={e => handleUpdateDependency(index, 'predecessorId', e.target.value)}
                        className="w-full px-2 py-1 text-xs rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-mono"
                      >
                        {availablePredecessors.map(p => (
                          <option key={p.id} value={p.id}>
                            [{p.id}] {p.name.slice(0, 30)}...
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="w-24">
                      <select
                        value={dep.type}
                        onChange={e => handleUpdateDependency(index, 'type', e.target.value as DependencyType)}
                        className="w-full px-1.5 py-1 text-xs rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono font-bold text-slate-800 dark:text-slate-200"
                        title="Tipo de ligadura de potencial de Roy"
                      >
                        <option value="FC">FC (Fin-Com.)</option>
                        <option value="CC">CC (Com.-Com.)</option>
                        <option value="FF">FF (Fin-Fin)</option>
                        <option value="CF">CF (Com.-Fin)</option>
                      </select>
                    </div>

                    <div className="w-20">
                      <input
                        type="number"
                        step="0.5"
                        value={dep.lag}
                        onChange={e => handleUpdateDependency(index, 'lag', parseFloat(e.target.value) || 0)}
                        placeholder="Lag"
                        className="w-full px-2 py-1 text-xs text-center font-mono rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                        title="Desfase / retardo temporal (positivo o negativo)"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveDependency(index)}
                      className="p-1 text-slate-400 hover:text-red-600 transition-colors"
                      title="Eliminar ligadura"
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
                  if (confirm(`¿Eliminar la tarea ${taskToEdit.id}: ${taskToEdit.name}?`)) {
                    onDelete(taskToEdit.id);
                    onClose();
                  }
                }}
                className="px-3 py-1.5 text-xs rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50 flex items-center gap-1 transition-colors font-medium"
              >
                <Trash2 className="w-4 h-4" /> Eliminar Tarea
              </button>
            ) : <div />}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 text-xs rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold flex items-center gap-1.5 shadow-sm transition-colors"
              >
                <Save className="w-4 h-4" /> Guardar Tarea
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
