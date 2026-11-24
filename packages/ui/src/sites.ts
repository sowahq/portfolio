export type SiteName = "portfolio" | "blog";

export type Sites = Record<SiteName, string>;

export type SiteOverrides = Partial<Record<SiteName, string | undefined>>;

export const productionSites: Sites = {
  portfolio: "https://mth.lc",
  blog: "https://blog.mth.lc",
};

export const developmentSites: Sites = {
  portfolio: "http://localhost:5173",
  blog: "http://localhost:5174",
};

function normalized(url: string | undefined): string | undefined {
  const value = url?.trim();

  return value ? value.replace(/\/+$/, "") : undefined;
}

/**
 * Base URLs the two sites use to link to each other: the local dev servers in development,
 * the real domains in a build, unless an explicit override is given (a staging deploy, a preview).
 */
export function resolveSites(development: boolean, overrides: SiteOverrides = {}): Sites {
  const base = development ? developmentSites : productionSites;

  return {
    portfolio: normalized(overrides.portfolio) ?? base.portfolio,
    blog: normalized(overrides.blog) ?? base.blog,
  };
}

export const sites: Sites = resolveSites(import.meta.env.DEV, {
  portfolio: import.meta.env.VITE_PORTFOLIO_URL,
  blog: import.meta.env.VITE_BLOG_URL,
});
