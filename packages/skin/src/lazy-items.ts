// Pure arithmetic for lazily drawn rows and row items (render.tsx LazyRepeat).

export interface LazySample { count: number; at: number }

/** The items' pitch from the spacer's offset after the drawn items: its movement between two drawn
 * counts, or, along a row (whose items start its content), its offset over the drawn count. */
export function lazyPitch(previous: LazySample | null, shown: number, at: number, axis: 'x' | 'y'): number | undefined {
  if (previous && previous.count !== shown && at !== previous.at) return Math.max(1, (at - previous.at) / (shown - previous.count));
  if (axis === 'x' && !previous && at > 0 && shown > 0) return at / shown;
  return undefined;
}

/** The spacer's extent for the items not drawn yet (at least a point, so it can be measured). */
export function lazyExtent(remaining: number, pitch: number, guess: number): number {
  return Math.max(1, remaining * (pitch || guess));
}

/** Whether the spacer's window rectangle is within reach of the screen along the axis. */
export function lazyNear(axis: 'x' | 'y', rect: { x: number; y: number; height: number }, screen: { width: number; height: number }, reach: number): boolean {
  return axis === 'y'
    ? rect.y < screen.height * (1 + reach)
    : rect.x < screen.width * (1 + reach) && rect.y < screen.height * (1 + reach) && rect.y + rect.height > -screen.height * reach;
}

/** A scroll is moving until this long after its last scroll event. */
export const LAZY_STILL_MS = 200;

/** How far past the screen's edge, in screen lengths, items are drawn ahead. Drawing a batch holds
 * the UI thread for a few frames (creating and first drawing a row of cards), so while the viewer
 * scrolls only what the scroll is about to reach (a fling covers two screens in a few frames) is drawn, and once it is still the page draws
 * further ahead, a little at a time, for the next scroll to find. A TV draws only what it reaches:
 * its section switches would wait on the extra rows. */
export function lazyReach(axis: 'x' | 'y', moving: boolean, tv: boolean): number {
  if (tv) return 1;
  if (moving) return axis === 'y' ? 2 : 1.5;
  return axis === 'y' ? 3 : 2;
}

/** Items added at once: while still, one at a time for the page's rows (each is a row of cards)
 * and half a batch for a row's cards, so a touch arriving meanwhile waits on little. */
export function lazyBatch(axis: 'x' | 'y', batch: number, moving: boolean): number {
  if (moving) return batch;
  return axis === 'y' ? 1 : Math.max(1, Math.ceil(batch / 2));
}
