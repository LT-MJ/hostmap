import "server-only";

import { headers } from "next/headers";

/** The per-request CSP nonce proxy.ts generates — needed on any inline
 * `<script>` this app renders itself (JSON-LD); framework-injected scripts
 * get it automatically via the CSP header, per Next's CSP guide. */
export async function getNonce(): Promise<string | undefined> {
  return (await headers()).get("x-nonce") ?? undefined;
}
