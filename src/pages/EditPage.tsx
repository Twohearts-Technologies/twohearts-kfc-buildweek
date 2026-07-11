import { useCallback, useEffect, useRef, useState } from "react";
import { defaultContent } from "../data/defaults";
import { deepMerge } from "../lib/deepMerge";
import type {
  DemoStep,
  FooterLink,
  LabeledNote,
  PipelineInput,
  SiteContent,
  Stat,
  TagTone,
  TeamMember,
  TextSegment,
  WhyRealCard,
} from "../types/content";
import { Field, SelectField, TextArea, Toggle } from "../components/editor/primitives";
import { Section } from "../components/editor/Section";
import { Repeater } from "../components/editor/Repeater";
import { ChipsEditor } from "../components/editor/ChipsEditor";
import { ThemeControls } from "../components/editor/ThemeControls";
import "../styles/theme.css";
import "../styles/editor.css";

// ---------- Enum option sets ----------
const TAG_TONE_OPTIONS: readonly { value: TagTone; label: string }[] = [
  { value: "teal", label: "Teal" },
  { value: "red", label: "Red" },
  { value: "ink", label: "Ink" },
];

const PIPE_TONE_OPTIONS: readonly { value: PipelineInput["tone"]; label: string }[] = [
  { value: "red", label: "Red" },
  { value: "teal", label: "Teal" },
];

// ---------- New-item factories ----------
function newDemoStep(): DemoStep {
  return { title: "", body: "", tag: "", tagTone: "teal" };
}
function newStat(): Stat {
  return { value: "", label: "" };
}
function newPipelineInput(): PipelineInput {
  return { title: "", detail: "", tone: "teal" };
}
function newLabeledNote(): LabeledNote {
  return { label: "", body: "" };
}
function newTextSegment(): TextSegment {
  return { text: "" };
}
function newWhyRealCard(): WhyRealCard {
  return { title: "", body: "" };
}
function newTeamMember(): TeamMember {
  return { name: "", role: "" };
}
function newFooterLink(): FooterLink {
  return { label: "", href: "" };
}

// In-place reorder used by every Repeater's onMove.
function moveItem<T>(arr: T[], index: number, dir: -1 | 1): void {
  const j = index + dir;
  if (j < 0 || j >= arr.length) return;
  const tmp = arr[index];
  arr[index] = arr[j];
  arr[j] = tmp;
}

interface SaveStatus {
  ok: boolean;
  msg: string;
}

export default function EditPage() {
  const [draft, setDraft] = useState<SiteContent>(defaultContent);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<"visual" | "json">("visual");
  const [jsonText, setJsonText] = useState("");
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<SaveStatus | null>(null);

  // Hydrate the draft from KV, merged over bundled defaults (same
  // semantics as the public page's useContent).
  useEffect(() => {
    let cancelled = false;
    fetch("/content.json", { cache: "no-store" })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch");
        return res.json();
      })
      .then((data: unknown) => {
        if (cancelled) return;
        if (
          data &&
          typeof data === "object" &&
          Object.keys(data as object).length > 0
        ) {
          const merged = deepMerge(
            defaultContent as unknown as Record<string, unknown>,
            data as Record<string, unknown>,
          ) as unknown as SiteContent;
          setDraft(merged);
        }
      })
      .catch(() => {
        // Fall back to bundled defaults so the editor still loads.
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Auto-clear success messages.
  const statusTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (status?.ok) {
      statusTimer.current = setTimeout(() => setStatus(null), 3000);
    }
    return () => {
      if (statusTimer.current) clearTimeout(statusTimer.current);
    };
  }, [status]);

  const update = useCallback((mutator: (d: SiteContent) => void) => {
    setDraft((prev) => {
      const next = structuredClone(prev);
      mutator(next);
      return next;
    });
  }, []);

  const resetSection = useCallback(
    <K extends keyof SiteContent>(key: K) => {
      update((d) => {
        d[key] = structuredClone(defaultContent[key]);
      });
    },
    [update],
  );

  const switchMode = (target: "visual" | "json") => {
    if (target === mode) return;
    if (target === "json") {
      setJsonText(JSON.stringify(draft, null, 2));
      setJsonError(null);
      setMode("json");
      return;
    }
    // json -> visual: parse the edited text back into the draft.
    try {
      const parsed = JSON.parse(jsonText) as Record<string, unknown>;
      const merged = deepMerge(
        defaultContent as unknown as Record<string, unknown>,
        parsed,
      ) as unknown as SiteContent;
      setDraft(merged);
      setJsonError(null);
      setMode("visual");
    } catch (e) {
      setJsonError(
        `Invalid JSON — fix it before switching to visual mode. ${(e as Error).message}`,
      );
    }
  };

  const handleSave = async () => {
    let payload: SiteContent;
    if (mode === "json") {
      try {
        const parsed = JSON.parse(jsonText) as Record<string, unknown>;
        payload = deepMerge(
          defaultContent as unknown as Record<string, unknown>,
          parsed,
        ) as unknown as SiteContent;
        setJsonError(null);
      } catch (e) {
        setJsonError(`Invalid JSON — ${(e as Error).message}`);
        return;
      }
      setDraft(payload);
    } else {
      payload = draft;
    }

    setSaving(true);
    setStatus(null);
    try {
      const res = await fetch("/content.json", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(`Save failed — HTTP ${res.status}`);
      setStatus({
        ok: true,
        msg: "Saved. The public page picks this up within ~60s (edge cache).",
      });
    } catch (e) {
      setStatus({ ok: false, msg: (e as Error).message });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="ed-app">
        <div className="ed-loading">Loading content…</div>
      </div>
    );
  }

  return (
    <div className="ed-app">
      <header className="ed-topbar">
        <div className="ed-brand">
          <span className="ed-brand-title">Content editor</span>
          <span className="ed-brand-sub">Twohearts ✕ KFC Vietnam</span>
        </div>
        <div className="ed-actions">
          <a className="ed-link" href="/" target="_blank" rel="noreferrer">
            Preview ↗
          </a>
          <div className="ed-modeswitch" role="tablist" aria-label="Editor mode">
            <button
              type="button"
              data-active={mode === "visual"}
              onClick={() => switchMode("visual")}
            >
              Visual
            </button>
            <button
              type="button"
              data-active={mode === "json"}
              onClick={() => switchMode("json")}
            >
              JSON
            </button>
          </div>
          {status ? (
            <span
              className={`ed-status ${status.ok ? "ed-status-ok" : "ed-status-err"}`}
            >
              {status.msg}
            </span>
          ) : null}
          <button
            type="button"
            className="ed-btn ed-btn-primary"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? "Saving…" : "Save"}
          </button>
        </div>
      </header>

      <main className="ed-main">
        <p className="ed-intro">
          Edit any field below and hit Save. There is no auth on this page —
          changes write straight to KV. The public page reflects them within
          ~60s (edge cache).
        </p>

        {mode === "json" ? (
          <div className="ed-json">
            {jsonError ? <div className="ed-json-error">{jsonError}</div> : null}
            <textarea
              className="ed-json-area"
              value={jsonText}
              spellCheck={false}
              onChange={(e) => setJsonText(e.target.value)}
            />
          </div>
        ) : (
          <>
            {/* ---------- Header ---------- */}
            <Section
              title="Header"
              subtitle="Top brand bar"
              defaultOpen
              onReset={() => resetSection("header")}
            >
              <Field
                label="Brand alt text"
                value={draft.header.brandAlt}
                onChange={(v) => update((d) => { d.header.brandAlt = v; })}
              />
              <Field
                label="KFC label"
                value={draft.header.kfcLabel}
                onChange={(v) => update((d) => { d.header.kfcLabel = v; })}
              />
              <Field
                label="Event label"
                value={draft.header.eventLabel}
                onChange={(v) => update((d) => { d.header.eventLabel = v; })}
              />
            </Section>

            {/* ---------- Hero ---------- */}
            <Section title="Hero" onReset={() => resetSection("hero")}>
              <Field
                label="Eyebrow"
                value={draft.hero.eyebrow}
                onChange={(v) => update((d) => { d.hero.eyebrow = v; })}
              />
              <TextArea
                label="Headline"
                value={draft.hero.headline}
                onChange={(v) => update((d) => { d.hero.headline = v; })}
              />
              <TextArea
                label="Headline accent"
                value={draft.hero.headlineAccent}
                hint="Rendered in the co-brand accent color."
                onChange={(v) => update((d) => { d.hero.headlineAccent = v; })}
              />
              <Field
                label="Subhead — prefix"
                value={draft.hero.subheadPrefix}
                onChange={(v) => update((d) => { d.hero.subheadPrefix = v; })}
              />
              <Field
                label="Subhead — bold phrase"
                value={draft.hero.subheadBold}
                onChange={(v) => update((d) => { d.hero.subheadBold = v; })}
              />
              <TextArea
                label="Subhead — rest"
                value={draft.hero.subheadRest}
                onChange={(v) => update((d) => { d.hero.subheadRest = v; })}
              />
              <div className="ed-grid-2">
                <Field
                  label="Primary CTA"
                  value={draft.hero.ctaPrimary}
                  onChange={(v) => update((d) => { d.hero.ctaPrimary = v; })}
                />
                <Field
                  label="Secondary CTA"
                  value={draft.hero.ctaSecondary}
                  onChange={(v) => update((d) => { d.hero.ctaSecondary = v; })}
                />
              </div>
              <TextArea
                label="Footnote"
                value={draft.hero.footnote}
                onChange={(v) => update((d) => { d.hero.footnote = v; })}
              />
            </Section>

            {/* ---------- Demo ---------- */}
            <Section title="Demo" onReset={() => resetSection("demo")}>
              <Field
                label="Eyebrow"
                value={draft.demo.eyebrow}
                onChange={(v) => update((d) => { d.demo.eyebrow = v; })}
              />
              <TextArea
                label="Headline"
                value={draft.demo.headline}
                onChange={(v) => update((d) => { d.demo.headline = v; })}
              />
              <TextArea
                label="Subheadline"
                value={draft.demo.subheadline}
                onChange={(v) => update((d) => { d.demo.subheadline = v; })}
              />
              <div className="ed-grid-2">
                <Field
                  label="Video title"
                  value={draft.demo.videoTitle}
                  onChange={(v) => update((d) => { d.demo.videoTitle = v; })}
                />
                <Field
                  label="Video caption"
                  value={draft.demo.videoCaption}
                  onChange={(v) => update((d) => { d.demo.videoCaption = v; })}
                />
              </div>
              <Repeater
                label="Steps"
                count={draft.demo.steps.length}
                itemTitle={(i) => `Step ${i + 1}`}
                addLabel="Add step"
                onAdd={() => update((d) => { d.demo.steps.push(newDemoStep()); })}
                onRemove={(i) => update((d) => { d.demo.steps.splice(i, 1); })}
                onMove={(i, dir) => update((d) => { moveItem(d.demo.steps, i, dir); })}
                renderItem={(i) => (
                  <>
                    <Field
                      label="Title"
                      value={draft.demo.steps[i].title}
                      onChange={(v) => update((d) => { d.demo.steps[i].title = v; })}
                    />
                    <TextArea
                      label="Body"
                      value={draft.demo.steps[i].body}
                      onChange={(v) => update((d) => { d.demo.steps[i].body = v; })}
                    />
                    <div className="ed-grid-2">
                      <Field
                        label="Tag"
                        value={draft.demo.steps[i].tag}
                        onChange={(v) => update((d) => { d.demo.steps[i].tag = v; })}
                      />
                      <SelectField
                        label="Tag tone"
                        value={draft.demo.steps[i].tagTone}
                        options={TAG_TONE_OPTIONS}
                        onChange={(v) => update((d) => { d.demo.steps[i].tagTone = v; })}
                      />
                    </div>
                  </>
                )}
              />
            </Section>

            {/* ---------- Problem ---------- */}
            <Section title="Problem" onReset={() => resetSection("problem")}>
              <Field
                label="Eyebrow"
                value={draft.problem.eyebrow}
                onChange={(v) => update((d) => { d.problem.eyebrow = v; })}
              />
              <TextArea
                label="Headline"
                value={draft.problem.headline}
                onChange={(v) => update((d) => { d.problem.headline = v; })}
              />
              <TextArea
                label="Subheadline"
                value={draft.problem.subheadline}
                onChange={(v) => update((d) => { d.problem.subheadline = v; })}
              />
              <Repeater
                label="Stats"
                count={draft.problem.stats.length}
                itemTitle={(i) => `Stat ${i + 1}`}
                addLabel="Add stat"
                onAdd={() => update((d) => { d.problem.stats.push(newStat()); })}
                onRemove={(i) => update((d) => { d.problem.stats.splice(i, 1); })}
                onMove={(i, dir) => update((d) => { moveItem(d.problem.stats, i, dir); })}
                renderItem={(i) => (
                  <>
                    <Field
                      label="Value"
                      value={draft.problem.stats[i].value}
                      onChange={(v) => update((d) => { d.problem.stats[i].value = v; })}
                    />
                    <TextArea
                      label="Label"
                      value={draft.problem.stats[i].label}
                      onChange={(v) => update((d) => { d.problem.stats[i].label = v; })}
                    />
                  </>
                )}
              />
            </Section>

            {/* ---------- Pipeline ---------- */}
            <Section title="Pipeline" onReset={() => resetSection("pipeline")}>
              <Field
                label="Eyebrow"
                value={draft.pipeline.eyebrow}
                onChange={(v) => update((d) => { d.pipeline.eyebrow = v; })}
              />
              <TextArea
                label="Headline"
                value={draft.pipeline.headline}
                onChange={(v) => update((d) => { d.pipeline.headline = v; })}
              />
              <Field
                label="Inputs label"
                value={draft.pipeline.inputsLabel}
                onChange={(v) => update((d) => { d.pipeline.inputsLabel = v; })}
              />
              <Repeater
                label="Inputs"
                count={draft.pipeline.inputs.length}
                itemTitle={(i) => `Input ${i + 1}`}
                addLabel="Add input"
                onAdd={() => update((d) => { d.pipeline.inputs.push(newPipelineInput()); })}
                onRemove={(i) => update((d) => { d.pipeline.inputs.splice(i, 1); })}
                onMove={(i, dir) => update((d) => { moveItem(d.pipeline.inputs, i, dir); })}
                renderItem={(i) => (
                  <>
                    <Field
                      label="Title"
                      value={draft.pipeline.inputs[i].title}
                      onChange={(v) => update((d) => { d.pipeline.inputs[i].title = v; })}
                    />
                    <Field
                      label="Detail"
                      value={draft.pipeline.inputs[i].detail}
                      onChange={(v) => update((d) => { d.pipeline.inputs[i].detail = v; })}
                    />
                    <SelectField
                      label="Tone"
                      value={draft.pipeline.inputs[i].tone}
                      options={PIPE_TONE_OPTIONS}
                      onChange={(v) => update((d) => { d.pipeline.inputs[i].tone = v; })}
                    />
                  </>
                )}
              />
              <div className="ed-grid-2">
                <Field
                  label="Agent card — logo alt"
                  value={draft.pipeline.agentCard.logoAlt}
                  onChange={(v) => update((d) => { d.pipeline.agentCard.logoAlt = v; })}
                />
                <Field
                  label="Agent card — title"
                  value={draft.pipeline.agentCard.title}
                  onChange={(v) => update((d) => { d.pipeline.agentCard.title = v; })}
                />
              </div>
              <Field
                label="Agent card — subtitle"
                value={draft.pipeline.agentCard.subtitle}
                onChange={(v) => update((d) => { d.pipeline.agentCard.subtitle = v; })}
              />
              <Field
                label="Actions label"
                value={draft.pipeline.actionsLabel}
                onChange={(v) => update((d) => { d.pipeline.actionsLabel = v; })}
              />
              <ChipsEditor
                label="Action chips"
                items={draft.pipeline.actionChips}
                onChange={(next) => update((d) => { d.pipeline.actionChips = next; })}
              />
              <div className="ed-grid-2">
                <Field
                  label="Output card — title"
                  value={draft.pipeline.outputCard.title}
                  onChange={(v) => update((d) => { d.pipeline.outputCard.title = v; })}
                />
                <Field
                  label="Output card — subtitle"
                  value={draft.pipeline.outputCard.subtitle}
                  onChange={(v) => update((d) => { d.pipeline.outputCard.subtitle = v; })}
                />
              </div>
              <Field
                label="Footnote — label"
                value={draft.pipeline.footnote.label}
                onChange={(v) => update((d) => { d.pipeline.footnote.label = v; })}
              />
              <TextArea
                label="Footnote — body"
                value={draft.pipeline.footnote.body}
                onChange={(v) => update((d) => { d.pipeline.footnote.body = v; })}
              />
            </Section>

            {/* ---------- Metrics + Workflow ---------- */}
            <Section
              title="Metrics & Workflow"
              onReset={() => resetSection("metrics")}
            >
              <Field
                label="Metrics title"
                value={draft.metrics.metricsTitle}
                onChange={(v) => update((d) => { d.metrics.metricsTitle = v; })}
              />
              <Repeater
                label="Metrics"
                count={draft.metrics.metrics.length}
                itemTitle={(i) => `Metric ${i + 1}`}
                addLabel="Add metric"
                onAdd={() => update((d) => { d.metrics.metrics.push(newLabeledNote()); })}
                onRemove={(i) => update((d) => { d.metrics.metrics.splice(i, 1); })}
                onMove={(i, dir) => update((d) => { moveItem(d.metrics.metrics, i, dir); })}
                renderItem={(i) => (
                  <>
                    <Field
                      label="Label"
                      value={draft.metrics.metrics[i].label}
                      onChange={(v) => update((d) => { d.metrics.metrics[i].label = v; })}
                    />
                    <TextArea
                      label="Body"
                      value={draft.metrics.metrics[i].body}
                      onChange={(v) => update((d) => { d.metrics.metrics[i].body = v; })}
                    />
                  </>
                )}
              />
              <Field
                label="Workflow title"
                value={draft.metrics.workflowTitle}
                onChange={(v) => update((d) => { d.metrics.workflowTitle = v; })}
              />
              <Field
                label="Workflow intro — prefix"
                value={draft.metrics.workflowIntroPrefix}
                onChange={(v) => update((d) => { d.metrics.workflowIntroPrefix = v; })}
              />
              <Field
                label="Workflow intro — bold"
                value={draft.metrics.workflowIntroBold}
                onChange={(v) => update((d) => { d.metrics.workflowIntroBold = v; })}
              />
              <ChipsEditor
                label="Workflow chips"
                items={draft.metrics.workflowChips}
                onChange={(next) => update((d) => { d.metrics.workflowChips = next; })}
              />
              <Field
                label="Guardrails — label"
                value={draft.metrics.guardrails.label}
                onChange={(v) => update((d) => { d.metrics.guardrails.label = v; })}
              />
              <TextArea
                label="Guardrails — body"
                value={draft.metrics.guardrails.body}
                onChange={(v) => update((d) => { d.metrics.guardrails.body = v; })}
              />
              <Field
                label="Data note — label"
                value={draft.metrics.dataNote.label}
                onChange={(v) => update((d) => { d.metrics.dataNote.label = v; })}
              />
              <TextArea
                label="Data note — body"
                value={draft.metrics.dataNote.body}
                onChange={(v) => update((d) => { d.metrics.dataNote.body = v; })}
              />
            </Section>

            {/* ---------- Economics ---------- */}
            <Section title="Economics" onReset={() => resetSection("economics")}>
              <Field
                label="Eyebrow"
                value={draft.economics.eyebrow}
                onChange={(v) => update((d) => { d.economics.eyebrow = v; })}
              />
              <Repeater
                label="Statement segments"
                count={draft.economics.statement.length}
                itemTitle={(i) => `Segment ${i + 1}`}
                addLabel="Add segment"
                onAdd={() => update((d) => { d.economics.statement.push(newTextSegment()); })}
                onRemove={(i) => update((d) => { d.economics.statement.splice(i, 1); })}
                onMove={(i, dir) => update((d) => { moveItem(d.economics.statement, i, dir); })}
                renderItem={(i) => (
                  <>
                    <TextArea
                      label="Text"
                      rows={2}
                      value={draft.economics.statement[i].text}
                      onChange={(v) => update((d) => { d.economics.statement[i].text = v; })}
                    />
                    <Toggle
                      label="Accent"
                      checked={draft.economics.statement[i].accent ?? false}
                      onChange={(c) => update((d) => { d.economics.statement[i].accent = c; })}
                    />
                  </>
                )}
              />
              <Repeater
                label="Cards"
                count={draft.economics.cards.length}
                itemTitle={(i) => `Card ${i + 1}`}
                addLabel="Add card"
                onAdd={() => update((d) => { d.economics.cards.push(newLabeledNote()); })}
                onRemove={(i) => update((d) => { d.economics.cards.splice(i, 1); })}
                onMove={(i, dir) => update((d) => { moveItem(d.economics.cards, i, dir); })}
                renderItem={(i) => (
                  <>
                    <Field
                      label="Label"
                      value={draft.economics.cards[i].label}
                      onChange={(v) => update((d) => { d.economics.cards[i].label = v; })}
                    />
                    <TextArea
                      label="Body"
                      value={draft.economics.cards[i].body}
                      onChange={(v) => update((d) => { d.economics.cards[i].body = v; })}
                    />
                  </>
                )}
              />
            </Section>

            {/* ---------- Why Real ---------- */}
            <Section title="Why it's real" onReset={() => resetSection("whyReal")}>
              <Field
                label="Eyebrow"
                value={draft.whyReal.eyebrow}
                onChange={(v) => update((d) => { d.whyReal.eyebrow = v; })}
              />
              <TextArea
                label="Headline"
                value={draft.whyReal.headline}
                onChange={(v) => update((d) => { d.whyReal.headline = v; })}
              />
              <Repeater
                label="Cards"
                count={draft.whyReal.cards.length}
                itemTitle={(i) => `Card ${i + 1}`}
                addLabel="Add card"
                onAdd={() => update((d) => { d.whyReal.cards.push(newWhyRealCard()); })}
                onRemove={(i) => update((d) => { d.whyReal.cards.splice(i, 1); })}
                onMove={(i, dir) => update((d) => { moveItem(d.whyReal.cards, i, dir); })}
                renderItem={(i) => (
                  <>
                    <Field
                      label="Title"
                      value={draft.whyReal.cards[i].title}
                      onChange={(v) => update((d) => { d.whyReal.cards[i].title = v; })}
                    />
                    <TextArea
                      label="Body"
                      value={draft.whyReal.cards[i].body}
                      onChange={(v) => update((d) => { d.whyReal.cards[i].body = v; })}
                    />
                    <div className="ed-grid-2">
                      <Toggle
                        label="Highlighted"
                        checked={draft.whyReal.cards[i].highlighted ?? false}
                        onChange={(c) => update((d) => { d.whyReal.cards[i].highlighted = c; })}
                      />
                      <Toggle
                        label="Stat style"
                        checked={draft.whyReal.cards[i].stat ?? false}
                        onChange={(c) => update((d) => { d.whyReal.cards[i].stat = c; })}
                      />
                    </div>
                  </>
                )}
              />
            </Section>

            {/* ---------- Footer / Ask ---------- */}
            <Section title="Footer / Ask" onReset={() => resetSection("footer")}>
              <Field
                label="Eyebrow"
                value={draft.footer.eyebrow}
                onChange={(v) => update((d) => { d.footer.eyebrow = v; })}
              />
              <TextArea
                label="Headline"
                value={draft.footer.headline}
                onChange={(v) => update((d) => { d.footer.headline = v; })}
              />
              <Field
                label="Headline accent"
                value={draft.footer.headlineAccent}
                onChange={(v) => update((d) => { d.footer.headlineAccent = v; })}
              />
              <Repeater
                label="Team rows"
                count={draft.footer.teamRows.length}
                itemTitle={(i) => `Row ${i + 1}`}
                addLabel="Add row"
                onAdd={() => update((d) => { d.footer.teamRows.push([]); })}
                onRemove={(i) => update((d) => { d.footer.teamRows.splice(i, 1); })}
                onMove={(i, dir) => update((d) => { moveItem(d.footer.teamRows, i, dir); })}
                renderItem={(row) => (
                  <Repeater
                    label="Members"
                    count={draft.footer.teamRows[row].length}
                    itemTitle={(m) => `Member ${m + 1}`}
                    addLabel="Add member"
                    onAdd={() => update((d) => { d.footer.teamRows[row].push(newTeamMember()); })}
                    onRemove={(m) => update((d) => { d.footer.teamRows[row].splice(m, 1); })}
                    onMove={(m, dir) => update((d) => { moveItem(d.footer.teamRows[row], m, dir); })}
                    renderItem={(m) => (
                      <div className="ed-grid-2">
                        <Field
                          label="Name"
                          value={draft.footer.teamRows[row][m].name}
                          onChange={(v) => update((d) => { d.footer.teamRows[row][m].name = v; })}
                        />
                        <Field
                          label="Role"
                          value={draft.footer.teamRows[row][m].role}
                          onChange={(v) => update((d) => { d.footer.teamRows[row][m].role = v; })}
                        />
                      </div>
                    )}
                  />
                )}
              />
              <Field
                label="Contact"
                value={draft.footer.contact}
                onChange={(v) => update((d) => { d.footer.contact = v; })}
              />
              <Repeater
                label="Links"
                count={draft.footer.links.length}
                itemTitle={(i) => `Link ${i + 1}`}
                addLabel="Add link"
                onAdd={() => update((d) => { d.footer.links.push(newFooterLink()); })}
                onRemove={(i) => update((d) => { d.footer.links.splice(i, 1); })}
                onMove={(i, dir) => update((d) => { moveItem(d.footer.links, i, dir); })}
                renderItem={(i) => (
                  <div className="ed-grid-2">
                    <Field
                      label="Label"
                      value={draft.footer.links[i].label}
                      onChange={(v) => update((d) => { d.footer.links[i].label = v; })}
                    />
                    <Field
                      label="Href"
                      value={draft.footer.links[i].href}
                      onChange={(v) => update((d) => { d.footer.links[i].href = v; })}
                    />
                  </div>
                )}
              />
              <div className="ed-grid-2">
                <Field
                  label="Brand alt text"
                  value={draft.footer.brandAlt}
                  onChange={(v) => update((d) => { d.footer.brandAlt = v; })}
                />
                <Field
                  label="KFC label"
                  value={draft.footer.kfcLabel}
                  onChange={(v) => update((d) => { d.footer.kfcLabel = v; })}
                />
              </div>
              <TextArea
                label="Disclaimer"
                rows={4}
                value={draft.footer.disclaimer}
                onChange={(v) => update((d) => { d.footer.disclaimer = v; })}
              />
            </Section>

            {/* ---------- Theme ---------- */}
            <Section title="Theme" onReset={() => resetSection("theme")}>
              <ThemeControls
                theme={draft.theme}
                onColorChange={(hex) => update((d) => { d.theme.kfcRed = hex; })}
                onTextureChange={(show) => update((d) => { d.theme.showTexture = show; })}
              />
            </Section>
          </>
        )}
      </main>
    </div>
  );
}
