'use client';

import { ArrowRight, ArrowRightLeft, Route } from 'lucide-react';
import { useState } from 'react';
import { ServiceCombobox } from '@/components/service-select/service-combobox';
import { EmptyState } from '@/components/shared/empty-state';
import { ErrorState } from '@/components/shared/error-state';
import { TierDot } from '@/components/shared/tier-dot';
import { Skeleton } from '@/components/ui/skeleton';
import { useShortestPath } from '@/hooks/useShortestPath';
import { ApiError } from '@/lib/api';
import type { ServiceNode } from '@/types/api';

export function ShortestPathView({ services }: { services: ServiceNode[] }) {
  const [from, setFrom] = useState<string | null>(null);
  const [to, setTo] = useState<string | null>(null);
  const result = useShortestPath(from, to);

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-lg border bg-card p-4">
        <p className="mb-3 text-sm text-muted-foreground">
          Why does one service even affect another? Pick two services to find the shortest connecting path through
          the dependency graph.
        </p>
        <div className="flex flex-col items-stretch gap-2 sm:flex-row sm:items-center">
          <ServiceCombobox
            services={services}
            value={from}
            onChange={setFrom}
            placeholder="From service…"
            excludeId={to}
            className="flex-1 min-w-0"
          />
          <ArrowRightLeft className="size-4 shrink-0 self-center text-muted-foreground" />
          <ServiceCombobox
            services={services}
            value={to}
            onChange={setTo}
            placeholder="To service…"
            excludeId={from}
            className="flex-1 min-w-0"
          />
        </div>
      </div>

      {!from || !to ? (
        <EmptyState
          icon={Route}
          title="Pick two services"
          description="Select a starting service and a destination to see how they're connected."
        />
      ) : from === to ? (
        <EmptyState icon={Route} title="Pick two different services" />
      ) : result.isPending ? (
        <Skeleton className="h-40 w-full rounded-lg" />
      ) : result.isError ? (
        result.error instanceof ApiError && result.error.status === 404 ? (
          <EmptyState
            icon={Route}
            title="No connecting path"
            description={`${services.find((s) => s.id === from)?.name} and ${services.find((s) => s.id === to)?.name} aren't connected through the dependency graph.`}
          />
        ) : (
          <ErrorState error={result.error} />
        )
      ) : result.data ? (
        <div className="rounded-lg border bg-card p-5">
          <p className="mb-4 text-sm">
            Shortest path is <span className="font-semibold">{result.data.hops}</span> hop
            {result.data.hops === 1 ? '' : 's'}.
          </p>
          <div className="flex flex-wrap items-center gap-2">
            {result.data.path.map((node, i) => (
              <div key={node.id} className="flex items-center gap-2">
                <div className="flex items-center gap-2 rounded-full border bg-background px-3 py-1.5 text-sm">
                  <TierDot tier={node.tier} />
                  {node.name}
                </div>
                {i < result.data.path.length - 1 && <ArrowRight className="size-4 shrink-0 text-muted-foreground" />}
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
