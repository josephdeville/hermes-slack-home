# Hermes Cortex — GTM Slack Assistant

Daily role-aware Slack nudges + an interactive App Home tab for AE, CSM, BDR, and SE teams.

## App Home (Hermes Home Tab)

The Home tab surfaces in your Hermes Slack app when any team member opens it. It shows a branded landing page with quick-action buttons (Pipeline brief, Deal risks, Next-best actions, Morning nudge, Exec asks).

### Setup

1. **Enable Home Tab** at `api.slack.com/apps` → App Home → Show Tabs → toggle *Home Tab* on.
2. **Add bot scopes**: `im:write`, `users:read`, `users.profile:read`, `chat:write`.
3. **Subscribe to event**: `app_home_opened` under Event Subscriptions → Bot Events.
4. **Enable Socket Mode** and generate an App-Level Token with `connections:write` scope.
5. **Set env vars**:
   ```
   SLACK_BOT_TOKEN=xoxb-...
   SLACK_SIGNING_SECRET=...
   SLACK_APP_TOKEN=xapp-...
   ```
6. **Install dependency**:
   ```bash
   bun add @slack/bolt
   ```
7. **Run**:
   ```bash
   bun run app-home.ts
   ```

### Files

| File | Purpose |
|---|---|
| `home-blocks.ts` | Block Kit view definition — edit this to change the Home UI |
| `app-home.ts` | Bolt app: listens for `app_home_opened`, handles button clicks |

---

## Setup (5 steps)

### 1. Connect Slack
```bash
composio link slack
```
This opens a browser for OAuth. Authorize with your **Slack workspace admin account** so the bot can DM all users.

### 2. Add your team
Edit `gtm-assistant.ts` — find the `TEAM` array and add each person:
```ts
{ slackUserId: "U0123456789", name: "Alice", role: "AE", timezone: "America/New_York" },
```
**How to find Slack User IDs:** In Slack, click a user's name → View Profile → ⋮ More → Copy Member ID.

### 3. Test it
```bash
composio run -f gtm-assistant.ts -- test YOUR_SLACK_USER_ID
```

### 4. Schedule it
```bash
chmod +x schedule.sh && ./schedule.sh
```
This installs cron jobs: morning nudge at **8:30 AM** and evening wrap-up at **4:30 PM**, Mon–Fri.

### 5. Verify cron
```bash
crontab -l | grep gtm
```

## Customization

| Want to change | Where |
|---|---|
| Message content / bullets | `MORNING_BULLETS` in `gtm-assistant.ts` |
| Role themes | `MORNING_THEMES` |
| Send times | `schedule.sh` (cron syntax) |
| Add a new role | Add to `Role` type + all three maps |
| Pull team from Salesforce | Replace `TEAM` array with a Composio `SALESFORCE_*` call |

## Roles

| Role | Focus Area |
|---|---|
| **AE** | Deal progression, forecasting, pipeline hygiene |
| **CSM** | Health checks, renewals, expansion |
| **BDR** | Prospecting, qualification, meeting setting |
| **SE** | Demo prep, technical discovery, documentation |
