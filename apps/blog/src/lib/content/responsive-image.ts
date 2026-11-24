export const IMAGE_FORMATS = ["avif", "webp"] as const;

export type ImageFormat = (typeof IMAGE_FORMATS)[number];

export const VARIANT_WIDTHS: readonly number[] = [800, 1200];

/** Sizes of an image that fills the reading column, 46rem wide at most. */
export const COLUMN_SIZES = "(max-width: 46rem) 100vw, 46rem";

/** Sizes of the cover on the featured card of the home page. */
export const FEATURED_SIZES = "(max-width: 40rem) 100vw, (max-width: 70rem) 52vw, 34rem";

const RESIZABLE = /^(\/blog-img\/[a-z0-9-]+\/)([\w-]+)\.(?:png|jpe?g|webp)$/i;

export interface ImageSource {
  type: `image/${ImageFormat}`;
  srcset: string;
}

export interface ImageVariant {
  /** Path the variant is served from. */
  path: string;
  /** Path of the original image under static/. */
  source: string;
  width: number;
  format: ImageFormat;
}

/**
 * Whether an image is a raster file of the blog that gets resized variants.
 */
export function isResizable(src: string): boolean {
  return RESIZABLE.test(src);
}

/**
 * The widths generated for an image: the standard ones narrower than the original, then the original.
 */
export function variantWidths(originalWidth: number): number[] {
  return [...VARIANT_WIDTHS.filter((width) => width < originalWidth), originalWidth];
}

/**
 * Path of a resized variant, next to the original: /blog-img/slug/header-800.webp.
 */
export function variantPath(src: string, width: number, format: ImageFormat): string {
  const match = RESIZABLE.exec(src);

  if (!match) {
    throw new Error(`Image sans variantes : ${src}`);
  }

  return `${match[1]}${match[2]}-${width}.${format}`;
}

/**
 * Every variant of an image, one per width and format. None for remote, vector or unsized images.
 */
export function imageVariants(src: string, width: number | string | undefined): ImageVariant[] {
  if (typeof width !== "number" || !isResizable(src)) {
    return [];
  }

  return IMAGE_FORMATS.flatMap((format) =>
    variantWidths(width).map((size) => ({ path: variantPath(src, size, format), source: src, width: size, format })),
  );
}

/**
 * The <source> elements of an image, the smallest formats first.
 */
export function imageSources(src: string, width: number | string | undefined): ImageSource[] {
  const variants = imageVariants(src, width);

  return IMAGE_FORMATS.flatMap((format) => {
    const candidates = variants.filter((variant) => variant.format === format);

    if (candidates.length === 0) {
      return [];
    }

    const srcset = candidates.map((variant) => `${variant.path} ${variant.width}w`).join(", ");

    return [{ type: `image/${format}` as const, srcset }];
  });
}
