import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getDashboardStats } from "@/lib/domain/dashboard";

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-3xl font-semibold tracking-tight">{value}</p>
      </CardContent>
    </Card>
  );
}

export default async function AdminDashboardPage() {
  const stats = await getDashboardStats();
  const publishedPages = stats.pagesByStatus.published ?? 0;
  const draftPages = (stats.pagesByStatus.draft ?? 0) + (stats.pagesByStatus.scheduled ?? 0);
  const publishedPosts = stats.postsByStatus.published ?? 0;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Published pages" value={publishedPages} />
        <StatCard label="Draft/scheduled pages" value={draftPages} />
        <StatCard label="Published posts" value={publishedPosts} />
        <StatCard label="Media files" value={stats.mediaCount} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent activity</CardTitle>
        </CardHeader>
        <CardContent>
          {stats.recentActivity.length === 0 ? (
            <p className="text-sm text-muted-foreground">No activity yet.</p>
          ) : (
            <ul className="divide-y">
              {stats.recentActivity.map((entry) => (
                <li key={entry.id} className="flex items-center justify-between py-2.5 text-sm">
                  <span>
                    <Badge variant="secondary" className="mr-2">
                      {entry.entity_type}
                    </Badge>
                    {entry.action}
                    {entry.actor_email && <span className="text-muted-foreground"> · {entry.actor_email}</span>}
                  </span>
                  <time className="text-muted-foreground" dateTime={entry.created_at}>
                    {new Date(entry.created_at).toLocaleString()}
                  </time>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
