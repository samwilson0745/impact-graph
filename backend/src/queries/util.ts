// Neo4j does not support parameters inside a variable-length relationship
// pattern's hop bound (`*1..$n` is a parse error — the bound must be a
// literal integer). The only safe way to make the hop count configurable is
// to validate it as a small whitelisted integer *before* interpolating it
// into the query string, which is what this does. Every other value in every
// query in this project is passed as a real bound parameter (`$serviceId`,
// `$serviceIds`, etc.) — this is the one deliberate, narrowly-scoped
// exception, and it never touches raw user input.
const MIN_HOPS = 1;
const MAX_HOPS = 6;

export function assertSafeHopCount(hops: number): number {
  if (!Number.isInteger(hops) || hops < MIN_HOPS || hops > MAX_HOPS) {
    throw new RangeError(`maxHops must be an integer between ${MIN_HOPS} and ${MAX_HOPS}`);
  }
  return hops;
}
