import Link from "next/link";
import Image from "next/image";
import { getMenuTree } from "@/lib/domain/navigation";
import { getSiteSettings } from "@/lib/domain/settings";
import { getMediaUrlById } from "@/lib/domain/media";
import { MobileNav } from "./mobile-nav";

export async function SiteHeader() {
  const [menu, settings] = await Promise.all([getMenuTree("primary"), getSiteSettings()]);
  const logoUrl = await getMediaUrlById(settings.logo_media_id);

  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          {logoUrl ? (
            <Image src={logoUrl} alt={settings.site_name} width={120} height={32} className="h-8 w-auto" priority />
          ) : (
            <span>{settings.site_name || "hostmap"}</span>
          )}
        </Link>
        <nav aria-label="Primary" className="hidden items-center gap-6 md:flex">
          {menu.map((item) => (
            <Link
              key={item.id}
              href={item.url ?? "#"}
              target={item.open_in_new_tab ? "_blank" : undefined}
              rel={item.open_in_new_tab ? "noopener noreferrer" : undefined}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <MobileNav items={menu} />
      </div>
    </header>
  );
}
