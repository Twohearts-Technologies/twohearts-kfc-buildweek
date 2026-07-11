// ============================================================
// Twohearts ✕ KFC Vietnam — Agentic Ordering Demo (AABW 2026, P4)
// Typed content schema. Every visible string on the page lives
// here; components render structure only, never literal copy.
// ============================================================

/** An inline text segment that may be rendered with accent emphasis. */
export interface TextSegment {
  text: string;
  /** When true, renders in the co-brand accent color with medium weight. */
  accent?: boolean;
}

/** A lead label (rendered bold/inline) followed by body copy. */
export interface LabeledNote {
  label: string;
  body: string;
}

// ---------- Header ----------
export interface HeaderContent {
  /** alt text for the Twohearts logo */
  brandAlt: string;
  /** co-brand label, e.g. "KFC Vietnam" */
  kfcLabel: string;
  /** right-aligned event label */
  eventLabel: string;
}

// ---------- Hero ----------
export interface HeroContent {
  eyebrow: string;
  headline: string;
  headlineAccent: string;
  /** lead-in text before the bolded phrase */
  subheadPrefix: string;
  /** bolded phrase inside the subheadline */
  subheadBold: string;
  /** remainder of the subheadline after the bolded phrase */
  subheadRest: string;
  ctaPrimary: string;
  ctaSecondary: string;
  footnote: string;
}

// ---------- Demo ----------
export type TagTone = "teal" | "red" | "ink";

export interface DemoStep {
  title: string;
  body: string;
  tag: string;
  tagTone: TagTone;
}

export interface DemoContent {
  eyebrow: string;
  headline: string;
  subheadline: string;
  videoTitle: string;
  videoCaption: string;
  steps: DemoStep[];
}

// ---------- Problem ----------
export interface Stat {
  value: string;
  label: string;
}

export interface ProblemContent {
  eyebrow: string;
  headline: string;
  subheadline: string;
  stats: Stat[];
}

// ---------- Pipeline ----------
export interface PipelineInput {
  title: string;
  detail: string;
  /** accent tone for the left border marker */
  tone: "red" | "teal";
}

export interface PipelineAgentCard {
  logoAlt: string;
  title: string;
  subtitle: string;
}

export interface PipelineOutputCard {
  title: string;
  subtitle: string;
}

export interface PipelineContent {
  eyebrow: string;
  headline: string;
  inputsLabel: string;
  inputs: PipelineInput[];
  agentCard: PipelineAgentCard;
  actionsLabel: string;
  actionChips: string[];
  outputCard: PipelineOutputCard;
  footnote: LabeledNote;
}

// ---------- Metrics + Workflow ----------
export interface MetricsWorkflowContent {
  metricsTitle: string;
  metrics: LabeledNote[];
  workflowTitle: string;
  workflowIntroPrefix: string;
  workflowIntroBold: string;
  workflowChips: string[];
  guardrails: LabeledNote;
  dataNote: LabeledNote;
}

// ---------- Economics ----------
export interface EconomicsContent {
  eyebrow: string;
  /** the framing statement, as inline segments (some accented) */
  statement: TextSegment[];
  cards: LabeledNote[];
}

// ---------- Why Real ----------
export interface WhyRealCard {
  /** headline stat or title */
  title: string;
  body: string;
  /** teal-washed, bordered emphasis card */
  highlighted?: boolean;
  /** render the title in the large display face (stat style) */
  stat?: boolean;
}

export interface WhyRealContent {
  eyebrow: string;
  headline: string;
  cards: WhyRealCard[];
}

// ---------- Footer / Ask ----------
export interface TeamMember {
  name: string;
  role: string;
}

export interface FooterLink {
  label: string;
  href: string;
}

export interface FooterContent {
  eyebrow: string;
  headline: string;
  headlineAccent: string;
  /** rows of team members; each row renders on its own line */
  teamRows: TeamMember[][];
  contact: string;
  links: FooterLink[];
  brandAlt: string;
  kfcLabel: string;
  disclaimer: string;
}

// ---------- Theme ----------
export interface ThemeContent {
  /** KFC co-brand red */
  kfcRed: string;
  /** show the low-opacity texture overlay on dark teal sections */
  showTexture: boolean;
}

// ---------- Root ----------
export interface SiteContent {
  header: HeaderContent;
  hero: HeroContent;
  demo: DemoContent;
  problem: ProblemContent;
  pipeline: PipelineContent;
  metrics: MetricsWorkflowContent;
  economics: EconomicsContent;
  whyReal: WhyRealContent;
  footer: FooterContent;
  theme: ThemeContent;
}
