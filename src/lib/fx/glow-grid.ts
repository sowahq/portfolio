export interface GridCell {
  col: number;
  row: number;
}

export interface LitCell extends GridCell {
  intensity: number;
  color: string;
}

/**
 * Grid cell containing a point, or null when the point is outside the grid.
 */
export function cellAt(x: number, y: number, cell: number, cols: number, rows: number): GridCell | null {
  const col = Math.floor(x / cell);
  const row = Math.floor(y / cell);
  if (col < 0 || row < 0 || col >= cols || row >= rows) return null;
  return { col, row };
}

/**
 * Cells that light up and fade out linearly over `fadeMs`.
 * Lighting an already lit cell keeps the brightest intensity.
 */
export class GlowGrid {
  private readonly cells = new Map<string, LitCell>();

  constructor(private readonly fadeMs: number) {}

  get size(): number {
    return this.cells.size;
  }

  light(cell: GridCell, color: string, intensity = 1): void {
    const key = `${cell.col}:${cell.row}`;
    const current = this.cells.get(key);
    if (current && current.intensity >= intensity) return;
    this.cells.set(key, { ...cell, color, intensity: Math.min(1, intensity) });
  }

  update(delta: number): void {
    const decay = delta / this.fadeMs;
    this.cells.forEach((cell, key) => {
      cell.intensity -= decay;
      if (cell.intensity <= 0) this.cells.delete(key);
    });
  }

  entries(): LitCell[] {
    return [...this.cells.values()];
  }
}
