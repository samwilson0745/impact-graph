import type { ElementDefinition, StylesheetJsonBlock } from 'cytoscape';
import { NODE_TYPE_COLORS, ROOT_NODE_COLOR, TIER_COLORS } from '@/lib/graph-theme';
import type { BlastRadiusResult } from '@/types/api';

export type GraphNodeKind = 'service' | 'api' | 'kafkaTopic' | 'database' | 'team';

export interface GraphNodeData {
  id: string;
  label: string;
  kind: GraphNodeKind;
  hop?: number;
  isRoot?: boolean;
  tier?: string;
}

interface BuildOptions {
  showResources: boolean;
}

/** Converts a BlastRadiusResult into Cytoscape elements — pure, no DOM/browser dependency. */
export function buildBlastRadiusElements(
  result: BlastRadiusResult,
  { showResources }: BuildOptions,
): ElementDefinition[] {
  const elements: ElementDefinition[] = [];
  const seenNodeIds = new Set<string>();

  function addNode(data: GraphNodeData) {
    if (seenNodeIds.has(data.id)) return;
    seenNodeIds.add(data.id);
    elements.push({ data: { ...data } });
  }

  addNode({ id: result.service.id, label: result.service.name, kind: 'service', hop: 0, isRoot: true, tier: result.service.tier });
  for (const svc of result.affectedServices) {
    addNode({ id: svc.id, label: svc.name, kind: 'service', hop: svc.hop, tier: svc.tier });
  }

  for (const edge of result.serviceEdges) {
    elements.push({
      data: { id: `dep-${edge.from}-${edge.to}`, source: edge.from, target: edge.to, kind: 'DEPENDS_ON' },
    });
  }

  if (showResources) {
    for (const api of result.apis) {
      addNode({ id: api.id, label: api.name, kind: 'api' });
      elements.push({
        data: { id: `exposes-${api.serviceId}-${api.id}`, source: api.serviceId, target: api.id, kind: 'EXPOSES' },
      });
    }

    for (const topic of result.kafkaTopics) {
      addNode({ id: topic.id, label: topic.name, kind: 'kafkaTopic' });
      for (const publisherId of topic.publishers) {
        elements.push({
          data: {
            id: `pub-${publisherId}-${topic.id}`,
            source: publisherId,
            target: topic.id,
            kind: 'PUBLISHES_TO',
          },
        });
      }
      for (const consumerId of topic.consumers) {
        elements.push({
          data: {
            id: `con-${consumerId}-${topic.id}`,
            source: consumerId,
            target: topic.id,
            kind: 'CONSUMES_FROM',
          },
        });
      }
    }

    for (const db of result.databases) {
      addNode({ id: db.id, label: db.name, kind: 'database' });
      for (const readerId of db.readers) {
        elements.push({
          data: { id: `read-${readerId}-${db.id}`, source: readerId, target: db.id, kind: 'READS_FROM' },
        });
      }
      for (const writerId of db.writers) {
        elements.push({
          data: { id: `write-${writerId}-${db.id}`, source: writerId, target: db.id, kind: 'WRITES_TO' },
        });
      }
    }

    for (const team of result.teams) {
      addNode({ id: team.id, label: team.name, kind: 'team' });
    }
    const allServices = [result.service, ...result.affectedServices];
    for (const svc of allServices) {
      if (seenNodeIds.has(svc.owner_team_id)) {
        elements.push({
          data: { id: `owns-${svc.id}-${svc.owner_team_id}`, source: svc.id, target: svc.owner_team_id, kind: 'OWNED_BY' },
        });
      }
    }
  }

  return elements;
}

const NODE_SHAPES: Record<GraphNodeKind, string> = {
  service: 'ellipse',
  api: 'round-rectangle',
  kafkaTopic: 'diamond',
  database: 'hexagon',
  team: 'round-tag',
};

// Cytoscape's style values include mapper syntax (`mapData(...)`, `data(...)`)
// that don't fit its own strict per-property CSS union types, so the literal
// stylesheet below is built as plain objects and cast once at the boundary
// rather than fighting individual property types.
export function buildStylesheet(maxHops: number, labelColor: string): StylesheetJsonBlock[] {
  const stylesheet = [
    {
      selector: 'node',
      style: {
        label: 'data(label)',
        'font-size': 9,
        color: labelColor,
        'text-valign': 'bottom',
        'text-margin-y': 6,
        'text-wrap': 'ellipsis',
        'text-max-width': '90px',
        'border-width': 2,
        'border-color': '#fff',
        width: 26,
        height: 26,
      },
    },
    ...(Object.keys(NODE_SHAPES) as GraphNodeKind[]).map((kind) => ({
      selector: `node[kind = "${kind}"]`,
      style: {
        shape: NODE_SHAPES[kind],
        'background-color':
          kind === 'service' ? 'data(tierColor)' : NODE_TYPE_COLORS[kind as Exclude<GraphNodeKind, 'service'>],
      },
    })),
    {
      selector: 'node[isRoot]',
      style: {
        width: 46,
        height: 46,
        'border-width': 4,
        'border-color': ROOT_NODE_COLOR,
        'font-size': 11,
        'font-weight': 700,
      },
    },
    {
      selector: 'node[kind = "service"][!isRoot]',
      style: {
        width: `mapData(hop, 0, ${Math.max(maxHops, 1)}, 38, 20)`,
        height: `mapData(hop, 0, ${Math.max(maxHops, 1)}, 38, 20)`,
      },
    },
    {
      selector: 'node[kind != "service"]',
      style: { width: 16, height: 16, 'font-size': 8, opacity: 0.85 },
    },
    {
      selector: 'edge',
      style: {
        width: 1.6,
        'curve-style': 'bezier',
        'target-arrow-shape': 'triangle',
        'arrow-scale': 0.8,
        opacity: 0.7,
      },
    },
    {
      selector: 'edge[kind = "DEPENDS_ON"]',
      style: { 'line-color': '#94a3b8', 'target-arrow-color': '#94a3b8', width: 2 },
    },
    {
      selector: 'edge[kind = "EXPOSES"]',
      style: {
        'line-color': NODE_TYPE_COLORS.api,
        'target-arrow-color': NODE_TYPE_COLORS.api,
        'line-style': 'dashed',
        width: 1,
        opacity: 0.5,
      },
    },
    {
      selector: 'edge[kind = "PUBLISHES_TO"]',
      style: { 'line-color': NODE_TYPE_COLORS.kafkaTopic, 'target-arrow-color': NODE_TYPE_COLORS.kafkaTopic, width: 1.4 },
    },
    {
      selector: 'edge[kind = "CONSUMES_FROM"]',
      style: {
        'line-color': NODE_TYPE_COLORS.kafkaTopic,
        'target-arrow-color': NODE_TYPE_COLORS.kafkaTopic,
        'line-style': 'dashed',
        width: 1,
        opacity: 0.5,
      },
    },
    {
      selector: 'edge[kind = "WRITES_TO"]',
      style: { 'line-color': NODE_TYPE_COLORS.database, 'target-arrow-color': NODE_TYPE_COLORS.database, width: 1.4 },
    },
    {
      selector: 'edge[kind = "READS_FROM"]',
      style: {
        'line-color': NODE_TYPE_COLORS.database,
        'target-arrow-color': NODE_TYPE_COLORS.database,
        'line-style': 'dashed',
        width: 1,
        opacity: 0.5,
      },
    },
    {
      selector: 'edge[kind = "OWNED_BY"]',
      style: {
        'line-color': NODE_TYPE_COLORS.team,
        'target-arrow-color': NODE_TYPE_COLORS.team,
        'line-style': 'dotted',
        width: 1,
        opacity: 0.4,
        'target-arrow-shape': 'none',
      },
    },
    {
      selector: 'node:selected',
      style: { 'border-color': '#f59e0b', 'border-width': 4 },
    },
  ];

  return stylesheet as StylesheetJsonBlock[];
}

export function withTierColors(elements: ElementDefinition[]): ElementDefinition[] {
  return elements.map((el) => {
    const tier = el.data.tier as keyof typeof TIER_COLORS | undefined;
    if (el.data.kind === 'service' && tier) {
      return { ...el, data: { ...el.data, tierColor: TIER_COLORS[tier] } };
    }
    return el;
  });
}
