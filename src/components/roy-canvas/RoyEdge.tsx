import { memo } from 'react';
import {
  BaseEdge,
  EdgeLabelRenderer,
  getSmoothStepPath,
  EdgeProps,
} from '@xyflow/react';
import { DependencyType } from '../../core/roy-engine/types';

export interface RoyEdgeData {
  type: DependencyType;
  lag: number;
  isCritical?: boolean;
}

export const RoyEdge = memo(({
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  data,
}: EdgeProps) => {
  const edgeData = data as unknown as RoyEdgeData | undefined;
  const isCritical = edgeData?.isCritical ?? false;
  const relType = edgeData?.type ?? 'FC';
  const lag = edgeData?.lag ?? 0;

  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
    borderRadius: 8,
  });

  const lagString = lag !== 0 ? (lag > 0 ? `+${lag}` : `${lag}`) : '';
  const labelText = `${relType}${lagString ? ' ' + lagString : ''}`;

  return (
    <>
      <BaseEdge
        path={edgePath}
        markerEnd={markerEnd}
        style={{
          ...style,
          stroke: isCritical ? '#DC2626' : (style.stroke || '#94A3B8'),
          strokeWidth: isCritical ? 2.8 : 1.6,
          strokeDasharray: isCritical ? undefined : undefined,
        }}
      />
      <EdgeLabelRenderer>
        <div
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            pointerEvents: 'all',
          }}
          className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold tracking-tight shadow-xs border select-none transition-all ${
            isCritical
              ? 'bg-red-600 text-white border-red-700 shadow-sm'
              : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:border-blue-400'
          }`}
          title={`Ligadura: ${relType} con retardo ${lag}`}
        >
          {labelText}
        </div>
      </EdgeLabelRenderer>
    </>
  );
});

RoyEdge.displayName = 'RoyEdge';
