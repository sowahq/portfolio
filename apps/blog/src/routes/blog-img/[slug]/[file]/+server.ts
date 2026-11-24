import { error } from "@sveltejs/kit";
import { encodeVariant, loadImageVariants } from "#lib/server/image-variants.js";
import type { EntryGenerator, RequestHandler } from "./$types";

export const prerender = true;

const CONTENT_TYPES = { avif: "image/avif", webp: "image/webp" } as const;

export const entries: EntryGenerator = async () => {
  const variants = await loadImageVariants();

  return [...variants.values()].map(({ path }) => {
    const [, , slug = "", file = ""] = path.split("/");

    return { slug, file };
  });
};

export const GET: RequestHandler = async ({ params }) => {
  const variant = (await loadImageVariants()).get(`/blog-img/${params.slug}/${params.file}`);

  if (!variant) {
    error(404, "Variante d'image introuvable");
  }

  return new Response(await encodeVariant(variant), {
    headers: { "content-type": CONTENT_TYPES[variant.format] },
  });
};
