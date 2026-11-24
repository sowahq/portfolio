import { OG_IMAGE } from "../seo/image.js";
import { DEPARTURE_MONO_ADVANCE, MONOCRAFT_ADVANCE, OG_FONT } from "./fonts.js";
import { box, image, type OgChild, type OgElement, type OgStyle } from "./node.js";
import { encodePng, pngDataUrl } from "./png.js";
import { parseHexColor, type Raster } from "./raster.js";
import { cityBackdrop, depotStrip } from "./scene.js";
import { fitTitle } from "./text.js";
import { ogColors as colors } from "./tokens.js";

const WIDTH = OG_IMAGE.width;
const HEIGHT = OG_IMAGE.height;

const DEPOT_HEIGHT = 240;
const TITLE_TRACKING = -0.04;
const SIGN_SIZE = 15;
const SIGN_TRACKING = 0.18;
const SIGN_PADDING = 12;

const SHEET_LEFT = 64;
const SHEET_PADDING = 40;
const SHEET_WIDTH = WIDTH - SHEET_LEFT * 2;
const FICHE_TITLE_WIDTH = (SHEET_WIDTH - SHEET_PADDING * 2) * 0.97;
const FICHE_TITLE_HEIGHT = 150;
const FICHE_TITLE_SIZES = [72, 64, 56, 50, 44, 40] as const;
const FICHE_TITLE_LINE_HEIGHT = 1.1;

const NO_BREAK_SPACE = String.fromCharCode(0xa0);

function keepPunctuationAttached(text: string): string {
  return text.replace(/ ([?!:;»])/g, `${NO_BREAK_SPACE}$1`).replace(/(«) /g, `$1${NO_BREAK_SPACE}`);
}

function translucent(color: string, alpha: number): string {
  const [r, g, b] = parseHexColor(color);

  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function picture(raster: Raster, style: OgStyle): OgElement {
  return image(pngDataUrl(encodePng(raster)), raster.width, raster.height, style);
}

function frame(...children: OgChild[]): OgElement {
  const gridLine = `${colors.grid} 1px, transparent 1px`;

  return box(
    {
      position: "relative",
      width: WIDTH,
      height: HEIGHT,
      backgroundColor: colors.paper,
      backgroundImage: `linear-gradient(${gridLine}), linear-gradient(90deg, ${gridLine})`,
      backgroundSize: "32px 32px",
      color: colors.text,
      fontFamily: OG_FONT.sans,
      fontWeight: 600,
    },
    ...children,
  );
}

function handle(position: OgStyle): OgElement {
  return box({ position: "absolute", width: 8, height: 8, backgroundColor: colors.violet, ...position });
}

function sticker(label: string, tilt: number): OgElement {
  const style: OgStyle = {
    position: "relative",
    alignSelf: "flex-start",
    padding: "6px 18px",
    border: `2px solid ${colors.violet}`,
    backgroundColor: colors.highlight,
    color: colors.ink,
    fontFamily: OG_FONT.pixel,
    fontSize: 30,
    fontWeight: 600,
    letterSpacing: "-0.03em",
    transform: `rotate(${tilt}deg)`,
  };

  return box(
    style,
    handle({ top: -6, left: -6 }),
    handle({ top: -6, right: -6 }),
    handle({ bottom: -6, left: -6 }),
    handle({ bottom: -6, right: -6 }),
    box({}, label),
  );
}

function hostTag(host: string): OgElement {
  const style: OgStyle = {
    position: "absolute",
    right: 36,
    bottom: 10,
    color: colors.paper,
    fontFamily: OG_FONT.led,
    fontSize: 20,
    letterSpacing: "0.12em",
  };

  return box(style, host);
}

function depotLayer(sign: string): OgChild[] {
  const strip = depotStrip(WIDTH, DEPOT_HEIGHT);
  const top = HEIGHT - DEPOT_HEIGHT;
  const signWidth = sign.length * (DEPARTURE_MONO_ADVANCE + SIGN_TRACKING) * SIGN_SIZE + SIGN_PADDING * 2;

  const signStyle: OgStyle = {
    position: "absolute",
    left: Math.round(strip.placement.sign.left - signWidth / 2),
    top: top + strip.placement.sign.top,
    width: Math.ceil(signWidth),
    justifyContent: "center",
    padding: "3px 0",
    border: `2px solid ${colors.boardEdge}`,
    backgroundColor: colors.board,
    color: colors.boardText,
    fontFamily: OG_FONT.led,
    fontSize: SIGN_SIZE,
    letterSpacing: `${SIGN_TRACKING}em`,
  };

  return [picture(strip.image, { position: "absolute", left: 0, top }), box(signStyle, sign)];
}

export interface FicheDetail {
  term: string;
  value: string;
}

export interface FicheCard {
  /** Fiche number on three digits, e.g. "005". */
  number: string;
  /** Publication date as shown on the fiche, e.g. "20 août 2026". */
  date: string;
  title: string;
  details: FicheDetail[];
  host: string;
  sign: string;
}

function ficheTitle(title: string): OgElement {
  const { size, lines } = fitTitle(keepPunctuationAttached(title), {
    width: FICHE_TITLE_WIDTH,
    height: FICHE_TITLE_HEIGHT,
    advance: MONOCRAFT_ADVANCE + TITLE_TRACKING,
    lineHeight: FICHE_TITLE_LINE_HEIGHT,
    sizes: FICHE_TITLE_SIZES,
  });

  const style: OgStyle = {
    flexDirection: "column",
    color: colors.ink,
    fontFamily: OG_FONT.pixel,
    fontSize: size,
    fontWeight: 700,
    lineHeight: FICHE_TITLE_LINE_HEIGHT,
    letterSpacing: `${TITLE_TRACKING}em`,
  };

  return box(style, ...lines.map((line) => box({}, line)));
}

function ficheDetail({ term, value }: FicheDetail, index: number): OgElement {
  const style: OgStyle = {
    flexDirection: "column",
    paddingLeft: index === 0 ? 0 : 24,
    paddingRight: 24,
    borderLeft: index === 0 ? "none" : `2px solid ${colors.grid}`,
  };

  const termStyle: OgStyle = {
    color: colors.muted,
    fontFamily: OG_FONT.led,
    fontSize: 16,
    letterSpacing: "0.1em",
  };

  const valueStyle: OgStyle = {
    marginTop: 2,
    color: colors.ink,
    fontFamily: OG_FONT.pixel,
    fontSize: 22,
    fontWeight: 600,
  };

  return box(style, box(termStyle, term.toLocaleUpperCase("fr-FR")), box(valueStyle, value));
}

/**
 * The Open Graph card of a blog fiche: the intervention sheet pinned above the depot.
 */
export function ficheCard({ number, date, title, details, host, sign }: FicheCard): OgElement {
  const sheet: OgStyle = {
    position: "absolute",
    top: 44,
    left: SHEET_LEFT,
    width: SHEET_WIDTH,
    flexDirection: "column",
    backgroundColor: colors.card,
    boxShadow: `8px 8px 0 ${colors.ink}`,
    transform: "rotate(-0.4deg)",
  };

  const tape: OgStyle = {
    position: "absolute",
    top: -14,
    left: 48,
    width: 112,
    height: 28,
    backgroundColor: translucent(colors.highlight, 0.75),
    transform: "rotate(4deg)",
  };

  const band: OgStyle = {
    justifyContent: "space-between",
    padding: "12px 36px",
    backgroundColor: colors.board,
    color: colors.boardText,
    fontFamily: OG_FONT.led,
    fontSize: 22,
    letterSpacing: "0.12em",
  };

  const kit: OgStyle = {
    marginTop: 20,
    paddingTop: 16,
    borderTop: `2px dashed ${colors.grid}`,
  };

  return frame(
    ...depotLayer(sign),
    box(
      sheet,
      box(band, box({}, `FICHE D'INTERVENTION N° ${number}`), box({}, date.toLocaleUpperCase("fr-FR"))),
      box(
        { flexDirection: "column", padding: `26px ${SHEET_PADDING}px 28px` },
        ficheTitle(title),
        box(kit, ...details.map(ficheDetail)),
      ),
      box(tape),
    ),
    hostTag(host),
  );
}

export interface DepotHomeCard {
  sticker: string;
  title: string;
  lead: string;
  host: string;
  sign: string;
}

/**
 * The Open Graph card of the blog home page: the sticker, the big title and the depot.
 */
export function depotHomeCard({ sticker: label, title, lead, host, sign }: DepotHomeCard): OgElement {
  const titleStyle: OgStyle = {
    marginTop: 30,
    color: colors.ink,
    fontFamily: OG_FONT.pixel,
    fontSize: 150,
    fontWeight: 700,
    lineHeight: 0.9,
    letterSpacing: `${TITLE_TRACKING}em`,
  };

  const leadStyle: OgStyle = {
    marginTop: 26,
    maxWidth: 860,
    fontSize: 30,
    lineHeight: 1.35,
  };

  return frame(
    ...depotLayer(sign),
    box(
      { position: "absolute", top: 64, left: 72, flexDirection: "column" },
      sticker(label, -7),
      box(titleStyle, title),
      box(leadStyle, lead),
    ),
    hostTag(host),
  );
}

export interface ProfileCard {
  sticker: string;
  name: string;
  role: string;
  host: string;
}

/**
 * The Open Graph card of the portfolio: the hero over the Lille rooftops, the belfry and the VAL.
 */
export function profileCard({ sticker: label, name, role, host }: ProfileCard): OgElement {
  const nameStyle: OgStyle = {
    marginTop: 26,
    color: colors.ink,
    fontFamily: OG_FONT.pixel,
    fontSize: 124,
    fontWeight: 700,
    lineHeight: 0.92,
    letterSpacing: "-0.05em",
  };

  const roleStyle: OgStyle = {
    marginTop: 24,
    color: colors.ink,
    fontSize: 40,
  };

  return frame(
    picture(cityBackdrop(WIDTH, HEIGHT), { position: "absolute", left: 0, top: 0 }),
    box(
      { position: "absolute", top: 92, left: 80, flexDirection: "column" },
      sticker(label, -8),
      box(nameStyle, name),
      box(roleStyle, role),
    ),
    hostTag(host),
  );
}
