import React, { useMemo, useCallback, useEffect, useState } from 'react';
import {
  ReactFlow,
  ReactFlowProvider,
  useReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  Connection,
  Edge,
  Node,
  BackgroundVariant,
  MarkerType,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { Task, DependencyType, Department } from '../../core/roy-engine/types';
import { wouldCreateCycle } from '../../core/roy-engine/calculator';
import { RoyNode } from './RoyNode';
import { RoyEdge } from './RoyEdge';
import { getLayoutedElements, LayoutDirection } from './layout';
import { getDepartmentById } from '../../theme/departments';
import {
  AlertTriangle,
  RefreshCw,
  Maximize2,
  ZoomIn,
  ZoomOut,
  Locate,
  PlusCircle,
} from 'lucide-react';

interface RoyCanvasProps {
  tasks: Task[];
  criticalTasks?: string[];
  criticalEdges: Array<{ source: string; target: string }>;
  viewMode: 'full' | 'compact';
  direction: LayoutDirection;
  departments?: Department[];
  isActive?: boolean;
  onEditTask: (task: Task) => void;
  onAddTask?: (initialPosition?: { x: number; y: number }) => void;
  onDeleteTask?: (taskId: string) => void;
  onDeleteDependency?: (targetId: string, predecessorId: string) => void;
  onReconnectDependency?: (oldEdge: Edge, newConnection: Connection) => void;
  onAddDependency: (
    targetId: string,
    predecessorId: string,
    type: DependencyType,
    lag: number,
    sourceHandle?: string,
    targetHandle?: string
  ) => void;
  onEditDependency?: (targetId: string, predecessorId: string, type: DependencyType, lag: number) => void;
  hasCycle?: boolean;
  cyclePath?: string[];
}

// Distribución inteligente de puertos en 3 alturas (Superior 25%, Centro 50%, Inferior 75%)
const getDistributedSourceHandle = (
  predId: string,
  targetId: string,
  tasks: Task[],
  explicitHandle?: string
): string => {
  if (explicitHandle && explicitHandle.startsWith('right-source')) return explicitHandle;

  const successors = tasks
    .filter(t => t.dependencies.some(d => d.predecessorId === predId))
    .map(t => t.id);

  if (successors.length <= 1) return 'right-source-mid';

  const index = successors.indexOf(targetId);
  if (successors.length === 2) {
    return index === 0 ? 'right-source-top' : 'right-source-bot';
  }

  const slots = ['right-source-top', 'right-source-mid', 'right-source-bot'];
  return slots[index % slots.length];
};

const getDistributedTargetHandle = (
  predId: string,
  task: Task,
  explicitHandle?: string
): string => {
  if (explicitHandle && explicitHandle.startsWith('left-target')) return explicitHandle;

  const predecessors = task.dependencies.map(d => d.predecessorId);
  if (predecessors.length <= 1) return 'left-target-mid';

  const index = predecessors.indexOf(predId);
  if (predecessors.length === 2) {
    return index === 0 ? 'left-target-top' : 'left-target-bot';
  }

  const slots = ['left-target-top', 'left-target-mid', 'left-target-bot'];
  return slots[index % slots.length];
};

const nodeTypes = {
  royNode: RoyNode,
};

const edgeTypes = {
  royEdge: RoyEdge,
};

const RoyCanvasContent: React.FC<RoyCanvasProps> = ({
  tasks,
  criticalEdges,
  viewMode,
  direction,
  departments,
  isActive = true,
  onEditTask,
  onAddTask,
  onDeleteTask,
  onDeleteDependency,
  onReconnectDependency,
  onAddDependency,
  onEditDependency,
  hasCycle,
  cyclePath,
}) => {
  const { fitView, zoomIn, zoomOut, setViewport, screenToFlowPosition } = useReactFlow();
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);
  const [edgeCenterXs, setEdgeCenterXs] = useState<Record<string, number>>({});
  const [edgeCenterYs, setEdgeCenterYs] = useState<Record<string, number>>({});

  // Borrado directo de ligaduras con tecla Supr / Backspace
  const handleEdgesDelete = useCallback(
    (deletedEdges: Edge[]) => {
      deletedEdges.forEach(edge => {
        onDeleteDependency?.(edge.target, edge.source);
      });
    },
    [onDeleteDependency]
  );

  // Borrado directo de tareas con tecla Supr / Backspace
  const handleNodesDelete = useCallback(
    (deletedNodes: Node[]) => {
      deletedNodes.forEach(node => {
        onDeleteTask?.(node.id);
      });
    },
    [onDeleteTask]
  );

  // Desplazamiento interactivo de conexiones en el contorno (Reconexión de extremos)
  const handleReconnect = useCallback(
    (oldEdge: Edge, newConnection: Connection) => {
      if (!newConnection.source || !newConnection.target) return;
      if (newConnection.source === newConnection.target) return;
      if (
        (oldEdge.source !== newConnection.source || oldEdge.target !== newConnection.target) &&
        wouldCreateCycle(tasks, newConnection.source, newConnection.target)
      ) {
        alert('¡Acción no permitida! Mover esta ligadura generaría un bucle circular en la red ROY.');
        return;
      }
      onReconnectDependency?.(oldEdge, newConnection);
    },
    [tasks, onReconnectDependency]
  );

  // Cerrar el menú contextual al hacer clic fuera o pulsar Escape
  useEffect(() => {
    const handleGlobalClick = () => setContextMenu(null);
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setContextMenu(null);
    };

    window.addEventListener('click', handleGlobalClick);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('click', handleGlobalClick);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Ajustar la vista suavemente cuando se vuelve a activar la pestaña "Red ROY"
  useEffect(() => {
    if (isActive) {
      const timer = setTimeout(() => {
        fitView({ padding: 0.2, duration: 250 });
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [isActive, fitView]);

  const isCriticalEdge = useCallback(
    (source: string, target: string) => {
      return criticalEdges.some(e => e.source === source && e.target === target);
    },
    [criticalEdges]
  );

  const handleUpdateEdgeCenter = useCallback(
    (edgeId: string, newX: number | undefined, newY: number | undefined) => {
      setEdgeCenterXs(prev => {
        const next = { ...prev };
        if (newX === undefined) {
          delete next[edgeId];
        } else {
          next[edgeId] = newX;
        }
        return next;
      });
      setEdgeCenterYs(prev => {
        const next = { ...prev };
        if (newY === undefined) {
          delete next[edgeId];
        } else {
          next[edgeId] = newY;
        }
        return next;
      });
    },
    []
  );

  const initialNodes: Node[] = useMemo(() => {
    return tasks.map(task => ({
      id: task.id,
      type: 'royNode',
      position: task.position || { x: 0, y: 0 },
      data: {
        task,
        viewMode,
        onEdit: onEditTask,
        departments,
      },
    }));
  }, [tasks, viewMode, onEditTask, departments]);

  const initialEdges: Edge[] = useMemo(() => {
    const edgesList: Edge[] = [];
    tasks.forEach(task => {
      task.dependencies.forEach(dep => {
        const edgeId = `e-${dep.predecessorId}-${task.id}`;
        const critical = isCriticalEdge(dep.predecessorId, task.id);
        const sourceHandle = getDistributedSourceHandle(
          dep.predecessorId,
          task.id,
          tasks,
          dep.sourceHandle
        );
        const targetHandle = getDistributedTargetHandle(
          dep.predecessorId,
          task,
          dep.targetHandle
        );

        edgesList.push({
          id: edgeId,
          source: dep.predecessorId,
          target: task.id,
          sourceHandle,
          targetHandle,
          type: 'royEdge',
          reconnectable: true,
          data: {
            type: dep.type,
            lag: dep.lag,
            isCritical: critical,
            customCenterX: edgeCenterXs[edgeId],
            customCenterY: edgeCenterYs[edgeId],
            onDoubleClick: () => onEditDependency?.(task.id, dep.predecessorId, dep.type, dep.lag),
            onUpdateCenter: (newX: number | undefined, newY: number | undefined) =>
              handleUpdateEdgeCenter(edgeId, newX, newY),
          },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: critical ? '#DC2626' : '#475569',
            width: critical ? 22 : 18,
            height: critical ? 22 : 18,
          },
        });
      });
    });
    return edgesList;
  }, [tasks, isCriticalEdge, onEditDependency, edgeCenterXs, edgeCenterYs, handleUpdateEdgeCenter]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Sincronización reactiva inmediata de nodos en pantalla ante cualquier cambio de datos (Punto 3)
  useEffect(() => {
    setNodes((currentNodes) => {
      if (currentNodes.length === 0) {
        const { nodes: layoutedNodes } = getLayoutedElements(
          initialNodes,
          initialEdges,
          direction,
          viewMode
        );
        return layoutedNodes;
      }

      const nodeMap = new Map(currentNodes.map(n => [n.id, n]));
      return tasks.map(task => {
        const existingNode = nodeMap.get(task.id);
        const position = existingNode?.position || task.position || {
          x: (currentNodes.length % 5) * 320,
          y: Math.floor(currentNodes.length / 5) * 180,
        };

        return {
          id: task.id,
          type: 'royNode',
          position,
          data: {
            task,
            viewMode,
            onEdit: onEditTask,
            departments,
          },
        };
      });
    });
  }, [tasks, viewMode, onEditTask, departments, setNodes]);

  // Sincronización reactiva inmediata de aristas (Punto 3)
  useEffect(() => {
    setEdges(initialEdges);
  }, [initialEdges, setEdges]);

  // Auto-organización con algoritmo Dagre
  const applyLayout = useCallback(
    (dir: LayoutDirection = direction) => {
      const freshNodes: Node[] = tasks.map(task => ({
        id: task.id,
        type: 'royNode',
        position: { x: 0, y: 0 },
        data: {
          task,
          viewMode,
          onEdit: onEditTask,
          departments,
        },
      }));
      const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
        freshNodes,
        initialEdges,
        dir,
        viewMode
      );
      setNodes(layoutedNodes);
      setEdges(layoutedEdges);
    },
    [tasks, initialEdges, direction, viewMode, onEditTask, departments, setNodes, setEdges]
  );

  // Validación estricta de conexiones (Sistema Multi-Puerto):
  // 1. Salida solo por los puertos de la derecha (right-source-top/mid/bot)
  // 2. Entrada solo por los puertos de la izquierda (left-target-top/mid/bot)
  // 3. Flujo natural izquierda -> derecha (predecesora a la izq, sucesora a la der)
  // 4. Bloqueo preventivo de bucles circulares (wouldCreateCycle)
  const isValidConnection = useCallback(
    (edgeOrConnection: Edge | Connection) => {
      if (!edgeOrConnection.source || !edgeOrConnection.target) return false;
      if (edgeOrConnection.source === edgeOrConnection.target) return false;
      if (
        edgeOrConnection.sourceHandle &&
        !edgeOrConnection.sourceHandle.startsWith('right-source')
      ) {
        return false;
      }
      if (
        edgeOrConnection.targetHandle &&
        !edgeOrConnection.targetHandle.startsWith('left-target')
      ) {
        return false;
      }
      if (wouldCreateCycle(tasks, edgeOrConnection.source, edgeOrConnection.target)) return false;
      return true;
    },
    [tasks]
  );

  const handleConnect = useCallback(
    (params: Connection) => {
      if (!params.source || !params.target || params.source === params.target) return;
      if (wouldCreateCycle(tasks, params.source, params.target)) {
        alert(
          `¡Acción no permitida! Crear la ligadura de [${params.source}] a [${params.target}] generaría un bucle circular en la red ROY.`
        );
        return;
      }
      onAddDependency(
        params.target,
        params.source,
        'FC',
        0,
        params.sourceHandle || undefined,
        params.targetHandle || undefined
      );
    },
    [tasks, onAddDependency]
  );

  // Manejador de doble clic en aristas (Punto 2)
  const handleEdgeDoubleClick = useCallback(
    (_event: React.MouseEvent, edge: Edge) => {
      const edgeData = edge.data as Record<string, unknown> | undefined;
      const type = (edgeData?.type as DependencyType) || 'FC';
      const lag = (edgeData?.lag as number) || 0;
      onEditDependency?.(edge.target, edge.source, type, lag);
    },
    [onEditDependency]
  );

  // Manejador de click derecho sobre el lienzo
  const handlePaneContextMenu = useCallback((event: MouseEvent | React.MouseEvent) => {
    event.preventDefault();
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
    setContextMenu({ x: event.clientX, y: event.clientY });
  }, []);

  // Manejador de click derecho sobre nodos
  const handleNodeContextMenu = useCallback((event: MouseEvent | React.MouseEvent, _node?: Node) => {
    event.preventDefault();
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
    setContextMenu({ x: event.clientX, y: event.clientY });
  }, []);

  return (
    <div
      className="relative w-full h-full bg-slate-100 dark:bg-slate-950 overflow-hidden select-none"
      onContextMenu={handlePaneContextMenu}
    >
      {hasCycle && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 bg-red-600 text-white px-4 py-2 rounded-xl shadow-xl flex items-center gap-2 text-xs font-semibold animate-bounce">
          <AlertTriangle className="w-4 h-4" />
          <span>¡Error en la red! Se ha detectado un bucle circular: {cyclePath?.join(' → ')}</span>
        </div>
      )}

      {/* Barra flotante superior */}
      <div className="absolute top-3 right-3 z-10 flex items-center gap-1.5 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md p-1.5 rounded-xl border border-slate-300 dark:border-slate-800 shadow-lg">
        <button
          onClick={() => fitView({ padding: 0.2, duration: 400 })}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 transition-colors cursor-pointer"
          title="Ajustar vista al tamaño de la pantalla (Zoom to Fit)"
        >
          <Maximize2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
          <span className="hidden sm:inline">Zoom to Fit</span>
        </button>

        <button
          onClick={() => {
            applyLayout(direction);
            setTimeout(() => fitView({ padding: 0.2, duration: 400 }), 60);
          }}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 transition-colors cursor-pointer"
          title="Reorganizar automáticamente los nodos evitando cruces de aristas y solapamientos"
        >
          <RefreshCw className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
          <span className="hidden sm:inline">Auto-Organizar</span>
        </button>
      </div>

      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={handleConnect}
        onEdgeDoubleClick={handleEdgeDoubleClick}
        onPaneContextMenu={handlePaneContextMenu}
        onNodeContextMenu={handleNodeContextMenu}
        onPaneClick={() => setContextMenu(null)}
        isValidConnection={isValidConnection}
        deleteKeyCode={['Backspace', 'Delete']}
        onEdgesDelete={handleEdgesDelete}
        onNodesDelete={handleNodesDelete}
        edgesReconnectable={true}
        reconnectRadius={28}
        onReconnect={handleReconnect}
        connectionLineStyle={{ stroke: '#2563EB', strokeWidth: 2.5 }}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        minZoom={0.08}
        maxZoom={3.0}
        proOptions={{ hideAttribution: true }}
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={20}
          size={1.2}
          color="#94A3B8"
          className="opacity-45"
        />
        <Controls className="!bg-white dark:!bg-slate-900 !border-slate-300 dark:!border-slate-800 !rounded-xl !shadow-md overflow-hidden" />
        <MiniMap
          nodeColor={(n) => {
            const task = tasks.find(t => t.id === n.id);
            if (task?.isCritical) return '#DC2626';
            if (task) return getDepartmentById(task.departmentId, departments).color;
            return '#94A3B8';
          }}
          nodeStrokeWidth={2}
          zoomable
          pannable
          className="!bg-white/85 dark:!bg-slate-900/85 !border-slate-300 dark:!border-slate-800 !rounded-xl !shadow-md"
        />
      </ReactFlow>

      {/* Menú Contextual de Clic Derecho */}
      {contextMenu && (
        <div
          style={{
            position: 'fixed',
            left: Math.min(contextMenu.x, window.innerWidth - 230),
            top: Math.min(contextMenu.y, window.innerHeight - 260),
            zIndex: 100,
          }}
          className="nopan nodrag nowheel w-56 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl py-1.5 divide-y divide-slate-100 dark:divide-slate-800 text-xs animate-in fade-in zoom-in-95 duration-100 select-none"
          onClick={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
          onPointerDown={(e) => e.stopPropagation()}
        >
          <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Menú Red ROY
          </div>

          <div className="py-1">
            <button
              onClick={() => {
                fitView({ padding: 0.2, duration: 400 });
                setContextMenu(null);
              }}
              className="w-full px-3 py-1.5 text-left text-slate-800 dark:text-slate-200 hover:bg-blue-50 dark:hover:bg-blue-950/40 hover:text-blue-600 dark:hover:text-blue-400 flex items-center gap-2 cursor-pointer font-medium transition-colors"
            >
              <Maximize2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>Ajustar Vista (Zoom to Fit)</span>
            </button>

            <button
              onClick={() => {
                applyLayout(direction);
                setTimeout(() => fitView({ padding: 0.2, duration: 400 }), 60);
                setContextMenu(null);
              }}
              className="w-full px-3 py-1.5 text-left text-slate-800 dark:text-slate-200 hover:bg-blue-50 dark:hover:bg-blue-950/40 hover:text-blue-600 dark:hover:text-blue-400 flex items-center gap-2 cursor-pointer font-medium transition-colors"
            >
              <RefreshCw className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span>Auto-Organizar Red (Dagre)</span>
            </button>
          </div>

          {onAddTask && (
            <div className="py-1">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  const clickX = contextMenu.x;
                  const clickY = contextMenu.y;
                  setContextMenu(null);
                  if (document.activeElement instanceof HTMLElement) {
                    document.activeElement.blur();
                  }
                  window.focus();
                  const flowPos = screenToFlowPosition({ x: clickX, y: clickY });
                  const pos = {
                    x: Math.round(flowPos.x - 140),
                    y: Math.round(flowPos.y - 70),
                  };
                  setTimeout(() => {
                    onAddTask(pos);
                  }, 40);
                }}
                className="w-full px-3 py-1.5 text-left text-slate-800 dark:text-slate-200 hover:bg-blue-50 dark:hover:bg-blue-950/40 hover:text-blue-600 dark:hover:text-blue-400 flex items-center gap-2 cursor-pointer font-medium transition-colors"
              >
                <PlusCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Añadir Nueva Tarea</span>
              </button>
            </div>
          )}

          <div className="py-1">
            <button
              onClick={() => {
                zoomIn({ duration: 300 });
                setContextMenu(null);
              }}
              className="w-full px-3 py-1.5 text-left text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2 cursor-pointer transition-colors"
            >
              <ZoomIn className="w-4 h-4 text-slate-500" />
              <span>Acercar Zoom</span>
            </button>

            <button
              onClick={() => {
                zoomOut({ duration: 300 });
                setContextMenu(null);
              }}
              className="w-full px-3 py-1.5 text-left text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2 cursor-pointer transition-colors"
            >
              <ZoomOut className="w-4 h-4 text-slate-500" />
              <span>Alejar Zoom</span>
            </button>

            <button
              onClick={() => {
                setViewport({ x: 0, y: 0, zoom: 1 }, { duration: 300 });
                setContextMenu(null);
              }}
              className="w-full px-3 py-1.5 text-left text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2 cursor-pointer transition-colors"
            >
              <Locate className="w-4 h-4 text-slate-500" />
              <span>Centrar Vista (100%)</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export const RoyCanvas: React.FC<RoyCanvasProps> = (props) => {
  return (
    <ReactFlowProvider>
      <RoyCanvasContent {...props} />
    </ReactFlowProvider>
  );
};
