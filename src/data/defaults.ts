// ============================================================
// Twohearts ✕ KFC Vietnam — default content, transcribed
// verbatim from docs/reference/kfc-demo-template.html.
// Vietnamese quotes, ✕/·/— characters preserved exactly.
// ============================================================

import type { SiteContent } from "../types/content";

export const defaultContent: SiteContent = {
  header: {
    brandAlt: "Twohearts",
    kfcLabel: "KFC Vietnam",
    eventLabel: "Agentic AI Build Week 2026 · F&B track · Problem P4",
  },

  hero: {
    eyebrow: "Agentic ordering · chat + voice",
    headline: "Every KFC conversation becomes a completed order — ",
    headlineAccent: "in Vietnamese, with zero staff.",
    subheadPrefix: "An ",
    subheadBold: "agentic AI ordering assistant across chat and voice",
    subheadRest:
      " — Messenger, Zalo, the KFC app, and inbound calls. It understands natural Vietnamese, spoken or typed, places the order, applies vouchers, checks loyalty points, and hands off to a human when needed — firing the order straight into the OMS.",
    ctaPrimary: "▶  Watch the demo",
    ctaSecondary: "Try the live agent",
    footnote:
      "Built for KFC Vietnam · AABW 2026 · Problem P4: AI-powered conversational ordering via chat",
  },

  demo: {
    eyebrow: "The demo",
    headline: "One order. Voice and chat, working as one agent.",
    subheadline:
      "A returning customer calls KFC, reorders last time's meal plus a Rice & Chicken combo — and the agent closes the order across voice and Zalo without a human touching it.",
    videoTitle: "Demo video goes here",
    videoCaption: "Voice re-order + voucher + Zalo confirmation · 16:9",
    steps: [
      {
        title: "Customer calls KFC",
        body: "“Cho mình đặt lại đơn lần trước, thêm 1 combo cơm gà nha.” Reorder of the last order, plus a Rice & Chicken combo.",
        tag: "Voice",
        tagTone: "teal",
      },
      {
        title: "Agent recognizes & upsells nothing — it remembers",
        body: "The agent knows her last order and adds the new combo. No menu reading, no hold music.",
        tag: "Voice",
        tagTone: "teal",
      },
      {
        title: "Voucher, offered proactively",
        body: "The agent sees an unused voucher on her account and asks — by voice — if she’d like to apply it.",
        tag: "Voice",
        tagTone: "teal",
      },
      {
        title: "Order summary lands on Zalo",
        body: "Items, voucher, total, address — one tap to confirm. Voice and chat are the same agent, same memory.",
        tag: "Chat",
        tagTone: "red",
      },
      {
        title: "She hits confirm",
        body: "The agent acknowledges the confirmation on the call and says it will notify her when the order is on the way.",
        tag: "Chat + voice",
        tagTone: "red",
      },
      {
        title: "The reveal",
        body: "On hang-up: the entire order was handled by an AI agent. No human ever picked up.",
        tag: "Agentic",
        tagTone: "ink",
      },
    ],
  },

  problem: {
    eyebrow: "The problem · P4",
    headline:
      "KFC Vietnam handles conversational ordering 100% by human staff today.",
    subheadline:
      "High-intent customers message on Messenger and Zalo ready to buy — then get pushed to a separate app or tie up a call-center agent. That is lost conversion and rising labor cost on the most ready-to-buy traffic KFC has.",
    stats: [
      {
        value: "100%",
        label: "of conversational orders are handled manually by staff today.",
      },
      {
        value: "0",
        label:
          "orders, vouchers, or loyalty checks possible through natural-language chat.",
      },
      {
        value: "2 inputs",
        label:
          "customers already use — messages and phone calls. Neither converts on its own.",
      },
    ],
  },

  pipeline: {
    eyebrow: "What we built",
    headline: "The agentic ordering pipeline.",
    inputsLabel: "TWO INPUTS",
    inputs: [
      {
        title: "Messages",
        detail: "Messenger · Zalo · app chat",
        tone: "red",
      },
      {
        title: "Voice",
        detail: "Inbound calls & voice notes",
        tone: "teal",
      },
    ],
    agentCard: {
      logoAlt: "",
      title: "Twohearts agent",
      subtitle: "Vietnamese NLU + tool use",
    },
    actionsLabel: "TAKES REAL ACTIONS VIA KFC APIs",
    actionChips: [
      "Place order → OMS",
      "Apply voucher",
      "Check loyalty",
      "Escalate to staff",
    ],
    outputCard: {
      title: "Order confirmed",
      subtitle: "Kitchen / OMS",
    },
    footnote: {
      label: "Agentic core:",
      body: " the AI does not just reply — it calls KFC’s live systems to complete real actions, then confirms.",
    },
  },

  metrics: {
    metricsTitle: "P4 success metrics — delivered",
    metrics: [
      {
        label: "Order completion.",
        body: " Natural-language order taken end-to-end and pushed into the OMS — no app switch, no manual re-entry.",
      },
      {
        label: "Voucher application.",
        body: " Validates and applies KFC promo codes inside the conversation, with the discounted total confirmed back.",
      },
      {
        label: "NLU accuracy.",
        body: " Understands real Vietnamese speech and text — slang, accents, missing tone marks. Low-confidence turns route to a human.",
      },
      {
        label: "Loyalty point inquiry.",
        body: " Queries the loyalty API in-conversation, returns the balance, and redeems points against the order.",
      },
      {
        label: "Order by channel.",
        body: " One agent across chat and voice — Messenger, Zalo, web and inbound calls — with unified customer memory.",
      },
    ],
    workflowTitle: "No changes to existing workflow",
    workflowIntroPrefix: "Connects to the exact systems named in the brief — ",
    workflowIntroBold: "no additional equipment, no changes to KFC store workflow.",
    workflowChips: ["Messenger", "Zalo", "Mobile app", "OMS", "Loyalty"],
    guardrails: {
      label: "Guardrails.",
      body: " Constrained to KFC’s live menu & voucher data — never invents items or prices. Confirms before committing an order; escalates on low confidence.",
    },
    dataNote: {
      label: "Data.",
      body: " Customer identity and history stay in KFC’s ownership.",
    },
  },

  economics: {
    eyebrow: "The economics",
    statement: [
      { text: "KFC pays a small per-order " },
      { text: "processing cost", accent: true },
      { text: " — like a payment-processing fee — " },
      { text: "not a percentage commission", accent: true },
      { text: " on the basket." },
    ],
    cards: [
      {
        label: "Priced per order processed",
        body: "Cost scales with usage, not with basket size. A bucket meal and a snack cost the same to process.",
      },
      {
        label: "Cents, not percent",
        body: "Order value stays with KFC. The economics of a direct channel, at the cost of infrastructure.",
      },
      {
        label: "Zero added headcount",
        body: "24/7 coverage across chat and voice with no additional call-center staffing.",
      },
    ],
  },

  whyReal: {
    eyebrow: "Why it’s real, not a prototype",
    headline: "Live in a real restaurant today.",
    cards: [
      {
        title: "60% direct",
        body: "The Joi Factory takes 60% of delivery orders directly on Messenger and Zalo — on this engine, in production.",
        highlighted: true,
        stat: true,
      },
      {
        title: "Built this week",
        body: "The KFC agent — your menu, voucher rules, loyalty & OMS handoff. Voice AI. (Core engine is our existing IP.)",
      },
      {
        title: "Operator team",
        body: "We ran a 50+ location, 750-staff hospitality group before building this. 12 years of conversational commerce experience.",
      },
    ],
  },

  footer: {
    eyebrow: "The ask",
    headline: "Ready to pilot with ",
    headlineAccent: "KFC Vietnam.",
    teamRows: [
      [
        { name: "Thu Nguyen", role: "CEO" },
        { name: "Nikhil Sharma", role: "CTO" },
        { name: "Nhan Tran", role: "AI Lead" },
      ],
      [
        { name: "Danh Le", role: "AI Engineer" },
        { name: "Anh Tran", role: "Data Engineer" },
        { name: "Tam Phi", role: "Front End" },
      ],
    ],
    contact: "chat@twohearts.vn · twohearts.vn",
    links: [
      { label: "▶ Live demo", href: "#" },
      { label: "GitHub repo", href: "#" },
      { label: "Judge one-pager (PDF)", href: "#" },
    ],
    brandAlt: "Twohearts",
    kfcLabel: "KFC Vietnam",
    disclaimer:
      "Twohearts Technologies × KFC Vietnam · Agentic AI Build Week 2026 · F&B track, Problem P4. Concept demo built for the hackathon; KFC branding used in the context of the KFC Vietnam problem brief.",
  },

  theme: {
    kfcRed: "#E4002B",
    showTexture: true,
  },
};
