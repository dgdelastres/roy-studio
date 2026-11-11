import React, { useMemo, useCallback, useEffect } from 'react';
import {
  ReactFlow,
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
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface RoyCanvasProps {
  tasks: Task[];
  criticalTasks?: string[];
  criticalEdges: Array<{ source: string; target: string }>;
  viewMode: 'full' | 'compact';
  direction: LayoutDirection;
  onEditTask: (task: Task) => void;
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

export const RoyCanvas: React.FC<RoyCanvasProps> = ({
  tasks,
  criticalEdges,
  viewMode,
  direction,
  onEditTask,
  onAddDependency,
  hasCycle,
  cyclePath,
}) => {
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
            color: critical ? '#DC2626' : '#94A3B8',
            width: 16,
            height: 16,
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

  return (
    <div className="relative w-full h-full bg-slate-100 dark:bg-slate-950 overflow-hidden">
      {hasCycle && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 bg-red-600 text-white px-4 py-2 rounded-xl shadow-xl flex items-center gap-2 text-xs font-semibold animate-bounce">
          <AlertTriangle className="w-4 h-4" />
          <span>¡Error en la red! Se ha detectado un bucle circular: {cyclePath?.join(' → ')}</span>
        </div>
      )}

      <div className="absolute top-3 right-3 z-10 flex items-center gap-1.5 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md p-1.5 rounded-xl border border-slate-300 dark:border-slate-800 shadow-lg">
        <button
          onClick={() => applyLayout(direction)}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 transition-colors"
          title="Reorganizar automáticamente los nodos según niveles topológicos"
        >
          <RefreshCw className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
          Auto-Organizar Red
        </button>
      </div>

      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={handleConnect}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        minZoom={0.15}
        maxZoom={2.5}
        proOptions={{ hideAttribution: true }}
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={18}
          size={1.2}
          color="#94A3B8"
          className="opacity-40"
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
          className="!bg-white/80 dark:!bg-slate-900/80 !border-slate-300 dark:!border-slate-800 !rounded-xl !shadow-md"
        />
      </ReactFlow>
    </div>
  );
};
