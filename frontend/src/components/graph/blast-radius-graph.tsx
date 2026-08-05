'use client';

import type cytoscape from 'cytoscape';
import { useTheme } from 'next-themes';
import { useEffect, useMemo, useRef, useState } from 'react';
import CytoscapeComponent from 'react-cytoscapejs';
import { NodeDetailsCard } from '@/components/graph/node-details-card';
import { buildBlastRadiusElements, buildStylesheet, withTierColors, type GraphNodeData } from '@/lib/build-graph-elements';
import type { BlastRadiusResult } from '@/types/api';

interface BlastRadiusGraphProps {
  result: BlastRadiusResult;
  showResources: boolean;
  onFocusService?: (serviceId: string) => void;
}

export function BlastRadiusGraph({ result, showResources, onFocusService }: BlastRadiusGraphProps) {
  const { resolvedTheme } = useTheme();
  const cyRef = useRef<cytoscape.Core | null>(null);
  const [selected, setSelected] = useState<GraphNodeData | null>(null);

  const elements = useMemo(
    () => withTierColors(buildBlastRadiusElements(result, { showResources })),
    [result, showResources],
  );
  const labelColor = resolvedTheme === 'dark' ? '#cbd5e1' : '#334155';
  const stylesheet = useMemo(
    () => buildStylesheet(result.maxHops, labelColor),
    [result.maxHops, labelColor],
  );

  const layout = useMemo(
    () => ({
      name: 'cose',
      animate: true,
      animationDuration: 400,
      nodeRepulsion: () => 9000,
      idealEdgeLength: () => 70,
      gravity: 0.35,
      numIter: 1200,
      fit: true,
      padding: 24,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [result.service.id, showResources],
  );

  // Deselect whenever the deploying service changes — the previous
  // selection no longer refers to a node in the new graph.
  useEffect(() => {
    setSelected(null);
  }, [result.service.id]);

  // Stop any in-flight cose layout animation before this component
  // unmounts (e.g. switching tabs mid-animation) — react-cytoscapejs
  // destroys the underlying cy core on unmount, and a layout tick that
  // fires after destroy throws deep inside cytoscape's renderer.
  useEffect(() => {
    return () => {
      cyRef.current?.stop();
    };
  }, []);

  return (
    <div className="relative">
      <div className="h-[520px] w-full overflow-hidden rounded-lg border bg-card">
        <CytoscapeComponent
          elements={elements}
          stylesheet={stylesheet}
          layout={layout}
          style={{ width: '100%', height: '100%' }}
          cy={(cy) => {
            cyRef.current = cy;
            cy.off('tap', 'node');
            cy.on('tap', 'node', (evt) => {
              const data = evt.target.data() as GraphNodeData;
              setSelected(data);
            });
            cy.off('tap');
            cy.on('tap', (evt) => {
              if (evt.target === cy) setSelected(null);
            });
          }}
        />
      </div>

      {selected && (
        <div className="absolute right-3 top-3 w-64">
          <NodeDetailsCard
            node={selected}
            onFocusService={onFocusService}
            onClose={() => setSelected(null)}
          />
        </div>
      )}
    </div>
  );
}
