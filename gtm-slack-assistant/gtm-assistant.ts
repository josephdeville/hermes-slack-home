/**
 * GTM Assistant — Daily Slack Nudge
 *
 * Sends role-aware morning + evening Slack messages to every GTM team member.
 * Role is stored in a local config file (users.json) or pulled from Slack profile.
 *
 * Usage:
 *   bun run gtm-assistant.ts morning   # send morning nudges
 *   bun run gtm-assistant.ts evening   # send evening wrap-ups
 *   bun run gtm-assistant.ts test <slackUserId>  # DM a single user for testing
 */

// ─── Types ───────────────────────────────────────────────────────────────────

type Role = "AE" | "CSM" | "BDR" | "SE";
type Day = "Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday";

interface UserConfig {
  slackUserId: string;
  name: string;
  role: Role;
  timezone?: string; // e.g. "America/Chicago"
}

// ─── Team Config ─────────────────────────────────────────────────────────────
// Add every GTM team member here. Role drives which bullets they receive.
// You can also pull this from Salesforce/HubSpot via Composio if preferred.

const TEAM: UserConfig[] = [
  // ── Account Executives ──────────────────────────────────────────────────────
  { slackUserId: "U063DMQ95V2", name: "Patrick Toomey",    role: "AE" },
  { slackUserId: "U07VBQW4UDN", name: "Ben Steen",         role: "AE" },
  { slackUserId: "U08FWKVMVPE", name: "Anthony Hernandez", role: "AE" },
  { slackUserId: "U05JDGSAZC2", name: "Jeff Schnitter",    role: "AE" },
  { slackUserId: "U09RY8XSPL4", name: "James Kettlewell",  role: "AE" },

  // ── Business Development Reps ───────────────────────────────────────────────
  { slackUserId: "U0ASJD6G7J8", name: "Zach Nguyen",       role: "BDR" },
  { slackUserId: "U08CLD0V7EG", name: "Samuel Rice",        role: "BDR" },
  { slackUserId: "U0907Q93P08", name: "Gwyn Barry",         role: "BDR" },

  // ── Customer Success Managers ───────────────────────────────────────────────
  { slackUserId: "U06EXNGBKDZ", name: "Chase Lancaster",   role: "CSM" },
  { slackUserId: "U08F1EYDERX", name: "Tyler Andrews",     role: "CSM" },
  { slackUserId: "U071WH1U5C6", name: "Blake Given",       role: "CSM" },
  { slackUserId: "U0807GM93L6", name: "Hannah Schepers",   role: "CSM" },
  { slackUserId: "U07QEHCC3LN", name: "Edward Spencer",    role: "CSM" },
  { slackUserId: "U0APRB18UCU", name: "William Reid",      role: "CSM" },
  { slackUserId: "U0AP8RUFHM3", name: "Lisa Bielik",       role: "CSM" },
  { slackUserId: "U08BAMN4L4T", name: "Haowen Chan",       role: "CSM" },
  { slackUserId: "U08BVJ0TLR1", name: "Mykola Sem",        role: "CSM" },

  // ── Sales Engineers ─────────────────────────────────────────────────────────
  { slackUserId: "U08FKE32DD4", name: "Bradley Sauln",     role: "SE" },
  { slackUserId: "U0AGV3DBRPB", name: "Colin Risler",      role: "SE" },
  { slackUserId: "U073SFB5L1E", name: "Vanessa Quilliam",  role: "SE" },
];

// ─── Daily Themes ─────────────────────────────────────────────────────────────

const MORNING_THEMES: Record<Role, Record<Day, string>> = {
  AE: {
    Monday:    "Strategy & Planning",
    Tuesday:   "Discovery & Selling",
    Wednesday: "Mid-Week Push",
    Thursday:  "Pipeline Acceleration",
    Friday:    "Hygiene & Wrap-up",
  },
  CSM: {
    Monday:    "Health Checks",
    Tuesday:   "Engagement",
    Wednesday: "Adoption & Value",
    Thursday:  "Renewals & Expansion",
    Friday:    "Reporting & Feedback",
  },
  BDR: {
    Monday:    "Pipeline Generation",
    Tuesday:   "Qualification",
    Wednesday: "Nurturing",
    Thursday:  "High-Value Signals",
    Friday:    "Admin & Planning",
  },
  SE: {
    Monday:    "Prep & Research",
    Tuesday:   "Demo Delivery",
    Wednesday: "Documentation & Build",
    Thursday:  "Collaboration",
    Friday:    "Review & Planning",
  },
};

const MORNING_BULLETS: Record<Role, Record<Day, string[]>> = {
  AE: {
    Monday: [
      ":briefcase: *Deal Reviews* — Review your top 3 high-priority opportunities. What needs to move this week?",
      ":world_map: *Territory Planning* — Identify any whitespace accounts worth targeting this week.",
      ":bar_chart: *Forecast Prep* — Update your commit/best case in Salesforce before your forecast call.",
    ],
    Tuesday: [
      ":telephone_receiver: *Pre-Call Briefs* — Run a brief for every meeting today before you dial.",
      ":arrow_up: *Advance Deal Stages* — Pick 2 deals to push one stage forward today.",
      ":mag: *Discovery Focus* — Prepare MEDDIC/SPIN notes for your discovery calls.",
    ],
    Wednesday: [
      ":warning: *Deals at Risk* — Review any deal with no activity in 14+ days.",
      ":handshake: *Internal Alignment* — Loop in SE, legal, or finance on deals that need it.",
      ":memo: *Proposal Follow-ups* — Chase any outstanding proposals sent 3+ days ago.",
    ],
    Thursday: [
      ":rocket: *Closing Tasks* — What do you need to get to verbal commit this week?",
      ":mag_right: *Account Enrichment* — Enrich contacts for next week's meeting block.",
      ":email: *Follow Up on Proposals* — Send a value-add nudge on any open proposals.",
    ],
    Friday: [
      ":broom: *CRM Hygiene* — Update all open opportunity stages and next steps in Salesforce.",
      ":clipboard: *Task Clearout* — Clear your open activity backlog before EOD.",
      ":calendar: *Next Week Prep* — Lock in your priority accounts and meetings for Monday.",
    ],
  },
  CSM: {
    Monday: [
      ":heart: *At-Risk Accounts* — Review your health dashboard. Flag any red accounts for outreach.",
      ":calendar: *QBR/EBR Planning* — Who is due for a business review this quarter?",
      ":chart_with_upwards_trend: *High-Value Check-ins* — Schedule proactive touchpoints with your top 5 accounts.",
    ],
    Tuesday: [
      ":mega: *Execute Engagements* — Run all planned customer calls with prep notes ready.",
      ":date: *QBR/EBR Scheduling* — Follow up on any outstanding business review invites.",
      ":ballot_box_with_check: *Action Items* — Close out any open action items from last week's calls.",
    ],
    Wednesday: [
      ":bar_chart: *Adoption Metrics* — Check feature adoption for your top 10 accounts.",
      ":memo: *Success Plans* — Create or update success plans for at-risk accounts.",
      ":money_with_wings: *Renewal Prep* — Flag any renewals within 90 days for discussion.",
    ],
    Thursday: [
      ":arrows_counterclockwise: *Renewal Reviews* — Review upcoming renewals and identify expansion signals.",
      ":seedling: *Expansion Opportunities* — Who is ready for an upsell conversation?",
      ":bell: *Risk Escalations* — Escalate any account that needs CS leadership attention.",
    ],
    Friday: [
      ":clipboard: *Health Score Updates* — Refresh health scores in your CSP tool.",
      ":trophy: *Success Stories* — Document one customer win from this week.",
      ":chart_with_upwards_trend: *Weekly Metrics* — Review your retention and expansion numbers.",
    ],
  },
  BDR: {
    Monday: [
      ":telephone_receiver: *Cold Outreach Block* — Target 20+ new prospects today. Prioritize high-intent signals.",
      ":busts_in_silhouette: *New Lead Review* — Process any new inbound leads assigned over the weekend.",
      ":dart: *Sequence Enrollment* — Enroll your top 10 ICPs into a new outreach sequence.",
    ],
    Tuesday: [
      ":white_check_mark: *Follow-Up Blitz* — Follow up on all outreach from last week that hasn't replied.",
      ":handshake: *Inbound Qualification* — Qualify all inbound leads from the past 48 hours.",
      ":calendar: *Meeting Setting* — Your goal: book 2 qualified meetings today.",
    ],
    Wednesday: [
      ":envelope: *Personalized Outreach* — Send 10 highly personalized emails to high-interest prospects.",
      ":broom: *Task Clearout* — Clear all overdue tasks from your Salesforce queue.",
      ":mag: *Research Block* — Deep-research 5 accounts for next week's targeted outreach.",
    ],
    Thursday: [
      ":fire: *Signal-Based Outreach* — Focus on prospects showing high-intent signals (job changes, funding, etc.).",
      ":telephone_receiver: *High-Value Call Block* — Call every prospect who opened your email 2+ times.",
      ":dart: *Meeting Confirmations* — Confirm all meetings booked for next week.",
    ],
    Friday: [
      ":broom: *Salesforce Hygiene* — Update all BDR-created opportunity stages.",
      ":memo: *Plan Monday's List* — Build your top 20 outreach targets for Monday.",
      ":clipboard: *Task Clearout* — Close or reschedule all open tasks before EOD.",
    ],
  },
  SE: {
    Monday: [
      ":microscope: *Demo Research* — Review all upcoming demos this week. Know the prospect's tech stack.",
      ":desktop_computer: *Sandbox Setup* — Spin up or refresh demo environments for this week.",
      ":clipboard: *Technical Requirements* — Review any pre-work for POVs or evaluations starting this week.",
    ],
    Tuesday: [
      ":computer: *Demo Delivery* — Execute your high-priority demos with confidence. Debrief with AE after.",
      ":mag: *Technical Discovery* — Follow up on any open technical questions from last week.",
      ":memo: *Demo Notes* — Document technical requirements and objections while they're fresh.",
    ],
    Wednesday: [
      ":page_facing_up: *Documentation* — Create or update technical docs for your top 3 active POVs.",
      ":hammer_and_wrench: *Custom Demo Builds* — Build out any custom assets requested by prospects.",
      ":books: *Knowledge Base* — Review and update internal SE playbooks with new objection responses.",
    ],
    Thursday: [
      ":teacher: *AE/BDR Training* — Run a 15-min technical enablement for the sales team.",
      ":handshake: *Cross-functional Alignment* — Sync with AEs on technical win/loss status.",
      ":bulb: *Technical Deep Dives* — Schedule advanced technical workshops for strategic accounts.",
    ],
    Friday: [
      ":ballot_box_with_check: *Open Tasks* — Clear all outstanding technical questions and action items.",
      ":clipboard: *POV Status Updates* — Update all active POV trackers with current status.",
      ":telescope: *Next Week Strategy* — Review next week's demo pipeline and flag resource needs.",
    ],
  },
};

const EVENING_MESSAGE = `*Time to wrap up!* :rocket:

Take 15 minutes to clear the runway for tomorrow:

• :email: Send *email recaps* for all meetings today
• :calendar: *Schedule next steps* for open opportunities or customer issues
• :ballot_box_with_check: *Knock out your top 3 urgent tasks* before logging off
• :bar_chart: *Update your CRM* — reflect current status on all major accounts/deals

See you tomorrow! :wave:`;

// ─── Slack Block Kit Builder ──────────────────────────────────────────────────

function buildMorningBlocks(user: UserConfig, day: Day): object[] {
  const theme = MORNING_THEMES[user.role][day];
  const bullets = MORNING_BULLETS[user.role][day];
  const dateStr = new Date().toLocaleDateString("en-US", {
    weekday: "long", month: "long", day: "numeric", year: "numeric",
  });

  return [
    {
      type: "header",
      text: { type: "plain_text", text: `:robot_face: GTM Assistant   |   ${user.name}`, emoji: true },
    },
    {
      type: "context",
      elements: [{ type: "mrkdwn", text: `${dateStr}  |  Role: *${user.role}*  |  Today's Focus: *${theme}*` }],
    },
    { type: "divider" },
    {
      type: "section",
      text: { type: "mrkdwn", text: `:dart: *Your Top Priorities for Today*` },
    },
    ...bullets.map((b) => ({
      type: "section",
      text: { type: "mrkdwn", text: b },
    })),
    { type: "divider" },
    {
      type: "context",
      elements: [{ type: "mrkdwn", text: `_Powered by GTM Assistant · ${dateStr}_` }],
    },
  ];
}

function buildEveningBlocks(user: UserConfig): object[] {
  return [
    {
      type: "header",
      text: { type: "plain_text", text: `:sunset: GTM Assistant   |   Evening Wrap-up`, emoji: true },
    },
    { type: "divider" },
    {
      type: "section",
      text: { type: "mrkdwn", text: EVENING_MESSAGE },
    },
    { type: "divider" },
    {
      type: "context",
      elements: [{ type: "mrkdwn", text: `_${user.name} · ${user.role} · GTM Assistant_` }],
    },
  ];
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function sendMessage(userId: string, blocks: object[], fallbackText: string) {
  const result = await execute("SLACK_OPEN_DM", { users: userId });
  const dmChannel = result?.data?.channel?.id;
  if (!dmChannel) throw new Error(`Could not open DM with ${userId}: ${JSON.stringify(result)}`);

  await execute("SLACK_SEND_MESSAGE", {
    channel: dmChannel,
    blocks: JSON.stringify(blocks),
    text: fallbackText,
  });
}

async function runMorning() {
  const days: Day[] = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
  const dayIndex = new Date().getDay(); // 0=Sun, 1=Mon...
  if (dayIndex === 0 || dayIndex === 6) {
    console.log("Weekend — no messages sent.");
    return;
  }
  const day = days[dayIndex - 1];
  console.log(`Sending morning nudges for ${day}...`);

  for (const user of TEAM) {
    try {
      const blocks = buildMorningBlocks(user, day);
      await sendMessage(user.slackUserId, blocks, `GTM Morning Nudge — ${day} priorities for ${user.name}`);
      console.log(`  ✓ Sent to ${user.name} (${user.role})`);
    } catch (err) {
      console.error(`  ✗ Failed for ${user.name}: ${err}`);
    }
  }
}

async function runEvening() {
  const dayIndex = new Date().getDay();
  if (dayIndex === 0 || dayIndex === 6) return;

  console.log("Sending evening wrap-ups...");
  for (const user of TEAM) {
    try {
      const blocks = buildEveningBlocks(user);
      await sendMessage(user.slackUserId, blocks, `GTM Evening Wrap-up for ${user.name}`);
      console.log(`  ✓ Sent to ${user.name} (${user.role})`);
    } catch (err) {
      console.error(`  ✗ Failed for ${user.name}: ${err}`);
    }
  }
}

async function runTest(userId: string) {
  const testUser: UserConfig = { slackUserId: userId, name: "Test User", role: "AE" };
  const days: Day[] = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
  const dayIndex = Math.max(1, Math.min(5, new Date().getDay()));
  const day = days[dayIndex - 1] || "Monday";

  console.log(`Sending test morning message to ${userId} as AE on ${day}...`);
  const blocks = buildMorningBlocks(testUser, day);
  await sendMessage(userId, blocks, "GTM Assistant Test Message");
  console.log("Done!");

  console.log("Sending test evening message...");
  await sendMessage(userId, buildEveningBlocks(testUser), "GTM Assistant Evening Test");
  console.log("Done!");
}

// ─── Entrypoint ───────────────────────────────────────────────────────────────

const mode = process.argv[2] ?? "morning";
if (mode === "morning") await runMorning();
else if (mode === "evening") await runEvening();
else if (mode === "test") await runTest(process.argv[3] ?? "");
else console.error(`Unknown mode: ${mode}. Use morning | evening | test <userId>`);
