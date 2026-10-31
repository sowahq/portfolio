export type TickCallback = (time: number, delta: number) => void;

export type FrameScheduler = (callback: (time: number) => void) => number;

export interface Ticker {
  add(callback: TickCallback): () => void;
  readonly size: number;
}

/**
 * Creates a frame loop shared by every callback registered on it.
 * The loop only runs while at least one callback is registered.
 */
export function createTicker(schedule: FrameScheduler): Ticker {
  const callbacks = new Set<TickCallback>();
  let running = false;
  let last = 0;

  const loop = (time: number): void => {
    const delta = last === 0 ? 0 : time - last;
    last = time;
    [...callbacks].forEach((callback) => callback(time, delta));
    if (callbacks.size > 0) {
      schedule(loop);
      return;
    }
    running = false;
    last = 0;
  };

  return {
    add(callback) {
      callbacks.add(callback);
      if (!running) {
        running = true;
        schedule(loop);
      }
      return () => {
        callbacks.delete(callback);
      };
    },
    get size() {
      return callbacks.size;
    },
  };
}

let sharedTicker: Ticker | null = null;

/**
 * Returns the browser ticker driven by requestAnimationFrame.
 */
export function getTicker(): Ticker {
  sharedTicker ??= createTicker((callback) => requestAnimationFrame(callback));
  return sharedTicker;
}
