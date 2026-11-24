import { fileURLToPath } from "node:url";
import { build, type Plugin, type Rollup } from "vite";

const VIRTUAL_ID = "virtual:mth-early-paint";
const RESOLVED_ID = `\0${VIRTUAL_ID}`;
const ENTRY = fileURLToPath(new URL("./early/entry.ts", import.meta.url));

function firstChunk(result: Awaited<ReturnType<typeof build>>): Rollup.OutputChunk | undefined {
  const outputs = Array.isArray(result) ? result : [result];

  for (const output of outputs) {
    if ("output" in output) {
      const chunk = output.output.find((item): item is Rollup.OutputChunk => item.type === "chunk");

      if (chunk) {
        return chunk;
      }
    }
  }

  return undefined;
}

async function bundleEarlyPaint(): Promise<string> {
  const result = await build({
    configFile: false,
    logLevel: "silent",
    build: {
      write: false,
      minify: true,
      lib: { entry: ENTRY, formats: ["iife"], name: "mthEarlyPaint" },
    },
  });

  const chunk = firstChunk(result);

  if (!chunk) {
    throw new Error("Le script de premier rendu n'a pas pu être généré.");
  }

  return chunk.code.trim();
}

/**
 * Vite plugin exposing the early paint script, bundled as a classic IIFE, through `virtual:mth-early-paint`.
 */
export function earlyPaint(): Plugin {
  let code: Promise<string> | undefined;

  return {
    name: "mth-early-paint",

    resolveId(id) {
      return id === VIRTUAL_ID ? RESOLVED_ID : undefined;
    },

    async load(id) {
      if (id !== RESOLVED_ID) {
        return undefined;
      }

      code ??= bundleEarlyPaint();

      return `export default ${JSON.stringify(await code)};`;
    },
  };
}
