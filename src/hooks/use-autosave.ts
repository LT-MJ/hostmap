"use client";

import { useEffect, useRef, useState } from "react";

export type SaveState = "idle" | "unsaved" | "saving" | "saved" | "error";

/**
 * Debounced persistence with a stale-response guard (§15: "autosave must
 * not cause data corruption"). "Unsaved" is set the instant `value`
 * changes, before the debounce timer even fires, so the UI never lies
 * about there being unconfirmed edits. Each save call carries an
 * incrementing sequence number; a response for an old sequence (a slow
 * save whose result arrives after a newer edit already started a later
 * save) is discarded rather than allowed to overwrite newer local state
 * with a stale "saved" status.
 */
export function useAutosave<T>(value: T, save: (value: T) => Promise<void>, delayMs = 800) {
  const [state, setState] = useState<SaveState>("idle");
  const sequenceRef = useRef(0);
  const savedSnapshotRef = useRef<string>(JSON.stringify(value));
  const isFirstRun = useRef(true);

  useEffect(() => {
    if (isFirstRun.current) {
      isFirstRun.current = false;
      return;
    }

    const serialized = JSON.stringify(value);
    if (serialized === savedSnapshotRef.current) return;

    setState("unsaved");
    const mySequence = ++sequenceRef.current;

    const timeout = setTimeout(async () => {
      setState("saving");
      try {
        await save(value);
        if (sequenceRef.current !== mySequence) return; // superseded — ignore
        savedSnapshotRef.current = serialized;
        setState("saved");
        setTimeout(() => {
          if (sequenceRef.current === mySequence) setState("idle");
        }, 2000);
      } catch {
        if (sequenceRef.current === mySequence) setState("error");
      }
    }, delayMs);

    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- `save` is expected to be stable (useCallback'd by the caller); re-running on every render would defeat the debounce.
  }, [value]);

  return state;
}
