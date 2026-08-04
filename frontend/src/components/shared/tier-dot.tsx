import { TIER_COLORS } from '@/lib/graph-theme';
import type { ServiceTier } from '@/types/api';

export function TierDot({ tier }: { tier: ServiceTier }) {
  return (
    <span
      className="inline-block size-2.5 shrink-0 rounded-full"
      style={{ backgroundColor: TIER_COLORS[tier] }}
      aria-hidden
    />
  );
}
