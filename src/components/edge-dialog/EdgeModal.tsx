import React, { useState, useEffect } from 'react';
import { DependencyType } from '../../core/roy-engine/types';
import {
  ArrowRight,
  GitBranch,
  Trash2,
  Check,
  X,
  Clock,
  Info,
  Layers,
  CornerDownRight,
  MoveDiagonal,
} from 'lucide-react';

export interface EdgeEditData {
  targetId: string;
  targetName: string;
  predecessorId: string;
  predecessorName: string;
  type: DependencyType;
  lag: number;
  routingType?: 'default' | 'orthogonal' | 'free';
}

interface EdgeModalProps {
  isOpen: boolean;
  onClose: () => void;
  edgeData: EdgeEditData | null;
  onUpdateDependency: (
    targetId: string,
    predecessorId: string,
    type: DependencyType,
    lag: number,
    routingType?: 'default' | 'orthogonal' | 'free'
  ) => void;
  onDeleteDependency: (targetId: string, predecessorId: string) => void;
}

export const EdgeModal: React.FC<EdgeModalProps> = ({
  isOpen,
  onClose,
  edgeData,
  onUpdateDependency,
  onDeleteDependency,
}) => {
  const [type, setType] = useState<DependencyType>('FC');
  const [lag, setLag] = useState<number>(0);
  const [routingType, setRoutingType] = useState<'default' | 'orthogonal' | 'free'>('default');

  useEffect(() => {
    if (edgeData) {
      setType(edgeData.type);
      setLag(edgeData.lag);
      setRoutingType(edgeData.routingType || 'default');
    }
  }, [edgeData]);

  if (!isOpen || !edgeData) return null;

  const handleSave = () => {
    onUpdateDependency(edgeData.targetId, edgeData.predecessorId, type, lag, routingType);
    onClose();
  };

  const handleDelete = () => {
    if (confirm(`¿Eliminar la ligadura entre ${edgeData.predecessorId} y ${edgeData.targetId}?`)) {
      onDeleteDependency(edgeData.targetId, edgeData.predecessorId);
      onClose();
    }
  };

  const dependencyTypes: Array<{
    type: DependencyType;
    label: string;
    description: string;
    formula: string;
  }> = [
    {
      type: 'FC',
      label: 'Fin a Comienzo (FC)',
      description: 'La sucesora comienza cuando termina la predecesora + retardo.',
      formula: 'ES_j ≥ EF_i + lag',
    },
    {
      type: 'CC',
      label: 'Comienzo a Comienzo (CC)',
      description: 'La sucesora comienza tras el inicio de la predecesora + retardo.',
      formula: 'ES_j ≥ ES_i + lag',
    },
    {
      type: 'FF',
      label: 'Fin a Fin (FF)',
      description: 'La sucesora no puede terminar antes que la predecesora + retardo.',
      formula: 'EF_j ≥ EF_i + lag',
    },
    {
      type: 'CF',
      label: 'Comienzo a Fin (CF)',
      description: 'La sucesora no puede terminar antes de que empiece la predecesora + retardo.',
      formula: 'EF_j ≥ ES_i + lag',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col">
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/40">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-100 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400">
              <GitBranch className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Editar Ligadura ROY
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Ajusta el tipo de precedencia potencial y el desfase temporal
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

        <div className="p-6 space-y-5 overflow-y-auto">
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-xs">
            <div className="flex-1 min-w-0">
              <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 block mb-0.5">
                Predecesora (Origen)
              </span>
              <div className="flex items-center gap-1.5">
                <span className="font-mono font-bold px-1.5 py-0.5 rounded bg-blue-600 text-white text-[11px]">
                  {edgeData.predecessorId}
                </span>
                <span className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                  {edgeData.predecessorName}
                </span>
              </div>
            </div>

            <div className="px-3 text-slate-400 dark:text-slate-500 flex flex-col items-center">
              <ArrowRight className="w-4 h-4 text-blue-500" />
            </div>

            <div className="flex-1 min-w-0 text-right">
              <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 block mb-0.5">
                Sucesora (Destino)
              </span>
              <div className="flex items-center justify-end gap-1.5">
                <span className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                  {edgeData.targetName}
                </span>
                <span className="font-mono font-bold px-1.5 py-0.5 rounded bg-indigo-600 text-white text-[11px]">
                  {edgeData.targetId}
                </span>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
              Tipo de Ligadura Canónica de Roy:
            </label>
            <div className="grid grid-cols-2 gap-2">
              {dependencyTypes.map((item) => (
                <button
                  key={item.type}
                  type="button"
                  onClick={() => setType(item.type)}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    type === item.type
                      ? 'border-blue-600 bg-blue-50/70 dark:bg-blue-950/40 ring-2 ring-blue-500/20'
                      : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 bg-white dark:bg-slate-800/40'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-xs text-slate-900 dark:text-white">
                      {item.label}
                    </span>
                    {type === item.type && (
                      <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                    )}
                  </div>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 mb-1.5">
                    {item.description}
                  </p>
                  <span className="inline-block px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[10px] font-mono text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                    {item.formula}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                Retardo / Desfase temporal (lag):
              </label>
              <span className="text-[11px] font-mono font-semibold text-blue-600 dark:text-blue-400">
                {lag > 0 ? `+${lag} meses` : lag < 0 ? `${lag} meses` : '0 meses (Inmediato)'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setLag(prev => prev - 1)}
                className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-base flex items-center justify-center transition-colors"
              >
                -
              </button>
              <input
                type="number"
                value={lag}
                onChange={(e) => setLag(parseInt(e.target.value, 10) || 0)}
                className="flex-1 h-10 px-3 text-center font-mono font-bold rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
              <button
                type="button"
                onClick={() => setLag(prev => prev + 1)}
                className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-base flex items-center justify-center transition-colors"
              >
                +
              </button>
            </div>
            <p className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
              <Info className="w-3 h-3 shrink-0" />
              Valores positivos representan retardos; valores negativos representan solapes o adelantos.
            </p>
          </div>

          {/* Selector de trazado específico de esta ligadura */}
          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 mb-1.5">
              <Layers className="w-3.5 h-3.5 text-slate-400" />
              Trazado geométrico de la línea:
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setRoutingType('default')}
                className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                  routingType === 'default'
                    ? 'border-blue-600 bg-blue-50/70 dark:bg-blue-950/40 ring-2 ring-blue-500/20 text-blue-700 dark:text-blue-300 font-bold'
                    : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 bg-white dark:bg-slate-800/40 text-slate-600 dark:text-slate-400 font-medium'
                } text-xs flex flex-col items-center gap-1`}
              >
                <span className="text-[11px]">Predeterminado</span>
                <span className="text-[9px] text-slate-400 font-normal">Sigue al lienzo</span>
              </button>
              <button
                type="button"
                onClick={() => setRoutingType('orthogonal')}
                className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                  routingType === 'orthogonal'
                    ? 'border-blue-600 bg-blue-50/70 dark:bg-blue-950/40 ring-2 ring-blue-500/20 text-blue-700 dark:text-blue-300 font-bold'
                    : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 bg-white dark:bg-slate-800/40 text-slate-600 dark:text-slate-400 font-medium'
                } text-xs flex flex-col items-center gap-1`}
              >
                <div className="flex items-center gap-1 text-[11px]">
                  <CornerDownRight className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                  <span>Ortogonal</span>
                </div>
                <span className="text-[9px] text-slate-400 font-normal">Codos de 90°</span>
              </button>
              <button
                type="button"
                onClick={() => setRoutingType('free')}
                className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                  routingType === 'free'
                    ? 'border-emerald-600 bg-emerald-50/70 dark:bg-emerald-950/40 ring-2 ring-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-bold'
                    : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 bg-white dark:bg-slate-800/40 text-slate-600 dark:text-slate-400 font-medium'
                } text-xs flex flex-col items-center gap-1`}
              >
                <div className="flex items-center gap-1 text-[11px]">
                  <MoveDiagonal className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                  <span>Diagonal</span>
                </div>
                <span className="text-[9px] text-slate-400 font-normal">Ángulo libre</span>
              </button>
            </div>
          </div>
        </div>

        <div className="px-6 py-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex items-center justify-between">
          <button
            type="button"
            onClick={handleDelete}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Eliminar Ligadura</span>
          </button>

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
              <span>Guardar Cambios</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
