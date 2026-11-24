# mth.lc

Monorepo of my portfolio (mth.lc) and the blog (blog.mth.lc), sharing one pixel-art design system.

## Structure

```
apps/
  portfolio/   SvelteKit 3, deployed on mth.lc
  blog/        SvelteKit 3, deployed on blog.mth.lc
packages/
  ui/          shared theme (Tailwind 4 tokens, fonts) and Svelte components
```

## Commands

Requires Node 22+ and pnpm.

```sh
pnpm install

pnpm dev                  # both sites: portfolio on :5173, blog on :5174
pnpm dev:portfolio        # portfolio only
pnpm dev:blog             # blog only

pnpm build                # every package
pnpm build:portfolio
pnpm build:blog

pnpm preview              # both production builds: portfolio on :4173, blog on :4174
pnpm preview:portfolio
pnpm preview:blog

pnpm check                # svelte-check / tsc in every package
pnpm test                 # vitest in every package
pnpm lint                 # prettier + eslint
pnpm format
```

Ports are fixed with `strictPort`: a command fails instead of silently moving to another port when one is taken.

The two sites link to each other through `sites` from `@mth/ui`: the local dev servers under `pnpm dev`, `https://mth.lc` and `https://blog.mth.lc` in a build. Canonical URLs, the sitemap and the feeds always use the production domains. To cross-link two local production previews, build with overrides:

```sh
VITE_PORTFOLIO_URL=http://localhost:4173 VITE_BLOG_URL=http://localhost:4174 pnpm build && pnpm preview
```

## License

Apache 2.0, see [LICENSE](./LICENSE).
