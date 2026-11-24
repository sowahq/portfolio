import { crc32, deflateSync } from "node:zlib";
import type { Raster } from "./raster.js";

export const PNG_SIGNATURE: readonly number[] = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];

const BIT_DEPTH = 8;
const COLOR_TYPE_RGBA = 6;
const FILTER_NONE = 0;

function chunk(type: string, data: Uint8Array): Uint8Array {
  const typeBytes = new TextEncoder().encode(type);
  const bytes = new Uint8Array(12 + data.length);
  const view = new DataView(bytes.buffer);

  view.setUint32(0, data.length);
  bytes.set(typeBytes, 4);
  bytes.set(data, 8);
  view.setUint32(8 + data.length, crc32(bytes.subarray(4, 8 + data.length)));

  return bytes;
}

function header(width: number, height: number): Uint8Array {
  const data = new Uint8Array(13);
  const view = new DataView(data.buffer);

  view.setUint32(0, width);
  view.setUint32(4, height);
  data[8] = BIT_DEPTH;
  data[9] = COLOR_TYPE_RGBA;

  return data;
}

function scanlines({ width, height, data }: Raster): Uint8Array {
  const stride = width * 4;
  const lines = new Uint8Array(height * (stride + 1));

  for (let y = 0; y < height; y++) {
    lines[y * (stride + 1)] = FILTER_NONE;
    lines.set(data.subarray(y * stride, (y + 1) * stride), y * (stride + 1) + 1);
  }

  return lines;
}

function concat(parts: Uint8Array[]): Uint8Array<ArrayBuffer> {
  const bytes = new Uint8Array(parts.reduce((total, part) => total + part.length, 0));

  parts.reduce((offset, part) => {
    bytes.set(part, offset);

    return offset + part.length;
  }, 0);

  return bytes;
}

/**
 * Encodes a raster as an 8-bit RGBA PNG.
 */
export function encodePng(raster: Raster): Uint8Array<ArrayBuffer> {
  if (raster.width <= 0 || raster.height <= 0) {
    throw new Error("Une image PNG doit faire au moins un pixel.");
  }

  return concat([
    new Uint8Array(PNG_SIGNATURE),
    chunk("IHDR", header(raster.width, raster.height)),
    chunk("IDAT", deflateSync(scanlines(raster))),
    chunk("IEND", new Uint8Array(0)),
  ]);
}

/**
 * A PNG as a base64 data URL, to hand to the OG layout as an image source.
 */
export function pngDataUrl(png: Uint8Array): string {
  return `data:image/png;base64,${Buffer.from(png).toString("base64")}`;
}

export interface IcoImage {
  size: number;
  png: Uint8Array;
}

const ICO_HEADER = 6;
const ICO_ENTRY = 16;

/**
 * Packs PNG images into a .ico file, the PNG-in-ICO form every browser reads.
 */
export function encodeIco(images: IcoImage[]): Uint8Array<ArrayBuffer> {
  const directory = new Uint8Array(ICO_HEADER + images.length * ICO_ENTRY);
  const view = new DataView(directory.buffer);

  view.setUint16(2, 1, true);
  view.setUint16(4, images.length, true);

  images.reduce((offset, { size, png }, index) => {
    const entry = ICO_HEADER + index * ICO_ENTRY;

    directory[entry] = size >= 256 ? 0 : size;
    directory[entry + 1] = size >= 256 ? 0 : size;
    view.setUint16(entry + 4, 1, true);
    view.setUint16(entry + 6, 32, true);
    view.setUint32(entry + 8, png.length, true);
    view.setUint32(entry + 12, offset, true);

    return offset + png.length;
  }, directory.length);

  return concat([directory, ...images.map(({ png }) => png)]);
}
