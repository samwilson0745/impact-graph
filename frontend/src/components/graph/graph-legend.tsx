import { NODE_TYPE_COLORS, NODE_TYPE_LABELS, TIER_COLORS, TIER_LABELS } from '@/lib/graph-theme';

const shapeGlyph: Record<keyof typeof NODE_TYPE_LABELS, string> = {
  service: 'rounded-full',
  api: 'rounded-[3px]',
  kafkaTopic: 'rotate-45 rounded-[2px]',
  database: 'rounded-[3px] [clip-path:polygon(25%_0,75%_0,100%_50%,75%_100%,25%_100%,0_50%)]',
  team: 'rounded-full',
};

export function GraphLegend({ showResources }: { showResources: boolean }) {
  const kinds = (Object.keys(NODE_TYPE_LABELS) as (keyof typeof NODE_TYPE_LABELS)[]).filter(
    (k) => showResources || k === 'service',
  );

  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
      <div className="flex items-center gap-3">
        {(Object.keys(TIER_LABELS) as (keyof typeof TIER_LABELS)[]).map((tier) => (
          <span key={tier} className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-full" style={{ backgroundColor: TIER_COLORS[tier] }} />
            {TIER_LABELS[tier]}
          </span>
        ))}
      </div>
      <span className="text-border">•</span>
      <div className="flex items-center gap-3">
        {kinds.map((kind) => (
          <span key={kind} className="flex items-center gap-1.5">
            <span
              className={`size-2.5 ${shapeGlyph[kind]}`}
              style={{ backgroundColor: kind === 'service' ? '#94a3b8' : NODE_TYPE_COLORS[kind] }}
            />
            {NODE_TYPE_LABELS[kind]}
          </span>
        ))}
      </div>
    </div>
  );
}
