/**
 * GTM Engineering Request Form — Slack modal view
 *
 * Triggered by the "Submit request" button on the Hermes home tab.
 * Submitted via views.open → handles view_submission in app-home.ts.
 */

export const FORM_CALLBACK = "gtm_eng_request_submit";

export const FORM_BLOCK = {
  REQUEST_TYPE:    "gtm_req_type",
  PRIORITY:        "gtm_priority",
  TITLE:           "gtm_title",
  DESCRIPTION:     "gtm_description",
  AFFECTED_TEAMS:  "gtm_affected_teams",
  TOOL_SYSTEM:     "gtm_tool_system",
  TIMELINE:        "gtm_timeline",
  LINK:            "gtm_link",
} as const;

export function buildRequestForm(): object {
  return {
    type: "modal",
    callback_id: FORM_CALLBACK,
    title: { type: "plain_text", text: "GTM Engineering Request", emoji: true },
    submit: { type: "plain_text", text: "Submit request", emoji: true },
    close:  { type: "plain_text", text: "Cancel", emoji: true },
    blocks: [

      // ── Context ────────────────────────────────────────────────────────────
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: "Use this form to request new integrations, automations, bug fixes, or data work from the GTM engineering team. Hermes will route it to the right person.",
        },
      },
      { type: "divider" },

      // ── Request type ───────────────────────────────────────────────────────
      {
        type: "input",
        block_id: FORM_BLOCK.REQUEST_TYPE,
        label: { type: "plain_text", text: "Request type", emoji: true },
        element: {
          type: "static_select",
          action_id: "value",
          placeholder: { type: "plain_text", text: "Select a type", emoji: true },
          options: [
            { text: { type: "plain_text", text: ":electric_plug:  New integration",     emoji: true }, value: "integration" },
            { text: { type: "plain_text", text: ":robot_face:  Automation / workflow",   emoji: true }, value: "automation" },
            { text: { type: "plain_text", text: ":bar_chart:  Reporting / dashboard",    emoji: true }, value: "reporting" },
            { text: { type: "plain_text", text: ":bug:  Bug fix",                        emoji: true }, value: "bug" },
            { text: { type: "plain_text", text: ":floppy_disk:  Data / enrichment",      emoji: true }, value: "data" },
            { text: { type: "plain_text", text: ":hammer_and_wrench:  Tooling / infra",  emoji: true }, value: "tooling" },
            { text: { type: "plain_text", text: ":memo:  Other",                         emoji: true }, value: "other" },
          ],
        },
      },

      // ── Priority ───────────────────────────────────────────────────────────
      {
        type: "input",
        block_id: FORM_BLOCK.PRIORITY,
        label: { type: "plain_text", text: "Priority", emoji: true },
        element: {
          type: "radio_buttons",
          action_id: "value",
          options: [
            {
              text: { type: "mrkdwn", text: "*P1 — Urgent*  _(blocking revenue or active deals)_" },
              value: "p1",
            },
            {
              text: { type: "mrkdwn", text: "*P2 — High*  _(significant friction, needed this sprint)_" },
              value: "p2",
            },
            {
              text: { type: "mrkdwn", text: "*P3 — Normal*  _(improvement, no hard deadline)_" },
              value: "p3",
            },
            {
              text: { type: "mrkdwn", text: "*P4 — Low*  _(nice-to-have, backlog candidate)_" },
              value: "p4",
            },
          ],
        },
      },

      // ── Title ──────────────────────────────────────────────────────────────
      {
        type: "input",
        block_id: FORM_BLOCK.TITLE,
        label: { type: "plain_text", text: "Request title", emoji: true },
        element: {
          type: "plain_text_input",
          action_id: "value",
          placeholder: { type: "plain_text", text: "e.g. Sync Gong call tags to Salesforce opportunities" },
          max_length: 120,
        },
      },

      // ── Description ────────────────────────────────────────────────────────
      {
        type: "input",
        block_id: FORM_BLOCK.DESCRIPTION,
        label: { type: "plain_text", text: "Description", emoji: true },
        hint: {
          type: "plain_text",
          text: "What problem are you solving? What does success look like? Include any relevant deal names, accounts, or team members.",
        },
        element: {
          type: "plain_text_input",
          action_id: "value",
          multiline: true,
          placeholder: {
            type: "plain_text",
            text: "Describe the request in as much detail as possible...",
          },
          max_length: 2000,
        },
      },

      // ── Affected teams ─────────────────────────────────────────────────────
      {
        type: "input",
        block_id: FORM_BLOCK.AFFECTED_TEAMS,
        label: { type: "plain_text", text: "Affected teams", emoji: true },
        hint: { type: "plain_text", text: "Select all that apply." },
        element: {
          type: "checkboxes",
          action_id: "value",
          options: [
            { text: { type: "plain_text", text: "AE — Account Executives",      emoji: false }, value: "AE" },
            { text: { type: "plain_text", text: "CSM — Customer Success",        emoji: false }, value: "CSM" },
            { text: { type: "plain_text", text: "BDR — Business Development",    emoji: false }, value: "BDR" },
            { text: { type: "plain_text", text: "SE — Sales Engineering",        emoji: false }, value: "SE" },
            { text: { type: "plain_text", text: "Leadership / RevOps",           emoji: false }, value: "Leadership" },
            { text: { type: "plain_text", text: "All GTM",                       emoji: false }, value: "All" },
          ],
        },
      },

      // ── Tool / system ──────────────────────────────────────────────────────
      {
        type: "input",
        block_id: FORM_BLOCK.TOOL_SYSTEM,
        label: { type: "plain_text", text: "Tool or system involved", emoji: true },
        hint: { type: "plain_text", text: "e.g. Salesforce, Gong, HubSpot, Slack, Clay, Composio, Hermes" },
        optional: true,
        element: {
          type: "plain_text_input",
          action_id: "value",
          placeholder: { type: "plain_text", text: "Salesforce + Gong" },
          max_length: 200,
        },
      },

      // ── Ideal timeline ─────────────────────────────────────────────────────
      {
        type: "input",
        block_id: FORM_BLOCK.TIMELINE,
        label: { type: "plain_text", text: "Ideal timeline", emoji: true },
        optional: true,
        element: {
          type: "datepicker",
          action_id: "value",
          placeholder: { type: "plain_text", text: "Pick a target date" },
        },
      },

      // ── Supporting link ────────────────────────────────────────────────────
      {
        type: "input",
        block_id: FORM_BLOCK.LINK,
        label: { type: "plain_text", text: "Supporting link", emoji: true },
        hint: { type: "plain_text", text: "Loom, Notion doc, Salesforce report, screenshot, etc." },
        optional: true,
        element: {
          type: "url_text_input",
          action_id: "value",
          placeholder: { type: "plain_text", text: "https://..." },
        },
      },

    ],
  };
}

// ── Confirmation receipt blocks ──────────────────────────────────────────────
// Posted back to the submitter as a DM after successful submission.

export function buildConfirmationBlocks(
  submitterName: string,
  title: string,
  requestType: string,
  priority: string,
): object[] {
  const priorityLabels: Record<string, string> = {
    p1: "🔴 P1 — Urgent",
    p2: "🟠 P2 — High",
    p3: "🟡 P3 — Normal",
    p4: "🔵 P4 — Low",
  };

  return [
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: `:white_check_mark:  *Request received, ${submitterName}!*\nHermes has logged your GTM engineering request and will route it to the right person.`,
      },
    },
    { type: "divider" },
    {
      type: "section",
      fields: [
        { type: "mrkdwn", text: `*Title*\n${title}` },
        { type: "mrkdwn", text: `*Type*\n${requestType}` },
        { type: "mrkdwn", text: `*Priority*\n${priorityLabels[priority] ?? priority}` },
      ],
    },
    {
      type: "context",
      elements: [
        { type: "mrkdwn", text: "_You'll hear back in `#gtm-assist` once it's triaged._" },
      ],
    },
  ];
}
