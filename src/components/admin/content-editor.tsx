"use client";

import { useCallback, useState, useTransition } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, ExternalLink } from "lucide-react";
import { PageBuilder, type EditableBlock } from "@/components/admin/page-builder";
import { useAutosave } from "@/hooks/use-autosave";
import { SaveStateIndicator } from "@/components/admin/save-state-indicator";

export type ContentFields = {
  title: string;
  slug: string;
  excerpt: string;
  seoTitle: string;
  metaDescription: string;
};

export type RevisionSummary = {
  id: string;
  revision_number: number;
  created_at: string;
  change_note: string | null;
};

export function ContentEditor({
  status,
  scheduledAt,
  publicUrl,
  initialFields,
  initialBlocks,
  revisions,
  canUseCustomHtml,
  canPublish,
  onSaveFields,
  onSaveBlocks,
  onPublish,
  onSchedule,
  onUnpublish,
  onRestoreRevision,
}: {
  status: "draft" | "scheduled" | "published" | "archived";
  scheduledAt: string | null;
  publicUrl: string;
  initialFields: ContentFields;
  initialBlocks: EditableBlock[];
  revisions: RevisionSummary[];
  canUseCustomHtml: boolean;
  canPublish: boolean;
  onSaveFields: (fields: ContentFields) => Promise<void>;
  onSaveBlocks: (blocks: EditableBlock[]) => Promise<void>;
  onPublish: () => Promise<{ error: string | null }>;
  onSchedule: (date: string) => Promise<{ error: string | null }>;
  onUnpublish: () => Promise<void>;
  onRestoreRevision: (revisionId: string) => Promise<void>;
}) {
  const [fields, setFields] = useState(initialFields);
  const [publishError, setPublishError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [scheduleDate, setScheduleDate] = useState("");

  const saveFields = useCallback((f: ContentFields) => onSaveFields(f), [onSaveFields]);
  const fieldsSaveState = useAutosave(fields, saveFields);

  function update<K extends keyof ContentFields>(key: K, value: ContentFields[K]) {
    setFields((prev) => ({ ...prev, [key]: value }));
  }

  function handlePublish() {
    setPublishError(null);
    startTransition(async () => {
      const result = await onPublish();
      if (result.error) setPublishError(result.error);
    });
  }

  function handleSchedule() {
    if (!scheduleDate) return;
    setPublishError(null);
    startTransition(async () => {
      const result = await onSchedule(new Date(scheduleDate).toISOString());
      if (result.error) setPublishError(result.error);
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Badge variant={status === "published" ? "default" : "secondary"}>{status}</Badge>
          <SaveStateIndicator state={fieldsSaveState} />
        </div>
        <div className="flex items-center gap-2">
          {status === "published" && (
            <Button variant="outline" size="sm" render={<a href={publicUrl} target="_blank" rel="noopener noreferrer" />}>
              View live <ExternalLink className="ml-1.5 size-3.5" />
            </Button>
          )}
          {status === "published" ? (
            <Button variant="outline" onClick={() => startTransition(() => onUnpublish())} disabled={isPending}>
              Unpublish
            </Button>
          ) : (
            canPublish && (
              <DropdownMenu>
                <div className="flex">
                  <Button className="rounded-r-none" onClick={handlePublish} disabled={isPending}>
                    Publish
                  </Button>
                  <DropdownMenuTrigger
                    render={<Button className="rounded-l-none border-l border-primary-foreground/20 px-2" />}
                  >
                    <ChevronDown className="size-4" />
                  </DropdownMenuTrigger>
                </div>
                <DropdownMenuContent align="end" className="w-64 space-y-2 p-3">
                  <Label className="text-xs">Schedule for later</Label>
                  <Input
                    type="datetime-local"
                    value={scheduleDate}
                    onChange={(e) => setScheduleDate(e.target.value)}
                  />
                  <Button size="sm" className="w-full" onClick={handleSchedule} disabled={!scheduleDate || isPending}>
                    Schedule
                  </Button>
                </DropdownMenuContent>
              </DropdownMenu>
            )
          )}
        </div>
      </div>

      {status === "scheduled" && scheduledAt && (
        <Alert>
          <AlertDescription>
            Scheduled to publish {new Date(scheduledAt).toLocaleString()}.
          </AlertDescription>
        </Alert>
      )}
      {publishError && (
        <Alert variant="destructive">
          <AlertDescription>{publishError}</AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="content">
        <TabsList>
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="seo">SEO</TabsTrigger>
          <TabsTrigger value="revisions">
            Revisions {revisions.length > 0 && `(${revisions.length})`}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="content" className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Title</Label>
              <Input value={fields.title} onChange={(e) => update("title", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Slug</Label>
              <Input value={fields.slug} onChange={(e) => update("slug", e.target.value)} />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Excerpt</Label>
            <Textarea value={fields.excerpt} onChange={(e) => update("excerpt", e.target.value)} rows={2} />
          </div>

          <PageBuilder initialBlocks={initialBlocks} onSave={onSaveBlocks} canUseCustomHtml={canUseCustomHtml} />
        </TabsContent>

        <TabsContent value="seo" className="space-y-4">
          <div className="space-y-1.5">
            <Label>SEO title</Label>
            <Input
              value={fields.seoTitle}
              onChange={(e) => update("seoTitle", e.target.value)}
              placeholder={fields.title}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Meta description</Label>
            <Textarea value={fields.metaDescription} onChange={(e) => update("metaDescription", e.target.value)} rows={3} />
            <p className="text-xs text-muted-foreground">
              {fields.metaDescription.length} characters (aim for 50–160)
            </p>
          </div>
        </TabsContent>

        <TabsContent value="revisions">
          {revisions.length === 0 ? (
            <p className="text-sm text-muted-foreground">No published revisions yet.</p>
          ) : (
            <ul className="divide-y rounded-lg border">
              {revisions.map((revision) => (
                <li key={revision.id} className="flex items-center justify-between p-3 text-sm">
                  <span>
                    Revision {revision.revision_number} —{" "}
                    <span className="text-muted-foreground">{new Date(revision.created_at).toLocaleString()}</span>
                    {revision.change_note && <span className="text-muted-foreground"> · {revision.change_note}</span>}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => startTransition(() => onRestoreRevision(revision.id))}
                    disabled={isPending}
                  >
                    Restore into draft
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
