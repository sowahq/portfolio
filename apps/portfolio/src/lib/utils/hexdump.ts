/**
 * Formats the first bytes of a string as a hexdump line, the way a disassembler shows them.
 */
export function hexdumpLine(text: string, length = 10): string {
  const bytes = [...new TextEncoder().encode(text)].slice(0, length);
  const hex = bytes.map((byte) => byte.toString(16).padStart(2, "0")).join(" ");

  return `00000000  ${hex}`;
}
