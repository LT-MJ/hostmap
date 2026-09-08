// Vitest has no concept of the "use client"/"use server" module graph
// Next.js's bundler uses to elide server-only code from client bundles (a
// production `next build` already proves that elision works — see
// vitest.config.ts). This stands in for `server-only`/`client-only` during
// tests only, so importing a module chain that happens to cross one of
// those markers doesn't throw outside of Next's own build.
export {};
