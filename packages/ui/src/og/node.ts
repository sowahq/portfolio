export type OgStyle = Record<string, string | number>;

export type OgChild = OgElement | string;

/**
 * An element in the shape satori reads (the same as a React element), built without React.
 */
export interface OgElement {
  type: "div" | "img";
  key: null;
  props: {
    style?: OgStyle;
    children?: OgChild[];
    src?: string;
    width?: number;
    height?: number;
  };
}

/**
 * A flex box. Satori lays out every element with flexbox, so it is the only container needed.
 */
export function box(style: OgStyle, ...children: OgChild[]): OgElement {
  return { type: "div", key: null, props: { style: { display: "flex", ...style }, children } };
}

/**
 * An image drawn at its own size, so a pixel-art PNG stays sharp.
 */
export function image(src: string, width: number, height: number, style: OgStyle = {}): OgElement {
  return { type: "img", key: null, props: { src, width, height, style: { width, height, ...style } } };
}
