import { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { Task, Department } from '../../core/roy-engine/types';
import { getDepartmentById } from '../../theme/departments';
import { AlertCircle, Clock } from 'lucide-react';

export interface RoyNodeData {
  task: Task;
  viewMode: 'full' | 'compact';
  onEdit?: (task: Task) => void;
  departments?: Department[];
}

export const RoyNode = memo(({ data, selected }: NodeProps) => {
  const { task, viewMode, onEdit, departments } = data as unknown as RoyNodeData;
  const dept = getDepartmentById(task.departmentId, departments);
  const isCritical = task.isCritical ?? false;

  const es = task.earlyStart ?? 0;
  const ef = task.earlyFinish ?? 0;
  const ls = task.lateStart ?? 0;
  const lf = task.lateFinish ?? 0;
  const ht = task.totalFloat ?? 0;
  const hl = task.freeFloat ?? 0;

  return (
    <div
      onClick={() => onEdit?.(task)}
      className={`group relative rounded-xl border text-xs shadow-md transition-all duration-200 select-none cursor-pointer bg-white dark:bg-slate-900 ${
        selected ? 'ring-2 ring-blue-500 shadow-xl scale-[1.01]' : ''
      } ${
        isCritical
          ? 'border-red-500 dark:border-red-500 shadow-red-500/10'
          : 'border-slate-300 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-lg'
      }`}
      style={{
        minWidth: viewMode === 'full' ? '280px' : '200px',
        maxWidth: viewMode === 'full' ? '300px' : '220px',
      }}
    >
      {/* Conectores de Entrada (Target): Invisibles por defecto, se iluminan al pasar el ratón por el contorno */}
      <Handle
        type="target"
        position={Position.Left}
        id="left-target-1"
        style={{ top: '15%' }}
        className="opacity-0 group-hover:opacity-90 hover:!opacity-100 !w-3 !h-3 !rounded-full !bg-emerald-500 hover:!bg-emerald-600 hover:!scale-125 !border-2 !border-white dark:!border-slate-900 shadow-md transition-all duration-150 cursor-crosshair z-20"
        title="Entrada Muy Alta (15%): Conexión superior"
      />
      <Handle
        type="target"
        position={Position.Left}
        id="left-target-top"
        style={{ top: '32%' }}
        className="opacity-0 group-hover:opacity-90 hover:!opacity-100 !w-3 !h-3 !rounded-full !bg-emerald-500 hover:!bg-emerald-600 hover:!scale-125 !border-2 !border-white dark:!border-slate-900 shadow-md transition-all duration-150 cursor-crosshair z-20"
        title="Entrada Alta (32%): Conecta aquí para ligaduras altas"
      />
      <Handle
        type="target"
        position={Position.Left}
        id="left-target-mid"
        style={{ top: '50%' }}
        className="opacity-0 group-hover:opacity-90 hover:!opacity-100 !w-3.5 !h-3.5 !rounded-full !bg-emerald-500 hover:!bg-emerald-600 hover:!scale-125 !border-2 !border-white dark:!border-slate-900 shadow-md transition-all duration-150 cursor-crosshair z-20"
        title="Entrada Central (50%): Conector principal de entrada"
      />
      <Handle
        type="target"
        position={Position.Left}
        id="left-target-bot"
        style={{ top: '68%' }}
        className="opacity-0 group-hover:opacity-90 hover:!opacity-100 !w-3 !h-3 !rounded-full !bg-emerald-500 hover:!bg-emerald-600 hover:!scale-125 !border-2 !border-white dark:!border-slate-900 shadow-md transition-all duration-150 cursor-crosshair z-20"
        title="Entrada Baja (68%): Conecta aquí para ligaduras bajas"
      />
      <Handle
        type="target"
        position={Position.Left}
        id="left-target-5"
        style={{ top: '85%' }}
        className="opacity-0 group-hover:opacity-90 hover:!opacity-100 !w-3 !h-3 !rounded-full !bg-emerald-500 hover:!bg-emerald-600 hover:!scale-125 !border-2 !border-white dark:!border-slate-900 shadow-md transition-all duration-150 cursor-crosshair z-20"
        title="Entrada Muy Baja (85%): Conexión inferior"
      />

      {/* Conectores de Salida (Source): Invisibles por defecto, se iluminan al pasar el ratón por el contorno */}
      <Handle
        type="source"
        position={Position.Right}
        id="right-source-1"
        style={{ top: '15%' }}
        className="opacity-0 group-hover:opacity-90 hover:!opacity-100 !w-3 !h-3 !rounded-full !bg-blue-600 hover:!bg-blue-700 hover:!scale-125 !border-2 !border-white dark:!border-slate-900 shadow-md transition-all duration-150 cursor-crosshair z-20"
        title="Salida Muy Alta (15%): Conexión superior"
      />
      <Handle
        type="source"
        position={Position.Right}
        id="right-source-top"
        style={{ top: '32%' }}
        className="opacity-0 group-hover:opacity-90 hover:!opacity-100 !w-3 !h-3 !rounded-full !bg-blue-600 hover:!bg-blue-700 hover:!scale-125 !border-2 !border-white dark:!border-slate-900 shadow-md transition-all duration-150 cursor-crosshair z-20"
        title="Salida Alta (32%): Arrastra hacia una sucesora para ligaduras altas"
      />
      <Handle
        type="source"
        position={Position.Right}
        id="right-source-mid"
        style={{ top: '50%' }}
        className="opacity-0 group-hover:opacity-90 hover:!opacity-100 !w-3.5 !h-3.5 !rounded-full !bg-blue-600 hover:!bg-blue-700 hover:!scale-125 !border-2 !border-white dark:!border-slate-900 shadow-md transition-all duration-150 cursor-crosshair z-20"
        title="Salida Central (50%): Conector principal de salida"
      />
      <Handle
        type="source"
        position={Position.Right}
        id="right-source-bot"
        style={{ top: '68%' }}
        className="opacity-0 group-hover:opacity-90 hover:!opacity-100 !w-3 !h-3 !rounded-full !bg-blue-600 hover:!bg-blue-700 hover:!scale-125 !border-2 !border-white dark:!border-slate-900 shadow-md transition-all duration-150 cursor-crosshair z-20"
        title="Salida Baja (68%): Arrastra hacia una sucesora para ligaduras bajas"
      />
      <Handle
        type="source"
        position={Position.Right}
        id="right-source-5"
        style={{ top: '85%' }}
        className="opacity-0 group-hover:opacity-90 hover:!opacity-100 !w-3 !h-3 !rounded-full !bg-blue-600 hover:!bg-blue-700 hover:!scale-125 !border-2 !border-white dark:!border-slate-900 shadow-md transition-all duration-150 cursor-crosshair z-20"
        title="Salida Muy Baja (85%): Conexión inferior"
      />

      {/* Cabecera de la Actividad */}
      <div
        className="px-2.5 py-1.5 rounded-t-[11px] border-b flex items-center justify-between gap-1.5"
        style={{
          backgroundColor: isCritical ? '#FEF2F2' : dept.lightBg,
          borderColor: isCritical ? '#FECACA' : dept.border,
        }}
      >
        <div className="flex items-center gap-1.5 min-w-0">
          <span
            className="font-mono font-bold px-1.5 py-0.5 rounded text-[11px] text-white shrink-0 shadow-sm"
            style={{ backgroundColor: isCritical ? '#DC2626' : dept.color }}
            title={`ID: Código identificador unívoco de la actividad (${task.id})`}
          >
            {task.id}
          </span>
          <span
            className="font-semibold text-slate-800 dark:text-slate-900 truncate text-[11px]"
            title={`Nombre de la Actividad: ${task.name}`}
          >
            {task.name}
          </span>
        </div>

        {isCritical && (
          <span
            className="shrink-0 flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-red-600 text-white font-mono font-bold text-[9px] tracking-wider uppercase shadow-xs"
            title="Actividad Crítica: Holgura Total = 0. Cualquier retraso demorará el plazo de entrega del proyecto"
          >
            <AlertCircle className="w-2.5 h-2.5" />
            CRÍTICA
          </span>
        )}
      </div>

      {/* Fila de Departamento y Duración */}
      <div className="px-2.5 py-1 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700/80 flex items-center justify-between text-[10px] text-slate-600 dark:text-slate-300">
        <span
          className="truncate max-w-[170px] cursor-help"
          title={`Equipo Responsable: ${dept.name} (${dept.code})`}
        >
          <span className="inline-block w-2 h-2 rounded-full mr-1.5" style={{ backgroundColor: dept.color }}></span>
          {dept.code}
        </span>
        <span
          className="font-mono font-semibold flex items-center gap-1 shrink-0 text-slate-700 dark:text-slate-200 cursor-help"
          title={`d: Duración estimada de la tarea = ${task.duration} meses`}
        >
          <Clock className="w-3 h-3 text-slate-400" />
          d = <strong className="text-slate-900 dark:text-white">{task.duration}</strong> m
        </span>
      </div>

      {/* Cuadrantes de Potenciales de Roy */}
      {viewMode === 'full' ? (
        <div className="p-2 space-y-1.5 text-[11px] font-mono">
          {/* Tiempos Tempranos (ES, EF) */}
          <div className="grid grid-cols-2 gap-1.5">
            <div
              className="bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-900/50 rounded-lg px-2 py-1 flex justify-between items-center cursor-help hover:border-blue-400 transition-colors"
              title="ES (Early Start / Comienzo Más Temprano): Mínimo mes en el que puede iniciarse la tarea según las restricciones de sus predecesoras."
            >
              <span className="text-[10px] text-blue-700 dark:text-blue-300 font-semibold underline decoration-dotted decoration-blue-400">
                ES (In.T):
              </span>
              <span className="font-bold text-blue-950 dark:text-blue-200">{es}</span>
            </div>
            <div
              className="bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-900/50 rounded-lg px-2 py-1 flex justify-between items-center cursor-help hover:border-blue-400 transition-colors"
              title="EF (Early Finish / Fin Más Temprano): Mes más temprano en el que puede concluir la tarea (EF = ES + Duración)."
            >
              <span className="text-[10px] text-blue-700 dark:text-blue-300 font-semibold underline decoration-dotted decoration-blue-400">
                EF (Fin.T):
              </span>
              <span className="font-bold text-blue-950 dark:text-blue-200">{ef}</span>
            </div>
          </div>

          {/* Tiempos Tardíos (LS, LF) */}
          <div className="grid grid-cols-2 gap-1.5">
            <div
              className="bg-amber-50/70 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-900/50 rounded-lg px-2 py-1 flex justify-between items-center cursor-help hover:border-amber-400 transition-colors"
              title="LS (Late Start / Comienzo Más Tardío): Fecha límite en que puede empezar la tarea sin retrasar el plazo final del proyecto."
            >
              <span className="text-[10px] text-amber-700 dark:text-amber-300 font-semibold underline decoration-dotted decoration-amber-400">
                LS (In.L):
              </span>
              <span className="font-bold text-amber-950 dark:text-amber-200">{ls}</span>
            </div>
            <div
              className="bg-amber-50/70 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-900/50 rounded-lg px-2 py-1 flex justify-between items-center cursor-help hover:border-amber-400 transition-colors"
              title="LF (Late Finish / Fin Más Tardío): Fecha límite en que debe terminar la tarea sin comprometer la entrega final (LF = LS + Duración)."
            >
              <span className="text-[10px] text-amber-700 dark:text-amber-300 font-semibold underline decoration-dotted decoration-amber-400">
                LF (Fin.L):
              </span>
              <span className="font-bold text-amber-950 dark:text-amber-200">{lf}</span>
            </div>
          </div>

          {/* Holguras (HT, HL) */}
          <div className="grid grid-cols-2 gap-1.5 pt-0.5 border-t border-slate-100 dark:border-slate-800">
            <div
              className={`rounded-lg px-2 py-1 flex justify-between items-center border cursor-help transition-colors ${
                isCritical
                  ? 'bg-red-50 dark:bg-red-950/60 border-red-300 dark:border-red-800 text-red-700 dark:text-red-300 font-bold'
                  : 'bg-slate-100 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-400'
              }`}
              title="HT (Holgura Total = LS - ES = LF - EF): Margen total de tiempo que puede demorarse esta tarea sin retrasar el fin del proyecto. Si HT=0, la tarea es CRÍTICA."
            >
              <span className="text-[10px] font-semibold underline decoration-dotted">HT:</span>
              <span className="font-bold">{ht}</span>
            </div>
            <div
              className="bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 flex justify-between items-center text-slate-700 dark:text-slate-300 cursor-help hover:border-slate-400 transition-colors"
              title="HL (Holgura Libre = min(ES_suc - (ES + lag_canónico))): Margen de tiempo que puede demorarse la tarea sin retrasar el comienzo más temprano de ninguna de sus tareas sucesoras."
            >
              <span className="text-[10px] font-semibold underline decoration-dotted">HL:</span>
              <span className="font-bold">{hl}</span>
            </div>
          </div>
        </div>
      ) : (
        /* Vista Compacta (ES, LS, HT) */
        <div className="p-2 grid grid-cols-3 gap-1 text-[11px] font-mono text-center">
          <div
            className="bg-blue-50/60 dark:bg-blue-950/30 rounded py-0.5 cursor-help"
            title="ES: Early Start (Inicio más temprano en meses)"
          >
            <div className="text-[9px] text-blue-600 dark:text-blue-400 font-semibold">ES</div>
            <div className="font-bold text-blue-950 dark:text-blue-200">{es}</div>
          </div>
          <div
            className="bg-amber-50/60 dark:bg-amber-950/30 rounded py-0.5 cursor-help"
            title="LS: Late Start (Inicio más tardío en meses)"
          >
            <div className="text-[9px] text-amber-600 dark:text-amber-400 font-semibold">LS</div>
            <div className="font-bold text-amber-950 dark:text-amber-200">{ls}</div>
          </div>
          <div
            className={`rounded py-0.5 cursor-help ${
              isCritical
                ? 'bg-red-100 dark:bg-red-950/70 text-red-700 dark:text-red-300 font-bold'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
            }`}
            title="HT: Holgura Total (Margen total sin retrasar el proyecto)"
          >
            <div className="text-[9px] font-semibold">HT</div>
            <div>{ht}</div>
          </div>
        </div>
      )}
    </div>
  );
});

RoyNode.displayName = 'RoyNode';
