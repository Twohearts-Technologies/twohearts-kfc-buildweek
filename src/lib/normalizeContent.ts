// Legacy-shape shim for fetched content. The live KV holds full content
// snapshots that predate the `metrics.workflowNotes` array — they still carry
// the old fixed `metrics.guardrails` and `metrics.dataNote` fields. This helper
// upgrades a raw fetched payload to the current schema BEFORE it is deep-merged
// over the bundled defaults, so a store owner's edits to those notes survive the
// migration. Call it from every path that consumes fetched content (the public
// page's useContent hook and the /edit editor's load path) so the logic lives in
// exactly one place. It is null-safe: malformed legacy notes are dropped, never
// thrown on.

import type { LabeledNote } from "../types/content";

function isPlainObject(value: unknown): value is Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

function isWorkflowNote(value: unknown): value is LabeledNote {
  if (!isPlainObject(value)) return false;
  const { label, body } = value;
  return typeof label === "string" && typeof body === "string";
}

/** Coerce an unknown value into a LabeledNote, or null if it is malformed. */
function toLabeledNote(value: unknown): LabeledNote | null {
  if (!isWorkflowNote(value)) return null;
  const { label, body } = value;
  return { label, body };
}

/**
 * Normalize a raw fetched content object to the current schema. If `metrics`
 * carries the legacy `guardrails`/`dataNote` fields but no `workflowNotes`,
 * build `workflowNotes` from them (guardrails first, then dataNote, dropping any
 * malformed values) and strip the legacy keys. Content that already has
 * `workflowNotes` keeps it authoritative while malformed entries are dropped.
 */
export function normalizeContent(raw: unknown): unknown {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return raw;

  const root = raw as Record<string, unknown>;
  const metrics = root.metrics;
  if (!metrics || typeof metrics !== "object" || Array.isArray(metrics)) {
    return raw;
  }

  const metricsRecord = metrics as Record<string, unknown>;
  const existingWorkflowNotes = metricsRecord.workflowNotes;
  const hasLegacy =
    "guardrails" in metricsRecord || "dataNote" in metricsRecord;
  if (Array.isArray(existingWorkflowNotes)) {
    const workflowNotes = existingWorkflowNotes.filter(isWorkflowNote);
    const isAlreadyNormalized =
      !hasLegacy && workflowNotes.length === existingWorkflowNotes.length;
    if (isAlreadyNormalized) return raw;

    const nextMetrics: Record<string, unknown> = {
      ...metricsRecord,
      workflowNotes,
    };
    delete nextMetrics.guardrails;
    delete nextMetrics.dataNote;

    return { ...root, metrics: nextMetrics };
  }

  if (!hasLegacy) return raw;

  const workflowNotes: LabeledNote[] = [];
  const guardrails = toLabeledNote(metricsRecord.guardrails);
  if (guardrails) workflowNotes.push(guardrails);
  const dataNote = toLabeledNote(metricsRecord.dataNote);
  if (dataNote) workflowNotes.push(dataNote);

  const nextMetrics: Record<string, unknown> = {
    ...metricsRecord,
    workflowNotes,
  };
  delete nextMetrics.guardrails;
  delete nextMetrics.dataNote;

  return { ...root, metrics: nextMetrics };
}
