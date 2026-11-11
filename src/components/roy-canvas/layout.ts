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
  const nodeHeight = viewMode === 'full' ? 155 : 85;

  const isHorizontal = direction === 'LR';
  dagreGraph.setGraph({
    rankdir: direction,
    ranker: 'network-simplex',
    nodesep: isHorizontal ? 90 : 95,
    ranksep: isHorizontal ? 165 : 130,
    edgesep: 30,
    marginx: 60,
    marginy: 60,
  });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
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

  return { nodes: layoutedNodes, edges };
}
