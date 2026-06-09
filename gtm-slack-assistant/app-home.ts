/**
 * Hermes App Home — Slack Bolt event handler
 *
 * Publishes the Home tab view whenever a user opens the app.
 * Also handles quick-action button clicks.
 *
 * Prerequisites:
 *   1. Enable "Home Tab" at api.slack.com/apps → App Home → Show Tabs
 *   2. Subscribe to event: app_home_opened  (Event Subscriptions → Bot Events)
 *   3. Add bot scopes: im:write, users:read, users.profile:read
 *   4. Set env vars:  SLACK_BOT_TOKEN  SLACK_SIGNING_SECRET  SLACK_APP_TOKEN
 *      (SLACK_APP_TOKEN needs connections:write scope — used for Socket Mode)
 *
 * Run:
 *   bun run app-home.ts
 */

import { App, LogLevel } from "@slack/bolt";
import { buildHomeView, ACTION } from "./home-blocks.ts";
import { TEAM } from "./gtm-assistant.ts";

// ─── Init ─────────────────────────────────────────────────────────────────────

const app = new App({
  token:          Bun.env.SLACK_BOT_TOKEN!,
  signingSecret:  Bun.env.SLACK_SIGNING_SECRET!,
  socketMode:     true,
  appToken:       Bun.env.SLACK_APP_TOKEN!,
  logLevel:       LogLevel.WARN,
});

// ─── Home tab ─────────────────────────────────────────────────────────────────

app.event("app_home_opened", async ({ event, client }) => {
  // Only publish on the Home tab, not Messages tab
  if (event.tab !== "home") return;

  const teamMember = TEAM.find((u) => u.slackUserId === event.user);

  await client.views.publish({
    user_id: event.user,
    view: buildHomeView({
      userName:  teamMember?.name.split(" ")[0],
      role:      teamMember?.role,
    }) as any,
  });
});

// ─── Quick-action handlers ────────────────────────────────────────────────────

app.action(ACTION.PIPELINE_BRIEF, async ({ body, ack, say }) => {
  await ack();
  await say({
    text: ":bar_chart: Fetching your pipeline brief...",
    channel: body.user.id,
  });
  // TODO: call your CRM/Gong integration and post a rich brief
});

app.action(ACTION.DEAL_RISKS, async ({ body, ack, say }) => {
  await ack();
  await say({
    text: ":warning: Scanning for deal risks across your open opportunities...",
    channel: body.user.id,
  });
  // TODO: query deal-risk signals (no activity, champion changes, exec mentions)
});

app.action(ACTION.NEXT_ACTIONS, async ({ body, ack, say }) => {
  await ack();
  await say({
    text: ":dart: Generating next-best actions for your open deals...",
    channel: body.user.id,
  });
  // TODO: run role-aware next-action logic from gtm-assistant.ts
});

app.action(ACTION.MORNING_NUDGE, async ({ body, ack, client }) => {
  await ack();
  const teamMember = TEAM.find((u) => u.slackUserId === body.user.id);
  if (!teamMember) return;

  // Reuse the morning blocks from the existing assistant
  const { buildMorningBlocks } = await import("./gtm-assistant.ts") as any;
  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"] as const;
  const dayIdx = new Date().getDay();
  const day = days[Math.max(0, Math.min(4, dayIdx - 1))];

  const dm = await client.conversations.open({ users: body.user.id });
  await client.chat.postMessage({
    channel: (dm.channel as any).id,
    blocks: buildMorningBlocks(teamMember, day),
    text: `GTM Morning Nudge — ${day}`,
  });
});

app.action(ACTION.EXEC_ASKS, async ({ body, ack, say }) => {
  await ack();
  await say({
    text: ":love_letter: Check <#gtm-assist> and ping me with the account name you want prepped.",
    channel: body.user.id,
  });
});

// ─── Start ────────────────────────────────────────────────────────────────────

await app.start();
console.log("⚡ Hermes App Home is running (Socket Mode)");
