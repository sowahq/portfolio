import { parse } from "yaml";
import { z } from "zod";
import { toIsoDate } from "./dates.js";
import { WORKSHOPS } from "./workshops.js";

const FRONTMATTER = /^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/;

const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const frontmatterSchema = z.object({
  title: z.string().min(1),
  seoTitle: z.string().min(1).optional(),
  description: z.string().min(1),
  pubDate: z
    .string()
    .refine((value) => toIsoDate(value) !== null, "date attendue au format MM/DD/YYYY ou YYYY-MM-DD")
    .transform((value) => toIsoDate(value) ?? value),
  image: z.string().startsWith("/"),
  tags: z.array(z.string().min(1)),
  slug: z.string().regex(SLUG, "slug attendu en kebab-case ASCII"),
  published: z.boolean().default(false),
  cible: z.string().min(1),
  protocole: z.string().min(1).optional(),
  outils: z.array(z.string().min(1)),
  ateliers: z.array(z.enum(WORKSHOPS)).min(1),
  court: z.string().min(1),
});

export type Frontmatter = z.output<typeof frontmatterSchema>;

export interface PostSource {
  frontmatter: Frontmatter;
  content: string;
}

/**
 * Splits a markdown file into its raw YAML frontmatter and its body.
 */
export function splitFrontmatter(source: string): { yaml: string; content: string } {
  const match = FRONTMATTER.exec(source);

  if (!match) {
    return { yaml: "", content: source };
  }

  return {
    yaml: match[1] ?? "",
    content: source.slice(match[0].length),
  };
}

/**
 * Parses and validates the frontmatter of a post. Throws with the file name when it is invalid,
 * so a broken post fails the build instead of disappearing silently.
 */
export function parsePostSource(source: string, file: string): PostSource {
  const { yaml, content } = splitFrontmatter(source);
  const result = frontmatterSchema.safeParse(parse(yaml) ?? {});

  if (!result.success) {
    const issues = result.error.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`);

    throw new Error(`Frontmatter invalide dans ${file} : ${issues.join(", ")}`);
  }

  return { frontmatter: result.data, content };
}
