import Link from "next/link";
import { getMenuTree } from "@/lib/domain/navigation";
import { getSiteSettings } from "@/lib/domain/settings";

export async function SiteFooter() {
  const [menu, settings] = await Promise.all([getMenuTree("footer"), getSiteSettings()]);
  const year = new Date().getFullYear();

  return (
    <footer className="border-t bg-muted/30">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-12 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <p className="font-semibold">{settings.site_name || "hostmap"}</p>
          {settings.tagline && <p className="text-sm text-muted-foreground">{settings.tagline}</p>}
          {settings.contact_email && (
            <p className="text-sm text-muted-foreground">
              <a href={`mailto:${settings.contact_email}`} className="hover:text-foreground">
                {settings.contact_email}
              </a>
            </p>
          )}
        </div>
        <nav aria-label="Footer" className="flex flex-wrap gap-x-6 gap-y-2">
          {menu.map((item) => (
            <Link key={item.id} href={item.url ?? "#"} className="text-sm text-muted-foreground hover:text-foreground">
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
      <div className="border-t px-6 py-4 text-center text-xs text-muted-foreground">
        © {year} {settings.site_name || "hostmap"}. All rights reserved.
      </div>
    </footer>
  );
}
