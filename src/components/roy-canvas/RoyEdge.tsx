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
  points?: Array<{ x: number; y: number }>;
  onDoubleClick?: () => void;
}

/**
 * Convierte un arreglo de waypoints (Dagre) en una trayectoria SVG suave con esquinas redondeadas
 */
function pointsToSvgPath(points: Array<{ x: number; y: number }>, radius = 14): string {
  if (!points || points.length < 2) return '';
  if (points.length === 2) {
    return `M ${points[0].x} ${points[0].y} L ${points[1].x} ${points[1].y}`;
  }

  let path = `M ${points[0].x} ${points[0].y}`;
  for (let i = 1; i < points.length - 1; i++) {
    const pPrev = points[i - 1];
    const pCurr = points[i];
    const pNext = points[i + 1];

    const dPrev = Math.hypot(pCurr.x - pPrev.x, pCurr.y - pPrev.y);
    const dNext = Math.hypot(pNext.x - pCurr.x, pNext.y - pCurr.y);
    const r = Math.min(radius, dPrev / 2, dNext / 2);

    if (r < 2) {
      path += ` L ${pCurr.x} ${pCurr.y}`;
      continue;
    }

    const startX = pCurr.x - (r * (pCurr.x - pPrev.x)) / dPrev;
    const startY = pCurr.y - (r * (pCurr.y - pPrev.y)) / dPrev;
    const endX = pCurr.x + (r * (pNext.x - pCurr.x)) / dNext;
    const endY = pCurr.y + (r * (pNext.y - pCurr.y)) / dNext;

    path += ` L ${startX} ${startY} Q ${pCurr.x} ${pCurr.y} ${endX} ${endY}`;
  }
  path += ` L ${points[points.length - 1].x} ${points[points.length - 1].y}`;
  return path;
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

  // Si Dagre nos proporciona waypoints calculados, los usamos ajustando extremos
  let edgePath = '';
  let labelX = 0;
  let labelY = 0;

  if (edgeData?.points && edgeData.points.length >= 2) {
    const pts = edgeData.points.map((p, idx) => {
      if (idx === 0) return { x: sourceX, y: sourceY };
      if (idx === edgeData.points!.length - 1) return { x: targetX, y: targetY };
      return p;
    });
    edgePath = pointsToSvgPath(pts, 14);

    const midIdx = Math.floor(pts.length / 2);
    labelX = pts[midIdx].x;
    labelY = pts[midIdx].y;
  } else {
    // Fallback: getSmoothStepPath con radio y offset generosos
    const [stepPath, sx, sy] = getSmoothStepPath({
      sourceX,
      sourceY,
      sourcePosition,
      targetX,
      targetY,
      targetPosition,
      borderRadius: 14,
      offset: 24,
    });
    edgePath = stepPath;
    labelX = sx;
    labelY = sy;
  }

  const lagString = lag !== 0 ? (lag > 0 ? `+${lag}` : `${lag}`) : '';
  const labelText = `${relType}${lagString ? ' ' + lagString : ''}`;

  const normalStroke = isHovered ? '#2563EB' : '#475569';
  const criticalStroke = isHovered ? '#B91C1C' : '#DC2626';
  const activeStroke = isCritical ? criticalStroke : (style.stroke || normalStroke);
  const strokeWidth = isCritical ? (isHovered ? 4.2 : 3.2) : (isHovered ? 3.2 : 2.2);

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    edgeData?.onDoubleClick?.();
  };

  return (
    <g
      className="roy-edge-group group cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onDoubleClick={handleDoubleClick}
    >
      {/* Línea invisible ancha para captura fácil de clic y hover */}
      <path
        d={edgePath}
        fill="none"
        stroke="transparent"
        strokeWidth={20}
        className="cursor-pointer"
      />

      {/* Arista visible */}
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

      {/* Etiqueta de la Ligadura */}
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
          onDoubleClick={handleDoubleClick}
          className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold tracking-tight shadow-sm border select-none transition-all duration-150 cursor-pointer ${
            isHovered ? 'scale-110 shadow-lg ring-2 ring-blue-500' : ''
          } ${
            isCritical
              ? 'bg-red-600 text-white border-red-700 shadow-red-500/20'
              : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-400 dark:border-slate-600'
          }`}
          title={`Ligadura: ${relType} con retardo ${lag} meses (Haz doble clic para editar o eliminar)`}
        >
          {labelText}
        </div>
      </EdgeLabelRenderer>
    </g>
  );
});

RoyEdge.displayName = 'RoyEdge';
