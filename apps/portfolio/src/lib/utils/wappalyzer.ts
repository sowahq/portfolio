// https://github.com/cheese233/wappalyzerTreater/blob/main/src/index.ts
// credits to cheese233
type Scalar = string | number | boolean;
type DetectionType = "dom" | "js";
type PostMessage = typeof window.postMessage;

interface WappalyzerTech {
  name: string;
  dom?: Record<string, unknown>;
  chains?: unknown;
  chain?: unknown;
  value?: Scalar;
}

interface WappalyzerPayload {
  js?: unknown;
  dom?: unknown;
  technologies?: WappalyzerTech[];
}

interface WappalyzerMessage {
  wappalyzer?: WappalyzerPayload;
}

interface Options {
  debug?: boolean;
  value: Scalar | ((tech: WappalyzerTech, type: DetectionType) => Scalar);
}

declare global {
  interface Window {
    postMessageUnbounded?: PostMessage;
  }
}

function isWappalyzerMessage(value: unknown): value is WappalyzerMessage {
  return typeof value === "object" && value !== null && "wappalyzer" in value;
}

/**
 * Rewrites the messages exchanged with the Wappalyzer extension so it reports the given value for every detected technology.
 */
export default async function (options: Options = { value: true }): Promise<void> {
  options.value ??= true;
  let techs: WappalyzerTech[] | undefined;

  const resolveValue = (tech: WappalyzerTech, type: DetectionType): Scalar =>
    typeof options.value === "function" ? options.value(tech, type) : options.value;

  window.postMessageUnbounded = window.postMessage;
  window.postMessage = new Proxy<PostMessage>(window.postMessage, {
    apply: (target, thisArg, args: Parameters<PostMessage>) => {
      const [message] = args;
      const payload = isWappalyzerMessage(message) ? message.wappalyzer : undefined;
      if (payload && techs) {
        if (payload.js) {
          if (options.debug) console.log("injecting js, original is", payload.js);
          payload.js = techs.map((tech) => {
            tech.value = resolveValue(tech, "js");
            if (tech.chains) {
              tech.chain = tech.chains;
              delete tech.chains;
            }
            return tech;
          });
        }
        if (payload.dom) {
          if (options.debug) console.log("injecting dom, original is", payload.dom);
          payload.dom = techs.map((tech) => ({
            name: tech.name,
            selector: Object.keys(tech.dom ?? {})[0],
            property: Object.values(tech.dom ?? {})[0],
            value: resolveValue(tech, "dom"),
          }));
        }
      }
      return Reflect.apply(target, thisArg, args);
    },
  });

  window.addEventListener("message", (event) => {
    if (!isWappalyzerMessage(event.data) || !event.data.wappalyzer?.technologies) return;
    techs = event.data.wappalyzer.technologies;
  });
}
