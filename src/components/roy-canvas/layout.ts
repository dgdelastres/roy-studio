import dagre from '@dagrejs/dagre';
import { Node, Edge } from '@xyflow/react';

export type LayoutDirection = 'LR' | 'TB';

export function getLayoutedElements(
  nodes: Node[],
  edges: Edge[],
  direction: LayoutDirection = 'LR',
  viewMode: 'full' | 'compact' = 'full'
) {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));

  const nodeWidth = viewMode === 'full' ? 290 : 210;
  const nodeHeight = viewMode === 'full' ? 160 : 85;

  const isHorizontal = direction === 'LR';
  dagreGraph.setGraph({
    rankdir: direction,
    ranker: 'network-simplex',
    align: isHorizontal ? 'UL' : undefined,
    nodesep: isHorizontal ? 100 : 110,
    ranksep: isHorizontal ? 160 : 140,
    edgesep: 40,
    marginx: 60,
    marginy: 60,
  });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
  });

  edges.forEach((edge) => {
    const isCritical = (edge.data as Record<string, unknown>)?.isCritical;
    dagreGraph.setEdge(edge.source, edge.target, {
      minlen: 1,
      weight: isCritical ? 3 : 1,
    });
  });

  dagre.layout(dagreGraph);

  const layoutedNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    return {
      ...node,
      targetPosition: isHorizontal ? 'left' : 'top',
      sourcePosition: isHorizontal ? 'right' : 'bottom',
      position: {
        x: nodeWithPosition.x - nodeWidth / 2,
        y: nodeWithPosition.y - nodeHeight / 2,
      },
    } as Node;
  });

  const layoutedEdges = edges.map((edge) => {
    return {
      ...edge,
      sourceHandle: edge.sourceHandle || 'right-source-mid',
      targetHandle: edge.targetHandle || 'left-target-mid',
    };
  });

  return { nodes: layoutedNodes, edges: layoutedEdges };
}
