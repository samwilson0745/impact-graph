'use client';

import { Radar, Route, Trophy, Waypoints } from 'lucide-react';
import { useState } from 'react';
import { BlastRadiusView } from '@/components/dashboard/blast-radius-view';
import { LeaderboardView } from '@/components/dashboard/leaderboard-view';
import { ShortestPathView } from '@/components/dashboard/shortest-path-view';
import { ServiceCombobox } from '@/components/service-select/service-combobox';
import { EmptyState } from '@/components/shared/empty-state';
import { ErrorState } from '@/components/shared/error-state';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useServices } from '@/hooks/useServices';

export default function Home() {
  const services = useServices();
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);
  const [tab, setTab] = useState('blast-radius');

  function focusService(serviceId: string) {
    setSelectedServiceId(serviceId);
    setTab('blast-radius');
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Simulate a deployment</h1>
        <p className="text-sm text-muted-foreground">
          Pick a service to see exactly what breaks before you ship it.
        </p>
      </div>

      {services.isPending ? (
        <Skeleton className="h-10 w-full max-w-sm" />
      ) : services.isError ? (
        <ErrorState error={services.error} />
      ) : (
        <>
          <ServiceCombobox
            services={services.data}
            value={selectedServiceId}
            onChange={setSelectedServiceId}
            placeholder="I'm about to deploy…"
            className="max-w-sm"
          />

          <Tabs value={tab} onValueChange={setTab}>
            <TabsList>
              <TabsTrigger value="blast-radius" className="gap-1.5">
                <Radar className="size-3.5" />
                Blast radius
              </TabsTrigger>
              <TabsTrigger value="shortest-path" className="gap-1.5">
                <Route className="size-3.5" />
                Shortest path
              </TabsTrigger>
              <TabsTrigger value="leaderboard" className="gap-1.5">
                <Trophy className="size-3.5" />
                Riskiest services
              </TabsTrigger>
            </TabsList>

            <TabsContent value="blast-radius" className="mt-4">
              {selectedServiceId ? (
                <BlastRadiusView serviceId={selectedServiceId} onFocusService={focusService} />
              ) : (
                <EmptyState
                  icon={Waypoints}
                  title="Select a service above"
                  description="Choose the service you're about to deploy to see its full blast radius."
                />
              )}
            </TabsContent>

            <TabsContent value="shortest-path" className="mt-4">
              <ShortestPathView services={services.data} />
            </TabsContent>

            <TabsContent value="leaderboard" className="mt-4">
              <LeaderboardView onFocusService={focusService} />
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
}
