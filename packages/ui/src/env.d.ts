interface ImportMetaEnv {
  readonly DEV: boolean;
  readonly VITE_PORTFOLIO_URL?: string;
  readonly VITE_BLOG_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
