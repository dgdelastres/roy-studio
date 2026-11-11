import { memo, useState } from 'react';
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
  id,
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
  const [isHovered, setIsHovered] = useState(false);
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
    borderRadius: 14,
    offset: 24,
  });

  const lagString = lag !== 0 ? (lag > 0 ? `+${lag}` : `${lag}`) : '';
  const labelText = `${relType}${lagString ? ' ' + lagString : ''}`;

  const normalStroke = isHovered ? '#2563EB' : '#475569';
  const criticalStroke = isHovered ? '#B91C1C' : '#DC2626';
  const activeStroke = isCritical ? criticalStroke : (style.stroke || normalStroke);
  const strokeWidth = isCritical ? (isHovered ? 4.2 : 3.2) : (isHovered ? 3.2 : 2.2);

  return (
    <g
      className="roy-edge-group group cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <path
        d={edgePath}
        fill="none"
        stroke="transparent"
        strokeWidth={18}
        className="cursor-pointer"
      />

      <BaseEdge
        id={id}
        path={edgePath}
        markerEnd={markerEnd}
        style={{
          ...style,
          stroke: activeStroke,
          strokeWidth,
          transition: 'stroke 0.15s ease, stroke-width 0.15s ease',
        }}
      />

      <EdgeLabelRenderer>
        <div
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            pointerEvents: 'all',
            zIndex: isHovered ? 50 : (isCritical ? 30 : 10),
          }}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono font-bold tracking-tight shadow-sm border select-none transition-transform duration-150 ${
            isHovered ? 'scale-110 shadow-md ring-2 ring-blue-400' : ''
          } ${
            isCritical
              ? 'bg-red-600 text-white border-red-700 shadow-red-500/20'
              : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-400 dark:border-slate-600'
          }`}
          title={`Ligadura: ${relType} con retardo ${lag}`}
        >
          {labelText}
        </div>
      </EdgeLabelRenderer>
    </g>
  );
});

RoyEdge.displayName = 'RoyEdge';
