/**
 * Hermes App Home — Block Kit view
 *
 * Published via views.publish when app_home_opened fires.
 * Call buildHomeView(userName, role) to get the full view payload.
 */

import type { Role } from "./gtm-assistant.ts";

interface HomeContext {
  userName?: string;
  role?: Role;
  /** ISO date string — defaults to today if omitted */
  date?: string;
}

// ─── Quick-action button values ──────────────────────────────────────────────
export const ACTION = {
  PIPELINE_BRIEF:    "hermes_pipeline_brief",
  DEAL_RISKS:        "hermes_deal_risks",
  NEXT_ACTIONS:      "hermes_next_actions",
  MORNING_NUDGE:     "hermes_morning_nudge",
  EXEC_ASKS:         "hermes_exec_asks",
  DEAL_DETAILS:      "hermes_deal_details",
  DEAL_BRIEF:        "hermes_deal_brief",
} as const;

// ─── Deal card type ───────────────────────────────────────────────────────────
export interface DealCard {
  id: string;
  account: string;
  stage: string;
  arr: string;
  owner: string;
  risk: string;
  signal: string;
  imageUrl?: string;
}

// ─── Default placeholder deals (replace with live CRM data) ──────────────────
export const PLACEHOLDER_DEALS: DealCard[] = [
  {
    id: "deal-1",
    account: "Acme Corp",
    stage: "Proposal",
    arr: "$120,000",
    owner: "Patrick T.",
    risk: "🔴 High",
    signal: "No activity in 18 days. Champion moved to new role.",
  },
  {
    id: "deal-2",
    account: "MongoDB",
    stage: "Technical Eval",
    arr: "$85,000",
    owner: "Ben S.",
    risk: "🟡 Medium",
    signal: "Competitor mentioned in last call. SE follow-up pending.",
  },
  {
    id: "deal-3",
    account: "Stripe",
    stage: "Negotiation",
    arr: "$210,000",
    owner: "Anthony H.",
    risk: "🟢 On Track",
    signal: "Legal review started. Close plan agreed. EOM target.",
  },
  {
    id: "deal-4",
    account: "Monzo",
    stage: "Discovery",
    arr: "$65,000",
    owner: "Jeff S.",
    risk: "🟡 Medium",
    signal: "2nd exec sponsor identified. Demo scheduled for Thu.",
  },
  {
    id: "deal-5",
    account: "Procore",
    stage: "Closed Won",
    arr: "$175,000",
    owner: "James K.",
    risk: "✅ Won",
    signal: "Signed last week. Handoff to CSM in progress.",
  },
];

// ─── Carousel block builder ───────────────────────────────────────────────────
export function buildDealCarousel(deals: DealCard[]): object {
  return {
    type: "carousel",
    elements: deals.map((deal) => ({
      type: "card",
      block_id: deal.id,
      title: {
        type: "mrkdwn",
        text: `*${deal.account}*  —  ${deal.arr}`,
        verbatim: false,
      },
      subtitle: {
        type: "mrkdwn",
        text: `${deal.stage}  ·  ${deal.owner}`,
        verbatim: false,
      },
      body: {
        type: "mrkdwn",
        text: `${deal.risk}  ${deal.signal}`,
        verbatim: false,
      },
      actions: [
        {
          type: "button",
          text: { type: "plain_text", text: "Details", emoji: false },
          action_id: `${ACTION.DEAL_DETAILS}_${deal.id}`,
        },
        {
          type: "button",
          text: { type: "plain_text", text: "Prep brief", emoji: false },
          style: "primary",
          action_id: `${ACTION.DEAL_BRIEF}_${deal.id}`,
        },
      ],
    })),
  };
}

// ─── View builder ─────────────────────────────────────────────────────────────

export function buildHomeView(ctx: HomeContext = {}): object {
  const name = ctx.userName ?? "there";
  const role = ctx.role ?? null;
  const date = ctx.date
    ? new Date(ctx.date)
    : new Date();
  const dateStr = date.toLocaleDateString("en-US", {
    weekday: "long", month: "long", day: "numeric",
  });

  return {
    type: "home",
    blocks: [

      // ── Hero ──────────────────────────────────────────────────────────────
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `*Hermes Cortex*  ›  GTM Slack Assistant`,
        },
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: [
            `Hey ${name} :wave:  I'm your revenue co-pilot inside Slack.`,
            `I read pipeline signals, summarize account context, and turn GTM chaos into *next-best actions*.`,
          ].join("\n"),
        },
        accessory: {
          type: "image",
          image_url: "https://em-content.zobj.net/source/apple/391/robot_1f916.png",
          alt_text: "Hermes",
        },
      },
      {
        type: "context",
        elements: [
          {
            type: "mrkdwn",
            text: `${dateStr}${role ? `  ·  Role: *${role}*` : ""}  ·  Slack-native  ·  context-aware  ·  action-oriented`,
          },
        ],
      },

      { type: "divider" },

      // ── What Hermes does ─────────────────────────────────────────────────
      {
        type: "section",
        text: { type: "mrkdwn", text: "*What I can do*" },
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: ":bar_chart:  *Pipeline briefs*\nGet an instant snapshot of your pipeline health — deal momentum, stage distribution, and forecast risk.",
        },
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: ":warning:  *Deal-risk alerts*\nI watch for stalled deals, champion changes, exec mentions, and competitor activity so you catch risks early.",
        },
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: ":dart:  *Next-best actions*\nRole-aware recommendations for every open deal — what to send, who to engage, and what to unblock.",
        },
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: ":speech_balloon:  *Account context on demand*\nAsk me anything: \"Who owns renewal for Acme?\", \"What's blocking MongoDB?\", \"Prep me for Friday's EBR.\"",
        },
      },

      { type: "divider" },

      // ── Pipeline carousel ─────────────────────────────────────────────────
      {
        type: "section",
        text: { type: "mrkdwn", text: "*Pipeline at a glance*" },
      },
      buildDealCarousel(PLACEHOLDER_DEALS),

      { type: "divider" },

      // ── Quick actions ─────────────────────────────────────────────────────
      {
        type: "section",
        text: { type: "mrkdwn", text: "*Quick actions*" },
      },
      {
        type: "actions",
        elements: [
          {
            type: "button",
            text: { type: "plain_text", text: ":bar_chart:  Pipeline brief", emoji: true },
            value: ACTION.PIPELINE_BRIEF,
            action_id: ACTION.PIPELINE_BRIEF,
            style: "primary",
          },
          {
            type: "button",
            text: { type: "plain_text", text: ":warning:  Deal risks", emoji: true },
            value: ACTION.DEAL_RISKS,
            action_id: ACTION.DEAL_RISKS,
          },
          {
            type: "button",
            text: { type: "plain_text", text: ":dart:  Next-best actions", emoji: true },
            value: ACTION.NEXT_ACTIONS,
            action_id: ACTION.NEXT_ACTIONS,
          },
        ],
      },
      {
        type: "actions",
        elements: [
          {
            type: "button",
            text: { type: "plain_text", text: ":sunrise:  Morning nudge", emoji: true },
            value: ACTION.MORNING_NUDGE,
            action_id: ACTION.MORNING_NUDGE,
          },
          {
            type: "button",
            text: { type: "plain_text", text: ":love_letter:  Exec asks", emoji: true },
            value: ACTION.EXEC_ASKS,
            action_id: ACTION.EXEC_ASKS,
          },
        ],
      },

      { type: "divider" },

      // ── Channels ──────────────────────────────────────────────────────────
      {
        type: "section",
        text: { type: "mrkdwn", text: "*Active channels*" },
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: [
            "`#pipeline-alerts`  — real-time deal-risk notifications",
            "`#deal-desk`  — AE escalations + legal/finance loops",
            "`#gtm-assist`  — ask Hermes anything, any time",
            "`#exec-asks`  — prepped account briefs for leadership",
          ].join("\n"),
        },
      },

      { type: "divider" },

      // ── Footer ────────────────────────────────────────────────────────────
      {
        type: "context",
        elements: [
          {
            type: "mrkdwn",
            text: ":robot_face:  *Hermes Cortex*  ·  Built for GTM engineering  ·  _Type in `#gtm-assist` to get started_",
          },
        ],
      },

    ],
  };
}
