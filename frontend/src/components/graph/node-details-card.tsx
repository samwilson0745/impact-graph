import { X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { NODE_TYPE_LABELS, TIER_COLORS, TIER_LABELS } from '@/lib/graph-theme';
import type { GraphNodeData } from '@/lib/build-graph-elements';
import type { ServiceTier } from '@/types/api';

export function NodeDetailsCard({
  node,
  onFocusService,
  onClose,
}: {
  node: GraphNodeData;
  onFocusService?: (serviceId: string) => void;
  onClose: () => void;
}) {
  return (
    <Card className="shadow-lg py-3 gap-2">
      <CardHeader className="px-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">{node.label}</p>
            <p className="text-xs text-muted-foreground">{NODE_TYPE_LABELS[node.kind]}</p>
          </div>
          <Button variant="ghost" size="icon" className="size-6 shrink-0" onClick={onClose}>
            <X className="size-3.5" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-2 px-3">
        <div className="flex flex-wrap gap-1.5">
          {node.isRoot && <Badge variant="default">Deploying now</Badge>}
          {typeof node.hop === 'number' && !node.isRoot && node.kind === 'service' && (
            <Badge variant="secondary">{node.hop} hop{node.hop === 1 ? '' : 's'} away</Badge>
          )}
          {node.tier && (
            <Badge
              variant="outline"
              style={{ borderColor: TIER_COLORS[node.tier as ServiceTier], color: TIER_COLORS[node.tier as ServiceTier] }}
            >
              {TIER_LABELS[node.tier as ServiceTier]}
            </Badge>
          )}
        </div>
        {node.kind === 'service' && onFocusService && !node.isRoot && (
          <Button size="sm" variant="secondary" onClick={() => onFocusService(node.id)}>
            Simulate deploying this instead
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
