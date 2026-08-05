'use client';

import dynamic from 'next/dynamic';
import { useState } from 'react';
import { ImpactSummary } from '@/components/dashboard/impact-summary';
import { RiskInsights } from '@/components/dashboard/risk-insights';
import { GraphLegend } from '@/components/graph/graph-legend';
import { EmptyState } from '@/components/shared/empty-state';
import { ErrorState } from '@/components/shared/error-state';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { useBlastRadius } from '@/hooks/useBlastRadius';
import { Waypoints } from 'lucide-react';

const BlastRadiusGraph = dynamic(
  () => import('@/components/graph/blast-radius-graph').then((m) => m.BlastRadiusGraph),
  { ssr: false, loading: () => <Skeleton className="h-[520px] w-full rounded-lg" /> },
);

export function BlastRadiusView({
  serviceId,
  onFocusService,
}: {
  serviceId: string;
  onFocusService: (serviceId: string) => void;
}) {
  const [maxHops, setMaxHops] = useState(4);
  // The slider's own displayed value updates on every drag tick for smooth
  // visual feedback; `maxHops` (which drives the query) only updates once
  // the drag settles, via onValueCommitted — otherwise every intermediate
  // tick during a drag fires a brand-new query, and the view flickers
  // between the old result and a loading skeleton on each tick.
  const [displayHops, setDisplayHops] = useState(4);
  const [showResources, setShowResources] = useState(true);
  const blastRadius = useBlastRadius(serviceId, maxHops);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-4 rounded-lg border bg-card p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Label htmlFor="hop-slider" className="text-sm text-muted-foreground">
            Max hops
          </Label>
          <div className="flex w-40 items-center gap-3">
            <Slider
              id="hop-slider"
              min={1}
              max={6}
              step={1}
              value={[displayHops]}
              onValueChange={(v) => {
                const next = Array.isArray(v) ? v[0] : v;
                if (typeof next === 'number') setDisplayHops(next);
              }}
              onValueCommitted={(v) => {
                const next = Array.isArray(v) ? v[0] : v;
                if (typeof next === 'number') setMaxHops(next);
              }}
              className="w-28"
            />
            <span className="w-4 text-sm font-medium tabular-nums">{displayHops}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Switch id="show-resources" checked={showResources} onCheckedChange={setShowResources} />
          <Label htmlFor="show-resources" className="text-sm text-muted-foreground">
            Show APIs, topics, databases & teams
          </Label>
        </div>
      </div>

      {blastRadius.isPending && (
        <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
          <Skeleton className="h-[520px] w-full rounded-lg" />
          <Skeleton className="h-[520px] w-full rounded-lg" />
        </div>
      )}

      {blastRadius.isError && <ErrorState error={blastRadius.error} />}

      {blastRadius.data && (
        <>
          <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
            <div className="flex flex-col gap-2">
              <BlastRadiusGraph
                result={blastRadius.data}
                showResources={showResources}
                onFocusService={onFocusService}
              />
              <GraphLegend showResources={showResources} />
            </div>

            <div className="rounded-lg border bg-card p-4">
              <h3 className="mb-3 text-sm font-semibold">Impact summary</h3>
              <ImpactSummary result={blastRadius.data} />
            </div>
          </div>

          {blastRadius.data.affectedServices.length === 0 ? (
            <EmptyState
              icon={Waypoints}
              title="No downstream callers"
              description="Nothing depends on this service within the selected hop range — it's safe to deploy in isolation."
            />
          ) : (
            <>
              <Separator />
              <div>
                <h3 className="mb-3 text-sm font-semibold">Risk insights</h3>
                <RiskInsights serviceId={serviceId} maxHops={maxHops} />
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
