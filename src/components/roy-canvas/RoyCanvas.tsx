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

import { Task, DependencyType } from '../../core/roy-engine/types';
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
  onEditTask: (task: Task) => void;
  onAddTask?: () => void;
  onAddDependency: (targetId: string, predecessorId: string, type: DependencyType, lag: number) => void;
  hasCycle?: boolean;
  cyclePath?: string[];
  onRelayoutRequested?: () => void;
}

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
  onEditTask,
  onAddTask,
  onAddDependency,
  hasCycle,
  cyclePath,
}) => {
  const { fitView, zoomIn, zoomOut, setViewport } = useReactFlow();
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);

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

  const isCriticalEdge = useCallback(
    (source: string, target: string) => {
      return criticalEdges.some(e => e.source === source && e.target === target);
    },
    [criticalEdges]
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
      },
    }));
  }, [tasks, viewMode, onEditTask]);

  const initialEdges: Edge[] = useMemo(() => {
    const edgesList: Edge[] = [];
    tasks.forEach(task => {
      task.dependencies.forEach(dep => {
        const critical = isCriticalEdge(dep.predecessorId, task.id);
        edgesList.push({
          id: `e-${dep.predecessorId}-${task.id}`,
          source: dep.predecessorId,
          target: task.id,
          type: 'royEdge',
          data: {
            type: dep.type,
            lag: dep.lag,
            isCritical: critical,
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
  }, [tasks, isCriticalEdge]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const applyLayout = useCallback(
    (dir: LayoutDirection = direction) => {
      const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
        initialNodes,
        initialEdges,
        dir,
        viewMode
      );
      setNodes(layoutedNodes);
      setEdges(layoutedEdges);
    },
    [initialNodes, initialEdges, direction, viewMode, setNodes, setEdges]
  );

  useEffect(() => {
    applyLayout(direction);
  }, [tasks.length, direction, viewMode]);

  const handleConnect = useCallback(
    (params: Connection) => {
      if (params.source && params.target) {
        onAddDependency(params.target, params.source, 'FC', 0);
      }
    },
    [onAddDependency]
  );

  const handlePaneContextMenu = useCallback((event: MouseEvent | React.MouseEvent) => {
    event.preventDefault();
    setContextMenu({ x: event.clientX, y: event.clientY });
  }, []);

  const handleNodeContextMenu = useCallback((event: MouseEvent | React.MouseEvent, _node?: Node) => {
    event.preventDefault();
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

      <div className="absolute top-3 right-3 z-10 flex items-center gap-1.5 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md p-1.5 rounded-xl border border-slate-300 dark:border-slate-800 shadow-lg">
        <button
          onClick={() => fitView({ padding: 0.2, duration: 400 })}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 transition-colors"
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
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 transition-colors"
          title="Reorganizar automáticamente los nodos según niveles topológicos"
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
        onPaneContextMenu={handlePaneContextMenu}
        onNodeContextMenu={handleNodeContextMenu}
        onPaneClick={() => setContextMenu(null)}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        minZoom={0.1}
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
            if (task) return getDepartmentById(task.departmentId).color;
            return '#94A3B8';
          }}
          nodeStrokeWidth={2}
          zoomable
          pannable
          className="!bg-white/85 dark:!bg-slate-900/85 !border-slate-300 dark:!border-slate-800 !rounded-xl !shadow-md"
        />
      </ReactFlow>

      {contextMenu && (
        <div
          style={{
            position: 'fixed',
            left: Math.min(contextMenu.x, window.innerWidth - 230),
            top: Math.min(contextMenu.y, window.innerHeight - 260),
            zIndex: 100,
          }}
          className="w-56 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl py-1.5 divide-y divide-slate-100 dark:divide-slate-800 text-xs animate-in fade-in zoom-in-95 duration-100"
          onClick={(e) => e.stopPropagation()}
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
                onClick={() => {
                  onAddTask();
                  setContextMenu(null);
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
