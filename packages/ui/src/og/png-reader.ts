import { crc32, inflateSync } from "node:zlib";
import { PNG_SIGNATURE } from "./png.js";
import type { Raster } from "./raster.js";

export interface PngChunk {
  type: string;
  data: Uint8Array;
  crcValid: boolean;
}

/**
 * Splits a PNG into its chunks, checking each CRC. Throws when the signature is wrong.
 */
export function readPngChunks(png: Uint8Array): PngChunk[] {
  if (!PNG_SIGNATURE.every((byte, index) => png[index] === byte)) {
    throw new Error("Signature PNG invalide.");
  }

  const view = new DataView(png.buffer, png.byteOffset, png.byteLength);
  const chunks: PngChunk[] = [];

  for (let offset = PNG_SIGNATURE.length; offset < png.length;) {
    const length = view.getUint32(offset);
    const typeAndData = png.subarray(offset + 4, offset + 8 + length);

    chunks.push({
      type: new TextDecoder().decode(typeAndData.subarray(0, 4)),
      data: typeAndData.subarray(4),
      crcValid: crc32(typeAndData) === view.getUint32(offset + 8 + length),
    });

    offset += 12 + length;
  }

  return chunks;
}

export interface PngHeader {
  width: number;
  height: number;
  bitDepth: number;
  colorType: number;
}

/**
 * Reads the IHDR chunk of a PNG.
 */
export function readPngHeader(png: Uint8Array): PngHeader {
  const header = readPngChunks(png).find((chunk) => chunk.type === "IHDR");

  if (!header) {
    throw new Error("Chunk IHDR manquant.");
  }

  const view = new DataView(header.data.buffer, header.data.byteOffset, header.data.byteLength);

  return {
    width: view.getUint32(0),
    height: view.getUint32(4),
    bitDepth: view.getUint8(8),
    colorType: view.getUint8(9),
  };
}

/**
 * Decodes an unfiltered 8-bit RGBA PNG, the kind `encodePng` writes, back into a raster.
 */
export function decodeRgbaPng(png: Uint8Array): Raster {
  const { width, height } = readPngHeader(png);
  const compressed = readPngChunks(png).filter((chunk) => chunk.type === "IDAT");
  const lines = inflateSync(Buffer.concat(compressed.map((chunk) => chunk.data)));
  const stride = width * 4;
  const data = new Uint8ClampedArray(width * height * 4);

  for (let y = 0; y < height; y++) {
    data.set(lines.subarray(y * (stride + 1) + 1, (y + 1) * (stride + 1)), y * stride);
  }

  return { width, height, data };
}
