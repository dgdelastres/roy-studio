import React, { useState, useEffect } from 'react';
import { Department } from '../../core/roy-engine/types';
import { PILPIS_DEPARTMENTS } from '../../theme/departments';
import {
  Users,
  Plus,
  Trash2,
  Check,
  X,
  RotateCcw,
  Palette,
  Briefcase,
} from 'lucide-react';

interface DepartmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  departments: Department[];
  onSaveDepartments: (departments: Department[]) => void;
  taskCountsByDept: Record<string, number>;
}

const PRESET_COLORS = [
  '#2563EB', // Blue
  '#7C3AED', // Purple
  '#0D9488', // Teal
  '#EA580C', // Orange
  '#16A34A', // Green
  '#475569', // Slate
  '#DC2626', // Red
  '#D97706', // Amber
  '#0284C7', // Sky
  '#9333EA', // Violet
  '#059669', // Emerald
  '#E11D48', // Rose
];

export const DepartmentModal: React.FC<DepartmentModalProps> = ({
  isOpen,
  onClose,
  departments,
  onSaveDepartments,
  taskCountsByDept,
}) => {
  const [localDepts, setLocalDepts] = useState<Department[]>(departments);

  useEffect(() => {
    setLocalDepts(departments);
  }, [departments, isOpen]);

  if (!isOpen) return null;

  const handleUpdate = (id: string, field: keyof Department, value: string) => {
    setLocalDepts(prev =>
      prev.map(d => {
        if (d.id === id) {
          const updated = { ...d, [field]: value };
          if (field === 'color') {
            updated.border = value;
            updated.textColor = value;
            updated.lightBg = `${value}15`;
          }
          return updated;
        }
        return d;
      })
    );
  };

  const handleAddDepartment = () => {
    const nextNum = localDepts.length + 1;
    const newId = `D${nextNum}`;
    const newColor = PRESET_COLORS[(nextNum - 1) % PRESET_COLORS.length];
    const newDept: Department = {
      id: newId,
      code: `D${nextNum}-NUEVO`,
      name: `Nuevo Equipo de Trabajo ${nextNum}`,
      color: newColor,
      lightBg: `${newColor}15`,
      border: newColor,
      textColor: newColor,
      description: 'Equipo de trabajo técnico',
      personnel: [],
    };
    setLocalDepts(prev => [...prev, newDept]);
  };

  const handleDeleteDepartment = (id: string) => {
    const taskCount = taskCountsByDept[id] || 0;
    if (taskCount > 0) {
      alert(`No se puede eliminar el equipo ${id} porque tiene ${taskCount} tareas asignadas. Reasigna esas tareas primero.`);
      return;
    }
    setLocalDepts(prev => prev.filter(d => d.id !== id));
  };

  const handleResetDefaults = () => {
    if (confirm('¿Restablecer los equipos a la configuración oficial del anteproyecto PILPIS?')) {
      setLocalDepts(PILPIS_DEPARTMENTS);
    }
  };

  const handleSave = () => {
    onSaveDepartments(localDepts);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]">
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/40">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-100 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Gestión de Equipos y Departamentos Técnicos
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Personaliza los nombres, códigos y paletas de color asignadas a cada equipo
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Equipos Configurados ({localDepts.length}):
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleResetDefaults}
                className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-medium flex items-center gap-1.5 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Restablecer PILPIS</span>
              </button>
              <button
                type="button"
                onClick={handleAddDepartment}
                className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-1 shadow-sm transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Añadir Equipo</span>
              </button>
            </div>
          </div>

          <div className="space-y-3">
            {localDepts.map((dept) => {
              const count = taskCountsByDept[dept.id] || 0;
              return (
                <div
                  key={dept.id}
                  className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-700/80 bg-slate-50/50 dark:bg-slate-800/40 space-y-2.5 transition-all hover:border-slate-300 dark:hover:border-slate-600"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="relative shrink-0 group">
                      <input
                        type="color"
                        value={dept.color}
                        onChange={(e) => handleUpdate(dept.id, 'color', e.target.value)}
                        className="w-8 h-8 rounded-lg cursor-pointer border border-slate-300 dark:border-slate-600 bg-transparent p-0 overflow-hidden"
                        title="Haz clic para elegir un color personalizado"
                      />
                    </div>

                    <span
                      className="font-mono font-bold text-xs px-2 py-1 rounded text-white shrink-0 shadow-xs"
                      style={{ backgroundColor: dept.color }}
                    >
                      {dept.id}
                    </span>

                    <input
                      type="text"
                      value={dept.code}
                      onChange={(e) => handleUpdate(dept.id, 'code', e.target.value)}
                      placeholder="Código (ej: D1-PROC)"
                      className="w-28 px-2 py-1 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />

                    <input
                      type="text"
                      value={dept.name}
                      onChange={(e) => handleUpdate(dept.id, 'name', e.target.value)}
                      placeholder="Nombre del Departamento o Equipo"
                      className="flex-1 px-2.5 py-1 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />

                    <span className="shrink-0 text-[11px] font-mono font-semibold px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 flex items-center gap-1">
                      <Briefcase className="w-3 h-3" />
                      {count} {count === 1 ? 'tarea' : 'tareas'}
                    </span>

                    <button
                      type="button"
                      onClick={() => handleDeleteDepartment(dept.id)}
                      disabled={count > 0}
                      className={`p-1.5 rounded-lg transition-colors ${
                        count > 0
                          ? 'text-slate-300 dark:text-slate-600 cursor-not-allowed'
                          : 'text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 cursor-pointer'
                      }`}
                      title={count > 0 ? 'No se puede eliminar mientras tenga tareas asignadas' : 'Eliminar equipo'}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex items-center gap-1.5 pl-10">
                    <span className="text-[10px] text-slate-400 flex items-center gap-1">
                      <Palette className="w-3 h-3" /> Color rápido:
                    </span>
                    <div className="flex items-center gap-1 flex-wrap">
                      {PRESET_COLORS.map((preset) => (
                        <button
                          key={preset}
                          type="button"
                          onClick={() => handleUpdate(dept.id, 'color', preset)}
                          className={`w-4 h-4 rounded-full border transition-transform ${
                            dept.color.toUpperCase() === preset.toUpperCase()
                              ? 'scale-125 border-slate-900 dark:border-white ring-1 ring-slate-400'
                              : 'border-transparent hover:scale-110'
                          }`}
                          style={{ backgroundColor: preset }}
                          title={preset}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="px-6 py-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex items-center justify-between">
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Los cambios se aplicarán instantáneamente en los nodos ROY, barras de Gantt y tablas.
          </p>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Aplicar Equipos</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
