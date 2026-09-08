import { listMenuItemsForAdmin } from "@/lib/domain/navigation";
import { MenuEditor } from "@/components/admin/menu-editor";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default async function NavigationPage() {
  const [primaryItems, footerItems] = await Promise.all([
    listMenuItemsForAdmin("primary"),
    listMenuItemsForAdmin("footer"),
  ]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">Navigation</h1>
      <Tabs defaultValue="primary">
        <TabsList>
          <TabsTrigger value="primary">Header</TabsTrigger>
          <TabsTrigger value="footer">Footer</TabsTrigger>
        </TabsList>
        <TabsContent value="primary">
          <MenuEditor menuKey="primary" initialItems={primaryItems} />
        </TabsContent>
        <TabsContent value="footer">
          <MenuEditor menuKey="footer" initialItems={footerItems} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
