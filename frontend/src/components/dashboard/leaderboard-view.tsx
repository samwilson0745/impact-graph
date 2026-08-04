'use client';

import { Trophy } from 'lucide-react';
import { ErrorState } from '@/components/shared/error-state';
import { TierDot } from '@/components/shared/tier-dot';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useRiskiestServices } from '@/hooks/useRiskiestServices';

export function LeaderboardView({ onFocusService }: { onFocusService: (serviceId: string) => void }) {
  const riskiest = useRiskiestServices(10);

  if (riskiest.isPending) return <Skeleton className="h-96 w-full rounded-lg" />;
  if (riskiest.isError) return <ErrorState error={riskiest.error} />;

  return (
    <div className="rounded-lg border bg-card">
      <div className="flex items-center gap-2 border-b p-4">
        <Trophy className="size-4 text-amber-500" />
        <div>
          <p className="text-sm font-semibold">Riskiest services to touch</p>
          <p className="text-xs text-muted-foreground">Ranked by direct in-degree — how many services call them.</p>
        </div>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-10">#</TableHead>
            <TableHead>Service</TableHead>
            <TableHead>Tier</TableHead>
            <TableHead className="text-right">Direct dependents</TableHead>
            <TableHead className="w-10" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {riskiest.data?.map((service, i) => (
            <TableRow key={service.id}>
              <TableCell className="text-muted-foreground">{i + 1}</TableCell>
              <TableCell className="font-medium">{service.name}</TableCell>
              <TableCell>
                <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <TierDot tier={service.tier} />
                  {service.tier}
                </span>
              </TableCell>
              <TableCell className="text-right tabular-nums">{service.dependentCount}</TableCell>
              <TableCell>
                <Button variant="ghost" size="sm" onClick={() => onFocusService(service.id)}>
                  Analyze
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
