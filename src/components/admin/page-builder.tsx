"use client";

import { useCallback, useMemo, useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  Copy,
  Eye,
  EyeOff,
  GripVertical,
  Plus,
  Trash2,
} from "lucide-react";
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { blockRegistry, blockList } from "@/lib/domain/blocks/registry";
import { validateContent, hasBlockingIssues } from "@/lib/domain/blocks/validate-content";
import { useAutosave } from "@/hooks/use-autosave";
import { SaveStateIndicator } from "@/components/admin/save-state-indicator";

export type EditableBlock = {
  id: string;
  position: number;
  block_type: string;
  config: unknown;
  is_hidden: boolean;
};

let localIdCounter = 0;
function newLocalId() {
  localIdCounter += 1;
  return `new-${Date.now()}-${localIdCounter}`;
}

function SortableBlockCard({
  block,
  isExpanded,
  onToggleExpand,
  onMove,
  onDuplicate,
  onToggleHidden,
  onRemove,
  isFirst,
  isLast,
  children,
}: {
  block: EditableBlock;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onMove: (direction: -1 | 1) => void;
  onDuplicate: () => void;
  onToggleHidden: () => void;
  onRemove: () => void;
  isFirst: boolean;
  isLast: boolean;
  children: React.ReactNode;
}) {
  const def = blockRegistry[block.block_type];
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: block.id,
  });

  return (
    <Card
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`${block.is_hidden ? "opacity-60" : ""} ${isDragging ? "z-10 shadow-lg" : ""}`}
    >
      <div className="flex items-center gap-2 border-b p-3">
        <button
          type="button"
          className="cursor-grab touch-none text-muted-foreground active:cursor-grabbing"
          aria-label={`Reorder ${def?.label ?? block.block_type} block`}
          {...attributes}
          {...listeners}
        >
          <GripVertical className="size-4" />
        </button>
        <button
          type="button"
          onClick={onToggleExpand}
          className="flex flex-1 items-center gap-2 text-left text-sm font-medium"
        >
          {def?.label ?? block.block_type}
          {block.is_hidden && <Badge variant="secondary">Hidden</Badge>}
        </button>
        <Button type="button" variant="ghost" size="icon-sm" aria-label="Move up" disabled={isFirst} onClick={() => onMove(-1)}>
          <ChevronUp className="size-4" />
        </Button>
        <Button type="button" variant="ghost" size="icon-sm" aria-label="Move down" disabled={isLast} onClick={() => onMove(1)}>
          <ChevronDown className="size-4" />
        </Button>
        <Button type="button" variant="ghost" size="icon-sm" aria-label="Duplicate" onClick={onDuplicate}>
          <Copy className="size-4" />
        </Button>
        <Button type="button" variant="ghost" size="icon-sm" aria-label={block.is_hidden ? "Show" : "Hide"} onClick={onToggleHidden}>
          {block.is_hidden ? <Eye className="size-4" /> : <EyeOff className="size-4" />}
        </Button>
        <Button type="button" variant="ghost" size="icon-sm" aria-label="Delete" onClick={onRemove}>
          <Trash2 className="size-4" />
        </Button>
      </div>
      {isExpanded && <div className="p-4">{children}</div>}
    </Card>
  );
}

export function PageBuilder({
  initialBlocks,
  onSave,
  canUseCustomHtml,
}: {
  initialBlocks: EditableBlock[];
  onSave: (blocks: EditableBlock[]) => Promise<void>;
  canUseCustomHtml: boolean;
}) {
  const [blocks, setBlocks] = useState<EditableBlock[]>(
    [...initialBlocks].sort((a, b) => a.position - b.position),
  );
  const [expandedId, setExpandedId] = useState<string | null>(blocks[0]?.id ?? null);

  const save = useCallback((next: EditableBlock[]) => onSave(next), [onSave]);
  const saveState = useAutosave(blocks, save);

  const issues = useMemo(() => validateContent(blocks), [blocks]);
  const blocked = hasBlockingIssues(issues);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const availableBlockTypes = blockList.filter((def) => !def.requiresPermission || canUseCustomHtml);

  function withRenumberedPositions(list: EditableBlock[]): EditableBlock[] {
    return list.map((b, i) => ({ ...b, position: i }));
  }

  function addBlock(blockType: string) {
    const def = blockRegistry[blockType];
    if (!def) return;
    const id = newLocalId();
    setBlocks(withRenumberedPositions([...blocks, { id, position: 0, block_type: blockType, config: def.defaultConfig, is_hidden: false }]));
    setExpandedId(id);
  }

  function updateBlock(id: string, config: unknown) {
    setBlocks((prev) => prev.map((b) => (b.id === id ? { ...b, config } : b)));
  }

  function removeBlock(id: string) {
    setBlocks((prev) => withRenumberedPositions(prev.filter((b) => b.id !== id)));
  }

  function duplicateBlock(id: string) {
    setBlocks((prev) => {
      const index = prev.findIndex((b) => b.id === id);
      if (index === -1) return prev;
      const copy: EditableBlock = { ...prev[index], id: newLocalId() };
      const next = [...prev];
      next.splice(index + 1, 0, copy);
      return withRenumberedPositions(next);
    });
  }

  function toggleHidden(id: string) {
    setBlocks((prev) => prev.map((b) => (b.id === id ? { ...b, is_hidden: !b.is_hidden } : b)));
  }

  function move(id: string, direction: -1 | 1) {
    setBlocks((prev) => {
      const index = prev.findIndex((b) => b.id === id);
      const target = index + direction;
      if (index === -1 || target < 0 || target >= prev.length) return prev;
      return withRenumberedPositions(arrayMove(prev, index, target));
    });
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    setBlocks((prev) => {
      const oldIndex = prev.findIndex((b) => b.id === active.id);
      const newIndex = prev.findIndex((b) => b.id === over.id);
      if (oldIndex === -1 || newIndex === -1) return prev;
      return withRenumberedPositions(arrayMove(prev, oldIndex, newIndex));
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-medium text-muted-foreground">Page content</h2>
        <SaveStateIndicator state={saveState} />
      </div>

      {issues.length > 0 && (
        <div className="space-y-1.5">
          {issues.map((issue, i) => (
            <Alert key={i} variant={issue.blocking ? "destructive" : "default"}>
              <AlertDescription>{issue.message}</AlertDescription>
            </Alert>
          ))}
        </div>
      )}

      {blocks.length === 0 ? (
        <p className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
          No blocks yet — add one to start building this page.
        </p>
      ) : (
        <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
          <SortableContext items={blocks.map((b) => b.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-3">
              {blocks.map((block, index) => {
                const def = blockRegistry[block.block_type];
                if (!def) return null;
                const Editor = def.Editor;
                return (
                  <SortableBlockCard
                    key={block.id}
                    block={block}
                    isExpanded={expandedId === block.id}
                    onToggleExpand={() => setExpandedId(expandedId === block.id ? null : block.id)}
                    onMove={(direction) => move(block.id, direction)}
                    onDuplicate={() => duplicateBlock(block.id)}
                    onToggleHidden={() => toggleHidden(block.id)}
                    onRemove={() => removeBlock(block.id)}
                    isFirst={index === 0}
                    isLast={index === blocks.length - 1}
                  >
                    <Editor config={block.config} onChange={(config) => updateBlock(block.id, config)} />
                  </SortableBlockCard>
                );
              })}
            </div>
          </SortableContext>
        </DndContext>
      )}

      <DropdownMenu>
        <DropdownMenuTrigger render={<Button type="button" variant="outline" />}>
          <Plus className="mr-1.5 size-4" /> Add block
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          {availableBlockTypes.map((def) => (
            <DropdownMenuItem key={def.key} onClick={() => addBlock(def.key)}>
              {def.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {blocked && (
        <p className="text-xs text-muted-foreground">
          Fix the issues above before this page can be published.
        </p>
      )}
    </div>
  );
}
