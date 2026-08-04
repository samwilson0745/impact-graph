'use client';

import { Database, ShieldAlert, ShieldCheck } from 'lucide-react';
import { useSharedDatabaseRisk, useSinglePointsOfFailure } from '@/hooks/useBlastRadius';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { TierDot } from '@/components/shared/tier-dot';

export function RiskInsights({ serviceId, maxHops }: { serviceId: string; maxHops: number }) {
  const spof = useSinglePointsOfFailure(serviceId, maxHops);
  const sharedDb = useSharedDatabaseRisk(serviceId);

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <Card className="gap-2 py-4">
        <CardHeader className="px-4">
          <CardTitle className="flex items-center gap-2 text-sm">
            <ShieldAlert className="size-4 text-rose-600 dark:text-rose-400" />
            Single points of failure
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4">
          {spof.isPending ? (
            <Skeleton className="h-16 w-full" />
          ) : spof.data && spof.data.length > 0 ? (
            <ul className="flex flex-col gap-2">
              {spof.data.map(({ dependency, hop }) => (
                <li key={dependency.id} className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <TierDot tier={dependency.tier} />
                    {dependency.name}
                  </span>
                  <Badge variant="outline" className="text-[10px]">
                    {hop} hop{hop === 1 ? '' : 's'} away, no alt. path
                  </Badge>
                </li>
              ))}
            </ul>
          ) : (
            <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <ShieldCheck className="size-3.5" />
              No downstream dependency relies solely on this service.
            </p>
          )}
        </CardContent>
      </Card>

      <Card className="gap-2 py-4">
        <CardHeader className="px-4">
          <CardTitle className="flex items-center gap-2 text-sm">
            <Database className="size-4 text-teal-600 dark:text-teal-400" />
            Hidden shared-database risk
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4">
          {sharedDb.isPending ? (
            <Skeleton className="h-16 w-full" />
          ) : sharedDb.data && sharedDb.data.length > 0 ? (
            <ul className="flex flex-col gap-2">
              {sharedDb.data.map((entry) => (
                <li key={entry.id} className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <TierDot tier={entry.tier} />
                    {entry.name}
                  </span>
                  <span className="flex gap-1">
                    {entry.sharedDatabases.map((db) => (
                      <Badge key={db.id} variant="outline" className="text-[10px]">
                        {db.name}
                      </Badge>
                    ))}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <ShieldCheck className="size-3.5" />
              No hidden database coupling — every service sharing a database also has a direct dependency edge.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
