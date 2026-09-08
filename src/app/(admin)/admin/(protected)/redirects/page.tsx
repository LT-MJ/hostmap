import { listRedirectsForAdmin, listNotFoundLog } from "@/lib/domain/redirects";
import { RedirectsManager } from "@/components/admin/redirects-manager";

export default async function RedirectsPage() {
  const [redirects, notFoundLog] = await Promise.all([listRedirectsForAdmin(), listNotFoundLog()]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">SEO &amp; redirects</h1>
      <RedirectsManager initialRedirects={redirects} notFoundLog={notFoundLog} />
    </div>
  );
}
