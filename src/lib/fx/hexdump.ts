export interface HexRow {
  offset: string;
  bytes: string[];
  ascii: string;
}

const isPrintable = (byte: number): boolean => byte >= 0x20 && byte < 0x7f;

/**
 * Formats bytes the way a hex editor does: offset, hex bytes, printable ASCII.
 */
export function hexRows(data: Uint8Array, width = 16, startOffset = 0): HexRow[] {
  const count = Math.ceil(data.length / width);
  return Array.from({ length: count }, (_, row) => {
    const slice = Array.from(data.subarray(row * width, row * width + width));
    return {
      offset: (startOffset + row * width).toString(16).toUpperCase().padStart(8, "0"),
      bytes: slice.map((byte) => byte.toString(16).toUpperCase().padStart(2, "0")),
      ascii: slice.map((byte) => (isPrintable(byte) ? String.fromCharCode(byte) : ".")).join(""),
    };
  });
}

export function encode(text: string): Uint8Array {
  return new TextEncoder().encode(text);
}
