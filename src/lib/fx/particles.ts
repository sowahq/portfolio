import { snap } from "./quantize.js";
import { pick, range, type Random } from "./random.js";

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  age: number;
  life: number;
  size: number;
  color: string;
}

export interface ParticleSystemOptions {
  pixel: number;
  gravity: number;
  drag: number;
  max: number;
  sizeSteps: number;
}

export interface EmitOptions {
  count: number;
  colors: readonly string[];
  speed: readonly [number, number];
  life: readonly [number, number];
  size: readonly [number, number];
  angle?: number;
  spread?: number;
}

const DEFAULT_OPTIONS: ParticleSystemOptions = {
  pixel: 4,
  gravity: 0.0006,
  drag: 0.002,
  max: 600,
  sizeSteps: 3,
};

/**
 * Square particles snapped to a pixel grid, shrinking in discrete steps as they age.
 * Velocities are in px/ms, gravity in px/ms².
 */
export class ParticleSystem {
  readonly particles: Particle[] = [];
  readonly options: ParticleSystemOptions;

  constructor(
    options: Partial<ParticleSystemOptions> = {},
    private readonly random: Random = Math.random,
  ) {
    this.options = { ...DEFAULT_OPTIONS, ...options };
  }

  get alive(): boolean {
    return this.particles.length > 0;
  }

  emit(x: number, y: number, emit: EmitOptions): void {
    const angle = emit.angle ?? 0;
    const spread = emit.spread ?? Math.PI * 2;
    Array.from({ length: emit.count }).forEach(() => {
      const direction = angle - spread / 2 + this.random() * spread;
      const speed = range(this.random, emit.speed);
      this.particles.push({
        x,
        y,
        vx: Math.cos(direction) * speed,
        vy: Math.sin(direction) * speed,
        age: 0,
        life: range(this.random, emit.life),
        size: range(this.random, emit.size),
        color: pick(this.random, emit.colors),
      });
    });
    const overflow = this.particles.length - this.options.max;
    if (overflow > 0) this.particles.splice(0, overflow);
  }

  update(delta: number): void {
    const { gravity, drag } = this.options;
    const friction = Math.max(0, 1 - drag * delta);
    this.particles.forEach((particle) => {
      particle.age += delta;
      particle.vy += gravity * delta;
      particle.vx *= friction;
      particle.vy *= friction;
      particle.x += particle.vx * delta;
      particle.y += particle.vy * delta;
    });
    const survivors = this.particles.filter((particle) => particle.age < particle.life);
    this.particles.splice(0, this.particles.length, ...survivors);
  }

  /**
   * Size of a particle at its current age, shrinking in `sizeSteps` steps on the pixel grid,
   * or continuously when `sizeSteps` is 0.
   */
  sizeOf(particle: Particle): number {
    const { pixel, sizeSteps } = this.options;
    const remaining = 1 - particle.age / particle.life;
    const stage = sizeSteps > 0 ? Math.ceil(remaining * sizeSteps) / sizeSteps : remaining;
    return Math.max(pixel, snap(particle.size * stage, pixel));
  }

  draw(context: CanvasRenderingContext2D): void {
    const { pixel } = this.options;
    this.particles.forEach((particle) => {
      const size = this.sizeOf(particle);
      context.fillStyle = particle.color;
      context.fillRect(
        snap(particle.x - size / 2, pixel),
        snap(particle.y - size / 2, pixel),
        size,
        size,
      );
    });
  }
}
