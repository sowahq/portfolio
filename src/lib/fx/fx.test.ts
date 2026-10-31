import { describe, expect, it } from "vitest";
import { cellsAt, dissolveOrder, gridFor } from "./dissolve.js";
import { bayerThreshold, blobField, blobPosition } from "./dither.js";
import { createDrifters, stepDrifter } from "./drift.js";
import { easeOutBack, linear, steps } from "./easing.js";
import { cellAt, GlowGrid } from "./glow-grid.js";
import { encode, hexRows } from "./hexdump.js";
import { ParticleSystem } from "./particles.js";
import { quantizeTime, snap } from "./quantize.js";
import { seeded } from "./random.js";
import { scrambleFrame } from "./scramble.js";
import { advance, KONAMI } from "./sequence.js";
import { createTicker } from "./ticker.js";

function manualScheduler(): { schedule: (cb: (time: number) => void) => number; flush: (time: number) => void; pending: () => number } {
  let queue: ((time: number) => void)[] = [];
  return {
    schedule: (cb) => queue.push(cb),
    flush: (time) => {
      const current = queue;
      queue = [];
      current.forEach((cb) => cb(time));
    },
    pending: () => queue.length,
  };
}

describe("steps", () => {
  const cases = [
    { name: "start", count: 4, t: 0, expected: 0 },
    { name: "below first step", count: 4, t: 0.2, expected: 0 },
    { name: "first step", count: 4, t: 0.25, expected: 0.25 },
    { name: "mid", count: 4, t: 0.6, expected: 0.5 },
    { name: "end", count: 4, t: 1, expected: 1 },
    { name: "past end", count: 4, t: 1.5, expected: 1 },
    { name: "invalid count falls back to one level", count: 0, t: 0.9, expected: 0 },
  ];
  cases.forEach(({ name, count, t, expected }) => {
    it(name, () => {
      expect(steps(count)(t)).toBe(expected);
    });
  });

  it("keeps the overshoot of the base easing", () => {
    const eased = steps(5, easeOutBack);
    expect(Array.from({ length: 11 }, (_, i) => eased(i / 10)).some((v) => v > 1)).toBe(true);
    expect(eased(1)).toBeCloseTo(1);
  });
});

describe("quantize", () => {
  const snapCases = [
    { value: 5, grid: 4, expected: 4 },
    { value: 6, grid: 4, expected: 8 },
    { value: -5, grid: 4, expected: -4 },
    { value: 3.3, grid: 0, expected: 3.3 },
  ];
  snapCases.forEach(({ value, grid, expected }) => {
    it(`snap(${value}, ${grid})`, () => {
      expect(snap(value, grid)).toBe(expected);
    });
  });

  const timeCases = [
    { elapsed: 0, fps: 10, expected: 0 },
    { elapsed: 99, fps: 10, expected: 0 },
    { elapsed: 100, fps: 10, expected: 100 },
    { elapsed: 250, fps: 10, expected: 200 },
    { elapsed: 42, fps: 0, expected: 42 },
  ];
  timeCases.forEach(({ elapsed, fps, expected }) => {
    it(`quantizeTime(${elapsed}, ${fps})`, () => {
      expect(quantizeTime(elapsed, fps)).toBeCloseTo(expected);
    });
  });
});

describe("ticker", () => {
  it("passes deltas and stops scheduling once empty", () => {
    const scheduler = manualScheduler();
    const ticker = createTicker(scheduler.schedule);
    const deltas: number[] = [];
    const remove = ticker.add((_, delta) => deltas.push(delta));

    scheduler.flush(100);
    scheduler.flush(116);
    remove();
    scheduler.flush(132);

    expect(deltas).toEqual([0, 16]);
    expect(scheduler.pending()).toBe(0);
    expect(ticker.size).toBe(0);
  });

  it("restarts with a zero delta after going idle", () => {
    const scheduler = manualScheduler();
    const ticker = createTicker(scheduler.schedule);
    const deltas: number[] = [];
    const first = ticker.add(() => first());
    scheduler.flush(10);
    ticker.add((_, delta) => deltas.push(delta));
    scheduler.flush(500);
    expect(deltas).toEqual([0]);
  });
});

describe("dissolve", () => {
  it("covers every cell exactly once", () => {
    const grid = gridFor(100, 50, 20);
    const order = dissolveOrder(grid, seeded(1));
    expect(grid).toEqual({ cols: 5, rows: 3, cell: 20 });
    expect([...order].sort((a, b) => a - b)).toEqual(Array.from({ length: 15 }, (_, i) => i));
  });

  it("starts near the origin when one is given", () => {
    const grid = gridFor(400, 400, 20);
    const order = dissolveOrder(grid, seeded(2), { x: 0, y: 0 }, 0);
    expect(order[0]).toBe(0);
    expect(order[order.length - 1]).toBe(grid.cols * grid.rows - 1);
  });

  const cellsCases = [
    { name: "start", elapsed: 0, expected: 0 },
    { name: "snaps to frame", elapsed: 120, expected: 10 },
    { name: "half", elapsed: 500, expected: 50 },
    { name: "complete", elapsed: 1000, expected: 100 },
    { name: "after end", elapsed: 5000, expected: 100 },
  ];
  cellsCases.forEach(({ name, elapsed, expected }) => {
    it(`cellsAt ${name}`, () => {
      expect(cellsAt(elapsed, 100, 1000, 10, linear)).toBe(expected);
    });
  });

  it("completes instantly with a zero duration", () => {
    expect(cellsAt(0, 10, 0, 24)).toBe(10);
  });
});

describe("scrambleFrame", () => {
  it("preserves length and whitespace", () => {
    const frame = scrambleFrame("salut toi", 0, seeded(3));
    expect(frame).toHaveLength(9);
    expect(frame[5]).toBe(" ");
    expect(frame).not.toBe("salut toi");
  });

  it("locks characters in from the left", () => {
    const frame = scrambleFrame("abcdef", 0.5, seeded(4), "#");
    expect(frame).toBe("abc###");
  });

  it("returns the target once complete", () => {
    expect(scrambleFrame("decoded", 1, seeded(5))).toBe("decoded");
  });
});

describe("hexRows", () => {
  it("formats offset, bytes and ascii", () => {
    const rows = hexRows(encode("Hi\nMathis!"), 8, 0x10);
    expect(rows).toEqual([
      { offset: "00000010", bytes: ["48", "69", "0A", "4D", "61", "74", "68", "69"], ascii: "Hi.Mathi" },
      { offset: "00000018", bytes: ["73", "21"], ascii: "s!" },
    ]);
  });
});

describe("ParticleSystem", () => {
  it("emits, ages and removes particles", () => {
    const system = new ParticleSystem({ pixel: 4 }, seeded(6));
    system.emit(0, 0, { count: 10, colors: ["a", "b"], speed: [0.1, 0.2], life: [100, 100], size: [8, 8] });
    expect(system.particles).toHaveLength(10);
    system.update(50);
    expect(system.alive).toBe(true);
    system.update(60);
    expect(system.alive).toBe(false);
  });

  it("caps the number of particles", () => {
    const system = new ParticleSystem({ max: 5 }, seeded(7));
    system.emit(0, 0, { count: 8, colors: ["a"], speed: [0, 0], life: [10, 10], size: [4, 4] });
    expect(system.particles).toHaveLength(5);
  });

  it("applies gravity", () => {
    const system = new ParticleSystem({ gravity: 0.01, drag: 0 }, seeded(8));
    system.emit(0, 0, { count: 1, colors: ["a"], speed: [0, 0], life: [1000, 1000], size: [4, 4] });
    system.update(10);
    expect(system.particles[0]?.y).toBeGreaterThan(0);
  });

  it("shrinks continuously without size steps", () => {
    const system = new ParticleSystem({ pixel: 1, sizeSteps: 0 });
    const size = system.sizeOf({ x: 0, y: 0, vx: 0, vy: 0, age: 25, life: 100, size: 12, color: "a" });
    expect(size).toBe(9);
  });

  const sizeCases = [
    { age: 0, expected: 12 },
    { age: 50, expected: 8 },
    { age: 90, expected: 4 },
  ];
  sizeCases.forEach(({ age, expected }) => {
    it(`shrinks in steps at age ${age}`, () => {
      const system = new ParticleSystem({ pixel: 4 });
      const size = system.sizeOf({ x: 0, y: 0, vx: 0, vy: 0, age, life: 100, size: 12, color: "a" });
      expect(size).toBe(expected);
    });
  });
});

describe("advance", () => {
  const feed = (keys: string[]): number => keys.reduce((progress, key) => advance(KONAMI, progress, key), 0);

  const cases = [
    { name: "full sequence", keys: [...KONAMI], expected: KONAMI.length },
    { name: "uppercase letters", keys: [...KONAMI.slice(0, 8), "B", "A"], expected: KONAMI.length },
    { name: "wrong key resets", keys: ["ArrowUp", "ArrowUp", "x"], expected: 0 },
    { name: "restart on first key", keys: ["ArrowUp", "ArrowDown", "ArrowUp"], expected: 1 },
    { name: "extra leading key keeps progress", keys: ["ArrowUp", "ArrowUp", "ArrowUp"], expected: 2 },
    { name: "full sequence after extra leading key", keys: ["ArrowUp", ...KONAMI], expected: KONAMI.length },
  ];
  cases.forEach(({ name, keys, expected }) => {
    it(name, () => {
      expect(feed(keys)).toBe(expected);
    });
  });
});


describe("cellAt", () => {
  const cases = [
    { name: "origin", x: 0, y: 0, expected: { col: 0, row: 0 } },
    { name: "inside", x: 50, y: 25, expected: { col: 2, row: 1 } },
    { name: "left of grid", x: -1, y: 10, expected: null },
    { name: "past last column", x: 240, y: 10, expected: null },
  ];
  cases.forEach(({ name, x, y, expected }) => {
    it(name, () => {
      expect(cellAt(x, y, 24, 10, 10)).toEqual(expected);
    });
  });
});

describe("GlowGrid", () => {
  it("fades cells out and removes them", () => {
    const grid = new GlowGrid(1000);
    grid.light({ col: 1, row: 1 }, "a");
    grid.update(400);
    expect(grid.entries()[0]?.intensity).toBeCloseTo(0.6);
    grid.update(700);
    expect(grid.size).toBe(0);
  });

  it("keeps the brightest intensity when relit", () => {
    const grid = new GlowGrid(1000);
    grid.light({ col: 0, row: 0 }, "a", 1);
    grid.light({ col: 0, row: 0 }, "b", 0.4);
    expect(grid.entries()).toEqual([{ col: 0, row: 0, color: "a", intensity: 1 }]);
    grid.update(800);
    grid.light({ col: 0, row: 0 }, "b", 0.5);
    expect(grid.entries()[0]).toMatchObject({ color: "b", intensity: 0.5 });
  });

  it("clamps intensity to 1", () => {
    const grid = new GlowGrid(1000);
    grid.light({ col: 0, row: 0 }, "a", 3);
    expect(grid.entries()[0]?.intensity).toBe(1);
  });
});

describe("dither", () => {
  it("covers 16 distinct thresholds over a 4x4 tile", () => {
    const thresholds = Array.from({ length: 16 }, (_, i) => bayerThreshold(i % 4, Math.floor(i / 4)));
    expect(new Set(thresholds).size).toBe(16);
    thresholds.forEach((t) => {
      expect(t).toBeGreaterThan(0);
      expect(t).toBeLessThan(1);
    });
    expect(bayerThreshold(5, 6)).toBe(bayerThreshold(1, 2));
  });

  const fieldCases = [
    { name: "center", x: 100, y: 100, expected: 1 },
    { name: "at radius", x: 150, y: 100, expected: Math.exp(-2) },
    { name: "far away", x: 400, y: 100, expected: Math.exp(-72) },
  ];
  fieldCases.forEach(({ name, x, y, expected }) => {
    it(`blobField ${name}`, () => {
      expect(blobField(x, y, { x: 100, y: 100, radius: 50 })).toBeCloseTo(expected);
    });
  });

  it("keeps blobs inside the area", () => {
    Array.from({ length: 50 }, (_, i) => blobPosition(i * 3217, i % 3, 800, 600)).forEach(({ x, y }) => {
      expect(x).toBeGreaterThanOrEqual(0);
      expect(x).toBeLessThanOrEqual(800);
      expect(y).toBeGreaterThanOrEqual(0);
      expect(y).toBeLessThanOrEqual(600);
    });
  });
});

describe("drift", () => {
  const options = { count: 20, colors: ["a", "b"], size: [10, 40] as const, speed: [0.01, 0.02] as const, spin: [0, 0.001] as const };

  it("scatters drifters with depth tied to size", () => {
    const drifters = createDrifters(800, 600, options, seeded(9));
    expect(drifters).toHaveLength(20);
    const sorted = [...drifters].sort((a, b) => a.size - b.size);
    expect(sorted[sorted.length - 1]!.depth).toBeGreaterThan(sorted[0]!.depth);
    drifters.forEach((d) => {
      expect(d.depth).toBeGreaterThanOrEqual(0.3);
      expect(d.depth).toBeLessThanOrEqual(1);
    });
  });

  const stepCases = [
    { name: "moves up", y: 300, expected: 299 },
    { name: "wraps past the top", y: -11, expected: 610 },
  ];
  stepCases.forEach(({ name, y, expected }) => {
    it(name, () => {
      const drifter = { x: 0, y, size: 10, rotation: 0, spin: 0, speed: 0.01, depth: 1, color: "a" };
      stepDrifter(drifter, 100, 600);
      expect(drifter.y).toBeCloseTo(expected);
    });
  });
});
