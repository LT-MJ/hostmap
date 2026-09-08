"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

export type ContentStatus = "draft" | "scheduled" | "published" | "archived";

const statusVariant: Record<ContentStatus, "default" | "secondary" | "outline"> = {
  published: "default",
  draft: "secondary",
  scheduled: "outline",
  archived: "outline",
};

export type ContentRow = {
  id: string;
  title: string;
  slug: string;
  status: ContentStatus;
  updatedAt: string;
};

const PAGE_SIZE = 20;

/** Client-side search/filter/sort/pagination (§37) — appropriate at CMS
 * scale (dozens to low hundreds of rows). Revisit with server-side
 * pagination if a real deployment's page/post count grows past what's
 * comfortable to send in one response. */
export function ContentTable({ rows, basePath }: { rows: ContentRow[]; basePath: string }) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<ContentStatus | "all">("all");
  const [page, setPage] = useState(0);

  const filtered = useMemo(() => {
    return rows.filter((row) => {
      if (statusFilter !== "all" && row.status !== statusFilter) return false;
      if (search && !row.title.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [rows, search, statusFilter]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        <Input
          placeholder="Search by title…"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(0);
          }}
          className="max-w-xs"
        />
        <Select
          value={statusFilter}
          onValueChange={(value) => {
            setStatusFilter(value as ContentStatus | "all");
            setPage(0);
          }}
        >
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="scheduled">Scheduled</SelectItem>
            <SelectItem value="published">Published</SelectItem>
            <SelectItem value="archived">Archived</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filtered.length === 0 ? (
        <p className="rounded-lg border border-dashed p-12 text-center text-sm text-muted-foreground">
          {rows.length === 0 ? "Nothing here yet." : "No results match your filters."}
        </p>
      ) : (
        <div className="overflow-x-auto rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Updated</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paged.map((row) => (
                <TableRow key={row.id}>
                  <TableCell>
                    <Link href={`${basePath}/${row.id}`} className="font-medium hover:underline">
                      {row.title || "(untitled)"}
                    </Link>
                    <p className="text-xs text-muted-foreground">/{row.slug}</p>
                  </TableCell>
                  <TableCell>
                    <Badge variant={statusVariant[row.status]}>{row.status}</Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(row.updatedAt).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {pageCount > 1 && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            Page {page + 1} of {pageCount}
          </span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage((p) => p - 1)}>
              Previous
            </Button>
            <Button variant="outline" size="sm" disabled={page >= pageCount - 1} onClick={() => setPage((p) => p + 1)}>
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
