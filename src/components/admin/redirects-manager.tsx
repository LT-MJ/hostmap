"use client";

import { useActionState, useState, useTransition } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Trash2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createRedirectAction, deleteRedirectAction, dismissNotFoundAction } from "@/lib/actions/redirects";
import type { RedirectRow, NotFoundLogRow } from "@/lib/domain/redirects";

const initialState = { error: null as string | null };

export function RedirectsManager({
  initialRedirects,
  notFoundLog,
}: {
  initialRedirects: RedirectRow[];
  notFoundLog: NotFoundLogRow[];
}) {
  const [redirects, setRedirects] = useState(initialRedirects);
  const [notFound, setNotFound] = useState(notFoundLog);
  const [state, formAction, isPending] = useActionState(createRedirectAction, initialState);
  const [, startTransition] = useTransition();
  const [prefillSource, setPrefillSource] = useState("");

  function removeRedirect(id: string) {
    setRedirects((prev) => prev.filter((r) => r.id !== id));
    startTransition(() => deleteRedirectAction(id));
  }

  function dismissEntry(id: string) {
    setNotFound((prev) => prev.filter((entry) => entry.id !== id));
    startTransition(() => dismissNotFoundAction(id));
  }

  return (
    <div className="space-y-8">
      <section className="space-y-3">
        <h2 className="text-sm font-medium text-muted-foreground">New redirect</h2>
        <form action={formAction} className="flex flex-wrap items-end gap-2 rounded-lg border p-4">
          {state.error && (
            <Alert variant="destructive" className="w-full">
              <AlertDescription>{state.error}</AlertDescription>
            </Alert>
          )}
          <div className="space-y-1.5">
            <Label>From</Label>
            <Input
              name="sourcePath"
              value={prefillSource}
              onChange={(e) => setPrefillSource(e.target.value)}
              placeholder="/old-page"
              className="w-48"
            />
          </div>
          <div className="space-y-1.5">
            <Label>To</Label>
            <Input name="destinationPath" placeholder="/new-page" className="w-48" />
          </div>
          <div className="space-y-1.5">
            <Label>Type</Label>
            <Select name="statusCode" defaultValue="301">
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="301">301 (permanent)</SelectItem>
                <SelectItem value="302">302 (temporary)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button type="submit" disabled={isPending}>
            {isPending ? "Creating…" : "Create"}
          </Button>
        </form>
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-medium text-muted-foreground">Active redirects</h2>
        {redirects.length === 0 ? (
          <p className="text-sm text-muted-foreground">No redirects yet.</p>
        ) : (
          <div className="space-y-2">
            {redirects.map((redirect) => (
              <Card key={redirect.id} className="flex items-center justify-between p-3 text-sm">
                <span>
                  <code>{redirect.source_path}</code> → <code>{redirect.destination_path}</code>{" "}
                  <Badge variant="outline">{redirect.status_code}</Badge>{" "}
                  <span className="text-muted-foreground">{redirect.hit_count} hits</span>
                </span>
                <Button variant="ghost" size="icon-sm" onClick={() => removeRedirect(redirect.id)}>
                  <Trash2 className="size-4" />
                </Button>
              </Card>
            ))}
          </div>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-medium text-muted-foreground">404s (top hits)</h2>
        {notFound.length === 0 ? (
          <p className="text-sm text-muted-foreground">No 404s recorded.</p>
        ) : (
          <div className="space-y-2">
            {notFound.map((entry) => (
              <Card key={entry.id} className="flex items-center justify-between p-3 text-sm">
                <span>
                  <code>{entry.url}</code>{" "}
                  <span className="text-muted-foreground">
                    {entry.hit_count} hits · last {new Date(entry.last_seen_at).toLocaleDateString()}
                  </span>
                </span>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => setPrefillSource(entry.url)}>
                    Create redirect
                  </Button>
                  <Button variant="ghost" size="icon-sm" onClick={() => dismissEntry(entry.id)}>
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
