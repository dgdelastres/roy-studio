import { memo, useState, useRef, useEffect } from 'react';
import {
  BaseEdge,
  EdgeLabelRenderer,
  getSmoothStepPath,
  getBezierPath,
  EdgeProps,
  Position,
  useReactFlow,
} from '@xyflow/react';
import { DependencyType } from '../../core/roy-engine/types';
import { Move } from 'lucide-react';

export interface RoyEdgeData {
  type: DependencyType;
  lag: number;
  isCritical?: boolean;
  routingType?: 'smoothstep' | 'bezier';
  customCenterX?: number;
  customCenterY?: number;
  onDoubleClick?: () => void;
  onUpdateCenter?: (newCenterX: number | undefined, newCenterY: number | undefined) => void;
  onUpdateCenterX?: (newCenterX: number | undefined) => void;
}

export const RoyEdge = memo(({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  style = {},
  markerEnd,
  data,
}: EdgeProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isDraggingBend, setIsDraggingBend] = useState(false);
  const { screenToFlowPosition } = useReactFlow();

  const edgeData = data as unknown as RoyEdgeData | undefined;
  const isCritical = edgeData?.isCritical ?? false;
  const relType = edgeData?.type ?? 'FC';
  const lag = edgeData?.lag ?? 0;
  const routingType = edgeData?.routingType ?? 'smoothstep';
  const customCenterX = edgeData?.customCenterX;
  const customCenterY = edgeData?.customCenterY;

  const pathRef = useRef<SVGPathElement>(null);
  const [intermediateArrows, setIntermediateArrows] = useState<{ x: number; y: number; angle: number }[]>([]);

  let edgePath = '';
  let labelX = 0;
  let labelY = 0;

  if (routingType === 'bezier') {
    const [bPath, bx, by] = getBezierPath({
      sourceX,
      sourceY,
      sourcePosition: Position.Right,
      targetX,
      targetY,
      targetPosition: Position.Left,
      curvature: 0.25,
    });
    edgePath = bPath;
    labelX = bx;
    labelY = by;
  } else {
    // Trazado ortogonal limpio por defecto (tipo ingeniería)
    const [stepPath, sx, sy] = getSmoothStepPath({
      sourceX,
      sourceY,
      sourcePosition: Position.Right,
      targetX,
      targetY,
      targetPosition: Position.Left,
      borderRadius: 12,
      offset: 24,
      centerX: customCenterX,
      centerY: customCenterY,
    });
    edgePath = stepPath;
    labelX = sx;
    labelY = sy;
  }

  // Cálculo dinámico de flechas direccionales intermedias cada ~130px (Decisión grill-me)
  useEffect(() => {
    if (!pathRef.current) return;
    try {
      const svgPath = pathRef.current;
      const totalLength = svgPath.getTotalLength();
      if (totalLength < 90) {
        setIntermediateArrows([]);
        return;
      }

      let count = 1;
      if (totalLength >= 360) {
        count = Math.min(5, Math.floor(totalLength / 130));
      } else if (totalLength >= 200) {
        count = 2;
      }

      const arrows: { x: number; y: number; angle: number }[] = [];
      for (let i = 1; i <= count; i++) {
        const dist = (i / (count + 1)) * totalLength;
        const pt = svgPath.getPointAtLength(dist);
        const nextPt = svgPath.getPointAtLength(Math.min(dist + 2, totalLength));
        const angle = Math.atan2(nextPt.y - pt.y, nextPt.x - pt.x) * (180 / Math.PI);
        arrows.push({ x: Math.round(pt.x * 10) / 10, y: Math.round(pt.y * 10) / 10, angle });
      }
      setIntermediateArrows(arrows);
    } catch {
      // Entornos sin soporte de SVGPathElement.getTotalLength()
    }
  }, [edgePath]);

  const lagString = lag !== 0 ? (lag > 0 ? `+${lag}` : `${lag}`) : '';
  const labelText = `${relType}${lagString ? ' ' + lagString : ''}`;

  const normalStroke = (isHovered || isDraggingBend) ? '#2563EB' : '#475569';
  const criticalStroke = (isHovered || isDraggingBend) ? '#B91C1C' : '#DC2626';
  const activeStroke = isCritical ? criticalStroke : (style.stroke || normalStroke);
  const strokeWidth = isCritical
    ? (isHovered || isDraggingBend ? 4.2 : 3.2)
    : (isHovered || isDraggingBend ? 3.2 : 2.2);

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    edgeData?.onDoubleClick?.();
  };

  // Tirador arrastrable de bloqueo/quiebre bidireccional X/Y (Decisión grill-me)
  const handlePointerDownBend = (e: React.PointerEvent) => {
    e.stopPropagation();
    e.preventDefault();
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    setIsDraggingBend(true);
  };

  const handlePointerMoveBend = (e: React.PointerEvent) => {
    if (!isDraggingBend) return;
    const flowPos = screenToFlowPosition({ x: e.clientX, y: e.clientY });
    const newX = Math.round(flowPos.x);
    const newY = Math.round(flowPos.y);
    if (edgeData?.onUpdateCenter) {
      edgeData.onUpdateCenter(newX, newY);
    } else {
      edgeData?.onUpdateCenterX?.(newX);
    }
  };

  const handlePointerUpBend = (e: React.PointerEvent) => {
    if (!isDraggingBend) return;
    try {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      // Ignorar si el puntero ya se liberó
    }
    setIsDraggingBend(false);
  };

  const handleResetBend = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (edgeData?.onUpdateCenter) {
      edgeData.onUpdateCenter(undefined, undefined);
    } else {
      edgeData?.onUpdateCenterX?.(undefined);
    }
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
        ref={pathRef}
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
          transition: isDraggingBend ? 'none' : 'stroke 0.15s ease, stroke-width 0.15s ease',
        }}
      />

      {/* Flechas direccionales intermedias a lo largo de la ligadura (Decisión grill-me) */}
      {intermediateArrows.map((arr, idx) => (
        <path
          key={idx}
          d="M -4.5 -3.5 L 3.5 0 L -4.5 3.5 Z"
          fill={activeStroke}
          transform={`translate(${arr.x}, ${arr.y}) rotate(${arr.angle})`}
          className="pointer-events-none transition-transform"
        />
      ))}

      {/* Etiqueta y Tirador de Quiebre (Bloqueo) */}
      <EdgeLabelRenderer>
        <div
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            pointerEvents: 'all',
            zIndex: (isHovered || isDraggingBend) ? 60 : (isCritical ? 30 : 10),
          }}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          className="flex items-center gap-1"
        >
          {/* Badge con Tipo de Ligadura y Retardo */}
          <div
            onDoubleClick={handleDoubleClick}
            className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold tracking-tight shadow-sm border select-none transition-all duration-150 cursor-pointer ${
              (isHovered || isDraggingBend) ? 'scale-105 shadow-lg ring-2 ring-blue-500' : ''
            } ${
              isCritical
                ? 'bg-red-600 text-white border-red-700 shadow-red-500/20'
                : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-400 dark:border-slate-600'
            }`}
            title={`Ligadura: ${relType} con retardo ${lag} meses (Haz doble clic para editar o eliminar)`}
          >
            {labelText}
          </div>

          {/* Tirador arrastrable para ajustar el quiebre/bloqueo de la ligadura */}
          {(isHovered || isDraggingBend || customCenterX !== undefined || customCenterY !== undefined) && (
            <div
              onPointerDown={handlePointerDownBend}
              onPointerMove={handlePointerMoveBend}
              onPointerUp={handlePointerUpBend}
              onDoubleClick={handleResetBend}
              className={`p-1 rounded-md border text-[10px] shadow-md transition-all cursor-move flex items-center justify-center ${
                isDraggingBend
                  ? 'bg-blue-600 text-white border-blue-700 ring-2 ring-blue-400 scale-125'
                  : (customCenterX !== undefined || customCenterY !== undefined)
                  ? 'bg-amber-100 dark:bg-amber-950/80 border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-300'
                  : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-blue-950/50 hover:text-blue-600'
              }`}
              title={
                (customCenterX !== undefined || customCenterY !== undefined)
                  ? `Quiebre fijado en (x=${customCenterX ?? 'auto'}, y=${customCenterY ?? 'auto'}). Arrastra para mover; doble clic para centrar automáticamente.`
                  : 'Arrastra este tirador para moldear el quiebre de la ligadura en horizontal y vertical; doble clic para centrar.'
              }
            >
              <Move className="w-3 h-3" />
            </div>
          )}
        </div>
      </EdgeLabelRenderer>
    </g>
  );
});

RoyEdge.displayName = 'RoyEdge';
